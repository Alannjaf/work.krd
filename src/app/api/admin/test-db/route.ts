import { requireAdmin } from '@/lib/admin';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-helpers';

export async function GET() {
  try {
    await requireAdmin();

    const userCount = await prisma.user.count();

    let resumeCount = 0;
    try {
      resumeCount = await prisma.resume.count();
    } catch (error) {
      console.error('[TestDB] Failed to count resumes:', error);
    }

    return successResponse({
      success: true,
      userCount,
      resumeCount,
      message: 'Database connection successful'
    });
  } catch (error) {
    console.error('[TestDB] Database connection test failed:', error);
    return errorResponse('Database connection failed', 500);
  }
}
