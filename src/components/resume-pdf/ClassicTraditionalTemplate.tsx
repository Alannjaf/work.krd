import { Page, Text, View, Document } from '@react-pdf/renderer'
import { ResumeData } from '@/types/resume'
import { ClassicHeader } from './components/ClassicHeader'
import { ClassicContent } from './components/ClassicContent'
import { classicStyles } from './styles/classicStyles'
import { Watermark } from './components/Watermark'

interface ClassicTraditionalTemplateProps {
  data: ResumeData
  watermark?: boolean
}

export const ClassicTraditionalTemplate = ({ data, watermark }: ClassicTraditionalTemplateProps) => {
  return (
    <Document>
      <Page size="A4" style={classicStyles.page} wrap={true}>
        {/* Classic header with contact info */}
        <ClassicHeader personal={data.personal} />

        {/* Professional summary section */}
        {data.summary && (
          <View style={classicStyles.summarySection} wrap={false}>
            <Text style={classicStyles.sectionTitle}>PROFESSIONAL SUMMARY</Text>
            <Text style={classicStyles.summaryText}>{data.summary}</Text>
          </View>
        )}

        {/* Main content area */}
        <ClassicContent data={data} />

        {watermark && <Watermark />}
      </Page>
    </Document>
  )
}

