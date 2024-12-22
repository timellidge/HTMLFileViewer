import * as React from 'react';
import { Stack, StackItem } from '@fluentui/react/lib/Stack';
// what the fuck is this? NO COMMENTS and i think poorly named !!!
const TableViewerHeader = ({ children }) => (React.createElement(Stack, { horizontal: true, disableShrink: true, horizontalAlign: "space-between", verticalAlign: "start", style: { width: '100%' } },
    React.createElement(StackItem, { align: "start" }, children && children[0]),
    React.createElement(StackItem, { align: "end" }, children && children[1])));
export default TableViewerHeader;
//# sourceMappingURL=TableViewerHeader.js.map