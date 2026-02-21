import { NextRequest } from 'next/server'
import { z } from 'zod'
import { auth } from '@clerk/nextjs/server'
import { getCurrentUser } from '@/lib/db'
import { prisma } from '@/lib/prisma'
import { SectionType } from '@prisma/client'
import type { InputJsonValue } from '@prisma/client/runtime/library'
import { successResponse, errorResponse, authErrorResponse, notFoundResponse, validationErrorResponse } from '@/lib/api-helpers'
import { rateLimit, rateLimitResponse } from '@/lib/rate-limit'

const quickSaveSchema = z.object({
  changes: z.object({
    title: z.string().max(200).optional(),
    template: z.string().max(50).optional(),
    personal: z.record(z.string(), z.unknown()).optional(),
    summary: z.string().optional(),
    sectionData: z.unknown().optional(),
  }),
  currentSection: z.string().max(50).optional(),
})

// PUT - Quick save for partial updates
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

    const { success, resetIn } = rateLimit(req, { maxRequests: 60, windowSeconds: 60, identifier: 'resume-quicksave', userId })
    if (!success) return rateLimitResponse(resetIn)

    const user = await getCurrentUser()
    if (!user) {
      return notFoundResponse('User not found')
    }

    const body = await req.json()
    const parsed = quickSaveSchema.safeParse(body)
    if (!parsed.success) {
      return validationErrorResponse(parsed.error.issues[0]?.message || 'Invalid input')
    }
    const { changes, currentSection } = parsed.data

    // Verify resume ownership
    const resume = await prisma.resume.findFirst({
      where: { id, userId: user.id }
    })

    if (!resume) {
      return notFoundResponse('Resume not found')
    }

    // Start a transaction for better performance
    await prisma.$transaction(async (tx) => {
      // Update basic info if changed
      if (changes.title || changes.template || changes.personal || changes.summary !== undefined) {
        await tx.resume.update({
          where: { id },
          data: {
            ...(changes.title && { title: changes.title }),
            ...(changes.template && { template: changes.template }),
            ...(changes.personal && { personalInfo: changes.personal as InputJsonValue }),
            ...(changes.summary !== undefined && { summary: changes.summary })}
        })
      }

      // Update only the specific section that changed
      if (currentSection && changes.sectionData) {
        const sectionTypeMap: Record<string, SectionType> = {
          'experience': SectionType.WORK_EXPERIENCE,
          'education': SectionType.EDUCATION,
          'skills': SectionType.SKILLS,
          'languages': SectionType.LANGUAGES,
          'projects': SectionType.PROJECTS,
          'certifications': SectionType.CERTIFICATIONS}

        const sectionType = sectionTypeMap[currentSection]
        if (sectionType) {
          // Check if section exists
          const existingSection = await tx.resumeSection.findFirst({
            where: { resumeId: id, type: sectionType }
          })

          if (existingSection) {
            // Update existing section
            await tx.resumeSection.update({
              where: { id: existingSection.id },
              data: { content: changes.sectionData as InputJsonValue }
            })
          } else if (Array.isArray(changes.sectionData) && changes.sectionData.length > 0) {
            // Create new section only if there's data
            const order = await tx.resumeSection.count({
              where: { resumeId: id }
            })

            await tx.resumeSection.create({
              data: {
                resumeId: id,
                type: sectionType,
                title: currentSection.charAt(0).toUpperCase() + currentSection.slice(1),
                content: changes.sectionData as InputJsonValue,
                order: order + 1
              }
            })
          }
        }
      }
    })

    return successResponse({
      message: 'Progress saved',
      resumeId: id
    })
  } catch (error) {
    console.error('[QuickSave] Failed to save progress:', error);
    return errorResponse('Failed to save progress', 500)
  }
}