import * as React from 'react';

interface MultiChoiceFieldRenderProps {
  values: string[]; // Array of values for multi-choice field
  className?: string; // Additional CSS class
}

const MultiChoiceFieldRender: React.FC<MultiChoiceFieldRenderProps> = ({ values, className = '' }) => {
  return (
    <ul 
  className={values && values.length > 0 ? className : undefined} 
  style={values && values.length > 0 ? { margin: 0, paddingLeft: '20px', listStyleType: 'none', whiteSpace: 'pre-wrap' } : undefined}
>
  {values && values.length > 0 ? (
    values.map((value: string, index: number) => (
      <li key={index}>{value}</li>
    ))
  ) : (
    <li>No values available</li> // Optional: Display a message if no values are present
  )}
</ul>
  );
};

export default MultiChoiceFieldRender;