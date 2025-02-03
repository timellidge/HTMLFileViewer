import { IColumnJSON } from '../../../helpers/Interfaces';
interface RenderBarProps {
    item: any;
    field: string;
    column: IColumnJSON;
    maxBarValues: {
        [key: string]: number;
    };
}
export default function renderBar({ item, field, column, maxBarValues }: RenderBarProps): JSX.Element;
export {};
//# sourceMappingURL=RenderBar.d.ts.map