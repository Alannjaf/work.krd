import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getUserResumes, createResume, checkUserLimits } from '@/lib/db'
import { SectionType } from '@prisma/client'

// GET - List all resumes for the current user
export async function GET(req: Request) {
  try {
    const { userId: clerkId } = await auth()
    
    if (!clerkId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Parse pagination parameters
    const { searchParams } = new URL(req.url)
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100) // Max 100
    const offset = parseInt(searchParams.get('offset') || '0', 10)

    // Use a single optimized query with relation filtering to get resumes directly
    const { prisma } = await import('@/lib/prisma')
    const resumes = await prisma.resume.findMany({
      where: { user: { clerkId } },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        title: true,
        createdAt: true,
        updatedAt: true,
        personalInfo: true,
        template: true,
      },
      take: limit,
      skip: offset,
    })

    // Get total count for pagination metadata
    const totalCount = await prisma.resume.count({
      where: { user: { clerkId } },
    })
    
    // Extract only needed fields from personalInfo JSON
    const optimizedResumes = resumes.map(resume => {
      const personalInfo = resume.personalInfo as { fullName?: string; email?: string } | null
      return {
        ...resume,
        personalInfo: personalInfo ? {
          fullName: personalInfo.fullName || '',
          email: personalInfo.email || ''
        } : null
      }
    })

    const response = NextResponse.json({ 
      resumes: optimizedResumes,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount
      }
    })

    // Add cache headers for client-side caching (5 minutes)
    response.headers.set('Cache-Control', 'private, max-age=300, stale-while-revalidate=60')
    
    return response
  } catch (error) {
    console.error('Error fetching resumes:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch resumes',
      details: process.env.NODE_ENV === 'development' ? String(error) : undefined
    }, { status: 500 })
  }
}

// POST - Create a new resume
export async function POST(req: Request) {
  try {
    const { userId: clerkId } = await auth()
    
    if (!clerkId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Get user with single query
    const { prisma } = await import('@/lib/prisma')
    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true }
    })
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const body = await req.json()
    const { title, formData, template } = body


    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    // Check user limits using Clerk ID
    const { canCreateResume } = await import('@/lib/db').then(m => m.checkUserLimits(clerkId))
    if (!canCreateResume) {
      return NextResponse.json({ 
        error: 'Resume limit reached. Please upgrade your plan.' 
      }, { status: 403 })
    }

    // Validate template access
    if (template && template !== 'modern') {
      const limits = await checkUserLimits(clerkId)
      const availableTemplates = limits.availableTemplates || ['modern']
      if (!availableTemplates.includes(template)) {
        return NextResponse.json({ 
          error: 'Template not available for your subscription plan. Please upgrade to access this template.' 
        }, { status: 403 })
      }
    }

    // Create resume with sections
    const resume = await createResume(user.id, title, template)
    
    // If formData is provided, update the resume with the data
    if (formData) {
      const { updateResume } = await import('@/lib/db')
      await updateResume(resume.id, user.id, {
        personalInfo: formData.personal,
        summary: formData.summary
      })

      // Update sections if provided
      if (formData.experience || formData.education || formData.skills || formData.languages || formData.projects || formData.certifications) {
        const { prisma } = await import('@/lib/prisma')
        
        // Clear existing sections
        await prisma.resumeSection.deleteMany({
          where: { resumeId: resume.id }
        })

        // Create new sections
        const sections = []
        let order = 1

        if (formData.experience?.length > 0) {
          sections.push({
            resumeId: resume.id,
            type: SectionType.WORK_EXPERIENCE,
            title: 'Work Experience',
            content: formData.experience,
            order: order++
          })
        }

        if (formData.education?.length > 0) {
          sections.push({
            resumeId: resume.id,
            type: SectionType.EDUCATION,
            title: 'Education',
            content: formData.education,
            order: order++
          })
        }

        if (formData.skills?.length > 0) {
          sections.push({
            resumeId: resume.id,
            type: SectionType.SKILLS,
            title: 'Skills',
            content: formData.skills,
            order: order++
          })
        }

        if (formData.languages?.length > 0) {
          sections.push({
            resumeId: resume.id,
            type: SectionType.LANGUAGES,
            title: 'Languages',
            content: formData.languages,
            order: order++
          })
        }

        if (formData.projects?.length > 0) {
          sections.push({
            resumeId: resume.id,
            type: SectionType.PROJECTS,
            title: 'Projects',
            content: formData.projects,
            order: order++
          })
        }

        if (formData.certifications?.length > 0) {
          sections.push({
            resumeId: resume.id,
            type: SectionType.CERTIFICATIONS,
            title: 'Certifications',
            content: formData.certifications,
            order: order++
          })
        }

        if (sections.length > 0) {
          await prisma.resumeSection.createMany({
            data: sections
          })
        }
      }
    }

    return NextResponse.json({ 
      resume,
      message: 'Resume created successfully' 
    })
  } catch (error) {
    console.error('[Resumes] Failed to create resume:', error);
    return NextResponse.json({
      error: 'Failed to create resume'
    }, { status: 500 })
  }
}