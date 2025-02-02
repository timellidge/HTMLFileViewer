import * as React from 'react';
import { useState, useEffect, useRef } from 'react'; 
import { IColumnsConfig, IColumnJSON } from '../../../helpers/Interfaces'; // Ensure this import is correct
import styles from './TableViewer.module.scss';
import { mergeStyles } from '@fluentui/react';
import { Panel, PanelType } from '@fluentui/react/lib/Panel';
import * as _ from 'lodash';
import { Icon } from '@fluentui/react/lib/Icon';
import PersonCard from './TabsRender/PersonCard';
import { DateTime } from 'luxon';
import { getContrastingTextColor } from '../../../helpers/Utilities'; // Ensure this import is correct

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

  const onLoad = (event: React.SyntheticEvent<HTMLIFrameElement>) => {
    const iframe = event.currentTarget as HTMLIFrameElement;
    iframe.contentWindow.addEventListener('beforeunload', closeSidePanel);
  };

   // we can use the width directly from the column definition to set the grid template columns for the table but dont include the "" ones as they are hidden
  const _sortedColumns = Object.keys(colJSON)
    .map((key) => ({ key, column: colJSON[key] }))
    .sort((a, b) => (a.column.sequence || 99) - (b.column.sequence || 99));

  // we can use the width directly from the column definition to set the grid template columns for the table but dont include the "" ones as they are hidden
  const _columnWidths = _sortedColumns
    .filter(({ column }) => column.width !== "")
    .map(({ column }) => column.width)
    .join(" ");

  const scrollbarWidth = hasVerticalScrollbar ? "17px" : "0px";
  const _GridStyle = mergeStyles(styles.tableGrid, { gridTemplateColumns: _columnWidths, maxHeight: contentHeight || "100%" });
  const _HeadStyle = mergeStyles(styles.headerGrid, { gridTemplateColumns: `${_columnWidths} ${scrollbarWidth}` });
  
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
            colJSON[sortField.key].type === "multichoice"
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

  // does the main section have a scroll BAr if so then we need to adjust the width of the grid to allow for it
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
  //^ A LOAD OF RENDER FUNCTIONS TO SIMPLIFY THE RETURN LOGIC BY SPLITTING EACH TYPE OUT INTO A FUNCTION
  //=================================================================================================================

  //=================================================================================================================
  // PERSON CARD WITH ROWMERGE
  //=================================================================================================================
  const renderPersonCard = (item: any, key: any, column: IColumnJSON, shouldMerge: boolean) => {

    if (shouldMerge) {
      return <span>&nbsp;</span>;
    }

    return (
      <PersonCard
        email={item[key].rawValue[0].email}
        name={item[key].rawValue[0].name}
        title={item[key].rawValue[0].title}
        format={column.format}
      />
    );
  };

  //=================================================================================================================
  // HTML FIELD NO ROWMERGE
  //=================================================================================================================
  const renderHtml = (htmltext: string) => (
    <div dangerouslySetInnerHTML={{ __html: htmltext }} />
  );

  //=================================================================================================================
  // DEFAULT RENDER FUNCTION WITH LINES CLAMP EXTENDED THIS IF THERE IS A PRE OR POST TO INCLUDE SOME SPANS FOR STYLING HAS ROWMERGE  
  //=================================================================================================================
  const renderDefault = (content: string, column: IColumnJSON, shouldMerge: boolean) => {

    if (shouldMerge) {
      return <span>&nbsp;</span>;
    }

    if (!content) {
      return <span>&nbsp;</span>;
    }

    return column.lines ? (
      <div
        className={styles.tableDataContent}
        style={{ WebkitLineClamp: column.lines, lineClamp: column.lines }}
      >
        {column.prefix && <span>{column.prefix}</span>}
        {content} 
        {column.suffix && <span>{column.suffix}</span>}
      </div>
    ) : (
      <>
        {column.prefix && <span>{column.prefix}</span>}
        {content} 
        {column.suffix && <span>{column.suffix}</span>}
      </>
    );
  };

  //=================================================================================================================
  // NUMBER RENDER FUNCTION ALIGN HAS ROWMERGE BUT NOT SURE IF NEEDED
  //=================================================================================================================
  const renderNumber = (displayText: string, column: IColumnJSON, shouldMerge:boolean) => { 

    if (shouldMerge) {
      return <span>&nbsp;</span>;
    }

    return(
      <div className={styles.numberCell}>
        {column.prefix && <span>{column.prefix}</span>}
        {displayText}
        {column.suffix && <span>{column.suffix}</span>}
      </div>
    )
  };

  //=================================================================================================================
  // RENDER LINK FUNCTION NO ROWMERGE 
  //=================================================================================================================
  const renderLink = ( link: string, displayText: string, column: IColumnJSON) => {
    if (!link) {
      return null;
    }
    return (
      <div className={styles.tableDataContent}>
        {column.prefix && <span>{column.prefix}</span>}
        <a href={link} >{displayText}</a>
        {column.suffix && <span>{column.suffix}</span>}
      </div>
    );
  };

  //=================================================================================================================
  // EDIT RENDER FUNCTION NO ROWMERGE THIS ALSE HAS A DEFAULT ICON AND COLOR IF NONE IS SPECIFIED
  //=================================================================================================================
  const renderEdit = ( id: number, displayText: string, column: IColumnJSON) => {
    let iconName="edit";
    let iconColor = "#0078d4";

    if (column.icons && typeof column.icons === 'object') {
      const [firstIconName, firstIconColor] =  Object.entries(column.icons)[0];
       [iconName, iconColor] = firstIconColor.split("|");
    }
    
    return (
      <div className={styles.editCell}>
        <Icon
          iconName={iconName}
          title={displayText}
          style={{ color: iconColor }}
          onClick={() => handleIconClick(id)}
        />
      </div>
    )
  };

  //=================================================================================================================
  // ICON RENDER FUNCTION - ICONS ARE DEFINED IN THE COLUMN JSON NO ROWMERGE
  //=================================================================================================================
  const renderIcon = (displayValue: string, column: IColumnJSON) => {
    const iconData = column.icons[displayValue];
    if (iconData) {
      const [iconName, iconColor] = iconData.split("|");
      return (
        <div className={styles.iconCell}>
          <Icon
            iconName={iconName}
            style={{ color: iconColor }}
            title={displayValue}
          />
        </div>
      );
    } else {
      return displayValue;
    }
  };

  //=================================================================================================================
  // BAR RENDER FUNCTION - THIS WILL RENDER A BAR BASED ON THE VALUE OF THE FIELD HAS ROWMERGE IGNORES SUFFIX
  //=================================================================================================================
  const renderBar = (value: string , name : string, column: IColumnJSON) => {
    const rawValue = parseFloat(value) || 0;
    const maxValue = column.barSettings?.limit ||  maxBarValues[name] || 100; // Set a default height if not provided
    const percentage = (rawValue / maxValue) * 100;
    //console.log(">>> bar", rawValue, maxValue, percentage);
    if (percentage < 0) { return null; }

    // now do the styling for the bar
    const barcol = column.barSettings?.color || "#d0d0d0"; // Set barcol to column.barSettings.color if it exists, otherwise "darkblue"
    const barHeight = column.barSettings?.height || "20px"; // Set a default height if not provided
    const _barStyle = mergeStyles(styles.chartBar, {backgroundColor: barcol, height: barHeight, width: `${percentage}%` });

    const textCol = percentage < 50 ? "#000000" : getContrastingTextColor(barcol); // get a contrast if it's goiong inside else use black
    // Set the position of the bar label based on the percentage ( < 50 its outside >50 its inside in a contrasting color but if there is an icon add more paddign to the right)

    const labelPadding = column.barSettings?.icon ? "20px" : "5px";
    const _barLabelStyle = percentage < 50
      ? mergeStyles(styles.chartLabel, { width:`${100-percentage}%`, left:`${percentage}%`, textAlign: 'left' , color: textCol }) //outside One
      : mergeStyles(styles.chartLabel, { width: `${percentage}%`, textAlign: 'right', paddingRight: labelPadding, color: textCol }); //Inside one
   
    // Determine the label content based on barSettings if its not spacififed then just use the raw value
    let labelContent = null;
    if(column.barSettings) {
      if (column.barSettings?.showValue && column.barSettings?.showPercentage) {
        labelContent = `${rawValue} (${percentage.toFixed(0)}%)`;
      } else if (column.barSettings?.showValue) {
        labelContent = `${rawValue}`;
      } else if (column.barSettings?.showPercentage) {
        labelContent = `${percentage.toFixed(0)}%`;
      }
    } else{
      labelContent = rawValue
    }

    let iconName = null;
    let iconColor = null; 
    if(column.barSettings.icon){
      [iconName, iconColor] = column.barSettings?.icon?.split("|"); // does thismake it super conditional on the icon being there?
    }
    return (
      <div className={styles.barGrid}>
        {column.prefix ? <span className={styles.chartPrefix} >{column.prefix}</span> : <span>&nbsp;</span>}
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
        <div className = {_barLabelStyle}> {labelContent} </div> 
      </div>
    );
  };

 
  //=================================================================================================================
  // CATCH ALL FOR NO DATA
  //=================================================================================================================
  const renderNoData = (column: IColumnJSON) =>
    // even  though there is no field i still need to check if its a stack or not
    column.type === "stack" ? (
      <div>
        {column.fields.map((field, fieldIndex) => (
          <div key={fieldIndex} className={`stack ${field}`}>
            No Data
          </div>
        ))}
      </div>
    ) : (
      <span>No Data</span>
  );

  //=================================================================================================================
  // THIS IS THE STACK RENDER FUNCTION - IT WILL LOOP THROUGH THE FIELDS IN THE STACK AND RENDER THEM ACCORDINGLY
  //=================================================================================================================
  const renderStack = (
    item: any,
    column: IColumnJSON,
    allcolJSON: IColumnsConfig
  ) => (
    <div>
      {column.fields.map((field: string, fieldIndex: number) => {
        const fieldColumn = allcolJSON[field];
        if (!fieldColumn) {
          return ( <div className={`stack ${field}`} key={fieldIndex}>&nbsp;</div>);
        }
        //console.log(">>> stack field:", field,  "  display:", item[field].displayValue, "  raw:", item[field].rawValue ,"  JSON:" ,fieldColumn);
        const content = (() => {
          switch (fieldColumn.type) {
            case 'bar':
              return renderBar(item[field].displayValue, field, fieldColumn);
            case 'number':
              return renderNumber(item[field].displayValue, fieldColumn, false);
            case 'html':
              return renderHtml(item[field].rawValue);
            case "link":
              return renderLink(item[field].rawValue, item[field].displayValue, fieldColumn);
            case 'person':
              return renderPersonCard(item, field, fieldColumn, false);
            default:
              return renderDefault(item[field].displayValue, fieldColumn, false);
          }
        })();
  
        return (
          <div className={`stack ${field}`} key={fieldIndex}>
            {content}
          </div>
        );
      })}
    </div>
  );
  
  //=================================================================================================================
  //^  THE RETURN FUNCTION
  //=================================================================================================================
  return (
    <>
      {/* DRAW THE HEADER BAR with the column names and the sort icons? */}
      <div className={_HeadStyle}>
        {_sortedColumns.map(
          ({ key, column }) =>
            column.width > "0" && (
              <div key={key} className={styles.tableHeaderCell}>
                <span>{column.name}</span>
                {column.isSortable && (
                  <Icon
                    iconName={
                      sortField.key !== key
                        ? "Sort"
                        : sortField.direction
                        ? "SortDown"
                        : "SortUp"
                    }
                    className={styles.sortIcon}
                    onClick={() => handleSortToggle(key)}
                  />
                )}
              </div>
            )
        )}
        <div className={styles.tableHeaderCell}> &nbsp; </div>
      </div>
      
      <div className={_GridStyle}>
        {/* Render the cells */}
        {sortedItems.map((item, itemIndex) => (
          <React.Fragment key={itemIndex}>
             {_sortedColumns.map(
              ({ key, column }) => {
                const shouldMerge = column.rowMerge && itemIndex > 0 && item[key]?.displayValue === sortedItems[itemIndex - 1][key]?.displayValue;
                return column.width > "0" && (
                  <div
                    key={`${itemIndex}-${key}`}
                    className={`${styles.tableCell} ${ column.class ? column.class : "" }`}
                    data-row={item.ID.rawValue}
                    onMouseEnter={(event) => handleMouseEnter(event)}
                    onMouseLeave={(event) => handleMouseLeave(event)}
                  >
                    {(() => {
                      switch (column.type) {
                        case "stack":
                          return renderStack(item, column, colJSON);
                        case "person":
                          return renderPersonCard(item, key, column, shouldMerge);
                        case "html":
                          return renderHtml(item[key].rawValue);
                        case "icon":
                          return renderIcon(item[key].displayValue, column);
                        case "link":
                          return renderLink(item[key].rawValue, item[key].displayValue, column);
                        case "edit":
                          return renderEdit(item["ID"].rawValue, "Edit", column);
                        case "number":
                          return renderNumber(item[key].displayValue, column, shouldMerge);
                        case "bar":
                          return renderBar(item[key].displayValue, key, column);
                        default:
                          return item[key] ? renderDefault(item[key].displayValue, column, shouldMerge) : renderNoData(column);
                      }
                    })()}
                  </div>
                );
              }
            )}
          </React.Fragment>
        ))}
      </div>
     
      {/* Side panel */}
      <Panel
        isOpen={isSidePanelOpen}
        onDismiss={closeSidePanel}
        closeButtonAriaLabel="Close"
        type={PanelType.largeFixed} // Set the size of the panel    
      >
        <iframe
          id="iframePanel"
          src={iframeUrl}
          ref={iframeRef}
          onLoad={onLoad}
          style={{border: 'none', height: height + 'px', width: '100%'}}
        />
      </Panel>
    </>
  );
}

export default TableGridRender;