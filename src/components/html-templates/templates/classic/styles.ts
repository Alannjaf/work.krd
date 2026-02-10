import type { CSSProperties } from 'react';

export const colors = {
  primary: '#1f2937',
  secondary: '#4b5563',
  accent: '#6b7280',
  text: '#111827',
  light: '#f9fafb',
  white: '#ffffff',
  border: '#d1d5db',
  gray: '#6b7280',
} as const;

export function getFont(isRTL: boolean): string {
  return isRTL ? "'Noto Sans Arabic', sans-serif" : "'Inter', Georgia, serif";
}

export function getPageStyle(isRTL: boolean): CSSProperties {
  return {
    width: '210mm',
    minHeight: '297mm',
    paddingTop: 40,
    paddingBottom: 40,
    paddingLeft: 50,
    paddingRight: 50,
    backgroundColor: colors.white,
    fontFamily: getFont(isRTL),
    fontSize: 11,
    lineHeight: isRTL ? 1.7 : 1.5,
    color: colors.text,
    position: 'relative',
    margin: '0 auto',
    boxSizing: 'border-box',
  };
}

export function getHeaderStyle(isRTL: boolean): CSSProperties {
  return {
    marginBottom: 30,
    paddingBottom: 20,
    borderBottom: `1px solid ${colors.border}`,
    textAlign: isRTL ? 'right' as const : 'center' as const,
  };
}

export function getNameStyle(isRTL: boolean): CSSProperties {
  return {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 8,
    letterSpacing: 0.5,
    textAlign: isRTL ? 'right' as const : 'center' as const,
    fontFamily: getFont(isRTL),
    margin: 0,
    marginBlockEnd: 8,
    lineHeight: isRTL ? 1.5 : 1.3,
  };
}

export function getJobTitleStyle(isRTL: boolean): CSSProperties {
  return {
    fontSize: 12,
    color: colors.secondary,
    fontWeight: 'normal',
    marginBottom: 12,
    fontStyle: 'italic',
    textAlign: isRTL ? 'right' as const : 'center' as const,
    fontFamily: getFont(isRTL),
    lineHeight: isRTL ? 1.5 : 1.4,
  };
}

export function getSectionTitleStyle(isRTL: boolean): CSSProperties {
  return {
    fontSize: 13,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 12,
    letterSpacing: 1,
    textTransform: 'uppercase' as const,
    borderBottom: `1px solid ${colors.border}`,
    paddingBottom: 4,
    textAlign: isRTL ? 'right' as const : 'left' as const,
    fontFamily: getFont(isRTL),
    lineHeight: isRTL ? 1.5 : 1.4,
    margin: 0,
    marginBlockEnd: 12,
  };
}
