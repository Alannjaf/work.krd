import React from 'react';
import type { HtmlTemplateProps } from './types';
import { Watermark } from './shared/Watermark';
import { ProfilePhoto } from './shared/ProfilePhoto';
import { isRTLText } from '@/lib/rtl';

// ── Color Palette ──────────────────────────────────
const SIDEBAR_BG = '#2D2B55';
const SIDEBAR_WIDTH = 274;
const SIDEBAR_TEXT = '#E8E8F0';
const SIDEBAR_MUTED = '#9B99B5';
const ACCENT_CORAL = '#FF6B6B';
const ACCENT_TEAL = '#4ECDC4';
const ACCENT_YELLOW = '#FFE66D';
const ACCENT_MINT = '#A8E6CF';
const ACCENT_LAVENDER = '#C3A6F2';
const TEXT_COLOR = '#2D2B55';
const MUTED_COLOR = '#6B6B8D';

const RING_COLORS = [ACCENT_CORAL, ACCENT_TEAL, ACCENT_YELLOW, ACCENT_MINT, ACCENT_LAVENDER];
const BAR_COLORS = [ACCENT_TEAL, ACCENT_CORAL, ACCENT_YELLOW, ACCENT_MINT, ACCENT_LAVENDER];

// ── Helpers ────────────────────────────────────────

function skillLevelToPercent(level?: string): number {
  if (!level) return 75;
  const l = level.toLowerCase();
  if (l === 'beginner' || l === 'novice') return 25;
  if (l === 'intermediate') return 50;
  if (l === 'advanced' || l === 'proficient') return 75;
  if (l === 'expert' || l === 'master') return 95;
  const n = parseInt(level);
  return (!isNaN(n) && n >= 0 && n <= 100) ? n : 75;
}

function langProficiencyToPercent(proficiency: string): number {
  const l = proficiency.toLowerCase();
  if (l.includes('native') || l.includes('mother')) return 100;
  if (l.includes('fluent') || l.includes('bilingual') || l === 'c2') return 90;
  if (l.includes('advanced') || l.includes('professional') || l === 'c1') return 75;
  if (l.includes('upper') || l === 'b2') return 60;
  if (l.includes('intermediate') || l === 'b1') return 45;
  if (l.includes('elementary') || l.includes('basic') || l === 'a2') return 30;
  if (l.includes('beginner') || l === 'a1') return 15;
  return 50;
}

// ── Sub-components ─────────────────────────────────

function CircularProgress({ percentage, color, size = 56, label, isRtl }: {
  percentage: number; color: string; size?: number; label: string; isRtl: boolean;
}) {
  const strokeWidth = 5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div style={{ textAlign: 'center' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: 'block', margin: '0 auto' }}>
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${circumference}`}
          strokeDashoffset={`${offset}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        <text
          x={size / 2} y={size / 2 + 1}
          textAnchor="middle" dominantBaseline="middle"
          fill="#ffffff" fontSize="11" fontWeight="bold"
          fontFamily="system-ui, -apple-system, 'Noto Sans Arabic', sans-serif"
        >
          {percentage}%
        </text>
      </svg>
      <div style={{
        fontSize: 9,
        color: SIDEBAR_TEXT,
        marginTop: 4,
        lineHeight: isRtl ? '1.5' : '1.3',
        textAlign: 'center',
        wordBreak: 'break-word' as const,
      }}>
        {label}
      </div>
    </div>
  );
}

function DiamondDivider() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: 10, margin: '20px 0', alignItems: 'center' }}>
      {[ACCENT_CORAL, ACCENT_TEAL, ACCENT_YELLOW].map((c, i) => (
        <div key={i} style={{
          width: 6, height: 6, backgroundColor: c, transform: 'rotate(45deg)',
          WebkitPrintColorAdjust: 'exact' as const, printColorAdjust: 'exact' as const,
        }} />
      ))}
    </div>
  );
}

function SidebarSectionTitle({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
      <div style={{
        width: 8, height: 8, borderRadius: '50%', backgroundColor: color, flexShrink: 0,
        WebkitPrintColorAdjust: 'exact' as const, printColorAdjust: 'exact' as const,
      }} />
      <h2 style={{
        fontSize: 10, fontWeight: 'bold', color: '#ffffff',
        textTransform: 'uppercase' as const, letterSpacing: '0.1em', margin: 0,
      }}>
        {children}
      </h2>
    </div>
  );
}

function MainSectionTitle({ children, color, isRtl }: { children: React.ReactNode; color: string; isRtl: boolean }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{
        display: 'flex', flexDirection: 'row' as const, alignItems: 'center', gap: 10, marginBottom: 6,
      }}>
        <div style={{
          width: 10, height: 10, borderRadius: '50%', backgroundColor: color, flexShrink: 0,
          WebkitPrintColorAdjust: 'exact' as const, printColorAdjust: 'exact' as const,
        }} />
        <h2 style={{
          fontSize: 13, fontWeight: 'bold', color,
          textTransform: 'uppercase' as const, letterSpacing: '0.06em', margin: 0,
          textAlign: isRtl ? 'right' as const : 'left' as const,
        }}>
          {children}
        </h2>
      </div>
      <div style={{ height: 2, backgroundColor: color, opacity: 0.2, borderRadius: 1 }} />
    </div>
  );
}

// ── Main Component ─────────────────────────────────

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
      return date.toLocaleDateString(isRtl ? 'ar' : 'en-US', { month: 'short', year: 'numeric' });
    };
    if (isRtl) {
      return `${current ? 'ئێستا' : fmt(end)} - ${fmt(start)}`;
    }
    return `${fmt(start)} - ${current ? 'Present' : fmt(end)}`;
  };

  const hasDemographics = data.personal.dateOfBirth || data.personal.gender ||
    data.personal.nationality || data.personal.maritalStatus || data.personal.country;
  const demoItems: { label: string; value: string }[] = [];
  if (data.personal.dateOfBirth) demoItems.push({ label: isRtl ? 'لەدایکبوون' : 'DOB', value: data.personal.dateOfBirth });
  if (data.personal.gender) demoItems.push({ label: isRtl ? 'ڕەگەز' : 'Gender', value: data.personal.gender });
  if (data.personal.nationality) demoItems.push({ label: isRtl ? 'نەتەوە' : 'Nationality', value: data.personal.nationality });
  if (data.personal.maritalStatus) demoItems.push({ label: isRtl ? 'باری خێزانی' : 'Status', value: data.personal.maritalStatus });
  if (data.personal.country) demoItems.push({ label: isRtl ? 'وڵات' : 'Country', value: data.personal.country });

  const allSkills = data.skills ?? [];

  const sidebarPctEnd = (SIDEBAR_WIDTH / 794 * 100).toFixed(3);
  const accentPctEnd = ((SIDEBAR_WIDTH + 4) / 794 * 100).toFixed(3);

  return (
    <div style={{
      width: '794px',
      fontFamily: "system-ui, -apple-system, 'Noto Sans Arabic', sans-serif",
      color: TEXT_COLOR,
      direction: dir,
      position: 'relative',
      '--resume-page-bg': isRtl
        ? `linear-gradient(to left, ${SIDEBAR_BG} ${sidebarPctEnd}%, ${ACCENT_CORAL} ${sidebarPctEnd}%, ${ACCENT_CORAL} ${accentPctEnd}%, #ffffff ${accentPctEnd}%)`
        : `linear-gradient(to right, ${SIDEBAR_BG} ${sidebarPctEnd}%, ${ACCENT_CORAL} ${sidebarPctEnd}%, ${ACCENT_CORAL} ${accentPctEnd}%, #ffffff ${accentPctEnd}%)`,
    } as React.CSSProperties}>
      <style dangerouslySetInnerHTML={{ __html: `
        .resume-desc ul, .resume-desc ol { list-style: disc; padding-left: 1.2em; padding-right: 0; margin: 4px 0; }
        .resume-desc ol { list-style: decimal; }
        .resume-desc li { margin-bottom: 2px; }
        [dir="rtl"] .resume-desc ul, [dir="rtl"] .resume-desc ol { padding-left: 0; padding-right: 1.2em; }
        .resume-entry { break-inside: avoid; page-break-inside: avoid; }
        .resume-section h2 { break-after: avoid; page-break-after: avoid; }
        .creative-sidebar-bg { display: none; }
        @media print {
          .creative-sidebar-bg {
            display: block !important;
            position: fixed !important;
            top: 0 !important; bottom: 0 !important;
            ${isRtl ? 'right' : 'left'}: 0;
            width: ${SIDEBAR_WIDTH}px;
            background-color: ${SIDEBAR_BG};
            z-index: 0;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}} />

      {watermark && <Watermark isRTL={isRtl} />}
      <div className="creative-sidebar-bg" />

      <div style={{ display: 'flex', flexDirection: 'row', position: 'relative', zIndex: 1 }}>
        {/* ===== SIDEBAR ===== */}
        <div style={{
          width: SIDEBAR_WIDTH,
          padding: '36px 24px',
          color: SIDEBAR_TEXT,
          WebkitBoxDecorationBreak: 'clone' as const,
          boxDecorationBreak: 'clone' as const,
        }}>
          {/* Profile Photo */}
          {data.personal.profileImage && (
            <div className="resume-entry" style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
              <ProfilePhoto
                src={data.personal.profileImage}
                size={90}
                borderColor={ACCENT_CORAL}
                borderWidth={3}
              />
            </div>
          )}

          {/* Name */}
          <div className="resume-entry" style={{ textAlign: 'center', marginBottom: 4 }}>
            <div style={{
              fontSize: 18, fontWeight: 'bold', color: '#ffffff',
              lineHeight: isRtl ? '1.6' : '1.3',
            }}>
              {data.personal.fullName || 'Your Name'}
            </div>
          </div>

          {/* Title */}
          {data.personal.title && (
            <div style={{ textAlign: 'center', marginBottom: 2 }}>
              <div style={{
                fontSize: 11, color: SIDEBAR_MUTED,
                lineHeight: isRtl ? '1.5' : '1.3',
              }}>
                {data.personal.title}
              </div>
            </div>
          )}

          {/* Diamond Divider */}
          <DiamondDivider />

          {/* Contact */}
          <div className="resume-section" style={{ marginBottom: 24 }}>
            <SidebarSectionTitle color={ACCENT_CORAL}>
              {isRtl ? 'پەیوەندی' : 'Contact'}
            </SidebarSectionTitle>
            {data.personal.email && (
              <div className="resume-entry" style={{ marginBottom: 8, fontSize: 10, textAlign }}>
                <div style={{ color: SIDEBAR_MUTED, fontSize: 9, marginBottom: 2 }}>{isRtl ? 'ئیمەیڵ' : 'Email'}</div>
                <div style={{ color: SIDEBAR_TEXT, direction: 'ltr', unicodeBidi: 'plaintext' as const, textAlign }}>
                  <span style={{ unicodeBidi: 'isolate' as const }}>{data.personal.email}</span>
                </div>
              </div>
            )}
            {data.personal.phone && (
              <div className="resume-entry" style={{ marginBottom: 8, fontSize: 10, textAlign }}>
                <div style={{ color: SIDEBAR_MUTED, fontSize: 9, marginBottom: 2 }}>{isRtl ? 'ژمارە' : 'Phone'}</div>
                <div style={{ color: SIDEBAR_TEXT, direction: 'ltr', unicodeBidi: 'plaintext' as const, textAlign }}>
                  <span style={{ unicodeBidi: 'isolate' as const }}>{data.personal.phone}</span>
                </div>
              </div>
            )}
            {data.personal.location && (
              <div className="resume-entry" style={{ marginBottom: 8, fontSize: 10, textAlign }}>
                <div style={{ color: SIDEBAR_MUTED, fontSize: 9, marginBottom: 2 }}>{isRtl ? 'شوێن' : 'Location'}</div>
                <div style={{ color: SIDEBAR_TEXT, lineHeight: isRtl ? '1.5' : '1.3', textAlign }}>{data.personal.location}</div>
              </div>
            )}
            {data.personal.website && (
              <div className="resume-entry" style={{ marginBottom: 8, fontSize: 10, textAlign }}>
                <div style={{ color: SIDEBAR_MUTED, fontSize: 9, marginBottom: 2 }}>{isRtl ? 'ماڵپەڕ' : 'Website'}</div>
                <div style={{ color: SIDEBAR_TEXT, direction: 'ltr', unicodeBidi: 'plaintext' as const, textAlign }}>
                  <span style={{ unicodeBidi: 'isolate' as const }}>{data.personal.website}</span>
                </div>
              </div>
            )}
            {data.personal.linkedin && (
              <div className="resume-entry" style={{ marginBottom: 8, fontSize: 10, textAlign }}>
                <div style={{ color: SIDEBAR_MUTED, fontSize: 9, marginBottom: 2 }}>LinkedIn</div>
                <div style={{ color: SIDEBAR_TEXT, direction: 'ltr', unicodeBidi: 'plaintext' as const, textAlign }}>
                  <span style={{ unicodeBidi: 'isolate' as const }}>{data.personal.linkedin}</span>
                </div>
              </div>
            )}
          </div>

          {/* Skills - Circular Progress Rings */}
          {allSkills.length > 0 && (
            <div className="resume-section" style={{ marginBottom: 24 }}>
              <SidebarSectionTitle color={ACCENT_TEAL}>
                {isRtl ? 'تواناییەکان' : 'Skills'}
              </SidebarSectionTitle>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '14px 12px',
              }}>
                {allSkills.map((skill, i) => (
                  <div key={skill.id} className="resume-entry">
                    <CircularProgress
                      percentage={skillLevelToPercent(skill.level)}
                      color={RING_COLORS[i % RING_COLORS.length]}
                      label={skill.name}
                      isRtl={isRtl}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Languages - Progress Bars */}
          {data.languages && data.languages.length > 0 && (
            <div className="resume-section" style={{ marginBottom: 24 }}>
              <SidebarSectionTitle color={ACCENT_YELLOW}>
                {isRtl ? 'زمانەکان' : 'Languages'}
              </SidebarSectionTitle>
              {data.languages.map((lang, i) => {
                const pct = langProficiencyToPercent(lang.proficiency);
                const barColor = BAR_COLORS[i % BAR_COLORS.length];
                return (
                  <div key={lang.id} className="resume-entry" style={{ marginBottom: 10 }}>
                    <div style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      marginBottom: 4,
                    }}>
                      <span style={{ fontSize: 10, color: SIDEBAR_TEXT, lineHeight: isRtl ? '1.5' : '1.3' }}>
                        {lang.name}
                      </span>
                      <span style={{ fontSize: 9, color: SIDEBAR_MUTED }}>
                        {lang.proficiency}
                      </span>
                    </div>
                    <div style={{
                      height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.08)',
                      overflow: 'hidden',
                      WebkitPrintColorAdjust: 'exact' as const, printColorAdjust: 'exact' as const,
                    }}>
                      <div style={{
                        width: `${pct}%`, height: '100%', borderRadius: 3,
                        backgroundColor: barColor,
                        WebkitPrintColorAdjust: 'exact' as const, printColorAdjust: 'exact' as const,
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Demographics */}
          {hasDemographics && demoItems.length > 0 && (
            <div className="resume-section" style={{ marginBottom: 24 }}>
              <SidebarSectionTitle color={ACCENT_LAVENDER}>
                {isRtl ? 'زانیاری' : 'Details'}
              </SidebarSectionTitle>
              {demoItems.map((item) => (
                <div key={item.label} className="resume-entry" style={{ marginBottom: 8, fontSize: 10, textAlign }}>
                  <div style={{ color: SIDEBAR_MUTED, fontSize: 9, marginBottom: 2 }}>{item.label}</div>
                  <div style={{ color: SIDEBAR_TEXT, lineHeight: isRtl ? '1.5' : '1.3' }}>{item.value}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ===== MAIN CONTENT ===== */}
        <div style={{
          flex: 1,
          padding: '36px 34px 40px',
          ...(isRtl
            ? { borderRight: `4px solid ${ACCENT_CORAL}` }
            : { borderLeft: `4px solid ${ACCENT_CORAL}` }),
          WebkitBoxDecorationBreak: 'clone' as const,
          boxDecorationBreak: 'clone' as const,
          WebkitPrintColorAdjust: 'exact' as const,
          printColorAdjust: 'exact' as const,
        } as React.CSSProperties}>

          {/* Summary */}
          {data.summary && (
            <div className="resume-section resume-entry" style={{ marginBottom: 24 }}>
              <MainSectionTitle color={ACCENT_TEAL} isRtl={isRtl}>
                {isRtl ? 'دەربارە' : 'About Me'}
              </MainSectionTitle>
              <div style={{
                backgroundColor: '#f0faf8',
                borderRadius: 6, padding: '14px 18px',
                ...(isRtl
                  ? { borderRight: `3px solid ${ACCENT_TEAL}` }
                  : { borderLeft: `3px solid ${ACCENT_TEAL}` }),
                WebkitPrintColorAdjust: 'exact' as const, printColorAdjust: 'exact' as const,
              }}>
                <p style={{
                  fontSize: 11, lineHeight: isRtl ? '1.8' : '1.7',
                  color: MUTED_COLOR, textAlign, margin: 0,
                }}>
                  {data.summary}
                </p>
              </div>
            </div>
          )}

          {/* Experience */}
          {data.experience && data.experience.length > 0 && (
            <div className="resume-section" style={{ marginBottom: 24 }}>
              <MainSectionTitle color={ACCENT_CORAL} isRtl={isRtl}>
                {isRtl ? 'ئەزموونی کاری' : 'Experience'}
              </MainSectionTitle>
              {data.experience.map((exp) => (
                <div key={exp.id} className="resume-entry" style={{
                  marginBottom: 14, padding: '12px 16px',
                  backgroundColor: '#fef5f5', borderRadius: 6,
                  ...(isRtl
                    ? { borderRight: `3px solid ${ACCENT_CORAL}` }
                    : { borderLeft: `3px solid ${ACCENT_CORAL}` }),
                  WebkitPrintColorAdjust: 'exact' as const, printColorAdjust: 'exact' as const,
                }}>
                  <div style={{
                    display: 'flex', flexDirection: 'row' as const, justifyContent: 'space-between',
                    alignItems: 'flex-start', marginBottom: 4,
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: 13, fontWeight: 'bold', color: TEXT_COLOR,
                        textAlign, lineHeight: isRtl ? '1.6' : '1.4',
                      }}>
                        {exp.jobTitle}
                      </div>
                      <div style={{
                        fontSize: 11, color: MUTED_COLOR, textAlign,
                        lineHeight: isRtl ? '1.5' : '1.3',
                      }}>
                        {exp.company}{exp.location ? ` | ${exp.location}` : ''}
                      </div>
                    </div>
                    <div style={{
                      fontSize: 10, color: ACCENT_CORAL, fontWeight: 'bold',
                      whiteSpace: 'nowrap', flexShrink: 0,
                      ...(isRtl ? { marginRight: 12 } : { marginLeft: 12 }),
                    }}>
                      {formatDateRange(exp.startDate, exp.endDate, exp.current)}
                    </div>
                  </div>
                  {exp.description && (
                    <div
                      className="resume-desc"
                      style={{
                        fontSize: 11, lineHeight: isRtl ? '1.8' : '1.6',
                        color: MUTED_COLOR, textAlign,
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
              <MainSectionTitle color={ACCENT_YELLOW} isRtl={isRtl}>
                {isRtl ? 'خوێندن' : 'Education'}
              </MainSectionTitle>
              {data.education.map((edu) => (
                <div key={edu.id} className="resume-entry" style={{
                  marginBottom: 14, padding: '12px 16px',
                  backgroundColor: '#fffef5', borderRadius: 6,
                  ...(isRtl
                    ? { borderRight: `3px solid ${ACCENT_YELLOW}` }
                    : { borderLeft: `3px solid ${ACCENT_YELLOW}` }),
                  WebkitPrintColorAdjust: 'exact' as const, printColorAdjust: 'exact' as const,
                }}>
                  <div style={{
                    display: 'flex', flexDirection: 'row' as const, justifyContent: 'space-between',
                    alignItems: 'flex-start', marginBottom: 4,
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: 13, fontWeight: 'bold', color: TEXT_COLOR,
                        textAlign, lineHeight: isRtl ? '1.6' : '1.4',
                      }}>
                        {edu.degree}{edu.field ? ` ${isRtl ? 'لە' : 'in'} ${edu.field}` : ''}
                      </div>
                      <div style={{
                        fontSize: 11, color: MUTED_COLOR, textAlign,
                        lineHeight: isRtl ? '1.5' : '1.3',
                      }}>
                        {edu.school}{edu.location ? ` | ${edu.location}` : ''}
                      </div>
                    </div>
                    <div style={{
                      fontSize: 10, color: '#d4a017', fontWeight: 'bold',
                      whiteSpace: 'nowrap', flexShrink: 0,
                      ...(isRtl ? { marginRight: 12 } : { marginLeft: 12 }),
                    }}>
                      {formatDateRange(edu.startDate, edu.endDate)}
                    </div>
                  </div>
                  {edu.gpa && (
                    <div style={{ fontSize: 10, color: MUTED_COLOR, textAlign, marginBottom: 2 }}>
                      {isRtl ? 'نمرەی کۆی گشتی' : 'GPA'}: {edu.gpa}
                    </div>
                  )}
                  {edu.achievements && (
                    <div
                      className="resume-desc"
                      style={{
                        fontSize: 10, lineHeight: isRtl ? '1.8' : '1.5',
                        color: MUTED_COLOR, textAlign,
                      }}
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
              <MainSectionTitle color={ACCENT_MINT} isRtl={isRtl}>
                {isRtl ? 'پڕۆژەکان' : 'Projects'}
              </MainSectionTitle>
              {data.projects.map((proj) => (
                <div key={proj.id} className="resume-entry" style={{
                  marginBottom: 14, padding: '12px 16px',
                  backgroundColor: '#f0faf5', borderRadius: 6,
                  ...(isRtl
                    ? { borderRight: `3px solid ${ACCENT_MINT}` }
                    : { borderLeft: `3px solid ${ACCENT_MINT}` }),
                  WebkitPrintColorAdjust: 'exact' as const, printColorAdjust: 'exact' as const,
                }}>
                  <div style={{
                    fontSize: 12, fontWeight: 'bold', color: TEXT_COLOR,
                    textAlign, lineHeight: isRtl ? '1.6' : '1.4', marginBottom: 4,
                  }}>
                    {proj.name}
                  </div>
                  {proj.technologies && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 6 }}>
                      {proj.technologies.split(',').map((tech, i) => (
                        <span key={i} style={{
                          fontSize: 9, color: '#1a9e7d', backgroundColor: '#e6f7f1',
                          padding: '2px 8px', borderRadius: 999,
                          WebkitPrintColorAdjust: 'exact' as const, printColorAdjust: 'exact' as const,
                        }}>
                          {tech.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                  {proj.description && (
                    <div
                      className="resume-desc"
                      style={{
                        fontSize: 11, lineHeight: isRtl ? '1.8' : '1.6',
                        color: MUTED_COLOR, textAlign,
                      }}
                      dangerouslySetInnerHTML={{ __html: proj.description }}
                    />
                  )}
                  {proj.link && (
                    <div style={{
                      fontSize: 10, color: '#1a9e7d', textAlign, marginTop: 4,
                      direction: 'ltr', unicodeBidi: 'plaintext' as const,
                    }}>
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
              <MainSectionTitle color={ACCENT_LAVENDER} isRtl={isRtl}>
                {isRtl ? 'بڕوانامەکان' : 'Certifications'}
              </MainSectionTitle>
              {data.certifications.map((cert) => (
                <div key={cert.id} className="resume-entry" style={{
                  marginBottom: 12, padding: '12px 16px',
                  backgroundColor: '#f8f3ff', borderRadius: 6,
                  ...(isRtl
                    ? { borderRight: `3px solid ${ACCENT_LAVENDER}` }
                    : { borderLeft: `3px solid ${ACCENT_LAVENDER}` }),
                  WebkitPrintColorAdjust: 'exact' as const, printColorAdjust: 'exact' as const,
                }}>
                  <div style={{
                    fontSize: 12, fontWeight: 'bold', color: TEXT_COLOR,
                    textAlign, lineHeight: isRtl ? '1.6' : '1.4',
                  }}>
                    {cert.name}
                  </div>
                  <div style={{ fontSize: 11, color: MUTED_COLOR, textAlign }}>{cert.issuer}</div>
                  {cert.date && (
                    <div style={{ fontSize: 10, color: ACCENT_LAVENDER, textAlign }}>
                      {cert.date}{cert.expiryDate ? ` - ${cert.expiryDate}` : ''}
                    </div>
                  )}
                  {cert.credentialId && (
                    <div style={{ fontSize: 10, color: MUTED_COLOR, textAlign }}>
                      ID: {cert.credentialId}
                    </div>
                  )}
                  {cert.url && (
                    <div style={{
                      fontSize: 10, color: ACCENT_LAVENDER, textAlign, marginTop: 2,
                      direction: 'ltr', unicodeBidi: 'plaintext' as const,
                    }}>
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
