
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
    [key: string]: {count:number, selected:boolean}
}