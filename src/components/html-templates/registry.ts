import { ModernTemplate } from './templates/modern/ModernTemplate';
import { ClassicTemplate } from './templates/classic/ClassicTemplate';
import { CreativeTemplate } from './templates/creative/CreativeTemplate';
import type { HtmlTemplateProps } from './types';
import type { ComponentType } from 'react';

export interface TemplateEntry {
  id: string;
  name: string;
  component: ComponentType<HtmlTemplateProps>;
}

export const templateRegistry: Record<string, TemplateEntry> = {
  modern: { id: 'modern', name: 'Modern Professional', component: ModernTemplate },
  classic: { id: 'classic', name: 'Classic Traditional', component: ClassicTemplate },
  creative: { id: 'creative', name: 'Creative', component: CreativeTemplate },
};

export function getHtmlTemplate(templateId: string): TemplateEntry {
  return templateRegistry[templateId] || templateRegistry['modern'];
}
