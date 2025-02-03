import * as React from 'react';
import styles from './TableViewer.module.scss';
export default function renderDefault({ item, field, column, shouldMerge }) {
    if (shouldMerge) {
        return React.createElement("span", null, "\u00A0");
    }
    const content = item[field].displayValue;
    if (!content) {
        return React.createElement("span", null, "\u00A0");
    }
    return column.lines ? (React.createElement("div", { className: styles.tableDataContent, style: { WebkitLineClamp: column.lines, lineClamp: column.lines } },
        column.prefix && React.createElement("span", null, column.prefix),
        content,
        column.suffix && React.createElement("span", null, column.suffix))) : (React.createElement(React.Fragment, null,
        column.prefix && React.createElement("span", null, column.prefix),
        content,
        column.suffix && React.createElement("span", null, column.suffix)));
}
//# sourceMappingURL=renderDefault.js.map