import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import fs from 'fs/promises'
import path from 'path'

const CACHE_PATH = 'C:/Users/alan0/Desktop/Projects/tools/jobs_cache.json'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

function makeSlug(job: Record<string, unknown>): string {
  const title = (job.title_en || job.title || '') as string
  const company = (job.company || '') as string
  const base = slugify(`${title}-${company}`)
  // Add a short hash from the full title to avoid collisions
  const hash = Buffer.from(String(job.title || '') + String(job.company || '')).toString('base64url').slice(0, 6)
  return `${base}-${hash}`
}

export async function POST(req: NextRequest) {
  try {
    // Verify import key
    const importKey = req.headers.get('x-import-key')
    const expectedKey = process.env.JOB_IMPORT_KEY
    if (!expectedKey || importKey !== expectedKey) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Optionally accept jobs in request body, otherwise read from cache file
    let jobs: Record<string, unknown>[]
    const contentType = req.headers.get('content-type') || ''
    if (contentType.includes('application/json')) {
      const body = await req.json()
      jobs = body.jobs || []
    } else {
      // Read from cache file
      try {
        const raw = await fs.readFile(path.resolve(CACHE_PATH), 'utf-8')
        jobs = JSON.parse(raw)
        if (!Array.isArray(jobs)) {
          return NextResponse.json({ error: 'Cache file is not an array' }, { status: 400 })
        }
      } catch {
        return NextResponse.json({ error: 'Could not read jobs_cache.json' }, { status: 500 })
      }
    }

    let imported = 0
    let skipped = 0

    for (const job of jobs) {
      const slug = makeSlug(job)

      // Check if already exists
      const existing = await prisma.job.findUnique({ where: { slug } })
      if (existing) {
        skipped++
        continue
      }

      await prisma.job.create({
        data: {
          title: String(job.title || ''),
          titleEn: job.title_en ? String(job.title_en) : null,
          titleKu: job.title_ku ? String(job.title_ku) : null,
          titleAr: job.title_ar ? String(job.title_ar) : null,
          company: String(job.company || 'Unknown'),
          location: String(job.location || 'Erbil'),
          category: job.category ? String(job.category) : null,
          jobType: String(job.job_type || 'Full Time'),
          salary: job.salary ? String(job.salary) : null,
          description: job.description ? String(job.description) : null,
          contact: job.contact ? String(job.contact) : null,
          source: String(job.source || 'fjik.krd'),
          sourceUrl: job.source_url ? String(job.source_url) : null,
          postedAt: job.posted_at ? new Date(String(job.posted_at)) : new Date(),
          slug,
          isActive: true,
        },
      })
      imported++
    }

    return NextResponse.json({
      imported,
      skipped,
      total: jobs.length,
    })
  } catch (error) {
    console.error('Job import error:', error)
    return NextResponse.json(
      { error: 'Failed to import jobs' },
      { status: 500 }
    )
  }
}
