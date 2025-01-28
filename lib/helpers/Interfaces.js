import { z } from 'zod';
//& NOW THE ZOD SCHEMA FOR THE CONFIG JSON
// Define the zod schema for each event property the use of STRICT allows these keys and no others
// Define the IconSettings schema
// Define the IconSettings schema
const IconSettingsSchema = z.record(z.string().refine(value => value.includes('|#'), {
    message: 'String must contain a "|" character followed by a color code',
}));
// Define the BarSettings schema
const BarSettingsSchema = z.object({
    color: z.string().optional(),
    height: z.string().optional(),
    limit: z.number().optional(),
});
// Define the IColumnJSON schema
const IColumnJSONSchema = z.object({
    name: z.string(),
    width: z.string(),
    tab: z.boolean().optional().nullable(),
    type: z.enum(['person', 'stack', 'html', 'icon', 'link', 'number', 'singlechoice', 'multichoice', 'date', 'string', 'edit', 'bar']).optional().nullable(),
    class: z.string().optional().nullable(),
    isSortable: z.boolean().optional().nullable(),
    isMultiline: z.boolean().optional().nullable(),
    rowMerge: z.boolean().optional().nullable(),
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
//# sourceMappingURL=Interfaces.js.map