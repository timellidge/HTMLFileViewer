import * as React from 'react';
import { Icon } from '@fluentui/react/lib/Icon';
import styles from './TableViewer.module.scss';
import { IColumnJSON } from '../../../helpers/Interfaces'; // Ensure this import is correct

interface IRenderIconProps {
  item: any;
  field: string;
  column: IColumnJSON;
}

export default function renderIcon({ item, field, column }: IRenderIconProps) {
  const displayValue = item[field].displayValue;
  const iconData = column.icons?.[displayValue];
  if (iconData) {
    const [iconName, iconColor] = iconData.split("|");
    return (
      <div className={styles.iconCell}>
        <Icon
          iconName={iconName}
          style={{ color: iconColor }}
          title={displayValue}
        />
      </div>
    );
  } else {
    return displayValue;
  }
}