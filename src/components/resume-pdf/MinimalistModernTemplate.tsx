import { Document, Page } from '@react-pdf/renderer'
import { ResumeData } from '@/types/resume'
import { MinimalistHeader } from './components/MinimalistHeader'
import { MinimalistContent } from './components/MinimalistContent'
import { minimalistStyles } from './styles/minimalistStyles'
import { Watermark } from './components/Watermark'
import { getPageFontStyle } from '@/lib/pdfFonts'

interface MinimalistModernTemplateProps {
  data: ResumeData
  watermark?: boolean
}

export const MinimalistModernTemplate = ({ data, watermark }: MinimalistModernTemplateProps) => {
  return (
    <Document>
      <Page size="A4" style={[minimalistStyles.page, getPageFontStyle(data.personal?.fullName)]} wrap={true}>
        <MinimalistHeader personal={data.personal} />
        <MinimalistContent data={data} />

        {watermark && <Watermark />}
      </Page>
    </Document>
  )
}