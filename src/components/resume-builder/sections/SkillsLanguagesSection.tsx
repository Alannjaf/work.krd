'use client'

import { Skill, Language } from '@/types/resume'
import { useLanguage } from '@/contexts/LanguageContext'
import { AISkillsSuggester } from '@/components/ai/AISkillsSuggester'
import { SectionHeader } from '@/components/resume-builder/shared/SectionHeader'
import { TagInput } from '@/components/resume-builder/shared/TagInput'

interface SkillsLanguagesSectionProps {
  skills: Skill[]
  languages: Language[]
  onSkillsChange: (skills: Skill[]) => void
  onLanguagesChange: (languages: Language[]) => void
  experience?: Array<{ jobTitle: string; company: string }>
}

export function SkillsLanguagesSection({
  skills,
  languages,
  onSkillsChange,
  onLanguagesChange,
  experience = [],
}: SkillsLanguagesSectionProps) {
  const { t } = useLanguage()

  const addSkill = (name: string) => {
    onSkillsChange([...skills, {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name,
      level: 'Intermediate'
    }])
  }

  const removeSkill = (id: string) => {
    onSkillsChange(skills.filter(s => s.id !== id))
  }

  const updateSkillLevel = (id: string, level: string) => {
    onSkillsChange(skills.map(s => s.id === id ? { ...s, level } : s))
  }

  const addSkillsFromAI = (aiSkills: Array<{ name: string; level: string }>) => {
    const newSkills = aiSkills.map(skill => ({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: skill.name,
      level: skill.level
    }))
    onSkillsChange([...skills, ...newSkills])
  }

  const addLanguage = (name: string) => {
    onLanguagesChange([...languages, {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name,
      proficiency: 'Conversational'
    }])
  }

  const removeLanguage = (id: string) => {
    onLanguagesChange(languages.filter(l => l.id !== id))
  }

  const updateLanguageProficiency = (id: string, proficiency: string) => {
    onLanguagesChange(languages.map(l => l.id === id ? { ...l, proficiency } : l))
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Skills & Languages"
        description="Highlight your technical skills and language abilities"
      />

      {/* Skills */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-900">Skills</h3>

        <AISkillsSuggester
          currentSkills={skills}
          onAddSkills={addSkillsFromAI}
          experience={experience}
        />

        <TagInput
          tags={skills.map(s => ({ id: s.id, name: s.name, meta: s.level || 'Intermediate' }))}
          onAdd={addSkill}
          onRemove={removeSkill}
          onMetaChange={updateSkillLevel}
          metaOptions={[
            t('forms.skills.levels.beginner'),
            t('forms.skills.levels.intermediate'),
            t('forms.skills.levels.advanced'),
            t('forms.skills.levels.expert')
          ]}
          metaLabel="Level"
          placeholder={t('forms.skills.placeholder')}
        />

        <p className="text-xs text-gray-500">
          Type a skill and press Enter. Click the level badge to change proficiency.
        </p>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200" />

      {/* Languages */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-900">Languages</h3>

        <TagInput
          tags={languages.map(l => ({ id: l.id, name: l.name, meta: l.proficiency }))}
          onAdd={addLanguage}
          onRemove={removeLanguage}
          onMetaChange={updateLanguageProficiency}
          metaOptions={[
            t('forms.languages.proficiency.basic'),
            t('forms.languages.proficiency.conversational'),
            t('forms.languages.proficiency.fluent'),
            t('forms.languages.proficiency.native'),
            t('forms.languages.proficiency.professional')
          ]}
          metaLabel="Proficiency"
          placeholder={t('forms.languages.placeholders.language')}
        />

        <p className="text-xs text-gray-500">
          Type a language and press Enter. Click the proficiency badge to change level.
        </p>
      </div>
    </div>
  )
}
