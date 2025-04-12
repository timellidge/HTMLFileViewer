import * as React from 'react';
import styles from '../TableViewer.module.scss';
import { numberFormat } from '../../../../helpers/Utilities';
export default function TableGridFooter({ _sortedColumns, itemTotals, _footStyle }) {
    return (React.createElement("div", { className: _footStyle },
        _sortedColumns.map(({ key, column }) => column.width > "0" && (React.createElement("div", { key: key, className: styles.tableFooterCell }, column.showTotal ? (React.createElement("span", null, numberFormat(isNaN(itemTotals[key]) ? 0 : itemTotals[key], column.format))) : (React.createElement("span", null, "\u00A0"))))),
        React.createElement("div", { className: styles.tableFooterCell }, " \u00A0 ")));
}
//# sourceMappingURL=TableGridFooter.js.map