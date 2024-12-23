import * as React from 'react';
export default function TabBarRender({ fieldName, tabs, handleTabChange }) {
    const isSelected = Object.values(tabs).some(tab => tab.selected === true);
    return (React.createElement("div", { style: { marginBottom: '10px' } },
        Object.keys(tabs).map(tab => (React.createElement("button", { key: tab, onClick: () => handleTabChange(fieldName, tab), title: `Click to filter on ${fieldName}: ${tab}`, style: {
                marginRight: '10px',
                backgroundColor: tabs[tab].selected ? '#0078d4' : '#eaeaea',
                color: tabs[tab].selected ? '#fff' : '#000',
                padding: '5px 10px',
                border: 'none',
                cursor: 'pointer',
            } }, `${tab} (${tabs[tab].itemCount || 0})`))),
        isSelected && (React.createElement("button", { onClick: () => handleTabChange(fieldName, null), title: `Click to clear filter on ${fieldName}`, style: {
                marginRight: '10px',
                backgroundColor: '#eaeaea',
                color: '#000',
                padding: '5px 10px',
                border: 'none',
                cursor: 'pointer',
            } }, "Clear Filter"))));
}
//# sourceMappingURL=TabBarRender.js.map