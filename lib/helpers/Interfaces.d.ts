import { z } from 'zod';
export declare const testColumnsConfigSchema: z.ZodRecord<z.ZodString, z.ZodObject<{
    name: z.ZodString;
    width: z.ZodString;
    tab: z.ZodNullable<z.ZodOptional<z.ZodBoolean>>;
    type: z.ZodNullable<z.ZodOptional<z.ZodEnum<["person", "stack", "html", "icon", "link", "number", "singleChoice", "multiChoice", "date", "string", "edit", "bar", "url", "sidepanel"]>>>;
    class: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    isSortable: z.ZodNullable<z.ZodOptional<z.ZodBoolean>>;
    isMultiline: z.ZodNullable<z.ZodOptional<z.ZodBoolean>>;
    showTotal: z.ZodNullable<z.ZodOptional<z.ZodBoolean>>;
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
        icon: z.ZodOptional<z.ZodString>;
        showValue: z.ZodNullable<z.ZodOptional<z.ZodBoolean>>;
        showPercentage: z.ZodNullable<z.ZodOptional<z.ZodBoolean>>;
    }, "strip", z.ZodTypeAny, {
        color?: string;
        height?: string;
        limit?: number;
        icon?: string;
        showValue?: boolean;
        showPercentage?: boolean;
    }, {
        color?: string;
        height?: string;
        limit?: number;
        icon?: string;
        showValue?: boolean;
        showPercentage?: boolean;
    }>>>;
}, "strip", z.ZodTypeAny, {
    type?: "string" | "number" | "date" | "link" | "icon" | "person" | "stack" | "html" | "singleChoice" | "multiChoice" | "edit" | "bar" | "url" | "sidepanel";
    name?: string;
    width?: string;
    tab?: boolean;
    class?: string;
    isSortable?: boolean;
    isMultiline?: boolean;
    showTotal?: boolean;
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
        icon?: string;
        showValue?: boolean;
        showPercentage?: boolean;
    };
}, {
    type?: "string" | "number" | "date" | "link" | "icon" | "person" | "stack" | "html" | "singleChoice" | "multiChoice" | "edit" | "bar" | "url" | "sidepanel";
    name?: string;
    width?: string;
    tab?: boolean;
    class?: string;
    isSortable?: boolean;
    isMultiline?: boolean;
    showTotal?: boolean;
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
        icon?: string;
        showValue?: boolean;
        showPercentage?: boolean;
    };
}>>;
export interface IColumnsConfig {
    [key: string]: IColumnJSON;
}
export interface IColumnJSON {
    name: string;
    width: string;
    tab?: boolean | undefined | null;
    type?: 'person' | 'stack' | 'html' | 'icon' | 'link' | 'number' | 'singleChoice' | 'multiChoice' | 'date' | 'string' | "edit" | "bar" | "url" | "sidepanel" | undefined | null;
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