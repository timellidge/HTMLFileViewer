import * as React from 'react';
import { mergeStyles } from '@fluentui/react';
import { Icon } from '@fluentui/react/lib/Icon';
import styles from './TableViewer.module.scss';
import { IColumnJSON } from '../../../helpers/Interfaces'; // Ensure this import is correct
import { getContrastingTextColor } from '../../../helpers/Utilities'; // Ensure this import is correct

interface RenderBarProps {
  item: any;
  field: string;
  column: IColumnJSON;
  maxBarValues: { [key: string]: number };
}

export default function renderBar({ item, field, column, maxBarValues }: RenderBarProps) {
  const value = item[field].rawValue;
  const rawValue = parseFloat(value) || 0;
  const maxValue = column.barSettings?.limit || maxBarValues[field] || 100; // Set a default height if not provided
  const percentage = (rawValue / maxValue) * 100;
  if (percentage < 0) { return null; }

  // now do the styling for the bar
  const barcol = column.barSettings?.color || "#d0d0d0"; // Set barcol to column.barSettings.color if it exists, otherwise "darkblue"
  const barHeight = column.barSettings?.height || "20px"; // Set a default height if not provided
  const _barStyle = mergeStyles(styles.chartBar, { backgroundColor: barcol, height: barHeight, width: `${percentage}%` });

  const textCol = percentage < 50 ? "#000000" : getContrastingTextColor(barcol); // get a contrast if it's going inside else use black (black for transparent too)

  // Set the position of the bar label based on the percentage ( < 50 its outside >50 its inside in a contrasting color but if there is an icon add more padding to the right)
  const labelPadding = column.barSettings?.icon ? "20px" : "5px";
  const _barLabelStyle = percentage < 50
    ? mergeStyles(styles.chartLabel, { width: `${100 - percentage}%`, left: `${percentage}%`, textAlign: 'left', color: textCol }) // outside One
    : mergeStyles(styles.chartLabel, { width: `${percentage}%`, textAlign: 'right', paddingRight: labelPadding, color: textCol }); // Inside one

  // Determine the label content based on barSettings if it's not specified then just use the raw value
  let labelContent = null;
  if (column.barSettings) {
    if (column.barSettings?.showValue && column.barSettings?.showPercentage) {
      labelContent = `${rawValue} (${percentage.toFixed(0)}%)`;
    } else if (column.barSettings?.showValue) {
      labelContent = `${rawValue}`;
    } else if (column.barSettings?.showPercentage) {
      labelContent = `${percentage.toFixed(0)}%`;
    }
  } else {
    labelContent = rawValue;
  }

  let iconName = null;
  let iconColor = null;
  if (column.barSettings.icon) {
    [iconName, iconColor] = column.barSettings?.icon?.split("|"); // does this make it super conditional on the icon being there?
  }
  return (
    <div className={styles.barGrid}>
      {column.prefix ? <span className={styles.chartPrefix}>{column.prefix}</span> : <span>&nbsp;</span>}
      <div className={_barStyle} title={value}>
        {iconName ? (
          <Icon
            iconName={iconName}
            title={rawValue.toString()}
            style={{ color: iconColor }}
          />
        ) : (
          <span>&nbsp;</span>
        )}
      </div>
      <div className={_barLabelStyle}> {labelContent} </div>
    </div>
  );
}