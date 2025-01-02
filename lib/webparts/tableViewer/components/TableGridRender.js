import * as React from 'react';
import styles from './TableViewer.module.scss';
import { mergeStyles } from '@fluentui/react';
// export interface IColumnJSON {
//   name: string;
//   width: string;
//   calculatedPX?: number | undefined | null;
//   tab?: boolean | undefined | null;
//   type?: string | undefined | null;
//   class?: string | undefined | null;
//   isSortable?: boolean | undefined | null;
//   isMultiline?: boolean | undefined | null;
//   Fields?: string[] | undefined | null;
//   prefix?: string | undefined | null;
//   suffix?: string | undefined | null;
//   format?: string | undefined | null;
// }
const TableGridRender = ({ colJSON, items }) => {
    const _columnWidths = Object.keys(colJSON).map((key) => (colJSON[key].width || '') + ' ').join('');
    const _GridStyle = mergeStyles(styles.tableGrid, { gridTemplateColumns: _columnWidths });
    console.log(">>> grid info", _columnWidths, _GridStyle);
    // style={values && values.length > 0 ? { margin: 0, paddingLeft: '20px', listStyleType: 'none', whiteSpace: 'pre-wrap' } : undefined}
    return (React.createElement(React.Fragment, null,
        React.createElement("div", { className: _GridStyle }, Object.keys(colJSON).map((key) => {
            return (React.createElement("div", { key: key, className: styles.tableCell }, colJSON[key].name));
        })),
        React.createElement("div", { className: _GridStyle }, items.map((item, itemIndex) => (Object.keys(colJSON).map((key) => {
            if (colJSON[key].width > "0") {
                return (React.createElement("span", { key: `${itemIndex}-${key}`, className: styles.tableDataCell },
                    " ",
                    item[key],
                    " "));
            }
            return null;
        }))))));
};
export default TableGridRender;
//# sourceMappingURL=TableGridRender.js.map