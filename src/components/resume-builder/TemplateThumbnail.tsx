'use client';

import React from 'react';
import { TemplateRenderer } from '@/components/html-templates/TemplateRenderer';
import { ResumeData } from '@/types/resume';

const SAMPLE_DATA: ResumeData = {
  personal: {
    fullName: 'John Smith',
    email: 'john@example.com',
    phone: '+1 555-0123',
    title: 'Senior Software Engineer',
    location: 'San Francisco, CA',
  },
  summary: 'Experienced software engineer with 8+ years building scalable web applications.',
  experience: [
    {
      id: '1',
      jobTitle: 'Senior Software Engineer',
      company: 'Tech Corp',
      startDate: '2020-01',
      current: true,
      description: 'Led development of microservices architecture.',
    },
  ],
  education: [
    {
      id: '1',
      degree: 'B.S. Computer Science',
      school: 'Stanford University',
      startDate: '2012-09',
      endDate: '2016-06',
    },
  ],
  skills: [
    { id: '1', name: 'React', level: 'Expert' },
    { id: '2', name: 'TypeScript', level: 'Advanced' },
    { id: '3', name: 'Node.js', level: 'Advanced' },
  ],
  languages: [
    { id: '1', name: 'English', proficiency: 'Native' },
  ],
};

interface TemplateThumbnailProps {
  templateId: string;
  className?: string;
}

export function TemplateThumbnail({ templateId, className = '' }: TemplateThumbnailProps) {
  return (
    <div className={`overflow-hidden ${className}`} style={{ transform: 'scale(0.3)', transformOrigin: 'top left', width: '794px' }}>
      <TemplateRenderer templateId={templateId} data={SAMPLE_DATA} />
    </div>
  );
}
