/* eslint-disable implicit-arrow-linebreak */

import * as React from 'react';
import { MessageBar, MessageBarType } from '@fluentui/react/lib/MessageBar';

export interface ITableViewerPlaceholderProps {
  message: any;
  onDismiss: () => void;
}

const TableViewerPlaceholder: React.FunctionComponent<ITableViewerPlaceholderProps> = ({
  message,
  onDismiss,
}) => (
  <MessageBar
    messageBarType={MessageBarType.blocked}
    truncated
    isMultiline={false}
    onDismiss={onDismiss}
    dismissButtonAriaLabel="Close the message"
  >
    Something went wrong... {message}
  </MessageBar>
);

export default TableViewerPlaceholder;
