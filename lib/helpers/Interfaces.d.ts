import { z } from 'zod';
export declare const testColumnsConfigSchema: z.ZodRecord<z.ZodString, z.ZodObject<{
    name: z.ZodString;
    width: z.ZodString;
    tab: z.ZodNullable<z.ZodOptional<z.ZodBoolean>>;
    type: z.ZodNullable<z.ZodOptional<z.ZodEnum<["person", "stack", "html", "icon", "link", "number", "singlechoice", "multichoice", "date", "string", "edit", "bar"]>>>;
    class: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    isSortable: z.ZodNullable<z.ZodOptional<z.ZodBoolean>>;
    isMultiline: z.ZodNullable<z.ZodOptional<z.ZodBoolean>>;
    rowMerge: z.ZodNullable<z.ZodOptional<z.ZodBoolean>>;
    fields: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
    prefix: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    suffix: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    format: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    sequence: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    lines: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    icons: z.ZodNullable<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodEffects<z.ZodString, string, string>>>>;
    barSettings: z.ZodNullable<z.ZodOptional<z.ZodObject<{
        color: z.ZodOptional<z.ZodString>;
        height: z.ZodOptional<z.ZodString>;
        limit: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        color?: string;
        height?: string;
        limit?: number;
    }, {
        color?: string;
        height?: string;
        limit?: number;
    }>>>;
}, "strip", z.ZodTypeAny, {
    type?: "string" | "number" | "date" | "link" | "person" | "stack" | "html" | "icon" | "singlechoice" | "multichoice" | "edit" | "bar";
    name?: string;
    width?: string;
    tab?: boolean;
    class?: string;
    isSortable?: boolean;
    isMultiline?: boolean;
    rowMerge?: boolean;
    fields?: string[];
    prefix?: string;
    suffix?: string;
    format?: string;
    sequence?: number;
    lines?: number;
    icons?: Record<string, string>;
    barSettings?: {
        color?: string;
        height?: string;
        limit?: number;
    };
}, {
    type?: "string" | "number" | "date" | "link" | "person" | "stack" | "html" | "icon" | "singlechoice" | "multichoice" | "edit" | "bar";
    name?: string;
    width?: string;
    tab?: boolean;
    class?: string;
    isSortable?: boolean;
    isMultiline?: boolean;
    rowMerge?: boolean;
    fields?: string[];
    prefix?: string;
    suffix?: string;
    format?: string;
    sequence?: number;
    lines?: number;
    icons?: Record<string, string>;
    barSettings?: {
        color?: string;
        height?: string;
        limit?: number;
    };
}>>;
export interface IColumnsConfig {
    [key: string]: IColumnJSON;
}
export interface IColumnJSON {
    name: string;
    width: string;
    tab?: boolean | undefined | null;
    type?: 'person' | 'stack' | 'html' | 'icon' | 'link' | 'number' | 'singlechoice' | 'multichoice' | 'date' | 'string' | "edit" | "bar" | undefined | null;
    class?: string | undefined | null;
    isSortable?: boolean | undefined | null;
    isMultiline?: boolean | undefined | null;
    fields?: string[] | undefined | null;
    prefix?: string | undefined | null;
    suffix?: string | undefined | null;
    format?: string | undefined | null;
    rowMerge?: boolean | undefined | null;
    sequence?: number | 99;
    lines?: number | 0;
    icons?: IconSettings;
    barSettings?: BarSettings;
}
export interface IconSettings {
    [key: string]: string;
}
export interface BarSettings {
    "color"?: string;
    "height"?: string;
    "limit"?: number;
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