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
import { IColumnConfig } from './Interfaces';

// export const manageFieldFormat = (value: number | Date | string, type: string, format: string) => {
//   switch (type) {
//     case 'number': {
//       let formatter;
//       switch (format) {
//         case 'USD':
//           formatter = new Intl.NumberFormat('en-US', {
//             style: 'currency',
//             currency: 'USD',
//           });
//           break;
//         case 'GBP':
//           formatter = new Intl.NumberFormat('en-GB', {
//             style: 'currency',
//             currency: 'GBP',
//           });
//           break;
//         case '00000.00':
//           formatter = new Intl.NumberFormat('en-US', {
//             minimumFractionDigits: 2,
//             maximumFractionDigits: 2,
//             useGrouping: false, // Disable thousands separator
//           });
//           break;
//         case '0,000.00':
//           formatter = new Intl.NumberFormat('en-US', {
//             minimumFractionDigits: 2,
//             maximumFractionDigits: 2,
//           });
//           break;
//         case '000':
//           formatter = new Intl.NumberFormat('en-US', {
//             minimumFractionDigits: 0,
//             maximumFractionDigits: 0,
//           });
//           break;
//         case '0,000.000':
//           formatter = new Intl.NumberFormat('en-US', {
//             minimumFractionDigits: 3,
//             maximumFractionDigits: 3,
//           });
//           break;
//         default:
//           formatter = new Intl.NumberFormat('en-US');
//       }
//       value = formatter.format(parseFloat(value));
//       break;
//     }
//     // Add other cases for different types if needed
//     default: {
//       value = 
//     }
//   }
// }


//==================================================================================================================================
// A FUNCTION TO HELP WITH WIDTH TO PX CONVERSION it includes % and fr (fractional) widths calculated based on the container width
//==================================================================================================================================
 export const convertWidthToPx = (containerPX: number, ColJSON: IColumnConfig ): IColumnConfig => {
  //set my variables to  zero 
  let TotPX = 0, TotPer = 0, TotFR = 0;
  // two loops throrought the config json - first to get the total for the px the % and the fr columns
  Object.keys(ColJSON).forEach(key => {
    const width = ColJSON[key].width.toLowerCase();
    const match = width.match(/^(\d*\.?\d+)(px|%|fr)$/); //regex to match the width value and the unit but also work with decimal numbers
    if (match) {
      const value = parseFloat(match[1]);
      switch (match[2]) {
        case 'px': TotPX  += value; break;
        case '%' : TotPer += value; break;
        case 'fr': TotFR  += value; break;  
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
        case 'px': calculatedPixels = value; break;
        case '%' : calculatedPixels = value * percentPX; break;
        case 'fr': calculatedPixels = value * FRpx; break;
        default  : calculatedPixels = 0;
      }
      ColJSON[key].calculatedPX = calculatedPixels;
    }
  });
  return ColJSON;
 }


 //============================================================================================================
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
