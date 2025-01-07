import * as React from 'react';
import { IColumnsConfig } from '../../../helpers/Interfaces'; // Ensure this import is correct
import styles from './TableViewer.module.scss';
import { mergeStyles } from '@fluentui/react';
import * as _ from 'lodash';

interface ITableGridRenderProps {

  colJSON: IColumnsConfig;
  items: any[];

}

const TableGridRender: React.FunctionComponent<ITableGridRenderProps> = ({ colJSON, items }) => {

  const _sortedColumns = Object.keys(colJSON)
  .map((key) => ({ key, column: colJSON[key] }))
  .sort((a, b) => (a.column.sequence || 99) - (b.column.sequence || 99));

 // const gridCellStyle = { display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis', WebkitLineClamp: 3 };

  const _columnWidths = _sortedColumns.map(({ column }) => column.width || '').join(' ');
  const _GridStyle = mergeStyles(styles.tableGrid, {gridTemplateColumns: _columnWidths});
  console.log(">>> grid info", _columnWidths, _GridStyle);

   return (
    <>
      <div className={_GridStyle}>
        {_sortedColumns.map(({ key, column }) => (
          <div key={key} className={styles.tableHeaderCell}>
            {column.name}
          </div>
        ))}
      </div>
      {items.map((item, itemIndex) => (
        <div key={itemIndex} className={_GridStyle}>
          {_sortedColumns.map(({ key, column }) => (
            column.width > "0" && (
              <div  key={`${itemIndex}-${key}`} className= {styles.tableCell}  >
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