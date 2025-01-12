import * as React from 'react';
import { IPersonaSharedProps, Persona, PersonaSize, PersonaPresence } from '@fluentui/react/lib/Persona';
import { Checkbox } from '@fluentui/react/lib/Checkbox';
import { Label } from '@fluentui/react/lib/Label';
import { Stack } from '@fluentui/react/lib/Stack';
//  /_layouts/15/userphoto.aspx?AccountName=mail@domain.com
import { getInitials } from '../../../../helpers/Utilities';


export interface IPersonCardProps  {
  email: string;
  name: string;
  title: string;
  format?: string;
  
}

export default function  PersonCard({email, name, title, format} : IPersonCardProps){

  const [renderDetails, updateRenderDetails] = React.useState(true);
  const onChange = (ev: unknown, checked: boolean | undefined) => {
    updateRenderDetails(!!checked);
  };

  const examplePersona: IPersonaSharedProps = {
    imageUrl: `/_layouts/15/userphoto.aspx?AccountName=${email}`,
    imageInitials: getInitials(name),
    text: name,
    secondaryText: email
  };

  const sizes: { [key: string]: PersonaSize;}= {
      "size8":  PersonaSize.size8, 
      "size24": PersonaSize.size24, 
      "size32": PersonaSize.size32, 
      "size40": PersonaSize.size40, 
      "size48": PersonaSize.size48, 
      "size56": PersonaSize.size56
  };

  const cardSize = sizes[format || "size40"];

  return (
    <>
    {cardSize ? (
      <Persona {...examplePersona} size={cardSize} />
    ) :  (
      <span>{format === "email" ? email : format === "title" ? title : name}</span>
    ) }
  </>
  
  );
}

