import * as React from 'react';
const MultiChoiceFieldRender = ({ values, className = '' }) => {
    return (React.createElement("ul", { className: values && values.length > 0 ? className : undefined, style: values && values.length > 0 ? { margin: 0, paddingLeft: '20px', listStyleType: 'none', whiteSpace: 'pre-wrap' } : undefined }, values && values.length > 0 ? (values.map((value, index) => (React.createElement("li", { key: index }, value)))) : (React.createElement("li", null, "No values available") // Optional: Display a message if no values are present
    )));
};
export default MultiChoiceFieldRender;
//# sourceMappingURL=MultiChoiceFieldRender.js.map