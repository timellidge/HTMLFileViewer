interface ITabBarRenderProps {
    TabName: string;
    Tabs: {
        [key: string]: number;
    };
    selectedTab: string;
    handleTabChange: (tab: string | null) => void;
}
export default function TabBarRender({ TabName, Tabs, selectedTab, handleTabChange }: ITabBarRenderProps): JSX.Element;
export {};
//# sourceMappingURL=TabBarRender.d.ts.map