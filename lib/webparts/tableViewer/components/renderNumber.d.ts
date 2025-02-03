import { IColumnJSON } from '../../../helpers/Interfaces';
interface IRenderNumberProps {
    item: any;
    field: string;
    column: IColumnJSON;
    shouldMerge: boolean;
}
export default function renderNumber({ item, field, column, shouldMerge }: IRenderNumberProps): JSX.Element;
export {};
//# sourceMappingURL=renderNumber.d.ts.map