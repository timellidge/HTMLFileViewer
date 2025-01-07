import * as React from 'react';
import styles from './TableViewer.module.scss';
import { mergeStyles } from '@fluentui/react';
const TableGridRender = ({ colJSON, items }) => {
    const _sortedColumns = Object.keys(colJSON)
        .map((key) => ({ key, column: colJSON[key] }))
        .sort((a, b) => (a.column.sequence || 99) - (b.column.sequence || 99));
    // const gridCellStyle = { display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis', WebkitLineClamp: 3 };
    const _columnWidths = _sortedColumns.map(({ column }) => column.width || '').join(' ');
    const _GridStyle = mergeStyles(styles.tableGrid, { gridTemplateColumns: _columnWidths });
    console.log(">>> grid info", _columnWidths, _GridStyle);
    return (React.createElement(React.Fragment, null,
        React.createElement("div", { className: _GridStyle }, _sortedColumns.map(({ key, column }) => (column.width > "0" && (React.createElement("div", { key: key, className: styles.tableHeaderCell },
            " ",
            column.name,
            " "))))),
        items.map((item, itemIndex) => (React.createElement("div", { key: itemIndex, className: _GridStyle }, _sortedColumns.map(({ key, column }) => (column.width > "0" && (React.createElement("div", { key: `${itemIndex}-${key}`, className: styles.tableCell },
            React.createElement("span", { className: styles.tableDataContent, style: { WebkitLineClamp: column.lines, lineClamp: column.lines } },
                " ",
                item[key],
                " "))))))))));
};
export default TableGridRender;
//# sourceMappingURL=TableGridRender.js.map