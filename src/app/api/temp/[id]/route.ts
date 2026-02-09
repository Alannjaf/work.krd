import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { checkUserLimits } from '@/lib/db';
import { getTemplate } from '@/lib/getTemplate';
import { pdf } from '@react-pdf/renderer';
import React from 'react';
import { tempStore } from '@/lib/tempStore';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const stored = tempStore.get(id);

    if (!stored || stored.userId !== userId) {
      return NextResponse.json({ error: 'Data not found' }, { status: 404 });
    }

    // Clean up the stored data
    tempStore.delete(id);

    const { data: resumeData, template } = stored;

    // Get user limits and available templates
    const limits = await checkUserLimits(userId);
    
    if (!limits.subscription) {
      return NextResponse.json({ error: 'User subscription not found' }, { status: 404 });
    }

    // Check if user has access to the template
    const hasAccess = limits.availableTemplates?.includes(template) || false;
    
    // Generate PDF (watermark will be handled via CSS overlay on client)
    const templateComponent = await getTemplate(template, resumeData);
    
    if (!templateComponent) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
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
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}