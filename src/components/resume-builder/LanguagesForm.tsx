'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Plus, Trash2, Globe } from 'lucide-react'
import { TranslateAndEnhanceButton } from '@/components/ai/TranslateAndEnhanceButton'
import { Language } from '@/types/resume'
import { useLanguage } from '@/contexts/LanguageContext'

interface LanguagesFormProps {
  languages: Language[]
  onChange: (languages: Language[]) => void
}

export function LanguagesForm({ languages, onChange }: LanguagesFormProps) {
  const { t } = useLanguage()
  
  const addLanguage = () => {
    const newLanguage: Language = {
      id: crypto.randomUUID(),
      name: '',
      proficiency: 'Conversational'}
    onChange([...languages, newLanguage])
  }

  const removeLanguage = (id: string) => {
    onChange(languages.filter(lang => lang.id !== id))
  }

  const updateLanguage = (id: string, field: keyof Language, value: string) => {
    onChange(
      languages.map(lang =>
        lang.id === id ? { ...lang, [field]: value } : lang
      )
    )
  }

  return (
    <div className="space-y-4">
      <div className="bg-purple-50 p-4 rounded-lg">
        <p className="text-sm text-purple-800">
          <strong>{t('forms.languages.tips.title')}</strong> {t('forms.languages.tips.description')}
        </p>
      </div>

      <div className="space-y-3">
        {languages.map((language) => (
          <Card key={language.id} className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1 sm:hidden">
                  {t('forms.languages.fields.language')}
                </label>
                <Input
                  placeholder={t('forms.languages.placeholders.language')}
                  value={language.name}
                  onChange={(e) => updateLanguage(language.id, 'name', e.target.value)}
                  className="w-full"
                />
                <TranslateAndEnhanceButton
                  content={language.name}
                  contentType="personal"
                  onAccept={(name) => updateLanguage(language.id, 'name', name)}
                />
              </div>
              <div className="w-full sm:w-40">
                <label className="block text-sm font-medium text-gray-700 mb-1 sm:hidden">
                  {t('forms.languages.fields.proficiency')}
                </label>
                <select
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  value={language.proficiency}
                  onChange={(e) => updateLanguage(language.id, 'proficiency', e.target.value)}
                >
                  <option value="Basic">{t('forms.languages.proficiency.basic')}</option>
                  <option value="Conversational">{t('forms.languages.proficiency.conversational')}</option>
                  <option value="Fluent">{t('forms.languages.proficiency.fluent')}</option>
                  <option value="Native">{t('forms.languages.proficiency.native')}</option>
                  <option value="Professional">{t('forms.languages.proficiency.professional')}</option>
                </select>
              </div>
              <div className="flex justify-end sm:justify-start">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeLanguage(language.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-1 sm:mr-0" />
                  <span className="sm:hidden">{t('common.remove')}</span>
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Button onClick={addLanguage} variant="outline" className="w-full">
        <Plus className="h-4 w-4 mr-2" />
        {t('forms.languages.addButton')}
      </Button>

      {languages.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Globe className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <p>{t('forms.languages.empty.title')}</p>
          <p className="text-sm">{t('forms.languages.empty.description')}</p>
        </div>
      )}
    </div>
  )
}