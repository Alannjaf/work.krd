import { PersonalInfo } from '@/types/resume'

/**
 * Builds an array of formatted demographics strings from personal info.
 * Used across 7+ PDF template headers.
 */
export const buildDemographicsItems = (
  personal: PersonalInfo,
  options?: { maritalLabel?: string }
): string[] => {
  const maritalLabel = options?.maritalLabel ?? 'Marital'
  return [
    personal.dateOfBirth && `Born: ${personal.dateOfBirth}`,
    personal.gender && `Gender: ${personal.gender}`,
    personal.nationality && `Nationality: ${personal.nationality}`,
    personal.maritalStatus && `${maritalLabel}: ${personal.maritalStatus}`,
    personal.country && `Country: ${personal.country}`
  ].filter((item): item is string => Boolean(item))
}

/**
 * Checks whether any demographic fields are present in the personal info.
 * Used in every PDF template header for conditional rendering.
 */
export const hasDemographics = (personal: PersonalInfo): boolean => {
  return Boolean(
    personal.dateOfBirth ||
    personal.gender ||
    personal.nationality ||
    personal.maritalStatus ||
    personal.country
  )
}

/**
 * Builds a joined demographics string with a separator.
 * Used in headers that render demographics as a single text line.
 */
export const buildDemographicsString = (
  personal: PersonalInfo,
  separator: string = ' • ',
  options?: { maritalLabel?: string }
): string => {
  return buildDemographicsItems(personal, options).join(separator)
}
