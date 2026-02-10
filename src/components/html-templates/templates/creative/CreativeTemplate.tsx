import React from 'react';
import type { HtmlTemplateProps } from '../../types';
import { isResumeRTL } from '@/lib/rtl';
import { Watermark } from '../../shared/Watermark';
import {
  colors,
  getFont,
  getPageStyle,
  getSectionTitleStyle,
  getUnderlineStyle,
} from './styles';

function formatDate(d: string | undefined): string {
  if (!d) return '';
  const date = new Date(d);
  if (isNaN(date.getTime())) return d;
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

function formatDateRange(start: string | undefined, end: string | undefined, current: boolean): string {
  return `${formatDate(start)} - ${current ? 'Present' : formatDate(end)}`;
}

function hasDemographics(personal: { dateOfBirth?: string; gender?: string; nationality?: string; maritalStatus?: string; country?: string }): boolean {
  return Boolean(personal.dateOfBirth || personal.gender || personal.nationality || personal.maritalStatus || personal.country);
}

function formatFullDate(d: string): string {
  const date = new Date(d);
  if (isNaN(date.getTime())) return d;
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function SectionHeader({ title, isRTL }: { title: string; isRTL: boolean }) {
  return (
    <div style={{ marginBottom: 15, position: 'relative' }}>
      <h3 style={getSectionTitleStyle(isRTL)}>{title}</h3>
      <div style={{ ...getUnderlineStyle(), marginInlineStart: isRTL ? 'auto' : 0, marginInlineEnd: isRTL ? 0 : 'auto' }} />
    </div>
  );
}

export function CreativeTemplate({ data, watermark }: HtmlTemplateProps) {
  const isRTL = isResumeRTL(data);
  const font = getFont(isRTL);
  const { personal } = data;

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} style={getPageStyle(isRTL)}>
      {/* Background decorative circles */}
      <div
        style={{
          position: 'absolute',
          top: -50,
          [isRTL ? 'left' : 'right']: -50,
          width: 200,
          height: 200,
          borderRadius: '50%',
          backgroundColor: colors.circle1,
          opacity: 0.6,
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: -100,
          [isRTL ? 'right' : 'left']: -80,
          width: 300,
          height: 300,
          borderRadius: '50%',
          backgroundColor: colors.circle2,
          opacity: 0.4,
        }}
      />

      {/* Blue accent line */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          [isRTL ? 'right' : 'left']: 0,
          width: 6,
          height: '100%',
          backgroundColor: colors.accentLine,
        }}
      />

      {/* Header */}
      <div
        style={{
          marginBottom: 35,
          marginTop: 20,
          position: 'relative',
          zIndex: 10,
        }}
      >
        {/* Profile + Name */}
        <div
          style={{
            display: 'flex',
            flexDirection: isRTL ? 'row-reverse' : 'row',
            alignItems: 'center',
            marginBottom: 20,
          }}
        >
          {personal.profileImage && (
            <div style={{ [isRTL ? 'marginLeft' : 'marginRight']: 25, position: 'relative' }}>
              <div
                style={{
                  width: 85,
                  height: 85,
                  borderRadius: '50%',
                  border: `3px solid ${colors.accent}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: colors.white,
                  overflow: 'hidden',
                }}
              >
                <img
                  src={personal.profileImage}
                  alt="Profile"
                  style={{
                    width: 75,
                    height: 75,
                    borderRadius: '50%',
                    objectFit: 'cover',
                  }}
                />
              </div>
            </div>
          )}

          <div style={{ flex: 1 }}>
            <h1
              style={{
                fontSize: 32,
                fontWeight: 'bold',
                color: colors.text,
                marginBottom: 8,
                letterSpacing: 1,
                fontFamily: font,
                textAlign: isRTL ? 'right' : 'left',
                lineHeight: isRTL ? 1.4 : 1.2,
                margin: 0,
                marginBlockEnd: 8,
              }}
            >
              {personal.fullName}
            </h1>
            {personal.title && (
              <div
                style={{
                  fontSize: 16,
                  color: colors.accent,
                  fontWeight: 'bold',
                  marginBottom: 15,
                  textTransform: 'uppercase',
                  letterSpacing: 2,
                  fontFamily: font,
                  textAlign: isRTL ? 'right' : 'left',
                  lineHeight: isRTL ? 1.5 : 1.4,
                }}
              >
                {personal.title}
              </div>
            )}
          </div>
        </div>

        {/* Contact pills */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 15,
            direction: isRTL ? 'rtl' : 'ltr',
          }}
        >
          {personal.email && (
            <span style={{ fontSize: 10, color: colors.textMuted, backgroundColor: colors.white, padding: '6px 12px', borderRadius: 15, border: `1px solid ${colors.border}`, fontFamily: font }}>
              {personal.email}
            </span>
          )}
          {personal.phone && (
            <span style={{ fontSize: 10, color: colors.textMuted, backgroundColor: colors.white, padding: '6px 12px', borderRadius: 15, border: `1px solid ${colors.border}`, fontFamily: font }}>
              {personal.phone}
            </span>
          )}
          {personal.location && (
            <span style={{ fontSize: 10, color: colors.textMuted, backgroundColor: colors.white, padding: '6px 12px', borderRadius: 15, border: `1px solid ${colors.border}`, fontFamily: font }}>
              {personal.location}
            </span>
          )}
          {personal.linkedin && (
            <a href={personal.linkedin} style={{ fontSize: 10, color: colors.textMuted, backgroundColor: colors.white, padding: '6px 12px', borderRadius: 15, border: `1px solid ${colors.border}`, textDecoration: 'none', fontFamily: font }}>
              {isRTL ? '\u0644\u06CC\u0646\u06A9\u062F\u0626\u06CC\u0646' : 'LinkedIn'}
            </a>
          )}
          {personal.website && (
            <a href={personal.website} style={{ fontSize: 10, color: colors.textMuted, backgroundColor: colors.white, padding: '6px 12px', borderRadius: 15, border: `1px solid ${colors.border}`, textDecoration: 'none', fontFamily: font }}>
              {isRTL ? '\u067E\u06C6\u0631\u062A\u0641\u06C6\u0644\u06CC\u06C6' : 'Portfolio'}
            </a>
          )}
        </div>

        {/* Demographics */}
        {hasDemographics(personal) && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: 10,
              marginTop: 10,
              direction: isRTL ? 'rtl' : 'ltr',
            }}
          >
            {personal.dateOfBirth && (
              <span style={{ fontSize: 9, color: colors.textLight, backgroundColor: '#f8fafc', padding: '4px 8px', borderRadius: 10, border: `1px solid ${colors.border}` }}>
                {isRTL ? '\u0644\u06D5\u062F\u0627\u06CC\u06A9\u0628\u0648\u0648\u0646' : 'Born'}: {formatFullDate(personal.dateOfBirth)}
              </span>
            )}
            {personal.gender && (
              <span style={{ fontSize: 9, color: colors.textLight, backgroundColor: '#f8fafc', padding: '4px 8px', borderRadius: 10, border: `1px solid ${colors.border}` }}>
                {isRTL ? '\u0695\u06D5\u06AF\u06D5\u0632' : 'Gender'}: {personal.gender}
              </span>
            )}
            {personal.nationality && (
              <span style={{ fontSize: 9, color: colors.textLight, backgroundColor: '#f8fafc', padding: '4px 8px', borderRadius: 10, border: `1px solid ${colors.border}` }}>
                {isRTL ? '\u0646\u06D5\u062A\u06D5\u0648\u06D5' : 'Nationality'}: {personal.nationality}
              </span>
            )}
            {personal.maritalStatus && (
              <span style={{ fontSize: 9, color: colors.textLight, backgroundColor: '#f8fafc', padding: '4px 8px', borderRadius: 10, border: `1px solid ${colors.border}` }}>
                {isRTL ? '\u0628\u0627\u0631\u06CC \u062E\u06CE\u0632\u0627\u0646\u06CC' : 'Marital Status'}: {personal.maritalStatus}
              </span>
            )}
            {personal.country && (
              <span style={{ fontSize: 9, color: colors.textLight, backgroundColor: '#f8fafc', padding: '4px 8px', borderRadius: 10, border: `1px solid ${colors.border}` }}>
                {isRTL ? '\u0648\u06B5\u0627\u062A' : 'Country'}: {personal.country}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Content: 2-column layout */}
      <div
        style={{
          display: 'flex',
          flexDirection: isRTL ? 'row-reverse' : 'row',
          gap: 25,
          marginTop: 20,
        }}
      >
        {/* Left Sidebar (35%) */}
        <div style={{ width: '35%' }}>
          {/* Skills */}
          {data.skills && data.skills.length > 0 && (
            <div style={{ marginBottom: 20, breakInside: 'avoid' }}>
              <SectionHeader title={isRTL ? '\u062A\u0648\u0627\u0646\u0627\u06CC\u06D5\u06A9\u0627\u0646' : 'Skills'} isRTL={isRTL} />
              <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 8, direction: isRTL ? 'rtl' : 'ltr' }}>
                {data.skills.map((skill) => (
                  <span
                    key={skill.id}
                    style={{
                      backgroundColor: colors.skillBg,
                      color: colors.skillText,
                      fontSize: 9,
                      padding: '5px 10px',
                      borderRadius: 12,
                      fontWeight: 'bold',
                      fontFamily: font,
                    }}
                  >
                    {skill.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {data.education && data.education.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <SectionHeader title={isRTL ? '\u062E\u0648\u06CE\u0646\u062F\u0646' : 'Education'} isRTL={isRTL} />
              {data.education.map((edu) => (
                <div
                  key={edu.id}
                  style={{
                    marginBottom: 16,
                    backgroundColor: colors.eduBg,
                    padding: 12,
                    borderRadius: 8,
                    border: `1px solid ${colors.eduBorder}`,
                    breakInside: 'avoid',
                  }}
                >
                  <div style={{ fontSize: 11, fontWeight: 'bold', color: colors.text, marginBottom: 3, textAlign: isRTL ? 'right' : 'left', fontFamily: font, lineHeight: isRTL ? 1.6 : 1.4 }}>
                    {edu.degree}
                  </div>
                  {edu.field && (
                    <div style={{ fontSize: 10, color: colors.fieldColor, marginBottom: 3, textAlign: isRTL ? 'right' : 'left', fontFamily: font }}>
                      {edu.field}
                    </div>
                  )}
                  <div style={{ fontSize: 10, color: colors.textMuted, marginBottom: 6, textAlign: isRTL ? 'right' : 'left', fontFamily: font }}>
                    {edu.school}
                  </div>
                  <div style={{ fontSize: 9, color: colors.textLight, marginBottom: 4, textAlign: isRTL ? 'right' : 'left' }}>
                    {edu.location} {edu.location && '\u2022'} {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
                  </div>
                  {edu.gpa && (
                    <div style={{ fontSize: 9, color: colors.gpaColor, fontWeight: 'bold', marginBottom: 6, textAlign: isRTL ? 'right' : 'left' }}>
                      {isRTL ? '\u0646\u0645\u0631\u06D5\u06CC \u06A9\u06C6\u06CC \u06AF\u0634\u062A\u06CC' : 'GPA'}: {edu.gpa}
                    </div>
                  )}
                  {edu.achievements && (
                    <div
                      style={{ marginTop: 8, fontSize: 9, color: '#4b5563', lineHeight: isRTL ? 1.8 : 1.4, textAlign: isRTL ? 'right' : 'left', fontFamily: font }}
                      dangerouslySetInnerHTML={{ __html: edu.achievements }}
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Languages */}
          {data.languages && data.languages.length > 0 && (
            <div style={{ marginBottom: 20, breakInside: 'avoid' }}>
              <SectionHeader title={isRTL ? '\u0632\u0645\u0627\u0646\u06D5\u06A9\u0627\u0646' : 'Languages'} isRTL={isRTL} />
              {data.languages.map((language) => (
                <div
                  key={language.id}
                  style={{
                    display: 'flex',
                    flexDirection: isRTL ? 'row-reverse' : 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 8,
                    padding: '6px 0',
                    borderBottom: `1px solid ${colors.sidebarBorder}`,
                  }}
                >
                  <span style={{ fontSize: 10, color: colors.textSecondary, fontWeight: 'bold', fontFamily: font }}>
                    {language.name}
                  </span>
                  <span style={{ fontSize: 9, color: colors.textMuted, backgroundColor: colors.langBg, padding: '2px 6px', borderRadius: 4 }}>
                    {language.proficiency || (isRTL ? '\u0628\u0646\u06D5\u0695\u06D5\u062A\u06CC' : 'Basic')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Main Content (65%) */}
        <div style={{ width: '65%' }}>
          {/* Summary */}
          {data.summary && (
            <div style={{ marginBottom: 20, breakInside: 'avoid' }}>
              <SectionHeader title={isRTL ? '\u062F\u06D5\u0631\u0628\u0627\u0631\u06D5\u06CC \u0645\u0646' : 'About Me'} isRTL={isRTL} />
              <div
                style={{
                  fontSize: 11,
                  lineHeight: isRTL ? 1.8 : 1.6,
                  color: colors.textSecondary,
                  textAlign: isRTL ? 'right' : 'justify',
                  backgroundColor: colors.summaryBg,
                  padding: 15,
                  borderRadius: 8,
                  border: `1px solid ${colors.border}`,
                  fontFamily: font,
                }}
              >
                {data.summary}
              </div>
            </div>
          )}

          {/* Experience */}
          {data.experience && data.experience.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <SectionHeader title={isRTL ? '\u0626\u06D5\u0632\u0645\u0648\u0648\u0646' : 'Experience'} isRTL={isRTL} />
              {data.experience.map((exp, index) => (
                <div
                  key={exp.id}
                  style={{
                    marginBottom: 20,
                    paddingBottom: 18,
                    borderBottom: index < data.experience.length - 1 ? `1px solid ${colors.expBorder}` : 'none',
                    breakInside: 'avoid',
                  }}
                >
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 13, fontWeight: 'bold', color: colors.text, marginBottom: 4, textAlign: isRTL ? 'right' : 'left', fontFamily: font, lineHeight: isRTL ? 1.6 : 1.4 }}>
                      {exp.jobTitle}
                    </div>
                    <div style={{ fontSize: 12, color: colors.accent, fontWeight: 'bold', marginBottom: 2, textAlign: isRTL ? 'right' : 'left', fontFamily: font }}>
                      {exp.company}
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: isRTL ? 'row-reverse' : 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 8,
                      }}
                    >
                      <span style={{ fontSize: 10, color: colors.textMuted, textAlign: isRTL ? 'right' : 'left' }}>
                        {exp.location}
                      </span>
                      <span style={{ fontSize: 10, color: colors.textMuted, backgroundColor: colors.durationBg, padding: '4px 8px', borderRadius: 4 }}>
                        {formatDateRange(exp.startDate, exp.endDate, exp.current)}
                      </span>
                    </div>
                  </div>
                  {exp.description && (
                    <div
                      style={{
                        fontSize: 10,
                        lineHeight: isRTL ? 1.8 : 1.5,
                        color: colors.textSecondary,
                        textAlign: isRTL ? 'right' : 'justify',
                        fontFamily: font,
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
            <div style={{ marginBottom: 20 }}>
              <SectionHeader title={isRTL ? '\u067E\u0695\u06C6\u0698\u06D5\u06A9\u0627\u0646' : 'Projects'} isRTL={isRTL} />
              {data.projects.map((project) => (
                <div
                  key={project.id}
                  style={{
                    marginBottom: 14,
                    backgroundColor: colors.projectBg,
                    padding: 10,
                    borderRadius: 6,
                    border: `1px solid ${colors.projectBorder}`,
                    breakInside: 'avoid',
                  }}
                >
                  <div style={{ fontSize: 11, fontWeight: 'bold', color: colors.text, marginBottom: 4, textAlign: isRTL ? 'right' : 'left', fontFamily: font, lineHeight: isRTL ? 1.6 : 1.4 }}>
                    {project.name}
                  </div>
                  {project.technologies && (
                    <div style={{ fontSize: 8, color: colors.accent, marginBottom: 4, textAlign: isRTL ? 'right' : 'left' }}>
                      {isRTL ? '\u062A\u06D5\u06A9\u0646\u06D5\u0644\u06C6\u0698\u06CC\u0627\u06A9\u0627\u0646' : 'Technologies'}: {project.technologies}
                    </div>
                  )}
                  {project.link && (
                    <a
                      href={project.link}
                      style={{ fontSize: 8, color: colors.linkColor, textDecoration: 'underline', display: 'block', textAlign: isRTL ? 'right' : 'left', marginBottom: 4 }}
                    >
                      {isRTL ? '\u0628\u06CC\u0646\u06CC\u0646\u06CC \u067E\u0695\u06C6\u0698\u06D5' : 'View Project'}
                    </a>
                  )}
                  {project.description && (
                    <div
                      style={{
                        fontSize: 9,
                        color: '#4b5563',
                        lineHeight: isRTL ? 1.8 : 1.4,
                        marginTop: 2,
                        textAlign: isRTL ? 'right' : 'left',
                        fontFamily: font,
                      }}
                      dangerouslySetInnerHTML={{ __html: project.description }}
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Certifications */}
          {data.certifications && data.certifications.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <SectionHeader title={isRTL ? '\u0628\u0695\u0648\u0627\u0646\u0627\u0645\u06D5\u06A9\u0627\u0646' : 'Certifications'} isRTL={isRTL} />
              {data.certifications.map((cert) => (
                <div
                  key={cert.id}
                  style={{
                    marginBottom: 12,
                    padding: 8,
                    backgroundColor: colors.certBg,
                    borderRadius: 6,
                    border: `1px solid ${colors.certBorder}`,
                    breakInside: 'avoid',
                  }}
                >
                  <div style={{ fontSize: 10, fontWeight: 'bold', color: colors.certName, marginBottom: 2, textAlign: isRTL ? 'right' : 'left', fontFamily: font, lineHeight: isRTL ? 1.6 : 1.4 }}>
                    {cert.name}
                  </div>
                  <div style={{ fontSize: 9, color: colors.certIssuer, marginBottom: 3, textAlign: isRTL ? 'right' : 'left', fontFamily: font }}>
                    {cert.issuer}
                  </div>
                  {cert.date && (
                    <div style={{ fontSize: 8, color: colors.certDate, textAlign: isRTL ? 'right' : 'left' }}>
                      {formatDate(cert.date)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {watermark && <Watermark />}
    </div>
  );
}
