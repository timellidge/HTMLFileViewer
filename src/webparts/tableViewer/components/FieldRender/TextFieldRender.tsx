import * as React from 'react';

interface TextFieldRenderProps {
  fieldValue: any;
  prefix?: string;
  suffix?: string;
  isMultiline?: boolean;
  className?: string;
  isSorting?: boolean; // Add isSorting prop
}

const TextFieldRender: React.FC<TextFieldRenderProps> = ({
  fieldValue,
  prefix = '',
  suffix = '',
  isMultiline = false,
  className = '',
  isSorting = false, // Default to false
}) => {
  
  // If the value is an array, join it into a single string
  if (Array.isArray(fieldValue)) {
    fieldValue = fieldValue.join();
  }

  // Add prefix and suffix if the fieldValue is a non-empty string
  if (typeof fieldValue === 'string' && fieldValue.trim() !== '') {
    fieldValue = prefix + fieldValue + suffix;
  }

  // Determine the style based on whether the column is multiline or single-line
  const style = isMultiline 
    ? { whiteSpace: 'pre-wrap' }  // Multiline style
    : { whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' };  // Single-line style with ellipsis

  // Sort fieldValue if isSorting is true
  const sortedFieldValue = isSorting && typeof fieldValue === 'string'
    ? fieldValue.split(',').sort().join(', ') // Example sorting by comma-separated values
    : fieldValue;

  return (
    <span 
    className={sortedFieldValue && sortedFieldValue.trim() !== "" ? className : undefined} 
    style={sortedFieldValue && sortedFieldValue.trim() !== "" ? style : undefined}
  >
    {sortedFieldValue}
  </span>
  );
};

export default TextFieldRender;