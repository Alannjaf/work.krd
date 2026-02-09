'use client'

interface ResumeData {
  personal: {
    fullName: string
    email: string
    phone: string
    location: string
    linkedin: string
    website: string
  }
  summary: string
  experience: Array<{
    id: string
    jobTitle: string
    company: string
    location: string
    startDate: string
    endDate: string
    current: boolean
    description: string
  }>
  education: Array<{
    id: string
    degree: string
    field: string
    school: string
    location: string
    startDate: string
    endDate: string
    gpa?: string
    achievements?: string
  }>
  skills: Array<{
    id: string
    name: string
    level?: string
  }>
  languages: Array<{
    id: string
    name: string
    proficiency: string
  }>
}

interface PrintableResumeProps {
  data: ResumeData
}

export function PrintableResume({ data }: PrintableResumeProps) {
  const formatDate = (dateString: string) => {
    if (!dateString) return ''
    const date = new Date(dateString + '-01')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    return `${month}/${year}`
  }

  return (
    <div className="w-full max-w-[210mm] mx-auto bg-white" style={{ 
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSize: '14px',
      lineHeight: '1.5',
      color: '#1f2937',
      padding: '15mm 20mm',
      minHeight: '297mm',
      boxSizing: 'border-box'
    }}>
      {/* Header */}
      <header style={{ 
        textAlign: 'center', 
        marginBottom: '24px', 
        borderBottom: '2px solid #333',
        paddingBottom: '16px'
      }}>
        <h1 style={{ 
          fontSize: '32px', 
          fontWeight: 'bold', 
          margin: '0 0 16px 0',
          color: '#1f2937'
        }}>
          {data.personal.fullName || 'Your Name'}
        </h1>
        <div style={{ 
          fontSize: '14px', 
          color: '#6b7280',
          textAlign: 'center',
          lineHeight: '1.4'
        }}>
          {[
            data.personal.email,
            data.personal.phone,
            data.personal.location,
            data.personal.linkedin,
            data.personal.website
          ].filter(Boolean).join(' • ')}
        </div>
      </header>

      {/* Professional Summary */}
      {data.summary && (
        <section style={{ marginBottom: '24px' }}>
          <h2 style={{ 
            fontSize: '20px', 
            fontWeight: 'bold', 
            margin: '0 0 12px 0',
            borderBottom: '2px solid #d1d5db',
            paddingBottom: '8px',
            color: '#1f2937'
          }}>
            Professional Summary
          </h2>
          <p style={{ margin: '0', textAlign: 'justify' }}>{data.summary}</p>
        </section>
      )}

      {/* Work Experience */}
      {data.experience.length > 0 && (
        <section style={{ marginBottom: '24px' }}>
          <h2 style={{ 
            fontSize: '20px', 
            fontWeight: 'bold', 
            margin: '0 0 12px 0',
            borderBottom: '2px solid #d1d5db',
            paddingBottom: '8px',
            color: '#1f2937'
          }}>
            Work Experience
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {data.experience.map((exp) => (
              <div key={exp.id}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'flex-start',
                  marginBottom: '6px'
                }}>
                  <div>
                    <h3 style={{ 
                      fontSize: '18px', 
                      fontWeight: 'bold', 
                      margin: '0',
                      color: '#1f2937'
                    }}>
                      {exp.jobTitle}
                    </h3>
                    <p style={{ 
                      margin: '4px 0',
                      fontWeight: '600',
                      color: '#374151',
                      fontSize: '16px'
                    }}>
                      {exp.company}
                    </p>
                    {exp.location && (
                      <p style={{ 
                        margin: '0',
                        fontSize: '11px',
                        color: '#6b7280'
                      }}>
                        {exp.location}
                      </p>
                    )}
                  </div>
                  <div style={{ 
                    fontSize: '11px', 
                    color: '#6b7280',
                    textAlign: 'right',
                    minWidth: '120px'
                  }}>
                    {formatDate(exp.startDate)} - {exp.current ? 'Present' : formatDate(exp.endDate)}
                  </div>
                </div>
                {exp.description && (
                  <div style={{ color: '#374151', marginTop: '6px' }}>
                    {exp.description.split('\n').map((line, index) => (
                      <p key={index} style={{ margin: '2px 0' }}>{line}</p>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education */}
      {data.education.length > 0 && (
        <section style={{ marginBottom: '24px' }}>
          <h2 style={{ 
            fontSize: '16px', 
            fontWeight: 'bold', 
            margin: '0 0 12px 0',
            borderBottom: '1px solid #d1d5db',
            paddingBottom: '4px',
            color: '#1f2937'
          }}>
            Education
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {data.education.map((edu) => (
              <div key={edu.id}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'flex-start',
                  marginBottom: '4px'
                }}>
                  <div>
                    <h3 style={{ 
                      fontSize: '14px', 
                      fontWeight: 'bold', 
                      margin: '0',
                      color: '#1f2937'
                    }}>
                      {edu.degree} {edu.field && `in ${edu.field}`}
                    </h3>
                    <p style={{ 
                      margin: '2px 0',
                      fontWeight: '600',
                      color: '#374151'
                    }}>
                      {edu.school}
                    </p>
                    {edu.location && (
                      <p style={{ 
                        margin: '0',
                        fontSize: '11px',
                        color: '#6b7280'
                      }}>
                        {edu.location}
                      </p>
                    )}
                    {edu.gpa && (
                      <p style={{ 
                        margin: '0',
                        fontSize: '11px',
                        color: '#6b7280'
                      }}>
                        GPA: {edu.gpa}
                      </p>
                    )}
                  </div>
                  <div style={{ 
                    fontSize: '11px', 
                    color: '#6b7280',
                    textAlign: 'right',
                    minWidth: '120px'
                  }}>
                    {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
                  </div>
                </div>
                {edu.achievements && (
                  <div style={{ 
                    fontSize: '11px',
                    color: '#374151',
                    marginTop: '4px'
                  }}>
                    {edu.achievements.split('\n').map((line, index) => (
                      <p key={index} style={{ margin: '1px 0' }}>{line}</p>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Skills */}
      {data.skills.length > 0 && (
        <section style={{ marginBottom: '24px' }}>
          <h2 style={{ 
            fontSize: '16px', 
            fontWeight: 'bold', 
            margin: '0 0 8px 0',
            borderBottom: '1px solid #d1d5db',
            paddingBottom: '4px',
            color: '#1f2937'
          }}>
            Skills
          </h2>
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: '8px',
            alignItems: 'flex-start'
          }}>
            {data.skills.map((skill) => (
              <span
                key={skill.id}
                style={{
                  display: 'inline-block',
                  padding: '6px 12px',
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  borderRadius: '20px',
                  fontSize: '12px',
                  border: '1px solid #d1d5db',
                  whiteSpace: 'nowrap',
                  lineHeight: '1.2'
                }}
              >
                {skill.name} {skill.level && `(${skill.level})`}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Languages */}
      {data.languages.length > 0 && (
        <section style={{ marginBottom: '24px' }}>
          <h2 style={{ 
            fontSize: '16px', 
            fontWeight: 'bold', 
            margin: '0 0 8px 0',
            borderBottom: '1px solid #d1d5db',
            paddingBottom: '4px',
            color: '#1f2937'
          }}>
            Languages
          </h2>
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: '8px',
            alignItems: 'flex-start'
          }}>
            {data.languages.map((language) => (
              <span
                key={language.id}
                style={{
                  display: 'inline-block',
                  padding: '6px 12px',
                  backgroundColor: '#dbeafe',
                  color: '#1d4ed8',
                  borderRadius: '20px',
                  fontSize: '12px',
                  border: '1px solid #93c5fd',
                  whiteSpace: 'nowrap',
                  lineHeight: '1.2'
                }}
              >
                {language.name} ({language.proficiency})
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}