// API types for TypeScript interfaces
import { WorkExperience, Education, Project, Certification, PersonalInfo } from './resume'

// Database types
export interface DatabaseSection {
  type: string
  content: unknown
  order: number
}

export interface DatabaseUser {
  id: string
  clerkId: string
  email: string
  name?: string | null
  role?: string | null
  createdAt: Date
}

export interface DatabaseResume {
  id: string
  summary?: string | null
  personalInfo?: string | PersonalInfo | null
  sections: DatabaseSection[]
  user: DatabaseUser
}

export interface DatabaseSubscription {
  id: string
  userId: string
  plan: string
  status: string
  resumeCount: number
  aiUsageCount: number
  exportCount: number
  importCount: number
  atsUsageCount: number
}

export interface UserWithSubscription extends DatabaseUser {
  subscription?: {
    plan: string
    status: string
    resumeCount: number
    aiUsageCount: number
    exportCount: number
    importCount: number
    atsUsageCount: number
  } | null
  _count?: {
    resumes: number
  }
}

// AI parsing types
export interface AIExperienceData extends Omit<Partial<WorkExperience>, 'description'> {
  title?: string
  jobTitle?: string
  description?: string | string[]
  [key: string]: unknown
}

export interface AIEducationData extends Partial<Education> {
  major?: string
  university?: string
  graduationDate?: string
  [key: string]: unknown
}

export interface AISkillData {
  id?: string
  name?: string
  level?: string
  [key: string]: unknown
}

export interface AILanguageData {
  id?: string
  name?: string
  proficiency?: string
  [key: string]: unknown
}

export interface AIProjectData extends Partial<Project> {
  [key: string]: unknown
}

export interface AICertificationData extends Partial<Certification> {
  [key: string]: unknown
}

export interface AIExtractedData {
  personal?: Partial<PersonalInfo>
  summary?: string
  experience?: AIExperienceData[]
  education?: AIEducationData[]
  skills?: Array<string | AISkillData>
  languages?: Array<string | AILanguageData>
  projects?: AIProjectData[]
  certifications?: AICertificationData[]
}

export interface DatabaseQueryResult {
  role?: string
}

// System settings type
export interface SystemSettings {
  maxFreeResumes: number
  maxFreeAIUsage: number
  maxFreeExports: number
  maxFreeImports: number
  maxFreeATSChecks: number
  maxProResumes: number
  maxProAIUsage: number
  maxProExports: number
  maxProImports: number
  maxProATSChecks: number
  proPlanPrice?: number
}