import { Text, View, Image } from '@react-pdf/renderer'
import { PersonalInfo } from '@/types/resume'
import { elegantStyles } from '../styles/elegantStyles'
import { hasDemographics, buildDemographicsItems } from '@/lib/pdf-helpers'

interface ElegantHeaderProps {
  personal: PersonalInfo
}

export const ElegantHeader = ({ personal }: ElegantHeaderProps) => {
  const contactItems = [
    personal.email,
    personal.phone,
    personal.location,
    personal.website
  ].filter(Boolean)

  return (
    <View style={elegantStyles.header}>
      {/* Profile photo at the top if exists */}
      {personal.profileImage && (
        <View style={elegantStyles.photoContainer}>
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <Image 
            src={personal.profileImage} 
            style={elegantStyles.profilePhoto}
          />
        </View>
      )}
      
      {/* Full Name */}
      <Text style={elegantStyles.name}>{personal.fullName}</Text>
      
      {/* Job Title */}
      {personal.title && (
        <Text style={elegantStyles.title}>{personal.title}</Text>
      )}
      
      {/* Contact Information */}
      {contactItems.length > 0 && (
        <View style={elegantStyles.contactInfo}>
          {contactItems.map((item, index) => (
            <View key={index} style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={elegantStyles.contactItem}>{item}</Text>
              {index < contactItems.length - 1 && (
                <Text style={elegantStyles.contactSeparator}>•</Text>
              )}
            </View>
          ))}
        </View>
      )}

      {/* Optional Demographics */}
      {hasDemographics(personal) && (
        <View style={elegantStyles.demographicsInfo}>
          {buildDemographicsItems(personal, { maritalLabel: 'Marital Status' }).map((item, index, array) => (
            <View key={index} style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={elegantStyles.demographicItem}>{item}</Text>
              {index < array.length - 1 && (
                <Text style={elegantStyles.contactSeparator}>•</Text>
              )}
            </View>
          ))}
        </View>
      )}
    </View>
  )
}