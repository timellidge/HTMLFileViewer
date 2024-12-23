export interface IColumnJSON {
    name: string;
    width: string;
    calculatedPX?: number | undefined | null;
    tab?: boolean | undefined | null;
}
export interface IColumnConfig {
    [key: string]: IColumnJSON;
}
export interface ITabData {
    [key: string]: ITabDataDetail;
}
export interface ITabDataDetail {
    [key: string]: {
        itemCount: number;
        selected: boolean;
    };
}
//# sourceMappingURL=Interfaces.d.ts.map