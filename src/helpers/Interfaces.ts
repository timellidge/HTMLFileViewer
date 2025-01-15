
export interface IColumnJSON {
    name: string;
    width: string;
    tab?: boolean | undefined | null;
    type?: string | undefined | null;
    class?: string | undefined | null;
    isSortable?:  boolean | undefined | null;
    sortState?:   boolean | undefined | null;
    isMultiline?: boolean | undefined | null;
    fields?: string[] | undefined | null;
    prefix?: string | undefined | null;
    suffix?: string | undefined | null;
    format?: string | undefined | null;
    sequence?: number | 99;
    lines?: number | 0;
    icons?: IconSettings ;
}
  
export interface IconSettings {
    [key: string]: string;
}

export interface IColumnsConfig {
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

export interface IExtendedColumn {
    key: string;
    fieldName: string;
    name: string;
    minWidth: number;
    maxWidth: number;
    columnType: string | null;
    className: string;
    isSortable: boolean;
    isSorted: boolean;
    isSortedDescending: boolean;
    onRender: (item: any) => JSX.Element;
}

