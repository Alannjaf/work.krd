import { auth, clerkClient } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { createResume, checkUserLimits } from '@/lib/db'
import { SectionType } from '@prisma/client'
import { successResponse, errorResponse, authErrorResponse, notFoundResponse } from '@/lib/api-helpers'
import { PLAN_NAMES } from '@/lib/constants'
import type { InputJsonValue } from '@prisma/client/runtime/library'
import { devError } from '@/lib/admin-utils'

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return authErrorResponse()
    }

    const body = await req.json()
    const { fullName, template, formData } = body

    if (!fullName || typeof fullName !== 'string' || fullName.trim().length === 0) {
      return errorResponse('Full name is required', 400)
    }

    // Find or create user (webhook may not have fired yet on local dev)
    let user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { subscription: true }
    })

    if (!user) {
      // Create user + subscription if webhook hasn't fired yet
      // Fetch email from Clerk since webhook may not have delivered it
      let email = ''
      try {
        const client = await clerkClient()
        const clerkUser = await client.users.getUser(userId)
        email = clerkUser.emailAddresses?.[0]?.emailAddress || ''
      } catch { /* fallback to empty */ }

      user = await prisma.user.create({
        data: {
          clerkId: userId,
          name: fullName.trim(),
          email,
          subscription: {
            create: {
              plan: PLAN_NAMES.FREE,
              resumeCount: 0,
              aiUsageCount: 0,
              exportCount: 0,
              importCount: 0,
              atsUsageCount: 0,
            }
          }
        },
        include: { subscription: true }
      })
    }

    // Update user name
    await prisma.user.update({
      where: { id: user.id },
      data: { name: fullName.trim() }
    })

    // Check if user can create a resume
    const limits = await checkUserLimits(userId)
    if (!limits.canCreateResume) {
      return errorResponse('Resume limit reached', 403)
    }

    // Create resume — createResume takes the DB user.id, NOT clerkId
    const resume = await createResume(
      user.id,
      `${fullName.trim()}'s Resume`,
      template || 'modern'
    )

    // If formData is provided (from CV upload), update the resume with parsed data
    if (formData) {
      await prisma.$transaction(async (tx) => {
        // Update resume personalInfo and summary
        const personalInfo: InputJsonValue = formData.personal
          ? {
              fullName: formData.personal.fullName || fullName.trim(),
              email: formData.personal.email || '',
              phone: formData.personal.phone || '',
              location: formData.personal.location || '',
              linkedin: formData.personal.linkedin || '',
              website: formData.personal.website || '',
              title: formData.personal.title || '',
            }
          : { fullName: fullName.trim() }

        await tx.resume.update({
          where: { id: resume.id },
          data: {
            personalInfo,
            ...(formData.summary !== undefined && { summary: formData.summary })
          }
        })

        // Update existing sections (WORK_EXPERIENCE, EDUCATION, SKILLS were created by createResume)
        const sectionUpdates: { type: SectionType; content: InputJsonValue }[] = []

        if (formData.experience) {
          sectionUpdates.push({
            type: SectionType.WORK_EXPERIENCE,
            content: formData.experience as InputJsonValue
          })
        }
        if (formData.education) {
          sectionUpdates.push({
            type: SectionType.EDUCATION,
            content: formData.education as InputJsonValue
          })
        }
        if (formData.skills) {
          sectionUpdates.push({
            type: SectionType.SKILLS,
            content: formData.skills as InputJsonValue
          })
        }

        for (const section of sectionUpdates) {
          const existing = await tx.resumeSection.findFirst({
            where: { resumeId: resume.id, type: section.type }
          })
          if (existing) {
            await tx.resumeSection.update({
              where: { id: existing.id },
              data: { content: section.content }
            })
          }
        }

        // Create additional sections if data exists
        let nextOrder = 4 // createResume creates 3 sections (order 1-3)

        if (formData.languages && Array.isArray(formData.languages) && formData.languages.length > 0) {
          await tx.resumeSection.create({
            data: {
              resumeId: resume.id,
              type: SectionType.LANGUAGES,
              title: 'Languages',
              content: formData.languages as InputJsonValue,
              order: nextOrder++
            }
          })
        }

        if (formData.projects && Array.isArray(formData.projects) && formData.projects.length > 0) {
          await tx.resumeSection.create({
            data: {
              resumeId: resume.id,
              type: SectionType.PROJECTS,
              title: 'Projects',
              content: formData.projects as InputJsonValue,
              order: nextOrder++
            }
          })
        }

        if (formData.certifications && Array.isArray(formData.certifications) && formData.certifications.length > 0) {
          await tx.resumeSection.create({
            data: {
              resumeId: resume.id,
              type: SectionType.CERTIFICATIONS,
              title: 'Certifications',
              content: formData.certifications as InputJsonValue,
              order: nextOrder++
            }
          })
        }

        // Mark onboarding as completed
        await tx.user.update({
          where: { id: user.id },
          data: { onboardingCompleted: true }
        })
      })
    } else {
      // No formData — set name in personalInfo and mark onboarding complete
      await prisma.$transaction(async (tx) => {
        await tx.resume.update({
          where: { id: resume.id },
          data: {
            personalInfo: { fullName: fullName.trim() } as InputJsonValue
          }
        })
        await tx.user.update({
          where: { id: user.id },
          data: { onboardingCompleted: true }
        })
      })
    }

    return successResponse({ resumeId: resume.id })
  } catch (error) {
    devError('[OnboardingComplete] Failed to complete onboarding:', error)
    return errorResponse('Internal server error', 500)
  }
}
