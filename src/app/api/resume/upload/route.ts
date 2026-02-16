import { NextRequest } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { ResumeParser } from '@/lib/resume-parser'
import { ResumeData } from '@/types/resume'
import { checkUserLimits } from '@/lib/db'
import { prisma } from '@/lib/prisma'
import OpenAI from 'openai'
import { AIExtractedData } from '@/types/api'
import { successResponse, errorResponse, authErrorResponse, forbiddenResponse, notFoundResponse, validationErrorResponse } from '@/lib/api-helpers'
import { sanitizeHtml } from '@/lib/sanitize'
import { devError } from '@/lib/admin-utils'

// Validate critical env var at module load — fail fast instead of silent degradation
if (!process.env.OPENROUTER_API_KEY) {
  devError('[ResumeUpload] OPENROUTER_API_KEY is not set — CV import will fail')
}

// Initialize OpenRouter client
const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY || '',
  defaultHeaders: {
    'HTTP-Referer': 'https://resumeai.app',
    'X-Title': 'ResumeAI'}})

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth()
    
    if (!userId) {
      return authErrorResponse()
    }

    // Check import limits (PRO feature)
    const limits = await checkUserLimits(userId)
    
    if (!limits.canImport) {
      return forbiddenResponse('You have reached your import limit. Please upgrade your plan to import more resumes.')
    }

    if (!limits.subscription) {
      return notFoundResponse('User subscription not found.')
    }

    // Get form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return validationErrorResponse('No file provided')
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword'
    ]
    
    if (!allowedTypes.includes(file.type)) {
      return validationErrorResponse('Invalid file type. Please upload a PDF or DOCX file.')
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    
    if (file.size > maxSize) {
      return validationErrorResponse('File too large. Maximum size is 5MB.')
    }

    // Minimum file size check — reject empty/corrupt files
    const minSize = 100 // 100 bytes
    if (file.size < minSize) {
      return validationErrorResponse('File appears to be empty or corrupt. Please upload a valid file.')
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Helper function to convert various date formats to YYYY-MM
    const convertDateFormat = (date: string): string => {
      if (!date || date.trim() === '') return ''
      date = date.trim()
      if (date.toLowerCase().includes('present') || date.toLowerCase().includes('current')) return ''
      if (date.match(/^\d{1,2}\/\d{4}$/)) { const [month, year] = date.split('/'); return `${year}-${month.padStart(2, '0')}` }
      if (date.match(/^\d{4}-\d{2}$/)) return date
      const monthYearMatch = date.match(/^(\w+)\s+(\d{4})$/)
      if (monthYearMatch) {
        const monthNames: Record<string, string> = { 'january': '01', 'jan': '01', 'february': '02', 'feb': '02', 'march': '03', 'mar': '03', 'april': '04', 'apr': '04', 'may': '05', 'june': '06', 'jun': '06', 'july': '07', 'jul': '07', 'august': '08', 'aug': '08', 'september': '09', 'sep': '09', 'sept': '09', 'october': '10', 'oct': '10', 'november': '11', 'nov': '11', 'december': '12', 'dec': '12' }
        const monthNum = monthNames[monthYearMatch[1].toLowerCase()]
        if (monthNum) return `${monthYearMatch[2]}-${monthNum}`
      }
      if (date.match(/^\d{1,2}-\d{4}$/)) { const [month, year] = date.split('-'); return `${year}-${month.padStart(2, '0')}` }
      if (date.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) { const parts = date.split('/'); return `${parts[2]}-${parts[1].padStart(2, '0')}` }
      if (date.match(/^\d{4}$/)) return `${date}-01`
      return ''
    }

    // For PDF files, send directly to AI. For DOCX, extract text first
    if (file.type === 'application/pdf') {
      try {
        // Convert PDF to base64 according to OpenRouter documentation
        const base64Pdf = buffer.toString('base64')
        const dataUrl = `data:application/pdf;base64,${base64Pdf}`

        // Single API call approach - extract structured data directly
        // Custom message format for OpenRouter's file handling
        const messages = [
          {
            role: 'system',
            content: `You are a resume data extractor. Your ONLY job is to read the PDF document provided and extract the REAL information from it.

CRITICAL INSTRUCTIONS:
- You MUST read and use ONLY the information from the PDF file provided
- Do NOT generate any fictional, example, or placeholder data
- If information is not found in the PDF, use empty strings or empty arrays
- Return ONLY valid JSON with no explanations or markdown
- The PDF contains a real person's resume - extract their actual details
- For dates, extract them exactly as they appear in the PDF (e.g., "01/2020", "January 2020", "2020", etc.)
- If end date is current/present, use "Present" as the value
- For languages, extract BOTH the language name AND proficiency level if mentioned (Basic, Conversational, Fluent, Professional, Native)
- If no proficiency level is mentioned, use "Conversational" as default instead of leaving empty`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Extract the ACTUAL information from the attached PDF resume and format it as JSON:

{
  "personal": {
    "fullName": "",
    "email": "", 
    "phone": "",
    "location": "",
    "linkedin": "",
    "website": "",
    "title": ""
  },
  "summary": "",
  "experience": [
    {
      "title": "Job Title",
      "company": "Company Name",
      "location": "City, State",
      "startDate": "01/2020",
      "endDate": "12/2023 or Present",
      "description": "Job responsibilities and achievements"
    }
  ],
  "education": [
    {
      "degree": "Degree Name",
      "field": "Field of Study",
      "school": "University Name",
      "location": "City, State",
      "startDate": "09/2016",
      "endDate": "05/2020",
      "gpa": "3.5",
      "achievements": "Honors, awards, etc."
    }
  ],
  "skills": [],
  "languages": [
    {
      "name": "Language Name",
      "proficiency": "Basic|Conversational|Fluent|Professional|Native"
    }
  ],
  "projects": [
    {
      "name": "Project Name",
      "description": "Project description",
      "technologies": "Tech stack used",
      "link": "Project URL",
      "startDate": "01/2020",
      "endDate": "12/2020"
    }
  ],
  "certifications": [
    {
      "name": "Certification Name",
      "issuer": "Issuing Organization",
      "date": "01/2020",
      "expiryDate": "01/2023",
      "credentialId": "ID123",
      "url": "Certificate URL"
    }
  ]
}

CRITICAL: Use the real person's name, email, phone, and details from the PDF. Do not use fake names like "John Doe" or "Ahmed Al-Ali".`
              },
              {
                type: 'file',
                file: {
                  filename: 'resume.pdf',
                  file_data: dataUrl
                }
              }
            ]
          }
        ]

        const completion = await openai.chat.completions.create({
          model: 'google/gemini-3-flash-preview',
          messages: messages as OpenAI.Chat.Completions.ChatCompletionMessageParam[],
          max_tokens: 2000,
          temperature: 0.0 // Zero temperature for exact extraction
        })

        const aiText = completion.choices[0]?.message?.content?.trim() || ''
        
        // Clean the response to ensure valid JSON
        let cleanedText = aiText
        cleanedText = cleanedText.replace(/```json\s*/g, '').replace(/```\s*/g, '')
        
        const firstBrace = cleanedText.indexOf('{')
        if (firstBrace > 0) {
          cleanedText = cleanedText.substring(firstBrace)
        }
        
        const lastBrace = cleanedText.lastIndexOf('}')
        if (lastBrace > -1 && lastBrace < cleanedText.length - 1) {
          cleanedText = cleanedText.substring(0, lastBrace + 1)
        }
        
        // Parse the JSON
        const aiData = JSON.parse(cleanedText) as AIExtractedData

        // Transform the data to match our ResumeData interface
        const transformedData: ResumeData = {
          personal: {
            fullName: aiData.personal?.fullName || '',
            email: aiData.personal?.email || '',
            phone: aiData.personal?.phone || '',
            location: aiData.personal?.location || '',
            linkedin: aiData.personal?.linkedin || '',
            website: aiData.personal?.website || '',
            title: aiData.personal?.title || ''},
          summary: aiData.summary || '',
          experience: (aiData.experience || []).map((exp, index: number) => ({
            id: exp.id || `exp_${index + 1}`,
            jobTitle: exp.title || exp.jobTitle || '',
            company: exp.company || '',
            location: exp.location || '',
            startDate: convertDateFormat(exp.startDate || ''),
            endDate: exp.endDate?.toLowerCase().includes('present') ? '' : convertDateFormat(exp.endDate || ''),
            current: exp.endDate?.toLowerCase().includes('present') || exp.current || false,
            description: sanitizeHtml(Array.isArray(exp.description) ? exp.description.join('\n• ') : (exp.description || ''))})),
          education: (aiData.education || []).map((edu, index: number) => ({
            id: edu.id || `edu_${index + 1}`,
            degree: edu.degree || '',
            field: edu.field || edu.major || '',
            school: edu.school || edu.university || '',
            location: edu.location || '',
            startDate: convertDateFormat(edu.startDate || ''),
            endDate: convertDateFormat(edu.endDate || edu.graduationDate || ''),
            gpa: edu.gpa || '',
            achievements: sanitizeHtml(edu.achievements || '')})),
          skills: (aiData.skills || []).map((skill, index: number) => ({
            id: typeof skill === 'object' && skill.id ? skill.id : `skill_${index + 1}`,
            name: typeof skill === 'string' ? skill : (skill.name || ''),
            level: typeof skill === 'object' ? (skill.level || '') : ''})),
          languages: (aiData.languages || []).map((lang, index: number) => {
            if (typeof lang === 'string') {
              // If language is a string, create object with name and default proficiency
              return {
                id: `lang_${index + 1}`,
                name: lang,
                proficiency: 'Conversational', // Default proficiency for simple string languages
              }
            } else {
              // If language is already an object
              return {
                id: lang.id || `lang_${index + 1}`,
                name: lang.name || '',
                proficiency: lang.proficiency || 'Conversational'}
            }
          }),
          projects: (aiData.projects || []).map((proj, index: number) => ({
            id: proj.id || `proj_${index + 1}`,
            name: proj.name || '',
            description: sanitizeHtml(proj.description || ''),
            technologies: proj.technologies || '',
            link: proj.link || '',
            startDate: proj.startDate || '',
            endDate: proj.endDate || ''})),
          certifications: (aiData.certifications || []).map((cert, index: number) => ({
            id: cert.id || `cert_${index + 1}`,
            name: cert.name || '',
            issuer: cert.issuer || '',
            date: cert.date || '',
            expiryDate: cert.expiryDate || '',
            credentialId: cert.credentialId || '',
            url: cert.url || ''}))}

        // Update import count — use atomic updateMany to prevent race conditions
        const updateResult = await prisma.subscription.updateMany({
          where: { id: limits.subscription.id, importCount: { lt: limits.importLimit === -1 ? 999999 : limits.importLimit } },
          data: { importCount: { increment: 1 } }
        })
        if (updateResult.count === 0 && limits.importLimit !== -1) {
          return forbiddenResponse('Import limit reached')
        }
        return successResponse({
          success: true,
          data: transformedData,
          extractedText: 'PDF processed with single API call'
        })

      } catch (error) {
        devError('[ResumeUpload] PDF processing failed:', error)
        return validationErrorResponse('Failed to process PDF. Please try again or convert to DOCX format.')
      }
    } else {
      // For DOCX files, extract text first then send to AI
      try {
        const extractedText = await ResumeParser.extractText(buffer, file.type)
        
        if (!extractedText || extractedText.trim().length === 0) {
          return validationErrorResponse('Could not extract text from the file. Please ensure the file contains readable text.')
        }

        // Get basic extraction as fallback
        const basicData = ResumeParser.basicExtraction(extractedText)

        // Use AI to extract structured data
        const messages = [
          {
            role: 'system' as const,
            content: 'You are a resume parser that extracts structured data from resume text. You must return ONLY valid JSON with no additional text, markdown, or formatting.'
          },
          {
            role: 'user' as const,
            content: `Extract information from this resume text and return ONLY a JSON object with the same structure as specified for PDF processing.

Resume Text:
${extractedText}

Return valid JSON only, no explanations.`
          }
        ]

        const completion = await openai.chat.completions.create({
          model: 'google/gemini-3-flash-preview',
          messages,
          max_tokens: 2000,
          temperature: 0.3})

        const aiText = completion.choices[0]?.message?.content?.trim() || ''
        
        // Clean and parse JSON
        let cleanedText = aiText
        cleanedText = cleanedText.replace(/```json\s*/g, '').replace(/```\s*/g, '')
        
        const firstBrace = cleanedText.indexOf('{')
        if (firstBrace > 0) {
          cleanedText = cleanedText.substring(firstBrace)
        }
        
        const lastBrace = cleanedText.lastIndexOf('}')
        if (lastBrace > -1 && lastBrace < cleanedText.length - 1) {
          cleanedText = cleanedText.substring(0, lastBrace + 1)
        }

        const aiData = JSON.parse(cleanedText) as AIExtractedData

        // Merge AI data with basic extraction and apply transformations
        const mergedData: ResumeData = {
          personal: {
            fullName: '',
            email: '',
            phone: '',
            location: '',
            linkedin: '',
            website: '',
            ...basicData.personal,
            ...aiData.personal},
          summary: aiData.summary || basicData.summary || '',
          experience: (aiData.experience || []).map((exp, index: number) => ({
            id: exp.id || `exp_${index + 1}`,
            jobTitle: exp.jobTitle || exp.title || '',
            company: exp.company || '',
            location: exp.location || '',
            startDate: convertDateFormat(exp.startDate || ''),
            endDate: exp.endDate?.toLowerCase().includes('present') ? '' : convertDateFormat(exp.endDate || ''),
            current: exp.endDate?.toLowerCase().includes('present') || exp.current || false,
            description: sanitizeHtml(Array.isArray(exp.description) ? exp.description.join('\n') : (exp.description || ''))})),
          education: (aiData.education || []).map((edu, index: number) => ({
            id: edu.id || `edu_${index + 1}`,
            degree: edu.degree || '',
            field: edu.field || edu.major || '',
            school: edu.school || edu.university || '',
            location: edu.location || '',
            startDate: convertDateFormat(edu.startDate || ''),
            endDate: convertDateFormat(edu.endDate || edu.graduationDate || ''),
            gpa: edu.gpa || '',
            achievements: sanitizeHtml(edu.achievements || '')})),
          skills: (aiData.skills || []).map((skill, index: number) => ({
            id: typeof skill === 'object' && skill.id ? skill.id : `skill_${index + 1}`,
            name: typeof skill === 'string' ? skill : (skill.name || ''),
            level: typeof skill === 'object' ? (skill.level || '') : ''})),
          languages: (aiData.languages || []).map((lang, index: number) => {
            if (typeof lang === 'string') {
              // If language is a string, create object with name and default proficiency
              return {
                id: `lang_${index + 1}`,
                name: lang,
                proficiency: 'Conversational', // Default proficiency for simple string languages
              }
            } else {
              // If language is already an object
              return {
                id: lang.id || `lang_${index + 1}`,
                name: lang.name || '',
                proficiency: lang.proficiency || 'Conversational'}
            }
          }),
          projects: (aiData.projects || []).map((proj, index: number) => ({
            id: proj.id || `proj_${index + 1}`,
            name: proj.name || '',
            description: sanitizeHtml(proj.description || ''),
            technologies: proj.technologies || '',
            link: proj.link || '',
            startDate: proj.startDate || '',
            endDate: proj.endDate || ''})),
          certifications: (aiData.certifications || []).map((cert, index: number) => ({
            id: cert.id || `cert_${index + 1}`,
            name: cert.name || '',
            issuer: cert.issuer || '',
            date: cert.date || '',
            expiryDate: cert.expiryDate || '',
            credentialId: cert.credentialId || '',
            url: cert.url || ''}))}

        // Update import count — use atomic updateMany to prevent race conditions
        const updateResult2 = await prisma.subscription.updateMany({
          where: { id: limits.subscription.id, importCount: { lt: limits.importLimit === -1 ? 999999 : limits.importLimit } },
          data: { importCount: { increment: 1 } }
        })
        if (updateResult2.count === 0 && limits.importLimit !== -1) {
          return forbiddenResponse('Import limit reached')
        }

        return successResponse({
          success: true,
          data: mergedData,
          extractedText: extractedText.slice(0, 500)})

      } catch (error) {
        devError('[ResumeUpload] AI extraction failed, falling back to basic:', error);
        // Return basic extraction if AI fails
        const basicData = ResumeParser.basicExtraction(await ResumeParser.extractText(buffer, file.type))
        
        // Update import count even for basic extraction — use subscription ID, not userId
        await prisma.subscription.updateMany({
          where: { id: limits.subscription.id, importCount: { lt: limits.importLimit === -1 ? 999999 : limits.importLimit } },
          data: { importCount: { increment: 1 } }
        })
        
        return successResponse({
          success: true,
          data: basicData as ResumeData,
          extractedText: (await ResumeParser.extractText(buffer, file.type)).slice(0, 500),
          warning: 'AI extraction failed. Showing basic extraction results.'})
      }
    }

  } catch (error) {
    devError('[ResumeUpload] Failed to process resume:', error);
    return errorResponse('Failed to process resume. Please try again.', 500)
  }
}