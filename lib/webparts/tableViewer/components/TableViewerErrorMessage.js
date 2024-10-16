/* eslint-disable implicit-arrow-linebreak */
/*import * as React from 'react';
import { MessageBar, MessageBarType } from '@fluentui/react/lib/MessageBar';

export interface ITableViewerPlaceholderProps {
  message: string;
  onDismiss: (value: null) => void;
}

const TableViewerPlaceholder: React.FunctionComponent<ITableViewerPlaceholderProps> = ({
  message,
  onDismiss,
}) => (
  <MessageBar
    messageBarType={MessageBarType.blocked}
    truncated
    isMultiline={false}
    overflowButtonAriaLabel="See more"
    onDismiss={() => { onDismiss(null); }}
    dismissButtonAriaLabel="Close"
  >
    Something went wrong ...
    {' '}
    {message}
  </MessageBar>
);

export default TableViewerPlaceholder;
*/
import * as React from 'react';
import { MessageBar, MessageBarType } from '@fluentui/react/lib/MessageBar';
const TableViewerPlaceholder = ({ message, onDismiss, }) => (React.createElement(MessageBar, { messageBarType: MessageBarType.blocked, truncated: true, isMultiline: false, onDismiss: onDismiss, dismissButtonAriaLabel: "Close the message" },
    "Something went wrong... ",
    message));
export default TableViewerPlaceholder;
//# sourceMappingURL=TableViewerErrorMessage.js.map