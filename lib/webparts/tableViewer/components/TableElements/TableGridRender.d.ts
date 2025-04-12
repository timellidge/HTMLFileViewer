import * as React from 'react';
import { IColumnsConfig } from '../../../../helpers/Interfaces';
interface ITableGridRenderProps {
    listUrl: string;
    colJSON: IColumnsConfig;
    items: any[];
    contentHeight: string;
    maxBarValues?: {
        [key: string]: number;
    };
    height: number | 800;
}
declare const TableGridRender: React.FunctionComponent<ITableGridRenderProps>;
export default TableGridRender;
//# sourceMappingURL=TableGridRender.d.ts.map