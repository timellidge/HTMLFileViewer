import * as React from 'react';


interface ITabBarRenderProps {
  TabName: string;  // Date value to be formatted
  Tabs: { [key: string]: number }           // Date format string
  selectedTab: string;           // Date format string
  handleTabChange: (tab: string | null) => void;        
}

export default function TabBarRender({ TabName, Tabs, selectedTab, handleTabChange }:ITabBarRenderProps) {
  return (
      <div style={{ marginBottom: '10px' }}>
        {Object.keys(Tabs).map(tab => (
          <button
            key={tab}
            onClick={() => handleTabChange(tab)}
            style={{
              marginRight: '10px',
              backgroundColor: selectedTab === tab ? '#0078d4' : '#eaeaea',
              color: selectedTab === tab ? '#fff' : '#000',
              padding: '5px 10px',
              border: 'none',
              cursor: 'pointer',
            }}>
            {`${tab} (${Tabs[tab] || 0})`}
          </button>
        ))}
        {selectedTab && (
          <button
            onClick={() => handleTabChange(null)}
            style={{
              marginRight: '10px',
              backgroundColor: '#eaeaea',
              color: '#000',
              padding: '5px 10px',
              border: 'none',
              cursor: 'pointer',
            }}>
            Clear Filter
          </button>
        )}
      </div>
  );
}

