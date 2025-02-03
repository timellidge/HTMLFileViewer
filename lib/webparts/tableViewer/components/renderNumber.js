import * as React from 'react';
import styles from './TableViewer.module.scss';
export default function renderNumber({ item, field, column, shouldMerge }) {
    if (shouldMerge) {
        return React.createElement("span", null, "\u00A0");
    }
    return (React.createElement("div", { className: styles.numberCell },
        column.prefix && React.createElement("span", null, column.prefix),
        item[field].displayValue,
        column.suffix && React.createElement("span", null, column.suffix)));
}
//# sourceMappingURL=renderNumber.js.map