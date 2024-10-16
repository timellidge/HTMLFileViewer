import * as React from 'react';
const SingleChoiceFieldRender = ({ fieldValue, prefix = '', suffix = '', className = '' }) => {
    let formattedValue = '';
    // Ensure the fieldValue is a valid string and not empty
    if (typeof fieldValue === 'string' && fieldValue.trim() !== '') {
        formattedValue = prefix + fieldValue + suffix;
    }
    return (React.createElement("span", { className: formattedValue != null && formattedValue.trim() !== "" ? className : undefined, style: formattedValue != null && formattedValue.trim() !== "" ? { whiteSpace: 'pre-wrap' } : undefined }, formattedValue));
};
export default SingleChoiceFieldRender;
//# sourceMappingURL=SingleChoiceFieldRender.js.map