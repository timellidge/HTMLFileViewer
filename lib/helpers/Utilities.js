import * as React from 'react';
// PnPJS Imports
import '@pnp/sp/lists';
import '@pnp/sp/items';
import { Web } from '@pnp/sp/webs';
import { FieldTypes } from '@pnp/sp/fields';
import * as CamlBuilder from 'camljs';
//==================================================================================================================================
// A FUNCTION TO HELP WITH WIDTH TO PX CONVERSION it includes % and fr (fractional) widths calculated based on the container width
//==================================================================================================================================
export const convertWidthToPx = (containerPX, ColJSON) => {
    //set my variables to  zero 
    let TotPX = 0, TotPer = 0, TotFR = 0;
    // two loops throrought the config json - first to get the total for the px the % and the fr columns
    Object.keys(ColJSON).forEach(key => {
        const width = ColJSON[key].width.toLowerCase();
        const match = width.match(/^(\d*\.?\d+)(px|%|fr)$/); //regex to match the width value and the unit but also work with decimal numbers
        if (match) {
            const value = parseFloat(match[1]);
            switch (match[2]) {
                case 'px':
                    TotPX += value;
                    break;
                case '%':
                    TotPer += value;
                    break;
                case 'fr':
                    TotFR += value;
                    break;
            }
        }
    });
    // now calculate the px for % and fr columns based in the container width
    const percentPX = containerPX / 100; //one percent of the container width
    const percentTotPX = percentPX * TotPer; //total px for all % columns i ned this to see what is left tfor the FR as they ar a fractional remainder of the total px
    const FRpx = (containerPX - percentTotPX - TotPX) / TotFR; //so one fr is equal to this many px
    // NOW loop through again and set the CalculatedPixels field in the JSON
    Object.keys(ColJSON).forEach(key => {
        const width = ColJSON[key].width.toLowerCase();
        const match = width.match(/^(\d*\.?\d+)(px|%|fr)$/);
        if (match) {
            const value = parseFloat(match[1]);
            const unit = match[2];
            let calculatedPixels = 0;
            switch (unit) {
                case 'px':
                    calculatedPixels = value;
                    break;
                case '%':
                    calculatedPixels = value * percentPX;
                    break;
                case 'fr':
                    calculatedPixels = value * FRpx;
                    break;
                default: calculatedPixels = 0;
            }
            ColJSON[key].calculatedPX = calculatedPixels;
        }
    });
    return ColJSON;
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