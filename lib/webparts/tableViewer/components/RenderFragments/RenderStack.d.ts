import { IColumnJSON, IColumnsConfig } from '../../../../helpers/Interfaces';
interface IRenderStackProps {
    item: any;
    column: IColumnJSON;
    allcolJSON: IColumnsConfig;
    maxBarValues: {
        [key: string]: number;
    };
}
export default function renderStack({ item, column, allcolJSON, maxBarValues }: IRenderStackProps): JSX.Element;
export {};
//# sourceMappingURL=RenderStack.d.ts.map