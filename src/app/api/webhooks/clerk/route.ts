import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { PLAN_NAMES } from '@/lib/constants'

export async function POST(req: Request) {
  // Webhook received
  
  // Get the headers
  const headerPayload = await headers()
  const svix_id = headerPayload.get("svix-id")
  const svix_timestamp = headerPayload.get("svix-timestamp")
  const svix_signature = headerPayload.get("svix-signature")

  // Headers checked

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    // Missing svix headers
    return new Response('Error occured -- no svix headers', {
      status: 400
    })
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
    console.error('[Webhook] Clerk webhook verification failed:', error);
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

      // Create a free subscription for new users
      if (eventType === 'user.created') {
        // Creating subscription for new user
        
        // Check if subscription already exists
        const existingSubscription = await prisma.subscription.findUnique({
          where: { userId: user.id }
        })

        if (!existingSubscription) {
          await prisma.subscription.create({
            data: {
              userId: user.id, // Use database user ID, not Clerk ID
              plan: PLAN_NAMES.FREE,
              status: 'ACTIVE'}})
          // Subscription created
        } else {
          // Subscription already exists
        }
      }
      
      // User sync completed successfully
    } catch (error) {
      // Database error
      return new Response(`Error syncing user: ${error}`, { status: 500 })
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
      // Error deleting user
      return new Response(`Error deleting user: ${error}`, { status: 500 })
    }
  }

  // Webhook processed successfully
  return new Response('OK', { status: 200 })
}