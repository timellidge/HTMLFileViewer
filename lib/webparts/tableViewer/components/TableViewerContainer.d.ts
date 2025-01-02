import * as React from 'react';
import { DisplayMode } from '@microsoft/sp-core-library';
import { IReadonlyTheme } from '@microsoft/sp-component-base';
import { IColumn } from '@fluentui/react/lib/DetailsList';
import { IColumnConfig, ITabData, ITabDataDetail } from '../../../helpers/Interfaces';
interface IExtendedColumn extends IColumn {
    columnType: 'string' | 'number';
}
export interface ITableViewerContainerProps {
    JSONCode: string;
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
    columnsArray: IExtendedColumn[];
    tabs: string[];
    tabCounts: {
        [key: string]: number;
    };
    tabData: ITabData;
    NewJSON: IColumnConfig;
}
declare class TableViewerContainer extends React.Component<ITableViewerContainerProps, ITableViewerContainerState> {
    constructor(props: ITableViewerContainerProps);
    componentDidMount(): Promise<void>;
    getFilterValues(items: any[], columnName: string): ITabDataDetail;
    getItems(): Promise<void>;
    parseColumns(): Promise<void>;
    handleSearch(event: React.ChangeEvent<HTMLInputElement>): void;
    handleTabChange(fieldName: string, tab: string): void;
    private _containerClass;
    render(): JSX.Element;
}
export default TableViewerContainer;
//# sourceMappingURL=TableViewerContainer.d.ts.map