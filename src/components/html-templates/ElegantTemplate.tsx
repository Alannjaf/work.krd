import React from 'react';
import type { HtmlTemplateProps } from './types';
import { Watermark } from './shared/Watermark';
import { isRTLText } from '@/lib/rtl';

// Elegant Dark color scheme
const SIDEBAR_BG = '#1a1a1a';
const MAIN_BG = '#2d2d2d';
const GOLD = '#c9a84c';
const TEXT_PRIMARY = '#ffffff';
const TEXT_MUTED = '#b0b0b0';
const SIDEBAR_WIDTH = 280;

function ElegantSectionTitle({ children, isRtl }: { children: React.ReactNode; isRtl: boolean }) {
  const textAlign = isRtl ? 'right' as const : 'left' as const;
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ height: 1, backgroundColor: GOLD, marginBottom: 8 }} />
      <h2 style={{
        fontSize: 11,
        fontWeight: 'bold',
        color: GOLD,
        textTransform: 'uppercase',
        letterSpacing: '0.12em',
        margin: 0,
        textAlign,
      }}>
        {children}
      </h2>
      <div style={{ height: 1, backgroundColor: GOLD, marginTop: 8 }} />
    </div>
  );
}

export function ElegantTemplate({ data, watermark }: HtmlTemplateProps) {
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

  const sidebarPct = (SIDEBAR_WIDTH / 794 * 100).toFixed(3);

  return (
    <div style={{
      width: '794px',
      fontFamily: "system-ui, -apple-system, 'Noto Sans Arabic', sans-serif",
      color: TEXT_PRIMARY,
      direction: dir,
      position: 'relative',
      '--resume-page-bg': isRtl
        ? `linear-gradient(to left, ${SIDEBAR_BG} ${sidebarPct}%, ${MAIN_BG} ${sidebarPct}%)`
        : `linear-gradient(to right, ${SIDEBAR_BG} ${sidebarPct}%, ${MAIN_BG} ${sidebarPct}%)`,
    } as React.CSSProperties}>
      <style dangerouslySetInnerHTML={{ __html: `
        .resume-desc ul, .resume-desc ol { list-style: disc; padding-left: 1.2em; padding-right: 0; margin: 4px 0; }
        .resume-desc ol { list-style: decimal; }
        .resume-desc li { margin-bottom: 2px; color: ${TEXT_MUTED}; }
        [dir="rtl"] .resume-desc ul, [dir="rtl"] .resume-desc ol { padding-left: 0; padding-right: 1.2em; }
        .resume-entry { break-inside: avoid; page-break-inside: avoid; }
        .resume-section h2 { break-after: avoid; page-break-after: avoid; }
        .elegant-bg { display: none; }
        @media print {
          .elegant-bg {
            display: block !important;
            position: fixed !important;
            top: 0 !important;
            bottom: 0 !important;
            left: 0 !important;
            right: 0 !important;
            background: linear-gradient(to ${isRtl ? 'left' : 'right'}, ${SIDEBAR_BG} ${sidebarPct}%, ${MAIN_BG} ${sidebarPct}%);
            z-index: 0;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}} />

      {watermark && <Watermark isRTL={isRtl} />}

      {/* Print background: full-width gradient fixed on every page */}
      <div className="elegant-bg" />

      <div style={{
        display: 'flex',
        flexDirection: 'row',
        position: 'relative',
        zIndex: 1,
      }}>
        {/* ===== SIDEBAR ===== */}
        <div style={{
          width: SIDEBAR_WIDTH,
          padding: '40px 24px',
          flexShrink: 0,
          WebkitBoxDecorationBreak: 'clone' as const,
          boxDecorationBreak: 'clone' as const,
        }}>
          {/* Profile Photo — square with gold border */}
          {data.personal.profileImage && (
            <div className="resume-entry" style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
              <img
                src={data.personal.profileImage}
                alt=""
                style={{
                  width: 160,
                  height: 160,
                  objectFit: 'cover',
                  border: `3px solid ${GOLD}`,
                }}
              />
            </div>
          )}

          {/* Professional Profile (Summary) */}
          {data.summary && (
            <div className="resume-section resume-entry" style={{ marginBottom: 24 }}>
              <ElegantSectionTitle isRtl={isRtl}>
                {isRtl ? 'پڕۆفایلی پیشەیی' : 'Professional Profile'}
              </ElegantSectionTitle>
              <p style={{
                fontSize: 10,
                lineHeight: isRtl ? 1.8 : 1.7,
                color: TEXT_MUTED,
                textAlign,
                margin: 0,
              }}>
                {data.summary}
              </p>
            </div>
          )}

          {/* Contact */}
          <div style={{ marginBottom: 24 }}>
            <ElegantSectionTitle isRtl={isRtl}>
              {isRtl ? 'پەیوەندی' : 'Contact'}
            </ElegantSectionTitle>
            {data.personal.phone && (
              <div className="resume-entry" style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 9, color: GOLD, fontWeight: 'bold', textAlign, marginBottom: 2 }}>
                  {isRtl ? 'ژمارەی مۆبایل' : 'Phone'}
                </div>
                <div style={{ fontSize: 10, color: TEXT_PRIMARY, textAlign, direction: 'ltr', unicodeBidi: 'plaintext' as const }}>
                  <span style={{ unicodeBidi: 'isolate' as const }}>{data.personal.phone}</span>
                </div>
              </div>
            )}
            {data.personal.email && (
              <div className="resume-entry" style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 9, color: GOLD, fontWeight: 'bold', textAlign, marginBottom: 2 }}>
                  {isRtl ? 'ئیمەیڵ' : 'Email'}
                </div>
                <div style={{ fontSize: 10, color: TEXT_PRIMARY, textAlign, direction: 'ltr', unicodeBidi: 'plaintext' as const }}>
                  <span style={{ unicodeBidi: 'isolate' as const }}>{data.personal.email}</span>
                </div>
              </div>
            )}
            {data.personal.website && (
              <div className="resume-entry" style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 9, color: GOLD, fontWeight: 'bold', textAlign, marginBottom: 2 }}>
                  {isRtl ? 'وێبسایت' : 'Website'}
                </div>
                <div style={{ fontSize: 10, color: TEXT_PRIMARY, textAlign, direction: 'ltr', unicodeBidi: 'plaintext' as const }}>
                  <span style={{ unicodeBidi: 'isolate' as const }}>{data.personal.website}</span>
                </div>
              </div>
            )}
            {data.personal.location && (
              <div className="resume-entry" style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 9, color: GOLD, fontWeight: 'bold', textAlign, marginBottom: 2 }}>
                  {isRtl ? 'شوێن' : 'Address'}
                </div>
                <div style={{ fontSize: 10, color: TEXT_PRIMARY, textAlign }}>{data.personal.location}</div>
              </div>
            )}
            {data.personal.linkedin && (
              <div className="resume-entry" style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 9, color: GOLD, fontWeight: 'bold', textAlign, marginBottom: 2 }}>
                  LinkedIn
                </div>
                <div style={{ fontSize: 10, color: TEXT_PRIMARY, textAlign, direction: 'ltr', unicodeBidi: 'plaintext' as const }}>
                  <span style={{ unicodeBidi: 'isolate' as const }}>{data.personal.linkedin}</span>
                </div>
              </div>
            )}
          </div>

          {/* Education */}
          {data.education && data.education.length > 0 && (
            <div className="resume-section" style={{ marginBottom: 24 }}>
              <ElegantSectionTitle isRtl={isRtl}>
                {isRtl ? 'خوێندن' : 'Education'}
              </ElegantSectionTitle>
              {data.education.map((edu) => (
                <div key={edu.id} className="resume-entry" style={{ marginBottom: 12 }}>
                  <div style={{
                    fontSize: 11,
                    fontWeight: 'bold',
                    color: TEXT_PRIMARY,
                    textAlign,
                    lineHeight: isRtl ? 1.6 : 1.4,
                  }}>
                    {edu.degree}{edu.field ? ` ${isRtl ? 'لە' : 'in'} ${edu.field}` : ''}
                  </div>
                  <div style={{
                    fontSize: 10,
                    color: TEXT_MUTED,
                    textAlign,
                    lineHeight: isRtl ? 1.5 : 1.3,
                  }}>
                    {edu.school}{edu.location ? `, ${edu.location}` : ''}
                  </div>
                  <div style={{ fontSize: 9, color: GOLD, textAlign }}>
                    {formatDateRange(edu.startDate, edu.endDate)}
                  </div>
                  {edu.gpa && (
                    <div style={{ fontSize: 9, color: TEXT_MUTED, textAlign }}>
                      {isRtl ? 'نمرەی کۆی گشتی' : 'GPA'}: {edu.gpa}
                    </div>
                  )}
                  {edu.achievements && (
                    <div
                      className="resume-desc"
                      style={{ fontSize: 9, lineHeight: isRtl ? 1.7 : 1.5, color: TEXT_MUTED, marginTop: 4, textAlign }}
                      dangerouslySetInnerHTML={{ __html: edu.achievements }}
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Technical Skills */}
          {data.skills && data.skills.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <ElegantSectionTitle isRtl={isRtl}>
                {isRtl ? 'تواناییەکان' : 'Technical Skills'}
              </ElegantSectionTitle>
              {data.skills.map((skill) => (
                <div key={skill.id} className="resume-entry" style={{
                  fontSize: 10,
                  color: TEXT_PRIMARY,
                  marginBottom: 5,
                  textAlign,
                  lineHeight: isRtl ? 1.6 : 1.4,
                }}>
                  {skill.name}
                  {skill.level && (
                    <span style={{ color: TEXT_MUTED, fontSize: 9 }}> ({skill.level})</span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Languages */}
          {data.languages && data.languages.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <ElegantSectionTitle isRtl={isRtl}>
                {isRtl ? 'زمانەکان' : 'Languages'}
              </ElegantSectionTitle>
              {data.languages.map((lang) => (
                <div key={lang.id} className="resume-entry" style={{
                  fontSize: 10,
                  color: TEXT_PRIMARY,
                  marginBottom: 5,
                  textAlign,
                  lineHeight: isRtl ? 1.6 : 1.4,
                }}>
                  {lang.name}
                  <span style={{ color: TEXT_MUTED, fontSize: 9 }}> — {lang.proficiency}</span>
                </div>
              ))}
            </div>
          )}

          {/* Demographics */}
          {(data.personal.dateOfBirth || data.personal.gender || data.personal.nationality || data.personal.maritalStatus || data.personal.country) && (
            <div style={{ marginBottom: 24 }}>
              <ElegantSectionTitle isRtl={isRtl}>
                {isRtl ? 'زانیاری کەسی' : 'Personal'}
              </ElegantSectionTitle>
              {data.personal.dateOfBirth && (
                <div className="resume-entry" style={{ marginBottom: 5, textAlign }}>
                  <span style={{ fontSize: 9, color: GOLD, fontWeight: 'bold' }}>{isRtl ? 'لەدایکبوون' : 'DOB'}: </span>
                  <span style={{ fontSize: 10, color: TEXT_PRIMARY }}>{data.personal.dateOfBirth}</span>
                </div>
              )}
              {data.personal.gender && (
                <div className="resume-entry" style={{ marginBottom: 5, textAlign }}>
                  <span style={{ fontSize: 9, color: GOLD, fontWeight: 'bold' }}>{isRtl ? 'ڕەگەز' : 'Gender'}: </span>
                  <span style={{ fontSize: 10, color: TEXT_PRIMARY }}>{data.personal.gender}</span>
                </div>
              )}
              {data.personal.nationality && (
                <div className="resume-entry" style={{ marginBottom: 5, textAlign }}>
                  <span style={{ fontSize: 9, color: GOLD, fontWeight: 'bold' }}>{isRtl ? 'نەتەوە' : 'Nationality'}: </span>
                  <span style={{ fontSize: 10, color: TEXT_PRIMARY }}>{data.personal.nationality}</span>
                </div>
              )}
              {data.personal.maritalStatus && (
                <div className="resume-entry" style={{ marginBottom: 5, textAlign }}>
                  <span style={{ fontSize: 9, color: GOLD, fontWeight: 'bold' }}>{isRtl ? 'باری خێزانی' : 'Status'}: </span>
                  <span style={{ fontSize: 10, color: TEXT_PRIMARY }}>{data.personal.maritalStatus}</span>
                </div>
              )}
              {data.personal.country && (
                <div className="resume-entry" style={{ marginBottom: 5, textAlign }}>
                  <span style={{ fontSize: 9, color: GOLD, fontWeight: 'bold' }}>{isRtl ? 'وڵات' : 'Country'}: </span>
                  <span style={{ fontSize: 10, color: TEXT_PRIMARY }}>{data.personal.country}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ===== MAIN CONTENT ===== */}
        <div style={{
          flex: 1,
          padding: '40px 36px',
          WebkitBoxDecorationBreak: 'clone' as const,
          boxDecorationBreak: 'clone' as const,
        }}>
          {/* Header: Name + Title */}
          <div className="resume-entry" style={{ marginBottom: 28 }}>
            <div style={{
              fontSize: 28,
              fontWeight: 'bold',
              color: TEXT_PRIMARY,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              lineHeight: isRtl ? 1.5 : 1.2,
              textAlign,
              marginBottom: 4,
            }}>
              {data.personal.fullName || 'Your Name'}
            </div>
            {data.personal.title && (
              <>
                <div style={{
                  fontSize: 14,
                  color: GOLD,
                  lineHeight: isRtl ? 1.5 : 1.3,
                  textAlign,
                  marginBottom: 6,
                }}>
                  {data.personal.title}
                </div>
                <div style={{ height: 2, backgroundColor: GOLD, width: 60 }} />
              </>
            )}
            {data.personal.location && (
              <div style={{
                fontSize: 10,
                color: TEXT_MUTED,
                textAlign,
                marginTop: 8,
              }}>
                {data.personal.location}
              </div>
            )}
          </div>

          {/* Professional Experience */}
          {data.experience && data.experience.length > 0 && (
            <div className="resume-section" style={{ marginBottom: 24 }}>
              <ElegantSectionTitle isRtl={isRtl}>
                {isRtl ? 'ئەزموونی کاری' : 'Professional Experience'}
              </ElegantSectionTitle>
              {data.experience.map((exp) => (
                <div key={exp.id} className="resume-entry" style={{ marginBottom: 16 }}>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                  }}>
                    <div style={{
                      fontSize: 13,
                      fontWeight: 'bold',
                      color: TEXT_PRIMARY,
                      lineHeight: isRtl ? 1.6 : 1.4,
                    }}>
                      {exp.jobTitle}
                    </div>
                    <div style={{
                      fontSize: 10,
                      color: GOLD,
                      fontWeight: 'bold',
                      flexShrink: 0,
                    }}>
                      {formatDateRange(exp.startDate, exp.endDate, exp.current)}
                    </div>
                  </div>
                  <div style={{
                    fontSize: 11,
                    color: TEXT_MUTED,
                    textAlign,
                    marginBottom: 6,
                    lineHeight: isRtl ? 1.5 : 1.3,
                  }}>
                    {exp.company}{exp.location ? ` | ${exp.location}` : ''}
                  </div>
                  {exp.description && (
                    <div
                      className="resume-desc"
                      style={{
                        fontSize: 11,
                        lineHeight: isRtl ? 1.8 : 1.6,
                        color: TEXT_MUTED,
                        textAlign,
                      }}
                      dangerouslySetInnerHTML={{ __html: exp.description }}
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Projects */}
          {data.projects && data.projects.length > 0 && (
            <div className="resume-section" style={{ marginBottom: 24 }}>
              <ElegantSectionTitle isRtl={isRtl}>
                {isRtl ? 'پڕۆژەکان' : 'Projects'}
              </ElegantSectionTitle>
              {data.projects.map((proj) => (
                <div key={proj.id} className="resume-entry" style={{ marginBottom: 14 }}>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                  }}>
                    <div style={{
                      fontSize: 12,
                      fontWeight: 'bold',
                      color: TEXT_PRIMARY,
                      lineHeight: isRtl ? 1.6 : 1.4,
                    }}>
                      {proj.name}
                    </div>
                    {(proj.startDate || proj.endDate) && (
                      <div style={{ fontSize: 10, color: GOLD, flexShrink: 0 }}>
                        {formatDateRange(proj.startDate, proj.endDate)}
                      </div>
                    )}
                  </div>
                  {proj.technologies && (
                    <div style={{ fontSize: 10, color: TEXT_MUTED, textAlign, marginBottom: 2 }}>
                      {proj.technologies}
                    </div>
                  )}
                  {proj.description && (
                    <div
                      className="resume-desc"
                      style={{ fontSize: 11, lineHeight: isRtl ? 1.8 : 1.6, color: TEXT_MUTED, textAlign }}
                      dangerouslySetInnerHTML={{ __html: proj.description }}
                    />
                  )}
                  {proj.link && (
                    <div style={{ fontSize: 10, color: GOLD, textAlign, marginTop: 2, direction: 'ltr', unicodeBidi: 'plaintext' as const }}>
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
              <ElegantSectionTitle isRtl={isRtl}>
                {isRtl ? 'بڕوانامەکان' : 'Certifications'}
              </ElegantSectionTitle>
              {data.certifications.map((cert) => (
                <div key={cert.id} className="resume-entry" style={{ marginBottom: 12 }}>
                  <div style={{
                    fontSize: 12,
                    fontWeight: 'bold',
                    color: TEXT_PRIMARY,
                    textAlign,
                    lineHeight: isRtl ? 1.6 : 1.4,
                  }}>
                    {cert.name}
                  </div>
                  <div style={{ fontSize: 11, color: TEXT_MUTED, textAlign }}>{cert.issuer}</div>
                  {cert.date && (
                    <div style={{ fontSize: 10, color: GOLD, textAlign }}>
                      {cert.date}{cert.expiryDate ? ` - ${cert.expiryDate}` : ''}
                    </div>
                  )}
                  {cert.credentialId && (
                    <div style={{ fontSize: 9, color: TEXT_MUTED, textAlign, direction: 'ltr', unicodeBidi: 'plaintext' as const }}>
                      <span style={{ unicodeBidi: 'isolate' as const }}>ID: {cert.credentialId}</span>
                    </div>
                  )}
                  {cert.url && (
                    <div style={{ fontSize: 9, color: GOLD, textAlign, marginTop: 2, direction: 'ltr', unicodeBidi: 'plaintext' as const }}>
                      <span style={{ unicodeBidi: 'isolate' as const }}>{cert.url}</span>
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
