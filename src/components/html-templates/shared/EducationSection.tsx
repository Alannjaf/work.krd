import React from 'react';
import type { Education } from '@/types/resume';

interface EducationSectionProps {
  education: Education[];
  isRTL?: boolean;
  title?: string;
  titleStyle?: React.CSSProperties;
  itemStyle?: React.CSSProperties;
  degreeStyle?: React.CSSProperties;
  fieldStyle?: React.CSSProperties;
  schoolStyle?: React.CSSProperties;
  metaStyle?: React.CSSProperties;
  gpaStyle?: React.CSSProperties;
}

function formatDateRange(start: string, end: string | undefined, isRTL: boolean): string {
  const locale = isRTL ? 'ar' : 'en-US';
  const fmt = (d: string | undefined) => {
    if (!d) return '';
    const date = new Date(d);
    if (isNaN(date.getTime())) return d;
    return date.toLocaleDateString(locale, { month: 'short', year: 'numeric' });
  };
  return `${fmt(start)} - ${fmt(end)}`;
}

export function EducationSection({
  education,
  isRTL = false,
  title,
  titleStyle,
  itemStyle,
  degreeStyle,
  fieldStyle,
  schoolStyle,
  metaStyle,
  gpaStyle,
}: EducationSectionProps) {
  if (!education || education.length === 0) return null;

  const defaultTitle = isRTL ? 'خوێندن' : 'Education';

  return (
    <div style={{ marginBottom: 24 }}>
      {title !== undefined ? (
        title && <div style={titleStyle}>{title}</div>
      ) : (
        <div style={titleStyle}>{defaultTitle}</div>
      )}
      {education.map((edu) => (
        <div
          key={edu.id}
          className="resume-entry"
          style={{
            marginBottom: 14,
            padding: '12px 16px',
            backgroundColor: '#ffffff',
            borderRadius: 6,
            border: '1px solid #e5e7eb',
            breakInside: 'avoid',
            ...itemStyle,
          }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: 'bold',
              color: '#1e293b',
              marginBottom: 3,
              textAlign: isRTL ? 'right' : 'left',
              lineHeight: isRTL ? 1.6 : 1.4,
              ...degreeStyle,
            }}
          >
            {edu.degree}
          </div>
          {edu.field && (
            <div
              style={{
                fontSize: 11,
                color: '#6366f1',
                marginBottom: 2,
                textAlign: isRTL ? 'right' : 'left',
                lineHeight: isRTL ? 1.5 : 1.4,
                ...fieldStyle,
              }}
            >
              {edu.field}
            </div>
          )}
          <div
            style={{
              fontSize: 10,
              color: '#374151',
              marginBottom: 4,
              textAlign: isRTL ? 'right' : 'left',
              lineHeight: isRTL ? 1.5 : 1.4,
              ...schoolStyle,
            }}
          >
            {edu.school}
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              fontSize: 9,
              color: '#6b7280',
              ...metaStyle,
            }}
          >
            <span>{edu.location}</span>
            <span>{formatDateRange(edu.startDate, edu.endDate, isRTL)}</span>
          </div>
          {edu.gpa && (
            <div
              style={{
                fontSize: 9,
                color: '#059669',
                fontWeight: 'bold',
                marginTop: 2,
                textAlign: isRTL ? 'right' : 'left',
                ...gpaStyle,
              }}
            >
              {isRTL ? 'نمرەی کۆی گشتی' : 'GPA'}: {edu.gpa}
            </div>
          )}
          {edu.achievements && (
            <div
              style={{
                marginTop: 4,
                fontSize: 9,
                color: '#4b5563',
                lineHeight: isRTL ? 1.8 : 1.4,
                textAlign: isRTL ? 'right' : 'left',
              }}
              dangerouslySetInnerHTML={{ __html: edu.achievements }}
            />
          )}
        </div>
      ))}
    </div>
  );
}
