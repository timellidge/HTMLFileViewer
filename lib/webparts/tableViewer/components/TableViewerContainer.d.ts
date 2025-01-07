import * as React from 'react';
import { DisplayMode } from '@microsoft/sp-core-library';
import { IReadonlyTheme } from '@microsoft/sp-component-base';
import { IColumnsConfig, ITabData, ITabDataDetail } from '../../../helpers/Interfaces';
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
export interface ITableViewerContainerState {
    items: any[];
    filteredItems: any[];
    updatedItems: any[];
    searchQuery: string;
    lastNextHref: string;
    globalError: any | null;
    webPartTag: string;
    contentHeight: string;
    selectedTab: string | null;
    selectedChoiceFieldName: string | null;
    tabs: string[];
    tabCounts: {
        [key: string]: number;
    };
    tabData: ITabData;
    ColumnsJSON: IColumnsConfig;
    webPartCSS: string;
}
declare class TableViewerContainer extends React.Component<ITableViewerContainerProps, ITableViewerContainerState> {
    constructor(props: ITableViewerContainerProps);
    componentDidMount(): Promise<void>;
    getFilterValues(items: any[], columnName: string): ITabDataDetail;
    getItems(): Promise<void>;
    parseJSON(): Promise<void>;
    handleSearch(event: React.ChangeEvent<HTMLInputElement>): void;
    handleTabChange(fieldName: string, tab: string): void;
    private _containerClass;
    render(): JSX.Element;
}
export default TableViewerContainer;
//# sourceMappingURL=TableViewerContainer.d.ts.map