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
import { getItemsUsingRenderListDataAsStream } from '../../../helpers/Utilities';
import TableGridRender from './TableGridRender';

import TabBarRender from './TabsRender/TabBarRender';
import TextFieldRender from './FieldRender/TextFieldRender';
import NumberFieldRender from './FieldRender/NumberFieldRender';
import SingleChoiceFieldRender from './FieldRender/SingleChoiceFieldRender';
import MultiChoiceFieldRender from './FieldRender/MultiChoiceFieldRender';
import PersonFieldRender from './FieldRender/PersonFieldRender';
import DateFieldRender from './FieldRender/DateFieldRender';
import StackFieldRender from './FieldRender/StackFieldRender';
import { IColumnsConfig, ITabData, ITabDataDetail } from '../../../helpers/Interfaces';

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
  items: any[];   // raw data from the list
  filteredItems: any[]; // these are the items that have been filtered
  updatedItems: any[];  // these are the items that have been formatted 
  searchQuery: string;
  lastNextHref: string;
  globalError: any | null;
  webPartTag: string;
  contentHeight: string;
  selectedTab: string | null;
  selectedChoiceFieldName: string | null;
  tabs: string[];
  tabCounts: { [key: string]: number };
  tabData: ITabData;
  ColumnsJSON:  IColumnsConfig;
  
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
      tabs: [],
      selectedChoiceFieldName:'',
      tabCounts:{},
      tabData: {},
      ColumnsJSON: {} as IColumnsConfig,
    };

    this.getItems = this.getItems.bind(this);
    this.handleSearch = this.handleSearch.bind(this);
    this.handleTabChange = this.handleTabChange.bind(this);
  }

  async componentDidMount() {
    try {
     // const choices = await this.parseChoiceColumns(this.props.JSONCode);
      //
      await Promise.all([this.parseJSON(), this.getItems()]);
      //await Promise.all([this.getItems()]);

      if (this.state.items.length > 0) {
        // get a list of thre fields that are marked as tabs
        const ColumnsJSON = this.state.ColumnsJSON;
        const tabs = Object.keys(ColumnsJSON).filter(key => ColumnsJSON[key].tab === true);
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
            if (ColumnsJSON[key]) {
              const ColData = ColumnsJSON[key];
              const pre     = ColData.prefix || '';
              const suf     = ColData.suffix || '';
              const format  = ColData.format || '';
              const type    = ColData.type || 'string';
              let value     = item[key];

              // Format the value based on the type THIS WILL NEED TO BE EXTENDED
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

  async parseJSON() {
    // Parse the JSON string into an object then convert it to an array of key-value pairs in the oder of the sequecne
    try {
      const { JSONCode } = this.props;
      const ColumnsJSON: IColumnsConfig = JSON.parse(JSONCode);
      console.log("ColumnsObject", ColumnsJSON);
      this.setState({ ColumnsJSON });

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
    const { filteredItems, globalError,  updatedItems } = this.state;
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
              <TableGridRender colJSON={this.state.ColumnsJSON} items={updatedItems} /> 
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
