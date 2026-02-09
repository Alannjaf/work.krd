import { pdf } from '@react-pdf/renderer';
import { ResumeData } from '../types/resume';
import { initializePDFFonts } from './pdfFonts';
import React from 'react';
import EnhancedModernTemplate from '../components/resume-pdf/EnhancedModernTemplate';
import { CreativeTemplate } from '../components/resume-pdf/CreativeTemplate';
import { ExecutiveProfessionalTemplate } from '../components/resume-pdf/ExecutiveProfessionalTemplate';
import { ElegantProfessionalTemplate } from '../components/resume-pdf/ElegantProfessionalTemplate';
import { MinimalistModernTemplate } from '../components/resume-pdf/MinimalistModernTemplate';
import { CreativeArtisticTemplate } from '../components/resume-pdf/CreativeArtisticTemplate';
import { DeveloperTemplate } from '../components/resume-pdf/DeveloperTemplate';

// Get the actual template component with watermark baked in
export const getTemplateComponent = (template: string, data: ResumeData, watermark?: boolean) => {
  switch (template) {
    case 'creative':
      return <CreativeTemplate data={data} watermark={watermark} />;
    case 'executive':
      return <ExecutiveProfessionalTemplate data={data} watermark={watermark} />;
    case 'elegant':
      return <ElegantProfessionalTemplate data={data} watermark={watermark} />;
    case 'minimalist':
      return <MinimalistModernTemplate data={data} watermark={watermark} />;
    case 'creative-artistic':
      return <CreativeArtisticTemplate data={data} watermark={watermark} />;
    case 'developer':
      return <DeveloperTemplate data={data} watermark={watermark} />;
    case 'modern':
    default:
      return <EnhancedModernTemplate data={data} watermark={watermark} />;
  }
};

// Generate watermarked PDF using actual template with watermark baked into rendering
export const generateWatermarkedPDF = async (template: string, data: ResumeData): Promise<Uint8Array> => {
  // Initialize fonts for Unicode support (Kurdish Sorani, Arabic, English)
  initializePDFFonts();

  // Get the template component with watermark enabled
  const templateComponent = getTemplateComponent(template, data, true);

  // Generate PDF — watermark is part of the React-PDF render tree
  const pdfDoc = pdf(templateComponent);
  const pdfBlob = await pdfDoc.toBlob();
  const arrayBuffer = await pdfBlob.arrayBuffer();

  return new Uint8Array(arrayBuffer);
};
