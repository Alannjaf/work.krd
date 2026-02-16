'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Settings, RefreshCw, Save } from 'lucide-react'
import { SystemSettings } from './types'
import { VALID_PLANS } from '@/lib/constants'

interface AdminSystemSettingsProps {
  settings: SystemSettings
  setSettings: (settings: SystemSettings) => void
  availableTemplates: string[]
  saving: boolean
  onSave: () => void | Promise<void>
  onRefresh: () => void
  onDirtyChange?: (dirty: boolean) => void
}

export function AdminSystemSettings({
  settings,
  setSettings,
  availableTemplates,
  saving,
  onSave,
  onRefresh,
  onDirtyChange
}: AdminSystemSettingsProps) {
  const [isDirty, setIsDirty] = useState(false)

  useEffect(() => {
    onDirtyChange?.(isDirty)
  }, [isDirty, onDirtyChange])

  const handleSetSettings = (newSettings: SystemSettings) => {
    setSettings(newSettings)
    setIsDirty(true)
  }

  const handleSave = async () => {
    await onSave()
    setIsDirty(false)
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Settings className="h-5 w-5" />
          System Settings
        </h2>
        <Button onClick={onRefresh} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="space-y-8">
        <PlanLimitsSection
          title="Free Plan Limits"
          resumes={settings.maxFreeResumes}
          aiUsage={settings.maxFreeAIUsage}
          exports={settings.maxFreeExports}
          imports={settings.maxFreeImports}
          atsChecks={settings.maxFreeATSChecks}
          onChange={(field, value) => handleSetSettings({ ...settings, [field]: value })}
          fieldPrefix="maxFree"
          idPrefix="free"
        />

        <PlanLimitsSection
          title="Pro Plan Limits"
          resumes={settings.maxProResumes}
          aiUsage={settings.maxProAIUsage}
          exports={settings.maxProExports}
          imports={settings.maxProImports}
          atsChecks={settings.maxProATSChecks}
          onChange={(field, value) => handleSetSettings({ ...settings, [field]: value })}
          fieldPrefix="maxPro"
          idPrefix="pro"
          allowUnlimited
        />

        <TemplateAccessSection
          settings={settings}
          setSettings={handleSetSettings}
          availableTemplates={availableTemplates}
        />

        <PhotoUploadSection settings={settings} setSettings={handleSetSettings} />

        <PricingSection settings={settings} setSettings={handleSetSettings} />

        <MaintenanceModeSection settings={settings} setSettings={handleSetSettings} />
      </div>

      <div className="mt-6 flex items-center justify-end gap-3">
        {isDirty && (
          <span className="text-sm text-amber-600 font-medium">
            Unsaved changes
          </span>
        )}
        <Button onClick={handleSave} disabled={saving || !isDirty}>
          {saving ? (
            <>
              <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Settings
            </>
          )}
        </Button>
      </div>
    </Card>
  )
}

interface PlanLimitsSectionProps {
  title: string
  resumes: number
  aiUsage: number
  exports: number
  imports: number
  atsChecks: number
  onChange: (field: string, value: number) => void
  fieldPrefix: string
  idPrefix: string
  allowUnlimited?: boolean
}

function PlanLimitsSection({
  title,
  resumes,
  aiUsage,
  exports,
  imports,
  atsChecks,
  onChange,
  fieldPrefix,
  idPrefix,
  allowUnlimited
}: PlanLimitsSectionProps) {
  const min = allowUnlimited ? -1 : 0
  const hintId = allowUnlimited ? `${idPrefix}-unlimited-hint` : undefined

  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b">{title}</h3>
      {allowUnlimited && (
        <p id={hintId} className="text-xs text-gray-500 mb-3">
          -1 = Unlimited
        </p>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div>
          <label htmlFor={`${idPrefix}-max-resumes`} className="block text-sm font-medium mb-2">
            Max Resumes
          </label>
          <Input
            id={`${idPrefix}-max-resumes`}
            type="number"
            min={min}
            value={resumes}
            onChange={(e) => onChange(`${fieldPrefix}Resumes`, parseInt(e.target.value) || 0)}
            aria-describedby={hintId}
          />
        </div>
        <div>
          <label htmlFor={`${idPrefix}-max-ai-usage`} className="block text-sm font-medium mb-2">
            Max AI Usage
          </label>
          <Input
            id={`${idPrefix}-max-ai-usage`}
            type="number"
            min={min}
            value={aiUsage}
            onChange={(e) => onChange(`${fieldPrefix}AIUsage`, parseInt(e.target.value) || 0)}
            aria-describedby={hintId}
          />
        </div>
        <div>
          <label htmlFor={`${idPrefix}-max-exports`} className="block text-sm font-medium mb-2">
            Max Exports
          </label>
          <Input
            id={`${idPrefix}-max-exports`}
            type="number"
            min={min}
            value={exports}
            onChange={(e) => onChange(`${fieldPrefix}Exports`, parseInt(e.target.value) || 0)}
            aria-describedby={hintId}
          />
        </div>
        <div>
          <label htmlFor={`${idPrefix}-max-imports`} className="block text-sm font-medium mb-2">
            Max Imports
          </label>
          <Input
            id={`${idPrefix}-max-imports`}
            type="number"
            min={min}
            value={imports}
            onChange={(e) => onChange(`${fieldPrefix}Imports`, parseInt(e.target.value) || 0)}
            aria-describedby={hintId}
          />
        </div>
        <div>
          <label htmlFor={`${idPrefix}-max-ats-checks`} className="block text-sm font-medium mb-2">
            Max ATS Checks
          </label>
          <Input
            id={`${idPrefix}-max-ats-checks`}
            type="number"
            min={min}
            value={atsChecks}
            onChange={(e) => onChange(`${fieldPrefix}ATSChecks`, parseInt(e.target.value) || 0)}
            aria-describedby={hintId}
          />
        </div>
      </div>
    </div>
  )
}

interface TemplateAccessSectionProps {
  settings: SystemSettings
  setSettings: (settings: SystemSettings) => void
  availableTemplates: string[]
}

function TemplateAccessSection({ settings, setSettings, availableTemplates }: TemplateAccessSectionProps) {
  const toggleTemplate = (plan: 'free' | 'pro', template: string, checked: boolean) => {
    const field = `${plan}Templates` as keyof SystemSettings
    const current = settings[field] as string[]
    const updated = checked ? [...current, template] : current.filter(t => t !== template)
    setSettings({ ...settings, [field]: updated })
  }

  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b">Template Access Control</h3>
      <div className="space-y-4">
        {(['free', 'pro'] as const).map(plan => (
          <div key={plan}>
            <div
              id={`${plan}-tpl-group-label`}
              className="block text-sm font-medium mb-2 capitalize"
            >
              {plan} Plan Templates
            </div>
            <div
              role="group"
              aria-labelledby={`${plan}-tpl-group-label`}
              className="space-y-2"
            >
              {availableTemplates.map(template => (
                <label key={template} htmlFor={`${plan}-tpl-${template}`} className="flex items-center space-x-2">
                  <input
                    id={`${plan}-tpl-${template}`}
                    type="checkbox"
                    checked={(settings[`${plan}Templates` as keyof SystemSettings] as string[]).includes(template)}
                    onChange={(e) => toggleTemplate(plan, template, e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm capitalize">{template}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

interface PhotoUploadSectionProps {
  settings: SystemSettings
  setSettings: (settings: SystemSettings) => void
}

function PhotoUploadSection({ settings, setSettings }: PhotoUploadSectionProps) {
  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b">Profile Photo Upload Access</h3>
      <div>
        <div id="photo-upload-group-label" className="block text-sm font-medium mb-2">
          Plans with Photo Upload Access
        </div>
        <div role="group" aria-labelledby="photo-upload-group-label" className="space-y-2">
          {VALID_PLANS.map(plan => (
            <label key={plan} htmlFor={`photo-${plan}`} className="flex items-center space-x-2">
              <input
                id={`photo-${plan}`}
                type="checkbox"
                checked={settings.photoUploadPlans.includes(plan)}
                onChange={(e) => {
                  const updated = e.target.checked
                    ? [...settings.photoUploadPlans, plan]
                    : settings.photoUploadPlans.filter(p => p !== plan)
                  setSettings({ ...settings, photoUploadPlans: updated })
                }}
                className="rounded"
              />
              <span className="text-sm">{plan}</span>
            </label>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Select which subscription plans can upload profile photos
        </p>
      </div>
    </div>
  )
}

interface PricingSectionProps {
  settings: SystemSettings
  setSettings: (settings: SystemSettings) => void
}

function PricingSection({ settings, setSettings }: PricingSectionProps) {
  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b">Pricing Settings</h3>
      <div className="max-w-xs">
        <label htmlFor="pro-plan-price" className="block text-sm font-medium mb-2">Pro Plan Price (IQD)</label>
        <Input
          id="pro-plan-price"
          type="number"
          min="0"
          value={settings.proPlanPrice}
          onChange={(e) => setSettings({
            ...settings,
            proPlanPrice: parseInt(e.target.value) || 0
          })}
        />
      </div>
    </div>
  )
}

interface MaintenanceModeSectionProps {
  settings: SystemSettings
  setSettings: (settings: SystemSettings) => void
}

function MaintenanceModeSection({ settings, setSettings }: MaintenanceModeSectionProps) {
  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b">System Settings</h3>
      <div>
        <label htmlFor="maintenance-mode" className="flex items-center space-x-2">
          <input
            id="maintenance-mode"
            type="checkbox"
            checked={settings.maintenanceMode}
            onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
            className="rounded"
          />
          <span className="text-sm font-medium">Maintenance Mode</span>
        </label>
        <p className="text-xs text-gray-500 mt-1">
          When enabled, only admins can access the site
        </p>
      </div>
    </div>
  )
}
