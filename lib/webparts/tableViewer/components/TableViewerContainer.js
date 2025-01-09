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
// export interface ITableViewerContainerState {
//   items: any[];   // raw data from the list
//   filteredItems: any[]; // these are the items that have been filtered
//   updatedItems: any[];  // these are the items that have been formatted 
//   searchQuery: string;
//   lastNextHref: string;
//   globalError: any | null;
//   webPartTag: string;
//   contentHeight: string;
//   selectedTab: string | null;
//   selectedChoiceFieldName: string | null;
//   tabs: string[];
//   tabCounts: { [key: string]: number };
//   tabData: ITabData;
//   ColumnsJSON:  IColumnsConfig;
//   webPartCSS: string;
// }
///////////////////////////////////////////////////////////////////////////
// we will convert this old class pattern but first i NEED to understand the code
///////////////////////////////////////////////////////////////////////////
const TableViewerContainer = (props) => {
    const [tabData, setTabData] = useState({});
    const [items, setItems] = useState([]);
    const [updatedItems, setUpdatedItems] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [ColumnsJSON, setColumnsJSON] = useState({});
    const [globalError, setGlobalError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    useEffect(() => {
        const ColumnsJSON = JSON.parse(props.JSONCode);
        console.log("ColumnsObject", ColumnsJSON);
        setColumnsJSON(ColumnsJSON);
        getItems();
    });
    // GET THE DATA FROM SHAREPOINT ONCE ITS CONFIGURED
    useEffect(() => {
        if (!configured) {
            getItems();
        }
    }, [props.configured]);
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
        };
        updateData();
    }, [items]);
    function getFilterValues(items, columnName) {
        // this gets a list of the unique values id  data structure and indicates how many items have that value, and sets selected to false
        const tabData = {};
        items.forEach((item) => {
            const tabValue = item[columnName];
            if (tabValue) {
                // If the tabValue exists, increase the count
                if (tabData[tabValue]) {
                    tabData[tabValue].itemCount++;
                }
                else {
                    // If the tabValue does not exist, create a new entry and the sub fields itemCount and selected note trying them as strings as they are not defined
                    // so this defines the structure and initial content of the tabData object
                    tabData[tabValue] = { "itemCount": 1, "selected": false, };
                }
            }
        });
        return tabData;
    }
    //=================================================================================================================
    // GET THE ITEMS FROM SHAREPOINT
    //================================================================================================================= 
    const getItems = React.useCallback(async () => {
        try {
            const { Row } = await getItemsUsingRenderListDataAsStream(props.siteUrl, props.listId, props.viewXmlCode);
            setItems(Row);
        }
        catch (e) {
            if (props.hideErrorEmpty)
                setGlobalError(e);
        }
    }, [props.viewXmlCode, props.siteUrl, props.listId]);
    //=================================================================================================================
    // HANDLE SEARCH by looking in the items (text values) and filtering them based on the search query
    //=================================================================================================================
    function handleSearch(event) {
        const searchQuery = event.target.value.toLowerCase();
        const { items, selectedTab } = this.state;
        let filteredItems = items.filter((item) => Object.values(item).some(value => String(value).toLowerCase().includes(searchQuery)));
        // thAT BIT IS EASY NOW RE-APPLY THE TAB FILTERS
        if (selectedTab) {
            filteredItems = filteredItems.filter((item) => item[selectedTab] && String(item[selectedTab]).toLowerCase().includes(searchQuery));
        }
        //now POPULATE THE STATE WITH THE SEARCH QUERY AND THE FILTERED ITEMS
        this.setState({ filteredItems });
    }
    function handleTabChange(fieldName, tab) {
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
        }
        else {
            Object.keys(tabData[fieldName]).forEach((key) => {
                tabData[fieldName][key].selected = false;
            });
        }
        const selectedKeys = Object.keys(tabData).filter(fieldName => Object.values(tabData[fieldName]).some(tab => tab.selected));
        if (selectedKeys.length === 0) {
            filteredItems = items;
        }
        else {
            const filteredItemsSet = new Set();
            selectedKeys.forEach(fieldKey => {
                const selectedTabs = Object.keys(tabData[fieldKey]).filter(key => tabData[fieldKey][key].selected);
                console.log("FieldName", fieldKey, "SelectedTabs", selectedTabs);
                // Add items to the filteredItemsSet that match any of the selected tab values
                items.forEach((item) => {
                    if (selectedTabs.includes(item[fieldKey])) {
                        filteredItemsSet.add(item);
                    }
                });
            });
            filteredItems = Array.from(filteredItemsSet);
        }
        // Update the state with selectedTab and filtered items
        setFilteredItems(filteredItems);
        setTabData(tabData);
    }
    //are there any css bits we beed to include here (maybe add this to the css things we added to the webpart) as it want to apply tothe same container 
    const _containerClass = mergeStyles(styles.tableContainer, { height: props.contentHeight });
    const { displayMode, title, updateProperty, showTitle, showFind, configured, onConfigure } = props;
    console.log("Filtered Items", filteredItems);
    return (React.createElement("div", { id: props.webPartTag, className: styles.tableViewer }, !configured ? (React.createElement(React.Fragment, null,
        React.createElement(TableViewer, null,
            React.createElement(TableViewerHeader, { displayMode: displayMode, title: title, updateProperty: updateProperty, showTitle: showTitle, showFind: showFind, searchQuery: searchQuery, handleSearch: handleSearch }),
            React.createElement("div", { className: styles.tabBar }, Object.keys(tabData).map((field) => (React.createElement(TabBarRender, { key: field, fieldName: field, tabs: tabData[field], handleTabChange: handleTabChange })))),
            React.createElement(TableGridRender, { colJSON: ColumnsJSON, items: updatedItems })),
        globalError && (React.createElement("h1", null, "ERROR")
        // <TableViewerErrorMessage message={globalError} onDismiss={() => setGlobalError(null)} />
        ))) : (React.createElement(TableViewerPlaceholder, { displayMode: displayMode, onConfigure: onConfigure }))));
};
export default TableViewerContainer;
//# sourceMappingURL=TableViewerContainer.js.map