import * as React from 'react';
const NumberFieldRender = ({ fieldValue, prefix = '', suffix = '', className = '' }) => {
    let formattedValue = '';
    // Ensure the fieldValue is a valid number
    if (typeof fieldValue === 'number' || !isNaN(Number(fieldValue))) {
        formattedValue = Number(fieldValue).toLocaleString();
        formattedValue = prefix + formattedValue + suffix;
    }
    return (React.createElement("span", { className: formattedValue != null && formattedValue.trim() !== "" ? className : undefined, style: formattedValue != null && formattedValue.trim() !== "" ? { whiteSpace: 'nowrap' } : undefined }, formattedValue));
};
export default NumberFieldRender;
//# sourceMappingURL=NumberFieldRender.js.map