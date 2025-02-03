import * as React from 'react';
import PersonCard from './TabsRender/PersonCard';
export default function renderPersonCard({ item, field, column, shouldMerge }) {
    if (shouldMerge) {
        return React.createElement("span", null, "\u00A0");
    }
    return (React.createElement(PersonCard, { email: item[field].rawValue[0].email, name: item[field].rawValue[0].name, title: item[field].rawValue[0].title, format: column.format || 'size32' }));
}
//# sourceMappingURL=RenderPersonCard.js.map