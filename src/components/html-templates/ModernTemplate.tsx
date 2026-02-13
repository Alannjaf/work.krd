import React from 'react';
import type { HtmlTemplateProps } from './types';
import { Watermark } from './shared/Watermark';
import { ProfilePhoto } from './shared/ProfilePhoto';

function hasRtlChars(text: string): boolean {
  return /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(text);
}

const ACCENT = '#f5c518';
const SIDEBAR_BG = '#1e1e1e';
const SIDEBAR_TEXT = '#ffffff';
const SIDEBAR_MUTED = '#b0b0b0';
const MAIN_TEXT = '#333333';
const MAIN_MUTED = '#555555';

function SidebarSectionTitle({ children, isRtl }: { children: React.ReactNode; isRtl: boolean }) {
  const textAlign = isRtl ? 'right' as const : 'left' as const;
  return (
    <div style={{
      display: 'flex',
      flexDirection: isRtl ? 'row-reverse' : 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 12,
    }}>
      <div style={{
        width: 18,
        height: 18,
        borderRadius: '50%',
        backgroundColor: ACCENT,
        flexShrink: 0,
      }} />
      <div style={{
        fontSize: 12,
        fontWeight: 'bold',
        color: SIDEBAR_TEXT,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        borderBottom: `2px solid ${ACCENT}`,
        paddingBottom: 4,
        flex: 1,
        textAlign,
      }}>
        {children}
      </div>
    </div>
  );
}

function MainSectionTitle({ children, isRtl }: { children: React.ReactNode; isRtl: boolean }) {
  const textAlign = isRtl ? 'right' as const : 'left' as const;
  return (
    <div style={{
      display: 'flex',
      flexDirection: isRtl ? 'row-reverse' : 'row',
      alignItems: 'center',
      gap: 10,
      marginBottom: 14,
    }}>
      <div style={{
        width: 24,
        height: 24,
        borderRadius: '50%',
        backgroundColor: ACCENT,
        flexShrink: 0,
      }} />
      <h2 style={{
        fontSize: 15,
        fontWeight: 'bold',
        color: MAIN_TEXT,
        textTransform: 'uppercase',
        letterSpacing: '0.03em',
        margin: 0,
        textAlign,
      }}>
        {children}
      </h2>
    </div>
  );
}

export function ModernTemplate({ data, watermark }: HtmlTemplateProps) {
  const textToCheck = [data.personal.fullName, data.personal.title, data.summary].filter(Boolean).join(' ');
  const isRtl = hasRtlChars(textToCheck);
  const dir = isRtl ? 'rtl' : 'ltr';
  const textAlign = isRtl ? 'right' as const : 'left' as const;

  const formatDateRange = (start?: string, end?: string, current?: boolean) => {
    const fmt = (d?: string) => {
      if (!d) return '';
      const date = new Date(d);
      if (isNaN(date.getTime())) return d;
      return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    };
    if (isRtl) {
      return `${current ? '\u0626\u06CE\u0633\u062A\u0627' : fmt(end)} - ${fmt(start)}`;
    }
    return `${fmt(start)} - ${current ? 'Present' : fmt(end)}`;
  };

  const hasDemographics = data.personal.dateOfBirth || data.personal.gender ||
    data.personal.nationality || data.personal.maritalStatus || data.personal.country;

  return (
    <div style={{
      width: '794px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: MAIN_TEXT,
      direction: dir,
      position: 'relative',
    }}>
      <style dangerouslySetInnerHTML={{ __html: `
        .resume-desc ul, .resume-desc ol { list-style: disc; padding-left: 1.2em; padding-right: 0; margin: 4px 0; }
        .resume-desc ol { list-style: decimal; }
        .resume-desc li { margin-bottom: 2px; }
        [dir="rtl"] .resume-desc ul, [dir="rtl"] .resume-desc ol { padding-left: 0; padding-right: 1.2em; }
        .resume-entry { break-inside: avoid; page-break-inside: avoid; }
        .resume-section h2 { break-after: avoid; page-break-after: avoid; }
      `}} />

      {watermark && <Watermark />}

      <div style={{
        display: 'flex',
        flexDirection: isRtl ? 'row-reverse' : 'row',
      }}>
        {/* ===== SIDEBAR ===== */}
        <div style={{
          width: 280,
          backgroundColor: SIDEBAR_BG,
          padding: '40px 24px',
          flexShrink: 0,
          [isRtl ? 'borderRight' : 'borderLeft']: `6px solid ${ACCENT}`,
        }}>
          {/* Profile Photo */}
          {data.personal.profileImage && (
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
              <ProfilePhoto
                src={data.personal.profileImage}
                size={110}
                borderColor={ACCENT}
                borderWidth={4}
              />
            </div>
          )}

          {/* Name & Title */}
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{
              fontSize: 22,
              fontWeight: 'bold',
              color: SIDEBAR_TEXT,
              marginBottom: 4,
              lineHeight: isRtl ? 1.6 : 1.3,
            }}>
              {data.personal.fullName || 'Your Name'}
            </div>
            {data.personal.title && (
              <div style={{
                fontSize: 12,
                color: SIDEBAR_MUTED,
                lineHeight: isRtl ? 1.5 : 1.3,
              }}>
                {data.personal.title}
              </div>
            )}
          </div>

          {/* Contact */}
          <SidebarSectionTitle isRtl={isRtl}>{isRtl ? '\u067E\u06D5\u06CC\u0648\u06D5\u0646\u062F\u06CC' : 'Contact'}</SidebarSectionTitle>
          <div style={{ marginBottom: 24 }}>
            {data.personal.email && (
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 10, color: ACCENT, fontWeight: 'bold', textAlign, marginBottom: 1 }}>
                  {isRtl ? '\u0626\u06CC\u0645\u06D5\u06CC\u06B5' : 'Email'}
                </div>
                <div style={{ fontSize: 11, color: SIDEBAR_TEXT, textAlign, direction: 'ltr', unicodeBidi: 'plaintext' as const }}>
                  <span style={{ unicodeBidi: 'isolate' as const }}>{data.personal.email}</span>
                </div>
              </div>
            )}
            {data.personal.phone && (
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 10, color: ACCENT, fontWeight: 'bold', textAlign, marginBottom: 1 }}>
                  {isRtl ? '\u0698\u0645\u0627\u0631\u06D5\u06CC \u0645\u06C6\u0628\u0627\u06CC\u0644' : 'Phone'}
                </div>
                <div style={{ fontSize: 11, color: SIDEBAR_TEXT, textAlign, direction: 'ltr', unicodeBidi: 'plaintext' as const }}>
                  <span style={{ unicodeBidi: 'isolate' as const }}>{data.personal.phone}</span>
                </div>
              </div>
            )}
            {data.personal.location && (
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 10, color: ACCENT, fontWeight: 'bold', textAlign, marginBottom: 1 }}>
                  {isRtl ? '\u0634\u0648\u06CE\u0646' : 'Location'}
                </div>
                <div style={{ fontSize: 11, color: SIDEBAR_TEXT, textAlign }}>{data.personal.location}</div>
              </div>
            )}
            {data.personal.website && (
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 10, color: ACCENT, fontWeight: 'bold', textAlign, marginBottom: 1 }}>
                  {isRtl ? '\u0648\u06CE\u0628\u0633\u0627\u06CC\u062A' : 'Website'}
                </div>
                <div style={{ fontSize: 11, color: SIDEBAR_TEXT, textAlign, direction: 'ltr', unicodeBidi: 'plaintext' as const }}>
                  <span style={{ unicodeBidi: 'isolate' as const }}>{data.personal.website}</span>
                </div>
              </div>
            )}
            {data.personal.linkedin && (
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 10, color: ACCENT, fontWeight: 'bold', textAlign, marginBottom: 1 }}>
                  LinkedIn
                </div>
                <div style={{ fontSize: 11, color: SIDEBAR_TEXT, textAlign, direction: 'ltr', unicodeBidi: 'plaintext' as const }}>
                  <span style={{ unicodeBidi: 'isolate' as const }}>{data.personal.linkedin}</span>
                </div>
              </div>
            )}
          </div>

          {/* Demographics */}
          {hasDemographics && (
            <>
              <SidebarSectionTitle isRtl={isRtl}>{isRtl ? '\u0632\u0627\u0646\u06CC\u0627\u0631\u06CC \u06A9\u06D5\u0633\u06CC' : 'Personal'}</SidebarSectionTitle>
              <div style={{ marginBottom: 24 }}>
                {data.personal.dateOfBirth && (
                  <div style={{ marginBottom: 6, textAlign }}>
                    <span style={{ fontSize: 10, color: ACCENT, fontWeight: 'bold' }}>{isRtl ? '\u0644\u06D5\u062F\u0627\u06CC\u06A9\u0628\u0648\u0648\u0646' : 'DOB'}: </span>
                    <span style={{ fontSize: 11, color: SIDEBAR_TEXT }}>{data.personal.dateOfBirth}</span>
                  </div>
                )}
                {data.personal.gender && (
                  <div style={{ marginBottom: 6, textAlign }}>
                    <span style={{ fontSize: 10, color: ACCENT, fontWeight: 'bold' }}>{isRtl ? '\u0695\u06D5\u06AF\u06D5\u0632' : 'Gender'}: </span>
                    <span style={{ fontSize: 11, color: SIDEBAR_TEXT }}>{data.personal.gender}</span>
                  </div>
                )}
                {data.personal.nationality && (
                  <div style={{ marginBottom: 6, textAlign }}>
                    <span style={{ fontSize: 10, color: ACCENT, fontWeight: 'bold' }}>{isRtl ? '\u0646\u06D5\u062A\u06D5\u0648\u06D5' : 'Nationality'}: </span>
                    <span style={{ fontSize: 11, color: SIDEBAR_TEXT }}>{data.personal.nationality}</span>
                  </div>
                )}
                {data.personal.maritalStatus && (
                  <div style={{ marginBottom: 6, textAlign }}>
                    <span style={{ fontSize: 10, color: ACCENT, fontWeight: 'bold' }}>{isRtl ? '\u0628\u0627\u0631\u06CC \u062E\u06CE\u0632\u0627\u0646\u06CC' : 'Status'}: </span>
                    <span style={{ fontSize: 11, color: SIDEBAR_TEXT }}>{data.personal.maritalStatus}</span>
                  </div>
                )}
                {data.personal.country && (
                  <div style={{ marginBottom: 6, textAlign }}>
                    <span style={{ fontSize: 10, color: ACCENT, fontWeight: 'bold' }}>{isRtl ? '\u0648\u06B5\u0627\u062A' : 'Country'}: </span>
                    <span style={{ fontSize: 11, color: SIDEBAR_TEXT }}>{data.personal.country}</span>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Skills */}
          {data.skills && data.skills.length > 0 && (
            <>
              <SidebarSectionTitle isRtl={isRtl}>{isRtl ? '\u062A\u0648\u0627\u0646\u0627\u06CC\u06CC\u06D5\u06A9\u0627\u0646' : 'Skills'}</SidebarSectionTitle>
              <div style={{ marginBottom: 24 }}>
                {data.skills.map((skill) => (
                  <div key={skill.id} style={{
                    fontSize: 11,
                    color: SIDEBAR_TEXT,
                    marginBottom: 6,
                    textAlign,
                    lineHeight: isRtl ? 1.6 : 1.4,
                  }}>
                    {skill.name}
                    {skill.level && (
                      <span style={{ color: SIDEBAR_MUTED, fontSize: 10 }}> ({skill.level})</span>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Languages */}
          {data.languages && data.languages.length > 0 && (
            <>
              <SidebarSectionTitle isRtl={isRtl}>{isRtl ? '\u0632\u0645\u0627\u0646\u06D5\u06A9\u0627\u0646' : 'Languages'}</SidebarSectionTitle>
              <div style={{ marginBottom: 24 }}>
                {data.languages.map((lang) => (
                  <div key={lang.id} style={{
                    fontSize: 11,
                    color: SIDEBAR_TEXT,
                    marginBottom: 6,
                    textAlign,
                    lineHeight: isRtl ? 1.6 : 1.4,
                  }}>
                    {lang.name}
                    <span style={{ color: SIDEBAR_MUTED, fontSize: 10 }}> — {lang.proficiency}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* ===== MAIN CONTENT ===== */}
        <div style={{
          flex: 1,
          padding: '40px 36px',
          backgroundColor: '#ffffff',
        }}>
          {/* Profile / Summary */}
          {data.summary && (
            <div className="resume-section resume-entry" style={{ marginBottom: 24 }}>
              <MainSectionTitle isRtl={isRtl}>{isRtl ? '\u067E\u0695\u06C6\u0641\u0627\u06CC\u0644' : 'Profile'}</MainSectionTitle>
              <p style={{
                fontSize: 11,
                lineHeight: isRtl ? 1.8 : 1.7,
                color: MAIN_MUTED,
                textAlign: 'justify',
                margin: 0,
              }}>
                {data.summary}
              </p>
            </div>
          )}

          {/* Experience */}
          {data.experience && data.experience.length > 0 && (
            <div className="resume-section" style={{ marginBottom: 24 }}>
              <MainSectionTitle isRtl={isRtl}>{isRtl ? '\u0626\u06D5\u0632\u0645\u0648\u0648\u0646\u06CC \u06A9\u0627\u0631\u06CC' : 'Experience'}</MainSectionTitle>
              {data.experience.map((exp) => (
                <div key={exp.id} className="resume-entry" style={{ marginBottom: 16 }}>
                  <div style={{
                    fontSize: 13,
                    fontWeight: 'bold',
                    color: MAIN_TEXT,
                    textAlign,
                    lineHeight: isRtl ? 1.6 : 1.4,
                  }}>
                    {exp.jobTitle}
                  </div>
                  <div style={{
                    fontSize: 11,
                    color: MAIN_MUTED,
                    textAlign,
                    marginBottom: 2,
                    lineHeight: isRtl ? 1.5 : 1.3,
                  }}>
                    {exp.company}{exp.location ? ` | ${exp.location}` : ''}
                  </div>
                  <div style={{
                    fontSize: 10,
                    color: ACCENT,
                    fontWeight: 'bold',
                    textAlign,
                    marginBottom: 6,
                  }}>
                    {formatDateRange(exp.startDate, exp.endDate, exp.current)}
                  </div>
                  {exp.description && (
                    <div
                      className="resume-desc"
                      style={{
                        fontSize: 11,
                        lineHeight: isRtl ? 1.8 : 1.6,
                        color: MAIN_MUTED,
                        textAlign,
                      }}
                      dangerouslySetInnerHTML={{ __html: exp.description }}
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Education */}
          {data.education && data.education.length > 0 && (
            <div className="resume-section" style={{ marginBottom: 24 }}>
              <MainSectionTitle isRtl={isRtl}>{isRtl ? '\u062E\u0648\u06CE\u0646\u062F\u0646' : 'Education'}</MainSectionTitle>
              {data.education.map((edu) => (
                <div key={edu.id} className="resume-entry" style={{ marginBottom: 14 }}>
                  <div style={{
                    fontSize: 13,
                    fontWeight: 'bold',
                    color: MAIN_TEXT,
                    textAlign,
                    lineHeight: isRtl ? 1.6 : 1.4,
                  }}>
                    {edu.degree}{edu.field ? ` ${isRtl ? '\u0644\u06D5' : 'in'} ${edu.field}` : ''}
                  </div>
                  <div style={{
                    fontSize: 11,
                    color: MAIN_MUTED,
                    textAlign,
                    marginBottom: 2,
                    lineHeight: isRtl ? 1.5 : 1.3,
                  }}>
                    {edu.school}{edu.location ? ` | ${edu.location}` : ''}
                  </div>
                  <div style={{ fontSize: 10, color: MAIN_MUTED, textAlign }}>
                    {isRtl ? '\u062F\u06D5\u0631\u0686\u0648\u0648\u0646' : 'Graduated'}: {edu.endDate || edu.startDate}
                  </div>
                  {edu.gpa && (
                    <div style={{ fontSize: 10, color: MAIN_MUTED, textAlign }}>
                      {isRtl ? '\u0646\u0645\u0631\u06D5\u06CC \u06A9\u06C6\u06CC \u06AF\u0634\u062A\u06CC' : 'GPA'}: {edu.gpa}
                    </div>
                  )}
                  {edu.achievements && (
                    <div
                      className="resume-desc"
                      style={{ fontSize: 10, lineHeight: isRtl ? 1.8 : 1.5, color: MAIN_MUTED, marginTop: 4, textAlign }}
                      dangerouslySetInnerHTML={{ __html: edu.achievements }}
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Projects / Portfolio */}
          {data.projects && data.projects.length > 0 && (
            <div className="resume-section" style={{ marginBottom: 24 }}>
              <MainSectionTitle isRtl={isRtl}>{isRtl ? '\u067E\u06C6\u0631\u062A\u0641\u06C6\u0644\u06CC\u06C6' : 'Portfolio'}</MainSectionTitle>
              {data.projects.map((proj) => (
                <div key={proj.id} className="resume-entry" style={{ marginBottom: 14 }}>
                  <div style={{
                    fontSize: 12,
                    fontWeight: 'bold',
                    color: MAIN_TEXT,
                    textAlign,
                    lineHeight: isRtl ? 1.6 : 1.4,
                  }}>
                    {proj.name}
                  </div>
                  {proj.technologies && (
                    <div style={{ fontSize: 10, color: MAIN_MUTED, textAlign, marginBottom: 2 }}>
                      {proj.technologies}
                    </div>
                  )}
                  {proj.description && (
                    <div
                      className="resume-desc"
                      style={{ fontSize: 11, lineHeight: isRtl ? 1.8 : 1.6, color: MAIN_MUTED, textAlign }}
                      dangerouslySetInnerHTML={{ __html: proj.description }}
                    />
                  )}
                  {proj.link && (
                    <div style={{ fontSize: 10, color: ACCENT, textAlign, marginTop: 2, direction: 'ltr', unicodeBidi: 'plaintext' as const }}>
                      <span style={{ unicodeBidi: 'isolate' as const }}>{proj.link}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Certifications */}
          {data.certifications && data.certifications.length > 0 && (
            <div className="resume-section" style={{ marginBottom: 24 }}>
              <MainSectionTitle isRtl={isRtl}>{isRtl ? '\u0628\u0695\u0648\u0627\u0646\u0627\u0645\u06D5\u06A9\u0627\u0646' : 'Certifications'}</MainSectionTitle>
              {data.certifications.map((cert) => (
                <div key={cert.id} className="resume-entry" style={{ marginBottom: 12 }}>
                  <div style={{
                    fontSize: 12,
                    fontWeight: 'bold',
                    color: MAIN_TEXT,
                    textAlign,
                    lineHeight: isRtl ? 1.6 : 1.4,
                  }}>
                    {cert.name}
                  </div>
                  <div style={{ fontSize: 11, color: MAIN_MUTED, textAlign }}>{cert.issuer}</div>
                  {cert.date && (
                    <div style={{ fontSize: 10, color: MAIN_MUTED, textAlign }}>
                      {cert.date}{cert.expiryDate ? ` - ${cert.expiryDate}` : ''}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
