/* eslint-disable implicit-arrow-linebreak */
import * as React from 'react';
import { DisplayMode } from '@microsoft/sp-core-library';
import { Placeholder } from '@pnp/spfx-controls-react/lib/Placeholder';
const TableViewerPlaceholder = ({ displayMode, onConfigure, }) => (React.createElement(Placeholder, { iconName: "Edit", iconText: "Configure your web part", description: "Please configure the web part.", buttonLabel: "Configure", hideButton: displayMode === DisplayMode.Read, onConfigure: onConfigure }));
export default TableViewerPlaceholder;
//# sourceMappingURL=TableViewerPlaceholder.js.map