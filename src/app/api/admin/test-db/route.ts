import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-helpers';

export async function GET() {
  try {
    // Try to count users
    const userCount = await prisma.user.count();
    
    // Try to count resumes
    let resumeCount = 0;
    try {
      resumeCount = await prisma.resume.count();
    } catch (error) {
      console.error('[TestDB] Failed to count resumes:', error);
      // Resume table might not exist yet
    }
    
    return successResponse({
      success: true,
      userCount,
      resumeCount,
      message: 'Database connection successful'
    });
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Database connection failed', 500);
  }
}