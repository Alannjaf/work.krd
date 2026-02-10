'use client';

import React from 'react';
import { ResumeData } from '@/types/resume';
import { TemplateRenderer } from '@/components/html-templates/TemplateRenderer';

interface ResumePreviewProps {
  data: ResumeData;
  template: string;
}

export function ResumePreview({ data, template }: ResumePreviewProps) {
  return <TemplateRenderer templateId={template} data={data} />;
}
