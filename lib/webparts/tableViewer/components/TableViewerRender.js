import * as React from 'react';
import { DetailsList, SelectionMode, DetailsListLayoutMode, ConstrainMode } from '@fluentui/react';
const TableViewerRender = ({ items, columns, showFind }) => {
    const [sortedItems, setSortedItems] = React.useState(items);
    const [sortedColumns, setSortedColumns] = React.useState(columns);
    const listRef = React.useRef(null);
    React.useEffect(() => {
        setSortedItems(items);
    }, [items]);
    React.useEffect(() => {
        setSortedColumns(columns);
    }, [columns]);
    const onRenderItemColumn = (item, index, column) => {
        const fieldContent = item[column.fieldName];
        return React.createElement("span", null, fieldContent);
    };
    const onColumnClick = (ev, column) => {
        // Toggle sort direction and sort items
        const newColumns = sortedColumns.map((col) => {
            if (col.key === column.key) {
                col.isSorted = true;
                col.isSortedDescending = !col.isSortedDescending;
            }
            else {
                col.isSorted = false;
                col.isSortedDescending = false;
            }
            return col;
        });
        // Sort the items
        const newSortedItems = sortItems(sortedItems, column.key, column.isSortedDescending, column.columnType);
        // Update state with new sorted items and columns
        setSortedItems(newSortedItems);
        setSortedColumns(newColumns);
    };
    const sortItems = (items, fieldName, isSortedDescending, columnType) => {
        const sortedItems = items.slice().sort((a, b) => {
            let aValue = a[fieldName];
            let bValue = b[fieldName];
            // Handle number sorting
            if (columnType === 'number') {
                aValue = parseFloat(aValue);
                bValue = parseFloat(bValue);
                if (isNaN(aValue))
                    aValue = 0; // Handle NaN values
                if (isNaN(bValue))
                    bValue = 0;
                return isSortedDescending
                    ? bValue - aValue // Descending
                    : aValue - bValue; // Ascending
            }
            // Handle string sorting (default case)
            if (aValue < bValue)
                return isSortedDescending ? 1 : -1;
            if (aValue > bValue)
                return isSortedDescending ? -1 : 1;
            return 0;
        });
        return sortedItems;
    };
    return (React.createElement("div", { ref: listRef, style: { width: '100%' } },
        React.createElement(DetailsList, { items: sortedItems, columns: sortedColumns.map((col) => (Object.assign(Object.assign({}, col), { onColumnClick: onColumnClick }))), selectionMode: SelectionMode.none, setKey: "set", layoutMode: DetailsListLayoutMode.justified, selectionPreservedOnEmptyClick: true, onRenderItemColumn: onRenderItemColumn, constrainMode: ConstrainMode.unconstrained })));
};
export default TableViewerRender;
//# sourceMappingURL=TableViewerRender.js.map