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
import { AdminAnalytics } from './AdminAnalytics'
import { AuditLogPanel } from './AuditLogPanel'
import { UnsavedChangesDialog } from './UnsavedChangesDialog'
import { Stats, SubscriptionStatus, SystemSettings } from './types'
import { PLAN_NAMES, DEFAULT_SYSTEM_SETTINGS } from '@/lib/constants'
import { devError, formatAdminDate } from '@/lib/admin-utils'
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock } from 'lucide-react'

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
  const [showShortcuts, setShowShortcuts] = useState(false)
  const settingsDirtyRef = useRef(false)
  const { items: recentItems, clearItems: clearRecentItems } = useRecentlyViewed()

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

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      const isInInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable

      if (e.key === '/' && !isInInput) {
        e.preventDefault()
        const searchInput = document.querySelector<HTMLInputElement>('[data-admin-search]')
        searchInput?.focus()
      }

      if (e.key === '?' && !isInInput) {
        setShowShortcuts(prev => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
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
  }, [])

  const fetchStats = async () => {
    try {
      const response = await csrfFetch('/api/admin/stats')
      if (!response.ok) throw new Error(`API returned ${response.status}`)
      const data = await response.json()
      setStats(data)
      setErrors(prev => { const { stats: _, ...rest } = prev; return rest })
    } catch (error) {
      devError('[AdminDashboard] Failed to fetch stats:', error)
      setErrors(prev => ({ ...prev, stats: t('pages.admin.common.failedToLoadStats') }))
      toast.error(t('pages.admin.common.failedToLoadStats'))
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
      devError('[AdminDashboard] Failed to fetch settings:', error)
      setErrors(prev => ({ ...prev, settings: t('pages.admin.common.failedToLoadSettings') }))
      toast.error(t('pages.admin.common.failedToLoadSettings'))
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
      devError('[AdminDashboard] Failed to fetch subscription status:', error)
      setErrors(prev => ({ ...prev, subscriptions: t('pages.admin.common.failedToLoadSubscriptionStatus') }))
      toast.error(t('pages.admin.common.failedToLoadSubscriptionStatus'))
    }
  }

  const checkExpiredSubscriptions = async () => {
    setCheckingSubscriptions(true)
    try {
      const response = await csrfFetch('/api/subscriptions/check-expired', { method: 'POST' })
      const data = await response.json()

      if (response.ok) {
        if (data.processed === 0) {
          toast.success(t('pages.admin.subscription.noExpiredFound'))
        } else {
          toast.success(t('pages.admin.subscription.processedResult', { processed: data.processed, successful: data.successful, failed: data.failed }))
        }
        await fetchStats()
        await fetchSubscriptionStatus()
      } else {
        toast.error(t('pages.admin.subscription.checkFailed'))
      }
    } catch (error) {
      devError('[AdminDashboard] Failed to check expired subscriptions:', error);
      toast.error(t('pages.admin.subscription.checkFailed'))
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
        toast.success(t('pages.admin.settings.settingsSaved'))
      } else {
        toast.error(t('pages.admin.settings.saveFailed'))
      }
    } catch (error) {
      devError('[AdminDashboard] Failed to save settings:', error);
      toast.error(t('pages.admin.settings.saveFailed'))
    } finally {
      setSaving(false)
    }
  }

  const hasErrors = Object.keys(errors).length > 0

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <AppHeader
        title={t('pages.admin.dashboard.title')}
        showBackButton={true}
        backButtonText={t('pages.resumeBuilder.backToDashboard')}
        onBackClick={handleBackClick}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t('pages.admin.dashboard.title')}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">{t('pages.admin.dashboard.subtitle')}</p>
        </div>

        {hasErrors && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950 p-4" aria-live="polite">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-red-800 dark:text-red-200">{t('pages.admin.dashboard.errorBanner')}</p>
                <ul className="mt-1 text-sm text-red-700 dark:text-red-300 list-disc list-inside">
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
                {t('pages.admin.dashboard.retryFailed')}
              </Button>
            </div>
          </div>
        )}

        {errors.stats ? null : (
          <AdminErrorBoundary sectionName="Stats Cards">
            <AdminStatsCards stats={stats} loading={loading && !stats} />
          </AdminErrorBoundary>
        )}

        <AdminErrorBoundary sectionName="Analytics">
          <section className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">{t('pages.admin.analytics.title')}</h2>
            <AdminAnalytics csrfFetch={csrfFetch} />
          </section>
        </AdminErrorBoundary>

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

        {recentItems.length > 0 && (
          <Card className="p-6 mt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Clock className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                {t('pages.admin.dashboard.recentlyViewed')}
              </h2>
              <Button variant="ghost" size="sm" onClick={clearRecentItems} type="button">
                {t('pages.admin.dashboard.clear')}
              </Button>
            </div>
            <div className="space-y-2">
              {recentItems.slice(0, 5).map((item) => (
                <div key={`${item.type}-${item.id}`} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-xs capitalize">{item.type}</Badge>
                    <span className="text-sm text-gray-700 dark:text-gray-300 truncate max-w-xs">{item.label}</span>
                  </div>
                  <span className="text-xs text-gray-400 dark:text-gray-500">{formatAdminDate(item.viewedAt)}</span>
                </div>
              ))}
            </div>
          </Card>
        )}

        <AdminErrorBoundary sectionName="Audit Log">
          <AuditLogPanel />
        </AdminErrorBoundary>
      </div>

      <UnsavedChangesDialog
        open={showUnsavedDialog}
        onCancel={() => setShowUnsavedDialog(false)}
        onDiscard={handleConfirmDiscard}
      />

      {showShortcuts && (
        <div className="fixed bottom-4 right-4 z-50 bg-white dark:bg-gray-900 border dark:border-gray-700 rounded-lg shadow-lg p-4 max-w-xs">
          <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100 mb-2">{t('pages.admin.dashboard.keyboardShortcuts')}</h4>
          <dl className="space-y-1 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-gray-500 dark:text-gray-400">{t('pages.admin.dashboard.focusSearch')}</dt>
              <dd><kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono">/</kbd></dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-gray-500 dark:text-gray-400">{t('pages.admin.dashboard.closeModal')}</dt>
              <dd><kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono">Esc</kbd></dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-gray-500 dark:text-gray-400">{t('pages.admin.dashboard.toggleShortcuts')}</dt>
              <dd><kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono">?</kbd></dd>
            </div>
          </dl>
        </div>
      )}
    </div>
  )
}
