import * as React from 'react';
export default function TabBarRender({ TabName, Tabs, selectedTab, handleTabChange }) {
    return (React.createElement("div", { style: { marginBottom: '10px' } },
        Object.keys(Tabs).map(tab => (React.createElement("button", { key: tab, onClick: () => handleTabChange(tab), style: {
                marginRight: '10px',
                backgroundColor: selectedTab === tab ? '#0078d4' : '#eaeaea',
                color: selectedTab === tab ? '#fff' : '#000',
                padding: '5px 10px',
                border: 'none',
                cursor: 'pointer',
            } }, `${tab} (${Tabs[tab] || 0})`))),
        selectedTab && (React.createElement("button", { onClick: () => handleTabChange(null), style: {
                marginRight: '10px',
                backgroundColor: '#eaeaea',
                color: '#000',
                padding: '5px 10px',
                border: 'none',
                cursor: 'pointer',
            } }, "Clear Filter"))));
}
//# sourceMappingURL=TabBarRender.js.map