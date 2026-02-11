// React Imports
import * as React from 'react';
import * as ReactDom from 'react-dom';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import {
  ThemeProvider,
  ThemeChangedEventArgs,
  IReadonlyTheme,
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

}
export default class HtmlFileViewerWebPart extends BaseClientSideWebPart<IHtmlFileViewerWebPartProps> {
  //@typescript-eslint/no-unused-vars
  private themeProvider: ThemeProvider;
  private themeVariant: IReadonlyTheme | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private editorProp: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private listProp: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private msProps: any;
  private htmlFileOptions: IPropertyPaneDropdownOption[] = [];

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const spfxContext: any = {
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

    await super.onInit();
    this.properties.webPartCSS =  this.properties.webPartCSS || this.defaultCSS;
  }

  private injectCSS(css: string): void {
    // Remove the existing <style> element if it exists
    if(!this.properties.webPartTag || this.properties.webPartTag === undefined) {
      console.log("WebPartTag is undefined so nowhere to inject the css");
    } else { 
      console.log("settign style for ", this.properties.webPartTag);
      let style = document.getElementById(this.properties.webPartTag);
      if (style) {
        style.parentNode.removeChild(style);
      }
    
      // Create a new <style> element
      style = document.createElement('style');
      style.id = this.properties.webPartTag;
      style.innerHTML = css;
      document.head.appendChild(style);
    }
  }

 // -----------------------------------------------------------------------------------------------------------------------------
  // RENDER METHOD / RENDER METHOD / RENDER METHOD / RENDER METHOD / RENDER METHOD / RENDER METHOD / RENDER METHOD / RENDER METHOD
  // -----------------------------------------------------------------------------------------------------------------------------
  public render(): void {
    console.log("Rendering HtmlFileViewerWebPart");
    console.log("Properties:", this.properties);

    // Inject the CSS into the document's <style> tag
    this.injectCSS(this.properties.webPartCSS.replace(/<style>/g, '').replace(/<\/style>/g, ''));

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
        themeVariant: this.themeVariant,
        contentHeight: this.properties.contentHeight,
        sidePadding: this.properties.sidePadding,
        onConfigure: this.onConfigure,
        configured: this.hasAllValues([
          this.properties.siteUrl,
          this.properties.list]),
        contextSiteUrl: this.context.pageContext.web.absoluteUrl,
        contextUser: this.context.pageContext.user.loginName,
        webPartTag: this.properties.webPartTag,
      },
    );
    ReactDom.render(element, this.domElement);
  }

  // -----------------------------------------------------------------------------------------------------------------------------
  // OTHER METHODS / OTHER METHODS / OTHER METHODS / OTHER METHODS / OTHER METHODS / OTHER METHODS / OTHER METHODS / OTHER METHODS
  // -----------------------------------------------------------------------------------------------------------------------------
  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  private hasAllValues = (strings: string[]): boolean => strings.filter((i) => (i === '' || i === null)).length > 0;

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

      this.htmlFileOptions = items.map((item: any) => ({
        key: item.FileRef,
        text: item.FileLeafRef
      }));
    } catch (error) {
      console.error('Error loading HTML files:', error);
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
