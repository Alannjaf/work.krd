'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { RichTextEditor } from '@/components/ui/rich-text-editor'
import { Plus, Trash2, Calendar, Link } from 'lucide-react'
import { TranslateAndEnhanceButton } from '@/components/ai/TranslateAndEnhanceButton'
import { Project } from '@/types/resume'
import { useLanguage } from '@/contexts/LanguageContext'

interface ProjectsFormProps {
  projects: Project[]
  onChange: (projects: Project[]) => void
}

export function ProjectsForm({ projects, onChange }: ProjectsFormProps) {
  const { t } = useLanguage()
  
  const addProject = () => {
    const newProject: Project = {
      id: crypto.randomUUID(),
      name: '',
      description: '',
      technologies: '',
      link: '',
      startDate: '',
      endDate: ''}
    onChange([...projects, newProject])
  }

  const removeProject = (id: string) => {
    onChange(projects.filter((project) => project.id !== id))
  }

  const updateProject = (id: string, field: keyof Project, value: string) => {
    onChange(
      projects.map((project) =>
        project.id === id ? { ...project, [field]: value } : project
      )
    )
  }

  return (
    <div className="space-y-4">
      {projects.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="text-gray-400 mb-4">
            <span className="text-4xl">💼</span>
          </div>
          <h3 className="text-lg font-medium mb-2">{t('forms.projects.empty.title')}</h3>
          <p className="text-gray-600 mb-4">
            {t('forms.projects.empty.description')}
          </p>
          <Button onClick={addProject}>
            <Plus className="h-4 w-4 mr-2" />
            {t('forms.projects.addButton')}
          </Button>
        </Card>
      ) : (
        <>
          {projects.map((project, index) => (
            <Card key={project.id} className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-medium">{t('forms.projects.projectNumber', { number: index + 1 })}</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeProject(project.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    {t('forms.projects.fields.name')} *
                  </label>
                  <Input
                    placeholder={t('forms.projects.placeholders.name')}
                    value={project.name}
                    onChange={(e) => updateProject(project.id, 'name', e.target.value)}
                  />
                  <TranslateAndEnhanceButton
                    content={project.name}
                    contentType="personal"
                    onAccept={(name) => updateProject(project.id, 'name', name)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    {t('forms.projects.fields.technologies')}
                  </label>
                  <Input
                    placeholder={t('forms.projects.placeholders.technologies')}
                    value={project.technologies}
                    onChange={(e) => updateProject(project.id, 'technologies', e.target.value)}
                  />
                  <TranslateAndEnhanceButton
                    content={project.technologies || ''}
                    contentType="personal"
                    onAccept={(technologies) => updateProject(project.id, 'technologies', technologies)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    <Calendar className="inline h-3 w-3 mr-1" />
                    {t('forms.projects.fields.startDate')}
                  </label>
                  <Input
                    type="month"
                    value={project.startDate}
                    onChange={(e) => updateProject(project.id, 'startDate', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    <Calendar className="inline h-3 w-3 mr-1" />
                    {t('forms.projects.fields.endDate')}
                  </label>
                  <Input
                    type="month"
                    value={project.endDate}
                    onChange={(e) => updateProject(project.id, 'endDate', e.target.value)}
                    placeholder={t('forms.projects.placeholders.endDate')}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">
                    <Link className="inline h-3 w-3 mr-1" />
                    {t('forms.projects.fields.url')}
                  </label>
                  <Input
                    placeholder={t('forms.projects.placeholders.url')}
                    value={project.link}
                    onChange={(e) => updateProject(project.id, 'link', e.target.value)}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">
                    {t('forms.projects.fields.description')}
                  </label>
                  <RichTextEditor
                    value={project.description}
                    onChange={(value) => updateProject(project.id, 'description', value)}
                    placeholder={t('forms.projects.placeholders.description')}
                    className="w-full"
                  />
                  <TranslateAndEnhanceButton
                    content={project.description || ''}
                    contentType="project"
                    onAccept={(description) => updateProject(project.id, 'description', description)}
                    contextInfo={{
                      projectName: project.name
                    }}
                  />
                </div>
              </div>
            </Card>
          ))}
          <Button onClick={addProject} variant="outline" className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            {t('forms.projects.addAnother')}
          </Button>
        </>
      )}
      <div className="bg-blue-50 p-4 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>{t('forms.projects.tips.title')}</strong> {t('forms.projects.tips.description')}
        </p>
      </div>
    </div>
  )
}