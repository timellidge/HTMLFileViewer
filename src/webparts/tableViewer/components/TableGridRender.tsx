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


  // we can use the width directly from the column definition to set the grid template columns for the table but dont include the "" ones as they are hidden
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
    {/* DRAW THE HEADER BAR with the column names and the sort icons? */}
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
  
        {/* now spaff out the cells  they shoud just atack into the grid there are three pain types, string(number, string & Date) Person  and Stack */}
        {sortedItems.map((item, itemIndex) => (
        <React.Fragment key={itemIndex}>
          {_sortedColumns.map(({ key, column }) => (
            column.width > "0" && (
              <div key={`${itemIndex}-${key}`} className={`${styles.tableCell} ${column.class ? column.class : ''}`}>
              {item[key] ? (
                column.type === 'person' ? (
                  <PersonCard
                    email={item[key].rawValue[0].email}
                    name={item[key].rawValue[0].name}
                    title={item[key].rawValue[0].title}
                    format={column.format}
                  />
                ) : column.type === 'stack' ? (
                  <div>
                    {column.fields.map((field, fieldIndex) => (
                      item[field] ? (
                        <div className={`stack ${field}`} key={fieldIndex}>{item[field].displayValue}</div>
                      ) : (
                        <div className={`stack ${field}`} key={fieldIndex}>&nbsp;</div>
                      )
                    ))}
                  </div>
                ) : column.type === 'html' ? (
                <div dangerouslySetInnerHTML={{ __html: item[key].displayValue }} />
                ) : (
                item[key].displayValue
                )
              ) : (
                column.type === 'stack' ? (
                  <div>
                    {column.fields.map((field, fieldIndex) => (
                      item[field] ? (
                        <div key={fieldIndex} className={`stack ${field}`}>{item[field].displayValue}</div>
                      ) : (
                        <div key={fieldIndex} className={`stack ${field}`}>No Data</div>
                      )
                    ))}
                  </div>
                ) : (
                  <span>No Data</span>
                )
              )}
            </div>
            )
          ))}
        </React.Fragment>
      ))}
      </div>
    </>
  );
};

export default TableGridRender;