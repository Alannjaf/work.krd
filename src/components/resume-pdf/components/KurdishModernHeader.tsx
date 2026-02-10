import React from 'react'
import { View, Text, Image, Link } from '@react-pdf/renderer'
import { kurdishStyles } from '../styles/kurdishModernStyles'
import { PersonalInfo } from '../../../types/resume'
import { hasDemographics } from '@/lib/pdf-helpers'
import { formatFullDate } from '../utils/dateUtils'

interface KurdishModernHeaderProps {
  personal: PersonalInfo
}

export const KurdishModernHeader: React.FC<KurdishModernHeaderProps> = ({ personal }) => {
  return (
    <View style={kurdishStyles.header}>
      {/* RTL: photo on right edge (first in row-reverse) */}
      {personal.profileImage && (
        <View style={kurdishStyles.profileImageContainer}>
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <Image
            src={personal.profileImage}
            style={kurdishStyles.profileImage}
          />
        </View>
      )}
      <View style={[kurdishStyles.headerText, ...(!personal.profileImage ? [kurdishStyles.headerTextNoPhoto] : [])]}>
        <Text style={kurdishStyles.name}>{personal.fullName}</Text>
        {personal.title && <Text style={kurdishStyles.title}>{personal.title}</Text>}
        <View style={kurdishStyles.contactInfo}>
          <Text style={kurdishStyles.contactItem}>{personal.email}</Text>
          <Text style={kurdishStyles.contactItem}>{personal.phone}</Text>
          <Text style={kurdishStyles.contactItem}>{personal.location}</Text>
          {personal.linkedin && (
            <Link src={personal.linkedin} style={kurdishStyles.contactItem}>
              هەژماری لینکدئین
            </Link>
          )}
          {personal.website && (
            <Link src={personal.website} style={kurdishStyles.contactItem}>
              پۆرتفۆلیۆ
            </Link>
          )}
        </View>
        {/* Demographics with Kurdish labels */}
        {hasDemographics(personal) && (
          <View style={kurdishStyles.demographicsInfo}>
            {personal.dateOfBirth && (
              <Text style={kurdishStyles.demographicItem}>لەدایکبوون: {formatFullDate(personal.dateOfBirth)}</Text>
            )}
            {personal.gender && (
              <Text style={kurdishStyles.demographicItem}>ڕەگەز: {personal.gender}</Text>
            )}
            {personal.nationality && (
              <Text style={kurdishStyles.demographicItem}>نەتەوە: {personal.nationality}</Text>
            )}
            {personal.maritalStatus && (
              <Text style={kurdishStyles.demographicItem}>باری خێزانی: {personal.maritalStatus}</Text>
            )}
            {personal.country && (
              <Text style={kurdishStyles.demographicItem}>وڵات: {personal.country}</Text>
            )}
          </View>
        )}
      </View>
    </View>
  )
}
