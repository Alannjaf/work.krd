import React from 'react'
import { View, Text } from '@react-pdf/renderer'
import { styles } from '../styles/pdfStyles'
import { skillsStyles } from '../styles/skillsStyles'
import { experienceStyles } from '../styles/experienceStyles'
import { ResumeData } from '../../../types/resume'
import { formatDate, formatDateRange } from '../utils/dateUtils'
import { parseHtmlToPdf } from '../utils/htmlToPdfParser'

interface LeftColumnProps {
  data: ResumeData
}

export const LeftColumn: React.FC<LeftColumnProps> = ({ data }) => {
  return (
    <View style={styles.leftColumn}>
      {/* Skills Section */}
      {data.skills && data.skills.length > 0 && (
        <View wrap={false} style={styles.section}>
          <Text style={styles.leftSectionTitle}>Technical Skills</Text>
          <View style={skillsStyles.skillsContainer}>
            {data.skills.map((skill) => (
              <Text key={skill.id} style={skillsStyles.skillItem}>
                {skill.name}
              </Text>
            ))}
          </View>
        </View>
      )}

      {/* Languages Section */}
      {data.languages && data.languages.length > 0 && (
        <View wrap={false} style={styles.section}>
          <Text style={styles.leftSectionTitle}>Languages</Text>
          {data.languages.map((language) => (
            <View key={language.id} style={skillsStyles.languageItem}>
              <Text style={skillsStyles.languageName}>{language.name}</Text>
              <Text style={skillsStyles.languageLevel}>{language.proficiency || 'Basic'}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Education Section */}
      {data.education && data.education.length > 0 && (
        <View wrap={false} style={styles.section}>
          <Text style={styles.leftSectionTitle}>Education</Text>
          {data.education.map((edu) => (
            <View key={edu.id} style={experienceStyles.educationItem}>
              <Text style={experienceStyles.degree}>{edu.degree}</Text>
              {edu.field && <Text style={experienceStyles.fieldOfStudy}>{edu.field}</Text>}
              <Text style={experienceStyles.school}>{edu.school}</Text>
              <View style={experienceStyles.educationMeta}>
                <Text>{edu.location}</Text>
                <Text>{formatDateRange(edu.startDate, edu.endDate, false)}</Text>
              </View>
              {edu.gpa && (
                <Text style={experienceStyles.gpa}>GPA: {edu.gpa}</Text>
              )}
              {edu.achievements && (
                <View style={{ marginTop: 4 }}>
                  {parseHtmlToPdf(edu.achievements, { 
                    text: { fontSize: 9, color: '#4b5563', lineHeight: 1.4 }
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
          <Text style={styles.leftSectionTitle}>Certifications</Text>
          {data.certifications.map((cert) => (
            <View key={cert.id} style={skillsStyles.certificationItem}>
              <Text style={skillsStyles.certificationName}>{cert.name}</Text>
              <Text style={skillsStyles.certificationIssuer}>{cert.issuer}</Text>
              {cert.date && (
                <Text style={skillsStyles.certificationDate}>
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