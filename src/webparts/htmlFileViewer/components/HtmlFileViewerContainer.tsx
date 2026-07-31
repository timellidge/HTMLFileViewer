import * as React from 'react';
import { useState, useEffect, useRef, useMemo } from 'react';
import { mergeStyles, Spinner, SpinnerSize, Icon, ActionButton } from '@fluentui/react';
import styles from './HtmlFileViewer.module.scss';
import { DisplayMode } from '@microsoft/sp-core-library';
import HtmlFileViewerHeader from './HtmlFileViewerHeader';
import HtmlFileViewerPlaceholder from './HtmlFileViewerPlaceholder';
import HtmlFileViewerErrorMessage from './HtmlFileViewerErrorMessage';
import { Web } from '@pnp/sp/webs';
import '@pnp/sp/files';
import '@pnp/sp/webs';
import * as DOMPurify from 'dompurify';

interface ITocItem {
  id: string;
  text: string;
  level: number;
}

interface IDocumentPaths {
  baseName: string;
  folderPath: string;
  pdfPath: string;
}

interface INormalizedDocumentName {
  baseName: string;
  fileName: string;
  hasExtension: boolean;
}

const PDF_EXTENSION = '.pdf';

function normalizeDocumentName(docName: string): INormalizedDocumentName {
  const normalizedName = docName.replace(/%20/gi, ' ').trim();
  const hasControlCharacter = normalizedName
    .split('')
    .some((character) => {
      const characterCode = character.charCodeAt(0);
      return characterCode <= 31 || characterCode === 127;
    });

  if (
    !normalizedName
    || hasControlCharacter
    || /[\\/]/.test(normalizedName)
    || /%(?:25)*(?:2f|5c)/i.test(normalizedName)
  ) {
    throw new Error('Invalid document name');
  }

  const extensionMatch = normalizedName.match(/\.html?$/i);
  const baseName = extensionMatch
    ? normalizedName.substring(0, normalizedName.length - extensionMatch[0].length)
    : normalizedName;

  if (!baseName) {
    throw new Error('Invalid document name');
  }

  return {
    baseName,
    fileName: extensionMatch ? normalizedName : `${normalizedName}.html`,
    hasExtension: extensionMatch !== null,
  };
}

/** Extract folder, base name and sibling PDF path from a server-relative HTML file path */
function getDocumentPaths(htmlFilePath: string): IDocumentPaths | undefined {
  const lastSlashIndex = htmlFilePath.lastIndexOf('/');
  if (lastSlashIndex === -1) {
    return undefined;
  }

  const folderPath = htmlFilePath.substring(0, lastSlashIndex + 1);
  const fileName = htmlFilePath.substring(lastSlashIndex + 1);
  const baseName = fileName.replace(/\.html?$/i, '');

  if (!baseName) {
    return undefined;
  }

  const pdfPath = folderPath + baseName + PDF_EXTENSION;

  return { baseName, folderPath, pdfPath };
}

const TOC_COLLAPSE_DELAY_MS = 500;
const WINDOW_TITLE_SEPARATOR = ' | ';

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

const MAX_CONTENT_SIZE = 10 * 1024 * 1024; // 10MB

/** Map fetch errors to a user-friendly message without exposing raw request internals */
function getFriendlyErrorMessage(error: unknown, docName: string): string {
  if (error && typeof error === 'object' && 'status' in error) {
    const httpError = error as { status: number; statusText?: string };
    return httpError.status === 404
      ? `Unable to find "${docName}"`
      : `Server error (${httpError.status}): ${httpError.statusText || 'Unknown error'}`;
  }
  if (error instanceof Error) {
    return error.message.includes('404') || error.message.includes('does not exist')
      ? `Unable to find "${docName}"`
      : `Error loading "${docName}": ${error.message}`;
  }
  return `Error loading "${docName}"`;
}

/** Sanitize HTML string, extract TOC headings, and add navigation IDs */
function sanitizeAndProcessHtml(rawHtml: string): { processedHtml: string; toc: ITocItem[]; title: string } {
  // Sanitize the raw HTML string first
  const cleanHtml = DOMPurify.sanitize(rawHtml, SANITIZE_CONFIG);

  // Parse the sanitized HTML to extract TOC and add heading IDs
  const parser = new DOMParser();
  const doc = parser.parseFromString(cleanHtml, 'text/html');

  const headings = doc.querySelectorAll('h1, h2');
  const toc: ITocItem[] = [];
  let title = '';
  let h1Count = 0;
  let h2Count = 0;

  headings.forEach((heading) => {
    const text = heading.textContent || '';
    const level = parseInt(heading.tagName.substring(1), 10);
    let id = heading.id;

    if (level === 1 && !title) {
      title = text;
    }

    if (level === 1) {
      h1Count++;
      h2Count = 0;
    } else {
      h2Count++;
    }

    if (!id) {
      id = level === 1 ? `Index${h1Count}` : `Index${h1Count}_${h2Count}`;
      heading.id = id;
    }

    toc.push({ id, text, level });
  });

  // Only controlled id attributes were added to already-sanitized content
  return {
    processedHtml: doc.body.innerHTML,
    toc,
    title: title || 'Document',
  };
}

export interface IHtmlFileViewerContainerProps {
  siteUrl: string;
  listId: string;
  selectedHtmlFile: string;
  title: string;
  displayMode: DisplayMode;
  updateProperty: (value: string) => void;
  showTitle: boolean;
  hideErrorEmpty: boolean;
  emptyMessage: string;
  contentHeight: string;
  sidePadding: number;
  configured: boolean;
  onConfigure(): void;
  webPartTag: string;
  receivedDocName: string | undefined;
  onUrlParamLoaded: () => void;
}

const HtmlFileViewerContainer: React.FunctionComponent<IHtmlFileViewerContainerProps> = (props) => {
  // Extract properties from props
  const {
    displayMode, title, updateProperty, showTitle, configured,
    onConfigure, siteUrl, selectedHtmlFile, hideErrorEmpty, emptyMessage,
    contentHeight, sidePadding, webPartTag, receivedDocName, listId,
    onUrlParamLoaded
  } = props;

  // State variables
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [globalError, setGlobalError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [tocItems, setTocItems] = useState<ITocItem[]>([]);
  const [docTitle, setDocTitle] = useState<string>('');
  const [tocExpanded, setTocExpanded] = useState<boolean>(false);
  const [currentFilePath, setCurrentFilePath] = useState<string>('');
  const [pdfUrl, setPdfUrl] = useState<string>('');
  const [shareUrl, setShareUrl] = useState<string>('');
  const [shareCopied, setShareCopied] = useState<boolean>(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shareTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const originalTitleRef = useRef<string>(document.title);
  const isInitialLoadRef = useRef<boolean>(true);

  const clearDocumentState = React.useCallback((): void => {
    setHtmlContent('');
    setTocItems([]);
    setDocTitle('');
    setCurrentFilePath('');
    setPdfUrl('');
    setShareUrl('');
    setShareCopied(false);
    setTocExpanded(false);

    if (shareTimerRef.current !== null) {
      clearTimeout(shareTimerRef.current);
      shareTimerRef.current = null;
    }
    if (scrollTimerRef.current !== null) {
      clearTimeout(scrollTimerRef.current);
      scrollTimerRef.current = null;
    }
  }, []);

  const scrollPageToTop = React.useCallback((): void => {
    if (scrollTimerRef.current !== null) {
      clearTimeout(scrollTimerRef.current);
    }

    scrollTimerRef.current = setTimeout(() => {
      document
        .querySelectorAll('[data-automation-id="contentScrollRegion"], .spPageContentTransition, #s4-workspace, main, article')
        .forEach((element) => element.scrollTo({ top: 0, behavior: 'smooth' }));
      window.scrollTo({ top: 0, behavior: 'smooth' });
      scrollTimerRef.current = null;
    }, 50);
  }, []);

  const processAndSetContent = React.useCallback((content: string): void => {
    if (content.length > MAX_CONTENT_SIZE) {
      throw new Error('File too large to display safely');
    }
    const { processedHtml, toc, title } = sanitizeAndProcessHtml(content);
    setHtmlContent(processedHtml);
    setTocItems(toc);
    setDocTitle(title);

    // Scroll the SharePoint page to the top on subsequent loads only
    if (!isInitialLoadRef.current) {
      scrollPageToTop();
    }
    isInitialLoadRef.current = false;
  }, [scrollPageToTop]);

  const fetchHtmlContent = React.useCallback(async (token: { cancelled: boolean }) => {
    if (!selectedHtmlFile || !siteUrl) {
      if (!token.cancelled) {
        clearDocumentState();
      }
      return;
    }

    if (!token.cancelled) {
      clearDocumentState();
      setIsLoading(true);
      setGlobalError(null);
    }

    try {
      const web = Web(siteUrl);
      const file = web.getFileByServerRelativePath(selectedHtmlFile);
      const content = await file.getText();
      if (token.cancelled) {
        return;
      }
      processAndSetContent(content);
      setCurrentFilePath(selectedHtmlFile);
    } catch (error) {
      if (token.cancelled) {
        return;
      }
      clearDocumentState();
      const fileName = selectedHtmlFile.substring(selectedHtmlFile.lastIndexOf('/') + 1);
      setGlobalError(new Error(getFriendlyErrorMessage(error, fileName)));
    } finally {
      if (!token.cancelled) {
        setIsLoading(false);
      }
    }
  }, [selectedHtmlFile, siteUrl, processAndSetContent, clearDocumentState]);

  // Fetch HTML content from SharePoint by document name
  const fetchHtmlContentByDocName = React.useCallback(async (docName: string, token: { cancelled: boolean }) => {
    if (!docName || !siteUrl) {
      return;
    }

    if (!token.cancelled) {
      clearDocumentState();
      setIsLoading(true);
      setGlobalError(null);
    }

    let fileServerRelativePath = '';
    
    try {
      const normalizedDocument = normalizeDocumentName(docName);

      // Construct the file path using the document name
      if (selectedHtmlFile) {
        const lastSlashIndex = selectedHtmlFile.lastIndexOf('/');
        const folderPath = selectedHtmlFile.substring(0, lastSlashIndex + 1);
        // Don't encode - getFileByServerRelativePath() handles URL encoding internally
        fileServerRelativePath = folderPath + normalizedDocument.fileName;
      } else if (listId) {
        // Escape single quotes to prevent OData injection
        const fileNames = normalizedDocument.hasExtension
          ? [normalizedDocument.fileName]
          : [`${normalizedDocument.baseName}.html`, `${normalizedDocument.baseName}.htm`];
        const fileFilter = fileNames
          .map((fileName) => `FileLeafRef eq '${fileName.replace(/'/g, "''")}'`)
          .join(' or ');
        const web = Web(siteUrl);
        const items = await web.lists.getById(listId)
          .items
          .select('FileRef')
          .filter(fileFilter)
          .top(1)
          .get();
        
        if (items.length === 0) {
          throw new Error(`Unable to find "${docName}" in the document library`);
        }
        
        fileServerRelativePath = items[0].FileRef;
      } else {
        throw new Error('Cannot fetch by document name: no selectedHtmlFile or listId available');
      }

      const web = Web(siteUrl);
      const file = web.getFileByServerRelativePath(fileServerRelativePath);
      const content = await file.getText();

      if (token.cancelled) {
        return;
      }

      processAndSetContent(content);
      setCurrentFilePath(fileServerRelativePath);
      
      onUrlParamLoaded();
    } catch (error) {
      if (token.cancelled) {
        return;
      }
      clearDocumentState();
      setGlobalError(new Error(getFriendlyErrorMessage(error, docName)));
    } finally {
      if (!token.cancelled) {
        setIsLoading(false);
      }
    }
  }, [selectedHtmlFile, siteUrl, listId, processAndSetContent, onUrlParamLoaded, clearDocumentState]);

  // Main effect: Fetch HTML content when receivedDocName or selectedHtmlFile changes
  useEffect(() => {
    const token = { cancelled: false };

    if (configured) {
      // Priority 1: Use received document name if available
      if (receivedDocName !== undefined && receivedDocName !== null && receivedDocName !== '') {
        fetchHtmlContentByDocName(receivedDocName, token);
      }
      // Priority 2: Fall back to manually selected file
      else if (selectedHtmlFile) {
        fetchHtmlContent(token);
      }
      // No content to display
      else {
        clearDocumentState();
        setGlobalError(null);
        setIsLoading(false);
      }
    } else {
      clearDocumentState();
      setGlobalError(null);
      setIsLoading(false);
    }

    return () => { token.cancelled = true; };
  }, [configured, receivedDocName, selectedHtmlFile, fetchHtmlContent, fetchHtmlContentByDocName, clearDocumentState]);

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

  const handleTocKeyDown = React.useCallback((event: React.KeyboardEvent<HTMLDivElement>): void => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setTocExpanded((expanded) => !expanded);
    }
  }, []);

  const handleTocCloseKeyDown = React.useCallback((event: React.KeyboardEvent<HTMLDivElement>): void => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setTocExpanded(false);
    }
  }, []);

  // Update browser tab title in read mode when a document is loaded
  useEffect(() => {
    if (displayMode !== DisplayMode.Read) {
      return;
    }

    const resolvedPaths = currentFilePath ? getDocumentPaths(currentFilePath) : undefined;
    const activeDocumentName = receivedDocName || resolvedPaths?.baseName || docTitle || '';

    if (activeDocumentName) {
      document.title = `${activeDocumentName}${WINDOW_TITLE_SEPARATOR}${originalTitleRef.current}`;
    } else {
      document.title = originalTitleRef.current;
    }

    return () => {
      document.title = originalTitleRef.current;
    };
  }, [displayMode, receivedDocName, currentFilePath, docTitle]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (closeTimerRef.current !== null) {
        clearTimeout(closeTimerRef.current);
      }
      if (shareTimerRef.current !== null) {
        clearTimeout(shareTimerRef.current);
      }
      if (scrollTimerRef.current !== null) {
        clearTimeout(scrollTimerRef.current);
      }
    };
  }, []);

  const handleShareClick = React.useCallback(async () => {
    if (!shareUrl) {
      return;
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setShareCopied(true);

      if (shareTimerRef.current !== null) {
        clearTimeout(shareTimerRef.current);
      }

      shareTimerRef.current = setTimeout(() => {
        setShareCopied(false);
        shareTimerRef.current = null;
      }, 2000);
    } catch {
      // Ignore clipboard copy failures
    }
  }, [shareUrl]);

  // Detect sibling PDF and build share URL when the loaded document changes
  useEffect(() => {
    let cancelled = false;

    setPdfUrl('');
    setShareUrl('');

    if (!currentFilePath || !siteUrl) {
      return;
    }

    const paths = getDocumentPaths(currentFilePath);
    if (!paths) {
      return;
    }

    const checkPdfAndBuildShareUrl = async (): Promise<void> => {
      try {
        await Web(siteUrl).getFileByServerRelativePath(paths.pdfPath).get();
        if (!cancelled) {
          setPdfUrl(new URL(paths.pdfPath, siteUrl).href);
        }
      } catch {
        if (!cancelled) {
          setPdfUrl('');
        }
      }

      if (!cancelled) {
        const shareLink = new URL(window.location.href);
        shareLink.searchParams.set('startdoc', paths.baseName);
        setShareUrl(shareLink.toString());
      }
    };

    checkPdfAndBuildShareUrl();

    return () => { cancelled = true; };
  }, [currentFilePath, siteUrl]);

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
      {configured ? (
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
              ref={contentRef}
              className={styles.htmlContentContainer}
              style={{ height: contentHeight }}
            >
              <div
                className={styles.htmlContentScroll}
                onMouseEnter={handleContentMouseEnter}
                dangerouslySetInnerHTML={{ __html: htmlContent }}
              />
              {tocItems.length > 0 && (
                <div className={styles.tocRail}>
                  <div className={styles.tocSticky}>
                    <div className={styles.tocStrip}>
                      <div
                        className={styles.tocStripTab}
                        onMouseEnter={handleTocMouseEnter}
                        onMouseLeave={handleContentMouseEnter}
                        role="button"
                        tabIndex={0}
                        aria-expanded={tocExpanded}
                        aria-label={`Open Table of Contents: ${receivedDocName || docTitle}`}
                        onKeyDown={handleTocKeyDown}
                      >
                        {!tocExpanded && (
                          <div className={styles.tocStripInner}>
                            <Icon iconName="BulletedList" className={styles.tocIcon} aria-hidden="true" />
                            <span className={styles.tocStripText}>{`T.O.C.${(receivedDocName || docTitle) ? ` ${receivedDocName || docTitle}` : ''}`}</span>
                          </div>
                        )}
                      </div>
                      {currentFilePath && (
                        <div className={styles.tocActionsPanel} role="complementary" aria-label="Document actions">
                          {pdfUrl ? (
                            <button
                              type="button"
                              title="Open PDF in a new tab"
                              aria-label="Open PDF in a new tab"
                              className={styles.tocActionButton}
                              onClick={() => window.open(pdfUrl, '_blank', 'noopener,noreferrer')}
                            >
                              <Icon iconName="PDF" className={styles.tocActionIcon} />
                            </button>
                          ) : (
                            <span
                              className={styles.tocActionDisabled}
                              title="No matching PDF found"
                              aria-label="No matching PDF found"
                              role="button"
                              aria-disabled="true"
                            >
                              <Icon iconName="PDF" className={styles.tocActionIcon} />
                            </span>
                          )}
                          <ActionButton
                            iconProps={{ iconName: shareCopied ? 'CheckMark' : 'Share' }}
                            onClick={handleShareClick}
                            disabled={!shareUrl}
                            title="Copy share link to clipboard"
                            aria-label="Copy share link to clipboard"
                            className={styles.tocActionButton}
                          />
                          <ActionButton
                            iconProps={{ iconName: 'Up' }}
                            onClick={scrollPageToTop}
                            title="Scroll to top"
                            aria-label="Scroll to top"
                            className={styles.tocActionButton}
                          />
                        </div>
                      )}
                    </div>
                    {tocExpanded && (
                      <div
                        className={styles.tocPanel}
                        onMouseEnter={handleTocMouseEnter}
                        onMouseLeave={handleContentMouseEnter}
                        role="complementary"
                        aria-label="Table of Contents"
                      >
                        <div
                          className={styles.tocPanelHeader}
                          onClick={() => setTocExpanded(false)}
                          role="button"
                          tabIndex={0}
                          aria-label="Close Table of Contents"
                          onKeyDown={handleTocCloseKeyDown}
                        >
                          <span className={styles.tocHeaderText}>{receivedDocName || docTitle}</span>
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
                                  contentRef.current?.querySelector(`#${CSS.escape(item.id)}`)?.scrollIntoView({ behavior: 'smooth' });
                                }}
                              >
                                {item.text}
                              </a>
                            ))}
                          </nav>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
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
