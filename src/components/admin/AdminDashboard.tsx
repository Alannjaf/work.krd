'use client'

import { useEffect, useState } from 'react'
import { AppHeader } from '@/components/shared/AppHeader'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'
import { getTemplateIds } from '@/lib/templates'
import { useLanguage } from '@/contexts/LanguageContext'
import { AdminStatsCards } from './AdminStatsCards'
import { AdminSubscriptionStatus } from './AdminSubscriptionStatus'
import { AdminSystemSettings } from './AdminSystemSettings'
import { AdminQuickActions } from './AdminQuickActions'
import { Stats, SubscriptionStatus, SystemSettings } from './types'

const DEFAULT_SETTINGS: SystemSettings = {
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
  proTemplates: [],
  photoUploadPlans: ['PRO'],
  proPlanPrice: 5000,
  maintenanceMode: false
}

export function AdminDashboard() {
  const { t } = useLanguage()
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
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true)
      setError(null)
      await Promise.allSettled([fetchStats(), fetchSettings(), fetchSubscriptionStatus()])
      setLoading(false)
    }
    loadAll()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats')
      if (!response.ok) throw new Error(`API returned ${response.status}`)
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('[AdminDashboard] Failed to fetch stats:', error)
      setError('Failed to load dashboard data')
      toast.error('Failed to load stats')
    }
  }

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings')
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
        photoUploadPlans: parseArray(data.photoUploadPlans, ['PRO']),
        proPlanPrice: data.proPlanPrice ?? 5000,
        maintenanceMode: data.maintenanceMode ?? false
      })
    } catch (error) {
      console.error('[AdminDashboard] Failed to fetch settings:', error)
      setError('Failed to load dashboard data')
      toast.error('Failed to load settings')
    }
  }

  const fetchSubscriptionStatus = async () => {
    try {
      const response = await fetch('/api/subscriptions/check-expired')
      if (!response.ok) throw new Error(`API returned ${response.status}`)
      const data = await response.json()
      setSubscriptionStatus(data)
    } catch (error) {
      console.error('[AdminDashboard] Failed to fetch subscription status:', error)
      setError('Failed to load dashboard data')
      toast.error('Failed to load subscription status')
    }
  }

  const checkExpiredSubscriptions = async () => {
    setCheckingSubscriptions(true)
    try {
      const response = await fetch('/api/subscriptions/check-expired', { method: 'POST' })
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
      const response = await fetch('/api/admin/settings', {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button
            onClick={async () => {
              setError(null)
              setLoading(true)
              await Promise.allSettled([fetchStats(), fetchSettings(), fetchSubscriptionStatus()])
              setLoading(false)
            }}
          >
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader
        title="Admin Dashboard"
        showBackButton={true}
        backButtonText={t('pages.resumeBuilder.backToDashboard')}
        backButtonHref="/dashboard"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your Work.krd platform</p>
        </div>

        <AdminStatsCards stats={stats} />

        <AdminSubscriptionStatus
          subscriptionStatus={subscriptionStatus}
          checkingSubscriptions={checkingSubscriptions}
          onCheckExpired={checkExpiredSubscriptions}
        />

        <AdminSystemSettings
          settings={settings}
          setSettings={setSettings}
          availableTemplates={availableTemplates}
          saving={saving}
          onSave={saveSettings}
          onRefresh={() => { fetchStats(); fetchSettings(); fetchSubscriptionStatus(); }}
        />

        <AdminQuickActions />
      </div>
    </div>
  )
}
