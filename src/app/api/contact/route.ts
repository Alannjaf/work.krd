import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { rateLimit, rateLimitResponse } from '@/lib/rate-limit'

// Lazy initialization to avoid build-time errors when API key is not set
const getResend = () => new Resend(process.env.RESEND_API_KEY)

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
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      )
    }

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
                <td style="padding: 8px 0;">${firstName} ${lastName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Email:</td>
                <td style="padding: 8px 0;">${email}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Subject:</td>
                <td style="padding: 8px 0;">${subject}</td>
              </tr>
            </table>
          </div>
          
          <div style="margin: 20px 0;">
            <h3 style="color: #374151; margin-bottom: 10px;">Message:</h3>
            <div style="background: white; padding: 15px; border: 1px solid #e5e7eb; border-radius: 6px;">
              ${message.replace(/\n/g, '<br>')}
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
      subject: `Contact Form: ${subject}`,
      html: emailContent,
      text: textContent, // Added plain text version
      replyTo: email})


    return NextResponse.json(
      { message: 'Message sent successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('[Contact] Failed to send contact email:', error);
    return NextResponse.json(
      { error: 'Failed to send message. Please try again.' },
      { status: 500 }
    )
  }
}