import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import styles from './TableViewer.module.scss';
import { mergeStyles } from '@fluentui/react';
import { Panel, PanelType } from '@fluentui/react/lib/Panel';
import { Icon } from '@fluentui/react/lib/Icon';
import PersonCard from './TabsRender/PersonCard';
import { DateTime } from 'luxon';
import { getContrastingTextColor } from '../../../helpers/Utilities'; // Ensure this import is correct
const TableGridRender = ({ listUrl, colJSON, items, contentHeight, maxBarValues }) => {
    //we can only have one column sorted at a time so i need to know its name and its state
    const [sortField, setSortField] = useState({ key: "", direction: null });
    const [sortedItems, setSortedItems] = useState(items);
    const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
    const iframeRef = React.useRef(null);
    const [iframeUrl, setIframeUrl] = useState('');
    const [hasVerticalScrollbar, setHasVerticalScrollbar] = useState(false);
    const gridRef = useRef(null);
    const onLoad = (event) => {
        const iframe = event.currentTarget;
        iframe.contentWindow.addEventListener('beforeunload', closeSidePanel);
    };
    // we can use the width directly from the column definition to set the grid template columns for the table but dont include the "" ones as they are hidden
    const _sortedColumns = Object.keys(colJSON)
        .map((key) => ({ key, column: colJSON[key] }))
        .sort((a, b) => (a.column.sequence || 99) - (b.column.sequence || 99));
    // we can use the width directly from the column definition to set the grid template columns for the table but dont include the "" ones as they are hidden
    const _columnWidths = _sortedColumns
        .filter(({ column }) => column.width !== "")
        .map(({ column }) => column.width)
        .join(" ");
    const scrollbarWidth = hasVerticalScrollbar ? "17px" : "0px";
    const _GridStyle = mergeStyles(styles.tableGrid, { gridTemplateColumns: _columnWidths, maxHeight: contentHeight || "100%" });
    const _HeadStyle = mergeStyles(styles.headerGrid, { gridTemplateColumns: `${_columnWidths} ${scrollbarWidth}` });
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
    // USE EFFECT - the first checks if there is a Scrollbar and sets the state accordingly
    //=================================================================================================================  
    useEffect(() => {
        const checkForScrollbar = () => {
            if (gridRef.current) {
                setHasVerticalScrollbar(gridRef.current.scrollHeight > gridRef.current.clientHeight);
                console.log(">>> scrollbar", gridRef.current.scrollHeight, gridRef.current.clientHeight);
            }
        };
        checkForScrollbar();
        window.addEventListener('resize', checkForScrollbar);
        return () => {
            window.removeEventListener('resize', checkForScrollbar);
        };
    }, []);
    // THE SORT USE EFFECT - THIS WILL SORT THE ITEMS BASED ON THE SORT FIELD, FIELD TYPE AND DIRECTION
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
    //=================================================================================================================
    // PERSON CARD WITH ROWMERGE
    //=================================================================================================================
    const renderPersonCard = (item, key, column, shouldMerge) => {
        if (shouldMerge) {
            return React.createElement("span", null, "\u00A0");
        }
        return (React.createElement(PersonCard, { email: item[key].rawValue[0].email, name: item[key].rawValue[0].name, title: item[key].rawValue[0].title, format: column.format }));
    };
    //=================================================================================================================
    // HTML FIELD NO ROWMERGE
    //=================================================================================================================
    const renderHtml = (htmltext) => (React.createElement("div", { dangerouslySetInnerHTML: { __html: htmltext } }));
    //=================================================================================================================
    // DEFAULT RENDER FUNCTION WITH LINES CLAMP EXTENDED THIS IF THERE IS A PRE OR POST TO INCLUDE SOME SPANS FOR STYLING HAS ROWMERGE  
    //=================================================================================================================
    const renderDefault = (content, column, shouldMerge) => {
        if (shouldMerge) {
            return React.createElement("span", null, "\u00A0");
        }
        return column.lines ? (React.createElement("div", { className: styles.tableDataContent, style: { WebkitLineClamp: column.lines, lineClamp: column.lines } },
            column.prefix && React.createElement("span", null, column.prefix),
            content,
            column.suffix && React.createElement("span", null, column.suffix))) : (React.createElement(React.Fragment, null,
            column.prefix && React.createElement("span", null, column.prefix),
            content,
            column.suffix && React.createElement("span", null, column.suffix)));
    };
    //=================================================================================================================
    // NUMBER RENDER FUNCTION ALIGN HAS ROWMERGE BUT NOT SURE IF NEEDED
    //=================================================================================================================
    const renderNumber = (displayText, column, shouldMerge) => {
        if (shouldMerge) {
            return React.createElement("span", null, "\u00A0");
        }
        return (React.createElement("div", { className: styles.numberCell },
            column.prefix && React.createElement("span", null, column.prefix),
            displayText,
            column.suffix && React.createElement("span", null, column.suffix)));
    };
    //=================================================================================================================
    // RENDER LINK FUNCTION NO ROWMERGE 
    //=================================================================================================================
    const renderLink = (link, displayText, column) => {
        if (!link) {
            return null;
        }
        return (React.createElement("div", { className: styles.tableDataContent },
            column.prefix && React.createElement("span", null, column.prefix),
            React.createElement("a", { href: link }, displayText),
            column.suffix && React.createElement("span", null, column.suffix)));
    };
    //=================================================================================================================
    // EDIT RENDER FUNCTION NO ROWMERGE THIS ALSE HAS A DEFAULT ICON AND COLOR IF NONE IS SPECIFIED
    //=================================================================================================================
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
    //=================================================================================================================
    // ICON RENDER FUNCTION - ICONS ARE DEFINED IN THE COLUMN JSON NO ROWMERGE
    //=================================================================================================================
    const renderIcon = (displayValue, column) => {
        const iconData = column.icons[displayValue];
        if (iconData) {
            const [iconName, iconColor] = iconData.split("|");
            return (React.createElement("div", { className: styles.iconCell },
                React.createElement(Icon, { iconName: iconName, style: { color: iconColor }, title: displayValue })));
        }
        else {
            return displayValue;
        }
    };
    //=================================================================================================================
    // BAR RENDER FUNCTION - THIS WILL RENDER A BAR BASED ON THE VALUE OF THE FIELD HAS ROWMERGE IGNORES SUFFIX
    //=================================================================================================================
    const renderBar = (value, name, column) => {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        const rawValue = parseFloat(value) || 0;
        const maxValue = ((_a = column.barSettings) === null || _a === void 0 ? void 0 : _a.limit) || maxBarValues[name] || 100; // Set a default height if not provided
        const percentage = (rawValue / maxValue) * 100;
        //console.log(">>> bar", rawValue, maxValue, percentage);
        if (percentage < 0) {
            return null;
        }
        // now do the styling for the bar
        const barcol = ((_b = column.barSettings) === null || _b === void 0 ? void 0 : _b.color) || "#d0d0d0"; // Set barcol to column.barSettings.color if it exists, otherwise "darkblue"
        const barHeight = ((_c = column.barSettings) === null || _c === void 0 ? void 0 : _c.height) || "20px"; // Set a default height if not provided
        const _barStyle = mergeStyles(styles.chartBar, { backgroundColor: barcol, height: barHeight, width: `${percentage}%` });
        const textCol = percentage < 50 ? "#000000" : getContrastingTextColor(barcol); // get a contrast if it's goiong inside else use black
        // Set the position of the bar label based on the percentage ( < 50 its outside >50 its inside in a contrasting color)
        const _barLabelStyle = percentage < 50
            ? mergeStyles(styles.chartLabel, { width: `${100 - percentage}%`, left: `${percentage}%`, textAlign: 'left', color: textCol })
            : mergeStyles(styles.chartLabel, { width: `${percentage}%`, textAlign: 'right', color: textCol });
        // Determine the label content based on barSettings if its not spacififed then just use the raw value
        let labelContent = null;
        if (column.barSettings) {
            if (((_d = column.barSettings) === null || _d === void 0 ? void 0 : _d.showValue) && ((_e = column.barSettings) === null || _e === void 0 ? void 0 : _e.showPercentage)) {
                labelContent = `${rawValue} (${percentage.toFixed(0)}%)`;
            }
            else if ((_f = column.barSettings) === null || _f === void 0 ? void 0 : _f.showValue) {
                labelContent = `${rawValue}`;
            }
            else if ((_g = column.barSettings) === null || _g === void 0 ? void 0 : _g.showPercentage) {
                labelContent = `${percentage.toFixed(0)}%`;
            }
        }
        else {
            labelContent = rawValue;
        }
        const [iconName, iconColor] = (_h = column.barSettings.icon) === null || _h === void 0 ? void 0 : _h.split("|");
        return (React.createElement("div", { className: styles.barGrid },
            column.prefix ? React.createElement("span", { className: styles.chartPrefix }, column.prefix) : React.createElement("span", null, "\u00A0"),
            React.createElement("div", { className: _barStyle, title: value }, ((_j = column.barSettings) === null || _j === void 0 ? void 0 : _j.icon) ? (React.createElement(Icon, { iconName: iconName, title: rawValue.toString(), style: { color: iconColor } })) : (React.createElement("span", null, "\u00A0"))),
            React.createElement("div", { className: _barLabelStyle },
                " ",
                labelContent,
                " ")));
    };
    //=================================================================================================================
    // CATCH ALL FOR NO DATA
    //=================================================================================================================
    const renderNoData = (column) => 
    // even  though there is no field i still need to check if its a stack or not
    column.type === "stack" ? (React.createElement("div", null, column.fields.map((field, fieldIndex) => (React.createElement("div", { key: fieldIndex, className: `stack ${field}` }, "No Data"))))) : (React.createElement("span", null, "No Data"));
    //=================================================================================================================
    // THIS IS THE STACK RENDER FUNCTION - IT WILL LOOP THROUGH THE FIELDS IN THE STACK AND RENDER THEM ACCORDINGLY
    //=================================================================================================================
    const renderStack = (item, column, allcolJSON) => (React.createElement("div", null, column.fields.map((field, fieldIndex) => {
        const fieldColumn = allcolJSON[field];
        if (!fieldColumn) {
            return (React.createElement("div", { className: `stack ${field}`, key: fieldIndex }, "\u00A0"));
        }
        //console.log(">>> stack field:", field,  "  display:", item[field].displayValue, "  raw:", item[field].rawValue ,"  JSON:" ,fieldColumn);
        const content = (() => {
            switch (fieldColumn.type) {
                case 'bar':
                    return renderBar(item[field].displayValue, field, fieldColumn);
                case 'number':
                    return renderNumber(item[field].displayValue, fieldColumn, false);
                case 'html':
                    return renderHtml(item[field].rawValue);
                case "link":
                    return renderLink(item[field].rawValue, item[field].displayValue, fieldColumn);
                case 'person':
                    return renderPersonCard(item, field, fieldColumn, false);
                default:
                    return renderDefault(item[field].displayValue, fieldColumn, false);
            }
        })();
        return (React.createElement("div", { className: `stack ${field}`, key: fieldIndex }, content));
    })));
    //=================================================================================================================
    // THE RETURN FUNCTION
    //=================================================================================================================
    return (React.createElement(React.Fragment, null,
        React.createElement("div", { className: _HeadStyle },
            _sortedColumns.map(({ key, column }) => column.width > "0" && (React.createElement("div", { key: key, className: styles.tableHeaderCell },
                React.createElement("span", null, column.name),
                column.isSortable && (React.createElement(Icon, { iconName: sortField.key !== key
                        ? "Sort"
                        : sortField.direction
                            ? "SortDown"
                            : "SortUp", className: styles.sortIcon, onClick: () => handleSortToggle(key) }))))),
            React.createElement("div", { className: styles.tableHeaderCell }, " \u00A0 ")),
        React.createElement("div", { className: _GridStyle }, sortedItems.map((item, itemIndex) => (React.createElement(React.Fragment, { key: itemIndex }, _sortedColumns.map(({ key, column }) => {
            var _a, _b;
            const shouldMerge = column.rowMerge && itemIndex > 0 && ((_a = item[key]) === null || _a === void 0 ? void 0 : _a.displayValue) === ((_b = sortedItems[itemIndex - 1][key]) === null || _b === void 0 ? void 0 : _b.displayValue);
            return column.width > "0" && (React.createElement("div", { key: `${itemIndex}-${key}`, className: `${styles.tableCell} ${column.class ? column.class : ""}`, "data-row": item.ID.rawValue, onMouseEnter: (event) => handleMouseEnter(event), onMouseLeave: (event) => handleMouseLeave(event) }, (() => {
                switch (column.type) {
                    case "stack":
                        return renderStack(item, column, colJSON);
                    case "person":
                        return renderPersonCard(item, key, column, shouldMerge);
                    case "html":
                        return renderHtml(item[key].rawValue);
                    case "icon":
                        return renderIcon(item[key].displayValue, column);
                    case "link":
                        return renderLink(item[key].rawValue, item[key].displayValue, column);
                    case "edit":
                        return renderEdit(item["ID"].rawValue, "Edit", column);
                    case "number":
                        return renderNumber(item[key].displayValue, column, shouldMerge);
                    case "bar":
                        return renderBar(item[key].displayValue, key, column);
                    default:
                        return item[key] ? renderDefault(item[key].displayValue, column, shouldMerge) : renderNoData(column);
                }
            })()));
        }))))),
        React.createElement(Panel, { isOpen: isSidePanelOpen, onDismiss: closeSidePanel, closeButtonAriaLabel: "Close", headerText: "Magic Side Panel", type: PanelType.largeFixed },
            React.createElement("iframe", { id: "iframePanel", src: iframeUrl, ref: iframeRef, onLoad: onLoad, width: "100%", height: "900px", style: { border: 'none' } }))));
};
export default TableGridRender;
//# sourceMappingURL=TableGridRender.js.map