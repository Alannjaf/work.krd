import React from 'react'
import { Document, Page, View } from '@react-pdf/renderer'
import { ResumeData } from '../../types/resume'
import { styles } from './styles/pdfStyles'
import { PDFHeader } from './components/PDFHeader'
import { LeftColumn } from './components/LeftColumn'
import { RightColumn } from './components/RightColumn'
import { Watermark } from './components/Watermark'

interface EnhancedModernTemplateProps {
  data: ResumeData
  watermark?: boolean
}

const EnhancedModernTemplate: React.FC<EnhancedModernTemplateProps> = ({ data, watermark }) => {
  return (
    <Document>
      <Page
        size="A4"
        style={styles.page}
        wrap={true} // Enable automatic pagination
      >
        {/* Fixed background for left column on all pages */}
        <View style={styles.leftBgOverlay} fixed />

        {/* Header Section - Only on first page */}
        <PDFHeader personal={data.personal} />

        {/* Body Section */}
        <View style={styles.body}>
          <LeftColumn data={data} />
          <RightColumn data={data} experiences={data.experience || []} />
        </View>

        {watermark && <Watermark />}
      </Page>
    </Document>
  )
}

export default EnhancedModernTemplate