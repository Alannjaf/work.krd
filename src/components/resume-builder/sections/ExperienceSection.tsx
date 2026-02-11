'use client'

import { useRef, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { FormInput } from '@/components/ui/form-input'
import { RichTextEditor } from '@/components/ui/rich-text-editor'
import { Plus, Briefcase } from 'lucide-react'
import { AIJobDescriptionEnhancer } from '@/components/ai/AIJobDescriptionEnhancer'
import { TranslateAndEnhanceButton } from '@/components/ai/TranslateAndEnhanceButton'
import { WorkExperience } from '@/types/resume'
import { useLanguage } from '@/contexts/LanguageContext'
import { useFieldNavigation } from '@/hooks/useFieldNavigation'
import { SectionHeader } from '@/components/resume-builder/shared/SectionHeader'
import { CollapsibleEntry } from '@/components/resume-builder/shared/CollapsibleEntry'
import { EmptyState } from '@/components/resume-builder/shared/EmptyState'

interface ExperienceSectionProps {
  experiences: WorkExperience[]
  onChange: (experiences: WorkExperience[]) => void
}

export function ExperienceSection({ experiences, onChange }: ExperienceSectionProps) {
  const { t } = useLanguage()
  const descriptionRefs = useRef<Map<string, HTMLDivElement>>(new Map())
  const { registerField, focusNext } = useFieldNavigation({ scrollOffset: 80 })

  const fieldOrders = useMemo(() => {
    const orders: Record<string, string[]> = {}
    experiences.forEach(exp => {
      orders[exp.id] = [
        `${exp.id}-jobTitle`, `${exp.id}-company`, `${exp.id}-location`,
        `${exp.id}-startDate`, `${exp.id}-endDate`, `${exp.id}-description`
      ]
    })
    return orders
  }, [experiences])

  const addExperience = () => {
    onChange([...experiences, {
      id: Date.now().toString(),
      jobTitle: '', company: '', location: '',
      startDate: '', endDate: '', current: false, description: ''
    }])
  }

  const removeExperience = (id: string) => {
    onChange(experiences.filter(exp => exp.id !== id))
  }

  const updateExperience = (id: string, field: keyof WorkExperience, value: string | boolean) => {
    onChange(experiences.map(exp => exp.id === id ? { ...exp, [field]: value } : exp))
  }

  const getEntryTitle = (exp: WorkExperience) => {
    if (exp.jobTitle && exp.company) return `${exp.jobTitle} at ${exp.company}`
    return exp.jobTitle || exp.company || 'New Experience'
  }

  const getEntrySubtitle = (exp: WorkExperience) => {
    const parts = []
    if (exp.startDate) parts.push(exp.startDate)
    if (exp.current) parts.push('Present')
    else if (exp.endDate) parts.push(exp.endDate)
    return parts.join(' - ')
  }

  return (
    <div className="space-y-4">
      <SectionHeader
        title="Work Experience"
        description="List your relevant work history, most recent first"
      />

      {experiences.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No experience added"
          description="Add your work experience to strengthen your resume"
          actionLabel={t('forms.workExperience.addButton')}
          onAction={addExperience}
        />
      ) : (
        <>
          <div className="space-y-3">
            {experiences.map((exp, index) => (
              <CollapsibleEntry
                key={exp.id}
                title={getEntryTitle(exp)}
                subtitle={getEntrySubtitle(exp)}
                defaultOpen={index === experiences.length - 1}
                onRemove={() => removeExperience(exp.id)}
              >
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('forms.workExperience.fields.jobTitle')} *
                    </label>
                    <FormInput
                      ref={(el) => registerField(`${exp.id}-jobTitle`, el)}
                      placeholder={t('forms.workExperience.placeholders.jobTitle')}
                      value={exp.jobTitle}
                      onChange={(e) => updateExperience(exp.id, 'jobTitle', e.target.value)}
                      onEnterKey={() => focusNext(`${exp.id}-jobTitle`, fieldOrders[exp.id])}
                      className="rounded-lg"
                    />
                    <TranslateAndEnhanceButton
                      content={exp.jobTitle}
                      contentType="personal"
                      onAccept={(jobTitle) => updateExperience(exp.id, 'jobTitle', jobTitle)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('forms.workExperience.fields.company')} *
                    </label>
                    <FormInput
                      ref={(el) => registerField(`${exp.id}-company`, el)}
                      placeholder={t('forms.workExperience.placeholders.company')}
                      value={exp.company}
                      onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                      onEnterKey={() => focusNext(`${exp.id}-company`, fieldOrders[exp.id])}
                      className="rounded-lg"
                    />
                    <TranslateAndEnhanceButton
                      content={exp.company}
                      contentType="personal"
                      onAccept={(company) => updateExperience(exp.id, 'company', company)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('forms.workExperience.fields.location')}
                    </label>
                    <FormInput
                      ref={(el) => registerField(`${exp.id}-location`, el)}
                      placeholder={t('forms.workExperience.placeholders.location')}
                      value={exp.location || ''}
                      onChange={(e) => updateExperience(exp.id, 'location', e.target.value)}
                      onEnterKey={() => focusNext(`${exp.id}-location`, fieldOrders[exp.id])}
                      className="rounded-lg"
                    />
                    <TranslateAndEnhanceButton
                      content={exp.location || ''}
                      contentType="personal"
                      onAccept={(location) => updateExperience(exp.id, 'location', location)}
                    />
                  </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('forms.workExperience.fields.startDate')}
                    </label>
                    <FormInput
                      ref={(el) => registerField(`${exp.id}-startDate`, el)}
                      type="month"
                      value={exp.startDate}
                      onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)}
                      onEnterKey={() => focusNext(`${exp.id}-startDate`, fieldOrders[exp.id])}
                      className="rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('forms.workExperience.fields.endDate')}
                    </label>
                    <FormInput
                      ref={(el) => registerField(`${exp.id}-endDate`, el)}
                      type="month"
                      value={exp.endDate}
                      onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)}
                      disabled={exp.current}
                      onEnterKey={() => focusNext(`${exp.id}-endDate`, fieldOrders[exp.id])}
                      className="rounded-lg"
                    />
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id={`current-${exp.id}`}
                      checked={exp.current}
                      onChange={(e) => updateExperience(exp.id, 'current', e.target.checked)}
                      className="mr-2 rounded"
                    />
                    <label htmlFor={`current-${exp.id}`} className="text-sm text-gray-700">
                      {t('forms.workExperience.fields.current')}
                    </label>
                  </div>
                </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('forms.workExperience.fields.description')}
                  </label>
                  <RichTextEditor
                    ref={(el) => {
                      if (el) {
                        descriptionRefs.current.set(exp.id, el)
                        registerField(`${exp.id}-description`, el)
                      } else {
                        descriptionRefs.current.delete(exp.id)
                        registerField(`${exp.id}-description`, null)
                      }
                    }}
                    value={exp.description || ''}
                    onChange={(value) => updateExperience(exp.id, 'description', value)}
                    placeholder={t('forms.workExperience.placeholders.description')}
                    className="w-full"
                  />
                  <AIJobDescriptionEnhancer
                    currentDescription={exp.description || ''}
                    jobTitle={exp.jobTitle || ''}
                    onAccept={(description) => updateExperience(exp.id, 'description', description)}
                    onActionComplete={() => {
                      const editorRef = descriptionRefs.current.get(exp.id)
                      if (editorRef) {
                        editorRef.scrollIntoView({ behavior: 'smooth', block: 'center' })
                        if ('focus' in editorRef && typeof editorRef.focus === 'function') {
                          editorRef.focus()
                        }
                      }
                    }}
                  />
                </div>
              </CollapsibleEntry>
            ))}
          </div>

          <Button onClick={addExperience} variant="outline" className="w-full rounded-lg">
            <Plus className="h-4 w-4 mr-2" />
            {t('forms.workExperience.addButton')}
          </Button>
        </>
      )}
    </div>
  )
}
