import * as React from 'react';
import { Persona, PersonaSize } from '@fluentui/react/lib/Persona';
//  /_layouts/15/userphoto.aspx?AccountName=mail@domain.com
import { getInitials } from '../../../../helpers/Utilities';
export default function PersonCard({ email, name, title, format }) {
    const examplePersona = {
        imageUrl: `/_layouts/15/userphoto.aspx?AccountName=${email}`,
        imageInitials: getInitials(name),
        text: name,
        secondaryText: email
    };
    const sizes = {
        "size8": PersonaSize.size8,
        "size24": PersonaSize.size24,
        "size32": PersonaSize.size32,
        "size40": PersonaSize.size40,
        "size48": PersonaSize.size48,
        "size56": PersonaSize.size56
    };
    const cardSize = sizes[format || "size40"];
    return (React.createElement(React.Fragment, null, cardSize ? (React.createElement(Persona, Object.assign({}, examplePersona, { size: cardSize }))) : (React.createElement("span", null, format === "email" ? email : format === "title" ? title : name))));
}
//# sourceMappingURL=PersonCard.js.map