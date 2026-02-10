'use client';
import React from 'react';

interface SectionTabsProps {
  sections: { id: string; title: string; icon: string }[];
  currentSection: number;
  onSectionChange: (index: number) => void;
}

export function SectionTabs({ sections, currentSection, onSectionChange }: SectionTabsProps) {
  return (
    <div className="flex overflow-x-auto gap-1 p-2 sticky top-0 bg-white border-b z-10 scrollbar-hide">
      {sections.map((section, i) => (
        <button
          key={section.id}
          onClick={() => onSectionChange(i)}
          className={`flex-shrink-0 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
            i === currentSection
              ? 'bg-primary text-primary-foreground'
              : i < currentSection
                ? 'bg-green-50 text-green-700 hover:bg-green-100'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
          }`}
        >
          <span className="mr-1.5">{section.icon}</span>
          {section.title}
        </button>
      ))}
    </div>
  );
}
