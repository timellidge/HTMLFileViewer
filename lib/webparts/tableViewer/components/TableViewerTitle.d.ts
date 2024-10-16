import * as React from 'react';
import { DisplayMode } from '@microsoft/sp-core-library';
export interface ICardViewerTitleProps {
    displayMode: DisplayMode;
    title: string;
    updateProperty: (value: string) => void;
}
declare const CardViewerTitle: React.FunctionComponent<ICardViewerTitleProps>;
export default CardViewerTitle;
//# sourceMappingURL=TableViewerTitle.d.ts.map