import * as React from 'react';
import { DisplayMode } from '@microsoft/sp-core-library';
import HtmlFileViewerTitle from './HtmlFileViewerTitle';
import styles from './HtmlFileViewer.module.scss';

export interface IHtmlFileViewerHeaderProps {
  displayMode: DisplayMode;
  title: string;
  updateProperty: (value: string) => void;
  showTitle: boolean;
}

const HtmlFileViewerHeader: React.FunctionComponent<IHtmlFileViewerHeaderProps> = ({
  displayMode,
  title,
  updateProperty,
  showTitle
}) => {
  if (!showTitle) {
    return null;
  }

  return (
    <div className={styles.htmlFileViewerHeader}>
      <HtmlFileViewerTitle
        displayMode={displayMode}
        title={title}
        updateProperty={updateProperty}
      />
    </div>
  );
};

export default HtmlFileViewerHeader;
