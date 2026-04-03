// React Imports
import * as React from 'react';
import * as ReactDom from 'react-dom';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { BaseClientSideWebPart, IWebPartPropertiesMetadata } from '@microsoft/sp-webpart-base';
import {
  ThemeProvider,
  ThemeChangedEventArgs,
  IReadonlyTheme,
} from '@microsoft/sp-component-base';
import {
  DynamicProperty,
} from '@microsoft/sp-component-base';
// PnP JS Imports
import { sp } from '@pnp/sp';
import { Web } from '@pnp/sp/webs';

import '@pnp/sp/fields';
import '@pnp/sp/views';
import '@pnp/sp/files';
import '@pnp/sp/lists';

// Container Component Import
import { IPropertyPaneConfiguration, IPropertyPaneDropdownOption } from '@microsoft/sp-property-pane';
import HtmlFileViewerContainer, { IHtmlFileViewerContainerProps } from './components/HtmlFileViewerContainer';
// Utilities Import
import {
  validateSiteExists,
} from '../../helpers/Utilities';



export interface IHtmlFileViewerWebPartProps {
  key:string;
  webPartCSS: string;
  siteUrl: string;
  list: string;
  title: string;
  showTitle: boolean;
  hideErrorEmpty:boolean;
  emptyMessage: string;
  contentHeight: string;
  sidePadding: number;
  configured: boolean;
  contextSiteUrl: string;
  contextUser: string;
  webPartTag: string;
  selectedHtmlFile: string;
  docName: DynamicProperty<string>;
}
export default class HtmlFileViewerWebPart extends BaseClientSideWebPart<IHtmlFileViewerWebPartProps> {
  //@typescript-eslint/no-unused-vars
  private themeProvider: ThemeProvider;
  private themeVariant: IReadonlyTheme | undefined;
  private editorProp: typeof import('@pnp/spfx-property-controls/lib/PropertyFieldCodeEditor') | undefined;
  private listProp: typeof import('@pnp/spfx-property-controls/lib/PropertyFieldListPicker') | undefined;
  private msProps: typeof import('@microsoft/sp-property-pane') | undefined;
  private htmlFileOptions: IPropertyPaneDropdownOption[] = [];
  private receivedDocName: string | undefined;
  private _lastInjectedCSS = '';
  private _urlStartParam: string | undefined;
  private _urlParamUsed = false;

  // -----------------------------------------------------------------------------------------------------------------------------
  // PROPERTY PANE DEFAULT VALUES - PROPERTY PANE DEFAULT VALUES - PROPERTY PANE DEFAULT VALUES - PROPERTY PANE DEFAULT VALUES
  // -----------------------------------------------------------------------------------------------------------------------------
  // icon reference for the icons in the table
  // https://uifabricicons.azurewebsites.net/
  private defaultCSS = `<style>
    .htmlContentContainer{
        font-size: 0.9rem;
    }
</style>`;

  // -----------------------------------------------------------------------------------------------------------------------------
  // SPFX type functions
  // -----------------------------------------------------------------------------------------------------------------------------
  protected async onInit(): Promise<void> {
    const spfxContext = {
      pageContext: this.context.pageContext,
      httpClient: this.context.spHttpClient,
      mode: this.displayMode,
      serverRequestPath: this.context.pageContext.web.serverRelativeUrl,
      siteAbsoluteUrl: this.context.pageContext.web.absoluteUrl,
    };
  
    sp.setup({
      spfxContext: spfxContext,
    });

    this.themeSetup();

    // Initialize dynamic property if not already done
    if (!this.properties.docName) {
      this.properties.docName = new DynamicProperty<string>(this.context.dynamicDataProvider);
    }

    // Set up dynamic data listener (register ONCE here, not in render)
    this.context.dynamicDataProvider.registerAvailableSourcesChanged(this.render.bind(this));

    // Register property changed handler (register ONCE here, not in render)
    this.properties.docName.register(this.render.bind(this));

    // Parse URL parameter for deep linking (once per page load)
    const urlParams = new URLSearchParams(window.location.search);
    this._urlStartParam = urlParams.get('Start') || undefined;
    if (this._urlStartParam) {
      try {
        // Decode URI component to handle special characters
        this._urlStartParam = decodeURIComponent(this._urlStartParam);
      } catch {
        // Invalid URL encoding - use raw value (will fail gracefully during document lookup)
      }
    }

    await super.onInit();
    this.properties.webPartCSS =  this.properties.webPartCSS || this.defaultCSS;
  }

  private injectCSS(css: string): void {
    if (!this.properties.webPartTag) {
      return;
    }

    // Skip if CSS hasn't changed
    if (css === this._lastInjectedCSS) {
      return;
    }
    this._lastInjectedCSS = css;

    // Remove the existing <style> element if it exists
    let style = document.getElementById(this.properties.webPartTag);
    if (style) {
      style.parentNode.removeChild(style);
    }

    // Create a new <style> element — use textContent to prevent HTML injection
    style = document.createElement('style');
    style.id = this.properties.webPartTag;
    style.textContent = css;
    document.head.appendChild(style);
  }

 // -----------------------------------------------------------------------------------------------------------------------------
  // RENDER METHOD / RENDER METHOD / RENDER METHOD / RENDER METHOD / RENDER METHOD / RENDER METHOD / RENDER METHOD / RENDER METHOD
  // -----------------------------------------------------------------------------------------------------------------------------
  public render(): void {
    // Priority: URL parameter (first load only) > DynamicProperty
    if (this._urlStartParam && !this._urlParamUsed) {
      // Use URL param with highest priority (cleared after first successful load)
      this.receivedDocName = this._urlStartParam;
    } else {
      // Fall back to DynamicProperty
      try {
        this.receivedDocName = this.properties.docName?.tryGetValue();
      } catch (error) {
        this.receivedDocName = undefined;
      }
    }

    // Inject the CSS into the document's <style> tag
    const strippedCSS = this.properties.webPartCSS.replace(/<style>/g, '').replace(/<\/style>/g, '');
    this.injectCSS(strippedCSS);

    const element: React.ReactElement<IHtmlFileViewerContainerProps> = React.createElement(
      HtmlFileViewerContainer,
      {
        webPartCSS: this.properties.webPartCSS,
        siteUrl: this.properties.siteUrl,
        listId: this.properties.list,
        selectedHtmlFile: this.properties.selectedHtmlFile,
        title: this.properties.title,
        displayMode: this.displayMode,
        updateProperty: (value: string) => {
          this.properties.title = value;
        },
        showTitle: this.properties.showTitle,
        hideErrorEmpty:this.properties.hideErrorEmpty,
        emptyMessage: this.properties.emptyMessage,
        contentHeight: this.properties.contentHeight,
        sidePadding: this.properties.sidePadding,
        onConfigure: this.onConfigure,
        configured: !this.isMissingValues([
          this.properties.siteUrl,
          this.properties.list]),
        contextSiteUrl: this.context.pageContext.web.absoluteUrl,
        contextUser: this.context.pageContext.user.loginName,
        webPartTag: this.properties.webPartTag,
        receivedDocName: this.receivedDocName,
        onUrlParamLoaded: this.clearUrlParam,
      },
    );
    ReactDom.render(element, this.domElement);
  }

  private clearUrlParam = (): void => {
    if (this._urlStartParam && !this._urlParamUsed) {
      this._urlParamUsed = true;
      // Remove ?Start= parameter from URL without page reload
      const url = new URL(window.location.href);
      url.searchParams.delete('Start');
      window.history.replaceState({}, '', url.toString());
    }
  };

  // -----------------------------------------------------------------------------------------------------------------------------
  // OTHER METHODS / OTHER METHODS / OTHER METHODS / OTHER METHODS / OTHER METHODS / OTHER METHODS / OTHER METHODS / OTHER METHODS
  // -----------------------------------------------------------------------------------------------------------------------------
  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  private isMissingValues = (strings: string[]): boolean => strings.some((i) => !i);

  private onConfigure = () => {
    this.context.propertyPane.open();
  };

  private themeSetup() {
    this.themeProvider = this.context.serviceScope.consume(
      ThemeProvider.serviceKey,
    );
    this.themeVariant = this.themeProvider.tryGetTheme();
    this.themeProvider.themeChangedEvent.add(this, this.handleThemeChangedEvent);
  }

  private handleThemeChangedEvent = (args: ThemeChangedEventArgs): void => {
    this.themeVariant = args.theme;
    this.render();
  };

  protected get propertiesMetadata(): IWebPartPropertiesMetadata {
    return {
      'docName': {
        dynamicPropertyType: 'string'
      }
    };
  }

  private async loadHtmlFiles(): Promise<void> {
    if (!this.properties.list || !this.properties.siteUrl) {
      this.htmlFileOptions = [];
      return;
    }

    try {
      const web = Web(this.properties.siteUrl);
      const items = await web.lists.getById(this.properties.list)
        .items
        .select('FileRef', 'FileLeafRef')
        .filter("(substringof('.html', FileLeafRef) or substringof('.htm', FileLeafRef))")
        .get();

      this.htmlFileOptions = items.map((item: { FileRef: string; FileLeafRef: string }) => ({
        key: item.FileRef,
        text: item.FileLeafRef
      }));
    } catch (error) {
      this.htmlFileOptions = [];
    }

    this.context.propertyPane.refresh();
  }

  private onPropertyFieldListPickerChanged(
    targetProperty: keyof IHtmlFileViewerWebPartProps,
    oldValue: unknown,
    newValue: unknown,
  ) {
    const oldListValue = this.properties[targetProperty];
    this.onPropertyPaneFieldChanged(targetProperty as string, oldListValue, newValue);

    if (newValue !== '') {
      this.properties.selectedHtmlFile = '';
      this.loadHtmlFiles();
      this.render();
    }
  }
  
  protected async loadPropertyPaneResources(): Promise<void> {
    const editorPropImport = import(
      /* webpackChunkName: 'htmlfileviewer' */
      '@pnp/spfx-property-controls/lib/PropertyFieldCodeEditor'
    );

    const listPropImport = import(
      /* webpackChunkName: 'htmlfileviewer' */
      '@pnp/spfx-property-controls/lib/PropertyFieldListPicker'
    );

    const msPropsImport = import(
      /* webpackChunkName: 'htmlfileviewer' */
      '@microsoft/sp-property-pane'
    );

    const controls = await Promise.all([
      editorPropImport,
      listPropImport,
      msPropsImport,
    ]);

    // eslint-disable-next-line prefer-destructuring
    this.editorProp = controls[0];
    // eslint-disable-next-line prefer-destructuring
    this.listProp = controls[1];
    // eslint-disable-next-line prefer-destructuring
    this.msProps = controls[2];
  }
  
  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          groups: [
            {
              groupName: 'Configuration',
              groupFields: [
                this.msProps.PropertyPaneTextField('webPartTag', {
                  label: 'Web Part Tag',
                  value: this.properties.webPartTag,
                }),
                this.msProps.PropertyPaneTextField('siteUrl', {
                  label: 'Site',
                  value: this.properties.siteUrl,
                  onGetErrorMessage: validateSiteExists,
                  deferredValidationTime: 500,
                }),
                this.listProp.PropertyFieldListPicker('list', {
                  label: 'List',
                  selectedList: this.properties.list,
                  includeHidden: false,
                  orderBy: this.listProp.PropertyFieldListPickerOrderBy.Title,
                  disabled: this.properties.siteUrl === '',
                  onPropertyChange: this.onPropertyFieldListPickerChanged.bind(this),
                  properties: this.properties,
                  context: this.context,
                  onGetErrorMessage: null,
                  deferredValidationTime: 0,
                  key: 'list',
                  webAbsoluteUrl: this.properties.siteUrl,
                }),
                this.msProps.PropertyPaneDropdown('selectedHtmlFile', {
                  label: 'HTML File',
                  options: this.htmlFileOptions,
                  disabled: this.properties.list === '',
                  selectedKey: this.properties.selectedHtmlFile,
                }),
                this.msProps.PropertyPaneToggle('showTitle', {
                  label: 'Show Title',
                  checked: this.properties.showTitle,
                }),
                this.msProps.PropertyPaneToggle('hideErrorEmpty', {
                  label: 'Hide On Error or Empty',
                  checked: this.properties.hideErrorEmpty,
                }),
                this.msProps.PropertyPaneTextField('emptyMessage', {
                  label: 'Message to show when empty',
                  value: this.properties.emptyMessage,
                }),
                this.msProps.PropertyPaneSlider('sidePadding', {
                  label: 'Set a gutter width (px)',
                  min: 0,
                  max: 200,
                  step: 10,
                  showValue: true,
                  value: this.properties.sidePadding,
                }),
                this.msProps.PropertyPaneTextField('contentHeight', {
                  label: 'Content Height',
                  value: this.properties.contentHeight,
                }),

              ],
            },
          ],
        },
        {
          header: {
            description: "Additional CSS"
          },
          groups: [
            {
              groupName: "User defined CSS",
              groupFields: [
                this.editorProp.PropertyFieldCodeEditor('webPartCSS', {
                  label: 'Web Part CSS',
                  panelTitle: 'Edit Web Part CSS',
                  initialValue: this.properties.webPartCSS,
                  onPropertyChange: this.onPropertyPaneFieldChanged.bind(this),
                  properties: this.properties,
                  disabled: false,
                  key: 'webPartCSS',
                  language: this.editorProp.PropertyFieldCodeEditorLanguages.HTML,
                })
              ]
            },
          ]
        }
      ],
    };
  }
}
