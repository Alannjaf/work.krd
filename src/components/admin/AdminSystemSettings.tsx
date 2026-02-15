'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Settings, RefreshCw, Save } from 'lucide-react'
import { SystemSettings } from './types'

interface AdminSystemSettingsProps {
  settings: SystemSettings
  setSettings: (settings: SystemSettings) => void
  availableTemplates: string[]
  saving: boolean
  onSave: () => void
  onRefresh: () => void
}

export function AdminSystemSettings({
  settings,
  setSettings,
  availableTemplates,
  saving,
  onSave,
  onRefresh
}: AdminSystemSettingsProps) {
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
          onChange={(field, value) => setSettings({ ...settings, [field]: value })}
          fieldPrefix="maxFree"
        />

        <PlanLimitsSection
          title="Pro Plan Limits"
          resumes={settings.maxProResumes}
          aiUsage={settings.maxProAIUsage}
          exports={settings.maxProExports}
          imports={settings.maxProImports}
          atsChecks={settings.maxProATSChecks}
          onChange={(field, value) => setSettings({ ...settings, [field]: value })}
          fieldPrefix="maxPro"
          allowUnlimited
        />

        <TemplateAccessSection
          settings={settings}
          setSettings={setSettings}
          availableTemplates={availableTemplates}
        />

        <PhotoUploadSection settings={settings} setSettings={setSettings} />

        <PricingSection settings={settings} setSettings={setSettings} />

        <MaintenanceModeSection settings={settings} setSettings={setSettings} />
      </div>

      <div className="mt-6 flex justify-end">
        <Button onClick={onSave} disabled={saving}>
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
  allowUnlimited
}: PlanLimitsSectionProps) {
  const min = allowUnlimited ? -1 : 0
  const suffix = allowUnlimited ? ' (-1 = Unlimited)' : ''

  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Max Resumes{suffix}</label>
          <Input
            type="number"
            min={min}
            value={resumes}
            onChange={(e) => onChange(`${fieldPrefix}Resumes`, parseInt(e.target.value) || 0)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Max AI Usage{suffix}</label>
          <Input
            type="number"
            min={min}
            value={aiUsage}
            onChange={(e) => onChange(`${fieldPrefix}AIUsage`, parseInt(e.target.value) || 0)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Max Exports{suffix}</label>
          <Input
            type="number"
            min={min}
            value={exports}
            onChange={(e) => onChange(`${fieldPrefix}Exports`, parseInt(e.target.value) || 0)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Max Imports{suffix}</label>
          <Input
            type="number"
            min={min}
            value={imports}
            onChange={(e) => onChange(`${fieldPrefix}Imports`, parseInt(e.target.value) || 0)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Max ATS Checks{suffix}</label>
          <Input
            type="number"
            min={min}
            value={atsChecks}
            onChange={(e) => onChange(`${fieldPrefix}ATSChecks`, parseInt(e.target.value) || 0)}
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
            <label className="block text-sm font-medium mb-2 capitalize">{plan} Plan Templates</label>
            <div className="space-y-2">
              {availableTemplates.map(template => (
                <label key={template} className="flex items-center space-x-2">
                  <input
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
        <label className="block text-sm font-medium mb-2">Plans with Photo Upload Access</label>
        <div className="space-y-2">
          {['FREE', 'PRO'].map(plan => (
            <label key={plan} className="flex items-center space-x-2">
              <input
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
        <label className="block text-sm font-medium mb-2">Pro Plan Price (IQD)</label>
        <Input
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
        <label className="flex items-center space-x-2">
          <input
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
