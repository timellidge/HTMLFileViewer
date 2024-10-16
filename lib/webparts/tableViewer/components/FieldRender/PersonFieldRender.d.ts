import * as React from 'react';
interface Person {
    title: string;
    email: string;
    picture: string;
}
interface PersonFieldRenderProps {
    person: Person[];
    format: 'Name' | 'Email' | 'Image';
    prefix?: string;
    suffix?: string;
    className?: string;
}
declare const PersonFieldRender: React.FC<PersonFieldRenderProps>;
export default PersonFieldRender;
//# sourceMappingURL=PersonFieldRender.d.ts.map