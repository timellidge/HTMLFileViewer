import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import styles from './TableViewer.module.scss';
import { mergeStyles } from '@fluentui/react';
import { Panel, PanelType } from '@fluentui/react/lib/Panel';
import { Icon } from '@fluentui/react/lib/Icon';
import { DateTime } from 'luxon';
import TableGridHeader from './TableGridHeader';
import TableGridFooter from './TableGridFooter';
import renderPersonCard from './RenderPersonCard';
import renderBar from './RenderBar';
const TableGridRender = ({ listUrl, colJSON, items, contentHeight, maxBarValues, height }) => {
    //we can only have one column sorted at a time so i need to know its name and its state
    const [sortField, setSortField] = useState({ key: "", direction: null });
    const [sortedItems, setSortedItems] = useState(items);
    const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
    const iframeRef = React.useRef(null);
    const [iframeUrl, setIframeUrl] = useState('');
    const [hasVerticalScrollbar, setHasVerticalScrollbar] = useState(false);
    const gridRef = useRef(null);
    const [itemTotals, setItemTotals] = useState({});
    const onLoad = (event) => {
        const iframe = event.currentTarget;
        iframe.contentWindow.addEventListener('beforeunload', closeSidePanel);
    };
    // we can use the width directly from the column definition to set the grid template columns for the table but dont include the "" ones as they are hidden
    const _sortedColumns = Object.keys(colJSON)
        .map((key) => ({ key, column: colJSON[key] }))
        .sort((a, b) => (a.column.sequence || 99) - (b.column.sequence || 99));
    // check if any of the columns have a total set to true if so we need to display a footer row with the totals for those columns
    const hasTotal = _sortedColumns.some(({ key, column }) => column.width > "0" && column.total);
    // we can use the width directly from the column definition to set the grid template columns for the table but dont include the "" ones as they are hidden
    const _columnWidths = _sortedColumns
        .filter(({ column }) => column.width !== "")
        .map(({ column }) => column.width)
        .join(" ");
    const scrollbarWidth = hasVerticalScrollbar ? "17px" : "0px";
    const _GridStyle = mergeStyles(styles.tableGrid, { gridTemplateColumns: _columnWidths, maxHeight: contentHeight || "100%" });
    const _HeadStyle = mergeStyles(styles.headerGrid, { gridTemplateColumns: `${_columnWidths} ${scrollbarWidth}` });
    const _FootStyle = mergeStyles(styles.headerGrid, { gridTemplateColumns: `${_columnWidths} ${scrollbarWidth}` });
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
    //^ USE EFFECTS SORT & SCROLL - 
    //=================================================================================================================  
    useEffect(() => {
        // Calculate totals after items have been processed
        const totals = {};
        items.forEach(item => {
            Object.keys(colJSON).forEach(key => {
                var _a;
                const column = colJSON[key];
                if (column.total) {
                    const rawValue = parseFloat((_a = item[key]) === null || _a === void 0 ? void 0 : _a.rawValue) || 0;
                    totals[key] = (totals[key] || 0) + rawValue;
                }
            });
        });
        console.log(">>> totals", totals);
        setItemTotals(totals);
    }, [items, colJSON]);
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
                        colJSON[sortField.key].type === "multiChoice") {
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
    // does the main section have a scroll BAr if so then we need to adjust the width of the grid to allow for it
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
    //=================================================================================================================
    //^ A LOAD OF RENDER FUNCTIONS TO SIMPLIFY THE RETURN LOGIC BY SPLITTING EACH TYPE OUT INTO A FUNCTION
    //=================================================================================================================
    //=================================================================================================================
    // HTML FIELD NO ROWMERGE
    //=================================================================================================================
    const renderHtml = (item, field) => {
        const htmltext = item[field].rawValue;
        return (React.createElement("div", { dangerouslySetInnerHTML: { __html: htmltext } }));
    };
    //=================================================================================================================
    // DEFAULT RENDER FUNCTION WITH LINES CLAMP EXTENDED THIS IF THERE IS A PRE OR POST TO INCLUDE SOME SPANS FOR STYLING HAS ROWMERGE  
    //=================================================================================================================
    const renderDefault = (item, field, column, shouldMerge) => {
        if (shouldMerge) {
            return React.createElement("span", null, "\u00A0");
        }
        const content = item[field].displayValue;
        if (!content) {
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
    const renderNumber = (item, field, column, shouldMerge) => {
        if (shouldMerge) {
            return React.createElement("span", null, "\u00A0");
        }
        return (React.createElement("div", { className: styles.numberCell },
            column.prefix && React.createElement("span", null, column.prefix),
            item[field].displayValue,
            column.suffix && React.createElement("span", null, column.suffix)));
    };
    //=================================================================================================================
    // RENDER LINK FUNCTION NO ROWMERGE 
    //=================================================================================================================
    const renderLink = (item, field, column) => {
        const link = item[field].rawValue;
        const displayText = item[field].displayValue;
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
    const renderEdit = (item, field, column) => {
        const id = item[field].rawValue;
        let iconName = "edit";
        let iconColor = "#0078d4";
        if (column.icons && typeof column.icons === 'object') {
            const [firstIconName, firstIconColor] = Object.entries(column.icons)[0];
            [iconName, iconColor] = firstIconColor.split("|");
        }
        return (React.createElement("div", { className: styles.editCell },
            React.createElement(Icon, { iconName: iconName, title: "Edit", style: { color: iconColor }, onClick: () => handleIconClick(id) })));
    };
    //=================================================================================================================
    // ICON RENDER FUNCTION - ICONS ARE DEFINED IN THE COLUMN JSON NO ROWMERGE
    //=================================================================================================================
    const renderIcon = (item, field, column) => {
        var _a;
        const displayValue = item[field].displayValue;
        const iconData = (_a = column.icons) === null || _a === void 0 ? void 0 : _a[displayValue];
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
    // CATCH ALL FOR NO DATA
    //=================================================================================================================
    const renderNoData = (column) => 
    // even  though there is no field i still need to check if its a stack or not
    column.type === "stack" ? (React.createElement("div", null, column.fields.map((field, fieldIndex) => (React.createElement("div", { key: fieldIndex, className: `stack ${field}` }, "No Data"))))) : (React.createElement("span", null, "No Data"));
    //=================================================================================================================
    // THIS IS THE STACK RENDER FUNCTION - IT WILL LOOP THROUGH THE FIELDS IN THE STACK AND RENDER THEM ACCORDINGLY
    //=================================================================================================================
    const renderStack = (item, column, allcolJSON) => (React.createElement("div", null, column.fields.map((field, fieldIndex) => {
        const column = allcolJSON[field];
        if (!column) {
            return (React.createElement("div", { className: `stack ${field}`, key: fieldIndex }, "\u00A0"));
        }
        //console.log(">>> stack field:", field,  "  display:", item[field].displayValue, "  raw:", item[field].rawValue ,"  JSON:" ,fieldColumn);
        const content = (() => {
            switch (column.type) {
                case 'bar':
                    return renderBar({ item, field, column, maxBarValues });
                case 'number':
                    return renderNumber(item, field, column, false);
                case 'html':
                    return renderHtml(item, field);
                case "link":
                    return renderLink(item, field, column);
                case 'person':
                    return renderPersonCard({ item, field, column, shouldMerge: false });
                default:
                    return renderDefault(item, field, column, false);
            }
        })();
        return (React.createElement("div", { className: `stack ${field}`, key: fieldIndex }, content));
    })));
    //=================================================================================================================
    //^  THE RETURN FUNCTION
    //=================================================================================================================
    return (React.createElement(React.Fragment, null,
        React.createElement(TableGridHeader, { _sortedColumns: _sortedColumns, sortField: sortField, handleSortToggle: handleSortToggle, _headStyle: _HeadStyle }),
        React.createElement("div", { className: _GridStyle }, sortedItems.map((item, itemIndex) => (React.createElement(React.Fragment, { key: itemIndex }, _sortedColumns.map(({ key, column }) => {
            var _a, _b;
            const field = key;
            const shouldMerge = column.rowMerge && itemIndex > 0 && ((_a = item[field]) === null || _a === void 0 ? void 0 : _a.displayValue) === ((_b = sortedItems[itemIndex - 1][field]) === null || _b === void 0 ? void 0 : _b.displayValue);
            return column.width > "0" && (React.createElement("div", { key: `${itemIndex}-${field}`, className: `${styles.tableCell} ${column.class ? column.class : ""}`, "data-row": itemIndex, onMouseEnter: (event) => handleMouseEnter(event), onMouseLeave: (event) => handleMouseLeave(event) }, (() => {
                switch (column.type) {
                    case "stack":
                        return renderStack(item, column, colJSON);
                    case "person":
                        return renderPersonCard({ item, field, column, shouldMerge: false });
                    case "html":
                        return renderHtml(item, field);
                    case "icon":
                        return renderIcon(item, field, column);
                    case "link":
                        return renderLink(item, field, column);
                    case "edit":
                        return renderEdit(item, "ID", column);
                    case "number":
                        return renderNumber(item, field, column, shouldMerge);
                    case "bar":
                        return renderBar({ item, field, column, maxBarValues });
                    default:
                        return item[field] ? renderDefault(item, field, column, shouldMerge) : renderNoData(column);
                }
            })()));
        }))))),
        hasTotal && (React.createElement(TableGridFooter, { _sortedColumns: _sortedColumns, itemTotals: itemTotals, _footStyle: _FootStyle })),
        React.createElement(Panel, { isOpen: isSidePanelOpen, onDismiss: closeSidePanel, closeButtonAriaLabel: "Close", type: PanelType.largeFixed },
            React.createElement("iframe", { id: "iframePanel", src: iframeUrl, ref: iframeRef, onLoad: onLoad, style: { border: 'none', height: (height - 90) + 'px', width: '100%' } }))));
};
export default TableGridRender;
//# sourceMappingURL=TableGridRender.js.map