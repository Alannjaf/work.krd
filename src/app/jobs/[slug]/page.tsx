import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { generateHreflangAlternates } from '@/lib/seo'
import { JobDetailClient } from './job-detail-client'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const job = await prisma.job.findUnique({ where: { slug } })
  if (!job) return { title: 'Job Not Found' }

  const title = job.titleEn || job.title
  const description = job.description
    ? job.description.slice(0, 160)
    : `${title} at ${job.company} in ${job.location}`

  return {
    title: `${title} — ${job.company} | work.krd`,
    description,
    openGraph: {
      title: `${title} — ${job.company}`,
      description,
      url: `https://work.krd/jobs/${slug}`,
      type: 'website',
      siteName: 'Work.krd',
    },
    twitter: {
      card: 'summary',
      title: `${title} — ${job.company}`,
      description,
    },
    alternates: generateHreflangAlternates(`/jobs/${slug}`),
  }
}

export default async function JobDetailPage({ params }: Props) {
  const { slug } = await params
  const job = await prisma.job.findUnique({ where: { slug } })
  if (!job || !job.isActive) notFound()

  // Get related jobs (same category or location, exclude current)
  const relatedJobs = await prisma.job.findMany({
    where: {
      isActive: true,
      id: { not: job.id },
      OR: [
        ...(job.category ? [{ category: job.category }] : []),
        { location: job.location },
      ],
    },
    orderBy: { postedAt: 'desc' },
    take: 4,
  })

  const serializedJob = {
    ...job,
    postedAt: job.postedAt?.toISOString() ?? null,
    createdAt: job.createdAt.toISOString(),
    updatedAt: job.updatedAt.toISOString(),
  }

  const serializedRelated = relatedJobs.map((j) => ({
    ...j,
    postedAt: j.postedAt?.toISOString() ?? null,
    createdAt: j.createdAt.toISOString(),
    updatedAt: j.updatedAt.toISOString(),
  }))

  // Schema.org JobPosting structured data
  const jobPostingJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: job.titleEn || job.title,
    description: job.description || '',
    datePosted: job.postedAt?.toISOString() || job.createdAt.toISOString(),
    hiringOrganization: {
      '@type': 'Organization',
      name: job.company,
    },
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: job.location,
        addressCountry: 'IQ',
      },
    },
    employmentType: job.jobType === 'Full Time' ? 'FULL_TIME' : job.jobType === 'Part Time' ? 'PART_TIME' : job.jobType === 'Contract' ? 'CONTRACTOR' : job.jobType === 'Internship' ? 'INTERN' : 'OTHER',
    ...(job.salary ? { baseSalary: { '@type': 'MonetaryAmount', currency: 'IQD', value: job.salary } } : {}),
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://work.krd' },
      { '@type': 'ListItem', position: 2, name: 'Jobs', item: 'https://work.krd/jobs' },
      { '@type': 'ListItem', position: 3, name: job.titleEn || job.title, item: `https://work.krd/jobs/${slug}` },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jobPostingJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <JobDetailClient job={serializedJob} relatedJobs={serializedRelated} />
    </>
  )
}
