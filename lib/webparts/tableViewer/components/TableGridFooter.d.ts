import { IColumnJSON } from '../../../helpers/Interfaces';
interface ITableGridFooterProps {
    _sortedColumns: {
        key: string;
        column: IColumnJSON;
    }[];
    itemTotals: {
        [key: string]: number;
    };
    _footStyle: string;
}
export default function TableGridFooter({ _sortedColumns, itemTotals, _footStyle }: ITableGridFooterProps): JSX.Element;
export {};
//# sourceMappingURL=TableGridFooter.d.ts.map