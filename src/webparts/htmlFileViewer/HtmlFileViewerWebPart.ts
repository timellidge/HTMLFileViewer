import * as React from 'react';
import * as ReactDom from 'react-dom';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { BaseClientSideWebPart, IWebPartPropertiesMetadata } from '@microsoft/sp-webpart-base';
import {
  DynamicProperty,
} from '@microsoft/sp-component-base';
import { sp } from '@pnp/sp';
import { Web } from '@pnp/sp/webs';

import '@pnp/sp/fields';
import '@pnp/sp/views';
import '@pnp/sp/files';
import '@pnp/sp/lists';

import { IPropertyPaneConfiguration, IPropertyPaneDropdownOption } from '@microsoft/sp-property-pane';
import HtmlFileViewerContainer, { IHtmlFileViewerContainerProps } from './components/HtmlFileViewerContainer';
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
  webPartTag: string;
  selectedHtmlFile: string;
  docName: DynamicProperty<string>;
}
export default class HtmlFileViewerWebPart extends BaseClientSideWebPart<IHtmlFileViewerWebPartProps> {
  private editorProp: typeof import('@pnp/spfx-property-controls/lib/PropertyFieldCodeEditor') | undefined;
  private listProp: typeof import('@pnp/spfx-property-controls/lib/PropertyFieldListPicker') | undefined;
  private msProps: typeof import('@microsoft/sp-property-pane') | undefined;
  private htmlFileOptions: IPropertyPaneDropdownOption[] = [];
  private receivedDocName: string | undefined;
  private _lastInjectedCSS = '';
  private _urlStartParam: string | undefined;
  private _urlParamUsed = false;
  private readonly _renderOnDynamicDataChange = (): void => this.render();

  private get _styleElementId(): string {
    return `html-file-viewer-style-${this.instanceId}`;
  }

  // SCSS module class names are hashed at build time, so match by substring
  private defaultCSS = `<style>
    [class*="htmlContentContainer"] {
        font-size: 0.9rem;
    }
</style>`;

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

    if (!this.properties.docName) {
      this.properties.docName = new DynamicProperty<string>(this.context.dynamicDataProvider);
    }

    this.context.dynamicDataProvider.registerAvailableSourcesChanged(this._renderOnDynamicDataChange);
    this.properties.docName.register(this._renderOnDynamicDataChange);

    // Parse URL parameter for deep linking (once per page load)
    // Match case-insensitively so ?startdoc= and ?Startdoc= both work
    const urlParams = new URLSearchParams(window.location.search);
    let startDocParam: string | null = null;
    urlParams.forEach((value, key) => {
      if (key.toLowerCase() === 'startdoc') {
        startDocParam = value;
      }
    });
    this._urlStartParam = startDocParam || undefined;

    await super.onInit();
    this.properties.webPartCSS =  this.properties.webPartCSS || this.defaultCSS;
  }

  private injectCSS(css: string): void {
    if (!this.properties.webPartTag) {
      return;
    }

    if (css === this._lastInjectedCSS) {
      return;
    }
    this._lastInjectedCSS = css;

    let style = document.getElementById(this._styleElementId);
    if (style) {
      style.parentNode.removeChild(style);
    }

    style = document.createElement('style');
    style.id = this._styleElementId;
    style.textContent = css;
    document.head.appendChild(style);
  }

  public render(): void {
    // Document routing priority:
    //   1. URL deep-link param (?startdoc=). Highest priority on initial page load.
    //      It persists in memory after the address bar is cleaned so the document
    //      stays loaded while the dynamic property is still initialising.
    //   2. Live DynamicProperty value (user clicking the connected/side web part).
    //      Takes over as soon as a non-empty value is available.
    //   3. Default selectedHtmlFile (handled inside the React container).
    let dynamicValue: string | undefined;
    try {
      dynamicValue = this.properties.docName?.tryGetValue();
    } catch {
      dynamicValue = undefined;
    }

    // Hand over control from URL deep-link to dynamic property once a live dynamic
    // value arrives. Until then, keep the URL param active so transient empty values
    // from the still-initialising dynamic source don't clear the document.
    if (this._urlStartParam && dynamicValue !== undefined && dynamicValue !== null && dynamicValue !== '') {
      this.clearUrlParam();
      this._urlStartParam = undefined;
      this.receivedDocName = dynamicValue;
    } else if (this._urlStartParam) {
      this.receivedDocName = this._urlStartParam;
    } else if (dynamicValue !== undefined && dynamicValue !== null && dynamicValue !== '') {
      this.receivedDocName = dynamicValue;
    } else {
      this.receivedDocName = undefined;
    }

    const strippedCSS = (this.properties.webPartCSS || this.defaultCSS).replace(/<style>/g, '').replace(/<\/style>/g, '');
    this.injectCSS(strippedCSS);

    const element: React.ReactElement<IHtmlFileViewerContainerProps> = React.createElement(
      HtmlFileViewerContainer,
      {
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
        webPartTag: this.properties.webPartTag,
        receivedDocName: this.receivedDocName,
        onUrlParamLoaded: this.clearUrlParam,
      },
    );
    ReactDom.render(element, this.domElement);
  }

  private clearUrlParam = (): void => {
    if (!this._urlParamUsed) {
      this._urlParamUsed = true;
      // Remove ?startdoc= parameter from URL without page reload
      const url = new URL(window.location.href);
      const startDocKeys: string[] = [];
      url.searchParams.forEach((_value, key) => {
        if (key.toLowerCase() === 'startdoc') {
          startDocKeys.push(key);
        }
      });
      startDocKeys.forEach((key) => url.searchParams.delete(key));
      window.history.replaceState({}, '', url.toString());
    }
  };

  protected onDispose(): void {
    this.context.dynamicDataProvider.unregisterAvailableSourcesChanged(this._renderOnDynamicDataChange);
    this.properties.docName?.unregister(this._renderOnDynamicDataChange);
    document.getElementById(this._styleElementId)?.remove();
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  private isMissingValues = (strings: string[]): boolean => strings.some((i) => !i);

  private onConfigure = () => {
    this.context.propertyPane.open();
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
      this.context.propertyPane.refresh();
      return;
    }

    try {
      const web = Web(this.properties.siteUrl);
      const items = await web.lists.getById(this.properties.list)
        .items
        .select('FileRef', 'FileLeafRef', 'FSObjType')
        .filter('FSObjType eq 0')
        .orderBy('FileLeafRef', true)
        .top(5000)
        .get();

      this.htmlFileOptions = items
        .filter((item: { FileLeafRef: string; FSObjType: number }) => {
          const name = item.FileLeafRef.toLowerCase();
          return name.endsWith('.html') || name.endsWith('.htm');
        })
        .map((item: { FileRef: string; FileLeafRef: string }) => ({
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

    if (newValue !== oldValue) {
      this.properties.selectedHtmlFile = '';
      this.loadHtmlFiles();
      this.render();
    }
  }

  protected async onPropertyPaneConfigurationStart(): Promise<void> {
    if (this.properties.list && this.properties.siteUrl) {
      await this.loadHtmlFiles();
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
                this.msProps.PropertyPaneDynamicFieldSet({
                  label: 'Document name source',
                  fields: [
                    this.msProps.PropertyPaneDynamicField('docName', {
                      label: 'Document name',
                    }),
                  ],
                  sharedConfiguration: {
                    depth: this.msProps.DynamicDataSharedDepth.Property,
                  },
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
