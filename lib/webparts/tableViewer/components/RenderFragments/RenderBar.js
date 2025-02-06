import * as React from 'react';
import { mergeStyles } from '@fluentui/react';
import { Icon } from '@fluentui/react/lib/Icon';
import styles from '../TableViewer.module.scss';
import { getContrastingTextColor } from '../../../../helpers/Utilities'; // Ensure this import is correct
export default function renderBar({ item, field, column, maxBarValues }) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    const value = item[field].rawValue;
    const rawValue = parseFloat(value) || 0;
    const maxValue = ((_a = column.barSettings) === null || _a === void 0 ? void 0 : _a.limit) || maxBarValues[field] || 100; // Set a default height if not provided
    const percentage = (rawValue / maxValue) * 100;
    if (percentage < 0) {
        return null;
    }
    // now do the styling for the bar
    const barcol = ((_b = column.barSettings) === null || _b === void 0 ? void 0 : _b.color) || "#d0d0d0"; // Set barcol to column.barSettings.color if it exists, otherwise "darkblue"
    const barHeight = ((_c = column.barSettings) === null || _c === void 0 ? void 0 : _c.height) || "20px"; // Set a default height if not provided
    const _barStyle = mergeStyles(styles.chartBar, { backgroundColor: barcol, height: barHeight, width: `${percentage}%` });
    const textCol = percentage < 50 ? "#000000" : getContrastingTextColor(barcol); // get a contrast if it's going inside else use black (black for transparent too)
    // Set the position of the bar label based on the percentage ( < 50 its outside >50 its inside in a contrasting color but if there is an icon add more padding to the right)
    const labelPadding = ((_d = column.barSettings) === null || _d === void 0 ? void 0 : _d.icon) ? "20px" : "5px";
    const _barLabelStyle = percentage < 50
        ? mergeStyles(styles.chartLabel, { width: `${100 - percentage}%`, left: `${percentage}%`, textAlign: 'left', color: textCol }) // outside One
        : mergeStyles(styles.chartLabel, { width: `${percentage}%`, textAlign: 'right', paddingRight: labelPadding, color: textCol }); // Inside one
    // Determine the label content based on barSettings if it's not specified then just use the raw value
    let labelContent = null;
    if (column.barSettings) {
        if (((_e = column.barSettings) === null || _e === void 0 ? void 0 : _e.showValue) && ((_f = column.barSettings) === null || _f === void 0 ? void 0 : _f.showPercentage)) {
            labelContent = `${rawValue} (${percentage.toFixed(0)}%)`;
        }
        else if ((_g = column.barSettings) === null || _g === void 0 ? void 0 : _g.showValue) {
            labelContent = `${rawValue}`;
        }
        else if ((_h = column.barSettings) === null || _h === void 0 ? void 0 : _h.showPercentage) {
            labelContent = `${percentage.toFixed(0)}%`;
        }
    }
    else {
        labelContent = rawValue;
    }
    let iconName = null;
    let iconColor = null;
    let iconSize = null;
    if ((_j = column.barSettings) === null || _j === void 0 ? void 0 : _j.icon) {
        [iconName, iconColor, iconSize] = column.barSettings.icon.split("|"); // does this make it super conditional on the icon being there?
    }
    return (React.createElement("div", { className: styles.barGrid },
        column.prefix ? React.createElement("span", { className: styles.chartPrefix }, column.prefix) : React.createElement("span", null, "\u00A0"),
        React.createElement("div", { className: _barStyle, title: value }, iconName ? (React.createElement(Icon, { iconName: iconName, title: rawValue.toString(), style: { color: iconColor, fontSize: iconSize || "1rem" } })) : (React.createElement("span", null, "\u00A0"))),
        React.createElement("div", { className: _barLabelStyle },
            " ",
            labelContent,
            " ")));
}
//# sourceMappingURL=RenderBar.js.map