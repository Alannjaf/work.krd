import React from 'react'
import { View, Text, Link } from '@react-pdf/renderer'
import { styles } from '../styles/pdfStyles'
import { skillsStyles } from '../styles/skillsStyles'
import { experienceStyles } from '../styles/experienceStyles'
import { kurdishStyles, kurdishSkillsStyles, kurdishExperienceStyles } from '../styles/kurdishModernStyles'
import { ResumeData, WorkExperience } from '../../../types/resume'
import { formatDate, formatDateRange } from '../utils/dateUtils'
import { parseHtmlToPdf } from '../utils/htmlToPdfParser'

const formatKurdishDateRange = (startDate: string | undefined, endDate: string | undefined, current: boolean) => {
  const start = formatDate(startDate || '')
  const end = current ? 'ئێستا' : formatDate(endDate || '')
  return `${end} - ${start}`
}

interface RightColumnProps {
  data: ResumeData
  experiences: WorkExperience[]
  isRTL?: boolean
}

export const RightColumn: React.FC<RightColumnProps> = ({ data, experiences, isRTL = false }) => {
  const fmtRange = isRTL ? formatKurdishDateRange : formatDateRange
  const ex = isRTL ? kurdishExperienceStyles : experienceStyles

  return (
    <View style={isRTL ? kurdishStyles.mainColumn : styles.rightColumn}>
      {/* Summary Section */}
      {data.summary && (
        <View style={isRTL ? kurdishStyles.section : styles.section}>
          <Text style={isRTL ? kurdishStyles.sectionTitle : styles.sectionTitle}>
            {isRTL ? 'پوختەی پیشەیی' : 'Professional Summary'}
          </Text>
          <Text style={isRTL ? kurdishStyles.summary : styles.summary}>{data.summary}</Text>
        </View>
      )}

      {/* Experience Section */}
      {experiences.length > 0 && (
        <View style={isRTL ? kurdishStyles.section : styles.section}>
          {experiences.map((exp, index) => {
            if (index === 0) {
              return (
                <View
                  key={exp.id}
                  style={[
                    ex.experienceItem,
                    index === experiences.length - 1 ? { borderBottom: 'none' } : {}
                  ]}
                >
                  <View wrap={false}>
                    <Text style={isRTL ? kurdishStyles.sectionTitle : styles.sectionTitle}>
                      {isRTL ? 'ئەزموونی کار' : 'Professional Experience'}
                    </Text>
                    <View style={ex.experienceHeader}>
                      <View style={{ flex: 1, minWidth: 0 }}>
                        <Text style={ex.jobTitle}>{exp.jobTitle}</Text>
                        <Text style={ex.company}>{exp.company}</Text>
                        <Text style={ex.jobLocation}>{exp.location}</Text>
                      </View>
                      <Text style={ex.duration}>
                        {fmtRange(exp.startDate, exp.endDate, exp.current)}
                      </Text>
                    </View>
                  </View>
                  {exp.description && (
                    <View style={{ marginTop: 6 }}>
                      {parseHtmlToPdf(exp.description, ex).elements}
                    </View>
                  )}
                </View>
              )
            } else {
              return (
                <View
                  key={exp.id}
                  style={[
                    ex.experienceItem,
                    index === experiences.length - 1 ? { borderBottom: 'none' } : {}
                  ]}
                  wrap={false}
                >
                  <View style={ex.experienceHeader}>
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text style={ex.jobTitle}>{exp.jobTitle}</Text>
                      <Text style={ex.company}>{exp.company}</Text>
                      <Text style={ex.jobLocation}>{exp.location}</Text>
                    </View>
                    <Text style={ex.duration}>
                      {fmtRange(exp.startDate, exp.endDate, exp.current)}
                    </Text>
                  </View>
                  {exp.description && (
                    <View style={{ marginTop: 6 }}>
                      {parseHtmlToPdf(exp.description, ex).elements}
                    </View>
                  )}
                </View>
              )
            }
          })}
        </View>
      )}

      {/* Projects Section */}
      {data.projects && data.projects.length > 0 && (
        <View style={isRTL ? kurdishStyles.section : styles.section}>
          <Text style={isRTL ? kurdishStyles.sectionTitle : styles.sectionTitle}>
            {isRTL ? 'پرۆژەکان' : 'Notable Projects'}
          </Text>
          {data.projects.map((project) => (
            <View
              key={project.id}
              style={isRTL ? kurdishSkillsStyles.projectItem : skillsStyles.projectItem}
              wrap={false}
            >
              <Text style={isRTL ? kurdishSkillsStyles.projectName : skillsStyles.projectName}>
                {project.name}
              </Text>
              {project.description && (
                <View style={{ marginTop: 2 }}>
                  {parseHtmlToPdf(project.description, isRTL ? kurdishSkillsStyles : skillsStyles).elements}
                </View>
              )}
              {project.technologies && (
                <Text style={isRTL ? kurdishSkillsStyles.projectTech : skillsStyles.projectTech}>
                  {isRTL ? 'تەکنەلۆژیاکان' : 'Technologies'}: {project.technologies}
                </Text>
              )}
              {project.link && (
                <Link src={project.link} style={isRTL ? kurdishSkillsStyles.projectLink : skillsStyles.projectLink}>
                  {isRTL ? 'بینینی پرۆژە' : 'View Project'}
                </Link>
              )}
            </View>
          ))}
        </View>
      )}
    </View>
  )
}
