import * as React from 'react';
import { Stack } from '@fluentui/react/lib/Stack';

interface ITableViewerProps {
  className?: string;
  children?: React.ReactNode;
}

const TableViewer: React.FunctionComponent<ITableViewerProps> = ({ children }) => (
  <Stack horizontalAlign="start">
    {React.Children.map(children, (child) => child)}
  </Stack>
);

export default TableViewer;