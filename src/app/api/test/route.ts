import { successResponse, errorResponse } from '@/lib/api-helpers'

export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return errorResponse('Not found', 404)
  }

  return successResponse({
    message: 'API is working!',
    timestamp: new Date().toISOString(),
  })
}

export async function POST() {
  if (process.env.NODE_ENV === 'production') {
    return errorResponse('Not found', 404)
  }

  return successResponse({
    message: 'POST API is working!',
    timestamp: new Date().toISOString(),
  })
}