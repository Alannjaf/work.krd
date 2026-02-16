'use client'

import { useRef, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { FormInput } from '@/components/ui/form-input'
import { Card } from '@/components/ui/card'
import { RichTextEditor } from '@/components/ui/rich-text-editor'
import { Plus, Trash2, Calendar, MapPin } from 'lucide-react'
import { AIJobDescriptionEnhancer } from '@/components/ai/AIJobDescriptionEnhancer'
import { TranslateAndEnhanceButton } from '@/components/ai/TranslateAndEnhanceButton'
import { WorkExperience } from '@/types/resume'
import { useLanguage } from '@/contexts/LanguageContext'
import { useFieldNavigation } from '@/hooks/useFieldNavigation'

interface WorkExperienceFormProps {
  experiences: WorkExperience[]
  onChange: (experiences: WorkExperience[]) => void
}

export function WorkExperienceForm({ experiences, onChange }: WorkExperienceFormProps) {
  const { t } = useLanguage()
  const descriptionRefs = useRef<Map<string, HTMLDivElement>>(new Map())
  const { registerField, focusNext } = useFieldNavigation({ scrollOffset: 80 })

  // Create field order for each experience
  const fieldOrders = useMemo(() => {
    const orders: Record<string, string[]> = {}
    experiences.forEach(exp => {
      orders[exp.id] = [
        `${exp.id}-jobTitle`,
        `${exp.id}-company`,
        `${exp.id}-location`,
        `${exp.id}-startDate`,
        `${exp.id}-endDate`,
        `${exp.id}-description`
      ]
    })
    return orders
  }, [experiences])
  
  const addExperience = () => {
    const newExperience: WorkExperience = {
      id: crypto.randomUUID(),
      jobTitle: '',
      company: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      description: ''}
    onChange([...experiences, newExperience])
  }

  const removeExperience = (id: string) => {
    onChange(experiences.filter(exp => exp.id !== id))
  }

  const updateExperience = (id: string, field: keyof WorkExperience, value: string | boolean) => {
    onChange(
      experiences.map(exp =>
        exp.id === id ? { ...exp, [field]: value } : exp
      )
    )
  }

  return (
    <div className="space-y-4">
      {experiences.map((exp, index) => (
        <Card key={exp.id} className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-semibold">{t('forms.workExperience.experienceNumber', { number: index + 1 })}</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => removeExperience(exp.id)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                {t('forms.workExperience.fields.jobTitle')} *
              </label>
              <FormInput
                ref={(el) => registerField(`${exp.id}-jobTitle`, el)}
                placeholder={t('forms.workExperience.placeholders.jobTitle')}
                value={exp.jobTitle}
                onChange={(e) => updateExperience(exp.id, 'jobTitle', e.target.value)}
                onEnterKey={() => focusNext(`${exp.id}-jobTitle`, fieldOrders[exp.id])}
              />
              <TranslateAndEnhanceButton
                content={exp.jobTitle}
                contentType="personal"
                onAccept={(jobTitle) => updateExperience(exp.id, 'jobTitle', jobTitle)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                {t('forms.workExperience.fields.company')} *
              </label>
              <FormInput
                ref={(el) => registerField(`${exp.id}-company`, el)}
                placeholder={t('forms.workExperience.placeholders.company')}
                value={exp.company}
                onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                onEnterKey={() => focusNext(`${exp.id}-company`, fieldOrders[exp.id])}
              />
              <TranslateAndEnhanceButton
                content={exp.company}
                contentType="personal"
                onAccept={(company) => updateExperience(exp.id, 'company', company)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                <MapPin className="inline h-3 w-3 mr-1" />
                {t('forms.workExperience.fields.location')}
              </label>
              <FormInput
                ref={(el) => registerField(`${exp.id}-location`, el)}
                placeholder={t('forms.workExperience.placeholders.location')}
                value={exp.location || ''}
                onChange={(e) => updateExperience(exp.id, 'location', e.target.value)}
                onEnterKey={() => focusNext(`${exp.id}-location`, fieldOrders[exp.id])}
              />
              <TranslateAndEnhanceButton
                content={exp.location || ''}
                contentType="personal"
                onAccept={(location) => updateExperience(exp.id, 'location', location)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                <Calendar className="inline h-3 w-3 mr-1" />
                {t('forms.workExperience.fields.startDate')}
              </label>
              <FormInput
                ref={(el) => registerField(`${exp.id}-startDate`, el)}
                type="month"
                value={exp.startDate}
                onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)}
                onEnterKey={() => focusNext(`${exp.id}-startDate`, fieldOrders[exp.id])}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                {t('forms.workExperience.fields.endDate')}
              </label>
              <FormInput
                ref={(el) => registerField(`${exp.id}-endDate`, el)}
                type="month"
                value={exp.endDate}
                onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)}
                disabled={exp.current}
                onEnterKey={() => focusNext(`${exp.id}-endDate`, fieldOrders[exp.id])}
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id={`current-${exp.id}`}
                checked={exp.current}
                onChange={(e) => updateExperience(exp.id, 'current', e.target.checked)}
                className="mr-2"
              />
              <label htmlFor={`current-${exp.id}`} className="text-sm">
                {t('forms.workExperience.fields.current')}
              </label>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium mb-1">
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
            
            {/* AI Job Description Enhancer */}
            <AIJobDescriptionEnhancer
              currentDescription={exp.description || ''}
              jobTitle={exp.jobTitle || ''}
              onAccept={(description) => updateExperience(exp.id, 'description', description)}
              onActionComplete={() => {
                const editorRef = descriptionRefs.current.get(exp.id)
                if (editorRef) {
                  editorRef.scrollIntoView({ behavior: 'smooth', block: 'center' })
                  // Focus the editor if it has a focus method
                  if ('focus' in editorRef && typeof editorRef.focus === 'function') {
                    editorRef.focus()
                  }
                }
              }}
            />
          </div>
        </Card>
      ))}

      <Button onClick={addExperience} variant="outline" className="w-full">
        <Plus className="h-4 w-4 mr-2" />
        {t('forms.workExperience.addButton')}
      </Button>
    </div>
  )
}