import * as React from 'react';

import { IColumnJSON, IColumnsConfig } from '../../../../helpers/Interfaces'; // Ensure this import is correct

// these are the sub cell render methods that are used in the render stack method
import renderBar        from './RenderBar'; // Import the renderBar function
import renderNumber     from './RenderNumber'; // Import the renderNumber function
import renderHtml       from './RenderHtml'; // Import the renderHtml function
import renderLink       from './RenderLink'; // Import the renderLink function
import renderPersonCard from './RenderPersonCard'; // Import the renderPersonCard function
import renderDefault    from './RenderDefault'; // Import the renderDefault function
import renderMultiChoice from './RenderMultiChoice'; // Import the renderMultiChoice function

interface IRenderStackProps {
  item: any;
  column: IColumnJSON;
  allcolJSON: IColumnsConfig;
  maxBarValues: { [key: string]: number };
}

export default function renderStack({ item, column, allcolJSON, maxBarValues }: IRenderStackProps) {
  return (
    <div>
      {column.fields?.map((field: string, fieldIndex: number) => {
        const fieldColumn = allcolJSON[field];
        if (!fieldColumn) {
          return <div className={`stack ${field}`} key={fieldIndex}>&nbsp;</div>;
        }
        const content = (() => {
          switch (fieldColumn.type) {
            case 'bar':
              return renderBar({ item, field, column: fieldColumn, maxBarValues });
            case 'number':
              return renderNumber({ item, field, column: fieldColumn, shouldMerge: false });
            case 'html':
              return renderHtml({ item, field });
            case 'link':
              return renderLink({ item, field, column: fieldColumn });
            case 'person':
              return renderPersonCard({ item, field, column: fieldColumn, shouldMerge: false });
            case "multiChoice":
              return renderMultiChoice({ item, field, column, shouldMerge:false });
            default:
              return renderDefault({ item, field, column: fieldColumn, shouldMerge: false });
          }
        })();

        return (
          <div className={`stack ${field}`} key={fieldIndex}>
            {content}
          </div>
        );
      })}
    </div>
  );
}