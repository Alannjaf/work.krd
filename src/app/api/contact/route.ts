import { NextRequest } from 'next/server'
import { Resend } from 'resend'
import { rateLimit, rateLimitResponse } from '@/lib/rate-limit'
import { successResponse, errorResponse, validationErrorResponse } from '@/lib/api-helpers'
import { devError } from '@/lib/admin-utils'

// Lazy initialization to avoid build-time errors when API key is not set
const getResend = () => new Resend(process.env.RESEND_API_KEY)

/** Escape HTML special characters to prevent HTML injection in email templates */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export async function POST(request: NextRequest) {
  const { success, resetIn } = rateLimit(request, {
    maxRequests: 5,
    windowSeconds: 900,
    identifier: 'contact',
  });
  if (!success) return rateLimitResponse(resetIn);

  try {
    const body = await request.json()
    const { firstName, lastName, email, subject, message } = body

    // Validation
    if (!firstName || !lastName || !email || !subject || !message) {
      return validationErrorResponse('All fields are required')
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return validationErrorResponse('Please enter a valid email address')
    }

    // Length limits to prevent abuse
    if (firstName.length > 100 || lastName.length > 100 || subject.length > 200 || message.length > 5000 || email.length > 254) {
      return validationErrorResponse('Field length exceeds maximum allowed')
    }

    // Sanitize all user inputs before embedding in HTML
    const safeFirstName = escapeHtml(firstName)
    const safeLastName = escapeHtml(lastName)
    const safeEmail = escapeHtml(email)
    const safeSubject = escapeHtml(subject)
    const safeMessage = escapeHtml(message)

    // Send email using Resend
    const emailContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Contact Form Submission</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2563eb; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">
            Contact Form Submission from Work.krd
          </h2>

          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; width: 100px;">Name:</td>
                <td style="padding: 8px 0;">${safeFirstName} ${safeLastName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Email:</td>
                <td style="padding: 8px 0;">${safeEmail}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Subject:</td>
                <td style="padding: 8px 0;">${safeSubject}</td>
              </tr>
            </table>
          </div>

          <div style="margin: 20px 0;">
            <h3 style="color: #374151; margin-bottom: 10px;">Message:</h3>
            <div style="background: white; padding: 15px; border: 1px solid #e5e7eb; border-radius: 6px;">
              ${safeMessage.replace(/\n/g, '<br>')}
            </div>
          </div>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 14px;">
            This message was sent through the contact form on Work.krd
          </div>
        </div>
      </body>
      </html>
    `

    // Plain text version of the email
    const textContent = `
New Contact Form Submission

From: ${firstName} ${lastName}
Email: ${email}
Subject: ${subject}

Message:
${message}

---
Sent from Work.krd contact form
    `.trim()

    await getResend().emails.send({
      from: 'Work.krd Contact <contact@work.krd>', // Using verified domain
      to: ['info@work.krd'],
      subject: `Contact Form: ${safeSubject}`,
      html: emailContent,
      text: textContent, // Added plain text version
      // Reply-To omitted — user email is in the body. Using user-supplied email as
      // Reply-To enables email spoofing. Reply manually from info@work.krd.
    })


    return successResponse({ message: 'Message sent successfully' })
  } catch (error) {
    devError('[Contact] Failed to send contact email:', error);
    return errorResponse('Failed to send message. Please try again.', 500)
  }
}