/**
 * Contact info items are wrapped with className="resume-entry" as a single block.
 * Links use unicodeBidi: 'isolate' to prevent RTL text reordering of URLs and brand names.
 */
import React from 'react';
import type { PersonalInfo } from '@/types/resume';

interface ContactInfoProps {
  personal: PersonalInfo;
  isRTL?: boolean;
  style?: React.CSSProperties;
  itemStyle?: React.CSSProperties;
  separator?: string;
  separatorStyle?: React.CSSProperties;
}

export function ContactInfo({
  personal,
  isRTL = false,
  style,
  itemStyle,
  separator,
  separatorStyle,
}: ContactInfoProps) {
  const items: string[] = [];
  if (personal.email) items.push(personal.email);
  if (personal.phone) items.push(personal.phone);
  if (personal.location) items.push(personal.location);

  const links: { label: string; href: string }[] = [];
  if (personal.linkedin) {
    links.push({ label: isRTL ? 'هەژماری لینکدئین' : 'LinkedIn', href: personal.linkedin });
  }
  if (personal.website) {
    links.push({ label: isRTL ? 'پۆرتفۆلیۆ' : 'Portfolio', href: personal.website });
  }

  return (
    <div
      className="resume-entry"
      style={{
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
        direction: isRTL ? 'rtl' : 'ltr',
        ...style,
      }}
    >
      {items.map((item, i) => (
        <React.Fragment key={i}>
          {separator && i > 0 && (
            <span style={{ ...itemStyle, ...separatorStyle }}>{separator}</span>
          )}
          <span style={itemStyle}>{item}</span>
        </React.Fragment>
      ))}
      {links.map((link, i) => (
        <React.Fragment key={link.href}>
          {separator && (items.length > 0 || i > 0) && (
            <span style={{ ...itemStyle, ...separatorStyle }}>{separator}</span>
          )}
          <a
            href={link.href}
            style={{ textDecoration: 'none', color: 'inherit', ...itemStyle }}
          >
            <span style={{ unicodeBidi: 'isolate' as const }}>{link.label}</span>
          </a>
        </React.Fragment>
      ))}
    </div>
  );
}
