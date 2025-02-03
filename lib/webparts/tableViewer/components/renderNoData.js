import * as React from 'react';
export default function renderNoData({ column }) {
    var _a;
    return column.type === "stack" ? (React.createElement("div", null, (_a = column.fields) === null || _a === void 0 ? void 0 : _a.map((field, fieldIndex) => (React.createElement("div", { key: fieldIndex, className: `stack ${field}` }, "No Data"))))) : (React.createElement("span", null, "No Data"));
}
//# sourceMappingURL=renderNoData.js.map