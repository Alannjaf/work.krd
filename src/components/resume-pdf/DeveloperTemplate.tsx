import React from 'react'
import { Document, Page, View } from '@react-pdf/renderer'
import { styles } from './styles/developerStyles'
import { DeveloperHeader } from './components/DeveloperHeader'
import { DeveloperContent } from './components/DeveloperContent'
import { ResumeData } from '../../types/resume'
import { Watermark } from './components/Watermark'

interface DeveloperTemplateProps {
  data: ResumeData
  watermark?: boolean
}

export const DeveloperTemplate: React.FC<DeveloperTemplateProps> = ({ data, watermark }) => {
  return (
    <Document>
      <Page size="A4" style={styles.page} wrap={true}>
        {/* Tech-inspired background elements */}
        <View style={styles.codeBackground} fixed />
        <View style={styles.accentBorder} fixed />
        <View style={styles.terminalWindow} fixed />

        {/* Developer-focused header */}
        <DeveloperHeader personal={data.personal} />

        {/* Main content with tech emphasis */}
        <DeveloperContent data={data} />

        {watermark && <Watermark />}
      </Page>
    </Document>
  )
}