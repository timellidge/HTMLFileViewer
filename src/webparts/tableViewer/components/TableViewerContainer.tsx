import * as React from 'react';
import { mergeStyles } from '@fluentui/react';
import styles from './TableViewer.module.scss';
import { DisplayMode } from '@microsoft/sp-core-library';
import { IReadonlyTheme } from '@microsoft/sp-component-base';
import { IColumn } from '@fluentui/react/lib/DetailsList';
import TableViewer from './TableViewer';
import TableViewerHeader from './TableViewerHeader';
import TableViewerPlaceholder from './TableViewerPlaceholder';
import TableViewerErrorMessage from './TableViewerErrorMessage';
import TableViewerRender from './TableViewerRender';
import { convertWidthToPx, getItemsUsingRenderListDataAsStream } from '../../../helpers/Utilities';
import TableGridRender from './TableGridRender';

import TabBarRender from './TabsRender/TabBarRender';
import TextFieldRender from './FieldRender/TextFieldRender';
import NumberFieldRender from './FieldRender/NumberFieldRender';
import SingleChoiceFieldRender from './FieldRender/SingleChoiceFieldRender';
import MultiChoiceFieldRender from './FieldRender/MultiChoiceFieldRender';
import PersonFieldRender from './FieldRender/PersonFieldRender';
import DateFieldRender from './FieldRender/DateFieldRender';
import StackFieldRender from './FieldRender/StackFieldRender';
import { IColumnConfig, IColumnJSON, ITabData, ITabDataDetail } from '../../../helpers/Interfaces';


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
  updatedItems: any[];
  searchQuery: string;
  lastNextHref: string;
  globalError: any | null;
  webPartTag: string;
  contentHeight: string;
  selectedTab: string | null;
  selectedChoiceFieldName: string | null;
  columnsArray: IExtendedColumn[];
  tabs: string[];
  tabCounts: { [key: string]: number };
  tabData: ITabData;
  NewJSON: IColumnConfig;
  
}
///////////////////////////////////////////////////////////////////////////

// we will convert this old class pattern but first i NEED to understand the code

///////////////////////////////////////////////////////////////////////////

class TableViewerContainer extends React.Component<ITableViewerContainerProps, ITableViewerContainerState> {

  constructor(props: ITableViewerContainerProps) {
    super(props);

    this.state = {
      items: [],
      filteredItems: [],
      updatedItems: [],
      lastNextHref: '',
      globalError: null,
      webPartTag: this.props.webPartTag,
      contentHeight: this.props.contentHeight,
      searchQuery: '',
      selectedTab: null,
      columnsArray: [],
      tabs: [],
      selectedChoiceFieldName:'',
      tabCounts:{},
      tabData: {},
      NewJSON:  {}
    };

    this.getItems = this.getItems.bind(this);
    this.handleSearch = this.handleSearch.bind(this);
    this.handleTabChange = this.handleTabChange.bind(this);
  }

  async componentDidMount() {
    try {
     // const choices = await this.parseChoiceColumns(this.props.JSONCode);
      //
      await Promise.all([this.parseColumns(), this.getItems()]);
      //await Promise.all([this.getItems()]);

      if (this.state.items.length > 0) {
        // get a list of thre fields that are marked as tabs
        const newJSON = this.state.NewJSON;
        const tabs = Object.keys(newJSON).filter(key => newJSON[key].tab === true);
        console.log("TabFields",tabs);
        // get the unique values for each of the tab fields
        const tabData: ITabData = {};
        tabs.forEach((field) => {
          const tabFieldData = this.getFilterValues(this.state.items, field);
          // assign the tabFieldData to the tabData object WITH the field name as the key
          tabData[field] = tabFieldData;
        });
        console.log("ALL Tab data:",tabData);
        this.setState({tabData});

        // so here we can prepare the data by identifying if it has a prefix or a suffix or a specific format and then we can render the data in the table

        const updatedItems = this.state.items.map(item => {
          const newItem = { ...item };

          Object.keys(item).forEach((key) => {
            // for each field in the item we will check if it is in the JSON and if it is we will format it
            if (newJSON[key]) {
              const pre = newJSON[key].prefix || '';
              const suf = newJSON[key].suffix || '';
              const format = newJSON[key].format || '';
              const type = newJSON[key].type || 'string';
              let value = item[key];

              // Format the value based on the type
              if (type === 'number') {
                value = Number(value);
              } else if (type === 'singlechoice') {
                value = value ? value : 'Not selected';
              } else if (type === 'multichoice') {
                value = Array.isArray(value) ? value.join(', ') : value;
              } else if (type === 'person') {
                value = value ? value : 'No person';
              } else if (type === 'date') {
                value = value ? new Date(value).toLocaleDateString() : 'No date';
              }

              newItem[key] = pre + value + suf; // Add the formatted value to the new item
            }
          });

          return newItem;


        });
        console.log("updated Items", updatedItems);
        this.setState({ updatedItems });
      }

    } catch (error) {
      console.error('Error during component initialization:', error);
    }
  }

  getFilterValues(items: any[], columnName: string):  ITabDataDetail {
    // this gets a list of the unique values id  data structure and indicates how many items have that value, and sets selected to false
    const tabData: ITabDataDetail = {};
    items.forEach((item) => {
      const tabValue = item[columnName];
      if (tabValue) {
        // If the tabValue exists, increase the count
        if (tabData[tabValue]) {
          tabData[tabValue].itemCount++;
        } else {
          // If the tabValue does not exist, create a new entry and the sub fields itemCount and selected note trying them as strings as they are not defined
          // so this defines the structure and initial content of the tabData object
          tabData[tabValue] = {"itemCount": 1, "selected": false};
        }
      }
    });
    return tabData;
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

  async parseColumns() {
    try {
      const { JSONCode } = this.props;
      const columnsObject = JSON.parse(JSONCode);
      const columnsArray: IExtendedColumn[] = [];

      console.log("ColumnsObject",columnsObject);

      const NewJSON:IColumnConfig = convertWidthToPx( 728, columnsObject );
      console.log("NewJSON",NewJSON);

      this.setState({NewJSON});

      Object.keys(columnsObject)
        .map((key) => {
          const column = columnsObject[key];
          return { key, column };
        })
        .sort((a, b) => {
          const seqA = parseInt(a.column.sequence || '99', 10);
          const seqB = parseInt(b.column.sequence || '99', 10);
          return seqA - seqB;
        })
        .forEach(({ key, column }) => {
          const width = column.calculatedPX || 0;

          // Check if the column type is 'stack' to bypass width check
          if (width === '0%' && column.type !== 'stack') {
            return; // Skip this column if it's not 'stack' and width is zero
          }

          // For stacked columns, use specified fields only
          if (column.type === 'stack' && Array.isArray(column.fields)) {
            columnsArray.push({
              key: key,
              fieldName: column.name,
              name: column.name,
              minWidth: Math.min(width - 20, 0), // Ensure width is at least 0
              maxWidth:width,
              columnType:column.type,
              className: column.class || '', // Apply the CSS class from the JSON
              isSortable: column.isSortable === 'true',// Add sortable property
              isSorted: false, // Initialize sorting state
              isSortedDescending: false, // Initialize sorting direction 
             // onRender: (item: any) => this.renderField(column, key, item, columnsObject) // Handle field rendering separately
            } as IExtendedColumn);
          } else {
          columnsArray.push({
            key: key,
            fieldName: column.name,
            name: column.name,
            minWidth: Math.max(width - 20, 0), // Ensure width is at least 0
            maxWidth:width,
            columnType:column.type,
            className: column.class || '', // Apply the CSS class from the JSON
            isSortable: column.isSortable === 'true',// Add sortable property
            isSorted: false, // Initialize sorting state
            isSortedDescending: false, // Initialize sorting direction          
           // onRender: (item: any) => this.renderField(column, key, item, columnsObject) // Handle field rendering separately
          } as IExtendedColumn);
        }
        });

      this.setState({ columnsArray });
    } catch (error) {
      console.error('Error parsing columns:', error);
      if (!this.props.hideErrorEmpty) this.setState({ globalError: 'Error parsing columns configuration' });
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

  handleTabChange(fieldName: string, tab: string) {
    const { items } = this.state; // Original items
    const { tabData } = this.state; // Column to filter by
  
    let filteredItems;
    // Apply filtering if a tab is selected, otherwise show all items (this is VERY simple filterign it need to go up a notch)
    // multiple fields multiple values this implements one tab a time ie radio buttons

    if (tab) {
      Object.keys(tabData[fieldName]).forEach((key) => {
        if (key === tab) { // toggle the selected state 
          tabData[fieldName][key].selected = !tabData[fieldName][key].selected;
        } 
      });
    } else {
      Object.keys(tabData[fieldName]).forEach((key) => {
        tabData[fieldName][key].selected = false;
      });
    }  

    const selectedKeys = Object.keys(tabData).filter(fieldName => 
      Object.values(tabData[fieldName]).some(tab => tab.selected)
    );

    if (selectedKeys.length === 0) {
          filteredItems = items;
    } else {
      const filteredItemsSet = new Set<any>();
      selectedKeys.forEach(fieldKey => {
        const selectedTabs = Object.keys(tabData[fieldKey]).filter(key => tabData[fieldKey][key].selected);
        console.log("FieldName", fieldKey, "SelectedTabs", selectedTabs);
        // Add items to the filteredItemsSet that match any of the selected tab values
        items.forEach((item: any) => {
          if (selectedTabs.includes(item[fieldKey])) {
            filteredItemsSet.add(item);
          }
        });
      });
      filteredItems = Array.from(filteredItemsSet);
    }
    // Update the state with selectedTab and filtered items
    this.setState({ 
      tabData, 
      filteredItems 
    }); 
  }

  //are tehre any css bits we beed to include here 
  private _containerClass = mergeStyles(styles.tableContainer, { height: this.props.contentHeight});


  render() {
    const { displayMode, title, updateProperty, showTitle, showFind, configured, onConfigure } = this.props;
    const { filteredItems, globalError, columnsArray, updatedItems } = this.state;
    console.log("columnsArray",columnsArray);
    console.log("Filtered Items",filteredItems);
    return (
      <div id={this.state.webPartTag} className={styles.tableViewer}> 
        {!configured ? (
          <>
            <TableViewer >
              <TableViewerHeader  displayMode={displayMode} title={title} updateProperty={updateProperty} showTitle={showTitle} showFind={showFind} searchQuery={this.state.searchQuery} handleSearch={this.handleSearch}/>
              <div className={styles.tabBar}>
                {Object.keys(this.state.tabData).map((field) => (
                  <TabBarRender key={field} fieldName={field} tabs={this.state.tabData[field]} handleTabChange={this.handleTabChange} />
                ))}
              </div>
              <TableGridRender colJSON={this.state.NewJSON} items={updatedItems} /> 
            </TableViewer>
            {globalError && (
              <TableViewerErrorMessage message={globalError} onDismiss={() => this.setState({ globalError: null })} />
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
