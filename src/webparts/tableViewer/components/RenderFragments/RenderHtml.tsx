import * as React from 'react';

interface IRenderHtmlProps {
  item: any;
  field: string;
}

export default function renderHtml({ item, field }: IRenderHtmlProps) {
  const htmltext = item[field].rawValue;
  return <div dangerouslySetInnerHTML={{ __html: htmltext }} />;
}