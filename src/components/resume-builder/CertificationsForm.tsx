'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Plus, Trash2, Calendar, Award } from 'lucide-react'
import { TranslateAndEnhanceButton } from '@/components/ai/TranslateAndEnhanceButton'
import { Certification } from '@/types/resume'
import { useLanguage } from '@/contexts/LanguageContext'

interface CertificationsFormProps {
  certifications: Certification[]
  onChange: (certifications: Certification[]) => void
}

export function CertificationsForm({ certifications, onChange }: CertificationsFormProps) {
  const { t } = useLanguage()
  
  const addCertification = () => {
    const newCertification: Certification = {
      id: crypto.randomUUID(),
      name: '',
      issuer: '',
      date: '',
      expiryDate: '',
      credentialId: '',
      url: ''}
    onChange([...certifications, newCertification])
  }

  const removeCertification = (id: string) => {
    onChange(certifications.filter((cert) => cert.id !== id))
  }

  const updateCertification = (id: string, field: keyof Certification, value: string) => {
    onChange(
      certifications.map((cert) =>
        cert.id === id ? { ...cert, [field]: value } : cert
      )
    )
  }

  return (
    <div className="space-y-4">
      {certifications.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="text-gray-400 mb-4">
            <span className="text-4xl">🏆</span>
          </div>
          <h3 className="text-lg font-medium mb-2">{t('forms.certifications.empty.title')}</h3>
          <p className="text-gray-600 mb-4">
            {t('forms.certifications.empty.description')}
          </p>
          <Button onClick={addCertification}>
            <Plus className="h-4 w-4 mr-2" />
            {t('forms.certifications.addButton')}
          </Button>
        </Card>
      ) : (
        <>
          {certifications.map((cert, index) => (
            <Card key={cert.id} className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-medium">
                  <Award className="inline h-4 w-4 mr-2" />
                  {t('forms.certifications.certificationNumber', { number: index + 1 })}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeCertification(cert.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    {t('forms.certifications.fields.name')} *
                  </label>
                  <Input
                    placeholder={t('forms.certifications.placeholders.name')}
                    value={cert.name}
                    onChange={(e) => updateCertification(cert.id, 'name', e.target.value)}
                  />
                  <TranslateAndEnhanceButton
                    content={cert.name}
                    contentType="personal"
                    onAccept={(name) => updateCertification(cert.id, 'name', name)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    {t('forms.certifications.fields.issuer')} *
                  </label>
                  <Input
                    placeholder={t('forms.certifications.placeholders.issuer')}
                    value={cert.issuer}
                    onChange={(e) => updateCertification(cert.id, 'issuer', e.target.value)}
                  />
                  <TranslateAndEnhanceButton
                    content={cert.issuer}
                    contentType="personal"
                    onAccept={(issuer) => updateCertification(cert.id, 'issuer', issuer)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    <Calendar className="inline h-3 w-3 mr-1" />
                    {t('forms.certifications.fields.date')}
                  </label>
                  <Input
                    type="month"
                    value={cert.date}
                    onChange={(e) => updateCertification(cert.id, 'date', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    <Calendar className="inline h-3 w-3 mr-1" />
                    {t('forms.certifications.fields.expiryDate')}
                  </label>
                  <Input
                    type="month"
                    value={cert.expiryDate}
                    onChange={(e) => updateCertification(cert.id, 'expiryDate', e.target.value)}
                    placeholder={t('forms.certifications.placeholders.expiryDate')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    {t('forms.certifications.fields.credentialId')}
                  </label>
                  <Input
                    placeholder={t('forms.certifications.placeholders.credentialId')}
                    value={cert.credentialId}
                    onChange={(e) => updateCertification(cert.id, 'credentialId', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    {t('forms.certifications.fields.credentialUrl')}
                  </label>
                  <Input
                    placeholder={t('forms.certifications.placeholders.credentialUrl')}
                    value={cert.url}
                    onChange={(e) => updateCertification(cert.id, 'url', e.target.value)}
                  />
                </div>
              </div>
            </Card>
          ))}
          <Button onClick={addCertification} variant="outline" className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            {t('forms.certifications.addAnother')}
          </Button>
        </>
      )}
      <div className="bg-blue-50 p-4 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>{t('forms.certifications.tips.title')}</strong> {t('forms.certifications.tips.description')}
        </p>
      </div>
    </div>
  )
}