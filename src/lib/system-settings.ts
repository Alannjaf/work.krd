import { prisma } from './prisma'

export async function getSystemSettings() {
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
          photoUploadPlans: ['PRO'],
          proPlanPrice: 5000,
          maintenanceMode: false
        }
      })
    }

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
      photoUploadPlans: ['PRO'],
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

    const ensureArray = (value: unknown, fallback: string[]): string[] => {
      if (Array.isArray(value)) return value
      if (typeof value === 'string') {
        try { return JSON.parse(value) } catch { return fallback }
      }
      return fallback
    }

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
      freeTemplates: ensureArray(data.freeTemplates, ['modern']),
      proTemplates: ensureArray(data.proTemplates, ['modern']),
      photoUploadPlans: ensureArray(data.photoUploadPlans, ['PRO']),
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
