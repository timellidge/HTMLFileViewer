import * as React from 'react';
import { useState, useEffect, useRef, useMemo } from 'react';
import { mergeStyles, Spinner, SpinnerSize, Icon } from '@fluentui/react';
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
  const [tocItems, setTocItems] = useState<{id: string, text: string, level: number}[]>([]);
  const [docTitle, setDocTitle] = useState<string>('');
  const [tocExpanded, setTocExpanded] = useState<boolean>(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Constants
  const TOC_COLLAPSE_DELAY_MS = 500;

  // DOMPurify config: content only — no scripts, styles, or inline style attributes.
  // The web part's injected CSS (via injectCSS) controls styling.
  const SANITIZE_CONFIG: DOMPurify.Config = {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'a', 'img', 'div', 'span', 'table', 'tr', 'td', 'th',
      'thead', 'tbody', 'tfoot', 'section', 'article', 'header', 'footer',
      'blockquote', 'pre', 'code', 'hr', 'b', 'i', 'small', 'sub', 'sup'
    ],
    FORBID_TAGS: ['script', 'style', 'link', 'iframe', 'object', 'embed', 'form'],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'class', 'id', 'title', 'target'],
    FORBID_ATTR: ['style', 'onerror', 'onload', 'onclick', 'onmouseover'],
    ALLOW_DATA_ATTR: false,
  };

  // Sanitize HTML content
  const sanitizeHtml = (html: string): string => {
    return DOMPurify.sanitize(html, SANITIZE_CONFIG);
  };

  // Extract TOC items and add IDs to headings
  const processHtmlForToc = (html: string): {processedHtml: string, toc: {id: string, text: string, level: number}[], title: string} => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const headings = doc.querySelectorAll('h1, h2');
    const toc: {id: string, text: string, level: number}[] = [];
    let title = '';
    let h1Count = 0;
    let h2Count = 0;

    headings.forEach((heading) => {
      const text = heading.textContent || '';
      const level = parseInt(heading.tagName.substring(1));
      let id = heading.id;
      
      // Capture first H1 as document title
      if (level === 1 && !title) {
        title = text;
      }
      
      // Track heading counts and generate ID
      if (level === 1) {
        h1Count++;
        h2Count = 0; // Reset H2 count for each new H1
      } else {
        h2Count++;
      }

      // Generate ID if not present
      if (!id) {
        id = level === 1 ? `Index${h1Count}` : `Index${h1Count}_${h2Count}`;
        heading.id = id;
      }

      toc.push({ id, text, level });
    });

    // Re-sanitize after DOM manipulation to prevent bypass
    const processedHtml = DOMPurify.sanitize(doc.body.innerHTML, SANITIZE_CONFIG);

    return {
      processedHtml,
      toc,
      title: title || 'Document'
    };
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
      
      // Process for TOC
      const { processedHtml, toc, title } = processHtmlForToc(cleanHtml);
      setHtmlContent(processedHtml);
      setTocItems(toc);
      setDocTitle(title);
    } catch (error) {
      console.error('Error fetching HTML:', error);
      setGlobalError(error as Error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedHtmlFile, siteUrl]);

  // Fetch HTML content from SharePoint by document name
  const fetchHtmlContentByDocName = React.useCallback(async (docName: string) => {
    if (!docName || !siteUrl) {
      console.log('Missing required parameters for document name-based fetch');
      return;
    }

    setIsLoading(true);
    setGlobalError(null);

    let fileServerRelativePath = '';
    
    try {
      console.log('Fetching content for document name:', docName);
      
      // Construct the file path using the document name
      // If we have a selectedHtmlFile path, use it as a base to construct the path
      if (selectedHtmlFile) {
        // Extract the folder path from selectedHtmlFile
        const lastSlashIndex = selectedHtmlFile.lastIndexOf('/');
        const folderPath = selectedHtmlFile.substring(0, lastSlashIndex + 1);
        fileServerRelativePath = folderPath + docName + '.html';
        console.log('Constructed path from selectedHtmlFile:', fileServerRelativePath);
      } else if (listId) {
        // Fall back to querying the list if no selectedHtmlFile is available
        console.log('Querying list for document:', docName);
        // Escape single quotes to prevent OData injection
        const safeDocName = docName.replace(/'/g, "''");
        const web = Web(siteUrl);
        const items = await web.lists.getById(listId)
          .items
          .select('FileRef')
          .filter(`FileLeafRef eq '${safeDocName}.html' or FileLeafRef eq '${safeDocName}.htm'`)
          .top(1)
          .get();
        
        if (items.length === 0) {
          throw new Error(`Unable to find "${docName}" in the document library`);
        }
        
        fileServerRelativePath = items[0].FileRef;
        console.log('Found file path from list query:', fileServerRelativePath);
      } else {
        throw new Error('Cannot fetch by document name: no selectedHtmlFile or listId available');
      }

      const web = Web(siteUrl);
      const file = web.getFileByServerRelativePath(fileServerRelativePath);
      const content = await file.getText();
      console.log('Successfully fetched content, length:', content.length);

      // Sanitize HTML
      const cleanHtml = sanitizeHtml(content);
      
      // Process for TOC
      const { processedHtml, toc, title } = processHtmlForToc(cleanHtml);
      setHtmlContent(processedHtml);
      setTocItems(toc);
      setDocTitle(title);
    } catch (error) {
      console.error('Error fetching HTML by document name:', error);
      
      let errorMessage = `Error loading "${docName}"`;
      
      // Check for specific error types
      if (error && typeof error === 'object' && 'status' in error) {
        const httpError = error as { status: number; statusText?: string };
        if (httpError.status === 404) {
          errorMessage = `Unable to find "${docName}" at ${fileServerRelativePath}`;
        } else {
          errorMessage = `Server error (${httpError.status}): ${httpError.statusText || 'Unknown error'}`;
        }
      } else if (error instanceof Error) {
        if (error.message.includes('404') || error.message.includes('does not exist')) {
          errorMessage = `Unable to find "${docName}" at ${fileServerRelativePath}`;
        } else {
          errorMessage += `: ${error.message}`;
        }
      }
      
      setGlobalError(new Error(errorMessage));
    } finally {
      setIsLoading(false);
    }
  }, [selectedHtmlFile, siteUrl, listId]);

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

  // TOC hover handlers
  const handleTocMouseEnter = React.useCallback(() => {
    if (closeTimerRef.current !== null) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setTocExpanded(true);
  }, []);

  const handleContentMouseEnter = React.useCallback(() => {
    if (closeTimerRef.current !== null) {
      clearTimeout(closeTimerRef.current);
    }
    closeTimerRef.current = setTimeout(() => {
      setTocExpanded(false);
      closeTimerRef.current = null;
    }, TOC_COLLAPSE_DELAY_MS);
  }, []);

  const handleContentMouseLeave = React.useCallback(() => {
    if (closeTimerRef.current !== null) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (closeTimerRef.current !== null) {
        clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  // CSS container class
  const _containerClass = useMemo(() => mergeStyles(
    styles.htmlFileViewer,
    {
      marginRight: sidePadding + "px",
      marginLeft: sidePadding + "px"
    }
  ), [sidePadding]);

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
          ) : globalError && !hideErrorEmpty && (receivedDocName || selectedHtmlFile) ? (
            <HtmlFileViewerErrorMessage
              message={globalError.message}
              onDismiss={() => setGlobalError(null)}
            />
          ) : htmlContent ? (
            <div
              className={styles.htmlContentContainer}
              style={{
                height: contentHeight,
                overflowY: 'auto',
                overflowX: 'hidden'
              }}
            >
              {tocItems.length > 0 && (
                <div 
                  className={`${styles.tocBox} ${tocExpanded ? styles.tocExpanded : styles.tocCollapsed}`}
                  onMouseEnter={handleTocMouseEnter}
                  onMouseLeave={handleContentMouseLeave}
                  role="complementary"
                  aria-label="Table of Contents"
                >
                  <div 
                    className={styles.tocHeader}
                    role="button"
                    tabIndex={0}
                    aria-expanded={tocExpanded}
                    aria-label={`Table of Contents: ${receivedDocName || docTitle}`}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTocExpanded(!tocExpanded); } }}
                  >
                    {!tocExpanded && <Icon iconName="BulletedList" className={styles.tocIcon} aria-hidden="true" />}
                    <span className={styles.tocHeaderText}>
                      {tocExpanded ? (receivedDocName || docTitle) : `T.O.C. ${receivedDocName || docTitle}`}
                    </span>
                  </div>
                  <div className={styles.tocContent}>
                    <h3 className={styles.tocTitle}>Contents</h3>
                    <nav className={styles.tocNav} aria-label="Document sections">
                      {tocItems.map((item) => (
                        <a
                          key={item.id}
                          href={`#${item.id}`}
                          className={item.level === 1 ? styles.tocH1 : styles.tocH2}
                          aria-label={`Navigate to ${item.text}`}
                          onClick={(e) => {
                            e.preventDefault();
                            document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' });
                          }}
                        >
                          {item.text}
                        </a>
                      ))}
                    </nav>
                  </div>
                </div>
              )}
              <div
                onMouseEnter={handleContentMouseEnter}
                onMouseLeave={handleContentMouseLeave}
                dangerouslySetInnerHTML={{ __html: htmlContent }}
              />
            </div>
          ) : (
            <div className={styles.emptyState}>
              {emptyMessage || 'No HTML file selected. Please configure the web part.'}
            </div>
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
