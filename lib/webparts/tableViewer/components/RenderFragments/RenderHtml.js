import * as React from 'react';
export default function renderHtml({ item, field }) {
    const htmltext = item[field].rawValue;
    return React.createElement("div", { dangerouslySetInnerHTML: { __html: htmltext } });
}
//# sourceMappingURL=RenderHtml.js.map