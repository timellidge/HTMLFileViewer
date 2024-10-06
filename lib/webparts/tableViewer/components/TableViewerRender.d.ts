import * as React from 'react';
import { IColumn } from '@fluentui/react/lib/DetailsList';
interface IExtendedColumn extends IColumn {
    columnType: 'string' | 'number';
}
interface ITableViewerRenderProps {
    columns: IExtendedColumn[];
    items: any[];
    onScrollEnd?: () => void;
    showFind: boolean;
    contentHeight: string;
}
interface ITableViewerRenderState {
    sortedItems: any[];
    columns: IExtendedColumn[];
    showFind: boolean;
}
declare class TableViewerRender extends React.Component<ITableViewerRenderProps, ITableViewerRenderState> {
    private listRef;
    constructor(props: ITableViewerRenderProps);
    componentDidUpdate(prevProps: ITableViewerRenderProps): void;
    componentDidMount(): void;
    componentWillUnmount(): void;
    handleScroll: () => void;
    onRenderItemColumn: (item: any, index: number, column: IColumn) => JSX.Element;
    private onColumnClick;
    private sortItems;
    render(): JSX.Element;
}
export default TableViewerRender;
//# sourceMappingURL=TableViewerRender.d.ts.map