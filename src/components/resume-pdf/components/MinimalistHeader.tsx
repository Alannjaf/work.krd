import { Text, View, Image } from '@react-pdf/renderer'
import { PersonalInfo } from '@/types/resume'
import { minimalistStyles } from '../styles/minimalistStyles'
import { hasDemographics, buildDemographicsItems } from '@/lib/pdf-helpers'

interface MinimalistHeaderProps {
  personal: PersonalInfo
}

export const MinimalistHeader = ({ personal }: MinimalistHeaderProps) => {
  const contactItems = [
    personal.email,
    personal.phone,
    personal.location,
    personal.website
  ].filter(Boolean)

  return (
    <View style={minimalistStyles.header}>
      {/* Profile photo at the top if exists */}
      {personal.profileImage && (
        <View style={minimalistStyles.photoContainer}>
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <Image 
            src={personal.profileImage} 
            style={minimalistStyles.profilePhoto}
          />
        </View>
      )}
      
      {/* Full Name */}
      <Text style={minimalistStyles.name}>{personal.fullName}</Text>
      
      {/* Job Title */}
      {personal.title && (
        <Text style={minimalistStyles.title}>{personal.title}</Text>
      )}
      
      {/* Contact Information */}
      {contactItems.length > 0 && (
        <View style={minimalistStyles.contactInfo}>
          {contactItems.map((item, index) => (
            <View key={index} style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={minimalistStyles.contactItem}>{item}</Text>
              {index < contactItems.length - 1 && (
                <Text style={minimalistStyles.contactSeparator}>|</Text>
              )}
            </View>
          ))}
        </View>
      )}

      {/* Optional Demographics */}
      {hasDemographics(personal) && (
        <View style={minimalistStyles.demographicsInfo}>
          {buildDemographicsItems(personal, { maritalLabel: 'Marital Status' }).map((item, index, array) => (
            <View key={index} style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={minimalistStyles.demographicItem}>{item}</Text>
              {index < array.length - 1 && (
                <Text style={minimalistStyles.contactSeparator}>|</Text>
              )}
            </View>
          ))}
        </View>
      )}
    </View>
  )
}