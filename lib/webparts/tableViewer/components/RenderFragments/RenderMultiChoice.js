import * as React from 'react';
import styles from '../TableViewer.module.scss';
export default function renderMultiChoice({ item, field, column, shouldMerge }) {
    if (shouldMerge) {
        return React.createElement("span", null, "\u00A0");
    }
    const content = item[field].displayValue;
    if (!content) {
        return React.createElement("span", null, "\u00A0");
    }
    const rawValue = item[field].rawValue;
    return column.isMultiline ? (React.createElement("div", { className: styles.tableDataContent }, rawValue.map((entry, index) => (React.createElement("div", { key: index },
        column.prefix && React.createElement("span", null, column.prefix),
        entry,
        column.suffix && React.createElement("span", null, column.suffix)))))) : (React.createElement("div", { className: styles.tableDataContent },
        column.prefix && React.createElement("span", null, column.prefix),
        content,
        column.suffix && React.createElement("span", null, column.suffix)));
}
//# sourceMappingURL=RenderMultiChoice.js.map