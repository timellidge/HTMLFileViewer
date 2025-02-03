import * as React from 'react';
import styles from './TableViewer.module.scss';
import { IColumnJSON } from '../../../helpers/Interfaces'; // Ensure this import is correct

interface IRenderDefaultProps {
  item: any;
  field: string;
  column: IColumnJSON;
  shouldMerge: boolean;
}

export default function renderDefault({ item, field, column, shouldMerge }: IRenderDefaultProps) {
  if (shouldMerge) {
    return <span>&nbsp;</span>;
  }

  const content = item[field].displayValue;
  if (!content) {
    return <span>&nbsp;</span>;
  }

  return column.lines ? (
    <div
      className={styles.tableDataContent}
      style={{ WebkitLineClamp: column.lines, lineClamp: column.lines }}
    >
      {column.prefix && <span>{column.prefix}</span>}
      {content}
      {column.suffix && <span>{column.suffix}</span>}
    </div>
  ) : (
    <>
      {column.prefix && <span>{column.prefix}</span>}
      {content}
      {column.suffix && <span>{column.suffix}</span>}
    </>
  );
}