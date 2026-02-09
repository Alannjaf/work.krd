import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { getTemplate } from '@/lib/getTemplate';
import { pdf } from '@react-pdf/renderer';
import { initializePDFFonts, areFontsRegistered } from '@/lib/pdfFonts';
import React from 'react';
import { errorResponse, authErrorResponse, forbiddenResponse, notFoundResponse, validationErrorResponse } from '@/lib/api-helpers';

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

    // Initialize fonts for Unicode support (Kurdish Sorani, Arabic, English)
    initializePDFFonts();
    
    // Log font registration status for debugging
    const fontsRegistered = areFontsRegistered();
    if (!fontsRegistered) {
      console.warn('Fonts not registered - PDF generation may fail for Kurdish/Arabic text');
    }

    // Generate PDF without watermark for admin users
    const templateComponent = await getTemplate(template, resumeData);
    
    if (!templateComponent) {
      return notFoundResponse('Template not found');
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
      },
    });
  } catch (error) {
    console.error('Admin PDF generation error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    // Log additional context for font-related errors
    if (errorMessage.includes('font') || errorMessage.includes('Font')) {
      console.error('Font-related error detected. Font registration status:', areFontsRegistered());
    }
    
    if (errorStack) {
      console.error('Error stack:', errorStack);
    }
    
    return errorResponse(`Failed to generate preview PDF: ${errorMessage}`, 500);
  }
}