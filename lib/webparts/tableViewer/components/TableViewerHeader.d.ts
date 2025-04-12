import * as React from 'react';
export interface ITableViewerHeaderProps {
    displayMode: any;
    title: string;
    updateProperty: (value: string) => void;
    showTitle: boolean;
    showFind: boolean;
    searchQuery: string;
    handleSearch: (event: React.ChangeEvent<HTMLInputElement>) => void;
}
declare const TableViewerHeader: React.FunctionComponent<ITableViewerHeaderProps>;
export default TableViewerHeader;
//# sourceMappingURL=TableViewerHeader.d.ts.map