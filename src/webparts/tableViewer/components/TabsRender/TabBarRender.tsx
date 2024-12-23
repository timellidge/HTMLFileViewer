import * as React from 'react';
// ther is one tab bar per field that is marked as tab. 

interface ITabBarRenderProps {
  FieldName: string;  // what field is this tab bar for?
  Tabs: { [key: string]: number }           // what Tabs are to be rendered and how many items are in each tab
  selectedTab: string;           // what is the currently selected tab
  handleTabChange: ( FieldName: string, tab: string | null) => void;        
}

export default function TabBarRender({ FieldName, Tabs, selectedTab, handleTabChange }:ITabBarRenderProps) {
  return (
      <div style={{ marginBottom: '10px' }}>
        {FieldName}:
        {Object.keys(Tabs).map(tab => (
          <button
            key={tab}
            onClick={() => handleTabChange(FieldName, tab)}
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
            onClick={() => handleTabChange(FieldName, null)}
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

