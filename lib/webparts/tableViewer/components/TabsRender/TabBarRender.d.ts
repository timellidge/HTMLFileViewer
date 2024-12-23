import { ITabDataDetail } from '../../../../helpers/Interfaces';
interface ITabBarRenderProps {
    fieldName: string;
    tabs: ITabDataDetail;
    handleTabChange: (FieldName: string, tab: string | null) => void;
}
export default function TabBarRender({ fieldName, tabs, handleTabChange }: ITabBarRenderProps): JSX.Element;
export {};
//# sourceMappingURL=TabBarRender.d.ts.map