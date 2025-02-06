import * as React from 'react';
import styles from '../TableViewer.module.scss';
import { IColumnJSON } from '../../../../helpers/Interfaces'; // Ensure this import is correct

interface IRenderMultiChoiceProps {
  item: any;
  field: string;
  column: IColumnJSON;
  shouldMerge: boolean;
}

export default function renderMultiChoice({ item, field, column, shouldMerge }: IRenderMultiChoiceProps) {
  if (shouldMerge) {
    return <span>&nbsp;</span>;
  }

  const content = item[field].displayValue;
  if (!content) {
    return <span>&nbsp;</span>;
  }

  const rawValue = item[field].rawValue;
  return column.isMultiline ? (
    <div className={styles.tableDataContent}>
        {rawValue.map((entry:string, index:number) => (
          <div key={index}>
            {column.prefix && <span>{column.prefix}</span>}
            {entry}
            {column.suffix && <span>{column.suffix}</span>}
          </div>
        ))}
    </div>
  ) : (
    <div className={styles.tableDataContent}>
      {column.prefix && <span>{column.prefix}</span>}
      {content}
      {column.suffix && <span>{column.suffix}</span>}
    </div>
  );
}