import React from 'react'
import { Document, Page, View } from '@react-pdf/renderer'
import { ResumeData } from '../../types/resume'
import { kurdishStyles } from './styles/kurdishModernStyles'
import { KurdishModernHeader } from './components/KurdishModernHeader'
import { KurdishModernMain } from './components/KurdishModernMain'
import { KurdishModernSidebar } from './components/KurdishModernSidebar'
import { Watermark } from './components/Watermark'

interface KurdishModernTemplateProps {
  data: ResumeData
  watermark?: boolean
}

const KurdishModernTemplate: React.FC<KurdishModernTemplateProps> = ({ data, watermark }) => {
  return (
    <Document>
      <Page
        size="A4"
        style={[kurdishStyles.page, { fontFamily: 'NotoSansArabic' }]}
        wrap={true}
      >
        {/* Fixed background for sidebar on the RIGHT side of all pages */}
        <View style={kurdishStyles.sidebarBgOverlay} fixed />

        {/* Header Section - Only on first page */}
        <KurdishModernHeader personal={data.personal} />

        {/* Body Section - RTL: main content (62%) on left, sidebar (38%) on right */}
        <View style={kurdishStyles.body}>
          <KurdishModernMain data={data} experiences={data.experience || []} />
          <KurdishModernSidebar data={data} />
        </View>

        {watermark && <Watermark />}
      </Page>
    </Document>
  )
}

export default KurdishModernTemplate
