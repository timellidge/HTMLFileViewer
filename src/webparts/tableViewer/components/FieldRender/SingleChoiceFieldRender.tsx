import * as React from 'react';

interface SingleChoiceFieldRenderProps {
  fieldValue: any;
  prefix?: string;
  suffix?: string;
  className?: string;
}

const SingleChoiceFieldRender: React.FC<SingleChoiceFieldRenderProps> = ({ fieldValue, prefix = '', suffix = '', className = '' }) => {
  let formattedValue = '';

  // Ensure the fieldValue is a valid string and not empty
  if (typeof fieldValue === 'string' && fieldValue.trim() !== '') {
    formattedValue = prefix + fieldValue + suffix;
  }

  return (
    <span 
    className={formattedValue != null && formattedValue.trim() !== "" ? className : undefined} 
    style={formattedValue != null && formattedValue.trim() !== "" ? { whiteSpace: 'pre-wrap' } : undefined}
  >
    {formattedValue}
  </span>
   
  );
};

export default SingleChoiceFieldRender;