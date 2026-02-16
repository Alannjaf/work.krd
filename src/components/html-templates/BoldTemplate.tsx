import React from 'react';
import type { HtmlTemplateProps } from './types';
import { Watermark } from './shared/Watermark';
import { isRTLText } from '@/lib/rtl';

const SIDEBAR_BG = '#2b2b2b';
const SIDEBAR_TEXT = '#ffffff';
const SIDEBAR_MUTED = '#cccccc';
const MAIN_TEXT = '#333333';
const MAIN_MUTED = '#666666';
const SIDEBAR_WIDTH = 280;
const PHOTO_SIZE = 150;

function getSkillPercent(level?: string): number {
  if (!level) return 70;
  const l = level.toLowerCase();
  if (l === 'expert' || l === 'native') return 95;
  if (l === 'advanced' || l === 'fluent') return 85;
  if (l === 'intermediate' || l === 'proficient') return 65;
  if (l === 'beginner' || l === 'basic' || l === 'elementary') return 35;
  return 70;
}

function BoldSidebarTitle({ children, isRtl }: { children: React.ReactNode; isRtl: boolean }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{
        fontSize: 12,
        fontWeight: 'bold',
        color: SIDEBAR_TEXT,
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        textAlign: isRtl ? 'right' as const : 'left' as const,
        marginBottom: 6,
      }}>
        {children}
      </div>
      <div style={{ height: 1.5, backgroundColor: '#555555' }} />
    </div>
  );
}

function BoldMainTitle({ children, isRtl }: { children: React.ReactNode; isRtl: boolean }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <h2 style={{
        fontSize: 14,
        fontWeight: 'bold',
        color: MAIN_TEXT,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        margin: 0,
        textAlign: isRtl ? 'right' as const : 'left' as const,
        marginBottom: 6,
      }}>
        {children}
      </h2>
      <div style={{ height: 2, backgroundColor: MAIN_TEXT }} />
    </div>
  );
}

export function BoldTemplate({ data, watermark }: HtmlTemplateProps) {
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
  const hasPhoto = !!data.personal.profileImage;

  const hasDemographics = data.personal.dateOfBirth || data.personal.gender ||
    data.personal.nationality || data.personal.maritalStatus || data.personal.country;

  // Photo sits centered at the column boundary (SIDEBAR_WIDTH)
  // LTR: photo left = SIDEBAR_WIDTH - PHOTO_SIZE/2 = 205px
  // RTL: photo right = SIDEBAR_WIDTH - PHOTO_SIZE/2 = 205px (direction handles flip)
  const photoEdgeOffset = SIDEBAR_WIDTH - PHOTO_SIZE / 2; // 205px from the sidebar's starting edge

  return (
    <div style={{
      width: '794px',
      fontFamily: "system-ui, -apple-system, 'Noto Sans Arabic', sans-serif",
      color: MAIN_TEXT,
      direction: dir,
      position: 'relative',
      '--resume-page-bg': isRtl
        ? `linear-gradient(to left, ${SIDEBAR_BG} ${sidebarPct}%, #ffffff ${sidebarPct}%)`
        : `linear-gradient(to right, ${SIDEBAR_BG} ${sidebarPct}%, #ffffff ${sidebarPct}%)`,
    } as React.CSSProperties}>
      <style dangerouslySetInnerHTML={{ __html: `
        .resume-desc ul, .resume-desc ol { list-style: disc; padding-left: 1.2em; padding-right: 0; margin: 4px 0; }
        .resume-desc ol { list-style: decimal; }
        .resume-desc li { margin-bottom: 2px; }
        [dir="rtl"] .resume-desc ul, [dir="rtl"] .resume-desc ol { padding-left: 0; padding-right: 1.2em; }
        .resume-entry { break-inside: avoid; page-break-inside: avoid; }
        .resume-section h2 { break-after: avoid; page-break-after: avoid; }
        .bold-sidebar-bg { display: none; }
        @media print {
          .bold-sidebar-bg {
            display: block !important;
            position: fixed !important;
            top: 0 !important;
            bottom: 0 !important;
            ${isRtl ? 'right' : 'left'}: 0;
            width: ${SIDEBAR_WIDTH}px;
            background-color: ${SIDEBAR_BG};
            z-index: 0;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}} />

      {watermark && <Watermark />}

      {/* Print background: sidebar on every page */}
      <div className="bold-sidebar-bg" />

      {/* Profile photo — absolutely positioned at column boundary, top center */}
      {hasPhoto && (
        <div style={{
          position: 'absolute',
          top: 40,
          ...(isRtl ? { right: photoEdgeOffset } : { left: photoEdgeOffset }),
          zIndex: 10,
        }}>
          <img
            src={data.personal.profileImage}
            alt=""
            style={{
              width: PHOTO_SIZE,
              height: PHOTO_SIZE,
              objectFit: 'cover',
              display: 'block',
            }}
          />
        </div>
      )}

      <div style={{
        display: 'flex',
        flexDirection: 'row',
        position: 'relative',
        zIndex: 1,
      }}>
        {/* ===== SIDEBAR (dark) ===== */}
        <div style={{
          width: SIDEBAR_WIDTH,
          padding: '40px 24px',
          flexShrink: 0,
          WebkitBoxDecorationBreak: 'clone' as const,
          boxDecorationBreak: 'clone' as const,
        }}>
          {/* ── Header zone: Name + Title (beside photo) ── */}
          <div className="resume-entry" style={{
            minHeight: hasPhoto ? PHOTO_SIZE + 10 : 0,
            ...(hasPhoto ? (isRtl ? { paddingLeft: 70 } : { paddingRight: 70 }) : {}),
            marginBottom: 24,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}>
            <div style={{
              fontSize: 26,
              fontWeight: 'bold',
              color: SIDEBAR_TEXT,
              textTransform: 'uppercase',
              lineHeight: isRtl ? 1.4 : 1.15,
              textAlign,
            }}>
              {data.personal.fullName || 'Your Name'}
            </div>
            {data.personal.title && (
              <div style={{
                fontSize: 11,
                color: SIDEBAR_MUTED,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                lineHeight: isRtl ? 1.5 : 1.3,
                textAlign,
                marginTop: 6,
              }}>
                {data.personal.title}
              </div>
            )}
          </div>

          {/* ── Below header: sidebar sections ── */}

          {/* Contact */}
          <div style={{ marginBottom: 24 }}>
            <BoldSidebarTitle isRtl={isRtl}>
              {isRtl ? 'پەیوەندی' : 'Contact'}
            </BoldSidebarTitle>
            {data.personal.phone && (
              <div className="resume-entry" style={{ marginBottom: 8, textAlign }}>
                <div style={{ fontSize: 10, color: SIDEBAR_TEXT, direction: 'ltr', unicodeBidi: 'plaintext' as const }}>
                  <span style={{ unicodeBidi: 'isolate' as const }}>{data.personal.phone}</span>
                </div>
              </div>
            )}
            {data.personal.email && (
              <div className="resume-entry" style={{ marginBottom: 8, textAlign }}>
                <div style={{ fontSize: 10, color: SIDEBAR_TEXT, direction: 'ltr', unicodeBidi: 'plaintext' as const }}>
                  <span style={{ unicodeBidi: 'isolate' as const }}>{data.personal.email}</span>
                </div>
              </div>
            )}
            {data.personal.website && (
              <div className="resume-entry" style={{ marginBottom: 8, textAlign }}>
                <div style={{ fontSize: 10, color: SIDEBAR_TEXT, direction: 'ltr', unicodeBidi: 'plaintext' as const }}>
                  <span style={{ unicodeBidi: 'isolate' as const }}>{data.personal.website}</span>
                </div>
              </div>
            )}
            {data.personal.location && (
              <div className="resume-entry" style={{ marginBottom: 8, textAlign }}>
                <div style={{ fontSize: 10, color: SIDEBAR_TEXT }}>{data.personal.location}</div>
              </div>
            )}
            {data.personal.linkedin && (
              <div className="resume-entry" style={{ marginBottom: 8, textAlign }}>
                <div style={{ fontSize: 10, color: SIDEBAR_TEXT, direction: 'ltr', unicodeBidi: 'plaintext' as const }}>
                  <span style={{ unicodeBidi: 'isolate' as const }}>{data.personal.linkedin}</span>
                </div>
              </div>
            )}
          </div>

          {/* Skills with progress bars */}
          {data.skills && data.skills.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <BoldSidebarTitle isRtl={isRtl}>
                {isRtl ? 'تواناییەکان' : 'Skills'}
              </BoldSidebarTitle>
              {data.skills.map((skill) => (
                <div key={skill.id} className="resume-entry" style={{ marginBottom: 10 }}>
                  <div style={{
                    fontSize: 10,
                    color: SIDEBAR_TEXT,
                    textAlign,
                    marginBottom: 4,
                    lineHeight: isRtl ? 1.6 : 1.4,
                  }}>
                    {skill.name}
                  </div>
                  <div style={{
                    height: 4,
                    backgroundColor: '#555555',
                    borderRadius: 2,
                  }}>
                    <div style={{
                      height: '100%',
                      backgroundColor: SIDEBAR_TEXT,
                      borderRadius: 2,
                      width: `${getSkillPercent(skill.level)}%`,
                    }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Languages */}
          {data.languages && data.languages.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <BoldSidebarTitle isRtl={isRtl}>
                {isRtl ? 'زمانەکان' : 'Languages'}
              </BoldSidebarTitle>
              {data.languages.map((lang) => (
                <div key={lang.id} className="resume-entry" style={{
                  fontSize: 10,
                  color: SIDEBAR_TEXT,
                  marginBottom: 5,
                  textAlign,
                  lineHeight: isRtl ? 1.6 : 1.4,
                }}>
                  {lang.name}
                  <span style={{ color: SIDEBAR_MUTED, fontSize: 9 }}> — {lang.proficiency}</span>
                </div>
              ))}
            </div>
          )}

          {/* Demographics */}
          {hasDemographics && (
            <div style={{ marginBottom: 24 }}>
              <BoldSidebarTitle isRtl={isRtl}>
                {isRtl ? 'زانیاری کەسی' : 'Personal'}
              </BoldSidebarTitle>
              {data.personal.dateOfBirth && (
                <div className="resume-entry" style={{ marginBottom: 5, textAlign }}>
                  <span style={{ fontSize: 9, color: SIDEBAR_MUTED }}>{isRtl ? 'لەدایکبوون' : 'DOB'}: </span>
                  <span style={{ fontSize: 10, color: SIDEBAR_TEXT }}>{data.personal.dateOfBirth}</span>
                </div>
              )}
              {data.personal.gender && (
                <div className="resume-entry" style={{ marginBottom: 5, textAlign }}>
                  <span style={{ fontSize: 9, color: SIDEBAR_MUTED }}>{isRtl ? 'ڕەگەز' : 'Gender'}: </span>
                  <span style={{ fontSize: 10, color: SIDEBAR_TEXT }}>{data.personal.gender}</span>
                </div>
              )}
              {data.personal.nationality && (
                <div className="resume-entry" style={{ marginBottom: 5, textAlign }}>
                  <span style={{ fontSize: 9, color: SIDEBAR_MUTED }}>{isRtl ? 'نەتەوە' : 'Nationality'}: </span>
                  <span style={{ fontSize: 10, color: SIDEBAR_TEXT }}>{data.personal.nationality}</span>
                </div>
              )}
              {data.personal.maritalStatus && (
                <div className="resume-entry" style={{ marginBottom: 5, textAlign }}>
                  <span style={{ fontSize: 9, color: SIDEBAR_MUTED }}>{isRtl ? 'باری خێزانی' : 'Status'}: </span>
                  <span style={{ fontSize: 10, color: SIDEBAR_TEXT }}>{data.personal.maritalStatus}</span>
                </div>
              )}
              {data.personal.country && (
                <div className="resume-entry" style={{ marginBottom: 5, textAlign }}>
                  <span style={{ fontSize: 9, color: SIDEBAR_MUTED }}>{isRtl ? 'وڵات' : 'Country'}: </span>
                  <span style={{ fontSize: 10, color: SIDEBAR_TEXT }}>{data.personal.country}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ===== MAIN CONTENT (white) ===== */}
        <div style={{
          flex: 1,
          padding: '40px 36px',
          backgroundColor: '#ffffff',
          WebkitBoxDecorationBreak: 'clone' as const,
          boxDecorationBreak: 'clone' as const,
        }}>
          {/* ── Header zone: HELLO! + Summary (beside photo) ── */}
          <div className="resume-section resume-entry" style={{
            minHeight: hasPhoto ? PHOTO_SIZE + 10 : 0,
            ...(hasPhoto ? (isRtl ? { paddingRight: 50 } : { paddingLeft: 50 }) : {}),
            marginBottom: 28,
          }}>
            <div style={{
              fontSize: 28,
              fontWeight: 'bold',
              color: MAIN_TEXT,
              textAlign,
              marginBottom: 10,
              lineHeight: isRtl ? 1.5 : 1.2,
            }}>
              {isRtl ? 'سڵاو !' : 'HELLO !'}
            </div>
            {data.summary && (
              <p style={{
                fontSize: 11,
                lineHeight: isRtl ? 1.8 : 1.7,
                color: MAIN_MUTED,
                textAlign: 'justify',
                margin: 0,
              }}>
                {data.summary}
              </p>
            )}
          </div>

          {/* ── Below header: main content sections ── */}

          {/* Education — 2-column grid */}
          {data.education && data.education.length > 0 && (
            <div className="resume-section" style={{ marginBottom: 24 }}>
              <BoldMainTitle isRtl={isRtl}>
                {isRtl ? 'خوێندن' : 'Education'}
              </BoldMainTitle>
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 16,
                flexDirection: 'row',
              }}>
                {data.education.map((edu) => (
                  <div key={edu.id} className="resume-entry" style={{
                    flex: '1 1 45%',
                    minWidth: 180,
                    marginBottom: 8,
                  }}>
                    <div style={{ fontSize: 10, color: MAIN_MUTED, textAlign, marginBottom: 2 }}>
                      {formatDateRange(edu.startDate, edu.endDate)}
                    </div>
                    <div style={{
                      fontSize: 12,
                      fontWeight: 'bold',
                      color: MAIN_TEXT,
                      textTransform: 'uppercase',
                      textAlign,
                      lineHeight: isRtl ? 1.6 : 1.3,
                      marginBottom: 2,
                    }}>
                      {edu.degree}{edu.field ? ` ${isRtl ? 'لە' : 'in'} ${edu.field}` : ''}
                    </div>
                    <div style={{ fontSize: 10, color: MAIN_MUTED, textAlign, lineHeight: isRtl ? 1.5 : 1.3 }}>
                      {edu.school}{edu.location ? `, ${edu.location}` : ''}
                    </div>
                    {edu.gpa && (
                      <div style={{ fontSize: 10, color: MAIN_MUTED, textAlign }}>
                        {isRtl ? 'نمرەی کۆی گشتی' : 'GPA'}: {edu.gpa}
                      </div>
                    )}
                    {edu.achievements && (
                      <div
                        className="resume-desc"
                        style={{ fontSize: 10, lineHeight: isRtl ? 1.7 : 1.5, color: MAIN_MUTED, marginTop: 4, textAlign }}
                        dangerouslySetInnerHTML={{ __html: edu.achievements }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Work Experience */}
          {data.experience && data.experience.length > 0 && (
            <div className="resume-section" style={{ marginBottom: 24 }}>
              <BoldMainTitle isRtl={isRtl}>
                {isRtl ? 'ئەزموونی کاری' : 'Work Experience'}
              </BoldMainTitle>
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
                      color: MAIN_TEXT,
                      textTransform: 'uppercase',
                      lineHeight: isRtl ? 1.6 : 1.4,
                    }}>
                      {exp.jobTitle}
                    </div>
                    <div style={{
                      fontSize: 10,
                      color: MAIN_MUTED,
                      flexShrink: 0,
                    }}>
                      {formatDateRange(exp.startDate, exp.endDate, exp.current)}
                    </div>
                  </div>
                  <div style={{
                    fontSize: 11,
                    color: MAIN_MUTED,
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

          {/* Projects */}
          {data.projects && data.projects.length > 0 && (
            <div className="resume-section" style={{ marginBottom: 24 }}>
              <BoldMainTitle isRtl={isRtl}>
                {isRtl ? 'پڕۆژەکان' : 'Projects'}
              </BoldMainTitle>
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
                      color: MAIN_TEXT,
                      lineHeight: isRtl ? 1.6 : 1.4,
                    }}>
                      {proj.name}
                    </div>
                    {(proj.startDate || proj.endDate) && (
                      <div style={{ fontSize: 10, color: MAIN_MUTED, flexShrink: 0 }}>
                        {formatDateRange(proj.startDate, proj.endDate)}
                      </div>
                    )}
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
                    <div style={{ fontSize: 10, color: MAIN_TEXT, textAlign, marginTop: 2, direction: 'ltr', unicodeBidi: 'plaintext' as const }}>
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
              <BoldMainTitle isRtl={isRtl}>
                {isRtl ? 'بڕوانامەکان' : 'Certifications'}
              </BoldMainTitle>
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
                  {cert.credentialId && (
                    <div style={{ fontSize: 9, color: MAIN_MUTED, textAlign, direction: 'ltr', unicodeBidi: 'plaintext' as const }}>
                      <span style={{ unicodeBidi: 'isolate' as const }}>ID: {cert.credentialId}</span>
                    </div>
                  )}
                  {cert.url && (
                    <div style={{ fontSize: 9, color: MAIN_TEXT, textAlign, marginTop: 2, direction: 'ltr', unicodeBidi: 'plaintext' as const }}>
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
