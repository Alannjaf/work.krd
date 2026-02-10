import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { checkUserLimits } from '@/lib/db';
import { getHtmlTemplate } from '@/components/html-templates/registry';
import { renderResumeToHtml } from '@/lib/pdf/renderHtml';
import { generatePdfFromHtml } from '@/lib/pdf/generatePdf';
import { isResumeRTL } from '@/lib/rtl';
import React from 'react';
import { errorResponse, authErrorResponse, notFoundResponse, validationErrorResponse } from '@/lib/api-helpers';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return authErrorResponse();
    }

    const { searchParams } = new URL(request.url);
    const resumeDataStr = searchParams.get('data');
    const template = searchParams.get('template');

    if (!resumeDataStr || !template) {
      return validationErrorResponse('Missing required fields');
    }

    let resumeData;
    try {
      resumeData = JSON.parse(decodeURIComponent(resumeDataStr));
    } catch (error) {
      console.error('[DataView] Failed to parse resume data:', error);
      return validationErrorResponse('Invalid resume data');
    }

    // Get user limits and available templates
    const limits = await checkUserLimits(userId);

    if (!limits.subscription) {
      return notFoundResponse('User subscription not found');
    }

    // Check if user has access to the template
    const hasAccess = limits.availableTemplates?.includes(template) || false;

    // Generate PDF via HTML + Puppeteer pipeline
    const entry = getHtmlTemplate(template);
    if (!entry) {
      return notFoundResponse('Template not found');
    }

    const Component = entry.component;
    const element = React.createElement(Component, { data: resumeData });
    const isRTL = isResumeRTL(resumeData);
    const html = await renderResumeToHtml(element, isRTL);
    const buffer = await generatePdfFromHtml(html);

    // Return PDF as response with appropriate headers
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'X-Frame-Options': 'SAMEORIGIN',
        'X-Template-Access': hasAccess ? 'granted' : 'restricted',
      },
    });
  } catch (error) {
    console.error('[DataView] Failed to generate preview PDF:', error);
    return errorResponse('Failed to generate preview PDF', 500);
  }
}
