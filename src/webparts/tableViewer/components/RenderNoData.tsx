import * as React from 'react';
import { IColumnJSON } from '../../../helpers/Interfaces'; // Ensure this import is correct

interface RenderNoDataProps {
  column: IColumnJSON;
}

export default function renderNoData({ column }: RenderNoDataProps) {
  return column.type === "stack" ? (
    <div>
      {column.fields?.map((field, fieldIndex) => (
        <div key={fieldIndex} className={`stack ${field}`}>
          No Data
        </div>
      ))}
    </div>
  ) : (
    <span>No Data</span>
  );
}