import { ResumeData } from '@/types/resume'

export class ResumeParser {
  /**
   * Parse a PDF buffer and extract text
   * Note: PDF parsing is now handled directly by AI in the upload route
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static async parsePDF(_buffer: Buffer): Promise<string> {
    throw new Error('PDF parsing is handled directly by AI. This method is deprecated.')
  }

  /**
   * Parse a DOCX buffer and extract text
   */
  static async parseDOCX(buffer: Buffer): Promise<string> {
    try {
      const mammoth = (await import('mammoth')).default
      const result = await mammoth.extractRawText({ buffer })
      return result.value
    } catch (error) {
      console.error('[ResumeParser] Failed to parse DOCX file:', error);
      throw new Error('Failed to parse DOCX file')
    }
  }

  /**
   * Extract text from resume file based on file type
   */
  static async extractText(buffer: Buffer, mimeType: string): Promise<string> {
    if (mimeType === 'application/pdf') {
      return this.parsePDF(buffer)
    } else if (
      mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      mimeType === 'application/msword'
    ) {
      return this.parseDOCX(buffer)
    } else {
      throw new Error('Unsupported file type. Please upload a PDF or DOCX file.')
    }
  }

  /**
   * Clean and normalize extracted text
   */
  static cleanText(text: string): string {
    return text
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/\n{3}/g, '\n\n') // Replace multiple newlines with double newline
      .trim()
  }

  /**
   * Extract sections from resume text
   * This is a basic implementation that will be enhanced with AI
   */
  static extractSections(text: string): Record<string, string> {
    const sections: Record<string, string> = {}
    
    // Common section headers in multiple languages
    const sectionHeaders = {
      personal: /(?:personal\s*information|contact|معلومات\s*شخصية|زانیاری\s*کەسی)/i,
      summary: /(?:summary|objective|profile|ملخص|پوختە)/i,
      experience: /(?:experience|work\s*history|employment|خبرة|ئەزموون)/i,
      education: /(?:education|academic|تعليم|پەروەردە)/i,
      skills: /(?:skills|competencies|مهارات|لێهاتووی)/i,
      languages: /(?:languages|لغات|زمان)/i,
      projects: /(?:projects|مشاريع|پڕۆژە)/i,
      certifications: /(?:certifications|certificates|شهادات|بڕوانامە)/i}

    // Split text into lines
    const lines = text.split('\n')
    let currentSection = 'personal'
    let sectionContent: string[] = []

    for (const line of lines) {
      const trimmedLine = line.trim()
      
      // Check if line is a section header
      let foundSection = false
      for (const [section, regex] of Object.entries(sectionHeaders)) {
        if (regex.test(trimmedLine)) {
          // Save previous section
          if (sectionContent.length > 0) {
            sections[currentSection] = sectionContent.join('\n').trim()
          }
          
          currentSection = section
          sectionContent = []
          foundSection = true
          break
        }
      }

      // If not a section header, add to current section
      if (!foundSection && trimmedLine) {
        sectionContent.push(trimmedLine)
      }
    }

    // Save last section
    if (sectionContent.length > 0) {
      sections[currentSection] = sectionContent.join('\n').trim()
    }

    return sections
  }

  /**
   * Basic email extraction
   */
  static extractEmail(text: string): string | null {
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2}\b/
    const match = text.match(emailRegex)
    return match ? match[0] : null
  }

  /**
   * Basic phone extraction
   */
  static extractPhone(text: string): string | null {
    // Match various phone formats
    const phoneRegex = /(?:\+?\d{1,4}[\s.-]?)?\(?\d{1,4}\)?[\s.-]?\d{1,4}[\s.-]?\d{1,4}[\s.-]?\d{1,9}/
    const match = text.match(phoneRegex)
    return match ? match[0].trim() : null
  }

  /**
   * Basic LinkedIn URL extraction
   */
  static extractLinkedIn(text: string): string | null {
    const linkedInRegex = /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[\w-]+\/?/i
    const match = text.match(linkedInRegex)
    return match ? match[0] : null
  }

  /**
   * Basic website URL extraction
   */
  static extractWebsite(text: string): string | null {
    // Exclude common domains like email providers and LinkedIn
    const websiteRegex = /(?:https?:\/\/)?(?:www\.)?(?!linkedin|gmail|yahoo|hotmail|outlook)[\w-]+\.[\w]{2}(?:\/[\w-]*)?/i
    const match = text.match(websiteRegex)
    return match ? match[0] : null
  }

  /**
   * Extract years from date strings
   */
  static extractYears(text: string): number[] {
    const yearRegex = /\b(19|20)\d{2}\b/g
    const matches = text.match(yearRegex)
    return matches ? matches.map(year => parseInt(year)) : []
  }

  /**
   * Basic extraction without AI (fallback)
   * This provides a simple extraction that will be enhanced by AI
   */
  static basicExtraction(text: string): Partial<ResumeData> {
    const cleanedText = this.cleanText(text)
    const sections = this.extractSections(cleanedText)

    // Extract basic personal info
    const personalSection = sections.personal || cleanedText.slice(0, 500)
    const email = this.extractEmail(personalSection) || ''
    const phone = this.extractPhone(personalSection) || ''
    const linkedin = this.extractLinkedIn(cleanedText) || ''
    const website = this.extractWebsite(cleanedText) || ''

    // Try to extract name (usually first line or before email)
    const lines = personalSection.split('\n').filter(line => line.trim())
    let fullName = ''
    
    // Name is often the first non-empty line that doesn't contain email/phone/URL
    for (const line of lines) {
      if (
        !line.includes('@') && 
        !line.match(/\d{3}/) && 
        !line.match(/https?:\/\//) &&
        line.length > 2 &&
        line.length < 50
      ) {
        fullName = line.trim()
        break
      }
    }

    return {
      personal: {
        fullName,
        email,
        phone,
        location: '', // Will be extracted by AI
        linkedin,
        website},
      summary: sections.summary || '',
      experience: [], // Will be parsed by AI
      education: [], // Will be parsed by AI
      skills: [], // Will be parsed by AI
      languages: [], // Will be parsed by AI
      projects: [], // Will be parsed by AI
      certifications: [], // Will be parsed by AI
    }
  }
}