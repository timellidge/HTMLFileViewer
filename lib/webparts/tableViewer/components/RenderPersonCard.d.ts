import { IColumnJSON } from '../../../helpers/Interfaces';
interface IRenderPersonCardProps {
    item: any;
    field: string;
    column: IColumnJSON;
    shouldMerge: boolean;
}
export default function renderPersonCard({ item, field, column, shouldMerge }: IRenderPersonCardProps): JSX.Element;
export {};
//# sourceMappingURL=RenderPersonCard.d.ts.map