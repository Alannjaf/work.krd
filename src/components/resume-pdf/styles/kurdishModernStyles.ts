import { StyleSheet } from '@react-pdf/renderer'

/**
 * Kurdish Modern RTL Styles
 *
 * Mirrored version of pdfStyles.ts for right-to-left Kurdish layout.
 * All directional properties are reversed (left↔right).
 * NotoSansArabic is used as the default font family.
 *
 * Arabic/Kurdish script requires:
 *  - Higher lineHeight (1.7–1.8) because glyphs are taller
 *  - Extra section spacing so underline decorations don't collide
 *  - No fixed heights on text containers (let them grow)
 */

export const kurdishStyles = StyleSheet.create({
  // Page
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    fontFamily: 'NotoSansArabic',
    fontSize: 10,
    lineHeight: 1.7,
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
    padding: '28 36',
    flexDirection: 'row-reverse',
    alignItems: 'center',
    minHeight: 140,
  },

  profileImageContainer: {
    width: 85,
    height: 85,
    borderRadius: 43,
    overflow: 'hidden',
    backgroundColor: '#f1f5f9',
    marginLeft: 20,
    alignItems: 'center',
    justifyContent: 'center',
    border: '3px solid #ffffff',
  },

  profileImage: {
    width: 85,
    height: 85,
    objectFit: 'cover',
  },

  profileImagePlaceholder: {
    width: 85,
    height: 85,
    backgroundColor: '#94a3b8',
    borderRadius: 43,
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
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#ffffff',
    textAlign: 'right',
    lineHeight: 1.4,
  },

  title: {
    fontSize: 14,
    color: '#e2e8f0',
    marginBottom: 10,
    fontWeight: 'normal',
    textAlign: 'right',
    lineHeight: 1.5,
  },

  contactInfo: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: 12,
  },

  contactItem: {
    fontSize: 9,
    color: '#cbd5e1',
    textAlign: 'right',
  },

  // Demographics Section
  demographicsInfo: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 6,
  },

  demographicItem: {
    fontSize: 8,
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
    padding: '20 24',
  },

  // Sidebar column (right side in RTL, 38% width)
  sidebarColumn: {
    width: '38%',
    padding: '20 16',
  },

  // Section Styling — generous bottom margin to prevent cramping
  section: {
    marginBottom: 18,
  },

  // Main section title (right-aligned for RTL)
  // Extra paddingBottom + marginBottom so underline doesn't touch content
  sectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 14,
    borderBottom: '2px solid #3b82f6',
    paddingBottom: 6,
    paddingRight: 2,
    textAlign: 'right',
    lineHeight: 1.5,
  },

  // Sidebar section title
  sidebarSectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
    borderBottom: '2px solid #6366f1',
    paddingBottom: 5,
    textAlign: 'right',
    lineHeight: 1.5,
  },

  // Summary Section (RTL: border on right)
  // No fixed height — let it expand for longer Arabic text
  summary: {
    fontSize: 10,
    lineHeight: 1.8,
    textAlign: 'right',
    color: '#374151',
    padding: '14 16',
    backgroundColor: '#f9fafb',
    borderRadius: 6,
    borderRight: '3px solid #3b82f6',
  },
})

// Experience styles for Kurdish RTL
export const kurdishExperienceStyles = StyleSheet.create({
  experienceItem: {
    marginBottom: 14,
    paddingBottom: 12,
    borderBottom: '1px solid #e5e7eb',
  },

  experienceHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },

  jobTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 3,
    textAlign: 'right',
    lineHeight: 1.6,
  },

  company: {
    fontSize: 11,
    color: '#3b82f6',
    fontWeight: 'bold',
    marginBottom: 2,
    textAlign: 'right',
    lineHeight: 1.5,
  },

  jobLocation: {
    fontSize: 9,
    color: '#6b7280',
    textAlign: 'right',
    lineHeight: 1.5,
  },

  duration: {
    fontSize: 9,
    color: '#6b7280',
    backgroundColor: '#f3f4f6',
    padding: '3 6',
    borderRadius: 3,
    textAlign: 'left',
    flexShrink: 0,
    maxWidth: 90,
  },

  description: {
    fontSize: 9,
    lineHeight: 1.8,
    color: '#4b5563',
    textAlign: 'right',
    marginTop: 4,
  },

  // For htmlToPdfParser — it uses styles.text
  text: {
    fontSize: 9,
    lineHeight: 1.8,
    color: '#4b5563',
    textAlign: 'right',
  },

  // Education Section
  educationItem: {
    marginBottom: 12,
    padding: '10 12',
    backgroundColor: '#ffffff',
    borderRadius: 6,
    border: '1px solid #e5e7eb',
  },

  degree: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 3,
    textAlign: 'right',
    lineHeight: 1.6,
  },

  fieldOfStudy: {
    fontSize: 10,
    color: '#6366f1',
    marginBottom: 2,
    textAlign: 'right',
    lineHeight: 1.5,
  },

  school: {
    fontSize: 9,
    color: '#374151',
    marginBottom: 4,
    textAlign: 'right',
    lineHeight: 1.5,
  },

  educationMeta: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    fontSize: 8,
    color: '#6b7280',
  },

  gpa: {
    fontSize: 8,
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
    gap: 4,
  },

  skillItem: {
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    padding: '4 10',
    borderRadius: 10,
    fontSize: 8,
    marginBottom: 4,
    textAlign: 'right',
  },

  // Languages Section
  languageItem: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    padding: '6 10',
    backgroundColor: '#ffffff',
    borderRadius: 6,
    border: '1px solid #e5e7eb',
  },

  languageName: {
    fontSize: 9,
    color: '#1e293b',
    fontWeight: 'bold',
    textAlign: 'right',
  },

  languageLevel: {
    fontSize: 8,
    color: '#059669',
    backgroundColor: '#ecfdf5',
    padding: '2 6',
    borderRadius: 8,
  },

  // Projects Section (RTL: border on right)
  projectItem: {
    marginBottom: 14,
    padding: '12 14',
    backgroundColor: '#f9fafb',
    borderRadius: 6,
    borderRight: '3px solid #6366f1',
  },

  projectName: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
    textAlign: 'right',
    lineHeight: 1.6,
  },

  projectDescription: {
    fontSize: 9,
    color: '#4b5563',
    lineHeight: 1.8,
    marginBottom: 4,
    textAlign: 'right',
  },

  // For htmlToPdfParser
  text: {
    fontSize: 9,
    color: '#4b5563',
    lineHeight: 1.8,
    textAlign: 'right',
  },

  projectTech: {
    fontSize: 8,
    color: '#6b7280',
    marginBottom: 2,
    textAlign: 'right',
    lineHeight: 1.6,
  },

  projectLink: {
    fontSize: 8,
    color: '#3b82f6',
    textDecoration: 'none',
    textAlign: 'right',
  },

  // Certifications Section (RTL: border on right)
  certificationItem: {
    marginBottom: 10,
    padding: '8 12',
    backgroundColor: '#ffffff',
    borderRadius: 6,
    border: '1px solid #e5e7eb',
    borderRight: '3px solid #f59e0b',
  },

  certificationName: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 3,
    textAlign: 'right',
    lineHeight: 1.6,
  },

  certificationIssuer: {
    fontSize: 9,
    color: '#3b82f6',
    marginBottom: 2,
    textAlign: 'right',
    lineHeight: 1.5,
  },

  certificationDate: {
    fontSize: 8,
    color: '#6b7280',
    textAlign: 'right',
  },
})
