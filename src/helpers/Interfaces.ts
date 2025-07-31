import { z } from 'zod';

//& NOW THE ZOD SCHEMA FOR THE CONFIG JSON
// Define the zod schema for each event property the use of STRICT allows these keys and no others
// Define the IconSettings schema
// Define the IconSettings schema
const IconSettingsSchema = z.record(
    z.string().refine(value => value.includes('|'), {
      message: 'String must contain a "|" character followed by a color code',
    })
  );

// Define the BarSettings schema
const BarSettingsSchema = z.object({
  color: z.string().optional(),
  height: z.string().optional(),
  limit: z.number().optional(),
  icon: z.string().optional(),
  showValue: z.boolean().optional().nullable(),
  showPercentage: z.boolean().optional().nullable(),
});


// Define the IColumnJSON schema
const IColumnJSONSchema = z.object({
  name: z.string(),
  width: z.string(),
  tab: z.boolean().optional().nullable(),
  type: z.enum(['person', 'stack', 'html', 'icon', 'link', 'number', 'singleChoice', 'multiChoice', 'date', 'string', 'edit', 'bar', 'url', 'sidepanel']).optional().nullable(),
  class: z.string().optional().nullable(),
  isSortable: z.boolean().optional().nullable(),
  isMultiline: z.boolean().optional().nullable(),
  showTotal: z.boolean().optional().nullable(),
  rowMerge: z.boolean().optional().nullable(),
  newTab: z.boolean().optional().nullable(),
  fields: z.array(z.string()).optional().nullable(),
  prefix: z.string().optional().nullable(),
  suffix: z.string().optional().nullable(),
  format: z.string().optional().nullable(),
  sequence: z.number().optional().default(99),
  lines: z.number().optional().default(0),
  icons: IconSettingsSchema.optional().nullable(),
  barSettings: BarSettingsSchema.optional().nullable(),
});

// Define the IColumnsConfig schema
export const testColumnsConfigSchema = z.record(IColumnJSONSchema);

//& END OF ZOD SCHEMA FOR THE CONFIG JSON

export interface IColumnsConfig {
    [key: string]: IColumnJSON;
}

export interface IColumnJSON {
    name: string;
    width: string;
    tab?: boolean | undefined | null;
    type?: 'person' | 'stack' | 'html' | 'icon' | 'link' | 'number' | 'singleChoice' | 'multiChoice' | 'date'  | 'string' | "edit" | "bar" | "url" | "sidepanel" | undefined | null;
    class?: string | undefined | null;
    isSortable?:  boolean | undefined | null;
    isMultiline?: boolean | undefined | null;
    fields?: string[] | undefined | null;
    prefix?: string | undefined | null;
    suffix?: string | undefined | null;
    format?: string | undefined | null;
    rowMerge?: boolean | undefined | null;
    newTab?: string | undefined | null;
    sequence?: number | 99;
    lines?: number | 0;
    icons?: IconSettings ;
    barSettings?: BarSettings;
    showTotal?: boolean;
}
  
export interface IconSettings {
    [key: string]: string;
}

export interface BarSettings {
  "color"?: string;
  "height"?: string;
  "limit"?: number;
  "icon"?: string;
  "showValue"?: boolean;
  "showPercentage"?: boolean;
}


// the info to draw and manage the tabs and state of the tabs
// one tab bar per field that is marked as tab.
export interface ITabData {
    [key: string]: ITabDataDetail;
}

export interface ITabDataDetail{
    [key: string]: {itemCount:number, selected:boolean}
}


