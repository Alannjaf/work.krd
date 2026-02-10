import React from 'react'
import { View, Text, Link } from '@react-pdf/renderer'
import { kurdishStyles, kurdishExperienceStyles, kurdishSkillsStyles } from '../styles/kurdishModernStyles'
import { ResumeData, WorkExperience } from '../../../types/resume'
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

interface KurdishModernMainProps {
  data: ResumeData
  experiences: WorkExperience[]
}

/**
 * Left-side main content for the Kurdish RTL template.
 * Contains: Summary, Experience, Projects
 */
export const KurdishModernMain: React.FC<KurdishModernMainProps> = ({ data, experiences }) => {
  return (
    <View style={kurdishStyles.mainColumn}>
      {/* Summary Section - پوختەی پیشەیی */}
      {data.summary && (
        <View style={kurdishStyles.section}>
          <Text style={kurdishStyles.sectionTitle}>پوختەی پیشەیی</Text>
          <Text style={kurdishStyles.summary}>{data.summary}</Text>
        </View>
      )}

      {/* Experience Section - ئەزموونی کار */}
      {experiences.length > 0 && (
        <View style={kurdishStyles.section}>
          {experiences.map((exp, index) => {
            if (index === 0) {
              return (
                <View
                  key={exp.id}
                  style={[
                    kurdishExperienceStyles.experienceItem,
                    index === experiences.length - 1 ? { borderBottom: 'none' } : {}
                  ]}
                >
                  <View wrap={false}>
                    <Text style={kurdishStyles.sectionTitle}>ئەزموونی کار</Text>
                    <View style={kurdishExperienceStyles.experienceHeader}>
                      <View style={{ flex: 1 }}>
                        <Text style={kurdishExperienceStyles.jobTitle}>{exp.jobTitle}</Text>
                        <Text style={kurdishExperienceStyles.company}>{exp.company}</Text>
                        <Text style={kurdishExperienceStyles.jobLocation}>{exp.location}</Text>
                      </View>
                      <Text style={kurdishExperienceStyles.duration}>
                        {formatKurdishDateRange(exp.startDate, exp.endDate, exp.current)}
                      </Text>
                    </View>
                  </View>
                  {exp.description && (
                    <View style={{ marginTop: 4 }}>
                      {parseHtmlToPdf(exp.description, kurdishExperienceStyles).elements}
                    </View>
                  )}
                </View>
              )
            } else {
              return (
                <View
                  key={exp.id}
                  style={[
                    kurdishExperienceStyles.experienceItem,
                    index === experiences.length - 1 ? { borderBottom: 'none' } : {}
                  ]}
                  wrap={false}
                >
                  <View style={kurdishExperienceStyles.experienceHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={kurdishExperienceStyles.jobTitle}>{exp.jobTitle}</Text>
                      <Text style={kurdishExperienceStyles.company}>{exp.company}</Text>
                      <Text style={kurdishExperienceStyles.jobLocation}>{exp.location}</Text>
                    </View>
                    <Text style={kurdishExperienceStyles.duration}>
                      {formatKurdishDateRange(exp.startDate, exp.endDate, exp.current)}
                    </Text>
                  </View>
                  {exp.description && (
                    <View style={{ marginTop: 4 }}>
                      {parseHtmlToPdf(exp.description, kurdishExperienceStyles).elements}
                    </View>
                  )}
                </View>
              )
            }
          })}
        </View>
      )}

      {/* Projects Section - پرۆژەکان */}
      {data.projects && data.projects.length > 0 && (
        <View style={kurdishStyles.section}>
          <Text style={kurdishStyles.sectionTitle}>پرۆژەکان</Text>
          {data.projects.map((project) => (
            <View key={project.id} style={kurdishSkillsStyles.projectItem} wrap={false}>
              <Text style={kurdishSkillsStyles.projectName}>{project.name}</Text>
              {project.description && (
                <View style={{ marginTop: 2 }}>
                  {parseHtmlToPdf(project.description, kurdishSkillsStyles).elements}
                </View>
              )}
              {project.technologies && (
                <Text style={kurdishSkillsStyles.projectTech}>تەکنەلۆژیاکان: {project.technologies}</Text>
              )}
              {project.link && (
                <Link src={project.link} style={kurdishSkillsStyles.projectLink}>
                  بینینی پرۆژە
                </Link>
              )}
            </View>
          ))}
        </View>
      )}
    </View>
  )
}
