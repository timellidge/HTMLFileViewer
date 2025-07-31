import * as React from 'react';
import styles from '../TableViewer.module.scss';
import { Icon } from '@fluentui/react/lib/Icon';
import { IColumnJSON } from '../../../../helpers/Interfaces'; // Ensure this import is correct

interface IRenderUrlProps {
  item: any;
  field: string;
  column: IColumnJSON;
}

export default function renderUrl({ item, field, column }: IRenderUrlProps) {
  const link = item[field].rawValue;
  const displayText = item[field].displayValue;

  let iconName = "";
  let iconColor = "";
  let iconSize = "";

  if (column.icons && typeof column.icons === 'object') {
    const [firstIconName, firstIconColor] = Object.entries(column.icons)[0];
    [iconName, iconColor, iconSize] = firstIconColor.split("|");
  }
 console.log("RenderUrl", { link, displayText, iconName, iconColor, iconSize });

  if (!link) {
    return null;
  }
  return (
    <div className={styles.tableDataContent}>
      {column.prefix && <span>{column.prefix}</span>}
      <a href={link}
       {...(column.newTab
        ? { target: "_blank", rel: "noopener noreferrer" }
        : {})
        }
      >
        {iconName === "" && displayText}
        {iconName && (
          <Icon
            iconName={iconName}
            title="Edit"
            style={{ color: iconColor, fontSize: iconSize || "1rem" }}
          />
        )}
      </a>
      {column.suffix && <span>{column.suffix}</span>}
    </div>
  );
}