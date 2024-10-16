import * as React from 'react';
import * as moment from 'moment';

interface DateFieldRenderProps {
  dateValue: string | Date;  // Date value to be formatted
  format?: string;           // Date format string
  prefix?: string;           // Prefix to add to the formatted date
  suffix?: string;           // Suffix to add to the formatted date
  className?: string;        // Additional CSS class
}

const DateFieldRender: React.FC<DateFieldRenderProps> = ({ dateValue, format = 'DD MMM YYYY (HH:mm)', prefix = '', suffix = '', className = '' }) => {
  if (!dateValue) {
    return null;
  }

  let formattedDate = '';
  try {
    formattedDate = moment(new Date(dateValue)).format(format);
  } catch (error) {
    console.error('Error formatting date:', error);
    formattedDate = moment(new Date(dateValue)).format('DD MMM YYYY (HH:mm)');
  }

  // Apply prefix and suffix if present
  const finalDateValue = formattedDate ? `${prefix}${formattedDate}${suffix}` : '';

  return (
    <span 
      className={finalDateValue != null && finalDateValue.trim() !== "" ? className : undefined} 
      style={finalDateValue != null && finalDateValue.trim() !== "" ? { whiteSpace: 'pre-wrap' } : undefined}
    >
      {finalDateValue}
    </span>
  );
};

export default DateFieldRender;