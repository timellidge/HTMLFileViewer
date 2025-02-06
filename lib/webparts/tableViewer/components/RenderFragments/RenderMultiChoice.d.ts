import { IColumnJSON } from '../../../../helpers/Interfaces';
interface IRenderMultiChoiceProps {
    item: any;
    field: string;
    column: IColumnJSON;
    shouldMerge: boolean;
}
export default function renderMultiChoice({ item, field, column, shouldMerge }: IRenderMultiChoiceProps): JSX.Element;
export {};
//# sourceMappingURL=RenderMultiChoice.d.ts.map