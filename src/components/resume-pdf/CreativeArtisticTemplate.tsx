import { Document, Page, View } from '@react-pdf/renderer'
import { ResumeData } from '@/types/resume'
import { CreativeArtisticHeader } from './components/CreativeArtisticHeader'
import { CreativeArtisticContent } from './components/CreativeArtisticContent'
import { creativeArtisticStyles } from './styles/creativeArtisticStyles'
import { Watermark } from './components/Watermark'
import { getPageFontStyle } from '@/lib/pdfFonts'

interface CreativeArtisticTemplateProps {
  data: ResumeData
  watermark?: boolean
}

export const CreativeArtisticTemplate = ({ data, watermark }: CreativeArtisticTemplateProps) => {
  return (
    <Document>
      <Page size="A4" style={[creativeArtisticStyles.page, getPageFontStyle(data.personal?.fullName)]} wrap={true}>
        {/* Background gradient overlay - only on first page */}
        <View style={creativeArtisticStyles.backgroundOverlay} />

        {/* Decorative accent bar - only on first page */}
        <View style={creativeArtisticStyles.accentBar} />

        <CreativeArtisticHeader personal={data.personal} />
        <CreativeArtisticContent data={data} />

        {watermark && <Watermark />}
      </Page>
    </Document>
  )
}