import * as React from 'react';
import styles from '../TableViewer.module.scss';
export default function renderLink({ item, field, column }) {
    const link = item[field].rawValue;
    const displayText = item[field].displayValue;
    if (!link) {
        return null;
    }
    return (React.createElement("div", { className: styles.tableDataContent },
        column.prefix && React.createElement("span", null, column.prefix),
        React.createElement("a", { href: link }, displayText),
        column.suffix && React.createElement("span", null, column.suffix)));
}
//# sourceMappingURL=RenderLink.js.map