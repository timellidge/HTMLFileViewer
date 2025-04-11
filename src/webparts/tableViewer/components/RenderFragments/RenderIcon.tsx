import * as React from 'react';
import { Icon } from '@fluentui/react/lib/Icon';
import styles from '../TableViewer.module.scss';
import { IColumnJSON } from '../../../../helpers/Interfaces'; // Ensure this import is correct

interface IRenderIconProps {
  item: any;
  field: string;
  column: IColumnJSON;
}

//"icons": {
//  "3.0 Registered":"edit|#cc0000|2rem",
//  "4.0 Approved":"globe|#cc0000|2rem",
//  "5.0 Declined":"user|#cc0000|2rem"
//}

export default function renderIcon({ item, field, column }: IRenderIconProps) {
  const displayValue = item[field].displayValue;
  const iconData = column.icons?.[displayValue];
  if (iconData) {
    const [iconName, iconColor, iconSize] = iconData.split("|");
    return (
      <div className={styles.iconCell}>
        <Icon
          iconName={iconName}
          style={{ color: iconColor, fontSize: iconSize || "1rem" }}
          title={displayValue}
        />
      </div>
    );
  } else {
    return displayValue;
  }
}