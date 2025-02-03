import { IColumnJSON } from '../../../helpers/Interfaces';
interface IRenderEditProps {
    item: any;
    field: string;
    column: IColumnJSON;
    handleIconClick: (id: number) => void;
}
export default function renderEdit({ item, field, column, handleIconClick }: IRenderEditProps): JSX.Element;
export {};
//# sourceMappingURL=RenderEdit.d.ts.map