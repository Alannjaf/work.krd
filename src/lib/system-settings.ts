import { prisma } from './prisma'

export async function getSystemSettings() {
  try {
    // Try to get the first (and should be only) settings record
    let settings = await prisma.systemSettings.findFirst()
    
    // If no settings exist, create default settings
    if (!settings) {
      settings = await prisma.systemSettings.create({
        data: {
          maxFreeResumes: 10,
          maxFreeAIUsage: 100,
          maxFreeExports: 20,
          maxFreeImports: 1,
          maxFreeATSChecks: 0,
          maxBasicResumes: 50,
          maxBasicAIUsage: 500,
          maxBasicExports: 100,
          maxBasicImports: 0,
          maxBasicATSChecks: 5,
          maxProResumes: -1,
          maxProAIUsage: -1,
          maxProExports: -1,
          maxProImports: -1,
          maxProATSChecks: -1,
          freeTemplates: ['modern'],
          basicTemplates: ['modern'],
          proTemplates: ['modern'],
          photoUploadPlans: ['BASIC', 'PRO'],
          basicPlanPrice: 5000,
          proPlanPrice: 10000,
          maintenanceMode: false
        }
      })
    }

    return settings
  } catch (error) {
    console.error('[SystemSettings] Failed to get system settings:', error);
    // Return default settings on error
    return {
      id: 1,
      maxFreeResumes: 10,
      maxFreeAIUsage: 100,
      maxFreeExports: 20,
      maxFreeImports: 1,
      maxFreeATSChecks: 0,
      maxBasicResumes: 50,
      maxBasicAIUsage: 500,
      maxBasicExports: 100,
      maxBasicImports: 0,
      maxBasicATSChecks: 5,
      maxProResumes: -1,
      maxProAIUsage: -1,
      maxProExports: -1,
      maxProImports: -1,
      maxProATSChecks: -1,
      freeTemplates: ['modern'],
      basicTemplates: ['modern'],
      proTemplates: ['modern'],
      photoUploadPlans: ['BASIC', 'PRO'],
      basicPlanPrice: 5000,
      proPlanPrice: 10000,
      maintenanceMode: false,
      updatedAt: new Date()
    }
  }
}

interface SystemSettingsUpdateData {
  maxFreeResumes: number
  maxFreeAIUsage: number
  maxFreeExports: number
  maxFreeImports: number
  maxFreeATSChecks: number
  maxBasicResumes: number
  maxBasicAIUsage: number
  maxBasicExports: number
  maxBasicImports: number
  maxBasicATSChecks: number
  maxProResumes: number
  maxProAIUsage: number
  maxProExports: number
  maxProImports: number
  maxProATSChecks: number
  freeTemplates: string[]
  basicTemplates: string[]
  proTemplates: string[]
  photoUploadPlans: string[]
  basicPlanPrice: number
  proPlanPrice: number
  maintenanceMode: boolean
}

export async function updateSystemSettings(data: SystemSettingsUpdateData) {
  try {
    // Get the existing settings
    const existing = await prisma.systemSettings.findFirst()
    
    // Ensure arrays are proper arrays (not stringified)
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
      maxBasicResumes: data.maxBasicResumes,
      maxBasicAIUsage: data.maxBasicAIUsage,
      maxBasicExports: data.maxBasicExports,
      maxBasicImports: data.maxBasicImports,
      maxBasicATSChecks: data.maxBasicATSChecks,
      maxProResumes: data.maxProResumes,
      maxProAIUsage: data.maxProAIUsage,
      maxProExports: data.maxProExports,
      maxProImports: data.maxProImports,
      maxProATSChecks: data.maxProATSChecks,
      freeTemplates: ensureArray(data.freeTemplates, ['modern']),
      basicTemplates: ensureArray(data.basicTemplates, ['modern']),
      proTemplates: ensureArray(data.proTemplates, ['modern']),
      photoUploadPlans: ensureArray(data.photoUploadPlans, ['BASIC', 'PRO']),
      basicPlanPrice: data.basicPlanPrice,
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