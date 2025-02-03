import * as React from 'react';
import styles from './TableViewer.module.scss';
import { IColumnJSON } from '../../../helpers/Interfaces'; // Ensure this import is correct

interface IRenderNumberProps {
  item: any;
  field: string;
  column: IColumnJSON;
  shouldMerge: boolean;
}

export default function renderNumber({ item, field, column, shouldMerge }: IRenderNumberProps) {
  if (shouldMerge) {
    return <span>&nbsp;</span>;
  }

  return (
    <div className={styles.numberCell}>
      {column.prefix && <span>{column.prefix}</span>}
      {item[field].displayValue}
      {column.suffix && <span>{column.suffix}</span>}
    </div>
  );
}