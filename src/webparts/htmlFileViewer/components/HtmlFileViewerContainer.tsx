import * as React from 'react';
import { useState, useEffect } from 'react';
import { mergeStyles, Spinner, SpinnerSize } from '@fluentui/react';
import styles from './HtmlFileViewer.module.scss';
import { DisplayMode } from '@microsoft/sp-core-library';
import { IReadonlyTheme } from '@microsoft/sp-component-base';
import HtmlFileViewerHeader from './HtmlFileViewerHeader';
import HtmlFileViewerPlaceholder from './HtmlFileViewerPlaceholder';
import HtmlFileViewerErrorMessage from './HtmlFileViewerErrorMessage';
import { Web } from '@pnp/sp/webs';
import '@pnp/sp/files';
import '@pnp/sp/webs';
import * as DOMPurify from 'dompurify';

export interface IHtmlFileViewerContainerProps {
  webPartCSS: string;
  siteUrl: string;
  listId: string;
  selectedHtmlFile: string;
  title: string;
  displayMode: DisplayMode;
  updateProperty: (value: string) => void;
  showTitle: boolean;
  hideErrorEmpty: boolean;
  emptyMessage: string;
  themeVariant: IReadonlyTheme | undefined;
  contentHeight: string;
  sidePadding: number;
  configured: boolean;
  onConfigure(): void;
  contextSiteUrl: string;
  contextUser: string;
  webPartTag: string;
}

const HtmlFileViewerContainer: React.FunctionComponent<IHtmlFileViewerContainerProps> = (props) => {
  // Extract properties from props
  const {
    displayMode, title, updateProperty, showTitle, configured,
    onConfigure, siteUrl, selectedHtmlFile, hideErrorEmpty, emptyMessage,
    contentHeight, sidePadding, webPartTag
  } = props;

  // State variables
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [globalError, setGlobalError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Sanitize HTML content
  const sanitizeHtml = (html: string): string => {
    const clean = DOMPurify.sanitize(html, {
      ALLOWED_TAGS: [
        'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'ul', 'ol', 'li', 'a', 'img', 'div', 'span', 'table', 'tr', 'td', 'th',
        'thead', 'tbody', 'tfoot', 'section', 'article', 'header', 'footer',
        'blockquote', 'pre', 'code', 'hr', 'b', 'i', 'small', 'sub', 'sup'
      ],
      ALLOWED_ATTR: ['href', 'src', 'alt', 'class', 'id', 'style', 'title', 'target'],
      ALLOW_DATA_ATTR: false,
    });

    return clean;
  };

  // Fetch HTML content from SharePoint
  const fetchHtmlContent = React.useCallback(async () => {
    if (!selectedHtmlFile || !siteUrl) {
      setHtmlContent('');
      return;
    }

    setIsLoading(true);
    setGlobalError(null);

    try {
      const web = Web(siteUrl);
      const file = web.getFileByServerRelativePath(selectedHtmlFile);
      const content = await file.getText();

      // Sanitize HTML
      const cleanHtml = sanitizeHtml(content);
      setHtmlContent(cleanHtml);
    } catch (error) {
      console.error('Error fetching HTML:', error);
      setGlobalError(error as Error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedHtmlFile, siteUrl]);

  // Fetch HTML content when selectedHtmlFile changes
  useEffect(() => {
    if (!configured) {
      fetchHtmlContent();
    }
  }, [configured, fetchHtmlContent]);

  // CSS container class
  const _containerClass = mergeStyles(
    styles.htmlFileViewer,
    {
      marginRight: sidePadding + "px",
      marginLeft: sidePadding + "px"
    }
  );

  // Render
  return (
    <div id={webPartTag} className={_containerClass}>
      {!configured ? (
        <>
          <HtmlFileViewerHeader
            displayMode={displayMode}
            title={title}
            updateProperty={updateProperty}
            showTitle={showTitle}
          />

          {isLoading ? (
            <div className={styles.loadingSpinner}>
              <Spinner size={SpinnerSize.large} label="Loading HTML content..." />
            </div>
          ) : htmlContent ? (
            <div
              className={styles.htmlContentContainer}
              style={{
                height: contentHeight,
                overflowY: 'auto',
                overflowX: 'hidden'
              }}
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />
          ) : (
            <div className={styles.emptyState}>
              {emptyMessage || 'No HTML file selected. Please configure the web part.'}
            </div>
          )}

          {globalError && !hideErrorEmpty && (
            <HtmlFileViewerErrorMessage
              message={globalError.message}
              onDismiss={() => setGlobalError(null)}
            />
          )}
        </>
      ) : (
        <HtmlFileViewerPlaceholder
          displayMode={displayMode}
          onConfigure={onConfigure}
        />
      )}
    </div>
  );
};

export default HtmlFileViewerContainer;
