import * as React from 'react';
import { useState, useEffect } from 'react';
import styles from './TableViewer.module.scss';
import { mergeStyles } from '@fluentui/react';
import { Panel, PanelType } from '@fluentui/react/lib/Panel';
import { Icon } from '@fluentui/react/lib/Icon';
import PersonCard from './TabsRender/PersonCard';
import { DateTime } from 'luxon';
const TableGridRender = ({ listUrl, colJSON, items }) => {
    //we can only have one column sorted at a time so i need to know its name and its state
    const [sortField, setSortField] = useState({ key: "", direction: null });
    const [sortedItems, setSortedItems] = useState(items);
    const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
    const iframeRef = React.useRef(null);
    const [iframeUrl, setIframeUrl] = useState('');
    const onLoad = (event) => {
        const iframe = event.currentTarget;
        iframe.contentWindow.addEventListener('beforeunload', closeSidePanel);
    };
    const _sortedColumns = Object.keys(colJSON)
        .map((key) => ({ key, column: colJSON[key] }))
        .sort((a, b) => (a.column.sequence || 99) - (b.column.sequence || 99));
    // we can use the width directly from the column definition to set the grid template columns for the table but dont include the "" ones as they are hidden
    const _columnWidths = _sortedColumns
        .filter(({ column }) => column.width !== "")
        .map(({ column }) => column.width)
        .join(" ");
    const _GridStyle = mergeStyles(styles.tableGrid, {
        gridTemplateColumns: _columnWidths,
    });
    //=================================================================================================================
    // GENERAL INTERACTION FUNCTIONS
    //=================================================================================================================
    const handleSortToggle = (columnKey) => {
        setSortField((prevState) => ({
            key: columnKey,
            direction: prevState.key === columnKey ? !prevState.direction : true,
        }));
    };
    const handleMouseEnter = (event) => {
        const row = event.currentTarget.getAttribute("data-row");
        const cellsInRow = document.querySelectorAll(`.${styles.tableCell}[data-row="${row}"]`);
        cellsInRow.forEach((cell) => {
            cell.classList.add(styles.highlight);
        });
    };
    const handleMouseLeave = (event) => {
        const row = event.currentTarget.getAttribute("data-row");
        const cellsInRow = document.querySelectorAll(`.${styles.tableCell}[data-row="${row}"]`);
        cellsInRow.forEach((cell) => {
            cell.classList.remove(styles.highlight);
        });
    };
    const handleIconClick = (id) => {
        // different list types have different edit forms so we need to check the url and adjust accordingly
        console.log(`${listUrl}/EditForm.aspx?ID=${id}`);
        if (listUrl.indexOf("/Lists/") > 0) {
            setIframeUrl(`${listUrl}/EditForm.aspx?ID=${id}`);
        }
        else {
            setIframeUrl(`${listUrl}/Forms/EditForm.aspx?ID=${id}`);
        }
        openSidePanel();
    };
    const closeSidePanel = () => {
        setIsSidePanelOpen(false);
    };
    const openSidePanel = () => {
        setIsSidePanelOpen(true);
    };
    //=================================================================================================================
    // THE SORT USE EFFECT - THIS WILL SORT THE ITEMS BASED ON THE SORT FIELD, FIELD TYPE AND DIRECTION
    //=================================================================================================================
    useEffect(() => {
        if (sortField.key) {
            const sorted = [...items].sort((a, b) => {
                //console.log(">>> sorting", sortField.key, "which is a ", colJSON[sortField.key].type, "in direction", sortField.direction);
                let aValue;
                let bValue;
                // dependign on the type we must source the data differently for sorting also if its a stack we cant sort the date liek a string so we need to do a double lookup into the columns to get the info we need to make the choice
                if (colJSON[sortField.key].type == "stack") {
                    // do the lookup into trhe stack to get the first field in the stack then look up its type and sort accordingly
                    if (colJSON[colJSON[sortField.key].fields[0]].type === "date" ||
                        colJSON[colJSON[sortField.key].fields[0]].type === "number") {
                        aValue = a[colJSON[sortField.key].fields[0]].rawValue;
                        bValue = b[colJSON[sortField.key].fields[0]].rawValue;
                    }
                    else {
                        aValue = a[colJSON[sortField.key].fields[0]].displayValue;
                        bValue = b[colJSON[sortField.key].fields[0]].displayValue;
                    }
                }
                else {
                    // its not a stack so we can just look up the field and sort it
                    if (colJSON[sortField.key].type === "person" ||
                        colJSON[sortField.key].type === "multichoice") {
                        aValue = a[sortField.key].displayValue;
                        bValue = b[sortField.key].displayValue;
                    }
                    else {
                        // its a number or a string or a date so we can sort it as is
                        aValue = a[sortField.key].rawValue;
                        bValue = b[sortField.key].rawValue;
                    }
                }
                if (aValue === null || aValue === undefined)
                    return 1;
                if (bValue === null || bValue === undefined)
                    return -1;
                // Check if the values are dates
                if (DateTime.isDateTime(aValue) && DateTime.isDateTime(bValue)) {
                    return sortField.direction
                        ? aValue.toMillis() - bValue.toMillis()
                        : bValue.toMillis() - aValue.toMillis();
                }
                // we have already dealt with Dates so everythign else is a strign or a number.
                if (typeof aValue === "number" && typeof bValue === "number") {
                    return sortField.direction ? aValue - bValue : bValue - aValue;
                }
                else {
                    return sortField.direction
                        ? aValue.localeCompare(bValue)
                        : bValue.localeCompare(aValue);
                }
            });
            setSortedItems(sorted);
        }
        else {
            setSortedItems(items);
        }
    }, [sortField, items]);
    //=================================================================================================================
    // A LOAD OF RENDER FUNCTIONS TO SIMPLIFY THE RETURN LOGIC BY SPLITTING EACH TYPE OUT INTO A FUNCTION
    //=================================================================================================================
    const renderPersonCard = (item, key, column) => (React.createElement(PersonCard, { email: item[key].rawValue[0].email, name: item[key].rawValue[0].name, title: item[key].rawValue[0].title, format: column.format }));
    // HTML FIELD
    const renderHtml = (htmltext) => (React.createElement("div", { dangerouslySetInnerHTML: { __html: htmltext } }));
    // DEFAULT RENDER FUNCTION WITH LINES CLAMP EXTENDED THIS IF THERE IS A PRE OR POST TO INCLUDE SOME SPANS FOR STYLING
    const renderDefault = (content, column) => {
        return column.lines ? (React.createElement("div", { className: styles.tableDataContent, style: { WebkitLineClamp: column.lines, lineClamp: column.lines } },
            column.prefix && React.createElement("span", null, column.prefix),
            content,
            column.suffix && React.createElement("span", null, column.suffix))) : (React.createElement(React.Fragment, null,
            column.prefix && React.createElement("span", null, column.prefix),
            content,
            column.suffix && React.createElement("span", null, column.suffix)));
    };
    // NUMBER RENDER FUNCTION ALIGN
    const renderNumber = (displayText, column) => (React.createElement("div", { className: styles.numberCell },
        column.prefix && React.createElement("span", null, column.prefix),
        displayText,
        column.suffix && React.createElement("span", null, column.suffix)));
    // RENDER LINK FUNCTION
    const renderLink = (link, displayText, column) => (React.createElement("a", { href: link, className: styles.tableDataContent },
        column.prefix && React.createElement("span", null, column.prefix),
        displayText,
        column.suffix && React.createElement("span", null, column.suffix)));
    // EDIT FUNCTION
    const renderEdit = (id, displayText, column) => {
        let iconName = "edit";
        let iconColor = "#0078d4";
        if (column.icons && typeof column.icons === 'object') {
            const [firstIconName, firstIconColor] = Object.entries(column.icons)[0];
            [iconName, iconColor] = firstIconColor.split("|");
        }
        return (React.createElement("div", { className: styles.editCell },
            React.createElement(Icon, { iconName: iconName, title: displayText, style: { color: iconColor }, onClick: () => handleIconClick(id) })));
    };
    // ICON RENDER FUNCTION - ICONS ARE DEFINED IN THE COLUMN JSON
    const renderIcon = (displayValue, column) => {
        const iconData = column.icons[displayValue];
        if (iconData) {
            const [iconName, iconColor] = iconData.split("|");
            return (React.createElement(Icon, { iconName: iconName, style: { color: iconColor }, title: displayValue }));
        }
        else {
            return displayValue;
        }
    };
    // CATCH ALL FOR NO DATA
    const renderNoData = (column) => 
    // even  though there is no field i still need to check if its a stack or not
    column.type === "stack" ? (React.createElement("div", null, column.fields.map((field, fieldIndex) => (React.createElement("div", { key: fieldIndex, className: `stack ${field}` }, "No Data"))))) : (React.createElement("span", null, "No Data"));
    //=================================================================================================================
    // THIS IS THE STACK RENDER FUNCTION - IT WILL LOOP THROUGH THE FIELDS IN THE STACK AND RENDER THEM ACCORDINGLY
    //=================================================================================================================
    const renderStack = (item, column, allcolJSON) => (React.createElement("div", null, column.fields.map((field, fieldIndex) => {
        const fieldColumn = allcolJSON[field];
        const prefix = (fieldColumn === null || fieldColumn === void 0 ? void 0 : fieldColumn.prefix) ? (React.createElement("span", null, fieldColumn.prefix)) : null;
        const suffix = (fieldColumn === null || fieldColumn === void 0 ? void 0 : fieldColumn.suffix) ? (React.createElement("span", null, fieldColumn.suffix)) : null;
        return item[field] ? (React.createElement("div", { className: `stack ${field}`, key: fieldIndex },
            prefix,
            item[field].displayValue,
            suffix)) : (React.createElement("div", { className: `stack ${field}`, key: fieldIndex }, "\u00A0"));
    })));
    //=================================================================================================================
    // THE RETURN FUNCTION
    //=================================================================================================================
    return (React.createElement(React.Fragment, null,
        React.createElement("div", { className: _GridStyle },
            _sortedColumns.map(({ key, column }) => column.width > "0" && (React.createElement("div", { key: key, className: styles.tableHeaderCell },
                React.createElement("span", null, column.name),
                column.isSortable && (React.createElement(Icon, { iconName: sortField.key !== key
                        ? "Sort"
                        : sortField.direction
                            ? "SortDown"
                            : "SortUp", className: styles.sortIcon, onClick: () => handleSortToggle(key) }))))),
            sortedItems.map((item, itemIndex) => (React.createElement(React.Fragment, { key: itemIndex }, _sortedColumns.map(({ key, column }) => column.width > "0" && (React.createElement("div", { key: `${itemIndex}-${key}`, className: `${styles.tableCell} ${column.class ? column.class : ""}`, "data-row": item.ID.rawValue, onMouseEnter: (event) => handleMouseEnter(event), onMouseLeave: (event) => handleMouseLeave(event) }, column.type === "stack"
                ? renderStack(item, column, colJSON)
                : item[key] || column.type === "edit"
                    ? column.type === "person"
                        ? renderPersonCard(item, key, column)
                        : column.type === "html"
                            ? renderHtml(item[key].rawValue)
                            : column.type === "icon"
                                ? renderIcon(item[key].displayValue, column)
                                : column.type === "link"
                                    ? renderLink(item[key].rawValue, item[key].displayValue, column)
                                    : column.type === "edit"
                                        ? renderEdit(item["ID"].rawValue, "Edit", column)
                                        : column.type === "number"
                                            ? renderNumber(item[key].displayValue, column)
                                            : renderDefault(item[key].displayValue, column)
                    : renderNoData(column)))))))),
        React.createElement(Panel, { isOpen: isSidePanelOpen, onDismiss: closeSidePanel, closeButtonAriaLabel: "Close", headerText: "Magic Side Panel", type: PanelType.largeFixed },
            React.createElement("iframe", { id: "iframePanel", src: iframeUrl, ref: iframeRef, onLoad: onLoad, width: "100%", height: "900px", style: { border: 'none' } }))));
};
export default TableGridRender;
//# sourceMappingURL=TableGridRender.js.map