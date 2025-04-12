import * as React from 'react';
import styles from '../TableViewer.module.scss';
export default function TabBarRender({ fieldName, tabs, handleTabChange, tabBehaviour }) {
    const isAnyTabSelected = Object.values(tabs).some(tab => tab.selected);
    return (React.createElement("div", { className: styles.tabBar },
        Object.keys(tabs).map(tab => (React.createElement("button", { key: tab, onClick: () => handleTabChange(fieldName, tab), title: `Click to filter on ${fieldName}: ${tab}`, style: {
                marginRight: '8px',
                backgroundColor: tabs[tab].selected ? '#0078d4' : '#eaeaea',
                color: tabs[tab].selected ? '#fff' : '#000',
                padding: '5px 10px',
                border: 'none',
                cursor: 'pointer',
            } }, `${tab} (${tabs[tab].itemCount || 0})`))),
        !tabBehaviour && isAnyTabSelected && (React.createElement("button", { onClick: () => handleTabChange(fieldName, null), title: "Clear filter", style: {
                marginLeft: '8px',
                backgroundColor: '#eaeaea',
                color: '#000',
                padding: '5px 10px',
                border: 'none',
                cursor: 'pointer',
            } }, "Clear"))));
}
//# sourceMappingURL=TabBarRender.js.map