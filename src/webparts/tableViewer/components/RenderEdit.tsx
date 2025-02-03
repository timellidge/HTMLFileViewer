import * as React from 'react';
import { Icon } from '@fluentui/react/lib/Icon';
import styles from './TableViewer.module.scss';
import { IColumnJSON } from '../../../helpers/Interfaces'; // Ensure this import is correct

interface IRenderEditProps {
  item: any;
  field: string;
  column: IColumnJSON;
  handleIconClick: (id: number) => void;
}

export default function renderEdit({ item, field, column, handleIconClick }: IRenderEditProps) {
  const id = item[field].rawValue;

  let iconName = "edit";
  let iconColor = "#0078d4";

  if (column.icons && typeof column.icons === 'object') {
    const [firstIconName, firstIconColor] = Object.entries(column.icons)[0];
    [iconName, iconColor] = firstIconColor.split("|");
  }

  return (
    <div className={styles.editCell}>
      <Icon
        iconName={iconName}
        title="Edit"
        style={{ color: iconColor }}
        onClick={() => handleIconClick(id)}
      />
    </div>
  );
}