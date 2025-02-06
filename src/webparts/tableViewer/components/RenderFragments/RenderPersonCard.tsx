import * as React from 'react';
import { Persona, PersonaSize, IPersonaSharedProps } from '@fluentui/react/lib/Persona';
import { getInitials } from '../../../../helpers/Utilities';
import { IColumnJSON } from '../../../../helpers/Interfaces'; // Ensure this import is correct
import styles from '../TableViewer.module.scss';

interface IRenderPersonCardProps {
  item: any;
  field: string;
  column: IColumnJSON;
  shouldMerge: boolean;
}

export default function RenderPersonCard({ item, field, column, shouldMerge }: IRenderPersonCardProps) {
  if (shouldMerge) {
    return <span>&nbsp;</span>;
  }

  const rawValue = item[field].rawValue;

  // so see if it has any value and if not or its not an array bail out 
  if (!rawValue || !Array.isArray(rawValue)) {
    return <span>&nbsp;</span>;
  }

  // so we are goign to try render at least one card so letsa set up our sizes. 
  const sizes: { [key: string]: PersonaSize; } = {
    "size8": PersonaSize.size8,
    "size24": PersonaSize.size24,
    "size32": PersonaSize.size32,
    "size40": PersonaSize.size40,
    "size48": PersonaSize.size48,
    "size56": PersonaSize.size56
  };

  const format = column.format;
  const cardSize = sizes[format || "size40"];


  return (
    <>
      {rawValue.map((entry, index) => {
        const email = entry?.email;
        const name = entry?.value;
        const title = entry?.title;
  
        const examplePersona: IPersonaSharedProps = {
          imageUrl: `/_layouts/15/userphoto.aspx?AccountName=${email}`,
          imageInitials: getInitials(name),
          text: name,
          secondaryText: email
        };
  
        return (
          <div key={index} className={styles.personHolder}>
            {cardSize ? (
              <Persona {...examplePersona} size={cardSize} />
            ) : (
              <span>{format === "email" ? email : format === "title" ? title : name}</span>
            )}
          </div>
        );
      })}
    </>
  )
}