import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { PLAN_NAMES } from '@/lib/constants'
import { devError } from '@/lib/admin-utils'

// Simple in-memory rate limiter for webhook endpoint
const webhookRateLimit = new Map<string, { count: number; resetTime: number }>()
const WEBHOOK_MAX_REQUESTS = 100
const WEBHOOK_WINDOW_MS = 60_000 // 1 minute

function checkWebhookRateLimit(identifier: string): boolean {
  const now = Date.now()
  const entry = webhookRateLimit.get(identifier)
  if (!entry || now > entry.resetTime) {
    webhookRateLimit.set(identifier, { count: 1, resetTime: now + WEBHOOK_WINDOW_MS })
    return true
  }
  if (entry.count >= WEBHOOK_MAX_REQUESTS) return false
  entry.count++
  return true
}

export async function POST(req: Request) {
  // Get the headers
  const headerPayload = await headers()
  const svix_id = headerPayload.get("svix-id")
  const svix_timestamp = headerPayload.get("svix-timestamp")
  const svix_signature = headerPayload.get("svix-signature")

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400
    })
  }

  // Rate limit by svix-id to prevent flood attacks
  const rateLimitKey = `webhook:${svix_id}`
  if (!checkWebhookRateLimit(rateLimitKey)) {
    return new Response('Too many requests', { status: 429 })
  }

  // Get the body
  const payload = await req.json()
  const body = JSON.stringify(payload)
  // Payload received

  // Check environment variables
  if (!process.env.CLERK_WEBHOOK_SECRET) {
    // Missing CLERK_WEBHOOK_SECRET
    return new Response('Server configuration error', { status: 500 })
  }

  // Webhook secret present

  // Create a new Svix instance with your secret.
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!)

  let evt: WebhookEvent

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature}) as WebhookEvent
    // Webhook signature verified
  } catch (error) {
    devError('[Webhook] Clerk webhook verification failed:', error);
    return new Response('Error occured', {
      status: 400
    })
  }

  // Handle the webhook
  const eventType = evt.type
  // Processing event

  if (eventType === 'user.created' || eventType === 'user.updated') {
    const { id, email_addresses, first_name, last_name } = evt.data
    // User data received

    const email = email_addresses[0]?.email_address
    if (!email) {
      // No email found in payload
      return new Response('No email found', { status: 400 })
    }

    // Email processed

    try {
      // Starting database operations
      
      const user = await prisma.user.upsert({
        where: { clerkId: id },
        update: {
          email,
          name: `${first_name || ''} ${last_name || ''}`.trim() || null},
        create: {
          clerkId: id,
          email,
          name: `${first_name || ''} ${last_name || ''}`.trim() || null}})

      // User upserted

      if (eventType === 'user.created') {
        await prisma.subscription.upsert({
          where: { userId: user.id },
          update: {},
          create: {
            userId: user.id,
            plan: PLAN_NAMES.FREE,
            status: 'ACTIVE',
          },
        })

        // Fire-and-forget: schedule welcome email series for new user
        try {
          const { scheduleWelcomeSeries } = await import('@/lib/email/schedulers/welcome')
          scheduleWelcomeSeries(user.id).catch((err: unknown) =>
            devError('[Webhook] Failed to schedule welcome series:', err)
          )
        } catch (err) {
          devError('[Webhook] Failed to import welcome scheduler:', err)
        }
      }
      
      // User sync completed successfully
    } catch (error) {
      devError('[Webhook] Database error syncing user:', error)
      return new Response('Error syncing user', { status: 500 })
    }
  }

  if (eventType === 'user.deleted') {
    const { id } = evt.data
    // Deleting user

    try {
      // Check if user exists first
      const user = await prisma.user.findUnique({
        where: { clerkId: id }
      })

      if (user) {
        // Delete user (this will cascade delete resumes, subscriptions, etc.)
        await prisma.user.delete({
          where: { clerkId: id }})
        // User deleted
      } else {
        // User not found for deletion
      }
    } catch (error) {
      devError('[Webhook] Error deleting user:', error)
      return new Response('Error deleting user', { status: 500 })
    }
  }

  // Webhook processed successfully
  return new Response('OK', { status: 200 })
}