import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import React from 'react';
import { errorResponse, authErrorResponse, forbiddenResponse, validationErrorResponse } from '@/lib/api-helpers';
import { getHtmlTemplate } from '@/components/html-templates/registry';
import { renderResumeToHtml } from '@/lib/pdf/renderHtml';
import { generatePdfFromHtml } from '@/lib/pdf/generatePdf';
import { isResumeRTL } from '@/lib/rtl';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return authErrorResponse();
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: {
        id: true,
        role: true,
      },
    });

    if (!user || user.role !== 'ADMIN') {
      return forbiddenResponse();
    }

    const body = await request.json();
    const { resumeData, template } = body;

    if (!resumeData || !template) {
      return validationErrorResponse('Missing required fields');
    }

    // Validate resume data before generating PDF
    if (!resumeData || typeof resumeData !== 'object') {
      return validationErrorResponse('Invalid resume data provided');
    }

    // Ensure personal info exists (required for PDF generation)
    if (!resumeData.personal) {
      resumeData.personal = {
        fullName: '',
        email: '',
        phone: '',
        location: '',
        linkedin: '',
        website: '',
        title: '',
        profileImage: '',
        dateOfBirth: '',
        gender: '',
        nationality: '',
        maritalStatus: '',
        country: ''
      };
    }

    // Generate PDF without watermark for admin users
    const entry = getHtmlTemplate(template);
    if (!entry) {
      return errorResponse('Template not found', 404);
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
      },
    });
  } catch (error) {
    console.error('Admin PDF generation error:', error);
    return errorResponse('Failed to generate preview PDF', 500);
  }
}
