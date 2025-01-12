import * as React from 'react';
import { useState, useEffect } from 'react'; 
import { IColumnJSON, IColumnsConfig } from '../../../helpers/Interfaces'; // Ensure this import is correct
import styles from './TableViewer.module.scss';
import { mergeStyles } from '@fluentui/react';
import * as _ from 'lodash';
import { Icon } from '@fluentui/react/lib/Icon';
import PersonCard from './TabsRender/PersonCard';
import { DateTime } from 'luxon';

interface ITableGridRenderProps {

  colJSON: IColumnsConfig;
  items: any[];

}

const TableGridRender: React.FunctionComponent<ITableGridRenderProps> = ({ colJSON, items }) => {

  //we can only have one column sorted at a time so i need to know its name and its state
  const [sortField, setSortField] = useState<{ key: string; direction: boolean | null }>({ key: '', direction: null });
  const [sortedItems, setSortedItems] = useState<any[]>(items);

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


  useEffect(() => {
    if (sortField.key) {
      const sorted = [...items].sort((a, b) => {
        const aValue = a[sortField.key].rawValue;
        const bValue = b[sortField.key].rawValue;
  
        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;
        //see if they are numbers even though they have a string type
        const aNumber = parseFloat(aValue);
        const bNumber = parseFloat(bValue);
  
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          if (!isNaN(aNumber) && !isNaN(bNumber)) {
            return sortField.direction ? aNumber - bNumber : bNumber - aNumber;
          } else {  
            return sortField.direction ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
          }
        } else {
          if (DateTime.isDateTime(aValue) && DateTime.isDateTime(bValue))  {
            return sortField.direction ? aValue.toMillis() - bValue.toMillis() : bValue.toMillis() - aValue.toMillis();
          } else {
              return 0;
          }
        }
      });
      setSortedItems(sorted);
    } else {
      setSortedItems(items);
    }
  }, [sortField, items]);

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
      {sortedItems.map((item, itemIndex) => (
        <div key={itemIndex} className={_GridStyle}>
          {_sortedColumns.map(({ key, column }) => (
            column.width > "0" && (
              <div  key={`${itemIndex}-${key}`} className={`${styles.tableCell} ${column.class ? column.class : ''}`} >
                {column.type === 'person' ? (
                  <PersonCard email={item[key].rawValue[0].email} name={item[key].rawValue[0].name} title={item[key].rawValue[0].title} format={column.format}/>
                ) : (
                  item[key].displayValue
                )}
              </div>
            )
          ))}
        </div>
      ))}
    </>
  );
};

export default TableGridRender;