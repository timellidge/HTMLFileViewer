import * as React from 'react';
import { useState, useEffect } from 'react'; 
import { IColumnsConfig, IColumnJSON } from '../../../helpers/Interfaces'; // Ensure this import is correct
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
  const _columnWidths = _sortedColumns
  .filter(({ column }) => column.width !== '')
  .map(({ column }) => column.width)
  .join(' ');
  const _GridStyle = mergeStyles(styles.tableGrid, {gridTemplateColumns: _columnWidths});
  console.log(">>> grid info", _columnWidths, _GridStyle);

  // this function will toggle the sort state of a column (just one a time)
  const handleSortToggle = (columnKey: string) => {
    setSortField((prevState) => ({
      key: columnKey,
      direction: prevState.key === columnKey ? !prevState.direction : true,
    }));
  };

  const handleMouseEnter = (event:  React.MouseEvent<HTMLDivElement>) => {
    const row = event.currentTarget.getAttribute('data-row');
    const cellsInRow = document.querySelectorAll(`.${styles.tableCell}[data-row="${row}"]`);
    cellsInRow.forEach(cell => {
      cell.classList.add(styles.highlight);
    });
  };

  const handleMouseLeave = (event:  React.MouseEvent<HTMLDivElement>) => {
    const row = event.currentTarget.getAttribute('data-row');
    const cellsInRow = document.querySelectorAll(`.${styles.tableCell}[data-row="${row}"]`);
    cellsInRow.forEach(cell => {
      cell.classList.remove(styles.highlight);
    });
  };

  //=================================================================================================================
  // THE SORT USE EFFECT - THIS WILL SORT THE ITEMS BASED ON THE SORT FIELD, FIELD TYPE AND DIRECTION
  //=================================================================================================================

  useEffect(() => {
    if (sortField.key) {
      
      const sorted = [...items].sort((a, b) => {
        
        console.log(">>> sorting", sortField.key, "which is a ", colJSON[sortField.key].type, "in direction", sortField.direction);

        let aValue;
        let bValue;
        // dependign on the type we must source the data differently for sorting 
        if (colJSON[sortField.key].type == 'stack') {
          aValue = a[colJSON[sortField.key].fields[0]].displayValue;
          bValue = b[colJSON[sortField.key].fields[0]].displayValue;
        } else {
          if (colJSON[sortField.key].type === 'person' || colJSON[sortField.key].type === 'multichoice') {
            aValue = a[sortField.key].displayValue;
            bValue = b[sortField.key].displayValue;
          } else {
            // its a stack to treat the sort so that it sorts on the first field in the stack
            aValue = a[sortField.key].rawValue;
            bValue = b[sortField.key].rawValue;
          }
        }
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



  
   


  //=================================================================================================================
  // A LOAD OF RENDER FUNCTIONS TO SIMPLIFY THE RETURN LOGIC BY SPLITTING EACH TYPE OUT INTO A FUNCTION
  //=================================================================================================================
  const renderPersonCard = (item:any, key:any, column : IColumnJSON) => (
    <PersonCard
      email={item[key].rawValue[0].email}
      name={item[key].rawValue[0].name}
      title={item[key].rawValue[0].title}
      format={column.format}
    />
  );

// STACK OF FIELDS
  const renderStack = (item: any, column: IColumnJSON) => (
    <div>
      {column.fields.map((field:any, fieldIndex:number) => (
        item[field] ? (
          <div className={`stack ${field}`} key={fieldIndex}>{item[field].displayValue}</div>
        ) : (
          <div className={`stack ${field}`} key={fieldIndex}>&nbsp;</div>
        )
      ))}
    </div>
  );

 // HTML FIELD
  const renderHtml = (item: any, key: any) => (
    <div dangerouslySetInnerHTML={{ __html: item[key].displayValue }} />
  );

// DEFAULT RENDER FUNCTION WITH LINES CLAMP
  const renderDefault = (item: any, key: any, column : IColumnJSON) => (
    column.lines ? (
      <div className={styles.tableDataContent} style={{ WebkitLineClamp: column.lines, lineClamp: column.lines }}>
        {item[key].displayValue}
      </div>
    ) : (
      item[key].displayValue
    )
  );

  // NUMBER RENDER FUNCTION ALIGN 
  const renderNumber = (item: any, key: any) => (
      <div className={styles.numberCell} >{item[key].displayValue}</div>
  );

  // REnder a link
  const renderLink = (item: any, key: any) => (
    <a href={item[key].rawValue} className={styles.tableDataContent}>
      {item[key].displayValue}
   </a>
  );

  // ICON RENDER FUNCTION - ICONS ARE DEFINED IN THE COLUMN JSON
  const renderIcon = (item: any, key: any, column: IColumnJSON) => {
    const displayValue = item[key].displayValue;
    const iconData = column.icons[displayValue];
    if (iconData) {
      const [iconName, iconColor] = iconData.split('|');
      return <Icon iconName={iconName} style={{ color: iconColor }} title={displayValue}/>;
    } else {
      return displayValue;
    }
  };

  // CATCH ALL FOR NO DATA
  const renderNoData = (column : IColumnJSON) => (
    // even  though there is no field i still need to check if its a stack or not
    column.type === 'stack' ? (
      <div>
        {column.fields.map((field, fieldIndex) => (
          <div key={fieldIndex} className={`stack ${field}`}>No Data</div>
        ))}
      </div>
    ) : (
      <span>No Data</span>
    )
  );

  //=================================================================================================================
  // THE RETURN FUNCTION
  //=================================================================================================================
  return (
    <>
      {/* DRAW THE HEADER BAR with the column names and the sort icons? */}
      <div className={_GridStyle}>
        {_sortedColumns.map(({ key, column }) => (
          column.width > "0" && (
            <div key={key} className={styles.tableHeaderCell}>
              <span>{column.name}</span>
              {column.isSortable && (
                <Icon
                  iconName={
                    sortField.key !== key
                      ? 'Sort'
                      : sortField.direction
                      ? 'SortDown'
                      : 'SortUp'
                  }
                  className={styles.sortIcon}
                  onClick={() => handleSortToggle(key)}
                />
              )}
            </div>
          )
        ))}
   

        {/* Render the cells */}
        {sortedItems.map((item, itemIndex) => (
          <React.Fragment key={itemIndex}>
            {_sortedColumns.map(({ key, column }) => (
              column.width > "0" && (
                <div key={`${itemIndex}-${key}`} className={`${styles.tableCell} ${column.class ? column.class : ''}`}  
                data-row={item.ID.rawValue} 
                onMouseEnter={(event) => handleMouseEnter(event)}
                onMouseLeave={(event) => handleMouseLeave(event)}
                >
                  {column.type === 'stack' ? (
                    renderStack(item, column)
                  ) : item[key] ? (
                    column.type === 'person' ? renderPersonCard(item, key, column)
                    : column.type === 'html' ? renderHtml(item, key)
                    : column.type === 'icon' ? renderIcon(item, key, column)
                    : column.type === 'link' ? renderLink(item, key)
                    : column.type === 'number' ? renderNumber(item, key)
                    : renderDefault(item, key, column)
                  ) : (
                    renderNoData(column)
                  )}
                </div>
              )
            ))}
          </React.Fragment>
        ))}
      </div>
    </>
  );
}

export default TableGridRender;