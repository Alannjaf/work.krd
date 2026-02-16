import React from 'react';
import { getHtmlTemplate } from './registry';
import type { HtmlTemplateProps } from './types';

interface TemplateRendererProps extends HtmlTemplateProps {
  templateId: string;
}

class TemplateErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40, textAlign: 'center', fontFamily: 'system-ui, sans-serif', color: '#6b7280' }}>
          <p style={{ fontSize: 16, fontWeight: 600 }}>Template rendering error</p>
          <p style={{ fontSize: 13, marginTop: 8 }}>Please check your resume data and try again.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

export function TemplateRenderer({ templateId, data, watermark }: TemplateRendererProps) {
  const entry = getHtmlTemplate(templateId);
  const Component = entry.component;
  return (
    <TemplateErrorBoundary>
      <Component data={data} watermark={watermark} />
    </TemplateErrorBoundary>
  );
}
