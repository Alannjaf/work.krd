import { successResponse } from '@/lib/api-helpers'

export async function GET() {
  // Test API endpoint hit
  return successResponse({
    message: 'API is working!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  })
}

export async function POST() {
  // Test POST endpoint hit
  return successResponse({
    message: 'POST API is working!',
    timestamp: new Date().toISOString()
  })
}