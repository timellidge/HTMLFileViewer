/* eslint-disable implicit-arrow-linebreak */
import * as React from 'react';
import { MessageBar, MessageBarType } from '@fluentui/react/lib/MessageBar';
const TableViewerPlaceholder = ({ message, onDismiss, }) => (React.createElement(MessageBar, { messageBarType: MessageBarType.blocked, truncated: true, isMultiline: false, onDismiss: onDismiss, dismissButtonAriaLabel: "Close the message" },
    "Something went wrong... ",
    message));
export default TableViewerPlaceholder;
//# sourceMappingURL=TableViewerErrorMessage.js.map