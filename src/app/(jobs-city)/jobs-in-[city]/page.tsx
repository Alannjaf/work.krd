import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getCityBySlug, getAllCitySlugs, type CityData } from '@/lib/cities'
import { prisma } from '@/lib/prisma'
import { Header } from '@/components/landing/header'
import { Footer } from '@/components/landing/footer'
import { MapPin, Briefcase, Clock, Building2, ArrowRight, FileText } from 'lucide-react'

export async function generateStaticParams() {
  return getAllCitySlugs().map((city) => ({ city }))
}

export async function generateMetadata({ params }: { params: Promise<{ city: string }> }): Promise<Metadata> {
  const { city: slug } = await params
  const city = getCityBySlug(slug)
  if (!city) return {}

  const title = `Jobs in ${city.name.en} | کاری لە ${city.name.ckb} | وظائف في ${city.name.ar}`
  const description = `Find the latest jobs in ${city.name.en}, Kurdistan. Browse ${city.keyIndustries.en.slice(0, 3).join(', ')} and more. Updated daily from fjik.krd & jobs.krd.`

  return {
    title,
    description,
    keywords: [
      `jobs in ${city.name.en}`,
      `${city.name.en} jobs`,
      `careers ${city.name.en}`,
      `hiring ${city.name.en}`,
      `کاری لە ${city.name.ckb}`,
      `ئیشی ${city.name.ckb}`,
      `وظائف ${city.name.ar}`,
      `وظائف في ${city.name.ar}`,
      'Kurdistan jobs',
      'Iraq jobs',
    ],
    alternates: {
      canonical: `https://work.krd/jobs-in-${slug}`,
    },
    openGraph: {
      title,
      description,
      url: `https://work.krd/jobs-in-${slug}`,
      siteName: 'Work.krd',
      type: 'website',
      locale: 'en_US',
      alternateLocale: ['ar_AR', 'ku_IQ'],
    },
  }
}

function JobListingJsonLd({ city, jobCount }: { city: CityData; jobCount: number }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `Jobs in ${city.name.en}`,
    description: `${jobCount} job listings in ${city.name.en}, Kurdistan Region. Updated daily.`,
    url: `https://work.krd/jobs-in-${city.slug}`,
    mainEntity: {
      '@type': 'ItemList',
      name: `Job listings in ${city.name.en}`,
      numberOfItems: jobCount,
      itemListElement: [],
    },
    areaServed: {
      '@type': 'City',
      name: city.name.en,
      containedInPlace: {
        '@type': 'AdministrativeArea',
        name: city.region.en,
      },
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

export default async function CityJobsPage({ params }: { params: Promise<{ city: string }> }) {
  const { city: slug } = await params
  const city = getCityBySlug(slug)
  if (!city) notFound()

  const jobs = await prisma.job.findMany({
    where: {
      isActive: true,
      location: { contains: city.name.en, mode: 'insensitive' },
    },
    orderBy: { postedAt: 'desc' },
    take: 50,
  })

  const totalJobs = await prisma.job.count({
    where: {
      isActive: true,
      location: { contains: city.name.en, mode: 'insensitive' },
    },
  })

  return (
    <>
      <JobListingJsonLd city={city} jobCount={totalJobs} />
      <Header />
      <main className="min-h-screen bg-gray-50">
        {/* Hero */}
        <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white">
          <div className="max-w-5xl mx-auto px-4 py-16 sm:py-20">
            <div className="flex items-center gap-2 text-blue-300 text-sm font-medium mb-3">
              <MapPin className="w-4 h-4" />
              <span>{city.region.en}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-3">
              Jobs in <span className="text-blue-300">{city.name.en}</span>
            </h1>
            <p className="text-xl text-blue-200 mb-1" dir="rtl">
              کاری لە {city.name.ckb}
            </p>
            <p className="text-lg text-blue-300/80 mb-6" dir="rtl">
              وظائف في {city.name.ar}
            </p>
            <p className="text-blue-100 max-w-2xl mb-8">
              {totalJobs > 0
                ? `Browse ${totalJobs} active job listing${totalJobs !== 1 ? 's' : ''} in ${city.name.en}. Updated daily from fjik.krd & jobs.krd.`
                : `No active listings right now in ${city.name.en}. Check back soon — new jobs are added daily.`}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href={`/jobs?location=${encodeURIComponent(city.name.en)}`}
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-medium px-5 py-2.5 rounded-lg transition-colors border border-white/20 text-sm"
              >
                <Briefcase className="w-4 h-4" />
                All {city.name.en} Jobs with Filters
              </Link>
              <Link
                href={`/${slug}`}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-medium px-5 py-2.5 rounded-lg transition-colors text-sm"
              >
                <FileText className="w-4 h-4" />
                Build Your CV for {city.name.en}
              </Link>
            </div>
          </div>
        </section>

        {/* Top Industries */}
        <section className="max-w-5xl mx-auto px-4 py-10">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Top Hiring Industries in {city.name.en}
          </h2>
          <div className="flex flex-wrap gap-2">
            {city.keyIndustries.en.map((industry, i) => (
              <span
                key={industry}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-full text-sm text-gray-700"
              >
                {industry}
                <span className="text-xs text-gray-400" dir="rtl">
                  {city.keyIndustries.ckb[i]}
                </span>
              </span>
            ))}
          </div>
        </section>

        {/* Job Listings */}
        <section className="max-w-5xl mx-auto px-4 pb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {totalJobs > 0 ? `${totalJobs} Jobs in ${city.name.en}` : `Jobs in ${city.name.en}`}
            </h2>
            {totalJobs > 50 && (
              <Link
                href={`/jobs?location=${encodeURIComponent(city.name.en)}`}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1"
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
                      <h3 className="text-base font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
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
                No jobs listed in {city.name.en} right now
              </h3>
              <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
                New jobs are added daily from fjik.krd and jobs.krd. In the meantime, prepare your CV so you&apos;re ready when opportunities appear.
              </p>
              <Link
                href={`/${slug}`}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-lg transition-colors text-sm"
              >
                <FileText className="w-4 h-4" />
                Build Your CV Now
              </Link>
            </div>
          )}

          {/* View all link */}
          {totalJobs > 0 && (
            <div className="mt-8 text-center">
              <Link
                href={`/jobs?location=${encodeURIComponent(city.name.en)}`}
                className="inline-flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium px-6 py-3 rounded-lg transition-colors text-sm"
              >
                Browse All {city.name.en} Jobs with Filters
                <ArrowRight className="w-4 h-4" />
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
                  Finding Jobs in {city.name.en}
                </h2>
                <p className="text-sm text-gray-600 leading-relaxed mb-3">
                  {city.description.en}
                </p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Work.krd aggregates job listings from fjik.krd and jobs.krd, making it easy to discover opportunities in {city.name.en}.
                  Pair your job search with a professional, ATS-optimized resume built on our platform — it&apos;s free to start.
                </p>
              </div>
              <div dir="rtl">
                <h2 className="text-xl font-bold text-gray-900 mb-3">
                  دۆزینەوەی کار لە {city.name.ckb}
                </h2>
                <p className="text-sm text-gray-600 leading-relaxed mb-3">
                  {city.description.ckb}
                </p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {city.description.ar}
                </p>
              </div>
            </div>

            {/* Cross-links to other cities */}
            <div className="mt-12 pt-8 border-t border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                Jobs in Other Cities
              </h3>
              <div className="flex flex-wrap gap-2">
                {getAllCitySlugs()
                  .filter((s) => s !== slug)
                  .map((citySlug) => {
                    const otherCity = getCityBySlug(citySlug)
                    if (!otherCity) return null
                    return (
                      <Link
                        key={citySlug}
                        href={`/jobs-in-${citySlug}`}
                        className="text-sm text-blue-600 hover:text-blue-800 hover:underline px-3 py-1.5 bg-blue-50 rounded-full"
                      >
                        Jobs in {otherCity.name.en}
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
