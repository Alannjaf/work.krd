import { prisma } from './prisma'
import { PLAN_NAMES } from './constants'
import { parseJsonArray } from './json-utils'

// Module-level cache
let settingsCache: { data: Awaited<ReturnType<typeof prisma.systemSettings.findFirst>>; timestamp: number } | null = null
const CACHE_TTL_MS = 60 * 1000 // 60 seconds — short TTL for serverless (no cross-instance invalidation)

export function invalidateSettingsCache() {
  settingsCache = null
}

export async function getSystemSettings() {
  // Return cached data if still fresh
  if (settingsCache && Date.now() - settingsCache.timestamp < CACHE_TTL_MS) {
    return settingsCache.data!
  }

  try {
    let settings = await prisma.systemSettings.findFirst()

    if (!settings) {
      settings = await prisma.systemSettings.create({
        data: {
          maxFreeResumes: 10,
          maxFreeAIUsage: 100,
          maxFreeExports: 20,
          maxFreeImports: 1,
          maxFreeATSChecks: 0,
          maxProResumes: -1,
          maxProAIUsage: -1,
          maxProExports: -1,
          maxProImports: -1,
          maxProATSChecks: -1,
          freeTemplates: ['modern'],
          proTemplates: ['modern'],
          photoUploadPlans: [PLAN_NAMES.PRO],
          proPlanPrice: 5000,
          maintenanceMode: false
        }
      })
    }

    settingsCache = { data: settings, timestamp: Date.now() }
    return settings
  } catch (error) {
    console.error('[SystemSettings] Failed to get system settings:', error);
    return {
      id: 1,
      maxFreeResumes: 10,
      maxFreeAIUsage: 100,
      maxFreeExports: 20,
      maxFreeImports: 1,
      maxFreeATSChecks: 0,
      maxProResumes: -1,
      maxProAIUsage: -1,
      maxProExports: -1,
      maxProImports: -1,
      maxProATSChecks: -1,
      freeTemplates: ['modern'],
      proTemplates: ['modern'],
      photoUploadPlans: [PLAN_NAMES.PRO],
      proPlanPrice: 5000,
      maintenanceMode: false,
      updatedAt: new Date()
    }
  }
}

interface SystemSettingsUpdateData {
  maxFreeResumes?: number
  maxFreeAIUsage?: number
  maxFreeExports?: number
  maxFreeImports?: number
  maxFreeATSChecks?: number
  maxProResumes?: number
  maxProAIUsage?: number
  maxProExports?: number
  maxProImports?: number
  maxProATSChecks?: number
  freeTemplates?: string[]
  proTemplates?: string[]
  photoUploadPlans?: string[]
  proPlanPrice?: number
  maintenanceMode?: boolean
}

export async function updateSystemSettings(data: SystemSettingsUpdateData) {
  try {
    const existing = await prisma.systemSettings.findFirst()

    const settingsData = {
      maxFreeResumes: data.maxFreeResumes,
      maxFreeAIUsage: data.maxFreeAIUsage,
      maxFreeExports: data.maxFreeExports,
      maxFreeImports: data.maxFreeImports,
      maxFreeATSChecks: data.maxFreeATSChecks,
      maxProResumes: data.maxProResumes,
      maxProAIUsage: data.maxProAIUsage,
      maxProExports: data.maxProExports,
      maxProImports: data.maxProImports,
      maxProATSChecks: data.maxProATSChecks,
      freeTemplates: parseJsonArray(data.freeTemplates, ['modern']),
      proTemplates: parseJsonArray(data.proTemplates, ['modern']),
      photoUploadPlans: parseJsonArray(data.photoUploadPlans, [PLAN_NAMES.PRO]),
      proPlanPrice: data.proPlanPrice,
      maintenanceMode: data.maintenanceMode
    }

    if (existing) {
      return await prisma.systemSettings.update({
        where: { id: existing.id },
        data: settingsData
      })
    } else {
      return await prisma.systemSettings.create({
        data: settingsData
      })
    }
  } catch (error) {
    console.error('[SystemSettings] Failed to update system settings:', error);
    throw error
  }
}
