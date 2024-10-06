import * as React from 'react';
const PersonFieldRender = ({ person, format, prefix = '', suffix = '', className = '' }) => {
    if (!person || !Array.isArray(person) || person.length === 0) {
        return null;
    }
    let fieldValue;
    switch (format) {
        case 'Name':
            fieldValue = person[0].title;
            break;
        case 'Email':
            fieldValue = person[0].email;
            break;
        case 'Image':
            return (React.createElement("img", { src: person[0].picture, alt: person[0].title, style: { width: '32px', height: '32px', borderRadius: '50%' } }));
        default:
            fieldValue = person[0].title;
    }
    // Apply prefix and suffix
    fieldValue = fieldValue ? `${prefix}${fieldValue}${suffix}` : '';
    return (React.createElement("span", { className: fieldValue != null && fieldValue.trim() !== "" ? className : undefined }, fieldValue));
};
export default PersonFieldRender;
//# sourceMappingURL=PersonFieldRender.js.map