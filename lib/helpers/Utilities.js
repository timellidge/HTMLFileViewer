import * as React from 'react';
// PnPJS Imports
import '@pnp/sp/lists';
import '@pnp/sp/items';
import { Web } from '@pnp/sp/webs';
import { FieldTypes } from '@pnp/sp/fields';
import * as CamlBuilder from 'camljs';
import { DateTime } from 'luxon';
//==================================================================================================================================
// A FUNCTION TO work out date formats based on the locale adn will try 12 and 24 hour formats
//==================================================================================================================================
//https://github.com/moment/luxon/blob/master/docs/formatting.md#table-of-tokens
export const parseDate = (value, locale) => {
    // Determine the date format based on the locale
    const dateFormat = locale === 'en-GB' ? 'dd/MM/yyyy' : 'M/d/yyyy';
    let date;
    // Try parsing with 24-hour format
    date = DateTime.fromFormat(value.toString(), `${dateFormat} H:mm`, { locale });
    if (!date.isValid) {
        // If parsing with 24-hour format fails, try 12-hour format
        date = DateTime.fromFormat(value.toString(), `${dateFormat} h:mm a`, { locale });
    }
    try {
        return date;
    }
    catch (e) {
        return value;
    }
};
// A FUNCTION TO work out number formats based on the locale and the currency symbol
export const getInitials = (name) => {
    if (!name) {
        return '';
    }
    return name
        .split(' ')
        .map(word => word.charAt(0).toUpperCase())
        .join('');
};
export const toProperCase = (str) => {
    if (!str) {
        return '';
    }
    return str
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
};
// A FUNCTION TO work out number formats based on the locale and the currency symbol
export const numberFormat = (value, format) => {
    let style = 'decimal';
    let currency;
    let useGrouping = false;
    let minimumFractionDigits = 0;
    let maximumFractionDigits = 0;
    // Parse the format string
    if (format.includes('$')) {
        style = 'currency';
        currency = 'USD';
    }
    else if (format.includes('£')) {
        style = 'currency';
        currency = 'GBP';
    }
    else if (format.includes('€')) {
        style = 'currency';
        currency = 'EUR';
    }
    else if (format.includes('¥')) {
        style = 'currency';
        currency = 'JPY';
    }
    if (format.includes(',')) {
        useGrouping = true;
    }
    const decimalMatch = format.match(/\d+/);
    if (decimalMatch) {
        minimumFractionDigits = parseInt(decimalMatch[0], 10);
        maximumFractionDigits = minimumFractionDigits;
    }
    try {
        return new Intl.NumberFormat(undefined, { style, currency, useGrouping, minimumFractionDigits, maximumFractionDigits }).format(value);
    }
    catch (e) {
        return value.toString();
    }
};
//============================================================================================================
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
// a helpers to ge the loacle of the site SO I CAN INTEPRET NUMBERS and dates properly 
const languageIdToLocale = {
    1033: 'en-US',
    1036: 'fr-FR',
    1031: 'de-DE',
    3082: 'es-ES',
    2057: 'en-GB', // English - United Kingdom
    // Add more mappings as needed
};
export const getSiteLocale = async (siteUrl) => {
    try {
        const web = await Web(siteUrl).select("Language").get();
        const languageId = web.Language;
        const locale = languageIdToLocale[languageId] || 'en-US'; // Default to 'en-US' if not found
        return locale;
    }
    catch (error) {
        console.error("Error getting SharePoint locale:", error);
        return "en-UK"; // Default locale
    }
};
export const getListFields = async (siteUrl, listId) => Web(siteUrl).lists
    .getById(listId).fields
    .get();
export const getListUrl = async (siteUrl, listId) => {
    try {
        const list = await Web(siteUrl).lists
            .getById(listId)
            .select('RootFolder/ServerRelativeUrl')
            .expand('RootFolder')
            .get();
        const absoluteUrl = new URL(list.RootFolder.ServerRelativeUrl, siteUrl).href;
        return absoluteUrl;
    }
    catch (error) {
        console.error('Error fetching list URL:', error);
        throw error;
    }
};
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