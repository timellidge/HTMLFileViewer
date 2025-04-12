import * as React from 'react';
import { Icon } from '@fluentui/react/lib/Icon';
import styles from '../TableViewer.module.scss';
export default function TableGridFooter({ _sortedColumns, sortField, handleSortToggle, _headStyle }) {
    return (React.createElement("div", { className: _headStyle },
        _sortedColumns.map(({ key, column }) => column.width > "0" && (React.createElement("div", { key: key, className: styles.tableHeaderCell },
            React.createElement("span", null, column.name),
            column.isSortable && (React.createElement(Icon, { iconName: sortField.key !== key
                    ? "Sort"
                    : sortField.direction
                        ? "SortDown"
                        : "SortUp", className: styles.sortIcon, onClick: () => handleSortToggle(key) }))))),
        React.createElement("div", { className: styles.tableHeaderCell }, " \u00A0 ")));
}
//# sourceMappingURL=TableGridHeader.js.map