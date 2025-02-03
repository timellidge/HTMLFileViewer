import * as React from 'react';
import { Icon } from '@fluentui/react/lib/Icon';
import styles from './TableViewer.module.scss';
export default function renderEdit({ item, field, column, handleIconClick }) {
    const id = item[field].rawValue;
    let iconName = "edit";
    let iconColor = "#0078d4";
    if (column.icons && typeof column.icons === 'object') {
        const [firstIconName, firstIconColor] = Object.entries(column.icons)[0];
        [iconName, iconColor] = firstIconColor.split("|");
    }
    return (React.createElement("div", { className: styles.editCell },
        React.createElement(Icon, { iconName: iconName, title: "Edit", style: { color: iconColor }, onClick: () => handleIconClick(id) })));
}
//# sourceMappingURL=RenderEdit.js.map