import * as React from 'react';
import { Persona, PersonaSize } from '@fluentui/react/lib/Persona';
import { getInitials } from '../../../../helpers/Utilities';
import styles from '../TableViewer.module.scss';
export default function RenderPersonCard({ item, field, column, shouldMerge }) {
    if (shouldMerge) {
        return React.createElement("span", null, "\u00A0");
    }
    const rawValue = item[field].rawValue;
    // so see if it has any value and if not or its not an array bail out 
    if (!rawValue || !Array.isArray(rawValue)) {
        return React.createElement("span", null, "\u00A0");
    }
    // so we are goign to try render at least one card so letsa set up our sizes. 
    const sizes = {
        "size8": PersonaSize.size8,
        "size24": PersonaSize.size24,
        "size32": PersonaSize.size32,
        "size40": PersonaSize.size40,
        "size48": PersonaSize.size48,
        "size56": PersonaSize.size56
    };
    const format = column.format;
    const cardSize = sizes[format || "size40"];
    return (React.createElement(React.Fragment, null, rawValue.map((entry, index) => {
        const email = entry === null || entry === void 0 ? void 0 : entry.email;
        const name = entry === null || entry === void 0 ? void 0 : entry.value;
        const title = entry === null || entry === void 0 ? void 0 : entry.title;
        const examplePersona = {
            imageUrl: `/_layouts/15/userphoto.aspx?AccountName=${email}`,
            imageInitials: getInitials(name),
            text: name,
            secondaryText: email
        };
        return (React.createElement("div", { key: index, className: styles.personHolder }, cardSize ? (React.createElement(Persona, Object.assign({}, examplePersona, { size: cardSize }))) : (React.createElement("span", null, format === "email" ? email : format === "title" ? title : name))));
    })));
}
//# sourceMappingURL=RenderPersonCard.js.map