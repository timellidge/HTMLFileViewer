import * as React from 'react';
import { DetailsList, IColumn, SelectionMode, DetailsListLayoutMode, ConstrainMode } from '@fluentui/react';
import { IExtendedColumn } from '../../../helpers/Interfaces'; // Ensure this import is correct

interface ITableViewerRenderProps {
  items: any[];
  columns: any[];
  showFind: boolean;
}

const TableViewerRender: React.FunctionComponent<ITableViewerRenderProps> = ({ items, columns, showFind }) => {
  const [sortedItems, setSortedItems] = React.useState(items);
  const [sortedColumns, setSortedColumns] = React.useState(columns);
  const listRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setSortedItems(items);
  }, [items]);

  React.useEffect(() => {
    setSortedColumns(columns);
  }, [columns]);

  const onRenderItemColumn = (item: any, index: number, column: IColumn) => {
    const fieldContent = item[column.fieldName as keyof any] as string;
    return <span>{fieldContent}</span>;
  };

  const onColumnClick = (ev: React.MouseEvent<HTMLElement>, column: IExtendedColumn): void => {
    // Toggle sort direction and sort items
    const newColumns = sortedColumns.map((col : any) => {
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
    const newSortedItems = sortItems(sortedItems, column.key!, column.isSortedDescending, column.columnType);

    // Update state with new sorted items and columns
    setSortedItems(newSortedItems);
    setSortedColumns(newColumns);
  };

  const sortItems = (items: any[], fieldName: string, isSortedDescending: boolean, columnType: string): any[] => {
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
  };

  return (
    <div ref={listRef} style={{ width: '100%' }}>
      <DetailsList
        items={sortedItems}
        columns={sortedColumns.map((col: any) => ({
          ...col,
          onColumnClick: onColumnClick, // Attach column click handler
        }))}
        selectionMode={SelectionMode.none}
        setKey="set"
        layoutMode={DetailsListLayoutMode.justified}
        selectionPreservedOnEmptyClick={true}
        onRenderItemColumn={onRenderItemColumn}
        constrainMode={ConstrainMode.unconstrained}
      />
    </div>
  );
};

export default TableViewerRender;