import * as React from 'react';

interface Person {
  title: string;
  email: string;
  picture: string;
}

interface PersonFieldRenderProps {
  person: Person[]; // Array of person objects
  format: 'Name' | 'Email' | 'Image'; // The format to display
  prefix?: string; // Prefix to add to the field value
  suffix?: string; // Suffix to add to the field value
  className?: string; // Additional CSS class
}

const PersonFieldRender: React.FC<PersonFieldRenderProps> = ({ person, format, prefix = '', suffix = '', className = '' }) => {
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
      return (
        <img
          src={person[0].picture}
          alt={person[0].title}
          style={{ width: '32px', height: '32px', borderRadius: '50%' }}
        />
      );
    default:
      fieldValue = person[0].title;
  }

  // Apply prefix and suffix
  fieldValue = fieldValue ? `${prefix}${fieldValue}${suffix}` : '';

  return (
  <span 
  className={fieldValue != null && fieldValue.trim() !== "" ? className : undefined}
  >
    {fieldValue}
  </span>
  );
};

export default PersonFieldRender;
