import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

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
    
    return NextResponse.json({
      success: true,
      userCount,
      resumeCount,
      message: 'Database connection successful'
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Database connection failed'
    }, { status: 500 });
  }
}