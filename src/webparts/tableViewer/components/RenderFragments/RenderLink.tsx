import * as React from 'react';
import styles from '../TableViewer.module.scss';
import { IColumnJSON } from '../../../../helpers/Interfaces'; // Ensure this import is correct

interface IRenderLinkProps {
  item: any;
  field: string;
  column: IColumnJSON;
}

export default function renderLink({ item, field, column }: IRenderLinkProps) {
  const link = item[field].rawValue;
  const displayText = item[field].displayValue;
  if (!link) {
    return null;
  }
  return (
    <div className={styles.tableDataContent}>
      {column.prefix && <span>{column.prefix}</span>}
      <a href={link}>{displayText}</a>
      {column.suffix && <span>{column.suffix}</span>}
    </div>
  );
}