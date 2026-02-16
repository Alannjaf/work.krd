'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { AppHeader } from '@/components/shared/AppHeader'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'
import { getTemplateIds } from '@/lib/templates'
import { useLanguage } from '@/contexts/LanguageContext'
import { useCsrfToken } from '@/hooks/useCsrfToken'
import { useRouter } from 'next/navigation'
import { AdminStatsCards } from './AdminStatsCards'
import { AdminSubscriptionStatus } from './AdminSubscriptionStatus'
import { AdminSystemSettings } from './AdminSystemSettings'
import { AdminQuickActions } from './AdminQuickActions'
import { AdminErrorBoundary } from './AdminErrorBoundary'
import { AuditLogPanel } from './AuditLogPanel'
import { UnsavedChangesDialog } from './UnsavedChangesDialog'
import { Stats, SubscriptionStatus, SystemSettings } from './types'
import { PLAN_NAMES, DEFAULT_SYSTEM_SETTINGS } from '@/lib/constants'

const DEFAULT_SETTINGS: SystemSettings = {
  maxFreeResumes: DEFAULT_SYSTEM_SETTINGS.maxFreeResumes,
  maxFreeAIUsage: DEFAULT_SYSTEM_SETTINGS.maxFreeAIUsage,
  maxFreeExports: DEFAULT_SYSTEM_SETTINGS.maxFreeExports,
  maxFreeImports: DEFAULT_SYSTEM_SETTINGS.maxFreeImports,
  maxFreeATSChecks: DEFAULT_SYSTEM_SETTINGS.maxFreeATSChecks,
  maxProResumes: DEFAULT_SYSTEM_SETTINGS.maxProResumes,
  maxProAIUsage: DEFAULT_SYSTEM_SETTINGS.maxProAIUsage,
  maxProExports: DEFAULT_SYSTEM_SETTINGS.maxProExports,
  maxProImports: DEFAULT_SYSTEM_SETTINGS.maxProImports,
  maxProATSChecks: DEFAULT_SYSTEM_SETTINGS.maxProATSChecks,
  freeTemplates: [...DEFAULT_SYSTEM_SETTINGS.freeTemplates],
  proTemplates: [...DEFAULT_SYSTEM_SETTINGS.proTemplates],
  photoUploadPlans: [...DEFAULT_SYSTEM_SETTINGS.photoUploadPlans],
  proPlanPrice: DEFAULT_SYSTEM_SETTINGS.proPlanPrice,
  maintenanceMode: DEFAULT_SYSTEM_SETTINGS.maintenanceMode
}

export function AdminDashboard() {
  const { t } = useLanguage()
  const { csrfFetch } = useCsrfToken()
  const router = useRouter()
  const availableTemplates = getTemplateIds()
  const [stats, setStats] = useState<Stats | null>(null)
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null)
  const [checkingSubscriptions, setCheckingSubscriptions] = useState(false)
  const [settings, setSettings] = useState<SystemSettings>({
    ...DEFAULT_SETTINGS,
    proTemplates: availableTemplates
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<{
    stats?: string;
    settings?: string;
    subscriptions?: string;
  }>({})
  const [settingsDirty, setSettingsDirty] = useState(false)
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false)
  const settingsDirtyRef = useRef(false)

  const handleSettingsDirtyChange = useCallback((dirty: boolean) => {
    setSettingsDirty(dirty)
    settingsDirtyRef.current = dirty
  }, [])

  // Warn on browser close/refresh with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (settingsDirtyRef.current) {
        e.preventDefault()
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [])

  const handleBackClick = () => {
    if (settingsDirty) {
      setShowUnsavedDialog(true)
    } else {
      router.push('/dashboard')
    }
  }

  const handleConfirmDiscard = () => {
    setShowUnsavedDialog(false)
    router.push('/dashboard')
  }

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true)
      setErrors({})
      await Promise.allSettled([fetchStats(), fetchSettings(), fetchSubscriptionStatus()])
      setLoading(false)
    }
    loadAll()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchStats = async () => {
    try {
      const response = await csrfFetch('/api/admin/stats')
      if (!response.ok) throw new Error(`API returned ${response.status}`)
      const data = await response.json()
      setStats(data)
      setErrors(prev => { const { stats: _, ...rest } = prev; return rest })
    } catch (error) {
      console.error('[AdminDashboard] Failed to fetch stats:', error)
      setErrors(prev => ({ ...prev, stats: 'Failed to load stats' }))
      toast.error('Failed to load stats')
    }
  }

  const fetchSettings = async () => {
    try {
      const response = await csrfFetch('/api/admin/settings')
      if (!response.ok) throw new Error(`API returned ${response.status}`)
      const data = await response.json()

      const parseArray = (value: unknown, fallback: string[]): string[] => {
        if (Array.isArray(value)) return value
        if (typeof value === 'string') {
          try { return JSON.parse(value) } catch { return fallback }
        }
        return fallback
      }

      setSettings({
        maxFreeResumes: data.maxFreeResumes ?? 10,
        maxFreeAIUsage: data.maxFreeAIUsage ?? 100,
        maxFreeExports: data.maxFreeExports ?? 20,
        maxFreeImports: data.maxFreeImports ?? 1,
        maxFreeATSChecks: data.maxFreeATSChecks ?? 0,
        maxProResumes: data.maxProResumes ?? -1,
        maxProAIUsage: data.maxProAIUsage ?? -1,
        maxProExports: data.maxProExports ?? -1,
        maxProImports: data.maxProImports ?? -1,
        maxProATSChecks: data.maxProATSChecks ?? -1,
        freeTemplates: parseArray(data.freeTemplates, ['modern']),
        // PRO always includes all registered templates
        proTemplates: [...new Set([...availableTemplates, ...parseArray(data.proTemplates, availableTemplates)])],
        photoUploadPlans: parseArray(data.photoUploadPlans, [...DEFAULT_SYSTEM_SETTINGS.photoUploadPlans]),
        proPlanPrice: data.proPlanPrice ?? 5000,
        maintenanceMode: data.maintenanceMode ?? false
      })
      setErrors(prev => { const { settings: _, ...rest } = prev; return rest })
    } catch (error) {
      console.error('[AdminDashboard] Failed to fetch settings:', error)
      setErrors(prev => ({ ...prev, settings: 'Failed to load settings' }))
      toast.error('Failed to load settings')
    }
  }

  const fetchSubscriptionStatus = async () => {
    try {
      const response = await csrfFetch('/api/subscriptions/check-expired')
      if (!response.ok) throw new Error(`API returned ${response.status}`)
      const data = await response.json()
      setSubscriptionStatus(data)
      setErrors(prev => { const { subscriptions: _, ...rest } = prev; return rest })
    } catch (error) {
      console.error('[AdminDashboard] Failed to fetch subscription status:', error)
      setErrors(prev => ({ ...prev, subscriptions: 'Failed to load subscription status' }))
      toast.error('Failed to load subscription status')
    }
  }

  const checkExpiredSubscriptions = async () => {
    setCheckingSubscriptions(true)
    try {
      const response = await csrfFetch('/api/subscriptions/check-expired', { method: 'POST' })
      const data = await response.json()

      if (response.ok) {
        if (data.processed === 0) {
          toast.success('No expired subscriptions found')
        } else {
          toast.success(`Processed ${data.processed} subscriptions. ${data.successful} successful, ${data.failed} failed.`)
        }
        await fetchStats()
        await fetchSubscriptionStatus()
      } else {
        toast.error('Failed to check subscriptions')
      }
    } catch (error) {
      console.error('[AdminDashboard] Failed to check expired subscriptions:', error);
      toast.error('Failed to check subscriptions')
    } finally {
      setCheckingSubscriptions(false)
    }
  }

  const saveSettings = async () => {
    setSaving(true)
    try {
      const response = await csrfFetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })
      if (response.ok) {
        toast.success('Settings saved successfully!')
      } else {
        toast.error('Failed to save settings')
      }
    } catch (error) {
      console.error('[AdminDashboard] Failed to save settings:', error);
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const hasErrors = Object.keys(errors).length > 0

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader
        title="Admin Dashboard"
        showBackButton={true}
        backButtonText={t('pages.resumeBuilder.backToDashboard')}
        onBackClick={handleBackClick}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your Work.krd platform</p>
        </div>

        {hasErrors && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-red-800">Some sections failed to load</p>
                <ul className="mt-1 text-sm text-red-700 list-disc list-inside">
                  {errors.stats && <li>{errors.stats}</li>}
                  {errors.settings && <li>{errors.settings}</li>}
                  {errors.subscriptions && <li>{errors.subscriptions}</li>}
                </ul>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  const failedSections = { ...errors }
                  setErrors({})
                  const retries: Promise<void>[] = []
                  if (failedSections.stats) retries.push(fetchStats())
                  if (failedSections.settings) retries.push(fetchSettings())
                  if (failedSections.subscriptions) retries.push(fetchSubscriptionStatus())
                  await Promise.allSettled(retries)
                }}
              >
                Retry Failed
              </Button>
            </div>
          </div>
        )}

        {errors.stats ? null : (
          <AdminErrorBoundary sectionName="Stats Cards">
            <AdminStatsCards stats={stats} loading={loading && !stats} />
          </AdminErrorBoundary>
        )}

        {errors.subscriptions ? null : (
          <AdminErrorBoundary sectionName="Subscription Status">
            <AdminSubscriptionStatus
              subscriptionStatus={subscriptionStatus}
              checkingSubscriptions={checkingSubscriptions}
              onCheckExpired={checkExpiredSubscriptions}
            />
          </AdminErrorBoundary>
        )}

        {errors.settings ? null : (
          <AdminErrorBoundary sectionName="System Settings">
            <AdminSystemSettings
              settings={settings}
              setSettings={setSettings}
              availableTemplates={availableTemplates}
              saving={saving}
              onSave={saveSettings}
              onRefresh={() => { fetchStats(); fetchSettings(); fetchSubscriptionStatus(); }}
              onDirtyChange={handleSettingsDirtyChange}
            />
          </AdminErrorBoundary>
        )}

        <AdminErrorBoundary sectionName="Quick Actions">
          <AdminQuickActions />
        </AdminErrorBoundary>

        <AdminErrorBoundary sectionName="Audit Log">
          <AuditLogPanel />
        </AdminErrorBoundary>
      </div>

      <UnsavedChangesDialog
        open={showUnsavedDialog}
        onCancel={() => setShowUnsavedDialog(false)}
        onDiscard={handleConfirmDiscard}
      />
    </div>
  )
}
