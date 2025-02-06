import * as React from 'react';
import { Icon } from '@fluentui/react/lib/Icon';
import styles from '../TableViewer.module.scss';
import { IColumnJSON } from '../../../../helpers/Interfaces';


interface ITableGridHeaderProps {
  _sortedColumns:{ key: string; column: IColumnJSON }[];  
  sortField: { key: string; direction: boolean }; 
  handleSortToggle: (key: string) => void;    
  _headStyle: string;  
}

export default function TableGridFooter({ _sortedColumns, sortField, handleSortToggle, _headStyle }:ITableGridHeaderProps) {
  return (
    <div className={_headStyle}>
      {_sortedColumns.map(
        ({ key, column }) =>
          column.width > "0" && (
            <div key={key} className={styles.tableHeaderCell}>
              <span>{column.name}</span>
              {column.isSortable && (
                <Icon
                  iconName={
                    sortField.key !== key
                      ? "Sort"
                      : sortField.direction
                      ? "SortDown"
                      : "SortUp"
                  }
                  className={styles.sortIcon}
                  onClick={() => handleSortToggle(key)}
                />
              )}
            </div>
          )
      )}
      <div className={styles.tableHeaderCell}> &nbsp; </div>
    </div>
  );
}


