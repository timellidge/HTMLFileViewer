import * as React from 'react';
import { useState, useEffect, useRef } from 'react'; 
import styles from '../TableViewer.module.scss';
import { mergeStyles } from '@fluentui/react';
import { Panel, PanelType } from '@fluentui/react/lib/Panel';
import * as _ from 'lodash';

import { IColumnsConfig } from '../../../../helpers/Interfaces'; // Ensure this import is correct
import { DateTime }     from 'luxon';

import TableGridHeader   from './TableGridHeader';
import TableGridFooter   from './TableGridFooter';
import renderPersonCard  from '../RenderFragments/RenderPersonCard';
import renderBar         from '../RenderFragments/RenderBar';
import renderIcon        from '../RenderFragments/RenderIcon';
import renderEdit        from '../RenderFragments/RenderEdit';
import renderNumber      from '../RenderFragments/RenderNumber'; // Import the renderNumber function
import renderDefault     from '../RenderFragments/RenderDefault'; // Import the renderDefault function
import renderNoData      from '../RenderFragments/RenderNoData'; // Import the renderNoData function
import renderLink        from '../RenderFragments/RenderLink'; // Import the renderLink function
import renderHtml        from '../RenderFragments/RenderHtml'; // Import the RenderHTML function
import renderMultiChoice from '../RenderFragments/RenderMultiChoice'; // Import the renderMultiChoice function
import renderStack       from '../RenderFragments/RenderStack'; // Import the RenderStack function

interface ITableGridRenderProps {
  listUrl: string;  
  colJSON: IColumnsConfig;
  items: any[];
  contentHeight: string;
  maxBarValues?: { [key: string]: number };
  height:number | 800;
}

const TableGridRender: React.FunctionComponent<ITableGridRenderProps> = ({ listUrl, colJSON, items, contentHeight, maxBarValues, height }) => {
  //we can only have one column sorted at a time so i need to know its name and its state
  const [sortField, setSortField] = useState<{
    key: string;
    direction: boolean | null;
  }>({ key: "", direction: null });

  const [sortedItems, setSortedItems] = useState<any[]>(items);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false); 
  const iframeRef = React.useRef<HTMLIFrameElement>(null);
  const [iframeUrl, setIframeUrl] = useState<string>('');
  const [hasVerticalScrollbar, setHasVerticalScrollbar] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);
  const [itemTotals, setItemTotals] =  useState<{ [key: string]: number }>({});

  const onLoad = (event: React.SyntheticEvent<HTMLIFrameElement>) => {
    const iframe = event.currentTarget as HTMLIFrameElement;
    iframe.contentWindow.addEventListener('beforeunload', closeSidePanel);
  };

   // we can use the width directly from the column definition to set the grid template columns for the table but dont include the "" ones as they are hidden
  const _sortedColumns = Object.keys(colJSON)
    .map((key) => ({ key, column: colJSON[key] }))
    .sort((a, b) => (a.column.sequence || 99) - (b.column.sequence || 99));

  // check if any of the columns have a total set to true if so we need to display a footer row with the totals for those columns
  const hasTotal =  _sortedColumns.some(({ key, column }) => column.width > "0" && column.type === 'number' && column.showTotal);

  // we can use the width directly from the column definition to set the grid template columns for the table but dont include the "" ones as they are hidden
  const _columnWidths = _sortedColumns
    .filter(({ column }) => column.width !== "")
    .map(({ column }) => column.width)
    .join(" ");

  const scrollbarWidth = hasVerticalScrollbar ? "17px" : "0px";
  const _GridStyle = mergeStyles(styles.tableGrid, { gridTemplateColumns: _columnWidths, maxHeight: contentHeight || "100%" });
  const _HeadStyle = mergeStyles(styles.headerGrid, { gridTemplateColumns: `${_columnWidths} ${scrollbarWidth}` });
  const _FootStyle = mergeStyles(styles.footerGrid, { gridTemplateColumns: `${_columnWidths} ${scrollbarWidth}` });
  
  //=================================================================================================================
  // GENERAL INTERACTION FUNCTIONS
  //=================================================================================================================
  const handleSortToggle = (columnKey: string) => {
    setSortField((prevState) => ({
      key: columnKey,
      direction: prevState.key === columnKey ? !prevState.direction : true,
    }));
  };

  const handleMouseEnter = (event: React.MouseEvent<HTMLDivElement>) => {
    const row = event.currentTarget.getAttribute("data-row");
    const cellsInRow = document.querySelectorAll(
      `.${styles.tableCell}[data-row="${row}"]`
    );
    cellsInRow.forEach((cell) => {
      cell.classList.add(styles.highlight);
    });
  };

  const handleMouseLeave = (event: React.MouseEvent<HTMLDivElement>) => {
    const row = event.currentTarget.getAttribute("data-row");
    const cellsInRow = document.querySelectorAll(
      `.${styles.tableCell}[data-row="${row}"]`
    );
    cellsInRow.forEach((cell) => {
      cell.classList.remove(styles.highlight);
    });
  };

  const handleIconClick = (id: number) => {
    // different list types have different edit forms so we need to check the url and adjust accordingly
    console.log(`${listUrl}/EditForm.aspx?ID=${id}`);
    if (listUrl.indexOf("/Lists/") > 0) {
      setIframeUrl(`${listUrl}/EditForm.aspx?ID=${id}`);
    } else {
      setIframeUrl(`${listUrl}/Forms/EditForm.aspx?ID=${id}`);
    }
    openSidePanel();
  };

  const closeSidePanel = () => {
    setIsSidePanelOpen(false);
  };

  const openSidePanel = () => {
    setIsSidePanelOpen(true);
  };

  //=================================================================================================================
  //^ USE EFFECTS SORT & SCROLL - 
  //=================================================================================================================  

  useEffect(() => {
    // Calculate totals after items (filtered items by time we get here) have been processed
    // BUT only for the columns that are set to show totals of type number and have a width > 0
    const totals: { [key: string]: number } = {};
    items.forEach(item => {
      Object.keys(colJSON).forEach(key => {
        const column = colJSON[key];
        if (column.showTotal && column.type === "number" && column.width > '0') {
          const rawValue = parseFloat(item[key]?.rawValue) || 0;
          totals[key] = (totals[key] || 0) + rawValue;
        }
      });
    });

    console.log(">>> totals", totals);
    setItemTotals(totals);
  }, [items, colJSON]);


 // THE SORT USE EFFECT - THIS WILL SORT THE ITEMS BASED ON THE SORT FIELD, FIELD TYPE AND DIRECTION
  useEffect(() => {
    if (sortField.key) {
      const sorted = [...items].sort((a, b) => {
        //console.log(">>> sorting", sortField.key, "which is a ", colJSON[sortField.key].type, "in direction", sortField.direction);
        let aValue;
        let bValue;
        // dependign on the type we must source the data differently for sorting also if its a stack we cant sort the date liek a string so we need to do a double lookup into the columns to get the info we need to make the choice
        if (colJSON[sortField.key].type == "stack") {
          // do the lookup into trhe stack to get the first field in the stack then look up its type and sort accordingly
          if (
            colJSON[colJSON[sortField.key].fields[0]].type === "date" ||
            colJSON[colJSON[sortField.key].fields[0]].type === "number"
          ) {
            aValue = a[colJSON[sortField.key].fields[0]].rawValue;
            bValue = b[colJSON[sortField.key].fields[0]].rawValue;
          } else {
            aValue = a[colJSON[sortField.key].fields[0]].displayValue;
            bValue = b[colJSON[sortField.key].fields[0]].displayValue;
          }
        } else {
          // its not a stack so we can just look up the field and sort it
          if (
            colJSON[sortField.key].type === "person" ||
            colJSON[sortField.key].type === "multiChoice"
          ) {
            aValue = a[sortField.key].displayValue;
            bValue = b[sortField.key].displayValue;
          } else {
            // its a number or a string or a date so we can sort it as is
            aValue = a[sortField.key].rawValue;
            bValue = b[sortField.key].rawValue;
          }
        }

        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;

        // Check if the values are dates
        if (DateTime.isDateTime(aValue) && DateTime.isDateTime(bValue)) {
          return sortField.direction
            ? aValue.toMillis() - bValue.toMillis()
            : bValue.toMillis() - aValue.toMillis();
        }

        // we have already dealt with Dates so everythign else is a strign or a number.
        if (typeof aValue === "number" && typeof bValue === "number") {
          return sortField.direction ? aValue - bValue : bValue - aValue;
        } else {
          return sortField.direction
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }
      });
      setSortedItems(sorted);
    } else {
      setSortedItems(items);
    }
  }, [sortField, items]);

  // does the main section have a scroll Bar if so then we need to adjust the width of the grid to allow for it
  useEffect(() => {
    const checkForScrollbar = () => {
      if (gridRef.current) {
        setHasVerticalScrollbar(gridRef.current.scrollHeight > gridRef.current.clientHeight);
        console.log(">>> scrollbar", gridRef.current.scrollHeight, gridRef.current.clientHeight);
      }
    };

    checkForScrollbar();
    window.addEventListener('resize', checkForScrollbar);
    return () => {
      window.removeEventListener('resize', checkForScrollbar);
    };
  }, []);

  //=================================================================================================================
  //^  THE RETURN FUNCTION
  //=================================================================================================================
  return (
    <>
      {/* DRAW THE HEADER BAR with the column names and the sort icons? */}
      <TableGridHeader  _sortedColumns={_sortedColumns} sortField={sortField}  handleSortToggle={handleSortToggle} _headStyle={_HeadStyle} />
      
      <div className={_GridStyle}>
        {/* Render the cells */}
        {sortedItems.map((item, itemIndex) => (
          <React.Fragment key={itemIndex}>
             {_sortedColumns.map(
              ({ key, column }) => {
                const field = key;
                const shouldMerge = column.rowMerge && itemIndex > 0 && item[field]?.displayValue === sortedItems[itemIndex - 1][field]?.displayValue;
                return column.width > "0" && (
                  <div
                    key={`${itemIndex}-${field}`}
                    className={`${styles.tableCell} ${ column.class ? column.class : "" }`}
                    data-row={itemIndex}
                    onMouseEnter={(event) => handleMouseEnter(event)}
                    onMouseLeave={(event) => handleMouseLeave(event)}
                  >
                    {(() => {
                      switch (column.type) {
                        case "stack":
                          return renderStack({item, column, allcolJSON: colJSON , maxBarValues });
                        case "person":
                          return renderPersonCard({ item, field, column, shouldMerge: false });
                        case "html":
                          return renderHtml({item, field});
                        case "icon":
                          return renderIcon({ item, field: key, column });
                        case "link":
                          return renderLink({ item, field, column });
                        case "edit":
                          return renderEdit({ item, field: "ID", column, handleIconClick });
                        case "number":
                          return renderNumber({ item, field, column, shouldMerge });
                        case "multiChoice":
                          return renderMultiChoice({ item, field, column, shouldMerge });
                        case "bar":
                          return renderBar({ item, field, column, maxBarValues });
                        default:
                          return item[field] ? renderDefault({ item, field, column, shouldMerge }) : renderNoData({ column });
                      }
                    })()}
                  </div>
                );
              }
            )}
          </React.Fragment>
        ))}
      </div>

      {hasTotal && (
        <TableGridFooter _sortedColumns={_sortedColumns} itemTotals={itemTotals}  _footStyle={_FootStyle}/>
      )}
     
      {/* Side panel */}
      <Panel isOpen={isSidePanelOpen}  onDismiss={closeSidePanel}  closeButtonAriaLabel="Close"  type={PanelType.largeFixed} >   
        <iframe id="iframePanel" src={iframeUrl} ref={iframeRef} onLoad={onLoad} style={{border: 'none', height: (height-90) + 'px', width: '100%'}} />
      </Panel>
    </>
  );
}

export default TableGridRender;
