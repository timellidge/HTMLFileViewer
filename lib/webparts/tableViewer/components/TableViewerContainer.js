import * as React from 'react';
import { useState, useEffect } from 'react';
import { mergeStyles } from '@fluentui/react';
import styles from './TableViewer.module.scss';
import TableViewer from './TableViewer';
import TableViewerHeader from './TableViewerHeader';
import TableViewerPlaceholder from './TableViewerPlaceholder';
import { dateFormat, getItemsUsingRenderListDataAsStream, numberFormat } from '../../../helpers/Utilities';
import TableGridRender from './TableGridRender';
import TabBarRender from './TabsRender/TabBarRender';
//=================================================================================================================
// ALL NEW FUNCTIONAL COMPONENT CODE MIGRATED FROM CLASS PATTERN (if only it would work)
//=================================================================================================================
const TableViewerContainer = (props) => {
    // pull out the properties from the props object
    const { displayMode, title, updateProperty, showTitle, showFind, configured, onConfigure, JSONCode, webPartCSS, siteUrl, listId, viewXmlCode, hideErrorEmpty, themeVariant, contentHeight, contextSiteUrl, contextUser, webPartTag } = props;
    //=================================================================================================================
    // SET UP SOME REFERENCE DATA AND THE STATE VARIABLES 
    //=================================================================================================================
    const [tabData, setTabData] = useState({});
    const [items, setItems] = useState([]);
    const [updatedItems, setUpdatedItems] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [ColumnsJSON, setColumnsJSON] = useState({});
    const [globalError, setGlobalError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    //=================================================================================================================
    // ON CLICK EVENTS FOR FILTERING AND SORTING AND SEARCHING AND OTHER FUNCTIONS
    //=================================================================================================================
    const getFilterValues = (items, columnName) => {
        // This gets a list of the unique values in the data structure and indicates how many items have that value, and sets selected to false
        const tabData = {};
        items.forEach((item) => {
            const tabValue = item[columnName];
            if (tabValue) {
                // If the tabValue exists, increase the count
                if (tabData[tabValue]) {
                    tabData[tabValue].itemCount++;
                }
                else {
                    // If the tabValue does not exist, create a new entry and the sub fields itemCount and selected
                    // This defines the structure and initial content of the tabData object
                    tabData[tabValue] = { itemCount: 1, selected: false };
                }
            }
        });
        return tabData;
    };
    // This function is called when the user types in the search box
    const handleSearch = (event) => {
        const searchQuery = event.target.value.toLowerCase();
        setSearchQuery(searchQuery);
        // const filteredItems = items.filter((item) =>
        //   Object.values(item).some(value =>
        //     String(value).toLowerCase().includes(searchQuery)
        //   )
        // );
        // Update the state with the search query and the filtered items
        //setFilteredItems(filteredItems);
        applyFilter();
    };
    //split this into two funtions?  one to set the tabs and one to do the filter ? then we can call the filter one from the search? 
    const handleTabChange = (fieldName, tab) => {
        const updatedTabData = Object.assign({}, tabData); // take a copy to work with 
        if (!fieldName) {
            // if i call this with no field name then i want to clear all the selected tabs
            // Loop through all keys in updatedTabData and set all .selected to false
            Object.keys(updatedTabData).forEach((field) => {
                Object.keys(updatedTabData[field]).forEach((key) => {
                    updatedTabData[field][key].selected = false;
                });
            });
        }
        else {
            if (tab) {
                Object.keys(updatedTabData[fieldName]).forEach((key) => {
                    if (key === tab) {
                        updatedTabData[fieldName][key].selected = !updatedTabData[fieldName][key].selected;
                    }
                });
            }
            else {
                Object.keys(updatedTabData[fieldName]).forEach((key) => {
                    updatedTabData[fieldName][key].selected = false;
                });
            }
        }
        setTabData(updatedTabData);
        applyFilter();
    };
    const applyFilter = () => {
        const selectedKeys = Object.keys(tabData).filter((fieldName) => Object.values(tabData[fieldName]).some((tab) => tab.selected));
        let newFilteredItems;
        if (selectedKeys.length === 0) {
            newFilteredItems = items;
        }
        else {
            const filteredItemsSet = new Set();
            selectedKeys.forEach((fieldKey) => {
                const selectedTabs = Object.keys(tabData[fieldKey]).filter((key) => tabData[fieldKey][key].selected);
                console.log("FieldName", fieldKey, "SelectedTabs", selectedTabs);
                items.forEach((item) => {
                    if (selectedTabs.includes(item[fieldKey])) {
                        filteredItemsSet.add(item);
                    }
                });
            });
            newFilteredItems = Array.from(filteredItemsSet);
        }
        const filteredItems = newFilteredItems.filter((item) => Object.values(item).some(value => String(value).toLowerCase().includes(searchQuery)));
        setFilteredItems(filteredItems);
    };
    //=================================================================================================================
    // GET THE ITEMS FROM SHAREPOINT
    //================================================================================================================= 
    const getItems = React.useCallback(async () => {
        try {
            const { Row } = await getItemsUsingRenderListDataAsStream(siteUrl, listId, viewXmlCode);
            setItems(Row);
        }
        catch (e) {
            if (hideErrorEmpty)
                setGlobalError(e);
        }
    }, [viewXmlCode, siteUrl, listId]);
    //=================================================================================================================
    // CSS CONSTS AND STUFF
    //================================================================================================================= 
    //are there any css bits we beed to include here (maybe add this to the css things we added to the webpart) as it want to apply tothe same container 
    const _containerClass = mergeStyles(styles.tableContainer, { height: contentHeight });
    //=================================================================================================================
    // USE EFFECTS TO GET THE DATA AND SET UP THE TABS (lifecycle methods and reacting to data changes)
    //=================================================================================================================
    useEffect(() => {
        if (!configured) {
            const ColumnsJSON = JSON.parse(JSONCode);
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
        console.log("TabFields", tabs);
        // get the unique values for each of the tab fields
        const tabData = {};
        tabs.forEach((field) => {
            const tabFieldData = getFilterValues(items, field);
            // assign the tabFieldData to the tabData object WITH the field name as the key
            tabData[field] = tabFieldData;
        });
        console.log("ALL Tab data:", tabData);
        setTabData(tabData);
        const updateData = async () => {
            // so here we can prepare the data by identifying if it has a prefix or a suffix or a specific format and then we can render the data in the table
            const newTabData = items.map(item => {
                const newItem = Object.assign({}, item);
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
                        }
                        else if (type === 'date') {
                            value = dateFormat(value, format, 'en-GB');
                        }
                        else if (type === 'singlechoice') {
                            value = value ? value : 'Not selected';
                        }
                        else if (type === 'multichoice') {
                            value = Array.isArray(value) ? value.join(', ') : value;
                        }
                        else if (type === 'person') {
                            value = value && typeof value === 'object' && value.email ? value.email : 'No person';
                        }
                        newItem[key] = pre + value + suf;
                    }
                });
                return newItem;
            });
            setUpdatedItems(newTabData);
            setFilteredItems(newTabData); // pop in the first lot of items to be displayed
            console.log(">>> UpdatedItems", newTabData);
        };
        updateData();
    }, [items]);
    //=================================================================================================================
    // RENDER THE COMPONENT TREE :-)
    //=================================================================================================================
    console.log("Filtered Items", filteredItems);
    return (React.createElement("div", { id: webPartTag, className: styles.tableViewer }, !configured ? (React.createElement(React.Fragment, null,
        React.createElement(TableViewer, null,
            React.createElement(TableViewerHeader, { displayMode: displayMode, title: title, updateProperty: updateProperty, showTitle: showTitle, showFind: showFind, searchQuery: searchQuery, handleSearch: handleSearch }),
            React.createElement("div", { className: styles.tabBar }, Object.keys(tabData).map((field) => (React.createElement(TabBarRender, { key: field, fieldName: field, tabs: tabData[field], handleTabChange: handleTabChange })))),
            React.createElement(TableGridRender, { colJSON: ColumnsJSON, items: filteredItems })),
        globalError && (React.createElement("h1", null, "ERROR")
        // <TableViewerErrorMessage message={globalError} onDismiss={() => setGlobalError(null)} />
        ))) : (React.createElement(TableViewerPlaceholder, { displayMode: displayMode, onConfigure: onConfigure }))));
};
export default TableViewerContainer;
//# sourceMappingURL=TableViewerContainer.js.map