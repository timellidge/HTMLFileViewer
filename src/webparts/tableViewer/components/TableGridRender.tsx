import * as React from 'react';
import { useState } from 'react'; 
import { IColumnJSON, IColumnsConfig } from '../../../helpers/Interfaces'; // Ensure this import is correct
import styles from './TableViewer.module.scss';
import { mergeStyles } from '@fluentui/react';
import * as _ from 'lodash';
import { Icon } from '@fluentui/react/lib/Icon';

interface ITableGridRenderProps {

  colJSON: IColumnsConfig;
  items: any[];

}

const TableGridRender: React.FunctionComponent<ITableGridRenderProps> = ({ colJSON, items }) => {

  //we can only have one column sorted at a time so i need to know its name and its state
  const [sortField, setSortField] = useState<{ key: string; direction: boolean | null }>({ key: '', direction: null });

  const _sortedColumns = Object.keys(colJSON)
  .map((key) => ({ key, column: colJSON[key] }))
  .sort((a, b) => (a.column.sequence || 99) - (b.column.sequence || 99));


  // we ccan use the width directly from the column definition to set the grid template columns for the table
  const _columnWidths = _sortedColumns.map(({ column }) => column.width || '').join(' ');
  const _GridStyle = mergeStyles(styles.tableGrid, {gridTemplateColumns: _columnWidths});
  console.log(">>> grid info", _columnWidths, _GridStyle);

  // this function will toggle the sort state of a column (just one a time)
  const handleSortToggle = (columnKey: string) => {
    setSortField((prevState) => ({
      key: columnKey,
      direction: prevState.key === columnKey ? !prevState.direction : true,
    }));
  };

   return (
    <>
      <div className={_GridStyle}>
        {_sortedColumns.map(({ key, column }) => (
          column.width > "0" && (
            <div key={key} className={styles.tableHeaderCell}>
              <span> {column.name}</span>
              {column.isSortable && ( <Icon
               iconName={
                sortField.key !== key
                  ? 'Sort'
                  : sortField.direction
                  ? 'SortDown'
                  : 'SortUp'
              }
            
              className={styles.sortIcon}
              onClick={() => handleSortToggle(key)}/>
            )}
            </div>
          )
        ))}
      </div>
      {items.map((item, itemIndex) => (
        <div key={itemIndex} className={_GridStyle}>
          {_sortedColumns.map(({ key, column }) => (
            column.width > "0" && (
              <div  key={`${itemIndex}-${key}`} className={`${styles.tableCell} ${column.class ? column.class : ''}`} >
                <span className= {styles.tableDataContent} style={{ WebkitLineClamp: column.lines, lineClamp: column.lines }}> {item[key]} </span> 
              </div>
            )
          ))}
        </div>
      ))}
    </>
  );
};

export default TableGridRender;