import * as React from 'react';
// these are the sub cell render methods that are used in the render stack method
import renderBar from './RenderBar'; // Import the renderBar function
import renderNumber from './RenderNumber'; // Import the renderNumber function
import renderHtml from './RenderHtml'; // Import the renderHtml function
import renderLink from './RenderLink'; // Import the renderLink function
import renderPersonCard from './RenderPersonCard'; // Import the renderPersonCard function
import renderDefault from './RenderDefault'; // Import the renderDefault function
import renderMultiChoice from './RenderMultiChoice'; // Import the renderMultiChoice function
export default function renderStack({ item, column, allcolJSON, maxBarValues }) {
    var _a;
    return (React.createElement("div", null, (_a = column.fields) === null || _a === void 0 ? void 0 : _a.map((field, fieldIndex) => {
        const fieldColumn = allcolJSON[field];
        if (!fieldColumn) {
            return React.createElement("div", { className: `stack ${field}`, key: fieldIndex }, "\u00A0");
        }
        const content = (() => {
            switch (fieldColumn.type) {
                case 'bar':
                    return renderBar({ item, field, column: fieldColumn, maxBarValues });
                case 'number':
                    return renderNumber({ item, field, column: fieldColumn, shouldMerge: false });
                case 'html':
                    return renderHtml({ item, field });
                case 'link':
                    return renderLink({ item, field, column: fieldColumn });
                case 'person':
                    return renderPersonCard({ item, field, column: fieldColumn, shouldMerge: false });
                case "multiChoice":
                    return renderMultiChoice({ item, field, column, shouldMerge: false });
                default:
                    return renderDefault({ item, field, column: fieldColumn, shouldMerge: false });
            }
        })();
        return (React.createElement("div", { className: `stack ${field}`, key: fieldIndex }, content));
    })));
}
//# sourceMappingURL=RenderStack.js.map