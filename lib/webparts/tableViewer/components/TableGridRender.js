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
    // we ccan use the width directly from the column definition to set the grid template columns for the table
    const _columnWidths = _sortedColumns.map(({ column }) => column.width || '').join(' ');
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
                const aNumber = parseFloat(aValue);
                const bNumber = parseFloat(bValue);
                if (!isNaN(aNumber) && !isNaN(bNumber)) {
                    return sortField.direction ? aNumber - bNumber : bNumber - aNumber;
                }
                else if (typeof aValue === 'string' && typeof bValue === 'string') {
                    return sortField.direction ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
                }
                else if (DateTime.isDateTime(aValue) && DateTime.isDateTime(bValue)) {
                    return sortField.direction ? aValue.toMillis() - bValue.toMillis() : bValue.toMillis() - aValue.toMillis();
                }
                else {
                    return 0;
                }
            });
            setSortedItems(sorted);
        }
        else {
            setSortedItems(items);
        }
    }, [sortField, items]);
    return (React.createElement(React.Fragment, null,
        React.createElement("div", { className: _GridStyle }, _sortedColumns.map(({ key, column }) => (column.width > "0" && (React.createElement("div", { key: key, className: styles.tableHeaderCell },
            React.createElement("span", null,
                " ",
                column.name),
            column.isSortable && (React.createElement(Icon, { iconName: sortField.key !== key
                    ? 'Sort'
                    : sortField.direction
                        ? 'SortDown'
                        : 'SortUp', className: styles.sortIcon, onClick: () => handleSortToggle(key) }))))))),
        sortedItems.map((item, itemIndex) => (React.createElement("div", { key: itemIndex, className: _GridStyle }, _sortedColumns.map(({ key, column }) => (column.width > "0" && (React.createElement("div", { key: `${itemIndex}-${key}`, className: `${styles.tableCell} ${column.class ? column.class : ''}` }, column.type === 'person' ? (React.createElement(PersonCard, { email: item[key].rawValue[0].email, name: item[key].rawValue[0].name, title: item[key].rawValue[0].title, format: column.format })) : (item[key].displayValue))))))))));
};
export default TableGridRender;
//# sourceMappingURL=TableGridRender.js.map