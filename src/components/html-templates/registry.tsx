import React from 'react';
import type { HtmlTemplateProps } from './types';
import type { ComponentType } from 'react';
import { ModernTemplate } from './ModernTemplate';
import { ElegantTemplate } from './ElegantTemplate';
import { BoldTemplate } from './BoldTemplate';
import { isRTLText } from '@/lib/rtl';

export interface TemplateEntry {
  id: string;
  name: string;
  component: ComponentType<HtmlTemplateProps>;
}

// Placeholder template shown when no templates are available
function PlaceholderTemplate({ data }: HtmlTemplateProps) {
  // Detect RTL from content: check name, title, and summary
  const textToCheck = [data.personal.fullName, data.personal.title, data.summary].filter(Boolean).join(' ');
  const isRtl = isRTLText(textToCheck);
  const dir = isRtl ? 'rtl' : 'ltr';
  const textAlign = isRtl ? 'right' as const : 'left' as const;
  const flexRow: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', direction: dir };

  const sectionHeading: React.CSSProperties = { fontSize: '14px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '2px solid #E5E7EB', paddingBottom: '4px', marginBottom: '8px', textAlign };
  const contactItems = [data.personal.email, data.personal.phone, data.personal.location].filter(Boolean);
  const linkItems = [
    data.personal.linkedin ? `LinkedIn: ${data.personal.linkedin}` : null,
    data.personal.website ? `Web: ${data.personal.website}` : null,
  ].filter(Boolean);
  const demographicItems = [
    data.personal.dateOfBirth ? `DOB: ${data.personal.dateOfBirth}` : null,
    data.personal.gender ? `Gender: ${data.personal.gender}` : null,
    data.personal.nationality ? `Nationality: ${data.personal.nationality}` : null,
    data.personal.maritalStatus ? `Status: ${data.personal.maritalStatus}` : null,
    data.personal.country ? `Country: ${data.personal.country}` : null,
  ].filter(Boolean);

  return (
    <div style={{
      width: '794px',
      backgroundColor: '#ffffff',
      padding: '60px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#374151',
      direction: dir,
    }}>
      {/* Override Tailwind's preflight reset for list styles inside descriptions */}
      <style dangerouslySetInnerHTML={{ __html: `
        .resume-desc ul, .resume-desc ol { list-style: disc; padding-left: 1.2em; padding-right: 0; margin: 4px 0; }
        .resume-desc ol { list-style: decimal; }
        .resume-desc li { margin-bottom: 2px; }
        [dir="rtl"] .resume-desc ul, [dir="rtl"] .resume-desc ol { padding-left: 0; padding-right: 1.2em; }
        .resume-entry { break-inside: avoid; page-break-inside: avoid; }
        .resume-section h2 { break-after: avoid; page-break-after: avoid; }
      `}} />
      {/* Header with optional photo */}
      <div style={{ textAlign: 'center', paddingTop: '40px' }}>
        {data.personal.profileImage && (
          <div style={{ marginBottom: '16px' }}>
            <img
              src={data.personal.profileImage}
              alt=""
              style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', margin: '0 auto', display: 'block' }}
            />
          </div>
        )}
        <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px' }}>
          {data.personal.fullName || 'Your Name'}
        </h1>
        {data.personal.title && (
          <p style={{ fontSize: '16px', color: '#6B7280', marginBottom: '12px' }}>
            {data.personal.title}
          </p>
        )}
        {contactItems.length > 0 && (
          <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '4px', direction: 'ltr', unicodeBidi: 'plaintext' }}>
            {contactItems.map((item, i) => (
              <span key={i} style={{ unicodeBidi: 'isolate' }}>{i > 0 && ' | '}{item}</span>
            ))}
          </div>
        )}
        {linkItems.length > 0 && (
          <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px', direction: 'ltr', unicodeBidi: 'plaintext' }}>
            {linkItems.map((item, i) => (
              <span key={i} style={{ unicodeBidi: 'isolate' }}>{i > 0 && ' | '}{item}</span>
            ))}
          </div>
        )}
        {demographicItems.length > 0 && (
          <div style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '4px', direction: 'ltr', unicodeBidi: 'plaintext' }}>
            {demographicItems.map((item, i) => (
              <span key={i} style={{ unicodeBidi: 'isolate' }}>{i > 0 && ' | '}{item}</span>
            ))}
          </div>
        )}
        <div style={{ marginBottom: '32px' }} />
      </div>

      {data.summary && (
        <div className="resume-section resume-entry" style={{ marginBottom: '24px' }}>
          <h2 style={sectionHeading}>Summary</h2>
          <p style={{ fontSize: '13px', lineHeight: 1.6, textAlign }}>{data.summary}</p>
        </div>
      )}

      {data.experience && data.experience.length > 0 && (
        <div className="resume-section" style={{ marginBottom: '24px' }}>
          <h2 style={sectionHeading}>Experience</h2>
          {data.experience.map((exp, i) => (
            <div key={i} className="resume-entry" style={{ marginBottom: '16px' }}>
              <div style={flexRow}>
                <strong style={{ fontSize: '14px' }}>{exp.jobTitle}</strong>
                <span style={{ fontSize: '12px', color: '#6B7280' }}>
                  {exp.startDate}{exp.endDate ? ` - ${exp.endDate}` : exp.current ? ' - Present' : ''}
                </span>
              </div>
              <p style={{ fontSize: '13px', color: '#6B7280', textAlign }}>{exp.company}{exp.location ? `, ${exp.location}` : ''}</p>
              {exp.description && (
                <div className="resume-desc" style={{ fontSize: '13px', lineHeight: 1.6, marginTop: '4px', textAlign }} dangerouslySetInnerHTML={{ __html: exp.description }} />
              )}
            </div>
          ))}
        </div>
      )}

      {data.education && data.education.length > 0 && (
        <div className="resume-section" style={{ marginBottom: '24px' }}>
          <h2 style={sectionHeading}>Education</h2>
          {data.education.map((edu, i) => (
            <div key={i} className="resume-entry" style={{ marginBottom: '12px' }}>
              <div style={flexRow}>
                <strong style={{ fontSize: '14px' }}>{edu.degree}{edu.field ? ` in ${edu.field}` : ''}</strong>
                <span style={{ fontSize: '12px', color: '#6B7280' }}>
                  {edu.startDate}{edu.endDate ? ` - ${edu.endDate}` : ''}
                </span>
              </div>
              <p style={{ fontSize: '13px', color: '#6B7280', textAlign }}>{edu.school}{edu.location ? `, ${edu.location}` : ''}</p>
              {edu.gpa && <p style={{ fontSize: '12px', color: '#6B7280', textAlign }}>GPA: {edu.gpa}</p>}
              {edu.achievements && <p style={{ fontSize: '12px', marginTop: '4px', lineHeight: 1.5, textAlign }}>{edu.achievements}</p>}
            </div>
          ))}
        </div>
      )}

      {data.skills && data.skills.length > 0 && (
        <div className="resume-section resume-entry" style={{ marginBottom: '24px' }}>
          <h2 style={sectionHeading}>Skills</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', direction: dir }}>
            {data.skills.map((skill, i) => (
              <span key={i} style={{ fontSize: '12px', backgroundColor: '#F3F4F6', padding: '2px 10px', borderRadius: '4px' }}>
                {skill.name}{skill.level ? ` (${skill.level})` : ''}
              </span>
            ))}
          </div>
        </div>
      )}

      {data.languages && data.languages.length > 0 && (
        <div className="resume-section resume-entry" style={{ marginBottom: '24px' }}>
          <h2 style={sectionHeading}>Languages</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', direction: dir }}>
            {data.languages.map((lang, i) => (
              <span key={i} style={{ fontSize: '13px' }}>
                {lang.name} <span style={{ color: '#6B7280' }}>({lang.proficiency})</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {data.projects && data.projects.length > 0 && (
        <div className="resume-section" style={{ marginBottom: '24px' }}>
          <h2 style={sectionHeading}>Projects</h2>
          {data.projects.map((proj, i) => (
            <div key={i} className="resume-entry" style={{ marginBottom: '12px' }}>
              <div style={flexRow}>
                <strong style={{ fontSize: '14px' }}>{proj.name}</strong>
                {(proj.startDate || proj.endDate) && (
                  <span style={{ fontSize: '12px', color: '#6B7280' }}>
                    {proj.startDate}{proj.endDate ? ` - ${proj.endDate}` : ''}
                  </span>
                )}
              </div>
              {proj.technologies && <p style={{ fontSize: '12px', color: '#6B7280', textAlign }}>{proj.technologies}</p>}
              {proj.description && <div className="resume-desc" style={{ fontSize: '13px', lineHeight: 1.5, marginTop: '4px', textAlign }} dangerouslySetInnerHTML={{ __html: proj.description }} />}
              {proj.link && <p style={{ fontSize: '12px', color: '#3B82F6', marginTop: '2px', textAlign }}>{proj.link}</p>}
            </div>
          ))}
        </div>
      )}

      {data.certifications && data.certifications.length > 0 && (
        <div className="resume-section" style={{ marginBottom: '24px' }}>
          <h2 style={sectionHeading}>Certifications</h2>
          {data.certifications.map((cert, i) => (
            <div key={i} className="resume-entry" style={{ marginBottom: '12px' }}>
              <div style={flexRow}>
                <strong style={{ fontSize: '14px' }}>{cert.name}</strong>
                {cert.date && <span style={{ fontSize: '12px', color: '#6B7280' }}>{cert.date}{cert.expiryDate ? ` - ${cert.expiryDate}` : ''}</span>}
              </div>
              <p style={{ fontSize: '13px', color: '#6B7280', textAlign }}>{cert.issuer}</p>
              {cert.credentialId && <p style={{ fontSize: '12px', color: '#6B7280', textAlign }}>ID: {cert.credentialId}</p>}
              {cert.url && <p style={{ fontSize: '12px', color: '#3B82F6', marginTop: '2px', textAlign }}>{cert.url}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export const templateRegistry: Record<string, TemplateEntry> = {
  placeholder: { id: 'placeholder', name: 'Default', component: PlaceholderTemplate },
  modern: { id: 'modern', name: 'Modern Professional', component: ModernTemplate },
  elegant: { id: 'elegant', name: 'Elegant Dark', component: ElegantTemplate },
  bold: { id: 'bold', name: 'Bold Creative', component: BoldTemplate },
};

export function getHtmlTemplate(templateId: string): TemplateEntry {
  return templateRegistry[templateId] || templateRegistry['placeholder'];
}
