import React from 'react'
import { Document, Page, View } from '@react-pdf/renderer'
import { ResumeData } from '../../types/resume'
import { styles } from './styles/pdfStyles'
import { kurdishStyles } from './styles/kurdishModernStyles'
import { PDFHeader } from './components/PDFHeader'
import { LeftColumn } from './components/LeftColumn'
import { RightColumn } from './components/RightColumn'
import { Watermark } from './components/Watermark'
import { getPageFontStyle, isResumeRTL } from '../../lib/pdfFonts'

interface EnhancedModernTemplateProps {
  data: ResumeData
  watermark?: boolean
}

const EnhancedModernTemplate: React.FC<EnhancedModernTemplateProps> = ({ data, watermark }) => {
  const isRTL = isResumeRTL(data)

  return (
    <Document>
      <Page
        size="A4"
        style={[
          isRTL ? kurdishStyles.page : styles.page,
          getPageFontStyle(data.personal?.fullName),
        ]}
        wrap={true}
      >
        {/* Fixed background overlay — left side for LTR, right side for RTL */}
        <View style={isRTL ? kurdishStyles.sidebarBgOverlay : styles.leftBgOverlay} fixed />

        {/* Header Section */}
        <PDFHeader personal={data.personal} isRTL={isRTL} />

        {/* Body Section — column order flips for RTL */}
        <View style={isRTL ? kurdishStyles.body : styles.body}>
          {isRTL ? (
            <>
              <RightColumn data={data} experiences={data.experience || []} isRTL />
              <LeftColumn data={data} isRTL />
            </>
          ) : (
            <>
              <LeftColumn data={data} />
              <RightColumn data={data} experiences={data.experience || []} />
            </>
          )}
        </View>

        {watermark && <Watermark />}
      </Page>
    </Document>
  )
}

export default EnhancedModernTemplate
