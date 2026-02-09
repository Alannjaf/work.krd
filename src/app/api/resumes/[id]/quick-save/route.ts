import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getCurrentUser } from '@/lib/db'
import { prisma } from '@/lib/prisma'
import { SectionType } from '@prisma/client'

// PUT - Quick save for partial updates
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
    const { changes, currentSection } = body

    // Verify resume ownership
    const resume = await prisma.resume.findFirst({
      where: { id, userId: user.id }
    })

    if (!resume) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 })
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
            ...(changes.personal && { personalInfo: changes.personal }),
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
              data: { content: changes.sectionData }
            })
          } else if (changes.sectionData.length > 0) {
            // Create new section only if there's data
            const order = await tx.resumeSection.count({
              where: { resumeId: id }
            })

            await tx.resumeSection.create({
              data: {
                resumeId: id,
                type: sectionType,
                title: currentSection.charAt(0).toUpperCase() + currentSection.slice(1),
                content: changes.sectionData,
                order: order + 1
              }
            })
          }
        }
      }
    })

    return NextResponse.json({ 
      message: 'Progress saved',
      resumeId: id
    })
  } catch (error) {
    console.error('[QuickSave] Failed to save progress:', error);
    return NextResponse.json({
      error: 'Failed to save progress'
    }, { status: 500 })
  }
}