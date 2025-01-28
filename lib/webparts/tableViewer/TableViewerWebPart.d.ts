import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import '@pnp/sp/fields';
import '@pnp/sp/views';
import { IPropertyPaneConfiguration } from '@microsoft/sp-property-pane';
export interface ITableViewerWebPartProps {
    key: string;
    JSONCode: string;
    webPartCSS: string;
    siteUrl: string;
    list: string;
    view: string;
    viewXmlCode: string;
    title: string;
    showTitle: boolean;
    showFind: boolean;
    hideErrorEmpty: boolean;
    tabBehaviour: boolean;
    contentHeight: string;
    sidePadding: number;
    configured: boolean;
    contextSiteUrl: string;
    contextUser: string;
    webPartTag: string;
}
export default class TableViewerWebPart extends BaseClientSideWebPart<ITableViewerWebPartProps> {
    private linkFieldOptions;
    private themeProvider;
    private themeVariant;
    private propertyPaneControls;
    private editorProp;
    private listProp;
    private viewProp;
    private msProps;
    private tableConfig;
    private defaultCSS;
    protected onInit(): Promise<void>;
    private injectCSS;
    render(): void;
    protected onDispose(): void;
    private hasAllValues;
    private onConfigure;
    private themeSetup;
    private handleThemeChangedEvent;
    private onPropertyFieldViewPickerChanged;
    private updateFieldViewPickerValue;
    private onPropertyFieldListPickerChanged;
    private onPropertyPaneJSONChanged;
    protected loadPropertyPaneResources(): Promise<void>;
    protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration;
}
//# sourceMappingURL=TableViewerWebPart.d.ts.map