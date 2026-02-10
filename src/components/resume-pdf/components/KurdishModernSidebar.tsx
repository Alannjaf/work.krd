import React from 'react'
import { View, Text } from '@react-pdf/renderer'
import { kurdishStyles, kurdishSkillsStyles, kurdishExperienceStyles } from '../styles/kurdishModernStyles'
import { ResumeData } from '../../../types/resume'
import { formatDate } from '../utils/dateUtils'
import { parseHtmlToPdf } from '../utils/htmlToPdfParser'

/**
 * Format a date range with Kurdish "ئێستا" instead of English "Present"
 */
const formatKurdishDateRange = (startDate: string | undefined, endDate: string | undefined, current: boolean) => {
  const start = formatDate(startDate || '')
  const end = current ? 'ئێستا' : formatDate(endDate || '')
  return `${end} - ${start}`
}

interface KurdishModernSidebarProps {
  data: ResumeData
}

/**
 * Right-side sidebar for the Kurdish RTL template.
 * Contains: Skills, Languages, Education, Certifications
 */
export const KurdishModernSidebar: React.FC<KurdishModernSidebarProps> = ({ data }) => {
  return (
    <View style={kurdishStyles.sidebarColumn}>
      {/* Skills Section - توانایەکان */}
      {data.skills && data.skills.length > 0 && (
        <View wrap={false} style={kurdishStyles.section}>
          <Text style={kurdishStyles.sidebarSectionTitle}>توانایەکان</Text>
          <View style={kurdishSkillsStyles.skillsContainer}>
            {data.skills.map((skill) => (
              <Text key={skill.id} style={kurdishSkillsStyles.skillItem}>
                {skill.name}
              </Text>
            ))}
          </View>
        </View>
      )}

      {/* Languages Section - زمانەکان */}
      {data.languages && data.languages.length > 0 && (
        <View wrap={false} style={kurdishStyles.section}>
          <Text style={kurdishStyles.sidebarSectionTitle}>زمانەکان</Text>
          {data.languages.map((language) => (
            <View key={language.id} style={kurdishSkillsStyles.languageItem}>
              <Text style={kurdishSkillsStyles.languageName}>{language.name}</Text>
              <Text style={kurdishSkillsStyles.languageLevel}>{language.proficiency || 'بنەڕەتی'}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Education Section - خوێندن */}
      {data.education && data.education.length > 0 && (
        <View wrap={false} style={kurdishStyles.section}>
          <Text style={kurdishStyles.sidebarSectionTitle}>خوێندن</Text>
          {data.education.map((edu) => (
            <View key={edu.id} style={kurdishExperienceStyles.educationItem}>
              <Text style={kurdishExperienceStyles.degree}>{edu.degree}</Text>
              {edu.field && <Text style={kurdishExperienceStyles.fieldOfStudy}>{edu.field}</Text>}
              <Text style={kurdishExperienceStyles.school}>{edu.school}</Text>
              <View style={kurdishExperienceStyles.educationMeta}>
                <Text>{edu.location}</Text>
                <Text>{formatKurdishDateRange(edu.startDate, edu.endDate, false)}</Text>
              </View>
              {edu.gpa && (
                <Text style={kurdishExperienceStyles.gpa}>نمرەی کۆی گشتی: {edu.gpa}</Text>
              )}
              {edu.achievements && (
                <View style={{ marginTop: 4 }}>
                  {parseHtmlToPdf(edu.achievements, {
                    text: { fontSize: 9, color: '#4b5563', lineHeight: 1.4, textAlign: 'right' as const }
                  }).elements}
                </View>
              )}
            </View>
          ))}
        </View>
      )}

      {/* Certifications Section - بڕوانامەکان */}
      {data.certifications && data.certifications.length > 0 && (
        <View wrap={false} style={kurdishStyles.section}>
          <Text style={kurdishStyles.sidebarSectionTitle}>بڕوانامەکان</Text>
          {data.certifications.map((cert) => (
            <View key={cert.id} style={kurdishSkillsStyles.certificationItem}>
              <Text style={kurdishSkillsStyles.certificationName}>{cert.name}</Text>
              <Text style={kurdishSkillsStyles.certificationIssuer}>{cert.issuer}</Text>
              {cert.date && (
                <Text style={kurdishSkillsStyles.certificationDate}>
                  {formatDate(cert.date)}
                </Text>
              )}
            </View>
          ))}
        </View>
      )}
    </View>
  )
}
