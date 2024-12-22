
export interface IColumnJSON {
    name: string;
    width: string;
    calculatedPX: number | undefined | null;
}
  
export interface IColumnConfig {
    [key: string]: IColumnJSON;
}
  