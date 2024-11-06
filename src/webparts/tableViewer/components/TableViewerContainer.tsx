import * as React from 'react';
import styles from './TableViewer.module.scss';
import { DisplayMode } from '@microsoft/sp-core-library';
import { IReadonlyTheme } from '@microsoft/sp-component-base';
import { TextField } from '@fluentui/react/lib/TextField';
import { IColumn } from '@fluentui/react/lib/DetailsList';
import TableViewer from './TableViewer';
import TableViewerHeader from './TableViewerHeader';
import TableViewerBody from './TableViewerBody';
import TableViewerTitle from './TableViewerTitle';
import TableViewerPlaceholder from './TableViewerPlaceholder';
import TableViewerErrorMessage from './TableViewerErrorMessage';
import TableViewerRender from './TableViewerRender';
import { getItemsUsingRenderListDataAsStream } from '../../../helpers/Utilities';
import { sp } from '@pnp/sp/presets/all';


import TextFieldRender from './FieldRender/TextFieldRender';
import NumberFieldRender from './FieldRender/NumberFieldRender';
import SingleChoiceFieldRender from './FieldRender/SingleChoiceFieldRender';
import MultiChoiceFieldRender from './FieldRender/MultiChoiceFieldRender';
import PersonFieldRender from './FieldRender/PersonFieldRender';
import DateFieldRender from './FieldRender/DateFieldRender';
import StackFieldRender from './FieldRender/StackFieldRender';
// Define an interface for choice field schema
interface IFieldChoice {
  TypeAsString: string;
  Choices: string[];
}
// Extend the IColumn interface
interface IExtendedColumn extends IColumn {
  columnType: 'string' | 'number'; 
}
export interface ITableViewerContainerProps {
  JSONCode: string;
  siteUrl: string;
  listId: string;
  viewXmlCode: string;
  title: string;
  displayMode: DisplayMode;
  updateProperty: (value: string) => void;
  showTitle: boolean;
  showFind: boolean;
  hideErrorEmpty: boolean;
  themeVariant: IReadonlyTheme | undefined;
  contentHeight: string;
  configured: boolean;
  onConfigure(): void;
  contextSiteUrl: string;
  contextUser: string;
  webPartTag: string;
}

export interface ITableViewerContainerState {
  items: any[];
  filteredItems: any[];
  searchQuery: string;
  lastNextHref: string;
  globalError: any | null;
  webPartTag: string;
  contentHeight: string;
  selectedTab: string | null;
  selectedChoiceFieldName: string | null;
  columnsArray: IExtendedColumn[];
  tabs: string[];
  choices: { [key: string]: string[] };
  tabCounts: { [key: string]: number };
  
}

class TableViewerContainer extends React.Component<ITableViewerContainerProps, ITableViewerContainerState> {

  constructor(props: ITableViewerContainerProps) {
    super(props);

    this.state = {
      items: [],
      filteredItems: [],
      lastNextHref: '',
      globalError: null,
      webPartTag: this.props.webPartTag,
      contentHeight: this.props.contentHeight,
      searchQuery: '',
      selectedTab: null,
      columnsArray: [],
      tabs: [],
      choices: {},
      selectedChoiceFieldName:'',
      tabCounts:{}
    };

    this.getItems = this.getItems.bind(this);
    this.onScrollEnd = this.onScrollEnd.bind(this);
    this.handleSearch = this.handleSearch.bind(this);
    this.handleTabChange = this.handleTabChange.bind(this);
  }

  async componentDidMount() {
    try {
      const choices = await this.parseChoiceColumns(this.props.JSONCode);
      const tabs = this.generateTabsFromChoices(choices);
      
      await Promise.all([this.parseColumns(), this.getItems()]);
      
      // If items are fetched, set the initial tab and calculate counts
      if (this.state.items.length > 0) {
        this.setState({ selectedTab: this.state.selectedTab || tabs[0] });
      }
      
      const tabCounts = this.calculateTabCounts(this.state.filteredItems, this.state.selectedChoiceFieldName);
      this.setState({ choices, tabs, tabCounts });
    } catch (error) {
      console.error('Error during component initialization:', error);
    }
  }
  calculateTabCounts(items: any[], filterColumnName: string) {
    const tabCounts: { [key: string]: number } = {};
  
    items.forEach((item) => {
      const tabValue = item[filterColumnName];
      if (tabValue) {
        // If the tabValue exists, increase the count
        if (tabCounts[tabValue]) {
          tabCounts[tabValue]++;
        } else {
          tabCounts[tabValue] = 1;
        }
      }
    });
  
    return tabCounts;
  }
  generateTabsFromChoices(choices: any): string[] {
    const tabs: string[] = [];
  
    Object.values(choices).forEach((options: string[]) => {
      options.forEach((option: string) => {
        if (!tabs.includes(option)) {
          tabs.push(option);  // Add unique options to the tabs array
        }
      });
    });
  
    return tabs;
  }
  
 // Function to parse columns and return choices for columns where tab is true
 async parseChoiceColumns(json: string): Promise<{ [key: string]: string[] }> {
  try {
    const columnsObject = JSON.parse(json);
    const choicesMap: { [key: string]: string[] } = {};

    // Iterate over each column in the JSON object
    for (const key in columnsObject) {
      const column = columnsObject[key];
      
      // Check if the column has tab set to true and its type is choice
      if (column.tab === 'true') {
          this.setState({selectedChoiceFieldName:column.name});
          const choices = await this.fetchChoiceOptions(column.name);
          choicesMap[column.name] = choices;
       
      }
    }

    return choicesMap;
  } catch (error) {
    console.error('Error parsing columns:', error);
    throw error;
  }
}

  async getItems() {
    try {
      const { siteUrl, listId, viewXmlCode, hideErrorEmpty } = this.props;
      const result = await getItemsUsingRenderListDataAsStream(siteUrl, listId, viewXmlCode);
  
      if (result) {
        const { Row, NextHref } = result;
        
        // Apply filtering based on the selected tab
        const { selectedTab, selectedChoiceFieldName } = this.state; // `filterColumnName` is the dynamic column name
        let filteredItems = Row;
  
        // Filter the items only if a tab is selected
        if (selectedTab && selectedChoiceFieldName) {
          filteredItems = Row.filter((item: any) => item[selectedChoiceFieldName] === selectedTab);
        }
  
        this.setState({
          items: Row,  // Original list of items
          filteredItems,  // Filtered items based on selected tab
          lastNextHref: NextHref,
        });
      } else {
        console.error('No items');
      }
    } catch (e) {
      console.error('Error fetching items:', e);
      if (!this.props.hideErrorEmpty) this.setState({ globalError: e });
    }
  }

  async onScrollEnd() {
    const { lastNextHref, items, selectedTab, selectedChoiceFieldName } = this.state;
    const { siteUrl, listId, viewXmlCode } = this.props;
  
    if (lastNextHref) {
      try {
        const { Row, NextHref } = await getItemsUsingRenderListDataAsStream(
          siteUrl,
          listId,
          viewXmlCode,
          lastNextHref.split('?')[1]
        );
  
        // Update items and filteredItems
        const newItems = [...items, ...Row];
        const filteredItems = selectedTab && selectedChoiceFieldName 
          ? newItems.filter((item: any) => item[selectedChoiceFieldName] === selectedTab) 
          : newItems;
  
        this.setState({
          items: newItems,
          filteredItems,
          lastNextHref: NextHref,
        });
      } catch (e) {
        this.setState({ globalError: e });
      }
    }
  }
  // Function to fetch choice field options using PnPjs
async fetchChoiceOptions(name: string): Promise<string[]> {
  try {
    // Fetch the field schema
    const field:IFieldChoice = await sp.web.lists.getById(this.props.listId).fields.getByInternalNameOrTitle(name)();

    // Check if the field type is 'Choice'
    if (field.TypeAsString === 'Choice' && Array.isArray(field.Choices)) {
      return field.Choices;
    }

    throw new Error(`Field ${name} is not a choice field or does not have choices.`);
  } catch (error) {
    console.error(`Error fetching choice options for ${name}:`, error);
    throw error;
  }
}


async parseColumns() {
  try {
    const { JSONCode } = this.props;
    const columnsObject = JSON.parse(JSONCode);
    const columnsArray: IExtendedColumn[] = [];

    Object.keys(columnsObject)
      .map((key) => {
        const column = columnsObject[key];
        return { key, column };
      })
      .sort((a, b) => {
        const seqA = parseInt(a.column.sequence || '0', 10);
        const seqB = parseInt(b.column.sequence || '0', 10);
        return seqA - seqB;
      })
      .forEach(({ key, column }) => {
        const width = column.width || '100px';
        let minWidth:number, maxWidth:number;

        // Check if the column type is 'stack' to bypass width check
        if ((width === '0%' || width === '0px' || width === '0fr') && column.type !== 'stack') {
          return; // Skip this column if it's not 'stack' and width is zero
        }

        if (width.endsWith('px')) {
          minWidth = maxWidth = parseInt(width);
        } else if (width.endsWith('%')) {
          const percentage = parseFloat(width);
          const totalWidth = 1000; // Base width
          minWidth = maxWidth = (totalWidth * percentage) / 100;
        } else if (width.endsWith('fr')) {
          minWidth = maxWidth = parseInt(width) * 100; // Proportional width
        } else {
          minWidth = maxWidth = parseInt(width);
        }
        
        // For stacked columns, use specified fields only
         if (column.type === 'stack' && Array.isArray(column.fields)) {
          columnsArray.push({
            key: key,
            fieldName: column.name,
            name: column.name,
            minWidth:minWidth,
            maxWidth:maxWidth,
            columnType:column.type,
            className: column.class || '', // Apply the CSS class from the JSON
            isSortable: column.isSortable === 'true',// Add sortable property
            isSorted: false, // Initialize sorting state
            isSortedDescending: false, // Initialize sorting direction 
            onRender: (item: any) => this.renderField(column, key, item, columnsObject) // Handle field rendering separately
          } as IExtendedColumn);
        } else {
         columnsArray.push({
          key: key,
          fieldName: column.name,
          name: column.name,
          minWidth:minWidth,
          maxWidth:maxWidth,
          columnType:column.type,
          className: column.class || '', // Apply the CSS class from the JSON
          isSortable: column.isSortable === 'true',// Add sortable property
          isSorted: false, // Initialize sorting state
          isSortedDescending: false, // Initialize sorting direction          
          onRender: (item: any) => this.renderField(column, key, item,columnsObject) // Handle field rendering separately
        } as IExtendedColumn);
      }
      });

    this.setState({ columnsArray });
  } catch (error) {
    console.error('Error parsing columns:', error);
    if (!this.props.hideErrorEmpty) this.setState({ globalError: 'Error parsing columns configuration' });
  }
}
// Separate field rendering to simplify the parseColumns method
renderField = (column: any, key: string, item: any,columnsObject:any) => {
  const prefix = column.prefix || '';
  const suffix = column.suffix || '';
  const fieldValue = item[key];

  switch (column.type) {
    case 'number': {
      return <NumberFieldRender fieldValue={fieldValue} prefix={prefix} suffix={suffix}  className={column.class ? styles[column.class as keyof typeof styles] : undefined} />;
    }
    case 'singlechoice': {
      return <SingleChoiceFieldRender fieldValue={fieldValue} prefix={prefix} suffix={suffix}  className={column.class ? styles[column.class as keyof typeof styles] : undefined} />;
    }
    case 'multichoice': {
      const values = Array.isArray(item[key]) ? item[key] : [item[key]];
      return <MultiChoiceFieldRender values={values}  className={column.class ? styles[column.class as keyof typeof styles] : undefined} />;
    }
    case 'person': {
      const person = item[key];
      return <PersonFieldRender person={person} format={column.format} prefix={prefix} suffix={suffix}  className={column.class ? styles[column.class as keyof typeof styles] : undefined} />;
    }
    case 'date': {
      const dateValue = item[key];
      return <DateFieldRender dateValue={dateValue} format={column.format} prefix={prefix} suffix={suffix}  className={column.class ? styles[column.class as keyof typeof styles] : undefined} />;
    }
    case 'stack': {
      if (Array.isArray(column.Fields)) {
        return <StackFieldRender fields={column.Fields} columnsObject={columnsObject} item={item} />;
      }
      break;
    }
    default:
      return <TextFieldRender fieldValue={fieldValue} prefix={prefix} suffix={suffix} isMultiline={column.isMultiline} className={column.class ? styles[column.class as keyof typeof styles] : undefined}  />;
  }
}

  handleSearch(event: React.ChangeEvent<HTMLInputElement>) {
    const searchQuery = event.target.value.toLowerCase();
    const { items, selectedTab } = this.state;
    let filteredItems = items.filter(item =>
      Object.values(item).some(value =>
        String(value).toLowerCase().includes(searchQuery)
      )
    );
  
    if (selectedTab) {
      filteredItems = filteredItems.filter(item =>
        item[selectedTab] && String(item[selectedTab]).toLowerCase().includes(searchQuery)
      );
    }
  
    this.setState({ searchQuery, filteredItems });
  }

  handleTabChange(tab: string) {
    const { items } = this.state; // Original items
    const { selectedChoiceFieldName } = this.state; // Column to filter by
  
    let filteredItems = items;
  
    // Apply filtering if a tab is selected, otherwise show all items
    if (tab && selectedChoiceFieldName) {
      filteredItems = items.filter((item: any) => item[selectedChoiceFieldName] === tab);
    }
  
    // Update the state with selectedTab and filtered items
    this.setState({ 
      selectedTab: tab, 
      filteredItems 
    });
  }
  renderTabs() {
    const { tabs, selectedTab,tabCounts } = this.state;

    return (
      <div style={{ marginBottom: '10px' }}>
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => this.handleTabChange(tab)}
            style={{
              marginRight: '10px',
              backgroundColor: selectedTab === tab ? '#0078d4' : '#eaeaea',
              color: selectedTab === tab ? '#fff' : '#000',
              padding: '5px 10px',
              border: 'none',
              cursor: 'pointer',
            }}>
            {`${tab} (${tabCounts[tab] || 0})`}
          </button>
        ))}
        {selectedTab && (
          <button
            onClick={() => this.handleTabChange(null)}
            style={{
              marginRight: '10px',
              backgroundColor: '#eaeaea',
              color: '#000',
              padding: '5px 10px',
              border: 'none',
              cursor: 'pointer',
            }}>
            Clear Filter
          </button>
        )}
      </div>
    );
  }
  
  render() {
    const { displayMode, title, updateProperty, showTitle, showFind, configured, onConfigure } = this.props;
    const { filteredItems, globalError, columnsArray, tabs } = this.state;

    return (
      <div id={this.state.webPartTag}> 
        {!configured ? (
          <>
            <TableViewer>
              <TableViewerHeader>
                {showTitle && (
                  <TableViewerTitle displayMode={displayMode} title={title} updateProperty={updateProperty} />
                )}
                {showFind && (
                  <>
                    <TextField
                      placeholder="Search..."
                      value={this.state.searchQuery}
                      onChange={this.handleSearch} // Correct usage here
                      styles={{ root: { marginBottom: 20 } }}
                    />
                   
                  </>
                )}
              </TableViewerHeader>
              <TableViewerBody>
                <>
                {this.renderTabs()}
                </>
                <TableViewerRender columns={columnsArray} items={filteredItems} showFind={showFind} onScrollEnd={this.onScrollEnd} contentHeight={this.state.contentHeight} />
              </TableViewerBody>
            </TableViewer>
            {globalError && (
              <TableViewerErrorMessage
                message={globalError}
                onDismiss={() => this.setState({ globalError: null })}
              />
            )}
          </>
        ) : (
          <TableViewerPlaceholder displayMode={displayMode} onConfigure={onConfigure} />
        )}
      </div>
    );
  }
}

export default TableViewerContainer;
