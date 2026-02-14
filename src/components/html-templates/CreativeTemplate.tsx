import React from 'react';
import type { HtmlTemplateProps } from './types';
import { Watermark } from './shared/Watermark';
import { ProfilePhoto } from './shared/ProfilePhoto';
import { isRTLText } from '@/lib/rtl';

const ACCENT = '#e07a5f';
const HEADER_BG = '#e07a5f';
const HEADER_TEXT = '#ffffff';
const HEADER_MUTED = '#fde8e2';
const TEXT_COLOR = '#2d3436';
const MUTED_COLOR = '#636e72';
const PILL_BG = '#fdf0ed';
const PILL_BORDER = '#e8c4bc';
const PILL_TEXT = '#d35f4a';
const TIMELINE_LINE = '#e8c4bc';
const CALLOUT_BG = '#fdf5f3';
const SECTION_TITLE_COLOR = '#e07a5f';

function MainSectionTitle({ children, isRtl }: { children: React.ReactNode; isRtl: boolean }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 6,
      }}>
        <div style={{
          width: 4,
          height: 22,
          backgroundColor: SECTION_TITLE_COLOR,
          borderRadius: 2,
          flexShrink: 0,
        }} />
        <h2 style={{
          fontSize: 14,
          fontWeight: 'bold',
          color: SECTION_TITLE_COLOR,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          margin: 0,
          textAlign: isRtl ? 'right' as const : 'left' as const,
        }}>
          {children}
        </h2>
      </div>
      <div style={{ height: 1, backgroundColor: TIMELINE_LINE }} />
    </div>
  );
}

export function CreativeTemplate({ data, watermark }: HtmlTemplateProps) {
  const textToCheck = [data.personal.fullName, data.personal.title, data.summary].filter(Boolean).join(' ');
  const isRtl = isRTLText(textToCheck);
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

  // Build contact items for the header row
  const contactItems: string[] = [];
  if (data.personal.email) contactItems.push('email');
  if (data.personal.phone) contactItems.push('phone');
  if (data.personal.location) contactItems.push('location');
  if (data.personal.website) contactItems.push('website');
  if (data.personal.linkedin) contactItems.push('linkedin');

  // Build demographics items
  const demoItems: { label: string; value: string }[] = [];
  if (data.personal.dateOfBirth) demoItems.push({ label: isRtl ? '\u0644\u06D5\u062F\u0627\u06CC\u06A9\u0628\u0648\u0648\u0646' : 'DOB', value: data.personal.dateOfBirth });
  if (data.personal.gender) demoItems.push({ label: isRtl ? '\u0695\u06D5\u06AF\u06D5\u0632' : 'Gender', value: data.personal.gender });
  if (data.personal.nationality) demoItems.push({ label: isRtl ? '\u0646\u06D5\u062A\u06D5\u0648\u06D5' : 'Nationality', value: data.personal.nationality });
  if (data.personal.maritalStatus) demoItems.push({ label: isRtl ? '\u0628\u0627\u0631\u06CC \u062E\u06CE\u0632\u0627\u0646\u06CC' : 'Status', value: data.personal.maritalStatus });
  if (data.personal.country) demoItems.push({ label: isRtl ? '\u0648\u06B5\u0627\u062A' : 'Country', value: data.personal.country });

  return (
    <div style={{
      width: '794px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: TEXT_COLOR,
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
        .creative-header-bg { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      `}} />

      {watermark && <Watermark />}

      {/* ===== HEADER BAND (full-width coral) ===== */}
      <div className="resume-entry creative-header-bg" style={{
        backgroundColor: HEADER_BG,
        padding: '40px 60px',
        WebkitPrintColorAdjust: 'exact',
        printColorAdjust: 'exact',
      } as React.CSSProperties}>
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          gap: 24,
          alignItems: 'center',
        }}>
          {/* Profile Photo */}
          {data.personal.profileImage && (
            <ProfilePhoto
              src={data.personal.profileImage}
              size={90}
              borderColor="#ffffff"
              borderWidth={3}
            />
          )}

          {/* Name, title, contact */}
          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: 26,
              fontWeight: 'bold',
              color: HEADER_TEXT,
              lineHeight: isRtl ? 1.6 : 1.3,
              textAlign,
            }}>
              {data.personal.fullName || 'Your Name'}
            </div>

            {data.personal.title && (
              <div style={{
                fontSize: 13,
                color: HEADER_MUTED,
                lineHeight: isRtl ? 1.5 : 1.3,
                textAlign,
              }}>
                {data.personal.title}
              </div>
            )}

            {/* Contact row */}
            {contactItems.length > 0 && (
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                flexDirection: 'row',
                gap: 8,
                marginTop: 12,
                alignItems: 'center',
              }}>
                {data.personal.email && (
                  <>
                    <span style={{ fontSize: 10, color: HEADER_TEXT, direction: 'ltr', unicodeBidi: 'plaintext' as const }}>
                      <span style={{ unicodeBidi: 'isolate' as const }}>{data.personal.email}</span>
                    </span>
                  </>
                )}
                {data.personal.phone && (
                  <>
                    <span style={{ fontSize: 10, color: HEADER_MUTED }}>{'\u00B7'}</span>
                    <span style={{ fontSize: 10, color: HEADER_TEXT, direction: 'ltr', unicodeBidi: 'plaintext' as const }}>
                      <span style={{ unicodeBidi: 'isolate' as const }}>{data.personal.phone}</span>
                    </span>
                  </>
                )}
                {data.personal.location && (
                  <>
                    <span style={{ fontSize: 10, color: HEADER_MUTED }}>{'\u00B7'}</span>
                    <span style={{ fontSize: 10, color: HEADER_TEXT }}>{data.personal.location}</span>
                  </>
                )}
                {data.personal.website && (
                  <>
                    <span style={{ fontSize: 10, color: HEADER_MUTED }}>{'\u00B7'}</span>
                    <span style={{ fontSize: 10, color: HEADER_TEXT, direction: 'ltr', unicodeBidi: 'plaintext' as const }}>
                      <span style={{ unicodeBidi: 'isolate' as const }}>{data.personal.website}</span>
                    </span>
                  </>
                )}
                {data.personal.linkedin && (
                  <>
                    <span style={{ fontSize: 10, color: HEADER_MUTED }}>{'\u00B7'}</span>
                    <span style={{ fontSize: 10, color: HEADER_TEXT, direction: 'ltr', unicodeBidi: 'plaintext' as const }}>
                      <span style={{ unicodeBidi: 'isolate' as const }}>{data.personal.linkedin}</span>
                    </span>
                  </>
                )}
              </div>
            )}

            {/* Demographics row */}
            {hasDemographics && demoItems.length > 0 && (
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                flexDirection: 'row',
                gap: 8,
                marginTop: 6,
                alignItems: 'center',
              }}>
                {demoItems.map((item, i) => (
                  <React.Fragment key={item.label}>
                    {i > 0 && <span style={{ fontSize: 9, color: HEADER_MUTED }}>{'\u00B7'}</span>}
                    <span style={{ fontSize: 9, color: HEADER_MUTED }}>
                      {item.value}
                    </span>
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ===== CONTENT SECTION (white background) ===== */}
      <div style={{ padding: '30px 60px 40px' }}>

        {/* Summary - callout box */}
        {data.summary && (
          <div className="resume-section resume-entry" style={{ marginBottom: 24 }}>
            <MainSectionTitle isRtl={isRtl}>{isRtl ? '\u062F\u06D5\u0631\u0628\u0627\u0631\u06D5' : 'About Me'}</MainSectionTitle>
            <div style={{
              backgroundColor: CALLOUT_BG,
              borderRadius: 4,
              padding: '14px 18px',
              ...(isRtl
                ? { borderRight: `3px solid ${ACCENT}` }
                : { borderLeft: `3px solid ${ACCENT}` }),
              WebkitPrintColorAdjust: 'exact' as const,
              printColorAdjust: 'exact' as const,
            }}>
              <p style={{
                fontSize: 11,
                lineHeight: isRtl ? 1.8 : 1.7,
                color: MUTED_COLOR,
                textAlign,
                margin: 0,
              }}>
                {data.summary}
              </p>
            </div>
          </div>
        )}

        {/* Experience - with timeline dots */}
        {data.experience && data.experience.length > 0 && (
          <div className="resume-section" style={{ marginBottom: 24 }}>
            <MainSectionTitle isRtl={isRtl}>{isRtl ? '\u0626\u06D5\u0632\u0645\u0648\u0648\u0646\u06CC \u06A9\u0627\u0631\u06CC' : 'Experience'}</MainSectionTitle>
            {data.experience.map((exp, index) => (
              <div key={exp.id} className="resume-entry" style={{
                display: 'flex',
                flexDirection: 'row',
                gap: 16,
                marginBottom: 16,
              }}>
                {/* Timeline column */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  width: 16,
                  flexShrink: 0,
                  paddingTop: 4,
                }}>
                  <div style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    backgroundColor: ACCENT,
                    flexShrink: 0,
                    WebkitPrintColorAdjust: 'exact',
                    printColorAdjust: 'exact',
                  } as React.CSSProperties} />
                  {index < data.experience.length - 1 && (
                    <div style={{
                      width: 2,
                      flex: 1,
                      backgroundColor: TIMELINE_LINE,
                      WebkitPrintColorAdjust: 'exact',
                      printColorAdjust: 'exact',
                    } as React.CSSProperties} />
                  )}
                </div>
                {/* Content */}
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: 13,
                    fontWeight: 'bold',
                    color: TEXT_COLOR,
                    textAlign,
                    lineHeight: isRtl ? 1.6 : 1.4,
                  }}>
                    {exp.jobTitle}
                  </div>
                  <div style={{
                    fontSize: 11,
                    color: MUTED_COLOR,
                    textAlign,
                    marginBottom: 2,
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
                        color: MUTED_COLOR,
                        textAlign,
                      }}
                      dangerouslySetInnerHTML={{ __html: exp.description }}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Education - with timeline dots */}
        {data.education && data.education.length > 0 && (
          <div className="resume-section" style={{ marginBottom: 24 }}>
            <MainSectionTitle isRtl={isRtl}>{isRtl ? '\u062E\u0648\u06CE\u0646\u062F\u0646' : 'Education'}</MainSectionTitle>
            {data.education.map((edu, index) => (
              <div key={edu.id} className="resume-entry" style={{
                display: 'flex',
                flexDirection: 'row',
                gap: 16,
                marginBottom: 14,
              }}>
                {/* Timeline column */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  width: 16,
                  flexShrink: 0,
                  paddingTop: 4,
                }}>
                  <div style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    backgroundColor: ACCENT,
                    flexShrink: 0,
                    WebkitPrintColorAdjust: 'exact',
                    printColorAdjust: 'exact',
                  } as React.CSSProperties} />
                  {index < data.education.length - 1 && (
                    <div style={{
                      width: 2,
                      flex: 1,
                      backgroundColor: TIMELINE_LINE,
                      WebkitPrintColorAdjust: 'exact',
                      printColorAdjust: 'exact',
                    } as React.CSSProperties} />
                  )}
                </div>
                {/* Content */}
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: 13,
                    fontWeight: 'bold',
                    color: TEXT_COLOR,
                    textAlign,
                    lineHeight: isRtl ? 1.6 : 1.4,
                  }}>
                    {edu.degree}{edu.field ? ` ${isRtl ? '\u0644\u06D5' : 'in'} ${edu.field}` : ''}
                  </div>
                  <div style={{
                    fontSize: 11,
                    color: MUTED_COLOR,
                    textAlign,
                    marginBottom: 2,
                    lineHeight: isRtl ? 1.5 : 1.3,
                  }}>
                    {edu.school}{edu.location ? ` | ${edu.location}` : ''}
                  </div>
                  <div style={{
                    fontSize: 10,
                    color: ACCENT,
                    fontWeight: 'bold',
                    textAlign,
                  }}>
                    {formatDateRange(edu.startDate, edu.endDate)}
                  </div>
                  {edu.gpa && (
                    <div style={{ fontSize: 10, color: MUTED_COLOR, textAlign, marginTop: 2 }}>
                      {isRtl ? '\u0646\u0645\u0631\u06D5\u06CC \u06A9\u06C6\u06CC \u06AF\u0634\u062A\u06CC' : 'GPA'}: {edu.gpa}
                    </div>
                  )}
                  {edu.achievements && (
                    <div
                      className="resume-desc"
                      style={{ fontSize: 10, lineHeight: isRtl ? 1.8 : 1.5, color: MUTED_COLOR, marginTop: 4, textAlign }}
                      dangerouslySetInnerHTML={{ __html: edu.achievements }}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Skills - full-width pill grid */}
        {data.skills && data.skills.length > 0 && (
          <div className="resume-section" style={{ marginBottom: 24 }}>
            <MainSectionTitle isRtl={isRtl}>{isRtl ? '\u062A\u0648\u0627\u0646\u0627\u06CC\u06CC\u06D5\u06A9\u0627\u0646' : 'Skills'}</MainSectionTitle>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 8,
            }}>
              {data.skills.map((skill) => (
                <div key={skill.id} className="resume-entry" style={{
                  borderRadius: 999,
                  backgroundColor: PILL_BG,
                  border: `1px solid ${PILL_BORDER}`,
                  color: PILL_TEXT,
                  padding: '4px 14px',
                  fontSize: 11,
                  WebkitPrintColorAdjust: 'exact' as const,
                  printColorAdjust: 'exact' as const,
                }}>
                  {skill.name}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Languages */}
        {data.languages && data.languages.length > 0 && (
          <div className="resume-section" style={{ marginBottom: 24 }}>
            <MainSectionTitle isRtl={isRtl}>{isRtl ? '\u0632\u0645\u0627\u0646\u06D5\u06A9\u0627\u0646' : 'Languages'}</MainSectionTitle>
            {data.languages.map((lang) => (
              <div key={lang.id} className="resume-entry" style={{
                fontSize: 11,
                color: TEXT_COLOR,
                marginBottom: 6,
                textAlign,
                lineHeight: isRtl ? 1.6 : 1.4,
              }}>
                {lang.name}
                <span style={{ color: MUTED_COLOR, fontSize: 10 }}> ({lang.proficiency})</span>
              </div>
            ))}
          </div>
        )}

        {/* Projects */}
        {data.projects && data.projects.length > 0 && (
          <div className="resume-section" style={{ marginBottom: 24 }}>
            <MainSectionTitle isRtl={isRtl}>{isRtl ? '\u067E\u0695\u06C6\u0698\u06D5\u06A9\u0627\u0646' : 'Projects'}</MainSectionTitle>
            {data.projects.map((proj) => (
              <div key={proj.id} className="resume-entry" style={{ marginBottom: 14 }}>
                <div style={{
                  fontSize: 12,
                  fontWeight: 'bold',
                  color: TEXT_COLOR,
                  textAlign,
                  lineHeight: isRtl ? 1.6 : 1.4,
                }}>
                  {proj.name}
                </div>
                {proj.technologies && (
                  <div style={{ fontSize: 10, color: ACCENT, textAlign, marginBottom: 2 }}>
                    {proj.technologies}
                  </div>
                )}
                {proj.description && (
                  <div
                    className="resume-desc"
                    style={{ fontSize: 11, lineHeight: isRtl ? 1.8 : 1.6, color: MUTED_COLOR, textAlign }}
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
                  color: TEXT_COLOR,
                  textAlign,
                  lineHeight: isRtl ? 1.6 : 1.4,
                }}>
                  {cert.name}
                </div>
                <div style={{ fontSize: 11, color: MUTED_COLOR, textAlign }}>{cert.issuer}</div>
                {cert.date && (
                  <div style={{ fontSize: 10, color: ACCENT, textAlign }}>
                    {cert.date}{cert.expiryDate ? ` - ${cert.expiryDate}` : ''}
                  </div>
                )}
                {cert.credentialId && (
                  <div style={{ fontSize: 10, color: MUTED_COLOR, textAlign }}>
                    ID: {cert.credentialId}
                  </div>
                )}
                {cert.url && (
                  <div style={{ fontSize: 10, color: ACCENT, textAlign, direction: 'ltr', unicodeBidi: 'plaintext' as const }}>
                    <span style={{ unicodeBidi: 'isolate' as const }}>{cert.url}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
