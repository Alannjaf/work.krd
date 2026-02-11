'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { FormInput } from '@/components/ui/form-input'
import { Plus, GraduationCap } from 'lucide-react'
import { TranslateAndEnhanceButton } from '@/components/ai/TranslateAndEnhanceButton'
import { Education } from '@/types/resume'
import { useLanguage } from '@/contexts/LanguageContext'
import { useFieldNavigation } from '@/hooks/useFieldNavigation'
import { SectionHeader } from '@/components/resume-builder/shared/SectionHeader'
import { CollapsibleEntry } from '@/components/resume-builder/shared/CollapsibleEntry'
import { EmptyState } from '@/components/resume-builder/shared/EmptyState'

interface EducationSectionProps {
  education: Education[]
  onChange: (education: Education[]) => void
}

export function EducationSection({ education, onChange }: EducationSectionProps) {
  const { t } = useLanguage()
  const { registerField, focusNext } = useFieldNavigation({ scrollOffset: 80 })
  const [showGpa, setShowGpa] = useState<Record<string, boolean>>({})

  const fieldOrders = useMemo(() => {
    const orders: Record<string, string[]> = {}
    education.forEach(edu => {
      orders[edu.id] = [
        `${edu.id}-degree`, `${edu.id}-field`, `${edu.id}-school`,
        `${edu.id}-location`, `${edu.id}-startDate`, `${edu.id}-endDate`
      ]
    })
    return orders
  }, [education])

  const addEducation = () => {
    onChange([...education, {
      id: Date.now().toString(),
      degree: '', field: '', school: '',
      location: '', startDate: '', endDate: ''
    }])
  }

  const removeEducation = (id: string) => {
    onChange(education.filter(edu => edu.id !== id))
  }

  const updateEducation = (id: string, field: keyof Education, value: string) => {
    onChange(education.map(edu => edu.id === id ? { ...edu, [field]: value } : edu))
  }

  const getEntryTitle = (edu: Education) => {
    if (edu.degree && edu.school) return `${edu.degree} at ${edu.school}`
    return edu.degree || edu.school || 'New Education'
  }

  const getEntrySubtitle = (edu: Education) => {
    const parts = []
    if (edu.field) parts.push(edu.field)
    if (edu.startDate) parts.push(edu.startDate + (edu.endDate ? ` - ${edu.endDate}` : ''))
    return parts.join(' | ')
  }

  return (
    <div className="space-y-4">
      <SectionHeader
        title="Education"
        description="Your educational background"
      />

      {education.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title="No education added"
          description="Add your educational background"
          actionLabel={t('forms.education.addButton')}
          onAction={addEducation}
        />
      ) : (
        <>
          <div className="space-y-3">
            {education.map((edu, index) => (
              <CollapsibleEntry
                key={edu.id}
                title={getEntryTitle(edu)}
                subtitle={getEntrySubtitle(edu)}
                defaultOpen={index === education.length - 1}
                onRemove={() => removeEducation(edu.id)}
              >
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('forms.education.fields.degree')} *
                    </label>
                    <FormInput
                      ref={(el) => registerField(`${edu.id}-degree`, el)}
                      placeholder={t('forms.education.placeholders.degree')}
                      value={edu.degree}
                      onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                      onEnterKey={() => focusNext(`${edu.id}-degree`, fieldOrders[edu.id])}
                      className="rounded-lg"
                    />
                    <TranslateAndEnhanceButton
                      content={edu.degree}
                      contentType="personal"
                      onAccept={(degree) => updateEducation(edu.id, 'degree', degree)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('forms.education.fields.fieldOfStudy')}
                    </label>
                    <FormInput
                      ref={(el) => registerField(`${edu.id}-field`, el)}
                      placeholder={t('forms.education.placeholders.fieldOfStudy')}
                      value={edu.field}
                      onChange={(e) => updateEducation(edu.id, 'field', e.target.value)}
                      onEnterKey={() => focusNext(`${edu.id}-field`, fieldOrders[edu.id])}
                      className="rounded-lg"
                    />
                    <TranslateAndEnhanceButton
                      content={edu.field || ''}
                      contentType="personal"
                      onAccept={(field) => updateEducation(edu.id, 'field', field)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('forms.education.fields.school')} *
                    </label>
                    <FormInput
                      ref={(el) => registerField(`${edu.id}-school`, el)}
                      placeholder={t('forms.education.placeholders.school')}
                      value={edu.school}
                      onChange={(e) => updateEducation(edu.id, 'school', e.target.value)}
                      onEnterKey={() => focusNext(`${edu.id}-school`, fieldOrders[edu.id])}
                      className="rounded-lg"
                    />
                    <TranslateAndEnhanceButton
                      content={edu.school}
                      contentType="personal"
                      onAccept={(school) => updateEducation(edu.id, 'school', school)}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('forms.education.fields.location')}
                      </label>
                      <FormInput
                        ref={(el) => registerField(`${edu.id}-location`, el)}
                        placeholder={t('forms.education.placeholders.location')}
                        value={edu.location}
                        onChange={(e) => updateEducation(edu.id, 'location', e.target.value)}
                        onEnterKey={() => focusNext(`${edu.id}-location`, fieldOrders[edu.id])}
                        className="rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('forms.education.fields.startDate')}
                      </label>
                      <FormInput
                        ref={(el) => registerField(`${edu.id}-startDate`, el)}
                        type="month"
                        value={edu.startDate}
                        onChange={(e) => updateEducation(edu.id, 'startDate', e.target.value)}
                        onEnterKey={() => focusNext(`${edu.id}-startDate`, fieldOrders[edu.id])}
                        className="rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('forms.education.fields.endDate')}
                      </label>
                      <FormInput
                        ref={(el) => registerField(`${edu.id}-endDate`, el)}
                        type="month"
                        value={edu.endDate}
                        onChange={(e) => updateEducation(edu.id, 'endDate', e.target.value)}
                        onEnterKey={() => focusNext(`${edu.id}-endDate`, fieldOrders[edu.id])}
                        className="rounded-lg"
                      />
                    </div>
                  </div>
                </div>

                {/* Progressive disclosure: GPA */}
                {!showGpa[edu.id] && !edu.gpa ? (
                  <button
                    type="button"
                    onClick={() => setShowGpa(prev => ({ ...prev, [edu.id]: true }))}
                    className="text-sm text-primary hover:text-primary/80 font-medium"
                  >
                    + Add GPA
                  </button>
                ) : (
                  <div className="max-w-[200px]">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('forms.education.fields.gpa')}
                    </label>
                    <FormInput
                      placeholder={t('forms.education.placeholders.gpa')}
                      value={edu.gpa || ''}
                      onChange={(e) => updateEducation(edu.id, 'gpa', e.target.value)}
                      className="rounded-lg"
                    />
                  </div>
                )}

                {/* Achievements - simple textarea */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('forms.education.fields.achievements')}
                  </label>
                  <textarea
                    value={edu.achievements || ''}
                    onChange={(e) => updateEducation(edu.id, 'achievements', e.target.value)}
                    placeholder={t('forms.education.placeholders.achievements')}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm resize-none"
                    rows={3}
                  />
                  <TranslateAndEnhanceButton
                    content={edu.achievements || ''}
                    contentType="achievement"
                    onAccept={(achievements) => updateEducation(edu.id, 'achievements', achievements)}
                    contextInfo={{ jobTitle: `${edu.degree} in ${edu.field}` }}
                  />
                </div>
              </CollapsibleEntry>
            ))}
          </div>

          <Button onClick={addEducation} variant="outline" className="w-full rounded-lg">
            <Plus className="h-4 w-4 mr-2" />
            {t('forms.education.addButton')}
          </Button>
        </>
      )}
    </div>
  )
}
