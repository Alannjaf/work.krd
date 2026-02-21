import { NextRequest } from 'next/server';
import { z } from 'zod';
import { auth } from '@clerk/nextjs/server';
import { tempStore } from '@/lib/tempStore';
import { successResponse, errorResponse, authErrorResponse, validationErrorResponse } from '@/lib/api-helpers';
import type { ResumeData } from '@/types/resume';

const tempCreateSchema = z.object({
  resumeData: z.record(z.string(), z.unknown()),
  template: z.string().min(1).max(50),
});

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return authErrorResponse();
    }

    const body = await request.json();
    const parsed = tempCreateSchema.safeParse(body);
    if (!parsed.success) {
      return validationErrorResponse(parsed.error.issues[0]?.message || 'Missing required fields');
    }
    const { resumeData, template } = parsed.data;

    // Generate a cryptographically secure ID to prevent guessing
    const id = crypto.randomUUID();
    
    // Store temporarily
    tempStore.set(id, {
      data: resumeData as unknown as ResumeData,
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

