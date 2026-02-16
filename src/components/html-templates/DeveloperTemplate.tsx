import React from 'react';
import type { HtmlTemplateProps } from './types';
import { Watermark } from './shared/Watermark';
import { ProfilePhoto } from './shared/ProfilePhoto';
import { isRTLText } from '@/lib/rtl';

const SIDEBAR_BG = '#181825';
const MAIN_BG = '#1e1e2e';
const GREEN = '#a6e3a1';
const BLUE = '#89b4fa';
const TEXT_PRIMARY = '#cdd6f4';
const TEXT_MUTED = '#6c7086';
const TAG_BG = '#313244';

const SIDEBAR_WIDTH = 260;
const sidebarPct = (SIDEBAR_WIDTH / 794 * 100).toFixed(3);

function SidebarSectionTitle({ children, isRtl }: { children: React.ReactNode; isRtl: boolean }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div role="heading" aria-level={2} style={{
        fontSize: 11,
        fontWeight: 'bold',
        color: GREEN,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        paddingBottom: 6,
        borderBottom: `1px solid ${GREEN}`,
        textAlign: isRtl ? 'right' as const : 'left' as const,
      }}>
        {children}
      </div>
    </div>
  );
}

function MainSectionTitle({ children, isRtl }: { children: React.ReactNode; isRtl: boolean }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <h2 style={{
        fontSize: 14,
        fontWeight: 'bold',
        color: GREEN,
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        margin: 0,
        paddingBottom: 6,
        borderBottom: `1px solid ${GREEN}`,
        textAlign: isRtl ? 'right' as const : 'left' as const,
      }}>
        <span style={{ color: TEXT_MUTED, fontWeight: 'normal' }}>{'// '}</span>
        {children}
      </h2>
    </div>
  );
}

export function DeveloperTemplate({ data, watermark }: HtmlTemplateProps) {
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
        .resume-desc li { margin-bottom: 2px; }
        [dir="rtl"] .resume-desc ul, [dir="rtl"] .resume-desc ol { padding-left: 0; padding-right: 1.2em; }
        .resume-entry { break-inside: avoid; page-break-inside: avoid; }
        .resume-section h2 { break-after: avoid; page-break-after: avoid; }
        .developer-bg { display: none; }
        @media print {
          .developer-bg {
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

      {/* Print background: fixed div repeats on every page */}
      <div className="developer-bg" />

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
          {/* Profile Photo */}
          {data.personal.profileImage && (
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
              <ProfilePhoto
                src={data.personal.profileImage}
                size={110}
                borderColor={GREEN}
                borderWidth={3}
              />
            </div>
          )}

          {/* Name & Title */}
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{
              fontSize: 20,
              fontWeight: 'bold',
              color: '#ffffff',
              marginBottom: 6,
              lineHeight: isRtl ? 1.6 : 1.3,
            }}>
              {data.personal.fullName || 'Your Name'}
            </div>
            {data.personal.title && (
              <div style={{
                fontSize: 12,
                color: GREEN,
                lineHeight: isRtl ? 1.5 : 1.3,
                fontStyle: 'italic',
              }}>
                <span style={{ color: TEXT_MUTED }}>{'// '}</span>
                {data.personal.title}
              </div>
            )}
          </div>

          {/* Contact */}
          <div style={{ marginBottom: 24 }}>
            <SidebarSectionTitle isRtl={isRtl}>{isRtl ? 'پەیوەندی' : 'Contact'}</SidebarSectionTitle>
            {data.personal.email && (
              <div className="resume-entry" style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 10, color: GREEN, fontWeight: 'bold', textAlign, marginBottom: 1 }}>
                  {isRtl ? 'ئیمەیڵ' : 'email:'}
                </div>
                <div style={{ fontSize: 11, color: TEXT_PRIMARY, textAlign, direction: 'ltr', unicodeBidi: 'plaintext' as const }}>
                  <span style={{ unicodeBidi: 'isolate' as const }}>{data.personal.email}</span>
                </div>
              </div>
            )}
            {data.personal.phone && (
              <div className="resume-entry" style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 10, color: GREEN, fontWeight: 'bold', textAlign, marginBottom: 1 }}>
                  {isRtl ? 'ژمارەی مۆبایل' : 'phone:'}
                </div>
                <div style={{ fontSize: 11, color: TEXT_PRIMARY, textAlign, direction: 'ltr', unicodeBidi: 'plaintext' as const }}>
                  <span style={{ unicodeBidi: 'isolate' as const }}>{data.personal.phone}</span>
                </div>
              </div>
            )}
            {data.personal.location && (
              <div className="resume-entry" style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 10, color: GREEN, fontWeight: 'bold', textAlign, marginBottom: 1 }}>
                  {isRtl ? 'شوێن' : 'location:'}
                </div>
                <div style={{ fontSize: 11, color: TEXT_PRIMARY, textAlign }}>{data.personal.location}</div>
              </div>
            )}
            {data.personal.website && (
              <div className="resume-entry" style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 10, color: GREEN, fontWeight: 'bold', textAlign, marginBottom: 1 }}>
                  {isRtl ? 'وێبسایت' : 'website:'}
                </div>
                <div style={{ fontSize: 11, color: BLUE, textAlign, direction: 'ltr', unicodeBidi: 'plaintext' as const }}>
                  <span style={{ unicodeBidi: 'isolate' as const }}>{data.personal.website}</span>
                </div>
              </div>
            )}
            {data.personal.linkedin && (
              <div className="resume-entry" style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 10, color: GREEN, fontWeight: 'bold', textAlign, marginBottom: 1 }}>
                  github:
                </div>
                <div style={{ fontSize: 11, color: BLUE, textAlign, direction: 'ltr', unicodeBidi: 'plaintext' as const }}>
                  <span style={{ unicodeBidi: 'isolate' as const }}>{data.personal.linkedin}</span>
                </div>
              </div>
            )}
          </div>

          {/* Skills — tag chips */}
          {data.skills && data.skills.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <SidebarSectionTitle isRtl={isRtl}>{isRtl ? 'تواناییەکان' : 'Tech Stack'}</SidebarSectionTitle>
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 6,
                justifyContent: isRtl ? 'flex-end' : 'flex-start',
              }}>
                {data.skills.map((skill) => (
                  <div key={skill.id} className="resume-entry" style={{
                    fontSize: 10,
                    color: TEXT_PRIMARY,
                    backgroundColor: TAG_BG,
                    borderRadius: 4,
                    padding: '3px 8px',
                    lineHeight: isRtl ? 1.6 : 1.4,
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
            <div style={{ marginBottom: 24 }}>
              <SidebarSectionTitle isRtl={isRtl}>{isRtl ? 'زمانەکان' : 'Languages'}</SidebarSectionTitle>
              {data.languages.map((lang) => (
                <div key={lang.id} className="resume-entry" style={{
                  fontSize: 11,
                  color: TEXT_PRIMARY,
                  marginBottom: 6,
                  textAlign,
                  lineHeight: isRtl ? 1.6 : 1.4,
                }}>
                  {lang.name}
                  <span style={{ color: TEXT_MUTED, fontSize: 10 }}> — {lang.proficiency}</span>
                </div>
              ))}
            </div>
          )}

          {/* Demographics */}
          {hasDemographics && (
            <div style={{ marginBottom: 24 }}>
              <SidebarSectionTitle isRtl={isRtl}>{isRtl ? 'زانیاری کەسی' : 'Personal'}</SidebarSectionTitle>
              {data.personal.dateOfBirth && (
                <div className="resume-entry" style={{ marginBottom: 6, textAlign }}>
                  <span style={{ fontSize: 10, color: GREEN, fontWeight: 'bold' }}>{isRtl ? 'لەدایکبوون' : 'DOB'}: </span>
                  <span style={{ fontSize: 11, color: TEXT_PRIMARY }}>{data.personal.dateOfBirth}</span>
                </div>
              )}
              {data.personal.gender && (
                <div className="resume-entry" style={{ marginBottom: 6, textAlign }}>
                  <span style={{ fontSize: 10, color: GREEN, fontWeight: 'bold' }}>{isRtl ? 'ڕەگەز' : 'Gender'}: </span>
                  <span style={{ fontSize: 11, color: TEXT_PRIMARY }}>{data.personal.gender}</span>
                </div>
              )}
              {data.personal.nationality && (
                <div className="resume-entry" style={{ marginBottom: 6, textAlign }}>
                  <span style={{ fontSize: 10, color: GREEN, fontWeight: 'bold' }}>{isRtl ? 'نەتەوە' : 'Nationality'}: </span>
                  <span style={{ fontSize: 11, color: TEXT_PRIMARY }}>{data.personal.nationality}</span>
                </div>
              )}
              {data.personal.maritalStatus && (
                <div className="resume-entry" style={{ marginBottom: 6, textAlign }}>
                  <span style={{ fontSize: 10, color: GREEN, fontWeight: 'bold' }}>{isRtl ? 'باری خێزانی' : 'Status'}: </span>
                  <span style={{ fontSize: 11, color: TEXT_PRIMARY }}>{data.personal.maritalStatus}</span>
                </div>
              )}
              {data.personal.country && (
                <div className="resume-entry" style={{ marginBottom: 6, textAlign }}>
                  <span style={{ fontSize: 10, color: GREEN, fontWeight: 'bold' }}>{isRtl ? 'وڵات' : 'Country'}: </span>
                  <span style={{ fontSize: 11, color: TEXT_PRIMARY }}>{data.personal.country}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ===== MAIN CONTENT ===== */}
        <div style={{
          flex: 1,
          padding: '40px 32px',
          WebkitBoxDecorationBreak: 'clone' as const,
          boxDecorationBreak: 'clone' as const,
        }}>
          {/* Summary / Profile */}
          {data.summary && (
            <div className="resume-section resume-entry" style={{ marginBottom: 24 }}>
              <MainSectionTitle isRtl={isRtl}>{isRtl ? 'پڕۆفایل' : 'Profile'}</MainSectionTitle>
              <p style={{
                fontSize: 11,
                lineHeight: isRtl ? 1.8 : 1.7,
                color: TEXT_MUTED,
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
                    color: TEXT_PRIMARY,
                    textAlign,
                    lineHeight: isRtl ? 1.6 : 1.4,
                  }}>
                    {exp.jobTitle}
                  </div>
                  <div style={{
                    fontSize: 11,
                    color: TEXT_MUTED,
                    textAlign,
                    marginBottom: 2,
                    lineHeight: isRtl ? 1.5 : 1.3,
                  }}>
                    {exp.company}{exp.location ? ` | ${exp.location}` : ''}
                  </div>
                  <div style={{
                    fontSize: 10,
                    color: BLUE,
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

          {/* Education */}
          {data.education && data.education.length > 0 && (
            <div className="resume-section" style={{ marginBottom: 24 }}>
              <MainSectionTitle isRtl={isRtl}>{isRtl ? 'خوێندن' : 'Education'}</MainSectionTitle>
              {data.education.map((edu) => (
                <div key={edu.id} className="resume-entry" style={{ marginBottom: 14 }}>
                  <div style={{
                    fontSize: 13,
                    fontWeight: 'bold',
                    color: TEXT_PRIMARY,
                    textAlign,
                    lineHeight: isRtl ? 1.6 : 1.4,
                  }}>
                    {edu.degree}{edu.field ? ` ${isRtl ? 'لە' : 'in'} ${edu.field}` : ''}
                  </div>
                  <div style={{
                    fontSize: 11,
                    color: TEXT_MUTED,
                    textAlign,
                    marginBottom: 2,
                    lineHeight: isRtl ? 1.5 : 1.3,
                  }}>
                    {edu.school}{edu.location ? ` | ${edu.location}` : ''}
                  </div>
                  <div style={{ fontSize: 10, color: BLUE, textAlign }}>
                    {formatDateRange(edu.startDate, edu.endDate)}
                  </div>
                  {edu.gpa && (
                    <div style={{ fontSize: 10, color: TEXT_MUTED, textAlign, marginTop: 2 }}>
                      {isRtl ? 'نمرەی کۆی گشتی' : 'GPA'}: {edu.gpa}
                    </div>
                  )}
                  {edu.achievements && (
                    <div
                      className="resume-desc"
                      style={{ fontSize: 10, lineHeight: isRtl ? 1.8 : 1.5, color: TEXT_MUTED, marginTop: 4, textAlign }}
                      dangerouslySetInnerHTML={{ __html: edu.achievements }}
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Projects */}
          {data.projects && data.projects.length > 0 && (
            <div className="resume-section" style={{ marginBottom: 24 }}>
              <MainSectionTitle isRtl={isRtl}>{isRtl ? 'پڕۆژەکان' : 'Projects'}</MainSectionTitle>
              {data.projects.map((proj) => (
                <div key={proj.id} className="resume-entry" style={{ marginBottom: 14 }}>
                  <div style={{
                    fontSize: 12,
                    fontWeight: 'bold',
                    color: TEXT_PRIMARY,
                    textAlign,
                    lineHeight: isRtl ? 1.6 : 1.4,
                  }}>
                    {proj.name}
                  </div>
                  {proj.technologies && (
                    <div style={{ fontSize: 10, color: GREEN, textAlign, marginBottom: 2, fontStyle: 'italic' }}>
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
                    <div style={{ fontSize: 10, color: BLUE, textAlign, marginTop: 2, direction: 'ltr', unicodeBidi: 'plaintext' as const }}>
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
                    color: TEXT_PRIMARY,
                    textAlign,
                    lineHeight: isRtl ? 1.6 : 1.4,
                  }}>
                    {cert.name}
                  </div>
                  <div style={{ fontSize: 11, color: TEXT_MUTED, textAlign }}>{cert.issuer}</div>
                  {cert.date && (
                    <div style={{ fontSize: 10, color: BLUE, textAlign }}>
                      {cert.date}{cert.expiryDate ? ` - ${cert.expiryDate}` : ''}
                    </div>
                  )}
                  {cert.url && (
                    <div style={{ fontSize: 10, color: BLUE, textAlign, marginTop: 2, direction: 'ltr', unicodeBidi: 'plaintext' as const }}>
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
