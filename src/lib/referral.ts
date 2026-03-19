import { prisma } from './prisma'

const REFERRAL_CODE_LENGTH = 8
const REFERRAL_CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // No I, O, 0, 1 to avoid confusion

/**
 * Generate a unique 8-char alphanumeric referral code.
 * Retries up to 5 times if collision occurs.
 */
export async function generateReferralCode(): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt++) {
    let code = ''
    for (let i = 0; i < REFERRAL_CODE_LENGTH; i++) {
      code += REFERRAL_CODE_CHARS[Math.floor(Math.random() * REFERRAL_CODE_CHARS.length)]
    }

    const existing = await prisma.user.findUnique({
      where: { referralCode: code },
      select: { id: true },
    })

    if (!existing) return code
  }

  // Fallback: use timestamp-based code
  const ts = Date.now().toString(36).toUpperCase().slice(-REFERRAL_CODE_LENGTH)
  return ts.padStart(REFERRAL_CODE_LENGTH, 'X')
}

/** Referral discount amount in IQD */
export const REFERRAL_DISCOUNT_IQD = 1000
