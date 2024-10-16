import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import '@pnp/sp/fields';
import '@pnp/sp/views';
import { IPropertyPaneConfiguration } from '@microsoft/sp-property-pane';
export interface ITableViewerWebPartProps {
    key: string;
    JSONCode: string;
    siteUrl: string;
    list: string;
    view: string;
    viewXmlCode: string;
    title: string;
    showTitle: boolean;
    showFind: boolean;
    hideErrorEmpty: boolean;
    contentHeight: string;
    configured: boolean;
    contextSiteUrl: string;
    contextUser: string;
    webPartTag: string;
}
export default class TableViewerWebPart extends BaseClientSideWebPart<ITableViewerWebPartProps> {
    private shouldRerender;
    private linkFieldOptions;
    private themeProvider;
    private themeVariant;
    private propertyPaneControls;
    private editorProp;
    private listProp;
    private viewProp;
    private msProps;
    protected onInit(): Promise<void>;
    protected onPropertyPaneConfigurationComplete(): void;
    render(): void;
    protected onDispose(): void;
    private hasAllValues;
    private onConfigure;
    private themeSetup;
    private handleThemeChangedEvent;
    private onPropertyFieldViewPickerChanged;
    private updateFieldViewPickerValue;
    private onPropertyFieldListPickerChanged;
    private updateFieldListPickerOptions;
    protected onPropertyPaneFieldChanged(propertyPath: string, oldValue: any, newValue: any): void;
    protected loadPropertyPaneResources(): Promise<void>;
    protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration;
}
//# sourceMappingURL=TableViewerWebPart.d.ts.map