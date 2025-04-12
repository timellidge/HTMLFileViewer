import * as React from 'react';
import styles from '../TableViewer.module.scss';
import { numberFormat } from '../../../../helpers/Utilities';
import { IColumnJSON } from '../../../../helpers/Interfaces';

interface ITableGridFooterProps {
  _sortedColumns:{ key: string; column: IColumnJSON }[];   
  itemTotals: { [key: string]: number }     
  _footStyle: string;
    
}

export default function TableGridFooter({  _sortedColumns, itemTotals, _footStyle }:ITableGridFooterProps) {


  return (
    <div className={_footStyle}>
      {_sortedColumns.map(
        ({ key, column }) =>
          column.width > "0" && (
            <div key={key} className={styles.tableFooterCell}>
              {column.showTotal ? (
                <span>{numberFormat(isNaN(itemTotals[key]) ? 0 : itemTotals[key], column.format)}</span>
              ) : (
                <span>&nbsp;</span>
              )}
            </div>
          )
      )}
      <div className={styles.tableFooterCell}> &nbsp; </div>
    </div>
  );
}

