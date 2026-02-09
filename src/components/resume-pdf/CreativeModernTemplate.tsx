import { Page, Text, View, Document } from '@react-pdf/renderer'
import { ResumeData } from '@/types/resume'
import { CreativeModernHeader } from './components/CreativeModernHeader'
import { CreativeModernContent } from './components/CreativeModernContent'
import { creativeModernStyles } from './styles/creativeModernStyles'
import { Watermark } from './components/Watermark'

interface CreativeModernTemplateProps {
  data: ResumeData
  watermark?: boolean
}

export const CreativeModernTemplate = ({ data, watermark }: CreativeModernTemplateProps) => {
  return (
    <Document>
      <Page size="A4" style={creativeModernStyles.page} wrap={true}>
        {/* Creative modern header with contact info */}
        <CreativeModernHeader personal={data.personal} />

        {/* Professional summary section */}
        {data.summary && (
          <View style={creativeModernStyles.summarySection} wrap={false}>
            <Text style={creativeModernStyles.summaryText}>{data.summary}</Text>
          </View>
        )}

        {/* Main content area */}
        <CreativeModernContent data={data} />

        {watermark && <Watermark />}
      </Page>
    </Document>
  )
}

