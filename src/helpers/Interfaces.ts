
// thsi is the interface definition for the JSON control data that is used to configure the table
export interface IColumnsConfig {
    [key: string]: IColumnJSON;
}

export interface IColumnJSON {
    name: string;
    width: string;
    tab?: boolean | undefined | null;
    type?: 'person' | 'stack' | 'html' | 'icon' | 'link' | 'number' | 'singlechoice' | 'multichoice' | 'date'  | 'string' | undefined | null;
    class?: string | undefined | null;
    isSortable?:  boolean | undefined | null;
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



// the info to draw and manage the tabs and state of the tabs
// one tab bar per field that is marked as tab.
export interface ITabData {
    [key: string]: ITabDataDetail;
}

export interface ITabDataDetail{
    [key: string]: {itemCount:number, selected:boolean}
}


