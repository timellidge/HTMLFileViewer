
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
import { IViewInfo } from '@pnp/sp/views';
import { IFieldInfo } from '@pnp/sp/fields';
import '@pnp/sp/fields';
import '@pnp/sp/views';
// Fabric UI Imports
import { IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';

// Container Component Import
import { IPropertyPaneConfiguration, IPropertyPanePage } from '@microsoft/sp-property-pane';
import TableViewerContainer, { ITableViewerContainerProps } from './components/TableViewerContainer';
import { IColumnsConfig } from '../../helpers/Interfaces';
// Utilities Import
import {
  getListFields, getListViewXml, validateSiteExists,
} from '../../helpers/Utilities';



export interface ITableViewerWebPartProps {
  key:string;
  JSONCode: string;
  webPartCSS: string;
  siteUrl: string;
  list: string;
  view: string;
  viewXmlCode: string;
  title: string;
  showTitle: boolean;
  showFind: boolean;
  hideErrorEmpty:boolean;
  contentHeight: string;
  configured: boolean;
  contextSiteUrl: string;
  contextUser: string;
  webPartTag: string;
  
}
export default class TableViewerWebPart extends BaseClientSideWebPart<ITableViewerWebPartProps> {
  //@typescript-eslint/no-unused-vars
  private shouldRerender = false;
  private linkFieldOptions: IDropdownOption[];

  private themeProvider: ThemeProvider;

  private themeVariant: IReadonlyTheme | undefined;

  private propertyPaneControls: IPropertyPanePage[];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private editorProp: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private listProp: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private viewProp: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private msProps: any;

  // -----------------------------------------------------------------------------------------------------------------------------
  // PROPERTY PANE DEFAULT VALUES - PROPERTY PANE DEFAULT VALUES - PROPERTY PANE DEFAULT VALUES - PROPERTY PANE DEFAULT VALUES
  // -----------------------------------------------------------------------------------------------------------------------------

  private tableConfig: IColumnsConfig = {
    "id": {
      "name": "ident",
      "width": "40px",
      "tab": false,
      "calculatedPX": 0,
      "type": "number"
    },
    "LinkTitle": {
      "name": "title",
      "width": "14%"
    },
    "BSAStrapline": {
      "name": "StrapLine",
      "width": "1fr",
      "lines": 2
    },
    "BSADescription": {
      "name": "desc",
      "width": "2fr",
      "lines": 3
    },
    "BSAColor": {
      "name": "Color",
      "width": "0.5fr",
      "tab": true
    }
  }

  private defaultCSS = `<style>
  .testclass{color: #cc1111;}
  .ID{border:1px solid yellow;}
  .Title{border:1px solid rgb(0, 153, 255)};
  .BSADescription{border:1px solid green;}
  .singlechoice{border:1px solid #56acd1;}
  .multichoice{border:1px solid #ff00f7;}
  .BSAColor{border:1px solid rgb(121, 118, 118);}
  .BSAStart{border:1px solid #ff7300;}
  .BSAEnd{border:1px solid rgb(15, 15, 15);}
  .PersonField{border:1px solid rgb(93, 17, 17);}
  .Stack{border:1px solid rgb(0, 255, 64);}
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
    this.properties.JSONCode   =  this.properties.JSONCode   || JSON.stringify(this.tableConfig);
    this.properties.webPartCSS =  this.properties.webPartCSS || this.defaultCSS;
  }

  protected onPropertyPaneConfigurationComplete(): void {
    super.onPropertyPaneConfigurationComplete();
    
    // Toggle a variable to force re-render
    this.shouldRerender = !this.shouldRerender;
    
    // Trigger the re-render
    this.render();
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
    console.log("Rendering TableViewerWebPart");
    console.log("Display Mode:", this.displayMode);
    console.log("Properties:", this.properties);

    // Inject the CSS into the document's <style> tag
    this.injectCSS(this.properties.webPartCSS.replace(/<style>/g, '').replace(/<\/style>/g, ''));

    const element: React.ReactElement<ITableViewerContainerProps> = React.createElement(
      TableViewerContainer,
      {
        key: this.shouldRerender ? 'forceUpdate1' : 'forceUpdate2', // This forces React to re-render
        JSONCode: this.properties.JSONCode,
        webPartCSS: this.properties.webPartCSS,
        siteUrl: this.properties.siteUrl,
        listId: this.properties.list,
        viewXmlCode: this.properties.viewXmlCode,
        title: this.properties.title,
        displayMode: this.displayMode,
        updateProperty: (value: string) => {
          this.properties.title = value;
        },
        showTitle: this.properties.showTitle,
        showFind: this.properties.showFind,
        hideErrorEmpty:this.properties.hideErrorEmpty,
        themeVariant: this.themeVariant,
        contentHeight: this.properties.contentHeight,
        onConfigure: this.onConfigure,
        configured: this.hasAllValues([
          this.properties.siteUrl,
          this.properties.view,
          this.properties.viewXmlCode,
          this.properties.JSONCode,
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



  private onPropertyFieldViewPickerChanged(
    targetProperty: keyof ITableViewerWebPartProps,
    oldValue: unknown,
    newValue: unknown,
  ) {
    const oldViewValue = this.properties[targetProperty];
    this.onPropertyPaneFieldChanged(targetProperty as string, oldViewValue, newValue);
    
    if (newValue !== '') {
      getListViewXml(this.properties.siteUrl, this.properties.list, this.properties.view)
        .then(this.updateFieldViewPickerValue.bind(this));
    } else {
      this.updateFieldViewPickerValue();
    }
  
    // Call render to immediately reflect changes
    this.render();
  }


  private updateFieldViewPickerValue(value?: IViewInfo) {
    this.properties.viewXmlCode = value ? value.ListViewXml : '';
    this.context.propertyPane.refresh();
    this.render(); // Re-render the web part when view picker value is updated
  }


  private onPropertyFieldListPickerChanged(
    targetProperty: keyof ITableViewerWebPartProps,
    oldValue: unknown,
    newValue: unknown,
  ) {
    const oldViewValue = this.properties[targetProperty];
    this.onPropertyPaneFieldChanged(targetProperty as string, oldViewValue, newValue);
    
    if (newValue !== '') {
      getListFields(this.properties.siteUrl, this.properties.list)
        .then(this.updateFieldListPickerOptions.bind(this));
    } else {
      this.properties.view = '';
      this.context.propertyPane.refresh();
      this.render(); // Render the web part to reflect the list change
    }
  }
  
  private updateFieldListPickerOptions(result: IFieldInfo[]) {
    const visibleFields: IFieldInfo[] = result.filter(
      (field: IFieldInfo) => field.Hidden === false,
    );
  
    const options: IDropdownOption[] = visibleFields.map((field: IFieldInfo, index: number) => ({
      key: index,
      text: `${field.Title} (${field.InternalName})`,
      title: `${field.Title} (${field.InternalName})`,
      data: field,
    }));
  
    this.linkFieldOptions = options;
    this.render(); // Re-render the web part to reflect the new field options
  }
  // General property change handler
  protected onPropertyPaneFieldChanged(
    propertyPath: string,
    oldValue: any,
    newValue: any
  ): void {
    super.onPropertyPaneFieldChanged(propertyPath, oldValue, newValue);
    
    // Immediately reflect the property change
    this.render();
  }

  protected async loadPropertyPaneResources(): Promise<void> {
    const editorPropImport = import(
      /* webpackChunkName: 'plre-list-viewer' */
      '@pnp/spfx-property-controls/lib/PropertyFieldCodeEditor'
    );

    const listPropImport = import(
      /* webpackChunkName: 'plre-list-viewer' */
      '@pnp/spfx-property-controls/lib/PropertyFieldListPicker'
    );
    const viewPropImport = import(
      /* webpackChunkName: 'plre-list-viewer' */
      '@pnp/spfx-property-controls/lib/PropertyFieldViewPicker'
    );

    const msPropsImport = import(
      /* webpackChunkName: 'plre-list-viewer' */
      '@microsoft/sp-property-pane'
    );

    const controls = await Promise.all([
      editorPropImport,
      listPropImport,
      viewPropImport,
      msPropsImport,
    ]);

    // eslint-disable-next-line prefer-destructuring
    this.editorProp = controls[0];
    // eslint-disable-next-line prefer-destructuring
    this.listProp = controls[1];
    // eslint-disable-next-line prefer-destructuring
    this.viewProp = controls[2];
    // eslint-disable-next-line prefer-destructuring
    this.msProps = controls[3];
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
                this.viewProp.PropertyFieldViewPicker('view', {
                  label: 'View',
                  listId: this.properties.list,
                  selectedView: this.properties.view,
                  orderBy: this.viewProp.PropertyFieldViewPickerOrderBy.Title,
                  disabled: this.properties.list === '',
                  onPropertyChange: this.onPropertyFieldViewPickerChanged.bind(this),
                  properties: this.properties,
                  context: this.context,
                  onGetErrorMessage: null,
                  deferredValidationTime: 0,
                  key: 'view',
                  webAbsoluteUrl: this.properties.siteUrl,
                }),
                this.editorProp.PropertyFieldCodeEditor('viewXmlCode', {
                  label: 'View XML',
                  panelTitle: 'Edit View XML',
                  initialValue: this.properties.viewXmlCode,
                  onPropertyChange: this.onPropertyPaneFieldChanged.bind(this),
                  properties: this.properties,
                  disabled: this.properties.view === '',
                  key: 'viewXmlCode',
                  language: this.editorProp.PropertyFieldCodeEditorLanguages.XML,
                }),
                this.editorProp.PropertyFieldCodeEditor('JSONCode', {
                  label: 'TableJSON',
                  panelTitle: 'Edit TableJSON',
                  initialValue: this.properties.JSONCode,
                  onPropertyChange: this.onPropertyPaneFieldChanged.bind(this),
                  properties: this.properties,
                  disabled: false,
                  key: 'JSONCode',
                  language: this.editorProp.PropertyFieldCodeEditorLanguages.JSON,
                }),
               
                this.msProps.PropertyPaneToggle('showTitle', {
                  label: 'Show Title',
                  checked: this.properties.showTitle,
                }),
                this.msProps.PropertyPaneToggle('showFind', {
                  label: 'Show Find',
                  checked: this.properties.showFind,
                }),
                this.msProps.PropertyPaneToggle('hideErrorEmpty', {
                  label: 'Hide On Error or Empty',
                  checked: this.properties.hideErrorEmpty,
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
