'use client'

import { useState } from 'react'
import { AISuggestionButton } from './AISuggestionButton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Check, X, Plus } from 'lucide-react'
import toast from 'react-hot-toast'
import { useLanguage } from '@/contexts/LanguageContext'

interface AISkillsSuggesterProps {
  currentSkills: Array<{ id?: string; name: string; level?: string }>
  onAddSkills: (skills: Array<{ name: string; level: string }>) => void
  experience?: Array<{
    jobTitle: string
    company: string
  }>
}

export function AISkillsSuggester({ 
  currentSkills, 
  onAddSkills,
  experience = []
}: AISkillsSuggesterProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const { t } = useLanguage()
  const [suggestedSkills, setSuggestedSkills] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [formData, setFormData] = useState({
    jobTitle: experience[0]?.jobTitle || '',
    industry: ''
  })
  const [selectedSkills, setSelectedSkills] = useState<Set<string>>(new Set())

  const generateSkills = async () => {
    setIsGenerating(true)
    try {
      const response = await fetch('/api/ai/suggest-skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobTitle: formData.jobTitle,
          industry: formData.industry,
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || t('ai.error'))
      }

      const data = await response.json()
      setSuggestedSkills(data.skills)
      setSelectedSkills(new Set())
      setShowSuggestions(true)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('ai.error'))
    } finally {
      setIsGenerating(false)
    }
  }

  const toggleSkillSelection = (skill: string) => {
    const newSelected = new Set(selectedSkills)
    if (newSelected.has(skill)) {
      newSelected.delete(skill)
    } else {
      newSelected.add(skill)
    }
    setSelectedSkills(newSelected)
  }

  const handleAddSelected = () => {
    const skillsToAdd = Array.from(selectedSkills).map(skill => ({
      name: skill,
      level: 'Intermediate'
    }))
    onAddSkills(skillsToAdd)
    setShowSuggestions(false)
    setSuggestedSkills([])
    setSelectedSkills(new Set())
  }

  const handleDismiss = () => {
    setShowSuggestions(false)
    setSuggestedSkills([])
    setSelectedSkills(new Set())
  }

  if (showSuggestions && suggestedSkills.length > 0) {
    return (
      <div className="mt-4">
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4 overflow-hidden">
          <div className="flex items-start space-x-2 mb-3">
            <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-white text-xs">AI</span>
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-purple-900 mb-3">{t('ai.suggestedSkills') || 'AI-Suggested Skills'}</h4>
              <p className="text-sm text-gray-600 mb-3">
                {t('ai.selectSkillsDescription') || 'Select skills to add to your resume. Click to toggle selection.'}
              </p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {suggestedSkills.map((skill, index) => {
                  const isSelected = selectedSkills.has(skill)
                  const isExisting = currentSkills.some(s => s.name.toLowerCase() === skill.toLowerCase())
                  
                  return (
                    <Badge
                      key={index}
                      variant={isSelected ? "default" : "outline"}
                      className={`cursor-pointer transition-all ${
                        isExisting 
                          ? 'opacity-50 cursor-not-allowed' 
                          : 'hover:scale-105'
                      } ${
                        isSelected ? 'bg-purple-600 hover:bg-purple-700' : ''
                      }`}
                      onClick={() => !isExisting && toggleSkillSelection(skill)}
                    >
                      {isSelected && <Check className="h-3 w-3 mr-1" />}
                      {skill}
                      {isExisting && <span className="ml-1 text-xs">({t('ai.alreadyAdded') || 'added'})</span>}
                    </Badge>
                  )
                })}
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              onClick={handleAddSelected}
              disabled={selectedSkills.size === 0}
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="h-4 w-4 mr-1" />
              {t('ai.addSelected') || 'Add Selected'} ({selectedSkills.size})
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={generateSkills}>
              {t('ai.generateNew') || 'Generate New'}
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={handleDismiss}>
              <X className="h-4 w-4 mr-1" />
              {t('ai.dismiss') || 'Dismiss'}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-300 rounded-xl p-6 shadow-md">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mr-3">
            <span className="text-white text-lg font-bold">AI</span>
          </div>
          <h4 className="text-lg font-semibold text-gray-900">{t('ai.generateSkillsTitle') || 'Generate Relevant Skills with AI'}</h4>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('ai.targetJobTitle') || 'Target Job Title'}
            </label>
            <Input
              placeholder={t('ai.jobTitlePlaceholder') || 'e.g. Software Engineer'}
              value={formData.jobTitle}
              onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('ai.industry') || 'Industry'}
            </label>
            <Input
              placeholder={t('ai.industryPlaceholder') || 'e.g. Technology'}
              value={formData.industry}
              onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
            />
          </div>
        </div>
        
        <AISuggestionButton
          onClick={generateSkills}
          disabled={!formData.jobTitle || isGenerating}
          className="w-full"
          size="lg"
        >
          {t('ai.generateSkills') || 'Generate Skills with AI'}
        </AISuggestionButton>
        
        <p className="text-sm text-gray-600 mt-3 text-center">
          {t('ai.skillsDescription') || 'Our AI will suggest relevant skills based on your target role'}
        </p>
      </div>
    </div>
  )
}