import React from 'react';
import type { WorkExperience } from '@/types/resume';

interface ExperienceSectionProps {
  experiences: WorkExperience[];
  isRTL?: boolean;
  title?: string;
  titleStyle?: React.CSSProperties;
  itemStyle?: React.CSSProperties;
  headerStyle?: React.CSSProperties;
  jobTitleStyle?: React.CSSProperties;
  companyStyle?: React.CSSProperties;
  locationStyle?: React.CSSProperties;
  durationStyle?: React.CSSProperties;
  descriptionStyle?: React.CSSProperties;
  formatDateRange?: (start: string | undefined, end: string | undefined, current: boolean) => string;
}

function defaultFormatDateRange(start: string | undefined, end: string | undefined, current: boolean): string {
  const formatDate = (d: string | undefined) => {
    if (!d) return '';
    const date = new Date(d);
    if (isNaN(date.getTime())) return d;
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };
  return `${formatDate(start)} - ${current ? 'Present' : formatDate(end)}`;
}

function formatKurdishDateRange(start: string | undefined, end: string | undefined, current: boolean): string {
  const formatDate = (d: string | undefined) => {
    if (!d) return '';
    const date = new Date(d);
    if (isNaN(date.getTime())) return d;
    return date.toLocaleDateString('ar', { month: 'short', year: 'numeric' });
  };
  const s = formatDate(start);
  const e = current ? 'ئێستا' : formatDate(end);
  return `${e} - ${s}`;
}

export function ExperienceSection({
  experiences,
  isRTL = false,
  title,
  titleStyle,
  itemStyle,
  headerStyle,
  jobTitleStyle,
  companyStyle,
  locationStyle,
  durationStyle,
  descriptionStyle,
  formatDateRange: customFormat,
}: ExperienceSectionProps) {
  if (!experiences || experiences.length === 0) return null;

  const fmtRange = customFormat || (isRTL ? formatKurdishDateRange : defaultFormatDateRange);

  const defaultTitle = isRTL ? 'ئەزموونی کاری' : 'Professional Experience'; // Kurdish covers Arabic script users too

  return (
    <div style={{ marginBottom: 24 }}>
      {title !== undefined ? (
        title && <div style={titleStyle}>{title}</div>
      ) : (
        <div style={titleStyle}>{defaultTitle}</div>
      )}
      {experiences.map((exp, index) => (
        <div
          key={exp.id}
          className="resume-entry"
          style={{
            marginBottom: 18,
            paddingBottom: 16,
            borderBottom: index < experiences.length - 1 ? '1px solid #e5e7eb' : 'none',
            breakInside: 'avoid',
            ...itemStyle,
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: 8,
              ...headerStyle,
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 'bold',
                  color: '#1e293b',
                  marginBottom: 3,
                  textAlign: isRTL ? 'right' : 'left',
                  lineHeight: isRTL ? 1.6 : 1.4,
                  ...jobTitleStyle,
                }}
              >
                {exp.jobTitle}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: '#3b82f6',
                  fontWeight: 'bold',
                  marginBottom: 2,
                  textAlign: isRTL ? 'right' : 'left',
                  lineHeight: isRTL ? 1.5 : 1.4,
                  ...companyStyle,
                }}
              >
                {exp.company}
              </div>
              {exp.location && (
                <div
                  style={{
                    fontSize: 10,
                    color: '#6b7280',
                    textAlign: isRTL ? 'right' : 'left',
                    lineHeight: isRTL ? 1.5 : 1.4,
                    ...locationStyle,
                  }}
                >
                  {exp.location}
                </div>
              )}
            </div>
            <div
              style={{
                fontSize: 10,
                color: '#6b7280',
                backgroundColor: '#f3f4f6',
                padding: '4px 8px',
                borderRadius: 4,
                flexShrink: 0,
                maxWidth: 120,
                textAlign: isRTL ? 'left' : 'right',
                ...durationStyle,
              }}
            >
              {fmtRange(exp.startDate, exp.endDate, exp.current)}
            </div>
          </div>
          {exp.description && (
            <div
              style={{
                fontSize: 10,
                lineHeight: isRTL ? 1.8 : 1.5,
                color: '#4b5563',
                textAlign: isRTL ? 'right' : 'left',
                marginTop: 6,
                whiteSpace: 'pre-wrap',
                ...descriptionStyle,
              }}
              dangerouslySetInnerHTML={{ __html: exp.description }}
            />
          )}
        </div>
      ))}
    </div>
  );
}
