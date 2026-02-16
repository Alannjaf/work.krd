/**
 * @deprecated Currently unused — templates define their own section title styles inline.
 * Available for future templates that want a standardized section heading.
 */
import React from 'react';

interface SectionTitleProps {
  children: React.ReactNode;
  isRTL?: boolean;
  color?: string;
  borderColor?: string;
  borderWidth?: number;
  fontSize?: number;
  style?: React.CSSProperties;
}

export function SectionTitle({
  children,
  isRTL = false,
  color = '#1e293b',
  borderColor = '#3b82f6',
  borderWidth = 3,
  fontSize = 14,
  style,
}: SectionTitleProps) {
  return (
    <h3
      style={{
        fontSize,
        fontWeight: 'bold',
        color,
        marginBottom: 12,
        textTransform: 'uppercase',
        borderBottom: `${borderWidth}px solid ${borderColor}`,
        paddingBottom: 4,
        paddingInlineStart: 2,
        textAlign: isRTL ? 'right' : 'left',
        lineHeight: isRTL ? 1.5 : 1.4,
        margin: 0,
        marginBlockEnd: 12,
        ...style,
      }}
    >
      {children}
    </h3>
  );
}
