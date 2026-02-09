import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getCurrentUser, getResumeById, updateResume, deleteResume, checkUserLimits } from '@/lib/db'
import { SectionType } from '@prisma/client'

// GET - Get a specific resume
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    const { id } = await params
    
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const resume = await getResumeById(id, user.id)
    if (!resume) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 })
    }

    // Transform sections data for frontend
    const transformedResume = {
      ...resume,
      formData: {
        personal: resume.personalInfo,
        summary: resume.summary,
        experience: resume.sections.find(s => s.type === 'WORK_EXPERIENCE')?.content || [],
        education: resume.sections.find(s => s.type === 'EDUCATION')?.content || [],
        skills: resume.sections.find(s => s.type === 'SKILLS')?.content || [],
        languages: resume.sections.find(s => s.type === 'LANGUAGES')?.content || [],
        projects: resume.sections.find(s => s.type === 'PROJECTS')?.content || [],
        certifications: resume.sections.find(s => s.type === 'CERTIFICATIONS')?.content || []
      }
    }

    return NextResponse.json({ resume: transformedResume })
  } catch (error) {
    console.error('[Resumes] Failed to fetch resume:', error);
    return NextResponse.json({
      error: 'Failed to fetch resume'
    }, { status: 500 })
  }
}

// PUT - Update a specific resume
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    const { id } = await params
    
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const body = await req.json()
    const { title, formData, template } = body

    // Check if resume exists and belongs to user
    const existingResume = await getResumeById(id, user.id)
    if (!existingResume) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 })
    }

    // Validate template access if template is being changed
    if (template && template !== existingResume.template && template !== 'modern') {
      const limits = await checkUserLimits(userId)
      const availableTemplates = limits.availableTemplates || ['modern']
      if (!availableTemplates.includes(template)) {
        return NextResponse.json({ 
          error: 'Template not available for your subscription plan. Please upgrade to access this template.' 
        }, { status: 403 })
      }
    }

    // Update basic resume info
    const updatedResume = await updateResume(id, user.id, {
      title: title || existingResume.title,
      template: template || existingResume.template,
      personalInfo: formData?.personal || existingResume.personalInfo,
      summary: formData?.summary || existingResume.summary
    })

    // Update sections if provided
    if (formData) {
      const { prisma } = await import('@/lib/prisma')
      
      // Clear existing sections
      await prisma.resumeSection.deleteMany({
        where: { resumeId: id }
      })

      // Create new sections
      const sections = []
      let order = 1

      if (formData.experience?.length > 0) {
        sections.push({
          resumeId: id,
          type: SectionType.WORK_EXPERIENCE,
          title: 'Work Experience',
          content: formData.experience,
          order: order++
        })
      }

      if (formData.education?.length > 0) {
        sections.push({
          resumeId: id,
          type: SectionType.EDUCATION,
          title: 'Education',
          content: formData.education,
          order: order++
        })
      }

      if (formData.skills?.length > 0) {
        sections.push({
          resumeId: id,
          type: SectionType.SKILLS,
          title: 'Skills',
          content: formData.skills,
          order: order++
        })
      }

      if (formData.languages?.length > 0) {
        sections.push({
          resumeId: id,
          type: SectionType.LANGUAGES,
          title: 'Languages',
          content: formData.languages,
          order: order++
        })
      }

      if (formData.projects?.length > 0) {
        sections.push({
          resumeId: id,
          type: SectionType.PROJECTS,
          title: 'Projects',
          content: formData.projects,
          order: order++
        })
      }

      if (formData.certifications?.length > 0) {
        sections.push({
          resumeId: id,
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

    return NextResponse.json({ 
      resume: updatedResume,
      message: 'Resume updated successfully' 
    })
  } catch (error) {
    console.error('[Resumes] Failed to update resume:', error);
    return NextResponse.json({
      error: 'Failed to update resume'
    }, { status: 500 })
  }
}

// DELETE - Delete a specific resume
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    const { id } = await params
    
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if resume exists and belongs to user
    const existingResume = await getResumeById(id, user.id)
    if (!existingResume) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 })
    }

    await deleteResume(id, user.id)

    return NextResponse.json({ 
      message: 'Resume deleted successfully' 
    })
  } catch (error) {
    console.error('[Resumes] Failed to delete resume:', error);
    return NextResponse.json({
      error: 'Failed to delete resume'
    }, { status: 500 })
  }
}