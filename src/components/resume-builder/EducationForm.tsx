'use client'

import { useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { FormInput } from '@/components/ui/form-input'
import { Card } from '@/components/ui/card'
import { RichTextEditor } from '@/components/ui/rich-text-editor'
import { Plus, Trash2, GraduationCap, Calendar } from 'lucide-react'
import { TranslateAndEnhanceButton } from '@/components/ai/TranslateAndEnhanceButton'
import { Education } from '@/types/resume'
import { useLanguage } from '@/contexts/LanguageContext'
import { useFieldNavigation } from '@/hooks/useFieldNavigation'

interface EducationFormProps {
  education: Education[]
  onChange: (education: Education[]) => void
}

export function EducationForm({ education, onChange }: EducationFormProps) {
  const { t } = useLanguage()
  const { registerField, focusNext } = useFieldNavigation({ scrollOffset: 80 })

  // Create field order for each education entry
  const fieldOrders = useMemo(() => {
    const orders: Record<string, string[]> = {}
    education.forEach(edu => {
      orders[edu.id] = [
        `${edu.id}-degree`,
        `${edu.id}-field`,
        `${edu.id}-school`,
        `${edu.id}-location`,
        `${edu.id}-startDate`,
        `${edu.id}-endDate`,
        `${edu.id}-gpa`,
        `${edu.id}-achievements`
      ]
    })
    return orders
  }, [education])
  const addEducation = () => {
    const newEducation: Education = {
      id: crypto.randomUUID(),
      degree: '',
      field: '',
      school: '',
      location: '',
      startDate: '',
      endDate: ''}
    onChange([...education, newEducation])
  }

  const removeEducation = (id: string) => {
    onChange(education.filter(edu => edu.id !== id))
  }

  const updateEducation = (id: string, field: keyof Education, value: string) => {
    onChange(
      education.map(edu =>
        edu.id === id ? { ...edu, [field]: value } : edu
      )
    )
  }

  return (
    <div className="space-y-4">
      {education.map((edu, index) => (
        <Card key={edu.id} className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-semibold">
              <GraduationCap className="inline h-5 w-5 mr-2" />
              {t('forms.education.educationNumber', { number: index + 1 })}
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => removeEducation(edu.id)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                {t('forms.education.fields.degree')} *
              </label>
              <FormInput
                ref={(el) => registerField(`${edu.id}-degree`, el)}
                placeholder={t('forms.education.placeholders.degree')}
                value={edu.degree}
                onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                onEnterKey={() => focusNext(`${edu.id}-degree`, fieldOrders[edu.id])}
              />
              <TranslateAndEnhanceButton
                content={edu.degree}
                contentType="personal"
                onAccept={(degree) => updateEducation(edu.id, 'degree', degree)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                {t('forms.education.fields.fieldOfStudy')} *
              </label>
              <FormInput
                ref={(el) => registerField(`${edu.id}-field`, el)}
                placeholder={t('forms.education.placeholders.fieldOfStudy')}
                value={edu.field}
                onChange={(e) => updateEducation(edu.id, 'field', e.target.value)}
                onEnterKey={() => focusNext(`${edu.id}-field`, fieldOrders[edu.id])}
              />
              <TranslateAndEnhanceButton
                content={edu.field || ''}
                contentType="personal"
                onAccept={(field) => updateEducation(edu.id, 'field', field)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                {t('forms.education.fields.school')} *
              </label>
              <FormInput
                ref={(el) => registerField(`${edu.id}-school`, el)}
                placeholder={t('forms.education.placeholders.school')}
                value={edu.school}
                onChange={(e) => updateEducation(edu.id, 'school', e.target.value)}
                onEnterKey={() => focusNext(`${edu.id}-school`, fieldOrders[edu.id])}
              />
              <TranslateAndEnhanceButton
                content={edu.school}
                contentType="personal"
                onAccept={(school) => updateEducation(edu.id, 'school', school)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                {t('forms.education.fields.location')}
              </label>
              <FormInput
                ref={(el) => registerField(`${edu.id}-location`, el)}
                placeholder={t('forms.education.placeholders.location')}
                value={edu.location}
                onChange={(e) => updateEducation(edu.id, 'location', e.target.value)}
                onEnterKey={() => focusNext(`${edu.id}-location`, fieldOrders[edu.id])}
              />
              <TranslateAndEnhanceButton
                content={edu.location || ''}
                contentType="personal"
                onAccept={(location) => updateEducation(edu.id, 'location', location)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                <Calendar className="inline h-3 w-3 mr-1" />
                {t('forms.education.fields.startDate')}
              </label>
              <FormInput
                ref={(el) => registerField(`${edu.id}-startDate`, el)}
                type="month"
                value={edu.startDate}
                onChange={(e) => updateEducation(edu.id, 'startDate', e.target.value)}
                onEnterKey={() => focusNext(`${edu.id}-startDate`, fieldOrders[edu.id])}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                {t('forms.education.fields.endDate')}
              </label>
              <FormInput
                ref={(el) => registerField(`${edu.id}-endDate`, el)}
                type="month"
                value={edu.endDate}
                onChange={(e) => updateEducation(edu.id, 'endDate', e.target.value)}
                onEnterKey={() => focusNext(`${edu.id}-endDate`, fieldOrders[edu.id])}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                {t('forms.education.fields.gpa')}
              </label>
              <FormInput
                ref={(el) => registerField(`${edu.id}-gpa`, el)}
                placeholder={t('forms.education.placeholders.gpa')}
                value={edu.gpa || ''}
                onChange={(e) => updateEducation(edu.id, 'gpa', e.target.value)}
                onEnterKey={() => focusNext(`${edu.id}-gpa`, fieldOrders[edu.id])}
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium mb-1">
              {t('forms.education.fields.achievements')}
            </label>
            <RichTextEditor
              ref={(el) => registerField(`${edu.id}-achievements`, el)}
              value={edu.achievements || ''}
              onChange={(value) => updateEducation(edu.id, 'achievements', value)}
              placeholder={t('forms.education.placeholders.achievements')}
              className="w-full"
            />
            <TranslateAndEnhanceButton
              content={edu.achievements || ''}
              contentType="achievement"
              onAccept={(achievements) => updateEducation(edu.id, 'achievements', achievements)}
              contextInfo={{
                jobTitle: `${edu.degree} in ${edu.field}`
              }}
            />
          </div>
        </Card>
      ))}

      <Button onClick={addEducation} variant="outline" className="w-full">
        <Plus className="h-4 w-4 mr-2" />
        {t('forms.education.addButton')}
      </Button>
    </div>
  )
}