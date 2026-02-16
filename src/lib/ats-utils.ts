import { z } from 'zod'

// --- Score color thresholds (Issue #18) ---
export const ATS_SCORE_THRESHOLDS = {
  GOOD: 80,
  MODERATE: 60,
} as const

// --- Shared stripHtml utility (Issue #20) ---
export function stripHtml(html?: string): string {
  if (!html) return ''
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\n\s*\n/g, '\n')
    .trim()
}

// --- Zod validation schemas (Issue #8) ---
const personalSchema = z.object({
  fullName: z.string().optional().default(''),
  email: z.string().optional().default(''),
  phone: z.string().optional().default(''),
  title: z.string().optional().default(''),
  location: z.string().optional().default(''),
  linkedin: z.string().optional().default(''),
  website: z.string().optional().default(''),
}).passthrough()

const experienceSchema = z.object({
  jobTitle: z.string().optional().default(''),
  company: z.string().optional().default(''),
  description: z.string().optional().default(''),
  startDate: z.string().optional().default(''),
  endDate: z.string().optional().default(''),
  current: z.boolean().optional().default(false),
}).passthrough()

const educationSchema = z.object({
  degree: z.string().optional().default(''),
  field: z.string().optional().default(''),
  school: z.string().optional().default(''),
  location: z.string().optional().default(''),
  startDate: z.string().optional().default(''),
  endDate: z.string().optional().default(''),
}).passthrough()

const skillSchema = z.object({
  name: z.string().optional().default(''),
}).passthrough()

const languageSchema = z.object({
  name: z.string().optional().default(''),
  proficiency: z.string().optional().default(''),
}).passthrough()

const projectSchema = z.object({
  name: z.string().optional().default(''),
  description: z.string().optional().default(''),
  technologies: z.string().optional().default(''),
}).passthrough()

const certificationSchema = z.object({
  name: z.string().optional().default(''),
  issuer: z.string().optional().default(''),
  date: z.string().optional().default(''),
  credentialId: z.string().optional().default(''),
}).passthrough()

export const resumeDataSchema = z.object({
  personal: personalSchema,
  summary: z.string().optional().default(''),
  experience: z.array(experienceSchema).optional().default([]),
  education: z.array(educationSchema).optional().default([]),
  skills: z.array(skillSchema).optional().default([]),
  languages: z.array(languageSchema).optional().default([]),
  projects: z.array(projectSchema).optional().default([]),
  certifications: z.array(certificationSchema).optional().default([]),
}).passthrough()

export type ValidatedResumeData = z.infer<typeof resumeDataSchema>

// --- Shared buildResumeText utility (Issue #6) ---
export function buildResumeText(resumeData: ValidatedResumeData): string {
  const formatDateRange = (
    startDate?: string,
    endDate?: string,
    current?: boolean
  ): string => {
    if (!startDate) return ''
    const start = startDate
    const end = current ? 'Present' : endDate || 'Present'
    return ` (${start} - ${end})`
  }

  const formatEducationDateRange = (
    startDate?: string,
    endDate?: string
  ): string => {
    if (!startDate && !endDate) return ''
    const start = startDate || 'Unknown'
    const end = endDate || 'Unknown'
    return ` (${start} - ${end})`
  }

  return `
Name: ${resumeData.personal?.fullName || 'Not provided'}
Email: ${resumeData.personal?.email || 'Not provided'}
Phone: ${resumeData.personal?.phone || 'Not provided'}
Job Title: ${resumeData.personal?.title || 'Not provided'}
${resumeData.personal?.location ? `Location: ${resumeData.personal.location}` : ''}
${resumeData.personal?.linkedin ? `LinkedIn: ${resumeData.personal.linkedin}` : ''}
${resumeData.personal?.website ? `Website: ${resumeData.personal.website}` : ''}

Summary: ${stripHtml(resumeData.summary) || 'Not provided'}

Experience:
${resumeData.experience?.length ? resumeData.experience.map((exp) => `- ${exp.jobTitle || 'No title'} at ${exp.company || 'No company'}${formatDateRange(exp.startDate, exp.endDate, exp.current)}: ${stripHtml(exp.description) || 'No description'}`).join('\n') : 'No experience listed'}

Education:
${resumeData.education?.length ? resumeData.education.map((edu) => `- ${edu.degree || 'No degree'}${edu.field ? ` in ${edu.field}` : ''} from ${edu.school || 'No institution'}${edu.location ? `, ${edu.location}` : ''}${formatEducationDateRange(edu.startDate, edu.endDate)}`).join('\n') : 'No education listed'}

Skills:
${
  resumeData.skills
    ?.map((skill) => skill.name)
    .filter(Boolean)
    .join(', ') || 'No skills listed'
}

Languages:
${resumeData.languages?.length ? resumeData.languages.map((lang) => `- ${lang.name || 'Unknown'}${lang.proficiency ? ` (${lang.proficiency})` : ''}`).join('\n') : 'No languages listed'}

Projects:
${resumeData.projects?.length ? resumeData.projects.map((proj) => `- ${proj.name || 'Unnamed project'}${proj.technologies ? ` - ${proj.technologies}` : ''}: ${stripHtml(proj.description) || 'No description'}`).join('\n') : 'No projects listed'}

Certifications:
${resumeData.certifications?.length ? resumeData.certifications.map((cert) => `- ${cert.name || 'Unnamed certification'} from ${cert.issuer || 'Unknown issuer'}${cert.date ? ` (${cert.date})` : ''}${cert.credentialId ? ` - ID: ${cert.credentialId}` : ''}`).join('\n') : 'No certifications listed'}
`
}

// --- AI config from env vars (Issue #9/7) ---
function clampNumber(value: number, fallback: number, min: number, max: number): number {
  if (isNaN(value) || value < min || value > max) return fallback
  return value
}

export const ATS_AI_CONFIG = {
  model: process.env.ATS_AI_MODEL || 'google/gemini-3-flash-preview',
  temperature: clampNumber(parseFloat(process.env.ATS_AI_TEMPERATURE || '0.3'), 0.3, 0, 2),
  scoreMaxTokens: clampNumber(parseInt(process.env.ATS_SCORE_MAX_TOKENS || '1500', 10), 1500, 50, 4000),
  keywordsMaxTokens: clampNumber(parseInt(process.env.ATS_KEYWORDS_MAX_TOKENS || '2000', 10), 2000, 50, 4000),
  timeoutMs: clampNumber(parseInt(process.env.ATS_AI_TIMEOUT_MS || '30000', 10), 30000, 1000, 120000),
} as const

// --- AI call timeout wrapper (Issue #11) ---
export function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`AI call timed out after ${ms}ms`)), ms)
    ),
  ])
}

// --- Request size limit (Issue #12) ---
export const MAX_REQUEST_SIZE = 1024 * 1024 // 1MB
