import * as React from 'react';
import * as moment from 'moment';
const DateFieldRender = ({ dateValue, format = 'DD MMM YYYY (HH:mm)', prefix = '', suffix = '', className = '' }) => {
    if (!dateValue) {
        return null;
    }
    let formattedDate = '';
    try {
        formattedDate = moment(new Date(dateValue)).format(format);
    }
    catch (error) {
        console.error('Error formatting date:', error);
        formattedDate = moment(new Date(dateValue)).format('DD MMM YYYY (HH:mm)');
    }
    // Apply prefix and suffix if present
    const finalDateValue = formattedDate ? `${prefix}${formattedDate}${suffix}` : '';
    return (React.createElement("span", { className: finalDateValue != null && finalDateValue.trim() !== "" ? className : undefined, style: finalDateValue != null && finalDateValue.trim() !== "" ? { whiteSpace: 'pre-wrap' } : undefined }, finalDateValue));
};
export default DateFieldRender;
//# sourceMappingURL=DateFieldRender.js.map