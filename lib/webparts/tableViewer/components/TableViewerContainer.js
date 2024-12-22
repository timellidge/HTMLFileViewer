import * as React from 'react';
import styles from './TableViewer.module.scss';
import { TextField } from '@fluentui/react/lib/TextField';
import TableViewer from './TableViewer';
import TableViewerHeader from './TableViewerHeader';
import TableViewerBody from './TableViewerBody';
import TableViewerTitle from './TableViewerTitle';
import TableViewerPlaceholder from './TableViewerPlaceholder';
import TableViewerErrorMessage from './TableViewerErrorMessage';
import TableViewerRender from './TableViewerRender';
import { convertWidthToPx, getItemsUsingRenderListDataAsStream } from '../../../helpers/Utilities';
import TabBarRender from './TabsRender/TabBarRender';
import TextFieldRender from './FieldRender/TextFieldRender';
import NumberFieldRender from './FieldRender/NumberFieldRender';
import SingleChoiceFieldRender from './FieldRender/SingleChoiceFieldRender';
import MultiChoiceFieldRender from './FieldRender/MultiChoiceFieldRender';
import PersonFieldRender from './FieldRender/PersonFieldRender';
import DateFieldRender from './FieldRender/DateFieldRender';
import StackFieldRender from './FieldRender/StackFieldRender';
///////////////////////////////////////////////////////////////////////////
// we will convert this old class pattern but first i NEED to understand the code
///////////////////////////////////////////////////////////////////////////
class TableViewerContainer extends React.Component {
    constructor(props) {
        super(props);
        // Separate field rendering to simplify the parseColumns method
        this.renderField = (column, key, item, columnsObject) => {
            const prefix = column.prefix || '';
            const suffix = column.suffix || '';
            const fieldValue = item[key];
            switch (column.type) {
                case 'number': {
                    return React.createElement(NumberFieldRender, { fieldValue: fieldValue, prefix: prefix, suffix: suffix, className: column.class ? styles[column.class] : undefined });
                }
                case 'singlechoice': {
                    return React.createElement(SingleChoiceFieldRender, { fieldValue: fieldValue, prefix: prefix, suffix: suffix, className: column.class ? styles[column.class] : undefined });
                }
                case 'multichoice': {
                    const values = Array.isArray(item[key]) ? item[key] : [item[key]];
                    return React.createElement(MultiChoiceFieldRender, { values: values, className: column.class ? styles[column.class] : undefined });
                }
                case 'person': {
                    const person = item[key];
                    return React.createElement(PersonFieldRender, { person: person, format: column.format, prefix: prefix, suffix: suffix, className: column.class ? styles[column.class] : undefined });
                }
                case 'date': {
                    const dateValue = item[key];
                    return React.createElement(DateFieldRender, { dateValue: dateValue, format: column.format, prefix: prefix, suffix: suffix, className: column.class ? styles[column.class] : undefined });
                }
                case 'stack': {
                    if (Array.isArray(column.Fields)) {
                        return React.createElement(StackFieldRender, { fields: column.Fields, columnsObject: columnsObject, item: item });
                    }
                    break;
                }
                default:
                    return React.createElement(TextFieldRender, { fieldValue: fieldValue, prefix: prefix, suffix: suffix, isMultiline: column.isMultiline, className: column.class ? styles[column.class] : undefined });
            }
        };
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
            selectedChoiceFieldName: '',
            tabCounts: {},
            NewJSON: {}
        };
        this.getItems = this.getItems.bind(this);
        this.onScrollEnd = this.onScrollEnd.bind(this);
        this.handleSearch = this.handleSearch.bind(this);
        this.handleTabChange = this.handleTabChange.bind(this);
    }
    async componentDidMount() {
        try {
            // const choices = await this.parseChoiceColumns(this.props.JSONCode);
            await Promise.all([this.parseColumns(), this.getItems()]);
            if (this.state.items.length > 0) {
                const tabs = Object.keys(this.state.NewJSON).filter(key => this.state.NewJSON[key].tab === true);
                console.log("TabFields", tabs);
                let tabCounts = {};
                tabs.forEach((field) => {
                    tabCounts = this.getUniqueValues(this.state.items, field);
                    console.log("field:", field, "TabValues:", tabCounts);
                });
                this.setState({
                    selectedTab: this.state.selectedTab || (tabs.length > 0 ? tabs[0] : null),
                    tabs,
                    tabCounts
                });
            }
        }
        catch (error) {
            console.error('Error during component initialization:', error);
        }
    }
    getUniqueValues(items, columnName) {
        // this gets a list of the unique values in a column 
        const tabCounts = {};
        items.forEach((item) => {
            const tabValue = item[columnName];
            if (tabValue) {
                // If the tabValue exists, increase the count
                if (tabCounts[tabValue]) {
                    tabCounts[tabValue]++;
                }
                else {
                    tabCounts[tabValue] = 1;
                }
            }
        });
        return tabCounts;
    }
    // calculateTabCounts(items: any[], filterColumnName: string) {
    //   const tabCounts: { [key: string]: number } = {};
    //   items.forEach((item) => {
    //     const tabValue = item[filterColumnName];
    //     if (tabValue) {
    //       // If the tabValue exists, increase the count
    //       if (tabCounts[tabValue]) {
    //         tabCounts[tabValue]++;
    //       } else {
    //         tabCounts[tabValue] = 1;
    //       }
    //     }
    //   });
    //   return tabCounts;
    // }
    // generateTabsFromChoices(choices: any): string[] {
    //   const tabs: string[] = [];
    //   Object.values(choices).forEach((options: string[]) => {
    //     options.forEach((option: string) => {
    //       if (!tabs.includes(option)) {
    //         tabs.push(option);  // Add unique options to the tabs array
    //       }
    //     });
    //   });
    //   return tabs;
    // }
    // const tabCounts: { [key: string]: number } = {};
    // items.forEach((item) => {
    //   const tabValue = item[filterColumnName];
    //   if (tabValue) {
    //     // If the tabValue exists, increase the count
    //     if (tabCounts[tabValue]) {
    //       tabCounts[tabValue]++;
    //     } else {
    //       tabCounts[tabValue] = 1;
    //     }
    //   }
    // });
    // return tabCounts;
    //  // Function to parse columns and return choices for columns where tab is true
    //  async parseChoiceColumns(json: string): Promise<{ [key: string]: string[] }> {
    //   try {
    //     const columnsObject = JSON.parse(json);
    //     const choicesMap: { [key: string]: string[] } = {};
    //     // Iterate over each column in the JSON object
    //     for (const key in columnsObject) {
    //       const column = columnsObject[key];
    //       // Check if the column has tab set to true and its type is choice
    //       if (column.tab === 'true') {
    //           this.setState({selectedChoiceFieldName:column.name});
    //           const choices = await this.fetchChoiceOptions(column.name);
    //           choicesMap[column.name] = choices;
    //       }
    //     }
    //     return choicesMap;
    //   } catch (error) {
    //     console.error('Error parsing columns:', error);
    //     throw error;
    //   }
    // }
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
                    filteredItems = Row.filter((item) => item[selectedChoiceFieldName] === selectedTab);
                }
                this.setState({
                    items: Row,
                    filteredItems,
                    lastNextHref: NextHref,
                });
            }
            else {
                console.error('No items');
            }
        }
        catch (e) {
            console.error('Error fetching items:', e);
            if (!this.props.hideErrorEmpty)
                this.setState({ globalError: e });
        }
    }
    async onScrollEnd() {
        const { lastNextHref, items, selectedTab, selectedChoiceFieldName } = this.state;
        const { siteUrl, listId, viewXmlCode } = this.props;
        if (lastNextHref) {
            try {
                const { Row, NextHref } = await getItemsUsingRenderListDataAsStream(siteUrl, listId, viewXmlCode, lastNextHref.split('?')[1]);
                // Update items and filteredItems
                const newItems = [...items, ...Row];
                const filteredItems = selectedTab && selectedChoiceFieldName
                    ? newItems.filter((item) => item[selectedChoiceFieldName] === selectedTab)
                    : newItems;
                this.setState({
                    items: newItems,
                    filteredItems,
                    lastNextHref: NextHref,
                });
            }
            catch (e) {
                this.setState({ globalError: e });
            }
        }
    }
    // Function to fetch choice field options using PnPjs
    // async fetchChoiceOptions(name: string): Promise<string[]> {
    //   try {
    //     // Fetch the field schema
    //     const field:IFieldChoice = await sp.web.lists.getById(this.props.listId).fields.getByInternalNameOrTitle(name)();
    //     // Check if the field type is 'Choice'
    //     if (field.TypeAsString === 'Choice' && Array.isArray(field.Choices)) {
    //       return field.Choices;
    //     }
    //     throw new Error(`Field ${name} is not a choice field or does not have choices.`);
    //   } catch (error) {
    //     console.error(`Error fetching choice options for ${name}:`, error);
    //     throw error;
    //   }
    // }
    async parseColumns() {
        try {
            const { JSONCode } = this.props;
            const columnsObject = JSON.parse(JSONCode);
            const columnsArray = [];
            console.log("ColumnsObject", columnsObject);
            const NewJSON = convertWidthToPx(728, columnsObject);
            console.log("NewJSON", NewJSON);
            this.setState({ NewJSON });
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
                        minWidth: Math.min(width - 20, 0),
                        maxWidth: width,
                        columnType: column.type,
                        className: column.class || '',
                        isSortable: column.isSortable === 'true',
                        isSorted: false,
                        isSortedDescending: false,
                        onRender: (item) => this.renderField(column, key, item, columnsObject) // Handle field rendering separately
                    });
                }
                else {
                    columnsArray.push({
                        key: key,
                        fieldName: column.name,
                        name: column.name,
                        minWidth: Math.min(width - 20, 0),
                        maxWidth: width,
                        columnType: column.type,
                        className: column.class || '',
                        isSortable: column.isSortable === 'true',
                        isSorted: false,
                        isSortedDescending: false,
                        onRender: (item) => this.renderField(column, key, item, columnsObject) // Handle field rendering separately
                    });
                }
            });
            this.setState({ columnsArray });
        }
        catch (error) {
            console.error('Error parsing columns:', error);
            if (!this.props.hideErrorEmpty)
                this.setState({ globalError: 'Error parsing columns configuration' });
        }
    }
    handleSearch(event) {
        const searchQuery = event.target.value.toLowerCase();
        const { items, selectedTab } = this.state;
        let filteredItems = items.filter(item => Object.values(item).some(value => String(value).toLowerCase().includes(searchQuery)));
        if (selectedTab) {
            filteredItems = filteredItems.filter(item => item[selectedTab] && String(item[selectedTab]).toLowerCase().includes(searchQuery));
        }
        this.setState({ searchQuery, filteredItems });
    }
    handleTabChange(tab) {
        const { items } = this.state; // Original items
        const { selectedChoiceFieldName } = this.state; // Column to filter by
        let filteredItems = items;
        // Apply filtering if a tab is selected, otherwise show all items
        if (tab && selectedChoiceFieldName) {
            filteredItems = items.filter((item) => item[selectedChoiceFieldName] === tab);
        }
        // Update the state with selectedTab and filtered items
        this.setState({
            selectedTab: tab,
            filteredItems
        });
    }
    render() {
        const { displayMode, title, updateProperty, showTitle, showFind, configured, onConfigure } = this.props;
        const { filteredItems, globalError, columnsArray, tabs } = this.state;
        return (React.createElement("div", { id: this.state.webPartTag }, !configured ? (React.createElement(React.Fragment, null,
            React.createElement(TableViewer, null,
                React.createElement(TableViewerHeader, null,
                    showTitle && (React.createElement(TableViewerTitle, { displayMode: displayMode, title: title, updateProperty: updateProperty })),
                    showFind && (React.createElement(TextField, { placeholder: "Search...", value: this.state.searchQuery, onChange: this.handleSearch, styles: { root: { marginBottom: 20 } } }))),
                React.createElement(TableViewerBody, null,
                    React.createElement(TabBarRender, { TabName: tabs[0], Tabs: this.state.tabCounts, selectedTab: this.state.selectedTab, handleTabChange: this.handleTabChange }),
                    React.createElement(TableViewerRender, { columns: columnsArray, items: filteredItems, showFind: showFind, onScrollEnd: this.onScrollEnd, contentHeight: this.state.contentHeight }))),
            globalError && (React.createElement(TableViewerErrorMessage, { message: globalError, onDismiss: () => this.setState({ globalError: null }) })))) : (React.createElement(TableViewerPlaceholder, { displayMode: displayMode, onConfigure: onConfigure }))));
    }
}
export default TableViewerContainer;
//# sourceMappingURL=TableViewerContainer.js.map