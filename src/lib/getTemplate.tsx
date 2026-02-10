import React from 'react';
import { ResumeData } from '../types/resume';
import { getHtmlTemplate } from '@/components/html-templates/registry';

export const getTemplate = async (template: string, data: ResumeData, watermark?: boolean) => {
  const entry = getHtmlTemplate(template);
  const Component = entry.component;
  return <Component data={data} watermark={watermark} />;
};
