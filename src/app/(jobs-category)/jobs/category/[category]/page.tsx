import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getCategoryBySlug, getAllCategorySlugs, type CategoryData } from '@/lib/categories'
import { getCityBySlug } from '@/lib/cities'
import { prisma } from '@/lib/prisma'
import { Header } from '@/components/landing/header'
import { Footer } from '@/components/landing/footer'
import { MapPin, Briefcase, Clock, Building2, ArrowRight, FileText, Search } from 'lucide-react'

export async function generateStaticParams() {
  return getAllCategorySlugs().map((category) => ({ category }))
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category: slug } = await params
  const cat = getCategoryBySlug(slug)
  if (!cat) return {}

  const title = `${cat.name.en} Jobs in Kurdistan | ${cat.name.ckb} | ${cat.name.ar}`
  const description = `Find ${cat.name.en} jobs in Kurdistan Region, Iraq. Browse the latest openings in ${cat.topCities.slice(0, 3).map(c => getCityBySlug(c)?.name.en).filter(Boolean).join(', ')} and more. Updated daily.`

  return {
    title,
    description,
    keywords: [
      `${cat.name.en} jobs Kurdistan`,
      `${cat.name.en} jobs Iraq`,
      `${cat.name.en} careers`,
      `${cat.name.en} jobs Erbil`,
      `کاری ${cat.name.ckb}`,
      `وظائف ${cat.name.ar}`,
      `وظائف ${cat.name.ar} كوردستان`,
      'Kurdistan jobs',
      'Iraq jobs',
    ],
    alternates: {
      canonical: `https://work.krd/jobs/category/${slug}`,
    },
    openGraph: {
      title,
      description,
      url: `https://work.krd/jobs/category/${slug}`,
      siteName: 'Work.krd',
      type: 'website',
      locale: 'en_US',
      alternateLocale: ['ar_AR', 'ku_IQ'],
    },
  }
}

function CategoryJsonLd({ cat, jobCount }: { cat: CategoryData; jobCount: number }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `${cat.name.en} Jobs in Kurdistan`,
    description: `${jobCount} ${cat.name.en} job listings in Kurdistan Region. Updated daily.`,
    url: `https://work.krd/jobs/category/${cat.slug}`,
    mainEntity: {
      '@type': 'ItemList',
      name: `${cat.name.en} job listings in Kurdistan`,
      numberOfItems: jobCount,
      itemListElement: [],
    },
    about: {
      '@type': 'Thing',
      name: cat.name.en,
    },
    provider: {
      '@type': 'Organization',
      name: 'Work.krd',
      url: 'https://work.krd',
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

function timeAgo(date: Date | null): string {
  if (!date) return ''
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return '1 day ago'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  return `${Math.floor(diffDays / 30)} months ago`
}

export default async function CategoryJobsPage({ params }: { params: Promise<{ category: string }> }) {
  const { category: slug } = await params
  const cat = getCategoryBySlug(slug)
  if (!cat) notFound()

  // Build OR conditions from searchTerms
  const whereConditions = cat.searchTerms.map((term) => ({
    OR: [
      { category: { contains: term, mode: 'insensitive' as const } },
      { title: { contains: term, mode: 'insensitive' as const } },
    ],
  }))

  const jobs = await prisma.job.findMany({
    where: {
      isActive: true,
      OR: whereConditions.flatMap((c) => c.OR),
    },
    orderBy: { postedAt: 'desc' },
    take: 50,
  })

  const totalJobs = await prisma.job.count({
    where: {
      isActive: true,
      OR: whereConditions.flatMap((c) => c.OR),
    },
  })

  return (
    <>
      <CategoryJsonLd cat={cat} jobCount={totalJobs} />
      <Header />
      <main className="min-h-screen bg-gray-50">
        {/* Hero */}
        <section className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 text-white">
          <div className="max-w-5xl mx-auto px-4 py-16 sm:py-20">
            <div className="flex items-center gap-2 text-indigo-300 text-sm font-medium mb-3">
              <Briefcase className="w-4 h-4" />
              <span>Job Category</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-3">
              <span className="text-indigo-300">{cat.name.en}</span> Jobs in Kurdistan
            </h1>
            <p className="text-xl text-indigo-200 mb-1" dir="rtl">
              کاری {cat.name.ckb} لە کوردستان
            </p>
            <p className="text-lg text-indigo-300/80 mb-6" dir="rtl">
              وظائف {cat.name.ar} في كوردستان
            </p>
            <p className="text-indigo-100 max-w-2xl mb-8">
              {totalJobs > 0
                ? `Browse ${totalJobs} active ${cat.name.en.toLowerCase()} job${totalJobs !== 1 ? 's' : ''} across Kurdistan Region. Updated daily from fjik.krd & jobs.krd.`
                : `No active ${cat.name.en.toLowerCase()} listings right now. Check back soon — new jobs are added daily.`}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href={`/jobs?search=${encodeURIComponent(cat.searchTerms[0])}`}
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-medium px-5 py-2.5 rounded-lg transition-colors border border-white/20 text-sm"
              >
                <Search className="w-4 h-4" />
                Search All {cat.name.en} Jobs
              </Link>
              <Link
                href="/resume-builder"
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-5 py-2.5 rounded-lg transition-colors text-sm"
              >
                <FileText className="w-4 h-4" />
                Build Your CV
              </Link>
            </div>
          </div>
        </section>

        {/* Top Cities for this Category */}
        <section className="max-w-5xl mx-auto px-4 py-10">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Top Cities for {cat.name.en}
          </h2>
          <div className="flex flex-wrap gap-2">
            {cat.topCities.map((citySlug) => {
              const city = getCityBySlug(citySlug)
              if (!city) return null
              return (
                <Link
                  key={citySlug}
                  href={`/jobs-in-${citySlug}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-full text-sm text-gray-700 hover:border-indigo-300 hover:text-indigo-700 transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  {city.name.en}
                  <span className="text-xs text-gray-400" dir="rtl">
                    {city.name.ckb}
                  </span>
                </Link>
              )
            })}
          </div>
        </section>

        {/* Job Listings */}
        <section className="max-w-5xl mx-auto px-4 pb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {totalJobs > 0 ? `${totalJobs} ${cat.name.en} Jobs` : `${cat.name.en} Jobs`}
            </h2>
            {totalJobs > 50 && (
              <Link
                href={`/jobs?search=${encodeURIComponent(cat.searchTerms[0])}`}
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium inline-flex items-center gap-1"
              >
                View all <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>

          {jobs.length > 0 ? (
            <div className="space-y-3">
              {jobs.map((job) => (
                <Link
                  key={job.id}
                  href={`/jobs/${job.slug}`}
                  className="block bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-gray-300 transition-all group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors truncate">
                        {job.titleEn || job.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-0.5">{job.company}</p>
                      <div className="flex flex-wrap items-center gap-3 mt-2">
                        <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                          <MapPin className="w-3.5 h-3.5" />
                          {job.location}
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                          <Briefcase className="w-3.5 h-3.5" />
                          {job.jobType}
                        </span>
                        {job.salary && job.salary !== 'Not specified' && job.salary !== '0 - 0 IQD' && (
                          <span className="text-xs text-emerald-600 font-medium">{job.salary}</span>
                        )}
                        {job.postedAt && (
                          <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                            <Clock className="w-3.5 h-3.5" />
                            {timeAgo(job.postedAt)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
              <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No {cat.name.en.toLowerCase()} jobs listed right now
              </h3>
              <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
                New jobs are added daily from fjik.krd and jobs.krd. In the meantime, prepare your CV so you&apos;re ready when opportunities appear.
              </p>
              <Link
                href="/resume-builder"
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-5 py-2.5 rounded-lg transition-colors text-sm"
              >
                <FileText className="w-4 h-4" />
                Build Your CV Now
              </Link>
            </div>
          )}
        </section>

        {/* SEO Content Block */}
        <section className="bg-white border-t border-gray-200">
          <div className="max-w-5xl mx-auto px-4 py-16">
            <div className="grid sm:grid-cols-2 gap-10">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-3">
                  {cat.name.en} Careers in Kurdistan
                </h2>
                <p className="text-sm text-gray-600 leading-relaxed mb-3">
                  {cat.description.en}
                </p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Work.krd aggregates {cat.name.en.toLowerCase()} job listings from fjik.krd and jobs.krd, making it easy to discover opportunities.
                  Pair your job search with a professional, ATS-optimized resume built on our platform — it&apos;s free to start.
                </p>
              </div>
              <div dir="rtl">
                <h2 className="text-xl font-bold text-gray-900 mb-3">
                  کاری {cat.name.ckb} لە کوردستان
                </h2>
                <p className="text-sm text-gray-600 leading-relaxed mb-3">
                  {cat.description.ckb}
                </p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {cat.description.ar}
                </p>
              </div>
            </div>

            {/* Cross-links to other categories */}
            <div className="mt-12 pt-8 border-t border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                Browse Other Job Categories
              </h3>
              <div className="flex flex-wrap gap-2">
                {getAllCategorySlugs()
                  .filter((s) => s !== slug)
                  .map((catSlug) => {
                    const otherCat = getCategoryBySlug(catSlug)
                    if (!otherCat) return null
                    return (
                      <Link
                        key={catSlug}
                        href={`/jobs/category/${catSlug}`}
                        className="text-sm text-indigo-600 hover:text-indigo-800 hover:underline px-3 py-1.5 bg-indigo-50 rounded-full"
                      >
                        {otherCat.name.en}
                      </Link>
                    )
                  })}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
