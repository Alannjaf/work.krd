export type SubscriptionPlan = 'FREE' | 'PRO';

export interface SubscriptionData {
  plan: SubscriptionPlan;
  resumeCount: number;
  resumeLimit: number;
  resumeImportsCount: number;
  resumeImportsLimit: number;
  aiUsageCount: number;
  aiUsageLimit: number;
  exportCount: number;
  exportLimit: number;
  atsUsageCount: number;
  atsUsageLimit: number;
  isActive: boolean;
}

export interface SubscriptionPermissions {
  canCreateResume: boolean;
  canUploadPhoto: boolean;
  canAccessProTemplates: boolean;
  canExportToPDF: boolean;
  canUseAI: boolean;
  canUseATS: boolean;
}

export interface SubscriptionContextType {
  subscription: SubscriptionData | null;
  permissions: SubscriptionPermissions | null;
  availableTemplates: string[];
  isLoading: boolean;
  error: string | null;
  refreshSubscription: () => Promise<void>;
  checkPermission: (permission: keyof SubscriptionPermissions) => boolean;
} 