import * as React from 'react';
import { Stack } from '@fluentui/react/lib/Stack';
const TableViewer = ({ children }) => (React.createElement(Stack, { horizontalAlign: "start" }, React.Children.map(children, (child) => child)));
export default TableViewer;
//# sourceMappingURL=TableViewer.js.map