
import * as React from 'react';
import { Stack } from '@fluentui/react/lib/Stack';
import styles from './TableViewer.module.scss';

export interface ITableViewerBodyProps {
  className?: string;
  children?: React.ReactNode;
}

const TableViewerBody: React.FunctionComponent<ITableViewerBodyProps> = ({ children }) => (
  <Stack className = {styles.tableContainer}>{children}</Stack>
);

export default TableViewerBody;