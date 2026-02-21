import { NextRequest } from 'next/server'
import { z } from 'zod'
import { auth } from '@clerk/nextjs/server'
import { getCurrentUser, getResumeById, updateResume, deleteResume, checkUserLimits } from '@/lib/db'
import { SectionType } from '@prisma/client'
import type { InputJsonValue } from '@prisma/client/runtime/library'
import { successResponse, errorResponse, authErrorResponse, forbiddenResponse, notFoundResponse, validationErrorResponse } from '@/lib/api-helpers'
import { rateLimit, rateLimitResponse } from '@/lib/rate-limit'

const updateResumeSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  template: z.string().max(50).optional(),
  formData: z.object({
    personal: z.record(z.string(), z.unknown()).optional(),
    summary: z.string().optional(),
    experience: z.array(z.record(z.string(), z.unknown())).optional(),
    education: z.array(z.record(z.string(), z.unknown())).optional(),
    skills: z.array(z.record(z.string(), z.unknown())).optional(),
    languages: z.array(z.record(z.string(), z.unknown())).optional(),
    projects: z.array(z.record(z.string(), z.unknown())).optional(),
    certifications: z.array(z.record(z.string(), z.unknown())).optional(),
  }).optional(),
})

// GET - Get a specific resume
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    const { id } = await params
    
    if (!userId) {
      return authErrorResponse()
    }

    const { success, resetIn } = rateLimit(req, { maxRequests: 30, windowSeconds: 60, identifier: 'resume-get', userId })
    if (!success) return rateLimitResponse(resetIn)

    const user = await getCurrentUser()
    if (!user) {
      return notFoundResponse('User not found')
    }

    const resume = await getResumeById(id, user.id)
    if (!resume) {
      return notFoundResponse('Resume not found')
    }

    // Transform sections data for frontend — O(n) Map instead of O(n*6) repeated .find()
    const sectionMap = new Map(resume.sections.map(s => [s.type, s.content]))
    const transformedResume = {
      ...resume,
      formData: {
        personal: resume.personalInfo,
        summary: resume.summary,
        experience: sectionMap.get('WORK_EXPERIENCE') || [],
        education: sectionMap.get('EDUCATION') || [],
        skills: sectionMap.get('SKILLS') || [],
        languages: sectionMap.get('LANGUAGES') || [],
        projects: sectionMap.get('PROJECTS') || [],
        certifications: sectionMap.get('CERTIFICATIONS') || []
      }
    }

    return successResponse({ resume: transformedResume })
  } catch (error) {
    console.error('[Resumes] Failed to fetch resume:', error);
    return errorResponse('Failed to fetch resume', 500)
  }
}

// PUT - Update a specific resume
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    const { id } = await params
    
    if (!userId) {
      return authErrorResponse()
    }

    const { success, resetIn } = rateLimit(req, { maxRequests: 30, windowSeconds: 60, identifier: 'resume-update', userId })
    if (!success) return rateLimitResponse(resetIn)

    const user = await getCurrentUser()
    if (!user) {
      return notFoundResponse('User not found')
    }

    const body = await req.json()
    const parsed = updateResumeSchema.safeParse(body)
    if (!parsed.success) {
      return validationErrorResponse(parsed.error.issues[0]?.message || 'Invalid input')
    }
    const { title, formData, template } = parsed.data

    // Check if resume exists and belongs to user
    const existingResume = await getResumeById(id, user.id)
    if (!existingResume) {
      return notFoundResponse('Resume not found')
    }

    // Validate template access if template is being changed
    if (template && template !== existingResume.template && template !== 'modern') {
      const limits = await checkUserLimits(userId)
      const availableTemplates = limits.availableTemplates || ['modern']
      if (!availableTemplates.includes(template)) {
        return forbiddenResponse('Template not available for your subscription plan. Please upgrade to access this template.')
      }
    }

    // Update basic resume info
    const updatedResume = await updateResume(id, user.id, {
      title: title || existingResume.title,
      template: template || existingResume.template,
      personalInfo: (formData?.personal || existingResume.personalInfo) as InputJsonValue | undefined,
      summary: formData?.summary || existingResume.summary || undefined
    })

    if (formData) {
      const { prisma } = await import('@/lib/prisma')

      const sections: { resumeId: string; type: SectionType; title: string; content: InputJsonValue; order: number }[] = []
      let order = 1

      if (formData.experience && formData.experience.length > 0) {
        sections.push({ resumeId: id, type: SectionType.WORK_EXPERIENCE, title: 'Work Experience', content: formData.experience as InputJsonValue, order: order++ })
      }
      if (formData.education && formData.education.length > 0) {
        sections.push({ resumeId: id, type: SectionType.EDUCATION, title: 'Education', content: formData.education as InputJsonValue, order: order++ })
      }
      if (formData.skills && formData.skills.length > 0) {
        sections.push({ resumeId: id, type: SectionType.SKILLS, title: 'Skills', content: formData.skills as InputJsonValue, order: order++ })
      }
      if (formData.languages && formData.languages.length > 0) {
        sections.push({ resumeId: id, type: SectionType.LANGUAGES, title: 'Languages', content: formData.languages as InputJsonValue, order: order++ })
      }
      if (formData.projects && formData.projects.length > 0) {
        sections.push({ resumeId: id, type: SectionType.PROJECTS, title: 'Projects', content: formData.projects as InputJsonValue, order: order++ })
      }
      if (formData.certifications && formData.certifications.length > 0) {
        sections.push({ resumeId: id, type: SectionType.CERTIFICATIONS, title: 'Certifications', content: formData.certifications as InputJsonValue, order: order++ })
      }

      await prisma.$transaction(async (tx) => {
        await tx.resumeSection.deleteMany({ where: { resumeId: id } })
        if (sections.length > 0) {
          await tx.resumeSection.createMany({ data: sections })
        }
      })
    }

    return successResponse({
      resume: updatedResume,
      message: 'Resume updated successfully'
    })
  } catch (error) {
    console.error('[Resumes] Failed to update resume:', error);
    return errorResponse('Failed to update resume', 500)
  }
}

// DELETE - Delete a specific resume
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    const { id } = await params
    
    if (!userId) {
      return authErrorResponse()
    }

    const { success, resetIn } = rateLimit(req, { maxRequests: 10, windowSeconds: 60, identifier: 'resume-delete', userId })
    if (!success) return rateLimitResponse(resetIn)

    const user = await getCurrentUser()
    if (!user) {
      return notFoundResponse('User not found')
    }

    // Check if resume exists and belongs to user
    const existingResume = await getResumeById(id, user.id)
    if (!existingResume) {
      return notFoundResponse('Resume not found')
    }

    await deleteResume(id, user.id)

    return successResponse({
      message: 'Resume deleted successfully'
    })
  } catch (error) {
    console.error('[Resumes] Failed to delete resume:', error);
    return errorResponse('Failed to delete resume', 500)
  }
}