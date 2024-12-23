
export interface IColumnJSON {
    name: string;
    width: string;
    calculatedPX?: number | undefined | null;
    tab?: boolean | undefined | null;
}
  
export interface IColumnConfig {
    [key: string]: IColumnJSON;
}


// the infro to draw and manage the tabs and state of the tabs
// one tab bar per field that is marked as tab.
export interface ITabData {
    [key: string]: ITabDataDetail;
}

export interface ITabDataDetail{
    [key: string]: {itemCount:number, selected:boolean}
}