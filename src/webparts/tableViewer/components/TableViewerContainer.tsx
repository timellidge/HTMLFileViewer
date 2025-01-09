import * as React from 'react';
import { useState,useEffect } from 'react';
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
import { dateFormat, getItemsUsingRenderListDataAsStream, numberFormat } from '../../../helpers/Utilities';
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
import { get } from 'lodash';

export interface ITableViewerContainerProps {
  JSONCode: string;
  webPartCSS: string;
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

//=================================================================================================================
// ALL NEW FUNCTIONAL COMPONENT CODE MIGRATED FROM CLASS PATTERN (if only it would work)
//=================================================================================================================

const TableViewerContainer: React.FunctionComponent<ITableViewerContainerProps> = (props) => {
  // pull out the properties from the props object
  const { displayMode, title, updateProperty, showTitle, showFind, configured, onConfigure, JSONCode, webPartCSS, siteUrl, listId, viewXmlCode, hideErrorEmpty, themeVariant, contentHeight, contextSiteUrl, contextUser, webPartTag  } = props;

  //=================================================================================================================
  // SET UP SOME REFERENCE DATA AND THE STATE VARIABLES 
  //=================================================================================================================
  const [tabData, setTabData] = useState<ITabData>({});
  const [items, setItems] = useState<any[]>([]);
  const [updatedItems, setUpdatedItems] = useState<any[]>([]);
  const [filteredItems, setFilteredItems] = useState<any[]>([]);
  const [ColumnsJSON, setColumnsJSON] = useState<IColumnsConfig>({});
  const [globalError, setGlobalError] = useState<Error>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');


  //=================================================================================================================
  // ON CLICK EVENTS FOR FILTERING AND SORTING AND SEARCHING AND OTHER FUNCTIONS
  //=================================================================================================================
  const getFilterValues = (items: any[], columnName: string): ITabDataDetail => {
    // This gets a list of the unique values in the data structure and indicates how many items have that value, and sets selected to false
    const tabData: ITabDataDetail = {};
    items.forEach((item) => {
      const tabValue = item[columnName];
      if (tabValue) {
        // If the tabValue exists, increase the count
        if (tabData[tabValue]) {
          tabData[tabValue].itemCount++;
        } else {
          // If the tabValue does not exist, create a new entry and the sub fields itemCount and selected
          // This defines the structure and initial content of the tabData object
          tabData[tabValue] = { itemCount: 1, selected: false };
        }
      }
    });
    return tabData;
  };
  
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchQuery = event.target.value.toLowerCase();
    setSearchQuery(searchQuery);

    const filteredItems = items.filter((item) =>
      Object.values(item).some(value =>
        String(value).toLowerCase().includes(searchQuery)
      )
    );

    // Re-apply the tab filters
    const selectedKeys = Object.keys(tabData).filter(fieldName => 
      Object.values(tabData[fieldName] as ITabDataDetail).some(tab => tab.selected)
    );
    console.log("SelectedKeys",selectedKeys);

    // if (selectedTab) {
    //   filteredItems = filteredItems.filter((item) =>
    //     item[selectedTab] && String(item[selectedTab]).toLowerCase().includes(searchQuery)
    //   );
    // }

    // Update the state with the search query and the filtered items
    setFilteredItems(filteredItems);
  };

  const handleTabChange = (fieldName: string, tab: string) => {
    const updatedTabData = { ...tabData };

    if (tab) {
      Object.keys(updatedTabData[fieldName]).forEach((key) => {
        if (key === tab) {
          updatedTabData[fieldName][key].selected = !updatedTabData[fieldName][key].selected;
        }
      });
    } else {
      Object.keys(updatedTabData[fieldName]).forEach((key) => {
        updatedTabData[fieldName][key].selected = false;
      });
    }

    const selectedKeys = Object.keys(updatedTabData).filter((fieldName) =>
      Object.values(updatedTabData[fieldName] as ITabDataDetail).some((tab) => tab.selected)
    );

    let newFilteredItems: any[];
    if (selectedKeys.length === 0) {
      newFilteredItems = items;
    } else {
      const filteredItemsSet = new Set<any>();
      selectedKeys.forEach((fieldKey) => {
        const selectedTabs = Object.keys(updatedTabData[fieldKey]).filter(
          (key) => updatedTabData[fieldKey][key].selected
        );
        console.log("FieldName", fieldKey, "SelectedTabs", selectedTabs);
        items.forEach((item: any) => {
          if (selectedTabs.includes(item[fieldKey])) {
            filteredItemsSet.add(item);
          }
        });
      });
      newFilteredItems = Array.from(filteredItemsSet);
    }

    setFilteredItems(newFilteredItems);
    setTabData(updatedTabData);
  };

  //=================================================================================================================
  // GET THE ITEMS FROM SHAREPOINT
  //================================================================================================================= 
  const getItems = React.useCallback(async () => {
    try {
      const { Row } = await getItemsUsingRenderListDataAsStream(
        siteUrl, listId, viewXmlCode,
      );
      setItems(Row);
    } catch (e) {
      if (hideErrorEmpty) setGlobalError(e);
    }
  }, [viewXmlCode, siteUrl, listId]);

  //=================================================================================================================
  // CSS CONSTS AND STUFF
  //================================================================================================================= 
    //are there any css bits we beed to include here (maybe add this to the css things we added to the webpart) as it want to apply tothe same container 
    const _containerClass = mergeStyles(styles.tableContainer, { height: contentHeight});


  //=================================================================================================================
  // USE EFFECTS TO GET THE DATA AND SET UP THE TABS (lifecycle methods and reacting to data changes)
  //=================================================================================================================
  useEffect(() => {
    if (!configured) {
      const ColumnsJSON: IColumnsConfig = JSON.parse(JSONCode);
      console.log("ColumnsObject", ColumnsJSON);
      setColumnsJSON(ColumnsJSON);
      getItems();
    }
  }, [configured]);

  useEffect(() => {
    // Update tabData and updatedItems when items change
    // get a list of the fields that are marked as tabs and prepare the data structure for the tabs
    // the one that shows counts, enumerates values idf it is selected  and the field it relates to 
    const tabs = Object.keys(ColumnsJSON).filter(key => ColumnsJSON[key].tab === true);
    console.log("TabFields",tabs);
    // get the unique values for each of the tab fields
    const tabData: ITabData = {};
    tabs.forEach((field) => {
      const tabFieldData = getFilterValues(items, field);
      // assign the tabFieldData to the tabData object WITH the field name as the key
      tabData[field] = tabFieldData;
    });
    console.log("ALL Tab data:",tabData);
    setTabData(tabData);

    const updateData = async () => {
      // so here we can prepare the data by identifying if it has a prefix or a suffix or a specific format and then we can render the data in the table
      const newTabData = items.map(item => {
        const newItem = { ...item };

        Object.keys(item).forEach((key) => {
          if (ColumnsJSON[key]) {
            const ColData = ColumnsJSON[key];
            const pre = ColData.prefix || '';
            const suf = ColData.suffix || '';
            const format = ColData.format || '';
            const type = ColData.type || 'string';
            let value = item[key];
            // Format the value based on the type THIS WILL NEED TO BE EXTENDED to cope with the stack field type
            if (type === 'number') {
              value = numberFormat(value, format);
            } else if (type === 'date') {
              value = dateFormat(value, format, 'en-GB');
            } else if (type === 'singlechoice') {
              value = value ? value : 'Not selected';
            } else if (type === 'multichoice') {
              value = Array.isArray(value) ? value.join(', ') : value;
            } else if (type === 'person') {
              value = value && typeof value === 'object' && value.email ? value.email : 'No person';
            }
            newItem[key] = pre + value + suf;
          }
        });
        return newItem;
      });
      setUpdatedItems(newTabData);
      setFilteredItems(newTabData); // pop in the first lot of items to be displayed
      console.log(">>> UpdatedItems",newTabData);
    };

    updateData();
  }, [items]);

  //=================================================================================================================
  // RENDER THE COMPONENT TREE :-)
  //=================================================================================================================
  console.log("Filtered Items",filteredItems);
  return (
    <div id={webPartTag} className={styles.tableViewer}> 
      {!configured ? (
        <>
          <TableViewer >
            <TableViewerHeader  displayMode={displayMode} title={title} updateProperty={updateProperty} showTitle={showTitle} showFind={showFind} searchQuery={searchQuery} handleSearch={handleSearch}/>
            <div className={styles.tabBar}>
              {Object.keys(tabData).map((field) => (
                <TabBarRender key={field} fieldName={field} tabs={tabData[field]} handleTabChange={handleTabChange} />
              ))}
            </div>
            <TableGridRender colJSON={ColumnsJSON} items={filteredItems} /> 
          </TableViewer>
          {globalError && (
            <h1>ERROR</h1>
            // <TableViewerErrorMessage message={globalError} onDismiss={() => setGlobalError(null)} />
          )}
        </>
      ) : (
        <TableViewerPlaceholder displayMode={displayMode} onConfigure={onConfigure} />
      )}
    </div>
  );
}

export default TableViewerContainer;
