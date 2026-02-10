import React from 'react';
import type { Project } from '@/types/resume';

interface ProjectsSectionProps {
  projects?: Project[];
  isRTL?: boolean;
  title?: string;
  titleStyle?: React.CSSProperties;
  itemStyle?: React.CSSProperties;
  nameStyle?: React.CSSProperties;
  descriptionStyle?: React.CSSProperties;
  techStyle?: React.CSSProperties;
  linkStyle?: React.CSSProperties;
}

export function ProjectsSection({
  projects,
  isRTL = false,
  title,
  titleStyle,
  itemStyle,
  nameStyle,
  descriptionStyle,
  techStyle,
  linkStyle,
}: ProjectsSectionProps) {
  if (!projects || projects.length === 0) return null;

  const defaultTitle = isRTL ? '\u067E\u0695\u06C6\u0698\u06D5\u06A9\u0627\u0646' : 'Notable Projects';

  return (
    <div style={{ marginBottom: 24 }}>
      {title !== undefined ? (
        title && <div style={titleStyle}>{title}</div>
      ) : (
        <div style={titleStyle}>{defaultTitle}</div>
      )}
      {projects.map((project) => (
        <div
          key={project.id}
          style={{
            marginBottom: 16,
            padding: '14px 16px',
            backgroundColor: '#f9fafb',
            borderRadius: 8,
            borderInlineStart: '4px solid #6366f1',
            breakInside: 'avoid',
            ...itemStyle,
          }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: 'bold',
              color: '#1e293b',
              marginBottom: 4,
              textAlign: isRTL ? 'right' : 'left',
              lineHeight: isRTL ? 1.6 : 1.4,
              ...nameStyle,
            }}
          >
            {project.name}
          </div>
          {project.description && (
            <div
              style={{
                fontSize: 10,
                color: '#4b5563',
                lineHeight: isRTL ? 1.8 : 1.4,
                marginBottom: 4,
                textAlign: isRTL ? 'right' : 'left',
                ...descriptionStyle,
              }}
              dangerouslySetInnerHTML={{ __html: project.description }}
            />
          )}
          {project.technologies && (
            <div
              style={{
                fontSize: 9,
                color: '#6b7280',
                marginBottom: 2,
                textAlign: isRTL ? 'right' : 'left',
                lineHeight: isRTL ? 1.6 : 1.4,
                ...techStyle,
              }}
            >
              {isRTL ? '\u062A\u06D5\u06A9\u0646\u06D5\u0644\u06C6\u0698\u06CC\u0627\u06A9\u0627\u0646' : 'Technologies'}: {project.technologies}
            </div>
          )}
          {project.link && (
            <a
              href={project.link}
              style={{
                fontSize: 9,
                color: '#3b82f6',
                textDecoration: 'none',
                textAlign: isRTL ? 'right' : 'left',
                display: 'block',
                ...linkStyle,
              }}
            >
              {isRTL ? '\u0628\u06CC\u0646\u06CC\u0646\u06CC \u067E\u0695\u06C6\u0698\u06D5' : 'View Project'}
            </a>
          )}
        </div>
      ))}
    </div>
  );
}
