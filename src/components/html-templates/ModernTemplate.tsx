import React from 'react';
import type { HtmlTemplateProps } from './types';
import { Watermark } from './shared/Watermark';
import { ProfilePhoto } from './shared/ProfilePhoto';
import { isRTLText } from '@/lib/rtl';

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
      flexDirection: 'row',
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
      <div role="heading" aria-level={2} style={{
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
      flexDirection: 'row',
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
  const isRtl = isRTLText(textToCheck);
  const dir = isRtl ? 'rtl' : 'ltr';
  const textAlign = isRtl ? 'right' as const : 'left' as const;

  const formatDateRange = (start?: string, end?: string, current?: boolean) => {
    const fmt = (d?: string) => {
      if (!d) return '';
      const date = new Date(d);
      if (isNaN(date.getTime())) return d;
      return date.toLocaleDateString(isRtl ? 'ar' : 'en-US', { month: 'short', year: 'numeric' });
    };
    if (isRtl) {
      return `${current ? 'ئێستا' : fmt(end)} - ${fmt(start)}`;
    }
    return `${fmt(start)} - ${current ? 'Present' : fmt(end)}`;
  };

  const hasDemographics = data.personal.dateOfBirth || data.personal.gender ||
    data.personal.nationality || data.personal.maritalStatus || data.personal.country;

  return (
    <div style={{
      width: '794px',
      fontFamily: "system-ui, -apple-system, 'Noto Sans Arabic', sans-serif",
      color: MAIN_TEXT,
      direction: dir,
      position: 'relative',
      // CSS variable read by ResumePageScaler to paint sidebar bg on each page (percentages scale with page card)
      '--resume-page-bg': isRtl
        ? `linear-gradient(to left, ${ACCENT} 0.756%, ${SIDEBAR_BG} 0.756%, ${SIDEBAR_BG} 35.265%, #ffffff 35.265%)`
        : `linear-gradient(to right, ${ACCENT} 0.756%, ${SIDEBAR_BG} 0.756%, ${SIDEBAR_BG} 35.265%, #ffffff 35.265%)`,
    } as React.CSSProperties}>
      <style dangerouslySetInnerHTML={{ __html: `
        .resume-desc ul, .resume-desc ol { list-style: disc; padding-left: 1.2em; padding-right: 0; margin: 4px 0; }
        .resume-desc ol { list-style: decimal; }
        .resume-desc li { margin-bottom: 2px; }
        [dir="rtl"] .resume-desc ul, [dir="rtl"] .resume-desc ol { padding-left: 0; padding-right: 1.2em; }
        .resume-entry { break-inside: avoid; page-break-inside: avoid; }
        .resume-section h2 { break-after: avoid; page-break-after: avoid; }
        .modern-sidebar-bg { display: none; }
        @media print {
          .modern-sidebar-bg {
            display: block !important;
            position: fixed !important;
            top: 0 !important;
            bottom: 0 !important;
            ${isRtl ? 'right' : 'left'}: 0;
            width: 280px;
            background-color: ${SIDEBAR_BG};
            border-${isRtl ? 'right' : 'left'}: 6px solid ${ACCENT};
            z-index: 0;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}} />

      {watermark && <Watermark isRTL={isRtl} />}

      {/* Sidebar background: position:fixed repeats on every print page (needs @page margin:0) */}
      <div className="modern-sidebar-bg" />

      <div style={{
        display: 'flex',
        flexDirection: 'row',
        position: 'relative',
        zIndex: 1,
      }}>
        {/* ===== SIDEBAR ===== */}
        <div style={{
          width: 280,
          padding: '40px 24px',
          flexShrink: 0,
          WebkitBoxDecorationBreak: 'clone' as const,
          boxDecorationBreak: 'clone' as const,
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
          <div style={{ marginBottom: 24 }}>
            <SidebarSectionTitle isRtl={isRtl}>{isRtl ? 'پەیوەندی' : 'Contact'}</SidebarSectionTitle>
            {data.personal.email && (
              <div className="resume-entry" style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 10, color: ACCENT, fontWeight: 'bold', textAlign, marginBottom: 1 }}>
                  {isRtl ? 'ئیمەیڵ' : 'Email'}
                </div>
                <div style={{ fontSize: 11, color: SIDEBAR_TEXT, textAlign, direction: 'ltr', unicodeBidi: 'plaintext' as const }}>
                  <span style={{ unicodeBidi: 'isolate' as const }}>{data.personal.email}</span>
                </div>
              </div>
            )}
            {data.personal.phone && (
              <div className="resume-entry" style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 10, color: ACCENT, fontWeight: 'bold', textAlign, marginBottom: 1 }}>
                  {isRtl ? 'ژمارەی مۆبایل' : 'Phone'}
                </div>
                <div style={{ fontSize: 11, color: SIDEBAR_TEXT, textAlign, direction: 'ltr', unicodeBidi: 'plaintext' as const }}>
                  <span style={{ unicodeBidi: 'isolate' as const }}>{data.personal.phone}</span>
                </div>
              </div>
            )}
            {data.personal.location && (
              <div className="resume-entry" style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 10, color: ACCENT, fontWeight: 'bold', textAlign, marginBottom: 1 }}>
                  {isRtl ? 'شوێن' : 'Location'}
                </div>
                <div style={{ fontSize: 11, color: SIDEBAR_TEXT, textAlign }}>{data.personal.location}</div>
              </div>
            )}
            {data.personal.website && (
              <div className="resume-entry" style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 10, color: ACCENT, fontWeight: 'bold', textAlign, marginBottom: 1 }}>
                  {isRtl ? 'وێبسایت' : 'Website'}
                </div>
                <div style={{ fontSize: 11, color: SIDEBAR_TEXT, textAlign, direction: 'ltr', unicodeBidi: 'plaintext' as const }}>
                  <span style={{ unicodeBidi: 'isolate' as const }}>{data.personal.website}</span>
                </div>
              </div>
            )}
            {data.personal.linkedin && (
              <div className="resume-entry" style={{ marginBottom: 10 }}>
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
            <div style={{ marginBottom: 24 }}>
              <SidebarSectionTitle isRtl={isRtl}>{isRtl ? 'زانیاری کەسی' : 'Personal'}</SidebarSectionTitle>
                {data.personal.dateOfBirth && (
                  <div className="resume-entry" style={{ marginBottom: 6, textAlign }}>
                    <span style={{ fontSize: 10, color: ACCENT, fontWeight: 'bold' }}>{isRtl ? 'لەدایکبوون' : 'DOB'}: </span>
                    <span style={{ fontSize: 11, color: SIDEBAR_TEXT }}>{data.personal.dateOfBirth}</span>
                  </div>
                )}
                {data.personal.gender && (
                  <div className="resume-entry" style={{ marginBottom: 6, textAlign }}>
                    <span style={{ fontSize: 10, color: ACCENT, fontWeight: 'bold' }}>{isRtl ? 'ڕەگەز' : 'Gender'}: </span>
                    <span style={{ fontSize: 11, color: SIDEBAR_TEXT }}>{data.personal.gender}</span>
                  </div>
                )}
                {data.personal.nationality && (
                  <div className="resume-entry" style={{ marginBottom: 6, textAlign }}>
                    <span style={{ fontSize: 10, color: ACCENT, fontWeight: 'bold' }}>{isRtl ? 'نەتەوە' : 'Nationality'}: </span>
                    <span style={{ fontSize: 11, color: SIDEBAR_TEXT }}>{data.personal.nationality}</span>
                  </div>
                )}
                {data.personal.maritalStatus && (
                  <div className="resume-entry" style={{ marginBottom: 6, textAlign }}>
                    <span style={{ fontSize: 10, color: ACCENT, fontWeight: 'bold' }}>{isRtl ? 'باری خێزانی' : 'Status'}: </span>
                    <span style={{ fontSize: 11, color: SIDEBAR_TEXT }}>{data.personal.maritalStatus}</span>
                  </div>
                )}
                {data.personal.country && (
                  <div className="resume-entry" style={{ marginBottom: 6, textAlign }}>
                    <span style={{ fontSize: 10, color: ACCENT, fontWeight: 'bold' }}>{isRtl ? 'وڵات' : 'Country'}: </span>
                    <span style={{ fontSize: 11, color: SIDEBAR_TEXT }}>{data.personal.country}</span>
                  </div>
                )}
            </div>
          )}

          {/* Skills */}
          {data.skills && data.skills.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <SidebarSectionTitle isRtl={isRtl}>{isRtl ? 'تواناییەکان' : 'Skills'}</SidebarSectionTitle>
                {data.skills.map((skill) => (
                  <div key={skill.id} className="resume-entry" style={{
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
          )}

          {/* Languages */}
          {data.languages && data.languages.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <SidebarSectionTitle isRtl={isRtl}>{isRtl ? 'زمانەکان' : 'Languages'}</SidebarSectionTitle>
              {data.languages.map((lang) => (
                <div key={lang.id} className="resume-entry" style={{
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
          )}
        </div>

        {/* ===== MAIN CONTENT ===== */}
        <div style={{
          flex: 1,
          padding: '40px 36px',
          backgroundColor: '#ffffff',
          WebkitBoxDecorationBreak: 'clone' as const,
          boxDecorationBreak: 'clone' as const,
        }}>
          {/* Profile / Summary */}
          {data.summary && (
            <div className="resume-section resume-entry" style={{ marginBottom: 24 }}>
              <MainSectionTitle isRtl={isRtl}>{isRtl ? 'پڕۆفایل' : 'Profile'}</MainSectionTitle>
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
              <MainSectionTitle isRtl={isRtl}>{isRtl ? 'ئەزموونی کاری' : 'Experience'}</MainSectionTitle>
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
              <MainSectionTitle isRtl={isRtl}>{isRtl ? 'خوێندن' : 'Education'}</MainSectionTitle>
              {data.education.map((edu) => (
                <div key={edu.id} className="resume-entry" style={{ marginBottom: 14 }}>
                  <div style={{
                    fontSize: 13,
                    fontWeight: 'bold',
                    color: MAIN_TEXT,
                    textAlign,
                    lineHeight: isRtl ? 1.6 : 1.4,
                  }}>
                    {edu.degree}{edu.field ? ` ${isRtl ? 'لە' : 'in'} ${edu.field}` : ''}
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
                    {isRtl ? 'دەرچوون' : 'Graduated'}: {edu.endDate || edu.startDate}
                  </div>
                  {edu.gpa && (
                    <div style={{ fontSize: 10, color: MAIN_MUTED, textAlign }}>
                      {isRtl ? 'نمرەی کۆی گشتی' : 'GPA'}: {edu.gpa}
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
              <MainSectionTitle isRtl={isRtl}>{isRtl ? 'پۆرتفۆلیۆ' : 'Portfolio'}</MainSectionTitle>
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
              <MainSectionTitle isRtl={isRtl}>{isRtl ? 'بڕوانامەکان' : 'Certifications'}</MainSectionTitle>
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
