import React from 'react';
import type { HtmlTemplateProps } from './types';
import type { ComponentType } from 'react';

export interface TemplateEntry {
  id: string;
  name: string;
  component: ComponentType<HtmlTemplateProps>;
}

// Placeholder template shown when no templates are available
function PlaceholderTemplate({ data }: HtmlTemplateProps) {
  return (
    <div style={{
      width: '794px',
      minHeight: '1123px',
      backgroundColor: '#ffffff',
      padding: '60px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#374151',
    }}>
      <div style={{ textAlign: 'center', paddingTop: '40px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px' }}>
          {data.personal.fullName || 'Your Name'}
        </h1>
        {data.personal.title && (
          <p style={{ fontSize: '16px', color: '#6B7280', marginBottom: '24px' }}>
            {data.personal.title}
          </p>
        )}
        <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '32px' }}>
          {[data.personal.email, data.personal.phone, data.personal.location]
            .filter(Boolean)
            .join(' | ')}
        </div>
      </div>

      {data.summary && (
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '2px solid #E5E7EB', paddingBottom: '4px', marginBottom: '8px' }}>
            Summary
          </h2>
          <p style={{ fontSize: '13px', lineHeight: 1.6 }}>{data.summary}</p>
        </div>
      )}

      {data.experience && data.experience.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '2px solid #E5E7EB', paddingBottom: '4px', marginBottom: '8px' }}>
            Experience
          </h2>
          {data.experience.map((exp, i) => (
            <div key={i} style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <strong style={{ fontSize: '14px' }}>{exp.jobTitle}</strong>
                <span style={{ fontSize: '12px', color: '#6B7280' }}>
                  {exp.startDate}{exp.endDate ? ` - ${exp.endDate}` : exp.current ? ' - Present' : ''}
                </span>
              </div>
              <p style={{ fontSize: '13px', color: '#6B7280' }}>{exp.company}{exp.location ? `, ${exp.location}` : ''}</p>
              {exp.description && (
                <div style={{ fontSize: '13px', lineHeight: 1.6, marginTop: '4px' }} dangerouslySetInnerHTML={{ __html: exp.description }} />
              )}
            </div>
          ))}
        </div>
      )}

      {data.education && data.education.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '2px solid #E5E7EB', paddingBottom: '4px', marginBottom: '8px' }}>
            Education
          </h2>
          {data.education.map((edu, i) => (
            <div key={i} style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <strong style={{ fontSize: '14px' }}>{edu.degree}{edu.field ? ` in ${edu.field}` : ''}</strong>
                <span style={{ fontSize: '12px', color: '#6B7280' }}>
                  {edu.startDate}{edu.endDate ? ` - ${edu.endDate}` : ''}
                </span>
              </div>
              <p style={{ fontSize: '13px', color: '#6B7280' }}>{edu.school}</p>
            </div>
          ))}
        </div>
      )}

      {data.skills && data.skills.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '2px solid #E5E7EB', paddingBottom: '4px', marginBottom: '8px' }}>
            Skills
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {data.skills.map((skill, i) => (
              <span key={i} style={{ fontSize: '12px', backgroundColor: '#F3F4F6', padding: '2px 10px', borderRadius: '4px' }}>
                {skill.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {data.languages && data.languages.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '2px solid #E5E7EB', paddingBottom: '4px', marginBottom: '8px' }}>
            Languages
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            {data.languages.map((lang, i) => (
              <span key={i} style={{ fontSize: '13px' }}>
                {lang.name} <span style={{ color: '#6B7280' }}>({lang.proficiency})</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export const templateRegistry: Record<string, TemplateEntry> = {
  placeholder: { id: 'placeholder', name: 'Default', component: PlaceholderTemplate },
};

export function getHtmlTemplate(templateId: string): TemplateEntry {
  return templateRegistry[templateId] || templateRegistry['placeholder'];
}
