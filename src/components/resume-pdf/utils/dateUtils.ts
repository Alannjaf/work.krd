export const formatDate = (dateString: string) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${month}/${year}`
}

/**
 * Format a full date as DD/MM/YYYY (for date of birth, etc.)
 */
export const formatFullDate = (dateString: string) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
}

export const formatDateRange = (startDate: string | undefined, endDate: string | undefined, current: boolean) => {
  const start = formatDate(startDate || '')
  const end = current ? 'Present' : formatDate(endDate || '')
  return `${start} - ${end}`
}