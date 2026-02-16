import { NextRequest, NextResponse } from 'next/server';
import React from 'react';
import { requireAdminWithId } from '@/lib/admin';
import { errorResponse, validationErrorResponse } from '@/lib/api-helpers';
import { getHtmlTemplate, templateRegistry } from '@/components/html-templates/registry';
import { renderResumeToHtml } from '@/lib/pdf/renderHtml';
import { generatePdfFromHtml } from '@/lib/pdf/generatePdf';
import { isResumeRTL } from '@/lib/rtl';
import { validateCsrfToken, getCsrfTokenFromRequest } from '@/lib/csrf';
import { rateLimit, rateLimitResponse } from '@/lib/rate-limit';

/**
 * Strip <script> tags and on* event handler attributes from HTML strings
 * to prevent code execution during Puppeteer PDF rendering.
 */
function sanitizeHtml(value: string): string {
  return value
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/\bon\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '');
}

/**
 * Recursively sanitize all string values in an object to remove
 * script tags and event handlers that could execute in Puppeteer.
 */
function sanitizeResumeData(obj: unknown): unknown {
  if (typeof obj === 'string') {
    return sanitizeHtml(obj);
  }
  if (Array.isArray(obj)) {
    return obj.map(sanitizeResumeData);
  }
  if (obj && typeof obj === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = sanitizeResumeData(value);
    }
    return result;
  }
  return obj;
}

export async function POST(request: NextRequest) {
  try {
    const adminId = await requireAdminWithId();

    // Validate CSRF token
    const csrfToken = getCsrfTokenFromRequest(request);
    if (!validateCsrfToken(adminId, csrfToken)) {
      return errorResponse('Invalid or expired CSRF token', 403);
    }

    const { success, resetIn } = rateLimit(request, { maxRequests: 20, windowSeconds: 60, identifier: 'admin-preview-pdf' });
    if (!success) return rateLimitResponse(resetIn);

    let body: { resumeData?: unknown; template?: string };
    try {
      body = await request.json();
    } catch {
      return validationErrorResponse('Invalid request body');
    }

    const { resumeData, template } = body;

    if (!resumeData || !template) {
      return validationErrorResponse('Missing required fields');
    }

    if (typeof resumeData !== 'object') {
      return validationErrorResponse('Invalid resume data provided');
    }

    // Validate template ID against known templates to prevent injection
    if (typeof template !== 'string' || !templateRegistry[template]) {
      return validationErrorResponse('Invalid template ID');
    }

    // Sanitize all string fields in resume data to strip script tags and event handlers
    const sanitizedData = sanitizeResumeData(resumeData) as Record<string, unknown>;

    // Ensure personal info exists (required for PDF generation)
    if (!sanitizedData.personal) {
      sanitizedData.personal = {
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
    const Component = entry.component;
    const element = React.createElement(Component, { data: sanitizedData });
    const isRTL = isResumeRTL(sanitizedData);
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
    if (error instanceof Error && error.message.includes('Admin access required')) {
      return errorResponse('Unauthorized', 403);
    }
    console.error('Admin PDF generation error:', error);
    return errorResponse('Failed to generate preview PDF', 500);
  }
}
