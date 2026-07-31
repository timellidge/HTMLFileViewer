// PnPJS Imports
import { Web } from '@pnp/sp/webs';

export const validateSiteExists = async (value: string): Promise<string> => {
  try {
    await Web(value).get();
    return '';
  } catch (e) {
    return 'Site could not be found';
  }
};
