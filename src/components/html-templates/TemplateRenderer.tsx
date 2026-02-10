import React from 'react';
import { getHtmlTemplate } from './registry';
import type { HtmlTemplateProps } from './types';

interface TemplateRendererProps extends HtmlTemplateProps {
  templateId: string;
}

export function TemplateRenderer({ templateId, data, watermark }: TemplateRendererProps) {
  const entry = getHtmlTemplate(templateId);
  const Component = entry.component;
  return <Component data={data} watermark={watermark} />;
}
