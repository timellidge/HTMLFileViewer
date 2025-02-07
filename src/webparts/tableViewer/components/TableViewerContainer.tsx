import * as React from 'react';
import { useState, useEffect } from 'react';
import { mergeStyles } from '@fluentui/react';
import styles from './TableViewer.module.scss';
import { DisplayMode } from '@microsoft/sp-core-library';
import { IReadonlyTheme } from '@microsoft/sp-component-base';
import TableViewerHeader from './TableViewerHeader';
import TableViewerPlaceholder from './TableViewerPlaceholder';
import TableViewerErrorMessage from './TableViewerErrorMessage';
import { parseDate, getItemsUsingRenderListDataAsStream, numberFormat, toProperCase, getListUrl } from '../../../helpers/Utilities';
import TableGridRender from './TableElements/TableGridRender';
import TabBarRender from './TableElements/TabBarRender';
import { IColumnsConfig, ITabData, ITabDataDetail, IColumnJSON } from '../../../helpers/Interfaces';

export interface IField {
  rawValue: any;
  displayValue: string;
  className?: string;
}

export type ItemField = IField | any;

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
  tabBehaviour: boolean;
  hideErrorEmpty: boolean;
  themeVariant: IReadonlyTheme | undefined;
  contentHeight: string;
  sidePadding: number;
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
  const { displayMode, title, updateProperty, showTitle, showFind, configured, 
          onConfigure, JSONCode, webPartCSS, siteUrl, listId, viewXmlCode, hideErrorEmpty,
          themeVariant, contentHeight, contextSiteUrl, contextUser, sidePadding, webPartTag , tabBehaviour 
    } = props;

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
  const [listPath, setListPath] = useState<string>('');
  const [maxBarValues, setMaxBarValues] = useState<{ [key: string]: number }>({});
  const [windowDimensions, setWindowDimensions] = useState<{ width: number, height: number }>({ width: window.innerWidth, height: window.innerHeight });


  //=================================================================================================================
  // ON CLICK EVENTS FOR FILTERING AND SORTING AND SEARCHING AND OTHER FUNCTIONS
  //=================================================================================================================
  const getFilterValues = (items: any[], columnName: string, column:IColumnJSON): ITabDataDetail => {
    // This gets a list of the unique values in the data structure and indicates how many items have that value, and sets selected to false
    console.log(">>> GetFilterValues",columnName,column);
    const tabData: ITabDataDetail = {};
    items.forEach((item) => {
      const tabValue = item[columnName];
      if (tabValue) {
        if (column.type === 'multiChoice') {
          // If the tabValue is an array, loop through each value in the array
          tabValue.forEach((value: string) => {
            if (tabData[value]) {
              tabData[value].itemCount++;
            } else {
              tabData[value] = { itemCount: 1, selected: false };
            }
          });
        } else {
          if (column.type === 'person') {
             tabValue.forEach((value: any) => {
               if (tabData[value.title]) {
                 tabData[value.title].itemCount++;
               } else {
                 tabData[value.title] = { itemCount: 1, selected: false };
              }
             });
          } else {  
            // If the tabValue exists, increase the count
            if (tabData[tabValue]) {
              tabData[tabValue].itemCount++;
            } else {
              // If the tabValue does not exist, create a new entry and the sub fields itemCount and selected
              // This defines the structure and initial content of the tabData object
              tabData[tabValue] = { itemCount: 1, selected: false };
            }
          }
        }
      }
    });
    return tabData;
  };
  
  // This function is called when the user types in the search box
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchQuery = event.target.value.toLowerCase();
    setSearchQuery(searchQuery);
    applyFilter();
  };

  // two funtions:   one to set the tabs and one to do the filter ? then we can call the filter one from the search? 
  const handleTabChange = (fieldName: string, tab: string) => {
    const updatedTabData = { ...tabData }; // take a copy to work with 
    
    const clearTabs = () => {
      // Loop through all keys in updatedTabData and set all .selected to false
      Object.keys(updatedTabData).forEach((field) => {
        Object.keys(updatedTabData[field]).forEach((key) => {
          updatedTabData[field][key].selected = false;
        });
      });
    };

    // if i call this with no field name then i want to clear all the selected tabs (like a reset button for example)
    if(!fieldName){
      clearTabs();
    } else {
      // two versons of this code one for when we are using the tab behaviour (multiple selectable tabs) and one for when we are not
      if(tabBehaviour){ //this allows togle and multi select
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
      } else { // this is a single select tab so it clears all the others and only sets the selected one
        Object.keys(updatedTabData[fieldName]).forEach((key) => {
          if (key === tab) {
            updatedTabData[fieldName][key].selected = true;
          } else {
            updatedTabData[fieldName][key].selected = false;
          }
        });
      }
    }
    setTabData(updatedTabData);
    applyFilter();
  };

  const applyFilter = () => {
    // Filter the items based on the selected tabs
    const selectedKeys = Object.keys(tabData).filter((fieldName) =>
      Object.values(tabData[fieldName] as ITabDataDetail).some((tab) => tab.selected)
    );

    let newFilteredItems: any[];
    if (selectedKeys.length === 0) {
      newFilteredItems = updatedItems;
    } else {
      const filteredItemsSet = new Set<any>();
      selectedKeys.forEach((fieldKey) => {
        const selectedTabs = Object.keys(tabData[fieldKey]).filter(
          (key) => tabData[fieldKey][key].selected
        );
        const column = ColumnsJSON[fieldKey]
        //console.log(">>> Search ", fieldKey, " values to search for ", selectedTabs);
        updatedItems.forEach((item: any) => {
          const fieldValue = item[fieldKey]
          // so maybe i need to look at the jsontype to determine this 
          if (column.type === 'person' || column.type ==='multiChoice') {
            if (selectedTabs.some(tab => fieldValue.displayValue.includes(tab))) {
              filteredItemsSet.add(item);
            }
          } else {
            if (selectedTabs.includes(fieldValue.rawValue)) {
              filteredItemsSet.add(item);
            }
          }
        });
      });
      newFilteredItems = Array.from(filteredItemsSet);
    }

    // now if the state comtains a search filter apply that to the reduced set of items or just return the reduced set :-) 
    if (searchQuery) {
      const filteredItems = newFilteredItems.filter((item) =>
        Object.values(item).some((field) => {
          const fieldValue = field as ItemField;
          return fieldValue && fieldValue.displayValue && String(fieldValue.displayValue).toLowerCase().includes(searchQuery);
        })
      );
      setFilteredItems(filteredItems);
    } else {
      setFilteredItems(newFilteredItems);
    }
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

  const getListPath = React.useCallback(async () => {
    try {
      const listPath = await getListUrl(
        siteUrl, listId
      );
      setListPath(listPath);
    } catch (e) {
      if (hideErrorEmpty) setGlobalError(e);
    }
  }, [siteUrl, listId]);

  //=================================================================================================================
  // CSS CONSTS AND STUFF
  //================================================================================================================= 
  //are there any css bits we beed to include here (maybe add this to the css things we added to the webpart) as it want to apply tothe same container 
  const _containerClass = mergeStyles(styles.tableViewer, { marginRight: sidePadding + "px", marginLeft: sidePadding + "px" });


  //=================================================================================================================
  // USE EFFECTS TO GET THE DATA 
  //=================================================================================================================
  useEffect(() => {
    if (!configured) {
      const ColumnsJSON: IColumnsConfig = JSON.parse(JSONCode);
      console.log("ColumnsObject", ColumnsJSON);
      setColumnsJSON(ColumnsJSON);
      getListPath();
      getItems();
    }
  }, [configured]);


  // AND THEN LOOP THROUGH AGAIN TO FORMAT THE DATA
  useEffect(() => {

    // NOW PREPARE IT FOR DISPLAY LOOP THROUGH ONCE TO GET THE MAX VALUES FOR THE BAR CHARTS 
    const barColumns = Object.keys(ColumnsJSON).filter(key => ColumnsJSON[key].type === 'bar');
    const maxValues: { [key: string]: number } = {};

    barColumns.forEach((column) => {
      const maxValue = Math.max(...items.map(item => parseFloat(item[column]) || 0));
      maxValues[column] = maxValue;
    });
    console.log("Max Bar Values", maxValues);
    setMaxBarValues(maxValues);

    // GET THE TAB VALUES THIS IS DIFFERENT FOR MULTI SELECT ABD PEOPLE AS THEY NEED ENUMERATING
    const tabs = Object.keys(ColumnsJSON).filter(key => ColumnsJSON[key].tab === true);
    console.log("TabFields",tabs);
    // get the unique values for each of the tab fields
    const newtabData: ITabData = {};
    tabs.forEach((field) => {
      const tabFieldData = getFilterValues(items, field, ColumnsJSON[field]);
      // assign the tabFieldData to the tabData object WITH the field name as the key
      newtabData[field] = tabFieldData;
    });
    // may issue a warning if more that 15 items are found in a tab field - only because the UI will look a bit odd
    console.log("ALL Tab data:",newtabData);
    setTabData(newtabData);

    // DATA CROSS CHECK ARE ALL TH E FIELDS IN THE JSON CODE IN THE DATA
    // Check if all fields in the JSON code are in the data
    const missingFields = Object.keys(ColumnsJSON).filter((key) => !(key in items[0]));
    if (missingFields.length > 0) {   
      console.error("The following fields are missing from the data:", missingFields);
    }


    // so here we can prepare the data by identifying if it has a prefix or a suffix or a specific format and then we can render the data in the table
    // we also do soem specific things if its people or multi values or links etc
    const updateData = async () => {
      const newTabData = items.map(item => {
        const newItem = { ...item };
    
        Object.keys(item).forEach((key) => {
          if (ColumnsJSON[key]) {
            const ColData = ColumnsJSON[key];
            const format = ColData.format || '0';
            const type = ColData.type || 'string';
            let rawValue = item[key];
            let displayValue = rawValue;
            // let sortValue = rawValue;
  
              // Format the value based on the type
              if (type === 'number') {
                rawValue = parseFloat(rawValue.replace(/,/g, '')); // remove any commas and convert to a number
                if (isNaN(rawValue)) { 
                  rawValue = 0;
                  displayValue = '';
                } else {
                  displayValue = numberFormat(rawValue, format);
                }

              } else if (type === 'date') {
                rawValue = parseDate(rawValue, 'en-GB');
                displayValue = rawValue.toFormat(format || 'dd/MM/yyyy'); // Format the DateTime object

              } else if (type === 'singleChoice') {
                displayValue = rawValue ? rawValue : '-';

              } else if (type === 'multiChoice') {
                displayValue = Array.isArray(rawValue) ? rawValue.join(', ') : rawValue;

              } else if (type === 'link') {
                // the raw value is the link and the display value is the text to display which is the name of the key +.desc
                const tempkey = key + ".desc";
                displayValue = item[tempkey];

              } else if (type === 'person') {
                if (rawValue && typeof rawValue === 'object' && rawValue[0].title) {
                  displayValue = '';
                  rawValue.forEach((person: any)  => {
                    const email = person?.email || '';
                    const name = toProperCase(email.split('@')[0].replace(/\./g, ' '));
                    person.name = name; // Add the name key to person
                    displayValue += `${name}, `;
                  });
                  // Remove the trailing comma and space
                  displayValue = displayValue.slice(0, -2);

                } else {
                  displayValue = '';
                }
              }
            
            // clear it if the data is missign so we render nothing
            if(rawValue === null ){
              displayValue= "";
            } 

            newItem[key] = {
              rawValue: rawValue,
              displayValue: displayValue,
            };
          }
        });
        return newItem;
      });
    
      setUpdatedItems(newTabData);
      setFilteredItems(newTabData); // pop in the first lot of items to be displayed
      console.log(">>> UpdatedItems", newTabData);
    };

    updateData();
  }, [items, ColumnsJSON]);


  useEffect(() => {
    // Get the width and height of the window on load
    const handleResize = () => {
      setWindowDimensions({ width: window.innerWidth, height: window.innerHeight });
    };

    // Add event listener for window resize
    window.addEventListener('resize', handleResize);

    // Call handleResize to set initial dimensions
    handleResize();

    // Cleanup event listener on unmount
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  //=================================================================================================================
  // RENDER THE COMPONENT TREE :-)
  //=================================================================================================================
  console.log("Filtered Items",filteredItems);
  return (
    <div id={webPartTag} className={_containerClass}> 
      {!configured ? (
        <>
          <div >
            <TableViewerHeader  displayMode={displayMode} title={title} updateProperty={updateProperty} showTitle={showTitle} showFind={showFind} searchQuery={searchQuery} handleSearch={handleSearch}/>
            <div className={styles.tabBar}>
              {Object.keys(tabData).map((field) => (
                <TabBarRender key={field} fieldName={field} tabs={tabData[field]} handleTabChange={handleTabChange} tabBehaviour={tabBehaviour}/>
              ))}
            </div>
            <TableGridRender listUrl={listPath} colJSON={ColumnsJSON} items={filteredItems} contentHeight={contentHeight} maxBarValues={maxBarValues} height={windowDimensions.height}/> 
          </div>
          {globalError && (
            <TableViewerErrorMessage message={globalError} onDismiss={() => setGlobalError(null)} />
          )}
        </>
      ) : (
        <TableViewerPlaceholder displayMode={displayMode} onConfigure={onConfigure} />
      )}
    </div>
  );
}

export default TableViewerContainer;
