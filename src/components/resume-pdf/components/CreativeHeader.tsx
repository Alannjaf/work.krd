import React from 'react'
import { View, Text, Image, Link } from '@react-pdf/renderer'
import { styles } from '../styles/creativeStyles'
import { PersonalInfo } from '../../../types/resume'
import { hasDemographics } from '@/lib/pdf-helpers'

interface CreativeHeaderProps {
  personal: PersonalInfo
}

export const CreativeHeader: React.FC<CreativeHeaderProps> = ({ personal }) => {
  return (
    <View style={styles.header}>
      <View style={styles.profileContainer}>
        {/* Profile Image with Creative Border - Only show if photo exists */}
        {personal.profileImage && (
          <View style={styles.profileImageWrapper}>
            <View style={styles.profileImageBorder}>
              {/* eslint-disable-next-line jsx-a11y/alt-text */}
              <Image 
                src={personal.profileImage} 
                style={styles.profileImage}
                  />
            </View>
          </View>
        )}

        {/* Name and Title Section */}
        <View style={styles.nameSection}>
          <Text style={styles.name}>{personal.fullName}</Text>
          {personal.title && (
            <Text style={styles.title}>{personal.title}</Text>
          )}
        </View>
      </View>

      {/* Contact Information Grid */}
      <View style={styles.contactGrid}>
        <Text style={styles.contactItem}>{personal.email}</Text>
        <Text style={styles.contactItem}>{personal.phone}</Text>
        <Text style={styles.contactItem}>{personal.location}</Text>
        {personal.linkedin && (
          <Link src={personal.linkedin} style={styles.contactItem}>
            LinkedIn
          </Link>
        )}
        {personal.website && (
          <Link src={personal.website} style={styles.contactItem}>
            Portfolio
          </Link>
        )}
      </View>

      {/* Optional Demographics */}
      {hasDemographics(personal) && (
        <View style={styles.demographicsGrid}>
          {personal.dateOfBirth && (
            <Text style={styles.demographicItem}>Born: {personal.dateOfBirth}</Text>
          )}
          {personal.gender && (
            <Text style={styles.demographicItem}>Gender: {personal.gender}</Text>
          )}
          {personal.nationality && (
            <Text style={styles.demographicItem}>Nationality: {personal.nationality}</Text>
          )}
          {personal.maritalStatus && (
            <Text style={styles.demographicItem}>Marital Status: {personal.maritalStatus}</Text>
          )}
          {personal.country && (
            <Text style={styles.demographicItem}>Country: {personal.country}</Text>
          )}
        </View>
      )}
    </View>
  )
}