import * as React from 'react';
import styles from './TableViewer.module.scss';
import { mergeStyles } from '@fluentui/react';
const TableGridRender = ({ colJSON, items }) => {
    const _sortedColumns = Object.keys(colJSON)
        .map((key) => ({ key, column: colJSON[key] }))
        .sort((a, b) => (a.column.sequence || 99) - (b.column.sequence || 99));
    // Build the class object if the columsn has a lines attribute then add the line-clamp class but clamped to the number of lines
    const _columnClasses = _sortedColumns.reduce((acc, { key, column }) => {
        if (column.lines) {
            acc[key] = mergeStyles({
                display: '-webkit-box',
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                WebkitLineClamp: column.lines,
            });
        }
        else {
            acc[key] = styles.tableDataCell;
        }
        return acc;
    }, {});
    // const gridCellStyle = { display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis', WebkitLineClamp: 3 };
    const _columnWidths = _sortedColumns.map(({ column }) => column.width || '').join(' ');
    const _GridStyle = mergeStyles(styles.tableGrid, { gridTemplateColumns: _columnWidths });
    console.log(">>> grid info", _columnWidths, _GridStyle);
    return (React.createElement(React.Fragment, null,
        React.createElement("div", { className: _GridStyle }, _sortedColumns.map(({ key, column }) => (React.createElement("div", { key: key, className: styles.tableCell }, column.name)))),
        items.map((item, itemIndex) => (React.createElement("div", { key: itemIndex, className: _GridStyle }, _sortedColumns.map(({ key, column }) => (column.width > "0" && (React.createElement("div", { key: `${itemIndex}-${key}`, className: `${styles.tableDataCell} ${_columnClasses[key]}` }, item[key])))))))));
};
export default TableGridRender;
//# sourceMappingURL=TableGridRender.js.map