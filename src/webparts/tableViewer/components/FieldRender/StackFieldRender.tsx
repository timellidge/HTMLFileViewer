
import * as React from 'react';
import * as moment from 'moment';
import styles from '../TableViewer.module.scss';

interface StackFieldRenderProps {
  fields: string[];          // List of field names to stack
  columnsObject: any;        // Column configurations
  item: any;                 // The item from which to extract values
}

const StackFieldRender: React.FC<StackFieldRenderProps> = ({ fields, columnsObject, item }) => {
  if (!Array.isArray(fields)) {
    return null;
  }

  const stackValues = fields.map((field: string) => {
    const fieldConfig = columnsObject[field]; // Get the column configuration
    const value = item[field];
    let displayValue = '';
    let cssClass: keyof typeof styles = fieldConfig?.class as keyof typeof styles;   // Type-safe access to CSS classes

    if (fieldConfig) {
      const prefix = fieldConfig.Prefix || '';
      const suffix = fieldConfig.Suffix || '';
      const format = fieldConfig.format;
       // Safely assign the CSS class if it exists
       if (fieldConfig.class && styles[fieldConfig.class as keyof typeof styles]) {
        cssClass = fieldConfig.class as keyof typeof styles;  // Ensure the class exists in the styles object
      }
      // Use switch case to handle different field types
      switch (fieldConfig.type) {
        case 'date':
          if (value) {
            try {
              const formatString = format || 'DD MMM YYYY (HH:mm)';
              displayValue = moment(new Date(value)).format(formatString);
            } catch (error) {
              console.error('Error formatting date:', error);
              displayValue = moment(new Date(value)).format('DD MMM YYYY (HH:mm)');
            }
          }
          break;

        case 'person':
          if (Array.isArray(value) && value.length > 0) {
            displayValue = value.map((person: any) => person.title || person.name || '').join(', ');
          }
          break;

        case 'singlechoice':
          displayValue = value || ''; // Handle single choice as simple text
          break;

        case 'multichoice':
          if (Array.isArray(value)) {
            if (fieldConfig.isMultiline) {
              displayValue = value ? value.join('<br/>') : ''; // Handle multiline text
            } else {
              displayValue = value.join(', '); // Join multi-choice options by commas
            }
          } else {
            displayValue = value || '';
          }
          break;
        default:
           displayValue = value ; // fall through to nothign much 
          break;
      }

      // Apply prefix and suffix
      displayValue = displayValue ? `${prefix}${displayValue}${suffix}` : '';
    }

    return { displayValue, cssClass }; // Return value along with its CSS class
  });

  return (
    <span style={{ whiteSpace: 'pre-wrap' }}>
    {stackValues.map((fieldData: { displayValue: string, cssClass: keyof typeof styles }, index: number) => (
      fieldData.displayValue ? ( // Only render if there is a displayValue
        <span key={index} className={fieldData.cssClass ? styles[fieldData.cssClass] : undefined}>
          {fieldData.displayValue}
          {index < stackValues.length - 1 && <br />}
        </span>
      ) : null // Do not render anything if displayValue is empty
    ))}
  </span>
  );
};

export default StackFieldRender;
