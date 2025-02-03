import * as React from 'react';
import PersonCard from './TabsRender/PersonCard';

import { IColumnJSON } from '../../../helpers/Interfaces'; // Ensure this import is correct

interface IRenderPersonCardProps {
  item: any;
  field: string;
  column: IColumnJSON;
  shouldMerge: boolean;
}

export default function renderPersonCard({ item, field, column, shouldMerge }: IRenderPersonCardProps) {
  if (shouldMerge) {
    return <span>&nbsp;</span>;
  }

  return (
    <PersonCard
      email={item[field].rawValue[0].email}
      name={item[field].rawValue[0].name}
      title={item[field].rawValue[0].title}
      format={column.format || 'size32'}
    />
  );
}