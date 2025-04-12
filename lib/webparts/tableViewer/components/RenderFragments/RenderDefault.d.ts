import { IColumnJSON } from '../../../../helpers/Interfaces';
interface IRenderDefaultProps {
    item: any;
    field: string;
    column: IColumnJSON;
    shouldMerge: boolean;
}
export default function renderDefault({ item, field, column, shouldMerge }: IRenderDefaultProps): JSX.Element;
export {};
//# sourceMappingURL=RenderDefault.d.ts.map