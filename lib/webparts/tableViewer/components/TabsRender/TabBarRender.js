import * as React from 'react';
export default function TabBarRender({ fieldName, tabs, handleTabChange }) {
    return (React.createElement("div", { style: { marginBottom: '10px' } }, Object.keys(tabs).map(tab => (React.createElement("button", { key: tab, onClick: () => handleTabChange(fieldName, tab), title: `Click to filter on ${fieldName}: ${tab}`, style: {
            marginRight: '10px',
            backgroundColor: tabs[tab].selected ? '#0078d4' : '#eaeaea',
            color: tabs[tab].selected ? '#fff' : '#000',
            padding: '5px 10px',
            border: 'none',
            cursor: 'pointer',
        } }, `${tab} (${tabs[tab].itemCount || 0})`)))));
}
//# sourceMappingURL=TabBarRender.js.map