import * as React from 'react';
import { Stack, StackItem } from '@fluentui/react/lib/Stack';

export interface ITableViewerHeaderProps {
  className?: string;
  children?: React.ReactNode[];
}
// what the fuck is this? NO COMMENTS and i think poorly named !!!
const TableViewerHeader: React.FunctionComponent<ITableViewerHeaderProps> = ({ children }) => (
  <Stack
    horizontal
    disableShrink
    horizontalAlign="space-between"
    verticalAlign="start"
    style={{ width: '100%' }}
  >
    <StackItem align="start">{children && children[0]}</StackItem>
    <StackItem align="end">{children && children[1]}</StackItem>
  </Stack>
);

export default TableViewerHeader;
