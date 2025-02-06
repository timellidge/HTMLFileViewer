import * as React from 'react';
import { Icon } from '@fluentui/react/lib/Icon';
import styles from '../TableViewer.module.scss';
export default function renderIcon({ item, field, column }) {
    var _a;
    const displayValue = item[field].displayValue;
    const iconData = (_a = column.icons) === null || _a === void 0 ? void 0 : _a[displayValue];
    if (iconData) {
        const [iconName, iconColor, iconSize] = iconData.split("|");
        return (React.createElement("div", { className: styles.iconCell },
            React.createElement(Icon, { iconName: iconName, style: { color: iconColor, fontSize: iconSize || "1rem" }, title: displayValue })));
    }
    else {
        return displayValue;
    }
}
//# sourceMappingURL=RenderIcon.js.map