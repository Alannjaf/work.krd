import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { tempStore } from '@/lib/tempStore';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { resumeData, template } = body;

    if (!resumeData || !template) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Generate a simple ID
    const id = Math.random().toString(36).substring(2, 15);
    
    // Store temporarily
    tempStore.set(id, {
      data: resumeData,
      template,
      userId,
      createdAt: Date.now()
    });

    return NextResponse.json({ id });
  } catch (error) {
    console.error('[TempCreate] Failed to store temporary data:', error);
    return NextResponse.json(
      { error: 'Failed to store data' },
      { status: 500 }
    );
  }
}

