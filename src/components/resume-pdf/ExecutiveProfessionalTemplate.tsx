import { Page, Text, View, Document } from '@react-pdf/renderer'
import { ResumeData } from '@/types/resume'
import { ExecutiveHeader } from './components/ExecutiveHeader'
import { ExecutiveContent } from './components/ExecutiveContent'
import { executiveStyles } from './styles/executiveStyles'
import { Watermark } from './components/Watermark'
import { getPageFontStyle } from '@/lib/pdfFonts'

interface ExecutiveProfessionalTemplateProps {
  data: ResumeData
  watermark?: boolean
}

export const ExecutiveProfessionalTemplate = ({ data, watermark }: ExecutiveProfessionalTemplateProps) => {
  return (
    <Document>
      <Page size="A4" style={[executiveStyles.page, getPageFontStyle(data.personal?.fullName)]} wrap={true} break={true}>
        {/* Executive header with contact info */}
        <ExecutiveHeader personal={data.personal} />

        {/* Professional summary section */}
        {data.summary && (
          <View style={executiveStyles.summarySection}>
            <Text style={executiveStyles.sectionTitle}>PROFESSIONAL SUMMARY</Text>
            <Text style={executiveStyles.summaryText}>{data.summary}</Text>
          </View>
        )}

        {/* Main content area */}
        <ExecutiveContent data={data} />

        {watermark && <Watermark />}
      </Page>
    </Document>
  )
}