import { auth } from '@clerk/nextjs/server'
import { prisma } from './prisma'
import type { InputJsonValue } from '@prisma/client/runtime/library'
import { getTemplateIds } from './templates'
import { PLAN_NAMES } from './constants'
import { parseJsonArray } from './json-utils'
import { validateEnvVars } from './env-validation'

// Fail fast if required env vars are missing — runs once at module load
validateEnvVars()

export async function getCurrentUser() {
  const { userId } = await auth()
  
  if (!userId) {
    return null
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: {
      subscription: true}})

  // Fire-and-forget: update lastLoginAt for email campaign targeting
  if (user) {
    prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    }).catch(() => {})
  }

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

  // Update user's resume count (only decrement if > 0 to prevent negative counts)
  await prisma.subscription.updateMany({
    where: { userId, resumeCount: { gt: 0 } },
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

// Module-level cache for the private getSystemSettings() — avoids DB hit on every checkUserLimits() call
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _settingsCache: { data: any; ts: number } | null = null
const _SETTINGS_TTL = 30 * 1000 // 30 seconds

/**
 * Private — parses JSON arrays, used by checkUserLimits() for permission checks.
 * For admin API and general use, see the cached version in system-settings.ts.
 */
async function getSystemSettings() {
  if (_settingsCache && Date.now() - _settingsCache.ts < _SETTINGS_TTL) {
    return _settingsCache.data
  }

  try {
    const settings = await prisma.systemSettings.findFirst({
      orderBy: { id: 'asc' },
      select: {
        maxFreeResumes: true,
        maxFreeAIUsage: true,
        maxFreeExports: true,
        maxFreeImports: true,
        maxFreeATSChecks: true,
        maxProResumes: true,
        maxProAIUsage: true,
        maxProExports: true,
        maxProImports: true,
        maxProATSChecks: true,
        freeTemplates: true,
        proTemplates: true,
        photoUploadPlans: true,
      }
    })

    if (settings) {
      // Apply null-safe defaults so callers never see null for any field
      const result = {
        maxFreeResumes: settings.maxFreeResumes ?? 1,
        maxFreeAIUsage: settings.maxFreeAIUsage ?? 10,
        maxFreeExports: settings.maxFreeExports ?? 0,
        maxFreeImports: settings.maxFreeImports ?? 1,
        maxFreeATSChecks: settings.maxFreeATSChecks ?? 0,
        maxProResumes: settings.maxProResumes ?? -1,
        maxProAIUsage: settings.maxProAIUsage ?? -1,
        maxProExports: settings.maxProExports ?? -1,
        maxProImports: settings.maxProImports ?? -1,
        maxProATSChecks: settings.maxProATSChecks ?? -1,
        freeTemplates: parseJsonArray(settings.freeTemplates, ['modern']),
        proTemplates: parseJsonArray(settings.proTemplates, ['modern']),
        photoUploadPlans: parseJsonArray(settings.photoUploadPlans, [PLAN_NAMES.PRO]),
      }
      _settingsCache = { data: result, ts: Date.now() }
      return result
    }
  } catch (error) {
    console.error('[DB] Failed to get system settings:', error);
    // Table might not exist, use defaults
  }

  const defaults = {
    // Free Plan Limits - Restrictive defaults to encourage upgrades
    maxFreeResumes: 1,
    maxFreeAIUsage: 10,
    maxFreeExports: 0,
    maxFreeImports: 1,
    maxFreeATSChecks: 0,

    // Pro Plan Limits
    maxProResumes: -1,
    maxProAIUsage: -1,
    maxProExports: -1,
    maxProImports: -1,
    maxProATSChecks: -1,

    // Template Access Control
    freeTemplates: ['modern'],
    proTemplates: ['modern'],

    // Profile Photo Upload Access Control
    photoUploadPlans: [PLAN_NAMES.PRO]
  }
  // Don't cache defaults — retry DB on next call
  return defaults
}

export async function duplicateResume(resumeId: string, userId: string, clerkId: string) {
  // Check limits before starting (fast-fail for obvious cases)
  const limits = await checkUserLimits(clerkId)
  if (!limits.canCreateResume) {
    throw new Error('RESUME_LIMIT_REACHED')
  }

  // Fetch original resume with sections
  const original = await prisma.resume.findFirst({
    where: { id: resumeId, userId },
    include: { sections: { orderBy: { order: 'asc' } } }
  })

  if (!original) {
    throw new Error('RESUME_NOT_FOUND')
  }

  // Fall back template if user can't access the original's template
  const availableTemplates = limits.availableTemplates || ['modern']
  const template = availableTemplates.includes(original.template)
    ? original.template
    : 'modern'

  // Atomically create the copy and increment resume count
  // Use atomic updateMany to prevent race conditions on the limit check
  const resumeLimit = limits.resumeLimit ?? 1
  const newResume = await prisma.$transaction(async (tx) => {
    // Atomic limit check + increment: only succeeds if under limit
    if (resumeLimit !== -1) {
      const updated = await tx.subscription.updateMany({
        where: { userId, resumeCount: { lt: resumeLimit } },
        data: { resumeCount: { increment: 1 } },
      })
      if (updated.count === 0) {
        throw new Error('RESUME_LIMIT_REACHED')
      }
    } else {
      // Unlimited — just increment
      await tx.subscription.update({
        where: { userId },
        data: { resumeCount: { increment: 1 } },
      })
    }

    const resume = await tx.resume.create({
      data: {
        userId,
        title: `${original.title} (Copy)`,
        template,
        status: 'DRAFT',
        isPublic: false,
        publicSlug: null,
        personalInfo: original.personalInfo ?? undefined,
        summary: original.summary,
        sections: {
          create: original.sections.map((s) => ({
            type: s.type,
            title: s.title,
            content: s.content as InputJsonValue,
            order: s.order,
            isVisible: s.isVisible,
          })),
        },
      },
      include: { sections: true },
    })

    return resume
  })

  return newResume
}

/**
 * Check user's subscription limits and permissions.
 * Note: This function is intentionally NOT cached (beyond the 30s settings cache)
 * because stale permission data could allow users to exceed their plan limits.
 * The system settings it depends on are cached in getSystemSettings() with a 30s TTL.
 */
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
    PRO: {
      resumes: systemSettings.maxProResumes ?? -1,
      ai: systemSettings.maxProAIUsage ?? -1,
      exports: systemSettings.maxProExports ?? -1,
      imports: systemSettings.maxProImports ?? -1,
      atsChecks: systemSettings.maxProATSChecks ?? -1
    }, // -1 means unlimited
  }

  const userLimits = limits[subscription.plan as keyof typeof limits] || limits.FREE


  // Check photo upload permission
  const photoUploadPlans = parseJsonArray(systemSettings.photoUploadPlans, [PLAN_NAMES.PRO])
  const canUploadPhoto = photoUploadPlans.includes(subscription.plan)

  // Get available templates for user's plan
  const allRegisteredTemplates = getTemplateIds()
  let availableTemplates: string[] = ['basic']
  switch (subscription.plan) {
    case PLAN_NAMES.FREE:
      availableTemplates = [...new Set(['basic', ...parseJsonArray(systemSettings.freeTemplates, ['modern'])])]
      break
    case PLAN_NAMES.PRO:
      // PRO always gets all registered templates plus any from settings
      availableTemplates = [...new Set(['basic', ...allRegisteredTemplates, ...parseJsonArray(systemSettings.proTemplates, allRegisteredTemplates)])]
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
    resumeLimit: userLimits.resumes,
    importLimit: userLimits.imports,
    atsLimit: userLimits.atsChecks,
    atsUsed: subscription.atsUsageCount || 0
  }
}