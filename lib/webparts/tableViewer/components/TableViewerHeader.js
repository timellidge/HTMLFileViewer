import * as React from 'react';
import { TextField } from '@fluentui/react/lib/TextField';
import TableViewerTitle from './TableViewerTitle';
import styles from './TableViewer.module.scss';
const TableViewerHeader = ({ displayMode, title, updateProperty, showTitle, showFind, searchQuery, handleSearch }) => {
    if (!showTitle && !showFind) {
        return null;
    }
    return (React.createElement("div", { className: styles.tableViewerHeader },
        showTitle ? (React.createElement(TableViewerTitle, { displayMode: displayMode, title: title, updateProperty: updateProperty })) : (React.createElement("span", null, "\u00A0")),
        showFind && (React.createElement(TextField, { className: styles.searchBox, placeholder: "Search...", value: searchQuery, onChange: handleSearch }))));
};
export default TableViewerHeader;
//# sourceMappingURL=TableViewerHeader.js.map