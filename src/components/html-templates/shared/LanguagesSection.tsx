import React from 'react';
import type { Language } from '@/types/resume';

interface LanguagesSectionProps {
  languages: Language[];
  isRTL?: boolean;
  title?: string;
  titleStyle?: React.CSSProperties;
  itemStyle?: React.CSSProperties;
  nameStyle?: React.CSSProperties;
  levelStyle?: React.CSSProperties;
}

export function LanguagesSection({
  languages,
  isRTL = false,
  title,
  titleStyle,
  itemStyle,
  nameStyle,
  levelStyle,
}: LanguagesSectionProps) {
  if (!languages || languages.length === 0) return null;

  const defaultTitle = isRTL ? 'زمانەکان' : 'Languages';

  return (
    <div style={{ marginBottom: 24 }}>
      {title !== undefined ? (
        title && <div style={titleStyle}>{title}</div>
      ) : (
        <div style={titleStyle}>{defaultTitle}</div>
      )}
      {languages.map((language) => (
        <div
          key={language.id}
          className="resume-entry"
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 10,
            padding: '8px 12px',
            backgroundColor: '#ffffff',
            borderRadius: 6,
            border: '1px solid #e5e7eb',
            ...itemStyle,
          }}
        >
          <span
            style={{
              fontSize: 10,
              color: '#1e293b',
              fontWeight: 'bold',
              textAlign: isRTL ? 'right' : 'left',
              ...nameStyle,
            }}
          >
            {language.name}
          </span>
          <span
            style={{
              fontSize: 9,
              color: '#059669',
              backgroundColor: '#ecfdf5',
              padding: '3px 8px',
              borderRadius: 10,
              ...levelStyle,
            }}
          >
            {language.proficiency || (isRTL ? 'بنەڕەتی' : 'Basic')}
          </span>
        </div>
      ))}
    </div>
  );
}
