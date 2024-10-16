import * as React from 'react';
import { DetailsList, DetailsListLayoutMode, ConstrainMode, SelectionMode, } from '@fluentui/react/lib/DetailsList';
class TableViewerRender extends React.Component {
    constructor(props) {
        super(props);
        this.listRef = React.createRef();
        this.handleScroll = () => {
            const listDiv = this.listRef.current;
            if (listDiv) {
                const { scrollTop, scrollHeight, clientHeight } = listDiv;
                if (scrollTop + clientHeight >= scrollHeight - 10) {
                    // Call onScrollEnd if defined and we're near the bottom
                    if (this.props.onScrollEnd)
                        this.props.onScrollEnd();
                }
            }
        };
        this.onRenderItemColumn = (item, index, column) => {
            const fieldContent = item[column.fieldName];
            return React.createElement("span", null, fieldContent);
        };
        this.onColumnClick = (ev, column) => {
            const { items, columns } = this.props;
            // Toggle sort direction and sort items
            const newColumns = this.props.columns.map((col) => {
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
            const newSortedItems = this.sortItems(items, column.key, column.isSortedDescending, column.columnType);
            // Update state with new sorted items and columns
            this.setState({
                sortedItems: newSortedItems,
                columns: newColumns,
            });
        };
        this.state = {
            sortedItems: this.props.items,
            columns: this.props.columns,
            showFind: this.props.showFind
        };
        this.listRef = React.createRef();
    }
    // Lifecycle method to handle prop changes
    componentDidUpdate(prevProps) {
        // Check if the items prop has changed
        if (prevProps.items !== this.props.items) {
            // Sync state with new items if props changed
            this.setState({
                sortedItems: this.props.items
            });
        }
    }
    componentDidMount() {
        const listDiv = this.listRef.current;
        if (listDiv) {
            listDiv.addEventListener('scroll', this.handleScroll);
        }
    }
    componentWillUnmount() {
        const listDiv = this.listRef.current;
        if (listDiv) {
            listDiv.removeEventListener('scroll', this.handleScroll);
        }
    }
    // Function to sort items based on column type and sort order
    sortItems(items, fieldName, isSortedDescending, columnType) {
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
    }
    render() {
        const { columns } = this.props;
        const { sortedItems } = this.state;
        return (React.createElement("div", { ref: this.listRef, style: { width: '100%' } },
            React.createElement(DetailsList, { items: sortedItems, columns: columns.map((col) => (Object.assign(Object.assign({}, col), { onColumnClick: this.onColumnClick }))), selectionMode: SelectionMode.none, setKey: "set", layoutMode: DetailsListLayoutMode.justified, selectionPreservedOnEmptyClick: true, onRenderItemColumn: this.onRenderItemColumn, constrainMode: ConstrainMode.unconstrained })));
    }
}
export default TableViewerRender;
//# sourceMappingURL=TableViewerRender.js.map