import React from 'react'
import { View, Text } from '@react-pdf/renderer'
import { styles } from '../styles/pdfStyles'
import { skillsStyles } from '../styles/skillsStyles'
import { experienceStyles } from '../styles/experienceStyles'
import { kurdishStyles, kurdishSkillsStyles, kurdishExperienceStyles } from '../styles/kurdishModernStyles'
import { ResumeData } from '../../../types/resume'
import { formatDate, formatDateRange } from '../utils/dateUtils'
import { parseHtmlToPdf } from '../utils/htmlToPdfParser'

const formatKurdishDateRange = (startDate: string | undefined, endDate: string | undefined, current: boolean) => {
  const start = formatDate(startDate || '')
  const end = current ? 'ئێستا' : formatDate(endDate || '')
  return `${end} - ${start}`
}

interface LeftColumnProps {
  data: ResumeData
  isRTL?: boolean
}

export const LeftColumn: React.FC<LeftColumnProps> = ({ data, isRTL = false }) => {
  return (
    <View style={isRTL ? kurdishStyles.sidebarColumn : styles.leftColumn}>
      {/* Skills Section */}
      {data.skills && data.skills.length > 0 && (
        <View wrap={false} style={styles.section}>
          <Text style={isRTL ? kurdishStyles.sidebarSectionTitle : styles.leftSectionTitle}>
            {isRTL ? 'توانایەکان' : 'Technical Skills'}
          </Text>
          <View style={isRTL ? kurdishSkillsStyles.skillsContainer : skillsStyles.skillsContainer}>
            {data.skills.map((skill) => (
              <Text key={skill.id} style={isRTL ? kurdishSkillsStyles.skillItem : skillsStyles.skillItem}>
                {skill.name}
              </Text>
            ))}
          </View>
        </View>
      )}

      {/* Languages Section */}
      {data.languages && data.languages.length > 0 && (
        <View wrap={false} style={styles.section}>
          <Text style={isRTL ? kurdishStyles.sidebarSectionTitle : styles.leftSectionTitle}>
            {isRTL ? 'زمانەکان' : 'Languages'}
          </Text>
          {data.languages.map((language) => (
            <View key={language.id} style={isRTL ? kurdishSkillsStyles.languageItem : skillsStyles.languageItem}>
              <Text style={isRTL ? kurdishSkillsStyles.languageName : skillsStyles.languageName}>
                {language.name}
              </Text>
              <Text style={isRTL ? kurdishSkillsStyles.languageLevel : skillsStyles.languageLevel}>
                {language.proficiency || (isRTL ? 'بنەڕەتی' : 'Basic')}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Education Section */}
      {data.education && data.education.length > 0 && (
        <View wrap={false} style={styles.section}>
          <Text style={isRTL ? kurdishStyles.sidebarSectionTitle : styles.leftSectionTitle}>
            {isRTL ? 'خوێندن' : 'Education'}
          </Text>
          {data.education.map((edu) => (
            <View key={edu.id} style={isRTL ? kurdishExperienceStyles.educationItem : experienceStyles.educationItem}>
              <Text style={isRTL ? kurdishExperienceStyles.degree : experienceStyles.degree}>
                {edu.degree}
              </Text>
              {edu.field && (
                <Text style={isRTL ? kurdishExperienceStyles.fieldOfStudy : experienceStyles.fieldOfStudy}>
                  {edu.field}
                </Text>
              )}
              <Text style={isRTL ? kurdishExperienceStyles.school : experienceStyles.school}>
                {edu.school}
              </Text>
              <View style={isRTL ? kurdishExperienceStyles.educationMeta : experienceStyles.educationMeta}>
                <Text>{edu.location}</Text>
                <Text>
                  {isRTL
                    ? formatKurdishDateRange(edu.startDate, edu.endDate, false)
                    : formatDateRange(edu.startDate, edu.endDate, false)}
                </Text>
              </View>
              {edu.gpa && (
                <Text style={isRTL ? kurdishExperienceStyles.gpa : experienceStyles.gpa}>
                  {isRTL ? 'نمرەی کۆی گشتی' : 'GPA'}: {edu.gpa}
                </Text>
              )}
              {edu.achievements && (
                <View style={{ marginTop: 4 }}>
                  {parseHtmlToPdf(edu.achievements, {
                    text: {
                      fontSize: 9,
                      color: '#4b5563',
                      lineHeight: 1.4,
                      ...(isRTL ? { textAlign: 'right' as const } : {}),
                    },
                  }).elements}
                </View>
              )}
            </View>
          ))}
        </View>
      )}

      {/* Certifications Section */}
      {data.certifications && data.certifications.length > 0 && (
        <View wrap={false} style={styles.section}>
          <Text style={isRTL ? kurdishStyles.sidebarSectionTitle : styles.leftSectionTitle}>
            {isRTL ? 'بڕوانامەکان' : 'Certifications'}
          </Text>
          {data.certifications.map((cert) => (
            <View key={cert.id} style={isRTL ? kurdishSkillsStyles.certificationItem : skillsStyles.certificationItem}>
              <Text style={isRTL ? kurdishSkillsStyles.certificationName : skillsStyles.certificationName}>
                {cert.name}
              </Text>
              <Text style={isRTL ? kurdishSkillsStyles.certificationIssuer : skillsStyles.certificationIssuer}>
                {cert.issuer}
              </Text>
              {cert.date && (
                <Text style={isRTL ? kurdishSkillsStyles.certificationDate : skillsStyles.certificationDate}>
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
