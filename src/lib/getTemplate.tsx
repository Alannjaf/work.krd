import React from 'react';
import { ResumeData } from '../types/resume';

const templateImports: Record<string, () => Promise<{ default: React.ComponentType<{ data: ResumeData; watermark?: boolean }> }>> = {
  'modern': () => import('../components/resume-pdf/EnhancedModernTemplate'),
  'creative': () => import('../components/resume-pdf/CreativeTemplate').then(m => ({ default: m.CreativeTemplate })),
  'executive': () => import('../components/resume-pdf/ExecutiveProfessionalTemplate').then(m => ({ default: m.ExecutiveProfessionalTemplate })),
  'elegant': () => import('../components/resume-pdf/ElegantProfessionalTemplate').then(m => ({ default: m.ElegantProfessionalTemplate })),
  'minimalist': () => import('../components/resume-pdf/MinimalistModernTemplate').then(m => ({ default: m.MinimalistModernTemplate })),
  'creative-artistic': () => import('../components/resume-pdf/CreativeArtisticTemplate').then(m => ({ default: m.CreativeArtisticTemplate })),
  'developer': () => import('../components/resume-pdf/DeveloperTemplate').then(m => ({ default: m.DeveloperTemplate })),
  'corporate': () => import('../components/resume-pdf/CorporateProfessionalTemplate').then(m => ({ default: m.CorporateProfessionalTemplate })),
  'creative-modern': () => import('../components/resume-pdf/CreativeModernTemplate').then(m => ({ default: m.CreativeModernTemplate })),
  'classic': () => import('../components/resume-pdf/ClassicTraditionalTemplate').then(m => ({ default: m.ClassicTraditionalTemplate })),
};

export const getTemplate = async (template: string, data: ResumeData, watermark?: boolean) => {
  const importFn = templateImports[template] || templateImports['modern'];
  const { default: TemplateComponent } = await importFn();
  return <TemplateComponent data={data} watermark={watermark} />;
};
