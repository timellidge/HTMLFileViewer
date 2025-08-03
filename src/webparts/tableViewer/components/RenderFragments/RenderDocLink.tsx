import * as React from 'react';
import { Icon } from '@fluentui/react/lib/Icon';
import styles from '../TableViewer.module.scss';
import { IColumnJSON } from '../../../../helpers/Interfaces'; // Ensure this import is correct

interface IRenderDocLinkProps {
  item: any;
  field: string;
  column: IColumnJSON;
  handleOpenPDF: (linkUrl: string) => void;
}

export default function renderDocLink({ item, field, column, handleOpenPDF }: IRenderDocLinkProps) {
  const link = item[field].rawValue;
  const displayText = item[field].displayValue;

  let iconName = "";
  let iconColor = "";
  let iconSize = "";

  if (column.icons && typeof column.icons === 'object') {
    const [firstIconName, firstIconColor] = Object.entries(column.icons)[0];
    [iconName, iconColor, iconSize] = firstIconColor.split("|");
  }
  console.log("RenderDocLink", { link, displayText, iconName, iconColor, iconSize });

  if (!link) {
    return null;
  }

  return (
    <div className={styles.tableDataContent}   onClick={() => handleOpenPDF(link)}>
      {column.prefix && <span>{column.prefix}</span>}
      {iconName === "" && displayText}
      {iconName && (
        <Icon
          iconName={iconName}
          title={displayText}
          style={{ color: iconColor, fontSize: iconSize || "1rem" }}
         
        />
      )}
      {column.suffix && <span>{column.suffix}</span>}
    </div>
  );
}