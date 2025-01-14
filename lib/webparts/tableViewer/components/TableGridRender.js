import * as React from 'react';
import { useState, useEffect } from 'react';
import styles from './TableViewer.module.scss';
import { mergeStyles } from '@fluentui/react';
import { Icon } from '@fluentui/react/lib/Icon';
import PersonCard from './TabsRender/PersonCard';
import { DateTime } from 'luxon';
const TableGridRender = ({ colJSON, items }) => {
    //we can only have one column sorted at a time so i need to know its name and its state
    const [sortField, setSortField] = useState({ key: '', direction: null });
    const [sortedItems, setSortedItems] = useState(items);
    const _sortedColumns = Object.keys(colJSON)
        .map((key) => ({ key, column: colJSON[key] }))
        .sort((a, b) => (a.column.sequence || 99) - (b.column.sequence || 99));
    // we can use the width directly from the column definition to set the grid template columns for the table but dont include the "" ones as they are hidden
    const _columnWidths = _sortedColumns
        .filter(({ column }) => column.width !== '')
        .map(({ column }) => column.width)
        .join(' ');
    const _GridStyle = mergeStyles(styles.tableGrid, { gridTemplateColumns: _columnWidths });
    console.log(">>> grid info", _columnWidths, _GridStyle);
    // this function will toggle the sort state of a column (just one a time)
    const handleSortToggle = (columnKey) => {
        setSortField((prevState) => ({
            key: columnKey,
            direction: prevState.key === columnKey ? !prevState.direction : true,
        }));
    };
    useEffect(() => {
        if (sortField.key) {
            const sorted = [...items].sort((a, b) => {
                const aValue = a[sortField.key].rawValue;
                const bValue = b[sortField.key].rawValue;
                if (aValue === null || aValue === undefined)
                    return 1;
                if (bValue === null || bValue === undefined)
                    return -1;
                //see if they are numbers even though they have a string type
                const aNumber = parseFloat(aValue);
                const bNumber = parseFloat(bValue);
                if (typeof aValue === 'string' && typeof bValue === 'string') {
                    if (!isNaN(aNumber) && !isNaN(bNumber)) {
                        return sortField.direction ? aNumber - bNumber : bNumber - aNumber;
                    }
                    else {
                        return sortField.direction ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
                    }
                }
                else {
                    if (DateTime.isDateTime(aValue) && DateTime.isDateTime(bValue)) {
                        return sortField.direction ? aValue.toMillis() - bValue.toMillis() : bValue.toMillis() - aValue.toMillis();
                    }
                    else {
                        return 0;
                    }
                }
            });
            setSortedItems(sorted);
        }
        else {
            setSortedItems(items);
        }
    }, [sortField, items]);
    //=================================================================================================================
    // A LOAD OF RENDER FUNCTIONS TO SIMPLIFY THE RETURN LOGIC BY SPLITTING EACH TYPE OUT INTO A FUNCTION
    //=================================================================================================================
    const renderPersonCard = (item, key, column) => (React.createElement(PersonCard, { email: item[key].rawValue[0].email, name: item[key].rawValue[0].name, title: item[key].rawValue[0].title, format: column.format }));
    // STACK OF FIELDS
    const renderStack = (item, column) => (React.createElement("div", null, column.fields.map((field, fieldIndex) => (item[field] ? (React.createElement("div", { className: `stack ${field}`, key: fieldIndex }, item[field].displayValue)) : (React.createElement("div", { className: `stack ${field}`, key: fieldIndex }, "\u00A0"))))));
    // HTML FIELD
    const renderHtml = (item, key) => (React.createElement("div", { dangerouslySetInnerHTML: { __html: item[key].displayValue } }));
    // DEFAULT RENDER FUNCTION WITH LINES CLAMP
    const renderDefault = (item, key, column) => (column.lines ? (React.createElement("div", { className: styles.tableDataContent, style: { WebkitLineClamp: column.lines, lineClamp: column.lines } }, item[key].displayValue)) : (item[key].displayValue));
    // ICON RENDER FUNCTION - ICONS ARE DEFINED IN THE COLUMN JSON
    const renderIcon = (item, key, column) => {
        const displayValue = item[key].displayValue;
        const iconData = column.icons[displayValue];
        console.log(">>> iconData", displayValue, iconData);
        if (iconData) {
            const [iconName, iconColor] = iconData.split('|');
            return React.createElement(Icon, { iconName: iconName, style: { color: iconColor }, title: displayValue });
        }
        else {
            return displayValue;
        }
    };
    // CATCH ALL FOR NO DATA
    const renderNoData = (column) => (
    // even  though there is no field i still need to check if its a stack or not
    column.type === 'stack' ? (React.createElement("div", null, column.fields.map((field, fieldIndex) => (React.createElement("div", { key: fieldIndex, className: `stack ${field}` }, "No Data"))))) : (React.createElement("span", null, "No Data")));
    //=================================================================================================================
    // THE RETURN FUNCTION
    //=================================================================================================================
    return (React.createElement(React.Fragment, null,
        React.createElement("div", { className: _GridStyle },
            _sortedColumns.map(({ key, column }) => (column.width > "0" && (React.createElement("div", { key: key, className: styles.tableHeaderCell },
                React.createElement("span", null, column.name),
                column.isSortable && (React.createElement(Icon, { iconName: sortField.key !== key
                        ? 'Sort'
                        : sortField.direction
                            ? 'SortDown'
                            : 'SortUp', className: styles.sortIcon, onClick: () => handleSortToggle(key) })))))),
            sortedItems.map((item, itemIndex) => (React.createElement(React.Fragment, { key: itemIndex }, _sortedColumns.map(({ key, column }) => (column.width > "0" && (React.createElement("div", { key: `${itemIndex}-${key}`, className: `${styles.tableCell} ${column.class ? column.class : ''}` }, column.type === 'stack' ? (renderStack(item, column)) : item[key] ? (column.type === 'person' ? renderPersonCard(item, key, column)
                : column.type === 'html' ? renderHtml(item, key)
                    : column.type === 'icon' ? renderIcon(item, key, column)
                        : renderDefault(item, key, column)) : (renderNoData(column))))))))))));
};
export default TableGridRender;
//# sourceMappingURL=TableGridRender.js.map