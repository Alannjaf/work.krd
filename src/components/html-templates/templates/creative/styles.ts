import type { CSSProperties } from 'react';

export const colors = {
  pageBg: '#fafafa',
  text: '#1e293b',
  textSecondary: '#374151',
  textMuted: '#64748b',
  textLight: '#94a3b8',
  accent: '#3b82f6',
  accentLine: '#3b82f6',
  circle1: '#e0f2fe',
  circle2: '#f3e8ff',
  white: '#ffffff',
  border: '#e2e8f0',
  sidebarBorder: '#f1f5f9',
  skillBg: '#3b82f6',
  skillText: '#ffffff',
  langBg: '#f8fafc',
  fieldColor: '#3b82f6',
  gpaColor: '#059669',
  summaryBg: '#f8fafc',
  projectBg: '#f8fafc',
  projectBorder: '#e2e8f0',
  certBg: '#fffbeb',
  certBorder: '#fbbf24',
  certName: '#92400e',
  certIssuer: '#a16207',
  certDate: '#78716c',
  linkColor: '#059669',
  durationBg: '#f1f5f9',
  expBorder: '#e2e8f0',
  eduBg: '#ffffff',
  eduBorder: '#e2e8f0',
} as const;

export function getFont(isRTL: boolean): string {
  return isRTL ? "'Noto Sans Arabic', sans-serif" : "'Inter', sans-serif";
}

export function getPageStyle(isRTL: boolean): CSSProperties {
  return {
    width: '210mm',
    minHeight: '297mm',
    backgroundColor: colors.pageBg,
    paddingTop: 30,
    paddingBottom: 30,
    paddingLeft: 40,
    paddingRight: 40,
    fontFamily: getFont(isRTL),
    fontSize: 10,
    lineHeight: isRTL ? 1.7 : 1.4,
    color: colors.text,
    position: 'relative',
    margin: '0 auto',
    boxSizing: 'border-box',
    overflow: 'hidden',
  };
}

export function getSectionTitleStyle(isRTL: boolean): CSSProperties {
  return {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
    textTransform: 'uppercase' as const,
    letterSpacing: 1.5,
    marginBottom: 8,
    textAlign: isRTL ? 'right' as const : 'left' as const,
    fontFamily: getFont(isRTL),
    lineHeight: isRTL ? 1.5 : 1.4,
    margin: 0,
    marginBlockEnd: 8,
  };
}

export function getUnderlineStyle(): CSSProperties {
  return {
    width: 40,
    height: 3,
    backgroundColor: colors.accent,
    borderRadius: 2,
    marginBottom: 15,
  };
}
