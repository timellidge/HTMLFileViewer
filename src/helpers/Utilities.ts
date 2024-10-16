import * as React from 'react';

// PnPJS Imports
import '@pnp/sp/lists';
import '@pnp/sp/items';
import { IRenderListDataAsStreamResult } from '@pnp/sp/lists';
import { Web } from '@pnp/sp/webs';
import { FieldTypes, IFieldInfo } from '@pnp/sp/fields';
import * as CamlBuilder from 'camljs';
import { IDropdownOption } from 'office-ui-fabric-react';
import { IViewInfo } from '@pnp/sp/views';
import { IItemUpdateResult } from '@pnp/sp/items';
import { ITypedHash } from '@pnp/common';

export const validateSiteExists = async (value: string): Promise<string> => {
  try {
    await Web(value).get();
    return '';
  } catch (e) {
    return 'Site could not be found';
  }
};


export const getItemsUsingRenderListDataAsStream = (
  siteUrl: string, listId: string, viewXmlCode: string, nextHref?: string,
): Promise<IRenderListDataAsStreamResult> => Web(siteUrl)
  .lists.getById(listId).renderListDataAsStream({
    ViewXml: viewXmlCode,
    Paging: nextHref || null,
  });

export const useDebounce = (value: string, delay: number): string => {
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


export const createSearchQueryViewXml = (
  viewXmlCode: string, searchFields: IFieldInfo[], searchTerm: string,
): string => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(viewXmlCode, 'text/xml');
  const query = xmlDoc.querySelector('Query');
  const where = xmlDoc.querySelector('Where');
  const orderBy = xmlDoc.querySelector('OrderBy');

  if (!query) {
    throw new Error('Invalid viewXmlCode: <Query> element not found');
  }

  const textFieldExpressions: CamlBuilder.IExpression[] = searchFields
    .filter((f) => f.FieldTypeKind === FieldTypes.Text || f.FieldTypeKind === FieldTypes.Note)
    .map((f) => CamlBuilder.Expression().TextField(f.InternalName).Contains(searchTerm));

  const choiceFieldExpressions: CamlBuilder.IExpression[] = searchFields
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
  } else {
    const whereXml = new CamlBuilder().Where()
      .Any(expressions)
      .ToString();
    query.outerHTML = `<Query>${whereXml}${orderBy ? orderBy.outerHTML : ''}</Query>`;
  }
  return xmlDoc.documentElement.outerHTML;
};
export const searchFieldTypes: FieldTypes[] = [
  FieldTypes.Text,
  FieldTypes.Choice,
  FieldTypes.Note,
];

export const getListFields = async (
  siteUrl: string, listId: string,
): Promise<IFieldInfo[]> => Web(siteUrl).lists
  .getById(listId).fields
  .get();



export const getListViewXml = async (
  siteUrl: string, listId: string, viewId: string,
): Promise<IViewInfo> => Web(siteUrl).lists
  .getById(listId).views
  .getById(viewId)
  .get();

export const getSearchFieldsFromOptions = (options: IDropdownOption[]): IFieldInfo[] => {
  if (!options) { return []; }
  const fields: IFieldInfo[] = options.map((option: IDropdownOption) => option.data as IFieldInfo);
  return fields.filter((field: IFieldInfo) => field
    || searchFieldTypes.indexOf(field.FieldTypeKind) !== -1);
};


export const updateListItem = async (
  siteUrl: string, listId: string, itemId: number, properties: ITypedHash<unknown>,
): Promise<IItemUpdateResult> => Web(siteUrl).lists.getById(listId).items
  .getById(itemId)
  .update(properties);

export const addListItem = async (
  siteUrl: string, listId: string, properties: ITypedHash<unknown>,
): Promise<IItemUpdateResult> => Web(siteUrl).lists.getById(listId).items
  .add(properties);

export const getNamedAttributeValue = (
  element: HTMLElement, attributeName: string,
): string | null => {
  const el = element.closest(`[${attributeName}]`);
  return el ? el.attributes.getNamedItem(attributeName).value : null;
};
