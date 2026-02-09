import React from 'react'
import { Document, Page, View } from '@react-pdf/renderer'
import { styles } from './styles/creativeStyles'
import { CreativeHeader } from './components/CreativeHeader'
import { CreativeContent } from './components/CreativeContent'
import { ResumeData } from '../../types/resume'
import { Watermark } from './components/Watermark'

interface CreativeTemplateProps {
  data: ResumeData
  watermark?: boolean
}

export const CreativeTemplate: React.FC<CreativeTemplateProps> = ({ data, watermark }) => {
  return (
    <Document>
      <Page size="A4" style={styles.page} wrap={true}>
        {/* Artistic background elements */}
        <View style={styles.backgroundCircle1} fixed />
        <View style={styles.backgroundCircle2} fixed />
        <View style={styles.accentLine} fixed />

        {/* Header with creative layout */}
        <CreativeHeader personal={data.personal} />

        {/* Main content with artistic sections */}
        <CreativeContent data={data} />

        {watermark && <Watermark />}
      </Page>
    </Document>
  )
}