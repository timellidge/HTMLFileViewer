import * as React from 'react';

import { DisplayMode } from '@microsoft/sp-core-library';

import { WebPartTitle } from '@pnp/spfx-controls-react/lib/WebPartTitle';

export interface ICardViewerTitleProps {
  displayMode: DisplayMode;
  title: string;
  updateProperty: (value: string) => void;
}

const CardViewerTitle: React.FunctionComponent<ICardViewerTitleProps> = (
  {
    displayMode,
    title,
    updateProperty,
  },
) => (
  <WebPartTitle
    displayMode={displayMode}
    title={title}
    updateProperty={updateProperty}
    placeholder="Web Part Title"
  />
);

export default CardViewerTitle;
