export interface Stats {
  totalUsers: number
  totalResumes: number
  activeSubscriptions: number
  revenue: number
  payments?: {
    pending: number
    approved: number
    rejected: number
  }
}

export interface SubscriptionStatus {
  expired: {
    count: number
    subscriptions: Array<{
      userId: string
      userEmail: string
      userName: string
      plan: string
      endDate: string
      daysOverdue: number
    }>
  }
  expiringSoon: {
    count: number
    subscriptions: Array<{
      userId: string
      userEmail: string
      userName: string
      plan: string
      endDate: string
      daysUntilExpiry: number
    }>
  }
}

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
  freeTemplates: string[]
  proTemplates: string[]
  photoUploadPlans: string[]
  proPlanPrice: number
  maintenanceMode: boolean
}
