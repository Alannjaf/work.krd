import type { CSSProperties } from 'react';

export const colors = {
  headerBg: '#1e293b',
  headerText: '#ffffff',
  headerSubtext: '#e2e8f0',
  contactText: '#cbd5e1',
  sidebarBg: '#f8fafc',
  sidebarBorder: '#e2e8f0',
  sectionBorder: '#3b82f6',
  sidebarSectionBorder: '#6366f1',
  text: '#1a1a1a',
  textSecondary: '#374151',
  textMuted: '#6b7280',
  summaryBg: '#f9fafb',
  skillBg: '#3b82f6',
  skillText: '#ffffff',
  langBg: '#ffffff',
  langBorder: '#e5e7eb',
  langLevel: '#059669',
  langLevelBg: '#ecfdf5',
  educationBg: '#ffffff',
  educationBorder: '#e5e7eb',
  fieldColor: '#6366f1',
  gpaColor: '#059669',
  projectBg: '#f9fafb',
  projectBorder: '#6366f1',
  certBg: '#ffffff',
  certBorder: '#e5e7eb',
  certAccent: '#f59e0b',
  linkColor: '#3b82f6',
  demographicText: '#94a3b8',
  expBorder: '#e5e7eb',
  durationBg: '#f3f4f6',
} as const;

export function getFont(isRTL: boolean): string {
  return isRTL ? "'Noto Sans Arabic', sans-serif" : "'Inter', sans-serif";
}

export function getLineHeight(isRTL: boolean): number {
  return isRTL ? 1.7 : 1.4;
}

export function getPageStyle(isRTL: boolean): CSSProperties {
  return {
    width: '210mm',
    minHeight: '297mm',
    backgroundColor: '#ffffff',
    fontFamily: getFont(isRTL),
    fontSize: 10,
    lineHeight: getLineHeight(isRTL),
    color: colors.text,
    position: 'relative',
    margin: '0 auto',
    boxSizing: 'border-box',
  };
}

export function getHeaderStyle(isRTL: boolean): CSSProperties {
  return {
    backgroundColor: colors.headerBg,
    color: colors.headerText,
    padding: '32px 40px',
    display: 'flex',
    flexDirection: isRTL ? 'row-reverse' : 'row',
    alignItems: 'center',
    minHeight: 140,
  };
}

export function getNameStyle(isRTL: boolean): CSSProperties {
  return {
    fontSize: isRTL ? 24 : 28,
    fontWeight: 'bold',
    marginBottom: isRTL ? 8 : 16,
    color: colors.headerText,
    textAlign: isRTL ? 'right' : 'left',
    lineHeight: isRTL ? 1.4 : 1.2,
    margin: 0,
    marginBlockEnd: isRTL ? 8 : 16,
  };
}

export function getTitleStyle(isRTL: boolean): CSSProperties {
  return {
    fontSize: isRTL ? 14 : 16,
    color: colors.headerSubtext,
    marginBottom: 12,
    fontWeight: 'normal',
    textAlign: isRTL ? 'right' : 'left',
    lineHeight: isRTL ? 1.5 : 1.4,
  };
}

export function getBodyStyle(isRTL: boolean): CSSProperties {
  return {
    display: 'flex',
    flexDirection: isRTL ? 'row-reverse' : 'row',
    flex: 1,
    minHeight: 600,
    position: 'relative',
  };
}

export function getSidebarBgStyle(isRTL: boolean): CSSProperties {
  return {
    position: 'absolute',
    [isRTL ? 'right' : 'left']: 0,
    top: 0,
    bottom: 0,
    width: '38%',
    backgroundColor: colors.sidebarBg,
    [isRTL ? 'borderLeft' : 'borderRight']: `1px solid ${colors.sidebarBorder}`,
  };
}

export function getSidebarStyle(isRTL: boolean): CSSProperties {
  return {
    width: '38%',
    padding: isRTL ? '24px 16px' : '24px 20px',
    position: 'relative',
    zIndex: 1,
  };
}

export function getMainColumnStyle(isRTL: boolean): CSSProperties {
  return {
    width: '62%',
    padding: isRTL ? '24px 24px' : '24px 28px',
  };
}

export function getSectionTitleStyle(isRTL: boolean): CSSProperties {
  return {
    fontSize: isRTL ? 13 : 14,
    fontWeight: 'bold',
    color: colors.headerBg,
    marginBottom: isRTL ? 14 : 12,
    textTransform: 'uppercase' as const,
    borderBottom: `${isRTL ? 2 : 3}px solid ${colors.sectionBorder}`,
    paddingBottom: isRTL ? 6 : 4,
    paddingInlineStart: 2,
    textAlign: isRTL ? 'right' as const : 'left' as const,
    lineHeight: isRTL ? 1.5 : 1.4,
    margin: 0,
    marginBlockEnd: isRTL ? 14 : 12,
  };
}

export function getSidebarSectionTitleStyle(isRTL: boolean): CSSProperties {
  return {
    fontSize: isRTL ? 11 : 12,
    fontWeight: 'bold',
    color: colors.headerBg,
    marginBottom: isRTL ? 12 : 10,
    textTransform: 'uppercase' as const,
    borderBottom: `2px solid ${colors.sidebarSectionBorder}`,
    paddingBottom: isRTL ? 5 : 3,
    textAlign: isRTL ? 'right' as const : 'left' as const,
    lineHeight: isRTL ? 1.5 : 1.4,
    margin: 0,
    marginBlockEnd: isRTL ? 12 : 10,
  };
}

export function getSummaryStyle(isRTL: boolean): CSSProperties {
  return {
    fontSize: isRTL ? 10 : 11,
    lineHeight: isRTL ? 1.8 : 1.6,
    textAlign: isRTL ? 'right' as const : ('justify' as const),
    color: colors.textSecondary,
    padding: isRTL ? '14px 16px' : '16px 20px',
    backgroundColor: colors.summaryBg,
    borderRadius: isRTL ? 6 : 8,
    borderInlineStart: `${isRTL ? 3 : 4}px solid ${colors.sectionBorder}`,
  };
}
