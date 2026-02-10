'use client'

import { FormInput } from '@/components/ui/form-input'
import { Input } from '@/components/ui/input'
import { TranslateAndEnhanceButton } from '@/components/ai/TranslateAndEnhanceButton'
import { useLanguage } from '@/contexts/LanguageContext'
import ImageUploader from '@/components/resume-builder/ImageUploader'
import { ResumeData } from '@/types/resume'
import { SubscriptionPermissions } from '@/types/subscription'
import { SectionHeader } from '@/components/resume-builder/shared/SectionHeader'
import { CollapsibleGroup } from '@/components/resume-builder/shared/CollapsibleGroup'

interface PersonalInfoSectionProps {
  formData: ResumeData
  updatePersonalField: (field: string, value: string) => void
  setFormData: (data: ResumeData) => void
  checkPermission?: (permission: keyof SubscriptionPermissions) => boolean
}

export function PersonalInfoSection({
  formData,
  updatePersonalField,
  setFormData,
  checkPermission
}: PersonalInfoSectionProps) {
  const { t } = useLanguage()

  return (
    <div className="space-y-6">
      <SectionHeader
        title="About You"
        description="Basic information that appears at the top of your resume"
      />

      {/* Full Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('forms.personalInfo.fields.fullName')} <span className="text-red-500">*</span>
        </label>
        <FormInput
          value={formData.personal.fullName}
          onChange={(e) => updatePersonalField('fullName', e.target.value)}
          placeholder={t('forms.personalInfo.placeholders.fullName')}
          required
          className="rounded-lg"
        />
        <TranslateAndEnhanceButton
          content={formData.personal.fullName}
          contentType="personal"
          onAccept={(enhancedName) => updatePersonalField('fullName', enhancedName)}
        />
      </div>

      {/* Professional Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('forms.personalInfo.fields.professionalTitle')} <span className="text-red-500">*</span>
        </label>
        <FormInput
          value={formData.personal.title || ''}
          onChange={(e) => updatePersonalField('title', e.target.value)}
          placeholder="e.g., Senior Software Engineer"
          className="rounded-lg"
        />
        <TranslateAndEnhanceButton
          content={formData.personal.title || ''}
          contentType="personal"
          onAccept={(enhancedTitle) => updatePersonalField('title', enhancedTitle)}
        />
      </div>

      {/* Profile Photo */}
      {checkPermission && checkPermission('canUploadPhoto') && (
        <ImageUploader
          currentImage={formData.personal.profileImage}
          originalImage={formData.personal.originalProfileImage}
          cropData={formData.personal.profileImageCrop}
          onImageUpload={(imageDataUrl, originalImage) => {
            setFormData({
              ...formData,
              personal: {
                ...formData.personal,
                profileImage: imageDataUrl,
                originalProfileImage: originalImage || imageDataUrl
              }
            })
          }}
          onImageRemove={() => {
            setFormData({
              ...formData,
              personal: {
                ...formData.personal,
                profileImage: undefined,
                originalProfileImage: undefined,
                profileImageCrop: undefined
              }
            })
          }}
          onCropUpdate={(croppedImage, cropData) => {
            setFormData({
              ...formData,
              personal: {
                ...formData.personal,
                profileImage: croppedImage,
                profileImageCrop: cropData
              }
            })
          }}
        />
      )}

      {/* Email + Phone - always visible */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('forms.personalInfo.fields.email')} <span className="text-red-500">*</span>
          </label>
          <FormInput
            type="email"
            value={formData.personal.email}
            onChange={(e) => updatePersonalField('email', e.target.value)}
            placeholder={t('forms.personalInfo.placeholders.email')}
            required
            className="rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('forms.personalInfo.fields.phone')} <span className="text-red-500">*</span>
          </label>
          <Input
            value={formData.personal.phone}
            onChange={(e) => updatePersonalField('phone', e.target.value)}
            placeholder={t('forms.personalInfo.placeholders.phone')}
            className="rounded-lg"
          />
        </div>
      </div>

      {/* Collapsible: Contact & Links */}
      <CollapsibleGroup title="Contact & Links" subtitle="Location, LinkedIn, website">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('forms.personalInfo.fields.location')}
            </label>
            <Input
              value={formData.personal.location}
              onChange={(e) => updatePersonalField('location', e.target.value)}
              placeholder={t('forms.personalInfo.placeholders.location')}
              className="rounded-lg"
            />
            <TranslateAndEnhanceButton
              content={formData.personal.location || ''}
              contentType="personal"
              onAccept={(enhancedLocation) => updatePersonalField('location', enhancedLocation)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('forms.personalInfo.fields.linkedin')}
            </label>
            <Input
              value={formData.personal.linkedin || ''}
              onChange={(e) => updatePersonalField('linkedin', e.target.value)}
              placeholder={t('forms.personalInfo.placeholders.linkedin')}
              className="rounded-lg"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('forms.personalInfo.fields.website')}
            </label>
            <Input
              value={formData.personal.website || ''}
              onChange={(e) => updatePersonalField('website', e.target.value)}
              placeholder={t('forms.personalInfo.placeholders.website')}
              className="rounded-lg"
            />
          </div>
        </div>
      </CollapsibleGroup>

      {/* Collapsible: Demographics */}
      <CollapsibleGroup
        title={t('forms.personalInfo.demographics.title')}
        subtitle="Common in Middle East/Europe resumes"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('forms.personalInfo.demographics.dateOfBirth')}
            </label>
            <Input
              type="date"
              value={formData.personal.dateOfBirth || ''}
              onChange={(e) => updatePersonalField('dateOfBirth', e.target.value)}
              className="rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('forms.personalInfo.demographics.gender')}
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
              value={formData.personal.gender || ''}
              onChange={(e) => updatePersonalField('gender', e.target.value)}
            >
              <option value="">{t('forms.personalInfo.demographics.selectGender')}</option>
              <option value="male">{t('forms.personalInfo.demographics.male')}</option>
              <option value="female">{t('forms.personalInfo.demographics.female')}</option>
              <option value="other">{t('forms.personalInfo.demographics.other')}</option>
              <option value="prefer-not-to-say">{t('forms.personalInfo.demographics.preferNotToSay')}</option>
            </select>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">
                {t('forms.personalInfo.demographics.nationality')}
              </label>
              <TranslateAndEnhanceButton
                content={formData.personal.nationality || ''}
                contentType="personal"
                onAccept={(result) => updatePersonalField('nationality', result)}
              />
            </div>
            <Input
              placeholder={t('forms.personalInfo.demographics.nationalityPlaceholder')}
              value={formData.personal.nationality || ''}
              onChange={(e) => updatePersonalField('nationality', e.target.value)}
              className="rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('forms.personalInfo.demographics.maritalStatus')}
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
              value={formData.personal.maritalStatus || ''}
              onChange={(e) => updatePersonalField('maritalStatus', e.target.value)}
            >
              <option value="">{t('forms.personalInfo.demographics.selectMaritalStatus')}</option>
              <option value="single">{t('forms.personalInfo.demographics.single')}</option>
              <option value="married">{t('forms.personalInfo.demographics.married')}</option>
              <option value="divorced">{t('forms.personalInfo.demographics.divorced')}</option>
              <option value="widowed">{t('forms.personalInfo.demographics.widowed')}</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">
                {t('forms.personalInfo.demographics.country')}
              </label>
              <TranslateAndEnhanceButton
                content={formData.personal.country || ''}
                contentType="personal"
                onAccept={(result) => updatePersonalField('country', result)}
              />
            </div>
            <Input
              placeholder={t('forms.personalInfo.demographics.countryPlaceholder')}
              value={formData.personal.country || ''}
              onChange={(e) => updatePersonalField('country', e.target.value)}
              className="rounded-lg"
            />
          </div>
        </div>
      </CollapsibleGroup>
    </div>
  )
}
