import * as React from 'react';
import styles from './TableViewer.module.scss';
import { numberFormat } from '../../../helpers/Utilities';
import { IColumnJSON } from '../../../helpers/Interfaces';

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
            <div key={key} className={styles.tableHeaderCell}>
              {column.total ? (
                <span>{numberFormat(itemTotals[key], column.format)}</span>
              ) : (
                <span>&nbsp;</span>
              )}
            </div>
          )
      )}
      <div className={styles.tableHeaderCell}> &nbsp; </div>
    </div>
  );
}

