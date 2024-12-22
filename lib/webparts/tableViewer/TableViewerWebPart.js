// React Imports
import * as React from 'react';
import * as ReactDom from 'react-dom';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { ThemeProvider, } from '@microsoft/sp-component-base';
// PnP JS Imports
import { sp } from '@pnp/sp';
import '@pnp/sp/fields';
import '@pnp/sp/views';
import TableViewerContainer from './components/TableViewerContainer';
// Utilities Import
import { getListFields, getListViewXml, validateSiteExists, } from '../../helpers/Utilities';
export default class TableViewerWebPart extends BaseClientSideWebPart {
    constructor() {
        super(...arguments);
        //@typescript-eslint/no-unused-vars
        this.shouldRerender = false;
        this.tableConfig = {
            "id": {
                "name": "ident",
                "width": "40px",
                "calculatedPX": 0
            },
            "LinkTitle": {
                "name": "title",
                "width": "14%",
                "calculatedPX": 0
            },
            "BSAStrapline": {
                "name": "StrapLine",
                "width": "1fr",
                "calculatedPX": 0
            },
            "BSADescription": {
                "name": "desc",
                "width": "2fr",
                "calculatedPX": 0
            }
        };
        this.hasAllValues = (strings) => strings.filter((i) => (i === '' || i === null)).length > 0;
        this.onConfigure = () => {
            this.context.propertyPane.open();
        };
        this.handleThemeChangedEvent = (args) => {
            this.themeVariant = args.theme;
            this.render();
        };
    }
    async onInit() {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        // if (this.properties.siteUrl && this.properties.list) {
        //   const fields = await getListFields(this.properties.siteUrl, this.properties.list);
        //   this.updateFieldListPickerOptions(fields);
        // }
        await super.onInit();
        this.properties.JSONCode = this.properties.JSONCode || JSON.stringify(this.tableConfig);
    }
    onPropertyPaneConfigurationComplete() {
        super.onPropertyPaneConfigurationComplete();
        // Toggle a variable to force re-render
        this.shouldRerender = !this.shouldRerender;
        // Trigger the re-render
        this.render();
    }
    render() {
        console.log("Rendering TableViewerWebPart");
        console.log("Display Mode:", this.displayMode);
        console.log("Properties:", this.properties);
        const element = React.createElement(TableViewerContainer, {
            key: this.shouldRerender ? 'forceUpdate1' : 'forceUpdate2',
            JSONCode: this.properties.JSONCode,
            siteUrl: this.properties.siteUrl,
            listId: this.properties.list,
            viewXmlCode: this.properties.viewXmlCode,
            title: this.properties.title,
            displayMode: this.displayMode,
            updateProperty: (value) => {
                this.properties.title = value;
            },
            showTitle: this.properties.showTitle,
            showFind: this.properties.showFind,
            hideErrorEmpty: this.properties.hideErrorEmpty,
            themeVariant: this.themeVariant,
            contentHeight: this.properties.contentHeight,
            onConfigure: this.onConfigure,
            configured: this.hasAllValues([
                this.properties.siteUrl,
                this.properties.view,
                this.properties.viewXmlCode,
                this.properties.JSONCode,
                this.properties.list
            ]),
            contextSiteUrl: this.context.pageContext.web.absoluteUrl,
            contextUser: this.context.pageContext.user.loginName,
            webPartTag: this.properties.webPartTag,
        });
        ReactDom.render(element, this.domElement);
    }
    onDispose() {
        ReactDom.unmountComponentAtNode(this.domElement);
    }
    themeSetup() {
        this.themeProvider = this.context.serviceScope.consume(ThemeProvider.serviceKey);
        this.themeVariant = this.themeProvider.tryGetTheme();
        this.themeProvider.themeChangedEvent.add(this, this.handleThemeChangedEvent);
    }
    onPropertyFieldViewPickerChanged(targetProperty, oldValue, newValue) {
        const oldViewValue = this.properties[targetProperty];
        this.onPropertyPaneFieldChanged(targetProperty, oldViewValue, newValue);
        if (newValue !== '') {
            getListViewXml(this.properties.siteUrl, this.properties.list, this.properties.view)
                .then(this.updateFieldViewPickerValue.bind(this));
        }
        else {
            this.updateFieldViewPickerValue();
        }
        // Call render to immediately reflect changes
        this.render();
    }
    updateFieldViewPickerValue(value) {
        this.properties.viewXmlCode = value ? value.ListViewXml : '';
        this.context.propertyPane.refresh();
        this.render(); // Re-render the web part when view picker value is updated
    }
    onPropertyFieldListPickerChanged(targetProperty, oldValue, newValue) {
        const oldViewValue = this.properties[targetProperty];
        this.onPropertyPaneFieldChanged(targetProperty, oldViewValue, newValue);
        if (newValue !== '') {
            getListFields(this.properties.siteUrl, this.properties.list)
                .then(this.updateFieldListPickerOptions.bind(this));
        }
        else {
            this.properties.view = '';
            this.context.propertyPane.refresh();
            this.render(); // Render the web part to reflect the list change
        }
    }
    updateFieldListPickerOptions(result) {
        const visibleFields = result.filter((field) => field.Hidden === false);
        const options = visibleFields.map((field, index) => ({
            key: index,
            text: `${field.Title} (${field.InternalName})`,
            title: `${field.Title} (${field.InternalName})`,
            data: field,
        }));
        this.linkFieldOptions = options;
        this.render(); // Re-render the web part to reflect the new field options
    }
    // General property change handler
    onPropertyPaneFieldChanged(propertyPath, oldValue, newValue) {
        super.onPropertyPaneFieldChanged(propertyPath, oldValue, newValue);
        // Immediately reflect the property change
        this.render();
    }
    async loadPropertyPaneResources() {
        const editorPropImport = import(
        /* webpackChunkName: 'plre-list-viewer' */
        '@pnp/spfx-property-controls/lib/PropertyFieldCodeEditor');
        const listPropImport = import(
        /* webpackChunkName: 'plre-list-viewer' */
        '@pnp/spfx-property-controls/lib/PropertyFieldListPicker');
        const viewPropImport = import(
        /* webpackChunkName: 'plre-list-viewer' */
        '@pnp/spfx-property-controls/lib/PropertyFieldViewPicker');
        const msPropsImport = import(
        /* webpackChunkName: 'plre-list-viewer' */
        '@microsoft/sp-property-pane');
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
    getPropertyPaneConfiguration() {
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
            ],
        };
    }
}
//# sourceMappingURL=TableViewerWebPart.js.map