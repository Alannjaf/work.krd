import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { cities } from '@/lib/cities'
import { categories as seoCategories } from '@/lib/categories'
import { JobsPageClient } from './jobs-page-client'

export const dynamic = 'force-dynamic'

const LOCATIONS = ['Erbil', 'Sulaymaniyah', 'Kirkuk', 'Duhok']

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const location = typeof params.location === 'string' ? params.location : undefined
  const category = typeof params.category === 'string' ? params.category : undefined
  const jobType = typeof params.jobType === 'string' ? params.jobType : undefined
  const search = typeof params.search === 'string' ? params.search : undefined
  const page = Math.max(1, parseInt(typeof params.page === 'string' ? params.page : '1', 10))
  const limit = 20

  const where: Record<string, unknown> = { isActive: true }
  if (location) where.location = { contains: location, mode: 'insensitive' }
  if (category) where.category = { contains: category, mode: 'insensitive' }
  if (jobType) where.jobType = { contains: jobType, mode: 'insensitive' }
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { titleEn: { contains: search, mode: 'insensitive' } },
      { titleKu: { contains: search, mode: 'insensitive' } },
      { company: { contains: search, mode: 'insensitive' } },
    ]
  }

  const [jobs, total, categories] = await Promise.all([
    prisma.job.findMany({
      where: where as never,
      orderBy: { postedAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.job.count({ where: where as never }),
    prisma.job.findMany({
      where: { isActive: true, category: { not: null } },
      select: { category: true },
      distinct: ['category'],
      orderBy: { category: 'asc' },
    }),
  ])

  const categoryList = categories
    .map((c) => c.category)
    .filter((c): c is string => c !== null)

  const serializedJobs = jobs.map((job) => ({
    ...job,
    postedAt: job.postedAt?.toISOString() ?? null,
    createdAt: job.createdAt.toISOString(),
    updatedAt: job.updatedAt.toISOString(),
  }))

  return (
    <>
      <JobsPageClient
        jobs={serializedJobs}
        total={total}
        page={page}
        totalPages={Math.ceil(total / limit)}
        locations={LOCATIONS}
        categories={categoryList}
        filters={{ location, category, jobType, search }}
      />
      {/* Server-rendered internal links for SEO crawlers */}
      <nav aria-label="Browse jobs" className="sr-only">
        <h2>Browse Jobs by City</h2>
        <ul>
          {cities.map((city) => (
            <li key={city.slug}>
              <Link href={`/jobs-in-${city.slug}`}>
                Jobs in {city.name.en}
              </Link>
            </li>
          ))}
        </ul>
        <h2>Browse Jobs by Category</h2>
        <ul>
          {seoCategories.map((cat) => (
            <li key={cat.slug}>
              <Link href={`/jobs/category/${cat.slug}`}>
                {cat.name.en} Jobs
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  )
}
