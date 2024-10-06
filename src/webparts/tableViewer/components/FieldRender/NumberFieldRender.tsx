import * as React from 'react';

interface NumberFieldRenderProps {
  fieldValue: any;
  prefix?: string;
  suffix?: string;
  className?: string;
}

const NumberFieldRender: React.FC<NumberFieldRenderProps> = ({ fieldValue, prefix = '', suffix = '', className = '' }) => {
  let formattedValue = '';

  // Ensure the fieldValue is a valid number
  if (typeof fieldValue === 'number' || !isNaN(Number(fieldValue))) {
    formattedValue = Number(fieldValue).toLocaleString();
    formattedValue = prefix + formattedValue + suffix;
  }

  return (
    <span 
    className={formattedValue != null && formattedValue.trim() !== "" ? className : undefined} 
    style={formattedValue != null && formattedValue.trim() !== "" ? { whiteSpace: 'nowrap' } : undefined}
  >
    {formattedValue}
  </span>
  );
};

export default NumberFieldRender;