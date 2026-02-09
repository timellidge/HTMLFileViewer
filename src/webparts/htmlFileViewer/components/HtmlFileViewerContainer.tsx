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
import '@pnp/sp/lists';
import '@pnp/sp/folders';
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
  receivedDocName: string | undefined;
}

const HtmlFileViewerContainer: React.FunctionComponent<IHtmlFileViewerContainerProps> = (props) => {
  // Extract properties from props
  const {
    displayMode, title, updateProperty, showTitle, configured,
    onConfigure, siteUrl, selectedHtmlFile, hideErrorEmpty, emptyMessage,
    contentHeight, sidePadding, webPartTag, receivedDocName, listId
  } = props;

  // State variables
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [globalError, setGlobalError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentFileUrl, setCurrentFileUrl] = useState<string>('');

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

  // Fetch HTML content from SharePoint by document name
  const fetchHtmlContentByDocName = React.useCallback(async (docName: string) => {
    if (!docName || !siteUrl) {
      console.log('Missing required parameters for document name-based fetch');
      return;
    }

    setIsLoading(true);
    setGlobalError(null);

    try {
      const web = Web(siteUrl);
      
      let libraryPath: string;
      
      // If we have a selected file, use its path as the base (more efficient)
      if (selectedHtmlFile) {
        // Remove the leaf filename from the selected file path
        const lastSlashIndex = selectedHtmlFile.lastIndexOf('/');
        libraryPath = selectedHtmlFile.substring(0, lastSlashIndex);
        console.log('Using path from selected file:', libraryPath);
      } 
      // Otherwise, query the list to get the root folder path (fallback)
      else if (listId) {
        const list = await web.lists.getById(listId).select('RootFolder/ServerRelativeUrl').expand('RootFolder').get();
        libraryPath = list.RootFolder.ServerRelativeUrl;
        console.log('Using path from list query:', libraryPath);
      } 
      else {
        throw new Error('Unable to determine library path - no selected file or list ID provided');
      }
      
      // URL encode the document name and add .html extension
      const encodedDocName = encodeURIComponent(docName) + '.html';
      
      // Construct the full file path
      const fileUrl = `${libraryPath}/${encodedDocName}`;
      console.log('Constructed file path:', fileUrl);
      
      // Fetch the file content
      const file = web.getFileByServerRelativePath(fileUrl);
      const content = await file.getText();

      // Sanitize HTML
      const cleanHtml = sanitizeHtml(content);
      setHtmlContent(cleanHtml);
      setCurrentFileUrl(fileUrl);
    } catch (error) {
      console.error('Error fetching HTML by document name:', error);
      setGlobalError(error as Error);
      setHtmlContent('');
    } finally {
      setIsLoading(false);
    }
  }, [siteUrl, listId, selectedHtmlFile]);

  // Fetch HTML content from SharePoint by file path
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
      setCurrentFileUrl(selectedHtmlFile);
    } catch (error) {
      console.error('Error fetching HTML:', error);
      setGlobalError(error as Error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedHtmlFile, siteUrl]);

  // Main effect: Fetch HTML content when receivedDocName or selectedHtmlFile changes
  useEffect(() => {
    if (!configured) {
      // Priority 1: Use received document name if available
      if (receivedDocName !== undefined && receivedDocName !== null && receivedDocName !== '') {
        console.log('Using received document name:', receivedDocName);
        fetchHtmlContentByDocName(receivedDocName);
      }
      // Priority 2: Fall back to manually selected file
      else if (selectedHtmlFile) {
        console.log('Using manually selected file:', selectedHtmlFile);
        fetchHtmlContent();
      }
      // No content to display
      else {
        setHtmlContent('');
      }
    }
  }, [configured, receivedDocName, selectedHtmlFile, fetchHtmlContent, fetchHtmlContentByDocName]);

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
            <div>
              {receivedDocName && (
                <div className={styles.idIndicator}>
                  Displaying content for document: {receivedDocName}
                </div>
              )}
              <div
                className={styles.htmlContentContainer}
                style={{
                  height: contentHeight,
                  overflowY: 'auto',
                  overflowX: 'hidden'
                }}
                dangerouslySetInnerHTML={{ __html: htmlContent }}
              />
            </div>
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
