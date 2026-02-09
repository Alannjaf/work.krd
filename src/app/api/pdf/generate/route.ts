import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { checkUserLimits } from '@/lib/db';
import { rateLimit, rateLimitResponse } from '@/lib/rate-limit';
import { getTemplate } from '@/lib/getTemplate';
import { pdf } from '@react-pdf/renderer';
import { prisma } from '@/lib/prisma';
import { ResumeData } from '@/types/resume';
import { initializePDFFonts, areFontsRegistered } from '@/lib/pdfFonts';
import React from 'react';
import { errorResponse, authErrorResponse, forbiddenResponse, notFoundResponse, validationErrorResponse } from '@/lib/api-helpers';
import { PDFDocument } from 'pdf-lib';

/**
 * Normalize Arabic-Indic numerals (٠-٩) to Western numerals (0-9)
 * This helps ensure phone numbers are handled correctly by PDF renderer
 */
function normalizePhoneNumber(phone: string | undefined | null): string {
  if (!phone || typeof phone !== 'string') return '';
  
  // Map Arabic-Indic numerals to Western numerals
  const arabicIndicMap: Record<string, string> = {
    '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
    '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9'
  };
  
  return phone.replace(/[٠-٩]/g, (char) => arabicIndicMap[char] || char);
}

/**
 * Sanitize string field - ensure it's a valid string
 */
function sanitizeStringField(value: unknown, defaultValue: string = ''): string {
  if (value === null || value === undefined) return defaultValue;
  if (typeof value === 'string') return value;
  return String(value);
}

type Action = 'preview' | 'download';

interface RequestBody {
  resumeData: ResumeData;
  template: string;
  action: Action;
}

export async function POST(request: NextRequest) {
  const { success, resetIn } = rateLimit(request, {
    maxRequests: 20,
    windowSeconds: 60,
    identifier: 'pdf',
  });
  if (!success) return rateLimitResponse(resetIn);

  try {
    const { userId } = await auth();
    if (!userId) {
      return authErrorResponse();
    }

    const body: RequestBody = await request.json();
    const { resumeData, template, action = 'preview' } = body;

    if (!resumeData || !template) {
      return validationErrorResponse('Missing required fields');
    }

    if (!['preview', 'download'].includes(action)) {
      return validationErrorResponse('Invalid action');
    }

    // Get user limits and available templates
    const limits = await checkUserLimits(userId);
    
    if (!limits.subscription) {
      return notFoundResponse('User subscription not found');
    }

    // Check if user has access to the template
    const hasAccess = limits.availableTemplates?.includes(template) || false;
    
    let buffer: ArrayBuffer;
    const shouldWatermark = !hasAccess;

    // For downloads, we need additional validation
    if (action === 'download') {
      // Block download for restricted templates - user must upgrade
      if (!hasAccess) {
        return forbiddenResponse('Upgrade required to download this template. Please upgrade your plan.');
      }

      // Check export limits
      if (!limits.canExport) {
        return forbiddenResponse('Export limit reached. Please upgrade your plan to download more resumes.');
      }

      // Increment export count for downloads
      await prisma.subscription.update({
        where: { id: limits.subscription.id },
        data: { exportCount: { increment: 1 } }
      });
    }

    // Validate and sanitize resume data structure
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

    // Sanitize and normalize personal info fields
    resumeData.personal = {
      ...resumeData.personal,
      fullName: sanitizeStringField(resumeData.personal.fullName),
      email: sanitizeStringField(resumeData.personal.email),
      phone: normalizePhoneNumber(resumeData.personal.phone), // Normalize Arabic-Indic numerals
      location: sanitizeStringField(resumeData.personal.location),
      linkedin: sanitizeStringField(resumeData.personal.linkedin),
      website: sanitizeStringField(resumeData.personal.website),
      title: sanitizeStringField(resumeData.personal.title),
      profileImage: sanitizeStringField(resumeData.personal.profileImage),
      dateOfBirth: sanitizeStringField(resumeData.personal.dateOfBirth),
      gender: sanitizeStringField(resumeData.personal.gender),
      nationality: sanitizeStringField(resumeData.personal.nationality),
      maritalStatus: sanitizeStringField(resumeData.personal.maritalStatus),
      country: sanitizeStringField(resumeData.personal.country),
    };

    // Sanitize summary
    resumeData.summary = sanitizeStringField(resumeData.summary);

    // Initialize fonts for Unicode support (Kurdish Sorani, Arabic, English)
    initializePDFFonts();
    
    // Log font registration status for debugging
    const fontsRegistered = areFontsRegistered();
    if (!fontsRegistered) {
      console.warn('Fonts not registered - PDF generation may fail for Kurdish/Arabic text');
    }

    // Generate PDF with detailed error handling for each step
    try {
      // Generate PDF — watermark is baked into the React-PDF render tree when shouldWatermark is true
      const templateComponent = await getTemplate(template, resumeData, shouldWatermark || undefined);

      if (!templateComponent) {
        console.error('Template component not found for template:', template);
        return notFoundResponse('Template not found');
      }

      const pdfDoc = pdf(React.createElement(templateComponent.type, templateComponent.props));
      const blob = await pdfDoc.toBlob();
      buffer = await blob.arrayBuffer();
    } catch (pdfError) {
      console.error('Error during PDF generation step:', pdfError);
      const pdfErrorMessage = pdfError instanceof Error ? pdfError.message : 'Unknown PDF generation error';
      const pdfErrorStack = pdfError instanceof Error ? pdfError.stack : undefined;
      console.error('PDF generation error message:', pdfErrorMessage);
      if (pdfErrorStack) {
        console.error('PDF generation error stack:', pdfErrorStack);
      }
      throw pdfError; // Re-throw to be caught by outer try-catch
    }
    
    // Count pages server-side using pdf-lib
    const pdfBuffer = Buffer.from(buffer);
    let totalPages = 1;
    try {
      const pdfDoc = await PDFDocument.load(pdfBuffer);
      totalPages = pdfDoc.getPageCount();
    } catch (pageCountError) {
      console.warn('Failed to count PDF pages:', pageCountError);
    }

    // Return raw PDF binary with metadata in headers
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': action === 'download' ? `attachment; filename="resume.pdf"` : 'inline',
        'X-Has-Access': String(hasAccess),
        'X-Template': template,
        'X-Watermarked': String(shouldWatermark),
        'X-Total-Pages': String(totalPages),
        'Content-Length': String(pdfBuffer.length),
      },
    });
  } catch (error) {
    console.error('PDF generation error (top level):', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    const errorName = error instanceof Error ? error.name : 'Error';
    
    // Log detailed error information
    console.error('Error details:', {
      name: errorName,
      message: errorMessage,
      hasStack: !!errorStack,
    });
    
    // Log additional context for font-related errors
    if (errorMessage.includes('font') || errorMessage.includes('Font') || errorName.includes('Font')) {
      console.error('Font-related error detected. Font registration status:', areFontsRegistered());
    }
    
    // Log full error stack
    if (errorStack) {
      console.error('Full error stack:', errorStack);
    }
    
    // Log error as string for additional context
    console.error('Error string representation:', String(error));
    
    return errorResponse(`Failed to generate PDF: ${errorMessage}`, 500);
  }
}

