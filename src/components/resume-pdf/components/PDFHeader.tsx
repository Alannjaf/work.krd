import React from 'react'
import { View, Text, Image, Link } from '@react-pdf/renderer'
import { styles } from '../styles/pdfStyles'
import { kurdishStyles } from '../styles/kurdishModernStyles'
import { PersonalInfo } from '../../../types/resume'
import { hasDemographics } from '@/lib/pdf-helpers'
import { formatFullDate } from '../utils/dateUtils'

interface PDFHeaderProps {
  personal: PersonalInfo
  isRTL?: boolean
}

export const PDFHeader: React.FC<PDFHeaderProps> = ({ personal, isRTL = false }) => {
  const s = isRTL ? kurdishStyles : styles

  return (
    <View style={s.header}>
      {/* Profile image — in RTL row-reverse puts it on the right edge */}
      {personal.profileImage && (
        <View style={s.profileImageContainer}>
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <Image
            src={personal.profileImage}
            style={s.profileImage}
          />
        </View>
      )}
      <View style={[s.headerText, ...(!personal.profileImage ? [s.headerTextNoPhoto] : [])]}>
        <Text style={s.name}>{personal.fullName}</Text>
        {personal.title && <Text style={s.title}>{personal.title}</Text>}
        <View style={s.contactInfo}>
          <Text style={s.contactItem}>{personal.email}</Text>
          <Text style={s.contactItem}>{personal.phone}</Text>
          <Text style={s.contactItem}>{personal.location}</Text>
          {personal.linkedin && (
            <Link src={personal.linkedin} style={s.contactItem}>
              {isRTL ? 'هەژماری لینکدئین' : 'LinkedIn Profile'}
            </Link>
          )}
          {personal.website && (
            <Link src={personal.website} style={s.contactItem}>
              {isRTL ? 'پۆرتفۆلیۆ' : 'Portfolio'}
            </Link>
          )}
        </View>
        {/* Optional Demographics */}
        {hasDemographics(personal) && (
          <View style={s.demographicsInfo}>
            {personal.dateOfBirth && (
              <Text style={s.demographicItem}>
                {isRTL ? 'لەدایکبوون' : 'Born'}: {formatFullDate(personal.dateOfBirth)}
              </Text>
            )}
            {personal.gender && (
              <Text style={s.demographicItem}>
                {isRTL ? 'ڕەگەز' : 'Gender'}: {personal.gender}
              </Text>
            )}
            {personal.nationality && (
              <Text style={s.demographicItem}>
                {isRTL ? 'نەتەوە' : 'Nationality'}: {personal.nationality}
              </Text>
            )}
            {personal.maritalStatus && (
              <Text style={s.demographicItem}>
                {isRTL ? 'باری خێزانی' : 'Marital Status'}: {personal.maritalStatus}
              </Text>
            )}
            {personal.country && (
              <Text style={s.demographicItem}>
                {isRTL ? 'وڵات' : 'Country'}: {personal.country}
              </Text>
            )}
          </View>
        )}
      </View>
    </View>
  )
}
