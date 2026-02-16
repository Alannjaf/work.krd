import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { tempStore } from '@/lib/tempStore';
import { successResponse, errorResponse, authErrorResponse, validationErrorResponse } from '@/lib/api-helpers';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return authErrorResponse();
    }

    const body = await request.json();
    const { resumeData, template } = body;

    if (!resumeData || !template) {
      return validationErrorResponse('Missing required fields');
    }

    // Generate a cryptographically secure ID to prevent guessing
    const id = crypto.randomUUID();
    
    // Store temporarily
    tempStore.set(id, {
      data: resumeData,
      template,
      userId,
      createdAt: Date.now()
    });

    return successResponse({ id });
  } catch (error) {
    console.error('[TempCreate] Failed to store temporary data:', error);
    return errorResponse('Failed to store data', 500);
  }
}

