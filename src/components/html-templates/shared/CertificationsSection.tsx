import React from 'react';
import type { Certification } from '@/types/resume';

interface CertificationsSectionProps {
  certifications?: Certification[];
  isRTL?: boolean;
  title?: string;
  titleStyle?: React.CSSProperties;
  itemStyle?: React.CSSProperties;
  nameStyle?: React.CSSProperties;
  issuerStyle?: React.CSSProperties;
  dateStyle?: React.CSSProperties;
}

function formatDate(d: string | undefined): string {
  if (!d) return '';
  const date = new Date(d);
  if (isNaN(date.getTime())) return d;
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

export function CertificationsSection({
  certifications,
  isRTL = false,
  title,
  titleStyle,
  itemStyle,
  nameStyle,
  issuerStyle,
  dateStyle,
}: CertificationsSectionProps) {
  if (!certifications || certifications.length === 0) return null;

  const defaultTitle = isRTL ? '\u0628\u0695\u0648\u0627\u0646\u0627\u0645\u06D5\u06A9\u0627\u0646' : 'Certifications';

  return (
    <div style={{ marginBottom: 24 }}>
      {title !== undefined ? (
        title && <div style={titleStyle}>{title}</div>
      ) : (
        <div style={titleStyle}>{defaultTitle}</div>
      )}
      {certifications.map((cert) => (
        <div
          key={cert.id}
          style={{
            marginBottom: 12,
            padding: '10px 14px',
            backgroundColor: '#ffffff',
            borderRadius: 6,
            border: '1px solid #e5e7eb',
            borderInlineStart: '3px solid #f59e0b',
            breakInside: 'avoid',
            ...itemStyle,
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 'bold',
              color: '#1e293b',
              marginBottom: 3,
              textAlign: isRTL ? 'right' : 'left',
              lineHeight: isRTL ? 1.6 : 1.4,
              ...nameStyle,
            }}
          >
            {cert.name}
          </div>
          <div
            style={{
              fontSize: 10,
              color: '#3b82f6',
              marginBottom: 2,
              textAlign: isRTL ? 'right' : 'left',
              lineHeight: isRTL ? 1.5 : 1.4,
              ...issuerStyle,
            }}
          >
            {cert.issuer}
          </div>
          {cert.date && (
            <div
              style={{
                fontSize: 9,
                color: '#6b7280',
                textAlign: isRTL ? 'right' : 'left',
                ...dateStyle,
              }}
            >
              {formatDate(cert.date)}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
