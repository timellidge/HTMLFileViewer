import { IColumnJSON } from '../../../../helpers/Interfaces';
interface ITableGridHeaderProps {
    _sortedColumns: {
        key: string;
        column: IColumnJSON;
    }[];
    sortField: {
        key: string;
        direction: boolean;
    };
    handleSortToggle: (key: string) => void;
    _headStyle: string;
}
export default function TableGridFooter({ _sortedColumns, sortField, handleSortToggle, _headStyle }: ITableGridHeaderProps): JSX.Element;
export {};
//# sourceMappingURL=TableGridHeader.d.ts.map