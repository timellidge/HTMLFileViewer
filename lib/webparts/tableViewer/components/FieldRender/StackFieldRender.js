import * as React from 'react';
import * as moment from 'moment';
import styles from '../TableViewer.module.scss';
const StackFieldRender = ({ fields, columnsObject, item }) => {
    if (!Array.isArray(fields)) {
        return null;
    }
    const stackValues = fields.map((field) => {
        const fieldConfig = columnsObject[field]; // Get the column configuration
        const value = item[field];
        let displayValue = '';
        let cssClass = fieldConfig === null || fieldConfig === void 0 ? void 0 : fieldConfig.class; // Type-safe access to CSS classes
        if (fieldConfig) {
            const prefix = fieldConfig.Prefix || '';
            const suffix = fieldConfig.Suffix || '';
            const format = fieldConfig.format;
            // Safely assign the CSS class if it exists
            if (fieldConfig.class && styles[fieldConfig.class]) {
                cssClass = fieldConfig.class; // Ensure the class exists in the styles object
            }
            // Use switch case to handle different field types
            switch (fieldConfig.type) {
                case 'date':
                    if (value) {
                        try {
                            const formatString = format || 'DD MMM YYYY (HH:mm)';
                            displayValue = moment(new Date(value)).format(formatString);
                        }
                        catch (error) {
                            console.error('Error formatting date:', error);
                            displayValue = moment(new Date(value)).format('DD MMM YYYY (HH:mm)');
                        }
                    }
                    break;
                case 'person':
                    if (Array.isArray(value) && value.length > 0) {
                        displayValue = value.map((person) => person.title || person.name || '').join(', ');
                    }
                    break;
                case 'singlechoice':
                    displayValue = value || ''; // Handle single choice as simple text
                    break;
                case 'multichoice':
                    if (Array.isArray(value)) {
                        if (fieldConfig.isMultiline) {
                            displayValue = value ? value.join('<br/>') : ''; // Handle multiline text
                        }
                        else {
                            displayValue = value.join(', '); // Join multi-choice options by commas
                        }
                    }
                    else {
                        displayValue = value || '';
                    }
                    break;
                default:
                    displayValue = value; // fall through to nothign much 
                    break;
            }
            // Apply prefix and suffix
            displayValue = displayValue ? `${prefix}${displayValue}${suffix}` : '';
        }
        return { displayValue, cssClass }; // Return value along with its CSS class
    });
    return (React.createElement("span", { style: { whiteSpace: 'pre-wrap' } }, stackValues.map((fieldData, index) => (fieldData.displayValue ? ( // Only render if there is a displayValue
    React.createElement("span", { key: index, className: fieldData.cssClass ? styles[fieldData.cssClass] : undefined },
        fieldData.displayValue,
        index < stackValues.length - 1 && React.createElement("br", null))) : null // Do not render anything if displayValue is empty
    ))));
};
export default StackFieldRender;
//# sourceMappingURL=StackFieldRender.js.map