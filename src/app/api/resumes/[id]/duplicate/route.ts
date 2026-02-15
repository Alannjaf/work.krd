import { auth } from '@clerk/nextjs/server'
import { getCurrentUser, duplicateResume } from '@/lib/db'
import { successResponse, errorResponse, authErrorResponse, notFoundResponse, forbiddenResponse } from '@/lib/api-helpers'

// POST - Duplicate a resume
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    const { id } = await params

    if (!userId) {
      return authErrorResponse()
    }

    const user = await getCurrentUser()
    if (!user) {
      return notFoundResponse('User not found')
    }

    const resume = await duplicateResume(id, user.id, userId)

    return successResponse({
      resume,
      message: 'Resume duplicated successfully'
    })
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'RESUME_NOT_FOUND') {
        return notFoundResponse('Resume not found')
      }
      if (error.message === 'RESUME_LIMIT_REACHED') {
        return forbiddenResponse('Resume limit reached. Please upgrade your plan.')
      }
    }
    console.error('[Resumes] Failed to duplicate resume:', error);
    return errorResponse('Failed to duplicate resume', 500)
  }
}
