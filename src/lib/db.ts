import { auth } from '@clerk/nextjs/server'
import { prisma } from './prisma'
import type { InputJsonValue } from '@prisma/client/runtime/library'

export async function getCurrentUser() {
  const { userId } = await auth()
  
  if (!userId) {
    return null
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: {
      subscription: true}})

  return user
}

// Light version for dashboard listing (faster)
export async function getUserResumes(userId: string, options?: { limit?: number; offset?: number }) {
  const { limit, offset } = options || {}
  
  const resumes = await prisma.resume.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      title: true,
      createdAt: true,
      updatedAt: true,
      personalInfo: true,
      template: true,
    },
    ...(limit && { take: limit }),
    ...(offset && { skip: offset }),
  })

  return resumes
}

// Full version with sections for editing
export async function getUserResumesWithSections(userId: string) {
  const resumes = await prisma.resume.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
    include: {
      sections: {
        orderBy: { order: 'asc' }
      }
    },
  })

  return resumes
}

export async function getResumeById(resumeId: string, userId: string) {
  const resume = await prisma.resume.findFirst({
    where: {
      id: resumeId,
      userId},
    include: {
      sections: {
        orderBy: { order: 'asc' }}}})

  return resume
}

export async function createResume(userId: string, title: string, template?: string) {
  const resume = await prisma.resume.create({
    data: {
      userId,
      title,
      template: template || 'modern',
      sections: {
        create: [
          {
            type: 'WORK_EXPERIENCE',
            title: 'Work Experience',
            content: {},
            order: 1},
          {
            type: 'EDUCATION',
            title: 'Education',
            content: {},
            order: 2},
          {
            type: 'SKILLS',
            title: 'Skills',
            content: {},
            order: 3},
        ]}},
    include: {
      sections: true}})

  // Update user's resume count
  await prisma.subscription.update({
    where: { userId },
    data: { resumeCount: { increment: 1 } }})

  return resume
}

export async function deleteResume(resumeId: string, userId: string) {
  const resume = await prisma.resume.deleteMany({
    where: {
      id: resumeId,
      userId}})

  // Update user's resume count
  await prisma.subscription.update({
    where: { userId },
    data: { resumeCount: { decrement: 1 } }})

  return resume
}

interface ResumeUpdateData {
  title?: string
  personalInfo?: InputJsonValue
  summary?: string
  template?: string
  userId?: string
}

export async function updateResume(
  resumeId: string,
  userId: string,
  data: ResumeUpdateData
) {
  // Remove userId from data to avoid conflicts with where clause
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { userId: _, ...updateData } = data
  
  // Cast personalInfo to proper JSON type for Prisma
  const prismaUpdateData = {
    ...updateData,
    personalInfo: updateData.personalInfo ? updateData.personalInfo as InputJsonValue : undefined
  }
  
  const resume = await prisma.resume.update({
    where: {
      id: resumeId,
      userId},
    data: prismaUpdateData})

  return resume
}

export async function getUserSubscription(userId: string) {
  const subscription = await prisma.subscription.findUnique({
    where: { userId }})

  return subscription
}

async function getSystemSettings() {
  try {
    const settings = await prisma.systemSettings.findFirst({
      orderBy: { id: 'asc' },
      select: {
        maxFreeResumes: true,
        maxFreeAIUsage: true,
        maxFreeExports: true,
        maxFreeImports: true,
        maxFreeATSChecks: true,
        maxBasicResumes: true,
        maxBasicAIUsage: true,
        maxBasicExports: true,
        maxBasicImports: true,
        maxBasicATSChecks: true,
        maxProResumes: true,
        maxProAIUsage: true,
        maxProExports: true,
        maxProImports: true,
        maxProATSChecks: true,
        freeTemplates: true,
        basicTemplates: true,
        proTemplates: true,
        photoUploadPlans: true,
      }
    })

    if (settings) {
      // Helper to parse JSON strings or use array directly
      const parseJsonArray = (value: unknown, fallback: string[]): string[] => {
        if (Array.isArray(value)) return value as string[]
        if (typeof value === 'string') {
          try { return JSON.parse(value) as string[] } catch { return fallback }
        }
        return fallback
      }

      return {
        ...settings,
        freeTemplates: parseJsonArray(settings.freeTemplates, ['modern']),
        basicTemplates: parseJsonArray(settings.basicTemplates, ['modern', 'creative']),
        proTemplates: parseJsonArray(settings.proTemplates, ['modern', 'creative', 'executive', 'elegant', 'minimalist', 'creative-artistic', 'developer']),
        photoUploadPlans: parseJsonArray(settings.photoUploadPlans, ['BASIC', 'PRO']),
      }
    }
  } catch (error) {
    console.error('[DB] Failed to get system settings:', error);
    // Table might not exist, use defaults
  }
  
  return {
    // Free Plan Limits - Restrictive defaults to encourage upgrades
    maxFreeResumes: 1,
    maxFreeAIUsage: 10,
    maxFreeExports: 0,
    maxFreeImports: 0,
    maxFreeATSChecks: 0,
    
    // Basic Plan Limits
    maxBasicResumes: 5,
    maxBasicAIUsage: 100,
    maxBasicExports: 10,
    maxBasicImports: 0,
    maxBasicATSChecks: 5,
    
    // Pro Plan Limits
    maxProResumes: -1,
    maxProAIUsage: -1,
    maxProExports: -1,
    maxProImports: -1,
    maxProATSChecks: -1,
    
    // Template Access Control
    freeTemplates: ['modern'],
    basicTemplates: ['modern', 'creative'],
    proTemplates: ['modern', 'creative', 'executive', 'elegant', 'minimalist', 'creative-artistic', 'developer'],
    
    // Profile Photo Upload Access Control
    photoUploadPlans: ['BASIC', 'PRO']
  }
}

export async function checkUserLimits(clerkUserId: string) {
  // First get the database user from Clerk ID
  const user = await prisma.user.findUnique({
    where: { clerkId: clerkUserId },
    include: { subscription: true }
  })
  
  if (!user || !user.subscription) {
    return { canCreateResume: false, canUseAI: false, canExport: false, canImport: false }
  }
  
  const subscription = user.subscription

  // Get admin-configurable settings
  const systemSettings = await getSystemSettings()

  const limits = {
    FREE: { 
      resumes: systemSettings.maxFreeResumes ?? 10, 
      ai: systemSettings.maxFreeAIUsage ?? 100, 
      exports: systemSettings.maxFreeExports ?? 0,
      imports: systemSettings.maxFreeImports ?? 1,
      atsChecks: systemSettings.maxFreeATSChecks ?? 0
    },
    BASIC: { 
      resumes: systemSettings.maxBasicResumes ?? 50, 
      ai: systemSettings.maxBasicAIUsage ?? 500, 
      exports: systemSettings.maxBasicExports ?? 100,
      imports: systemSettings.maxBasicImports ?? 5,
      atsChecks: systemSettings.maxBasicATSChecks ?? 5
    },
    PRO: { 
      resumes: systemSettings.maxProResumes ?? -1, 
      ai: systemSettings.maxProAIUsage ?? -1, 
      exports: systemSettings.maxProExports ?? -1,
      imports: systemSettings.maxProImports ?? -1,
      atsChecks: systemSettings.maxProATSChecks ?? -1
    }, // -1 means unlimited
  }

  const userLimits = limits[subscription.plan]


  // Check photo upload permission
  const photoUploadPlans = Array.isArray(systemSettings.photoUploadPlans) 
    ? systemSettings.photoUploadPlans 
    : ['BASIC', 'PRO']
  const canUploadPhoto = photoUploadPlans.includes(subscription.plan)
  
  // Get available templates for user's plan
  // systemSettings already has parsed arrays from getSystemSettings()
  let availableTemplates: string[] = ['placeholder']
  switch (subscription.plan) {
    case 'FREE':
      availableTemplates = [...new Set(['placeholder', ...systemSettings.freeTemplates])]
      break
    case 'BASIC':
      availableTemplates = [...new Set(['placeholder', ...systemSettings.basicTemplates])]
      break
    case 'PRO':
      availableTemplates = [...new Set(['placeholder', ...systemSettings.proTemplates])]
      break
  }

  return {
    canCreateResume: userLimits.resumes === -1 || subscription.resumeCount < userLimits.resumes,
    canUseAI: userLimits.ai === -1 || subscription.aiUsageCount < userLimits.ai,
    canExport: userLimits.exports === -1 || (subscription.exportCount || 0) < userLimits.exports,
    canImport: userLimits.imports === -1 || (subscription.importCount || 0) < userLimits.imports,
    canUseATS: userLimits.atsChecks === -1 || (subscription.atsUsageCount || 0) < userLimits.atsChecks,
    canUploadPhoto,
    availableTemplates,
    subscription,
    atsLimit: userLimits.atsChecks,
    atsUsed: subscription.atsUsageCount || 0
  }
}