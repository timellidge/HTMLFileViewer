import * as React from 'react';
import {
  DetailsList,
  IColumn,
  DetailsListLayoutMode,
  ConstrainMode,
  SelectionMode,
} from '@fluentui/react/lib/DetailsList';
interface IExtendedColumn extends IColumn {
  columnType: 'string' | 'number'; 
}
interface ITableViewerRenderProps {
  columns: IExtendedColumn[];
  items: any[];
  onScrollEnd?: () => void; // Add a new prop for handling scroll end
  showFind: boolean;
  contentHeight: string;
}

interface ITableViewerRenderState {
  sortedItems: any[]; 
  columns: IExtendedColumn[];
  showFind:boolean;
  
}

class TableViewerRender extends React.Component<ITableViewerRenderProps, ITableViewerRenderState> {
  private listRef = React.createRef<HTMLDivElement>();
  constructor(props: ITableViewerRenderProps) {
    super(props);

    this.state = {
      sortedItems: this.props.items,
      columns: this.props.columns, // Initial columns passed from parent
      showFind:this.props.showFind
    };

    this.listRef = React.createRef<HTMLDivElement>();
  }
 // Lifecycle method to handle prop changes
 componentDidUpdate(prevProps: ITableViewerRenderProps) {
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

  handleScroll = () => {
    const listDiv = this.listRef.current;
    if (listDiv) {
      const { scrollTop, scrollHeight, clientHeight } = listDiv;
      if (scrollTop + clientHeight >= scrollHeight - 10) {
        // Call onScrollEnd if defined and we're near the bottom
        if (this.props.onScrollEnd) this.props.onScrollEnd();
      }
    }
  };

  onRenderItemColumn = (item: any, index: number, column: IColumn) => {
    const fieldContent = item[column.fieldName as keyof any] as string;
    return <span>{fieldContent}</span>;
  };
  private onColumnClick = (ev: React.MouseEvent<HTMLElement>, column: IExtendedColumn): void => {
    const { items,columns } = this.props;

    // Toggle sort direction and sort items
    const newColumns = this.props.columns.map((col) => {
      if (col.key === column.key) {
        col.isSorted = true;
        col.isSortedDescending = !col.isSortedDescending;
      } else {
        col.isSorted = false;
        col.isSortedDescending = false;
      }
      return col;
    });
  
    // Sort the items
    const newSortedItems = this.sortItems(items, column.key!, column.isSortedDescending, column.columnType);
  
    // Update state with new sorted items and columns
    this.setState({
      sortedItems: newSortedItems,
      columns: newColumns,
    });
  };
  
 // Function to sort items based on column type and sort order
 private sortItems(items: any[], fieldName: string, isSortedDescending: boolean, columnType: string): any[] {
  const sortedItems = items.slice().sort((a, b) => {
    let aValue = a[fieldName];
    let bValue = b[fieldName];

    // Handle number sorting
    if (columnType === 'number') {
      aValue = parseFloat(aValue);
      bValue = parseFloat(bValue);

      if (isNaN(aValue)) aValue = 0; // Handle NaN values
      if (isNaN(bValue)) bValue = 0;

      return isSortedDescending 
        ? bValue - aValue // Descending
        : aValue - bValue; // Ascending
    }
  

    // Handle string sorting (default case)
    if (aValue < bValue) return isSortedDescending ? 1 : -1;
    if (aValue > bValue) return isSortedDescending ? -1 : 1;
    return 0;
  });

  return sortedItems;
}

  render() {
    const { columns } = this.props;
    const { sortedItems } = this.state;

    return (
      <div ref={this.listRef} style={{ width: '100%'}}>
        <DetailsList
          items={sortedItems}
          columns={columns.map((col) => ({
            ...col,
            onColumnClick: this.onColumnClick, // Attach column click handler
          }))}
          selectionMode={SelectionMode.none}
          setKey="set"
          layoutMode={DetailsListLayoutMode.justified}
          selectionPreservedOnEmptyClick={true}
          onRenderItemColumn={this.onRenderItemColumn}
          constrainMode={ConstrainMode.unconstrained}
        />
      </div>
    );
  }
}

export default TableViewerRender;