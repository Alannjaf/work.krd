import React from 'react';
import type { Skill } from '@/types/resume';

interface SkillsSectionProps {
  skills: Skill[];
  isRTL?: boolean;
  title?: string;
  titleStyle?: React.CSSProperties;
  chipStyle?: React.CSSProperties;
  containerStyle?: React.CSSProperties;
}

export function SkillsSection({
  skills,
  isRTL = false,
  title,
  titleStyle,
  chipStyle,
  containerStyle,
}: SkillsSectionProps) {
  if (!skills || skills.length === 0) return null;

  const defaultTitle = isRTL ? '\u062A\u0648\u0627\u0646\u0627\u06CC\u06D5\u06A9\u0627\u0646' : 'Technical Skills';

  return (
    <div style={{ marginBottom: 24 }}>
      {title !== undefined ? (
        title && <div style={titleStyle}>{title}</div>
      ) : (
        <div style={titleStyle}>{defaultTitle}</div>
      )}
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: 6,
          direction: isRTL ? 'rtl' : 'ltr',
          ...containerStyle,
        }}
      >
        {skills.map((skill) => (
          <span
            key={skill.id}
            style={{
              backgroundColor: '#3b82f6',
              color: '#ffffff',
              padding: '6px 12px',
              borderRadius: 12,
              fontSize: 9,
              marginBottom: 6,
              ...chipStyle,
            }}
          >
            {skill.name}
          </span>
        ))}
      </div>
    </div>
  );
}
