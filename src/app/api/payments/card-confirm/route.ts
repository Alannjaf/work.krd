import { NextRequest } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse, authErrorResponse, validationErrorResponse } from '@/lib/api-helpers'
import { PLAN_NAMES, SUBSCRIPTION_DURATION_MS } from '@/lib/constants'
import { devError } from '@/lib/admin-utils'
import { getSystemSettings } from '@/lib/system-settings'
import { rateLimit, rateLimitResponse } from '@/lib/rate-limit'
import { REFERRAL_DISCOUNT_IQD } from '@/lib/referral'

export async function POST(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth()
    if (!clerkId) {
      return authErrorResponse()
    }

    const { success, resetIn } = rateLimit(req, {
      maxRequests: 5,
      windowSeconds: 300,
      identifier: 'card-confirm',
      userId: clerkId,
    })
    if (!success) return rateLimitResponse(resetIn)

    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true, name: true, email: true, referredBy: true },
    })

    if (!user) {
      return errorResponse('User not found', 404)
    }

    let body: { transactionId?: string }
    try {
      body = await req.json()
    } catch {
      return validationErrorResponse('Invalid request body')
    }

    const { transactionId } = body

    if (!transactionId || typeof transactionId !== 'string' || transactionId.trim().length === 0) {
      return validationErrorResponse('Transaction ID is required')
    }

    // Check for duplicate transaction ID
    const existingTxn = await prisma.payment.findFirst({
      where: { transactionId: transactionId.trim() },
    })

    if (existingTxn) {
      return validationErrorResponse('This transaction has already been processed')
    }

    // Calculate price
    const settings = await getSystemSettings()
    const basePrice = settings?.proPlanPrice || 5000
    const amount = user.referredBy ? basePrice - REFERRAL_DISCOUNT_IQD : basePrice

    const now = new Date()
    const endDate = new Date(Date.now() + SUBSCRIPTION_DURATION_MS)

    // Create payment record and activate subscription in a single transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create approved payment record
      const payment = await tx.payment.create({
        data: {
          userId: user.id,
          plan: PLAN_NAMES.PRO,
          amount,
          priceAtCreation: amount,
          paymentMethod: 'CARD',
          transactionId: transactionId.trim(),
          status: 'APPROVED',
          reviewedAt: now,
          adminNote: 'Auto-approved via Gammal Tech card payment',
        },
      })

      // Upsert subscription
      const existingSub = await tx.subscription.findUnique({
        where: { userId: user.id },
      })

      if (existingSub) {
        await tx.subscription.update({
          where: { userId: user.id },
          data: {
            plan: PLAN_NAMES.PRO,
            status: 'ACTIVE',
            paymentMethod: 'CARD',
            paymentId: payment.id,
            startDate: now,
            endDate,
          },
        })
      } else {
        await tx.subscription.create({
          data: {
            userId: user.id,
            plan: PLAN_NAMES.PRO,
            status: 'ACTIVE',
            paymentMethod: 'CARD',
            paymentId: payment.id,
            startDate: now,
            endDate,
          },
        })
      }

      // Handle referral rewards
      if (user.referredBy) {
        try {
          const referral = await tx.referral.findFirst({
            where: {
              referredId: user.id,
              referralCode: user.referredBy,
              status: { in: ['PENDING', 'COMPLETED'] },
            },
          })

          if (referral) {
            await tx.referral.update({
              where: { id: referral.id },
              data: { status: 'REWARDED', rewardType: '30_DAYS_PRO' },
            })

            // Extend referrer's subscription by 30 days
            const referrerSub = await tx.subscription.findUnique({
              where: { userId: referral.referrerId },
            })

            if (referrerSub) {
              const currentEnd =
                referrerSub.endDate && referrerSub.endDate > now
                  ? referrerSub.endDate
                  : now
              const newEnd = new Date(currentEnd.getTime() + SUBSCRIPTION_DURATION_MS)

              await tx.subscription.update({
                where: { userId: referral.referrerId },
                data: {
                  plan: 'PRO',
                  status: 'ACTIVE',
                  endDate: newEnd,
                },
              })
            } else {
              await tx.subscription.create({
                data: {
                  userId: referral.referrerId,
                  plan: 'PRO',
                  status: 'ACTIVE',
                  startDate: now,
                  endDate: new Date(now.getTime() + SUBSCRIPTION_DURATION_MS),
                },
              })
            }
          }
        } catch (referralError) {
          devError('[CardConfirm] Referral reward failed:', referralError)
        }
      }

      return payment
    })

    // Send Telegram notification (non-blocking)
    sendCardPaymentNotification({
      paymentId: result.id,
      userName: user.name || 'Unknown',
      userEmail: user.email,
      amount,
      transactionId: transactionId.trim(),
    }).catch((err) => {
      devError('[CardConfirm] Telegram notification failed:', err)
    })

    return successResponse(
      {
        success: true,
        paymentId: result.id,
        message: 'Payment confirmed and Pro plan activated!',
      },
      201
    )
  } catch (error) {
    devError('[CardConfirm] Failed to confirm card payment:', error)
    return errorResponse('Failed to confirm payment', 500)
  }
}

async function sendCardPaymentNotification({
  paymentId,
  userName,
  userEmail,
  amount,
  transactionId,
}: {
  paymentId: string
  userName: string
  userEmail: string
  amount: number
  transactionId: string
}) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_ADMIN_CHAT_ID

  if (!botToken || !chatId) return

  const text = [
    `💳 Card Payment (Auto-Approved)`,
    ``,
    `👤 Name: ${userName}`,
    `📧 Email: ${userEmail}`,
    `📋 Plan: PRO`,
    `💰 Amount: ${amount.toLocaleString()} IQD`,
    `🔖 Txn ID: ${transactionId}`,
    `🆔 Payment ID: ${paymentId}`,
    `✅ Status: Auto-approved`,
  ].join('\n')

  await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text }),
  })
}
