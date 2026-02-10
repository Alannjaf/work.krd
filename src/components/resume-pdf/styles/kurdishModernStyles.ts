import { StyleSheet } from '@react-pdf/renderer'

/**
 * Kurdish Modern RTL Styles
 *
 * Mirrored version of pdfStyles.ts for right-to-left Kurdish layout.
 * All directional properties are reversed (left↔right).
 * NotoSansArabic is used as the default font family.
 */

export const kurdishStyles = StyleSheet.create({
  // Page
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    fontFamily: 'NotoSansArabic',
    fontSize: 10,
    lineHeight: 1.4,
    color: '#1a1a1a',
    paddingTop: 30,
    paddingHorizontal: 0,
  },

  // Header Section (RTL: text on left, photo on right edge)
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#1e293b',
    color: '#ffffff',
    padding: '32 40',
    flexDirection: 'row-reverse',
    alignItems: 'center',
    height: 140,
  },

  profileImageContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    overflow: 'hidden',
    backgroundColor: '#f1f5f9',
    marginLeft: 24,
    alignItems: 'center',
    justifyContent: 'center',
    border: '4px solid #ffffff',
  },

  profileImage: {
    width: 90,
    height: 90,
    objectFit: 'cover',
  },

  profileImagePlaceholder: {
    width: 90,
    height: 90,
    backgroundColor: '#94a3b8',
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerText: {
    flex: 1,
  },

  headerTextNoPhoto: {
    marginRight: 0,
    paddingRight: 0,
  },

  name: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#ffffff',
    textAlign: 'right',
  },

  title: {
    fontSize: 16,
    color: '#e2e8f0',
    marginBottom: 12,
    fontWeight: 'normal',
    textAlign: 'right',
  },

  contactInfo: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: 16,
  },

  contactItem: {
    fontSize: 10,
    color: '#cbd5e1',
    textAlign: 'right',
  },

  // Demographics Section
  demographicsInfo: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 8,
  },

  demographicItem: {
    fontSize: 9,
    color: '#94a3b8',
    textAlign: 'right',
  },

  // Body Layout (RTL: main content on left 62%, sidebar on right 38%)
  body: {
    flex: 1,
    flexDirection: 'row',
    minHeight: 600,
    marginTop: 140,
  },

  // Background overlay for sidebar on the RIGHT side
  sidebarBgOverlay: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: '38%',
    backgroundColor: '#f8fafc',
    borderLeft: '1px solid #e2e8f0',
  },

  // Main content column (left side in RTL, 62% width)
  mainColumn: {
    width: '62%',
    padding: '24 28',
  },

  // Sidebar column (right side in RTL, 38% width)
  sidebarColumn: {
    width: '38%',
    padding: '24 20',
  },

  // Section Styling
  section: {
    marginBottom: 24,
  },

  // Main section title (right-aligned for RTL)
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
    borderBottom: '3px solid #3b82f6',
    paddingBottom: 4,
    paddingRight: 2,
    textAlign: 'right',
  },

  // Sidebar section title
  sidebarSectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 10,
    borderBottom: '2px solid #6366f1',
    paddingBottom: 3,
    textAlign: 'right',
  },

  // Summary Section (RTL: border on right)
  summary: {
    fontSize: 11,
    lineHeight: 1.6,
    textAlign: 'right',
    color: '#374151',
    padding: '16 20',
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    borderRight: '4px solid #3b82f6',
  },
})

// Experience styles for Kurdish RTL
export const kurdishExperienceStyles = StyleSheet.create({
  experienceItem: {
    marginBottom: 18,
    paddingBottom: 16,
    borderBottom: '1px solid #e5e7eb',
  },

  experienceHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },

  jobTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 3,
    textAlign: 'right',
  },

  company: {
    fontSize: 12,
    color: '#3b82f6',
    fontWeight: 'bold',
    marginBottom: 2,
    textAlign: 'right',
  },

  jobLocation: {
    fontSize: 10,
    color: '#6b7280',
    textAlign: 'right',
  },

  duration: {
    fontSize: 10,
    color: '#6b7280',
    backgroundColor: '#f3f4f6',
    padding: '4 8',
    borderRadius: 4,
    textAlign: 'left',
  },

  description: {
    fontSize: 10,
    lineHeight: 1.5,
    color: '#4b5563',
    textAlign: 'right',
    marginTop: 6,
  },

  // For htmlToPdfParser - it uses styles.text
  text: {
    fontSize: 10,
    lineHeight: 1.5,
    color: '#4b5563',
    textAlign: 'right',
  },

  // Education Section
  educationItem: {
    marginBottom: 14,
    padding: '12 16',
    backgroundColor: '#ffffff',
    borderRadius: 6,
    border: '1px solid #e5e7eb',
  },

  degree: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 3,
    textAlign: 'right',
  },

  fieldOfStudy: {
    fontSize: 11,
    color: '#6366f1',
    marginBottom: 2,
    textAlign: 'right',
  },

  school: {
    fontSize: 10,
    color: '#374151',
    marginBottom: 4,
    textAlign: 'right',
  },

  educationMeta: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    fontSize: 9,
    color: '#6b7280',
  },

  gpa: {
    fontSize: 9,
    color: '#059669',
    fontWeight: 'bold',
    marginTop: 2,
    textAlign: 'right',
  },
})

// Skills styles for Kurdish RTL
export const kurdishSkillsStyles = StyleSheet.create({
  // Skills Section
  skillsContainer: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: 6,
  },

  skillItem: {
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    padding: '6 12',
    borderRadius: 12,
    fontSize: 9,
    marginBottom: 6,
    textAlign: 'right',
  },

  // Languages Section
  languageItem: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    padding: '8 12',
    backgroundColor: '#ffffff',
    borderRadius: 6,
    border: '1px solid #e5e7eb',
  },

  languageName: {
    fontSize: 10,
    color: '#1e293b',
    fontWeight: 'bold',
    textAlign: 'right',
  },

  languageLevel: {
    fontSize: 9,
    color: '#059669',
    backgroundColor: '#ecfdf5',
    padding: '3 8',
    borderRadius: 10,
  },

  // Projects Section (RTL: border on right)
  projectItem: {
    marginBottom: 16,
    padding: '14 16',
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    borderRight: '4px solid #6366f1',
  },

  projectName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
    textAlign: 'right',
  },

  projectDescription: {
    fontSize: 10,
    color: '#4b5563',
    lineHeight: 1.4,
    marginBottom: 4,
    textAlign: 'right',
  },

  // For htmlToPdfParser
  text: {
    fontSize: 10,
    color: '#4b5563',
    lineHeight: 1.4,
    textAlign: 'right',
  },

  projectTech: {
    fontSize: 9,
    color: '#6b7280',
    marginBottom: 2,
    textAlign: 'right',
  },

  projectLink: {
    fontSize: 9,
    color: '#3b82f6',
    textDecoration: 'none',
    textAlign: 'right',
  },

  // Certifications Section (RTL: border on right)
  certificationItem: {
    marginBottom: 12,
    padding: '10 14',
    backgroundColor: '#ffffff',
    borderRadius: 6,
    border: '1px solid #e5e7eb',
    borderRight: '3px solid #f59e0b',
  },

  certificationName: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 3,
    textAlign: 'right',
  },

  certificationIssuer: {
    fontSize: 10,
    color: '#3b82f6',
    marginBottom: 2,
    textAlign: 'right',
  },

  certificationDate: {
    fontSize: 9,
    color: '#6b7280',
    textAlign: 'right',
  },
})
