/* eslint-disable implicit-arrow-linebreak */
import * as React from 'react';

import { DisplayMode } from '@microsoft/sp-core-library';
import { Placeholder } from '@pnp/spfx-controls-react/lib/Placeholder';

export interface IHtmlFileViewerPlaceholderProps {
  displayMode: DisplayMode;
  onConfigure: () => void;
}

const HtmlFileViewerPlaceholder: React.FunctionComponent<IHtmlFileViewerPlaceholderProps> = (
  {
    displayMode,
    onConfigure,
  },
) => (
  <Placeholder
    iconName="Edit"
    iconText="Configure your web part"
    description="Please configure the web part."
    buttonLabel="Configure"
    hideButton={displayMode === DisplayMode.Read}
    onConfigure={onConfigure}
  />
);

export default HtmlFileViewerPlaceholder;
