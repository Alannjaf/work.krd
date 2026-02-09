import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { checkUserLimits } from '@/lib/db';
import { getTemplate } from '@/lib/getTemplate';
import { pdf } from '@react-pdf/renderer';
import React from 'react';
import { tempStore } from '@/lib/tempStore';
import { errorResponse, authErrorResponse, notFoundResponse } from '@/lib/api-helpers';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return authErrorResponse();
    }

    const { id } = await params;
    const stored = tempStore.get(id);

    if (!stored || stored.userId !== userId) {
      return notFoundResponse('Data not found');
    }

    // Clean up the stored data
    tempStore.delete(id);

    const { data: resumeData, template } = stored;

    // Get user limits and available templates
    const limits = await checkUserLimits(userId);
    
    if (!limits.subscription) {
      return notFoundResponse('User subscription not found');
    }

    // Check if user has access to the template
    const hasAccess = limits.availableTemplates?.includes(template) || false;
    
    // Generate PDF (watermark will be handled via CSS overlay on client)
    const templateComponent = await getTemplate(template, resumeData);
    
    if (!templateComponent) {
      return notFoundResponse('Template not found');
    }

    // Generate PDF blob
    const pdfDoc = pdf(React.createElement(templateComponent.type, templateComponent.props));
    const blob = await pdfDoc.toBlob();
    
    // Convert blob to buffer
    const buffer = await blob.arrayBuffer();


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
    console.error('[TempPDF] Failed to generate PDF:', error);
    return errorResponse('Failed to generate PDF', 500);
  }
}