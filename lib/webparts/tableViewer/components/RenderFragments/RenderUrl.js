import * as React from 'react';
import styles from '../TableViewer.module.scss';
import { Icon } from '@fluentui/react/lib/Icon';
export default function renderUrl({ item, field, column }) {
    const link = item[field].rawValue;
    const displayText = item[field].displayValue;
    let iconName = "";
    let iconColor = "";
    let iconSize = "";
    if (column.icons && typeof column.icons === 'object') {
        const [firstIconName, firstIconColor] = Object.entries(column.icons)[0];
        [iconName, iconColor, iconSize] = firstIconColor.split("|");
    }
    console.log("RenderUrl", { link, displayText, iconName, iconColor, iconSize });
    if (!link) {
        return null;
    }
    return (React.createElement("div", { className: styles.tableDataContent },
        column.prefix && React.createElement("span", null, column.prefix),
        React.createElement("a", Object.assign({ href: link }, (column.newTab
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})),
            iconName === "" && displayText,
            iconName && (React.createElement(Icon, { iconName: iconName, title: displayText, style: { color: iconColor, fontSize: iconSize || "1rem" } }))),
        column.suffix && React.createElement("span", null, column.suffix)));
}
//# sourceMappingURL=RenderUrl.js.map