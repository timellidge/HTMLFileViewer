import * as React from 'react';
import { ITabDataDetail } from '../../../../helpers/Interfaces';
// ther is one tab bar per field that is marked as tab. 

interface ITabBarRenderProps {
  fieldName: string;  // what field is this tab bar for?
  tabs: ITabDataDetail          // what Tabs are to be rendered and how many items are in each tab
  handleTabChange: ( FieldName: string, tab: string | null) => void;        
}

export default function TabBarRender({ fieldName, tabs, handleTabChange }:ITabBarRenderProps) {
  return (
      <div style={{ marginBottom: '10px' }}>
        {Object.keys(tabs).map(tab => (
          <button
            key={tab}
            onClick={() => handleTabChange(fieldName, tab)}
            title = {`Click to filter on ${fieldName}: ${tab}`}
            style={{
              marginRight: '8px',
              backgroundColor: tabs[tab].selected  ? '#0078d4' : '#eaeaea',
              color: tabs[tab].selected  ? '#fff' : '#000',
              padding: '5px 10px',
              border: 'none',
              cursor: 'pointer',
            }}>
            {`${tab} (${tabs[tab].itemCount || 0})`}
          </button>
        ))}
      </div>
  );
}

