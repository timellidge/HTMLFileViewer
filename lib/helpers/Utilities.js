import * as React from 'react';
// PnPJS Imports
import '@pnp/sp/lists';
import '@pnp/sp/items';
import { Web } from '@pnp/sp/webs';
import { FieldTypes } from '@pnp/sp/fields';
import * as CamlBuilder from 'camljs';
export const validateSiteExists = async (value) => {
    try {
        await Web(value).get();
        return '';
    }
    catch (e) {
        return 'Site could not be found';
    }
};
export const getItemsUsingRenderListDataAsStream = (siteUrl, listId, viewXmlCode, nextHref) => Web(siteUrl)
    .lists.getById(listId).renderListDataAsStream({
    ViewXml: viewXmlCode,
    Paging: nextHref || null,
});
export const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = React.useState(value);
    React.useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [delay, value]);
    return debouncedValue;
};
export const createSearchQueryViewXml = (viewXmlCode, searchFields, searchTerm) => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(viewXmlCode, 'text/xml');
    const query = xmlDoc.querySelector('Query');
    const where = xmlDoc.querySelector('Where');
    const orderBy = xmlDoc.querySelector('OrderBy');
    if (!query) {
        throw new Error('Invalid viewXmlCode: <Query> element not found');
    }
    const textFieldExpressions = searchFields
        .filter((f) => f.FieldTypeKind === FieldTypes.Text || f.FieldTypeKind === FieldTypes.Note)
        .map((f) => CamlBuilder.Expression().TextField(f.InternalName).Contains(searchTerm));
    const choiceFieldExpressions = searchFields
        .filter((f) => f.FieldTypeKind === FieldTypes.Choice)
        .map((f) => CamlBuilder.Expression().ChoiceField(f.InternalName).Contains(searchTerm));
    const expressions = [...textFieldExpressions, ...choiceFieldExpressions];
    if (where) {
        // if we have existing where clause lets wrap it in our new expressions
        // lets also include any orderby that may exist as well
        const existingWhereXml = CamlBuilder
            .FromXml(`<Query>${where.outerHTML}${orderBy ? orderBy.outerHTML : ''}</Query>`)
            .ModifyWhere()
            .AppendAnd()
            .Any(expressions)
            .ToString();
        // update the query element with the new CAML
        query.outerHTML = existingWhereXml;
    }
    else {
        const whereXml = new CamlBuilder().Where()
            .Any(expressions)
            .ToString();
        query.outerHTML = `<Query>${whereXml}${orderBy ? orderBy.outerHTML : ''}</Query>`;
    }
    return xmlDoc.documentElement.outerHTML;
};
export const searchFieldTypes = [
    FieldTypes.Text,
    FieldTypes.Choice,
    FieldTypes.Note,
];
export const getListFields = async (siteUrl, listId) => Web(siteUrl).lists
    .getById(listId).fields
    .get();
export const getListViewXml = async (siteUrl, listId, viewId) => Web(siteUrl).lists
    .getById(listId).views
    .getById(viewId)
    .get();
export const getSearchFieldsFromOptions = (options) => {
    if (!options) {
        return [];
    }
    const fields = options.map((option) => option.data);
    return fields.filter((field) => field
        || searchFieldTypes.indexOf(field.FieldTypeKind) !== -1);
};
export const updateListItem = async (siteUrl, listId, itemId, properties) => Web(siteUrl).lists.getById(listId).items
    .getById(itemId)
    .update(properties);
export const addListItem = async (siteUrl, listId, properties) => Web(siteUrl).lists.getById(listId).items
    .add(properties);
export const getNamedAttributeValue = (element, attributeName) => {
    const el = element.closest(`[${attributeName}]`);
    return el ? el.attributes.getNamedItem(attributeName).value : null;
};
//# sourceMappingURL=Utilities.js.map