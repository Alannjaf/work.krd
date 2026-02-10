import React from 'react';
import type { HtmlTemplateProps } from '../../types';
import { isResumeRTL } from '@/lib/rtl';
import { Watermark } from '../../shared/Watermark';
import { ProfilePhoto } from '../../shared/ProfilePhoto';
import {
  colors,
  getFont,
  getPageStyle,
  getHeaderStyle,
  getNameStyle,
  getJobTitleStyle,
  getSectionTitleStyle,
} from './styles';

function formatDate(d: string | undefined): string {
  if (!d) return '';
  const date = new Date(d);
  if (isNaN(date.getTime())) return d;
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

export function ClassicTemplate({ data, watermark }: HtmlTemplateProps) {
  const isRTL = isResumeRTL(data);
  const font = getFont(isRTL);
  const { personal } = data;

  const contactItems: string[] = [];
  if (personal.email) contactItems.push(personal.email);
  if (personal.phone) contactItems.push(personal.phone);
  if (personal.location) contactItems.push(personal.location);
  if (personal.website) contactItems.push(personal.website);

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} style={getPageStyle(isRTL)}>
      {/* Header */}
      <div style={getHeaderStyle(isRTL)}>
        {personal.profileImage && (
          <div
            style={{
              display: 'flex',
              justifyContent: isRTL ? 'flex-end' : 'center',
              marginBottom: 15,
            }}
          >
            <ProfilePhoto
              src={personal.profileImage}
              size={100}
              borderColor={colors.border}
              borderWidth={2}
            />
          </div>
        )}

        <h1 style={getNameStyle(isRTL)}>{personal.fullName}</h1>
        {personal.title && (
          <div style={getJobTitleStyle(isRTL)}>{personal.title}</div>
        )}

        {/* Contact rows with separators */}
        <div style={{ marginTop: 8 }}>
          {contactItems.length > 0 && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: isRTL ? 'flex-end' : 'center',
                alignItems: 'center',
                gap: 8,
                marginBottom: 4,
                flexWrap: 'wrap',
              }}
            >
              {contactItems.map((item, i) => (
                <React.Fragment key={i}>
                  {i > 0 && (
                    <span style={{ fontSize: 9, color: colors.border }}>|</span>
                  )}
                  <span style={{ fontSize: 9, color: colors.text, fontFamily: font }}>
                    {item}
                  </span>
                </React.Fragment>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Summary */}
      {data.summary && (
        <div
          style={{
            marginBottom: 25,
            paddingBottom: 15,
            borderBottom: `1px solid ${colors.light}`,
          }}
        >
          <h3 style={getSectionTitleStyle(isRTL)}>
            {isRTL ? '\u067E\u0648\u062E\u062A\u06D5' : 'PROFESSIONAL SUMMARY'}
          </h3>
          <div
            style={{
              fontSize: 10,
              color: colors.text,
              textAlign: isRTL ? 'right' : 'justify',
              lineHeight: isRTL ? 1.8 : 1.6,
              fontFamily: font,
            }}
          >
            {data.summary}
          </div>
        </div>
      )}

      {/* Experience */}
      {data.experience && data.experience.length > 0 && (
        <div style={{ marginBottom: 25 }}>
          <h3 style={getSectionTitleStyle(isRTL)}>
            {isRTL ? '\u0626\u06D5\u0632\u0645\u0648\u0648\u0646\u06CC \u06A9\u0627\u0631\u06CC' : 'PROFESSIONAL EXPERIENCE'}
          </h3>
          {data.experience.map((exp) => (
            <div
              key={exp.id}
              style={{ marginBottom: 20, breakInside: 'avoid' }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: isRTL ? 'row-reverse' : 'row',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: 5,
                }}
              >
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 'bold',
                    color: colors.text,
                    flex: 1,
                    textAlign: isRTL ? 'right' : 'left',
                    fontFamily: font,
                  }}
                >
                  {exp.jobTitle}
                </span>
                <span
                  style={{
                    fontSize: 10,
                    color: colors.secondary,
                    fontStyle: 'italic',
                    flexShrink: 0,
                  }}
                >
                  {formatDate(exp.startDate)} - {exp.current ? (isRTL ? '\u0626\u06CE\u0633\u062A\u0627' : 'Present') : formatDate(exp.endDate)}
                </span>
              </div>
              <div style={{ marginBottom: 6 }}>
                <div
                  style={{
                    fontSize: 10,
                    color: colors.text,
                    marginBottom: 2,
                    textAlign: isRTL ? 'right' : 'left',
                    fontFamily: font,
                  }}
                >
                  {exp.company}
                </div>
                {exp.location && (
                  <div
                    style={{
                      fontSize: 9,
                      color: colors.gray,
                      fontStyle: 'italic',
                      textAlign: isRTL ? 'right' : 'left',
                    }}
                  >
                    {exp.location}
                  </div>
                )}
              </div>
              {exp.description && (
                <div
                  style={{
                    fontSize: 10,
                    color: colors.text,
                    lineHeight: isRTL ? 1.8 : 1.5,
                    textAlign: isRTL ? 'right' : 'justify',
                    marginTop: 6,
                    fontFamily: font,
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
        <div style={{ marginBottom: 25 }}>
          <h3 style={getSectionTitleStyle(isRTL)}>
            {isRTL ? '\u062E\u0648\u06CE\u0646\u062F\u0646' : 'EDUCATION'}
          </h3>
          {data.education.map((edu) => (
            <div
              key={edu.id}
              style={{ marginBottom: 16, breakInside: 'avoid' }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: isRTL ? 'row-reverse' : 'row',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: 4,
                }}
              >
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 'bold',
                    color: colors.text,
                    flex: 1,
                    textAlign: isRTL ? 'right' : 'left',
                    fontFamily: font,
                  }}
                >
                  {edu.degree}
                </span>
                <span
                  style={{
                    fontSize: 10,
                    color: colors.secondary,
                    fontStyle: 'italic',
                    flexShrink: 0,
                  }}
                >
                  {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
                </span>
              </div>
              <div
                style={{
                  fontSize: 10,
                  color: colors.text,
                  marginBottom: 2,
                  textAlign: isRTL ? 'right' : 'left',
                  fontFamily: font,
                }}
              >
                {edu.school}
              </div>
              {edu.field && (
                <div
                  style={{
                    fontSize: 10,
                    color: colors.secondary,
                    marginBottom: 2,
                    fontStyle: 'italic',
                    textAlign: isRTL ? 'right' : 'left',
                    fontFamily: font,
                  }}
                >
                  {edu.field}
                </div>
              )}
              {edu.location && (
                <div
                  style={{
                    fontSize: 9,
                    color: colors.gray,
                    fontStyle: 'italic',
                    textAlign: isRTL ? 'right' : 'left',
                  }}
                >
                  {edu.location}
                </div>
              )}
              {edu.gpa && (
                <div
                  style={{
                    fontSize: 9,
                    color: colors.text,
                    fontStyle: 'italic',
                    textAlign: isRTL ? 'right' : 'left',
                  }}
                >
                  {isRTL ? '\u0646\u0645\u0631\u06D5\u06CC \u06A9\u06C6\u06CC \u06AF\u0634\u062A\u06CC' : 'GPA'}: {edu.gpa}
                </div>
              )}
              {edu.achievements && (
                <div
                  style={{
                    marginTop: 4,
                    fontSize: 10,
                    color: colors.text,
                    lineHeight: isRTL ? 1.8 : 1.5,
                    textAlign: isRTL ? 'right' : 'left',
                    fontFamily: font,
                  }}
                  dangerouslySetInnerHTML={{ __html: edu.achievements }}
                />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Skills */}
      {data.skills && data.skills.length > 0 && (
        <div style={{ marginBottom: 25, breakInside: 'avoid' }}>
          <h3 style={getSectionTitleStyle(isRTL)}>
            {isRTL ? '\u062A\u0648\u0627\u0646\u0627\u06CC\u06D5\u06A9\u0627\u0646' : 'CORE COMPETENCIES'}
          </h3>
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              flexWrap: 'wrap',
              alignItems: 'center',
              direction: isRTL ? 'rtl' : 'ltr',
            }}
          >
            {data.skills.map((skill, index) => (
              <span
                key={skill.id}
                style={{
                  fontSize: 10,
                  color: colors.text,
                  marginInlineEnd: 12,
                  lineHeight: 1.6,
                  fontFamily: font,
                }}
              >
                {skill.name}
                {index < data.skills.length - 1 && ' \u2022 '}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {data.projects && data.projects.length > 0 && (
        <div style={{ marginBottom: 25 }}>
          <h3 style={getSectionTitleStyle(isRTL)}>
            {isRTL ? '\u067E\u0695\u06C6\u0698\u06D5\u06A9\u0627\u0646' : 'PROJECTS'}
          </h3>
          {data.projects.map((project) => (
            <div
              key={project.id}
              style={{ marginBottom: 16, breakInside: 'avoid' }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 'bold',
                  color: colors.text,
                  marginBottom: 4,
                  textAlign: isRTL ? 'right' : 'left',
                  fontFamily: font,
                }}
              >
                {project.name}
              </div>
              {project.description && (
                <div
                  style={{
                    fontSize: 10,
                    color: colors.text,
                    lineHeight: isRTL ? 1.8 : 1.5,
                    marginBottom: 3,
                    textAlign: isRTL ? 'right' : 'left',
                    fontFamily: font,
                  }}
                  dangerouslySetInnerHTML={{ __html: project.description }}
                />
              )}
              {project.technologies && (
                <div
                  style={{
                    fontSize: 9,
                    color: colors.gray,
                    fontStyle: 'italic',
                    textAlign: isRTL ? 'right' : 'left',
                  }}
                >
                  {project.technologies}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Certifications */}
      {data.certifications && data.certifications.length > 0 && (
        <div style={{ marginBottom: 25 }}>
          <h3 style={getSectionTitleStyle(isRTL)}>
            {isRTL ? '\u0628\u0695\u0648\u0627\u0646\u0627\u0645\u06D5\u06A9\u0627\u0646' : 'CERTIFICATIONS'}
          </h3>
          {data.certifications.map((cert) => (
            <div
              key={cert.id}
              style={{ marginBottom: 12, breakInside: 'avoid' }}
            >
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 'bold',
                  color: colors.text,
                  marginBottom: 2,
                  textAlign: isRTL ? 'right' : 'left',
                  fontFamily: font,
                }}
              >
                {cert.name}
              </div>
              <div
                style={{
                  fontSize: 10,
                  color: colors.text,
                  textAlign: isRTL ? 'right' : 'left',
                  fontFamily: font,
                }}
              >
                {cert.issuer}
              </div>
              {cert.date && (
                <div
                  style={{
                    fontSize: 9,
                    color: colors.gray,
                    fontStyle: 'italic',
                    textAlign: isRTL ? 'right' : 'left',
                  }}
                >
                  {formatDate(cert.date)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Languages */}
      {data.languages && data.languages.length > 0 && (
        <div style={{ marginBottom: 25, breakInside: 'avoid' }}>
          <h3 style={getSectionTitleStyle(isRTL)}>
            {isRTL ? '\u0632\u0645\u0627\u0646\u06D5\u06A9\u0627\u0646' : 'LANGUAGES'}
          </h3>
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: 8,
              direction: isRTL ? 'rtl' : 'ltr',
            }}
          >
            {data.languages.map((lang) => (
              <div
                key={lang.id}
                style={{
                  display: 'flex',
                  flexDirection: isRTL ? 'row-reverse' : 'row',
                  alignItems: 'center',
                  marginInlineEnd: 16,
                  marginBottom: 4,
                }}
              >
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 'bold',
                    color: colors.text,
                    marginInlineEnd: 4,
                    fontFamily: font,
                  }}
                >
                  {lang.name}
                </span>
                <span
                  style={{
                    fontSize: 9,
                    color: colors.secondary,
                    fontStyle: 'italic',
                  }}
                >
                  ({lang.proficiency})
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {watermark && <Watermark />}
    </div>
  );
}
