import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse, authErrorResponse, validationErrorResponse } from '@/lib/api-helpers'
import { PLAN_NAMES, PAID_PLANS } from '@/lib/constants'
import { devError } from '@/lib/admin-utils'
import { getSystemSettings } from '@/lib/system-settings'

const MAX_SCREENSHOT_SIZE = 5 * 1024 * 1024 // 5MB
const VALID_PLANS = [...PAID_PLANS] as const
const PLAN_PRICES: Record<string, number> = {
  [PLAN_NAMES.PRO]: 5000,
}

export async function POST(req: Request) {
  try {
    const { userId: clerkId } = await auth()
    if (!clerkId) {
      return authErrorResponse()
    }

    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true, name: true, email: true },
    })

    if (!user) {
      return errorResponse('User not found', 404)
    }

    // Parse multipart form data
    let formData: FormData
    try {
      formData = await req.formData()
    } catch {
      return validationErrorResponse('Invalid form data')
    }

    const plan = formData.get('plan') as string | null
    const screenshot = formData.get('screenshot') as File | null

    // Validate plan
    if (!plan || !VALID_PLANS.includes(plan as typeof VALID_PLANS[number])) {
      return validationErrorResponse('Plan must be PRO')
    }

    // Validate screenshot
    if (!screenshot || !(screenshot instanceof File)) {
      return validationErrorResponse('Screenshot is required')
    }

    if (!screenshot.type.startsWith('image/')) {
      return validationErrorResponse('Screenshot must be an image file')
    }

    // Validate file type by checking magic bytes (not just MIME type which is client-controlled)
    const headerBytes = await screenshot.slice(0, 12).arrayBuffer()
    const header = new Uint8Array(headerBytes)
    const isValidImage =
      // JPEG: FF D8 FF
      (header[0] === 0xFF && header[1] === 0xD8 && header[2] === 0xFF) ||
      // PNG: 89 50 4E 47
      (header[0] === 0x89 && header[1] === 0x50 && header[2] === 0x4E && header[3] === 0x47) ||
      // WebP: RIFF....WEBP
      (header[0] === 0x52 && header[1] === 0x49 && header[2] === 0x46 && header[3] === 0x46 &&
       header[8] === 0x57 && header[9] === 0x45 && header[10] === 0x42 && header[11] === 0x50)

    if (!isValidImage) {
      return validationErrorResponse('Screenshot must be a valid image file (JPEG, PNG, or WebP)')
    }

    if (screenshot.size > MAX_SCREENSHOT_SIZE) {
      return validationErrorResponse('Screenshot must be under 5MB')
    }

    // Check for existing pending payment
    const pendingPayment = await prisma.payment.findFirst({
      where: {
        userId: user.id,
        status: 'PENDING',
      },
    })

    if (pendingPayment) {
      return validationErrorResponse('You already have a pending payment. Please wait for it to be reviewed.')
    }

    // Convert screenshot to Buffer
    const arrayBuffer = await screenshot.arrayBuffer()
    const screenshotBuffer = Buffer.from(arrayBuffer)
    const screenshotType = screenshot.type

    // Snapshot the current plan price so admin review validates against
    // the price that was active when the user submitted payment
    const settings = await getSystemSettings()
    const amount = settings.proPlanPrice || PLAN_PRICES[plan] || 5000

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        userId: user.id,
        plan: plan as typeof PLAN_NAMES.PRO,
        amount,
        priceAtCreation: amount,
        screenshotData: screenshotBuffer,
        screenshotType,
        status: 'PENDING',
      },
    })

    // Send Telegram notification (non-blocking)
    sendTelegramNotification({
      paymentId: payment.id,
      userName: user.name || 'Unknown',
      userEmail: user.email,
      plan,
      amount,
      screenshotBuffer,
      screenshotType,
    }).catch((err) => {
      devError('[PaymentSubmit] Telegram notification failed:', err)
    })

    return successResponse({
      success: true,
      paymentId: payment.id,
      message: 'Payment submitted successfully',
    }, 201)
  } catch (error) {
    devError('[PaymentSubmit] Failed to submit payment:', error)
    return errorResponse('Failed to submit payment', 500)
  }
}

async function sendTelegramNotification({
  paymentId,
  userName,
  userEmail,
  plan,
  amount,
  screenshotBuffer,
  screenshotType,
}: {
  paymentId: string
  userName: string
  userEmail: string
  plan: string
  amount: number
  screenshotBuffer: Buffer
  screenshotType: string
}) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_ADMIN_CHAT_ID

  if (!botToken || !chatId) {
    console.warn('[PaymentSubmit] Telegram credentials not configured')
    return
  }

  const caption = [
    `💳 New Payment Submission`,
    ``,
    `👤 Name: ${userName}`,
    `📧 Email: ${userEmail}`,
    `📋 Plan: ${plan}`,
    `💰 Amount: ${amount.toLocaleString()} IQD`,
    `🆔 Payment ID: ${paymentId}`,
  ].join('\n')

  // Determine file extension from MIME type
  const ext = screenshotType.split('/')[1] || 'jpg'

  const formData = new FormData()
  formData.append('chat_id', chatId)
  formData.append('caption', caption)
  formData.append('photo', new Blob([screenshotBuffer], { type: screenshotType }), `payment-${paymentId}.${ext}`)

  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`Photo send failed: ${response.status}`)
    }
  } catch (photoError) {
    // Fallback: send text-only notification if photo fails (e.g. serverless Blob issues)
    console.warn('[PaymentSubmit] Photo notification failed, sending text fallback:', photoError)
    const textResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: `${caption}\n\n⚠️ Screenshot could not be attached`,
        parse_mode: 'HTML',
      }),
    })

    if (!textResponse.ok) {
      const text = await textResponse.text()
      throw new Error(`Telegram text fallback failed: ${textResponse.status} - ${text}`)
    }
  }
}
