import * as React from 'react';

import { DisplayMode } from '@microsoft/sp-core-library';

import { WebPartTitle } from '@pnp/spfx-controls-react/lib/WebPartTitle';

export interface IHtmlFileViewerTitleProps {
  displayMode: DisplayMode;
  title: string;
  updateProperty: (value: string) => void;
}

const HtmlFileViewerTitle: React.FunctionComponent<IHtmlFileViewerTitleProps> = (
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

export default HtmlFileViewerTitle;
