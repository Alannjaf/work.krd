import type { HtmlTemplateProps } from './types';
import type { ComponentType } from 'react';
import { BasicTemplate } from './BasicTemplate';
import { ModernTemplate } from './ModernTemplate';
import { ElegantTemplate } from './ElegantTemplate';
import { BoldTemplate } from './BoldTemplate';
import { DeveloperTemplate } from './DeveloperTemplate';
import { CreativeTemplate } from './CreativeTemplate';

export interface TemplateEntry {
  id: string;
  name: string;
  component: ComponentType<HtmlTemplateProps>;
}

export const templateRegistry: Record<string, TemplateEntry> = {
  basic: { id: 'basic', name: 'Basic', component: BasicTemplate },
  modern: { id: 'modern', name: 'Modern Professional', component: ModernTemplate },
  elegant: { id: 'elegant', name: 'Elegant Dark', component: ElegantTemplate },
  bold: { id: 'bold', name: 'Bold Creative', component: BoldTemplate },
  developer: { id: 'developer', name: 'Developer', component: DeveloperTemplate },
  creative: { id: 'creative', name: 'Creative', component: CreativeTemplate },
};

export function getHtmlTemplate(templateId: string): TemplateEntry {
  return templateRegistry[templateId] || templateRegistry['basic'];
}
