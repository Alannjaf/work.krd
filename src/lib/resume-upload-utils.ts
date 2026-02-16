/**
 * Utility functions for resume upload/import processing.
 * Extracted from the upload route to keep it focused on request handling.
 */

/**
 * Convert various date formats to YYYY-MM.
 * Handles: MM/YYYY, YYYY-MM, Month YYYY, MM-YYYY, DD/MM/YYYY, YYYY, "Present"/"Current"
 */
export function convertDateFormat(date: string): string {
  if (!date || date.trim() === '') return ''
  date = date.trim()
  if (date.toLowerCase().includes('present') || date.toLowerCase().includes('current')) return ''
  if (date.match(/^\d{1,2}\/\d{4}$/)) {
    const [month, year] = date.split('/')
    return `${year}-${month.padStart(2, '0')}`
  }
  if (date.match(/^\d{4}-\d{2}$/)) return date
  const monthYearMatch = date.match(/^(\w+)\s+(\d{4})$/)
  if (monthYearMatch) {
    const monthNames: Record<string, string> = {
      'january': '01', 'jan': '01',
      'february': '02', 'feb': '02',
      'march': '03', 'mar': '03',
      'april': '04', 'apr': '04',
      'may': '05',
      'june': '06', 'jun': '06',
      'july': '07', 'jul': '07',
      'august': '08', 'aug': '08',
      'september': '09', 'sep': '09', 'sept': '09',
      'october': '10', 'oct': '10',
      'november': '11', 'nov': '11',
      'december': '12', 'dec': '12',
    }
    const monthNum = monthNames[monthYearMatch[1].toLowerCase()]
    if (monthNum) return `${monthYearMatch[2]}-${monthNum}`
  }
  if (date.match(/^\d{1,2}-\d{4}$/)) {
    const [month, year] = date.split('-')
    return `${year}-${month.padStart(2, '0')}`
  }
  if (date.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) {
    const parts = date.split('/')
    return `${parts[2]}-${parts[1].padStart(2, '0')}`
  }
  if (date.match(/^\d{4}$/)) return `${date}-01`
  return ''
}

/**
 * Check if a date string indicates a current/present position.
 */
export function isCurrentDate(endDate: string | undefined | null): boolean {
  return !!endDate?.toLowerCase().includes('present') || !!endDate?.toLowerCase().includes('current')
}

/**
 * Normalize a language entry from AI extraction.
 * Handles both string and object formats.
 */
export function normalizeLanguage(
  lang: string | { id?: string; name?: string; proficiency?: string },
  index: number
): { id: string; name: string; proficiency: string } {
  if (typeof lang === 'string') {
    return {
      id: `lang_${index + 1}`,
      name: lang,
      proficiency: 'Conversational',
    }
  }
  return {
    id: lang.id || `lang_${index + 1}`,
    name: lang.name || '',
    proficiency: lang.proficiency || 'Conversational',
  }
}

/**
 * Normalize a skill entry from AI extraction.
 * Handles both string and object formats.
 */
export function normalizeSkill(
  skill: string | { id?: string; name?: string; level?: string },
  index: number
): { id: string; name: string; level: string } {
  if (typeof skill === 'string') {
    return {
      id: `skill_${index + 1}`,
      name: skill,
      level: '',
    }
  }
  return {
    id: skill.id || `skill_${index + 1}`,
    name: skill.name || '',
    level: skill.level || '',
  }
}

/**
 * Clean AI response text to extract valid JSON.
 * Removes markdown code fences and trims to outer braces.
 */
export function cleanJsonResponse(aiText: string): string {
  let cleaned = aiText
  cleaned = cleaned.replace(/```json\s*/g, '').replace(/```\s*/g, '')

  const firstBrace = cleaned.indexOf('{')
  if (firstBrace > 0) {
    cleaned = cleaned.substring(firstBrace)
  }

  const lastBrace = cleaned.lastIndexOf('}')
  if (lastBrace > -1 && lastBrace < cleaned.length - 1) {
    cleaned = cleaned.substring(0, lastBrace + 1)
  }

  return cleaned
}
