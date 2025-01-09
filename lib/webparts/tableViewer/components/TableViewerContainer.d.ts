import * as React from 'react';
import { DisplayMode } from '@microsoft/sp-core-library';
import { IReadonlyTheme } from '@microsoft/sp-component-base';
export interface ITableViewerContainerProps {
    JSONCode: string;
    webPartCSS: string;
    siteUrl: string;
    listId: string;
    viewXmlCode: string;
    title: string;
    displayMode: DisplayMode;
    updateProperty: (value: string) => void;
    showTitle: boolean;
    showFind: boolean;
    hideErrorEmpty: boolean;
    themeVariant: IReadonlyTheme | undefined;
    contentHeight: string;
    configured: boolean;
    onConfigure(): void;
    contextSiteUrl: string;
    contextUser: string;
    webPartTag: string;
}
declare const TableViewerContainer: React.FunctionComponent<ITableViewerContainerProps>;
export default TableViewerContainer;
//# sourceMappingURL=TableViewerContainer.d.ts.map