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
        title={t('forms.personalInfo.aboutYou.title')}
        description={t('forms.personalInfo.aboutYou.description')}
      />

      {/* Full Name */}
      <div>
        <label htmlFor="personal-fullName" className="block text-sm font-medium text-gray-700 mb-1">
          {t('forms.personalInfo.fields.fullName')} <span className="text-red-500">*</span>
        </label>
        <FormInput
          id="personal-fullName"
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
        <label htmlFor="personal-title" className="block text-sm font-medium text-gray-700 mb-1">
          {t('forms.personalInfo.fields.professionalTitle')} <span className="text-red-500">*</span>
        </label>
        <FormInput
          id="personal-title"
          value={formData.personal.title || ''}
          onChange={(e) => updatePersonalField('title', e.target.value)}
          placeholder={t('forms.personalInfo.placeholders.professionalTitle')}
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
          <label htmlFor="personal-email" className="block text-sm font-medium text-gray-700 mb-1">
            {t('forms.personalInfo.fields.email')} <span className="text-red-500">*</span>
          </label>
          <FormInput
            id="personal-email"
            type="email"
            value={formData.personal.email}
            onChange={(e) => updatePersonalField('email', e.target.value)}
            placeholder={t('forms.personalInfo.placeholders.email')}
            required
            className="rounded-lg"
          />
        </div>
        <div>
          <label htmlFor="personal-phone" className="block text-sm font-medium text-gray-700 mb-1">
            {t('forms.personalInfo.fields.phone')} <span className="text-red-500">*</span>
          </label>
          <Input
            id="personal-phone"
            value={formData.personal.phone}
            onChange={(e) => updatePersonalField('phone', e.target.value)}
            placeholder={t('forms.personalInfo.placeholders.phone')}
            className="rounded-lg"
          />
        </div>
      </div>

      {/* Collapsible: Contact & Links */}
      <CollapsibleGroup title={t('forms.personalInfo.contactAndLinks.title')} subtitle={t('forms.personalInfo.contactAndLinks.subtitle')}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="personal-location" className="block text-sm font-medium text-gray-700 mb-1">
              {t('forms.personalInfo.fields.location')}
            </label>
            <Input
              id="personal-location"
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
            <label htmlFor="personal-linkedin" className="block text-sm font-medium text-gray-700 mb-1">
              {t('forms.personalInfo.fields.linkedin')}
            </label>
            <Input
              id="personal-linkedin"
              value={formData.personal.linkedin || ''}
              onChange={(e) => updatePersonalField('linkedin', e.target.value)}
              placeholder={t('forms.personalInfo.placeholders.linkedin')}
              className="rounded-lg"
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="personal-website" className="block text-sm font-medium text-gray-700 mb-1">
              {t('forms.personalInfo.fields.website')}
            </label>
            <Input
              id="personal-website"
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
        subtitle={t('forms.personalInfo.demographics.subtitle')}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="personal-dateOfBirth" className="block text-sm font-medium text-gray-700 mb-1">
              {t('forms.personalInfo.demographics.dateOfBirth')}
            </label>
            <Input
              id="personal-dateOfBirth"
              type="date"
              value={formData.personal.dateOfBirth || ''}
              onChange={(e) => updatePersonalField('dateOfBirth', e.target.value)}
              className="rounded-lg"
            />
          </div>
          <div>
            <label htmlFor="personal-gender" className="block text-sm font-medium text-gray-700 mb-1">
              {t('forms.personalInfo.demographics.gender')}
            </label>
            <select
              id="personal-gender"
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
            <label htmlFor="personal-nationality" className="block text-sm font-medium text-gray-700 mb-1">
              {t('forms.personalInfo.demographics.nationality')}
            </label>
            <Input
              id="personal-nationality"
              placeholder={t('forms.personalInfo.demographics.nationalityPlaceholder')}
              value={formData.personal.nationality || ''}
              onChange={(e) => updatePersonalField('nationality', e.target.value)}
              className="rounded-lg"
            />
            <TranslateAndEnhanceButton
              content={formData.personal.nationality || ''}
              contentType="personal"
              onAccept={(result) => updatePersonalField('nationality', result)}
            />
          </div>
          <div>
            <label htmlFor="personal-maritalStatus" className="block text-sm font-medium text-gray-700 mb-1">
              {t('forms.personalInfo.demographics.maritalStatus')}
            </label>
            <select
              id="personal-maritalStatus"
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
            <label htmlFor="personal-country" className="block text-sm font-medium text-gray-700 mb-1">
              {t('forms.personalInfo.demographics.country')}
            </label>
            <Input
              id="personal-country"
              placeholder={t('forms.personalInfo.demographics.countryPlaceholder')}
              value={formData.personal.country || ''}
              onChange={(e) => updatePersonalField('country', e.target.value)}
              className="rounded-lg"
            />
            <TranslateAndEnhanceButton
              content={formData.personal.country || ''}
              contentType="personal"
              onAccept={(result) => updatePersonalField('country', result)}
            />
          </div>
        </div>
      </CollapsibleGroup>
    </div>
  )
}
