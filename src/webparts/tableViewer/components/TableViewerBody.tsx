
import * as React from 'react';
import { Stack } from '@fluentui/react/lib/Stack';

export interface ITableViewerBodyProps {
  className?: string;
  children?: React.ReactNode;
}

const TableViewerBody: React.FunctionComponent<ITableViewerBodyProps> = ({ children }) => (
  <Stack>{children}</Stack>
);

export default TableViewerBody;