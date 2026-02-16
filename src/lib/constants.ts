// Plan names — single source of truth for subscription plan identifiers
export const PLAN_NAMES = {
  FREE: 'FREE' as const,
  PRO: 'PRO' as const,
}

// All valid plan names as an array (for validation)
export const VALID_PLANS = [PLAN_NAMES.FREE, PLAN_NAMES.PRO] as const

// Only paid plans (for expiration checks, payment validation, etc.)
export const PAID_PLANS = [PLAN_NAMES.PRO] as const

export type PlanName = (typeof VALID_PLANS)[number]

// Default plan limits per plan tier
export const DEFAULT_FREE_LIMITS = {
  maxResumes: 1,
  maxAIUsage: 10,
  maxExports: 0,
  maxImports: 1,
  maxATSChecks: 0,
} as const

export const DEFAULT_PRO_LIMITS = {
  maxResumes: -1,
  maxAIUsage: -1,
  maxExports: -1,
  maxImports: -1,
  maxATSChecks: -1,
} as const

// Default system settings values
export const DEFAULT_SYSTEM_SETTINGS = {
  maxFreeResumes: DEFAULT_FREE_LIMITS.maxResumes,
  maxFreeAIUsage: DEFAULT_FREE_LIMITS.maxAIUsage,
  maxFreeExports: DEFAULT_FREE_LIMITS.maxExports,
  maxFreeImports: DEFAULT_FREE_LIMITS.maxImports,
  maxFreeATSChecks: DEFAULT_FREE_LIMITS.maxATSChecks,
  maxProResumes: DEFAULT_PRO_LIMITS.maxResumes,
  maxProAIUsage: DEFAULT_PRO_LIMITS.maxAIUsage,
  maxProExports: DEFAULT_PRO_LIMITS.maxExports,
  maxProImports: DEFAULT_PRO_LIMITS.maxImports,
  maxProATSChecks: DEFAULT_PRO_LIMITS.maxATSChecks,
  freeTemplates: ['modern'] as string[],
  proTemplates: [] as string[],
  photoUploadPlans: [PLAN_NAMES.PRO] as string[],
  proPlanPrice: 5000,
  maintenanceMode: false,
} as const

// Admin pagination defaults per resource type
export const ADMIN_PAGINATION = {
  PAYMENTS: 20,
  RESUMES: 10,
  USERS: 20,
  MAX_LIMIT: 100,
} as const

// Subscription duration in milliseconds (30 days)
export const SUBSCRIPTION_DURATION_MS = 30 * 24 * 60 * 60 * 1000
