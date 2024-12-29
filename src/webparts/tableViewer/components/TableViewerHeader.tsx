import * as React from 'react';
import { TextField } from '@fluentui/react/lib/TextField';
import TableViewerTitle from './TableViewerTitle';
import styles from './TableViewer.module.scss';

export interface ITableViewerHeaderProps {
  displayMode: any;
  title: string;
  updateProperty: (value: string) => void;
  showTitle: boolean;
  showFind: boolean;
  searchQuery: string;
  handleSearch: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const TableViewerHeader: React.FunctionComponent<ITableViewerHeaderProps> = ({
  displayMode,
  title,
  updateProperty,
  showTitle,
  showFind,
  searchQuery,
  handleSearch
}) => {
  if (!showTitle && !showFind) {
    return null;
  }

  return(
  <div className={styles.tableViewerHeader}>
    {showTitle ? (
      <TableViewerTitle displayMode={displayMode} title={title}updateProperty={updateProperty} />
    ) : (
      <span>&nbsp;</span>
    )}
    {showFind && (
      <TextField
        className={styles.searchBox}
        placeholder="Search..."
        value={searchQuery}
        onChange={handleSearch}
      />
    )}
  </div>
  );
};

export default TableViewerHeader;


