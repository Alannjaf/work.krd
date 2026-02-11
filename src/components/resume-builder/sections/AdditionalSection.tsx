'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { RichTextEditor } from '@/components/ui/rich-text-editor'
import { Plus, FolderOpen, Award } from 'lucide-react'
import { TranslateAndEnhanceButton } from '@/components/ai/TranslateAndEnhanceButton'
import { Project, Certification } from '@/types/resume'
import { useLanguage } from '@/contexts/LanguageContext'
import { SectionHeader } from '@/components/resume-builder/shared/SectionHeader'
import { CollapsibleEntry } from '@/components/resume-builder/shared/CollapsibleEntry'
import { EmptyState } from '@/components/resume-builder/shared/EmptyState'

interface AdditionalSectionProps {
  projects: Project[]
  certifications: Certification[]
  onProjectsChange: (projects: Project[]) => void
  onCertificationsChange: (certifications: Certification[]) => void
}

export function AdditionalSection({
  projects,
  certifications,
  onProjectsChange,
  onCertificationsChange,
}: AdditionalSectionProps) {
  const { t } = useLanguage()
  const [activeTab, setActiveTab] = useState<'projects' | 'certifications'>('projects')

  // Projects
  const addProject = () => {
    onProjectsChange([...projects, {
      id: Date.now().toString(), name: '', description: '',
      technologies: '', link: '', startDate: '', endDate: ''
    }])
  }

  const removeProject = (id: string) => {
    onProjectsChange(projects.filter(p => p.id !== id))
  }

  const updateProject = (id: string, field: keyof Project, value: string) => {
    onProjectsChange(projects.map(p => p.id === id ? { ...p, [field]: value } : p))
  }

  // Certifications
  const addCertification = () => {
    onCertificationsChange([...certifications, {
      id: Date.now().toString(), name: '', issuer: '',
      date: '', expiryDate: '', credentialId: '', url: ''
    }])
  }

  const removeCertification = (id: string) => {
    onCertificationsChange(certifications.filter(c => c.id !== id))
  }

  const updateCertification = (id: string, field: keyof Certification, value: string) => {
    onCertificationsChange(certifications.map(c => c.id === id ? { ...c, [field]: value } : c))
  }

  return (
    <div className="space-y-4">
      <SectionHeader
        title="Additional"
        description="Projects and certifications to showcase your expertise"
      />

      {/* Tab toggle */}
      <div className="flex bg-gray-100 rounded-lg p-1">
        <button
          type="button"
          onClick={() => setActiveTab('projects')}
          className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'projects'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Projects ({projects.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('certifications')}
          className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'certifications'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Certifications ({certifications.length})
        </button>
      </div>

      {/* Projects tab */}
      {activeTab === 'projects' && (
        <div className="space-y-3">
          {projects.length === 0 ? (
            <EmptyState
              icon={FolderOpen}
              title={t('forms.projects.empty.title')}
              description={t('forms.projects.empty.description')}
              actionLabel={t('forms.projects.addButton')}
              onAction={addProject}
            />
          ) : (
            <>
              {projects.map((project, index) => (
                <CollapsibleEntry
                  key={project.id}
                  title={project.name || 'New Project'}
                  subtitle={project.technologies || undefined}
                  defaultOpen={index === projects.length - 1}
                  onRemove={() => removeProject(project.id)}
                >
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('forms.projects.fields.name')} *
                      </label>
                      <Input
                        placeholder={t('forms.projects.placeholders.name')}
                        value={project.name}
                        onChange={(e) => updateProject(project.id, 'name', e.target.value)}
                        className="rounded-lg"
                      />
                      <TranslateAndEnhanceButton
                        content={project.name}
                        contentType="personal"
                        onAccept={(name) => updateProject(project.id, 'name', name)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('forms.projects.fields.technologies')}
                      </label>
                      <Input
                        placeholder={t('forms.projects.placeholders.technologies')}
                        value={project.technologies}
                        onChange={(e) => updateProject(project.id, 'technologies', e.target.value)}
                        className="rounded-lg"
                      />
                    </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('forms.projects.fields.startDate')}
                      </label>
                      <Input
                        type="month"
                        value={project.startDate}
                        onChange={(e) => updateProject(project.id, 'startDate', e.target.value)}
                        className="rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('forms.projects.fields.endDate')}
                      </label>
                      <Input
                        type="month"
                        value={project.endDate}
                        onChange={(e) => updateProject(project.id, 'endDate', e.target.value)}
                        className="rounded-lg"
                      />
                    </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('forms.projects.fields.url')}
                      </label>
                      <Input
                        placeholder={t('forms.projects.placeholders.url')}
                        value={project.link}
                        onChange={(e) => updateProject(project.id, 'link', e.target.value)}
                        className="rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
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
                        contextInfo={{ projectName: project.name }}
                      />
                    </div>
                  </div>
                </CollapsibleEntry>
              ))}

              <Button onClick={addProject} variant="outline" className="w-full rounded-lg">
                <Plus className="h-4 w-4 mr-2" />
                {t('forms.projects.addAnother')}
              </Button>
            </>
          )}
        </div>
      )}

      {/* Certifications tab */}
      {activeTab === 'certifications' && (
        <div className="space-y-3">
          {certifications.length === 0 ? (
            <EmptyState
              icon={Award}
              title={t('forms.certifications.empty.title')}
              description={t('forms.certifications.empty.description')}
              actionLabel={t('forms.certifications.addButton')}
              onAction={addCertification}
            />
          ) : (
            <>
              {certifications.map((cert, index) => (
                <CollapsibleEntry
                  key={cert.id}
                  title={cert.name || 'New Certification'}
                  subtitle={cert.issuer || undefined}
                  defaultOpen={index === certifications.length - 1}
                  onRemove={() => removeCertification(cert.id)}
                >
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('forms.certifications.fields.name')} *
                      </label>
                      <Input
                        placeholder={t('forms.certifications.placeholders.name')}
                        value={cert.name}
                        onChange={(e) => updateCertification(cert.id, 'name', e.target.value)}
                        className="rounded-lg"
                      />
                      <TranslateAndEnhanceButton
                        content={cert.name}
                        contentType="personal"
                        onAccept={(name) => updateCertification(cert.id, 'name', name)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('forms.certifications.fields.issuer')} *
                      </label>
                      <Input
                        placeholder={t('forms.certifications.placeholders.issuer')}
                        value={cert.issuer}
                        onChange={(e) => updateCertification(cert.id, 'issuer', e.target.value)}
                        className="rounded-lg"
                      />
                      <TranslateAndEnhanceButton
                        content={cert.issuer}
                        contentType="personal"
                        onAccept={(issuer) => updateCertification(cert.id, 'issuer', issuer)}
                      />
                    </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('forms.certifications.fields.date')}
                      </label>
                      <Input
                        type="month"
                        value={cert.date}
                        onChange={(e) => updateCertification(cert.id, 'date', e.target.value)}
                        className="rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('forms.certifications.fields.expiryDate')}
                      </label>
                      <Input
                        type="month"
                        value={cert.expiryDate}
                        onChange={(e) => updateCertification(cert.id, 'expiryDate', e.target.value)}
                        className="rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('forms.certifications.fields.credentialId')}
                      </label>
                      <Input
                        placeholder={t('forms.certifications.placeholders.credentialId')}
                        value={cert.credentialId}
                        onChange={(e) => updateCertification(cert.id, 'credentialId', e.target.value)}
                        className="rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('forms.certifications.fields.credentialUrl')}
                      </label>
                      <Input
                        placeholder={t('forms.certifications.placeholders.credentialUrl')}
                        value={cert.url}
                        onChange={(e) => updateCertification(cert.id, 'url', e.target.value)}
                        className="rounded-lg"
                      />
                    </div>
                  </div>
                  </div>
                </CollapsibleEntry>
              ))}

              <Button onClick={addCertification} variant="outline" className="w-full rounded-lg">
                <Plus className="h-4 w-4 mr-2" />
                {t('forms.certifications.addAnother')}
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
