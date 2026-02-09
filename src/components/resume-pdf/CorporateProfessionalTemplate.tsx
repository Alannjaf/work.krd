import { Page, Text, View, Document } from '@react-pdf/renderer'
import { ResumeData } from '@/types/resume'
import { CorporateHeader } from './components/CorporateHeader'
import { CorporateContent } from './components/CorporateContent'
import { corporateStyles } from './styles/corporateStyles'
import { Watermark } from './components/Watermark'
import { getPageFontStyle } from '@/lib/pdfFonts'

interface CorporateProfessionalTemplateProps {
  data: ResumeData
  watermark?: boolean
}

export const CorporateProfessionalTemplate = ({ data, watermark }: CorporateProfessionalTemplateProps) => {
  return (
    <Document>
      <Page size="A4" style={[corporateStyles.page, getPageFontStyle(data.personal?.fullName)]} wrap={true}>
        {/* Corporate header with contact info */}
        <CorporateHeader personal={data.personal} />

        {/* Professional summary section */}
        {data.summary && (
          <View style={corporateStyles.summarySection} wrap={false}>
            <Text style={corporateStyles.sectionTitle}>PROFESSIONAL SUMMARY</Text>
            <Text style={corporateStyles.summaryText}>{data.summary}</Text>
          </View>
        )}

        {/* Main content area */}
        <CorporateContent data={data} />

        {watermark && <Watermark />}
      </Page>
    </Document>
  )
}

