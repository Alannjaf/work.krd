import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getServiceBySlug, getAllServiceSlugs, bestServiceCities, type ServiceData } from '@/lib/best-services'
import { getCityBySlug, type CityData } from '@/lib/cities'
import { getCategoryBySlug } from '@/lib/categories'
import { generateHreflangAlternates } from '@/lib/seo'
import { Header } from '@/components/landing/header'
import { Footer } from '@/components/landing/footer'
import { MapPin, ArrowRight, CheckCircle2, Lightbulb, ExternalLink, Star } from 'lucide-react'

type Params = { service: string; city: string }

export async function generateStaticParams() {
  const params: Params[] = []
  for (const service of getAllServiceSlugs()) {
    for (const city of bestServiceCities) {
      params.push({ service, city })
    }
  }
  return params
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { service: serviceSlug, city: citySlug } = await params
  const service = getServiceBySlug(serviceSlug)
  const city = getCityBySlug(citySlug)
  if (!service || !city) return {}

  const title = `Best ${service.name.en} in ${city.name.en} (2026) | باشترین ${service.name.ckb} لە ${city.name.ckb}`
  const description = `Find the best ${service.name.en.toLowerCase()} in ${city.name.en}, Kurdistan Region. Compare top professionals, read tips, and hire with confidence. ${service.name.ckb} لە ${city.name.ckb}.`

  return {
    title,
    description,
    keywords: [
      `best ${service.name.en.toLowerCase()} ${city.name.en}`,
      `top ${service.name.en.toLowerCase()} ${city.name.en}`,
      `${service.name.en.toLowerCase()} in ${city.name.en}`,
      `${service.name.ckb} ${city.name.ckb}`,
      `${service.name.ar} ${city.name.ar}`,
      `Kurdistan ${service.name.en.toLowerCase()}`,
    ],
    alternates: generateHreflangAlternates(`/best/${serviceSlug}/${citySlug}`),
    openGraph: {
      title,
      description,
      url: `https://work.krd/best/${serviceSlug}/${citySlug}`,
      siteName: 'Work.krd',
      type: 'website',
      locale: 'en_US',
      alternateLocale: ['ar_AR', 'ku_IQ'],
    },
  }
}

function BestJsonLd({ service, city }: { service: ServiceData; city: CityData }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `Best ${service.name.en} in ${city.name.en}`,
    description: `Guide to finding the best ${service.name.en.toLowerCase()} in ${city.name.en}, Kurdistan Region.`,
    url: `https://work.krd/best/${service.slug}/${city.slug}`,
    about: {
      '@type': 'Service',
      name: service.name.en,
      areaServed: {
        '@type': 'City',
        name: city.name.en,
        containedInPlace: {
          '@type': 'AdministrativeArea',
          name: city.region.en,
        },
      },
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

export default async function BestServiceCityPage({ params }: { params: Promise<Params> }) {
  const { service: serviceSlug, city: citySlug } = await params
  const service = getServiceBySlug(serviceSlug)
  const city = getCityBySlug(citySlug)
  if (!service || !city) notFound()

  const otherCities = bestServiceCities.filter((c) => c !== citySlug)
  const relatedCategories = service.relatedCategories
    .map((slug) => getCategoryBySlug(slug))
    .filter(Boolean)

  return (
    <>
      <BestJsonLd service={service} city={city} />
      <Header />
      <main className="min-h-screen bg-white">
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 25% 50%, rgba(234,179,8,0.3) 0%, transparent 50%), radial-gradient(circle at 75% 50%, rgba(99,102,241,0.2) 0%, transparent 50%)' }} />
          </div>
          <div className="relative max-w-5xl mx-auto px-4 py-20 sm:py-28">
            <div className="flex items-center gap-2 text-yellow-300 text-sm font-medium mb-4">
              <Star className="w-4 h-4 fill-yellow-300" />
              <span>Best of {city.name.en} — 2026 Guide</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-4">
              Best {service.name.en} in{' '}
              <span className="text-indigo-400">{city.name.en}</span>
            </h1>
            <p className="text-xl sm:text-2xl text-gray-300 font-medium mb-2" dir="rtl">
              باشترین {service.name.ckb} لە {city.name.ckb}
            </p>
            <p className="text-lg text-gray-400 mb-8 max-w-2xl">
              {service.description.en}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/services"
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
              >
                Our Digital Services
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href={`/jobs-in-${citySlug}`}
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3 rounded-lg transition-colors border border-white/20"
              >
                <MapPin className="w-4 h-4" />
                Jobs in {city.name.en}
              </Link>
            </div>
          </div>
        </section>

        {/* Why It Matters */}
        <section className="max-w-5xl mx-auto px-4 py-16">
          <div className="grid sm:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                Why {service.name.en} Matter in {city.name.en}
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                {service.whyMatters.en}
              </p>
              <p className="text-sm text-gray-500">
                {city.name.en} ({city.population} population) is one of Kurdistan&apos;s major cities with key industries in {city.keyIndustries.en.slice(0, 3).join(', ').toLowerCase()}.
              </p>
            </div>
            <div dir="rtl" className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                بۆچی {service.name.ckb} گرنگن لە {city.name.ckb}؟
              </h3>
              <p className="text-gray-600 leading-relaxed text-sm">
                {service.whyMatters.ckb}
              </p>
            </div>
          </div>
        </section>

        {/* Tips for Choosing */}
        <section className="bg-gray-50 py-16">
          <div className="max-w-5xl mx-auto px-4">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="w-5 h-5 text-yellow-500" />
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                How to Choose the Best {service.name.en}
              </h2>
            </div>
            <p className="text-gray-500 mb-8">Tips for finding the right professional in {city.name.en}</p>

            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-4">
                {service.tips.en.map((tip, i) => (
                  <div key={i} className="flex items-start gap-3 bg-white border border-gray-200 rounded-lg p-4">
                    <CheckCircle2 className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-700">{tip}</p>
                  </div>
                ))}
              </div>
              <div className="space-y-4" dir="rtl">
                {service.tips.ckb.map((tip, i) => (
                  <div key={i} className="flex items-start gap-3 bg-white border border-gray-200 rounded-lg p-4">
                    <CheckCircle2 className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-700">{tip}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Work.krd CTA */}
        <section className="max-w-5xl mx-auto px-4 py-16">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 sm:p-12 text-white text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">
              {service.slug === 'resume-writers'
                ? 'Or Build Your CV with AI — Free'
                : `Need ${service.name.en}? We Can Help`}
            </h2>
            <p className="text-lg text-indigo-100 mb-2">
              {service.slug === 'resume-writers'
                ? 'Work.krd\'s AI resume builder creates professional CVs in Kurdish, Arabic & English in minutes.'
                : `Work.krd offers digital services for businesses in ${city.name.en}. From websites to content automation.`}
            </p>
            <p className="text-lg text-indigo-100 mb-8" dir="rtl">
              {service.slug === 'resume-writers'
                ? 'سیڤیت بە کوردی و عەرەبی و ئینگلیزی بە AI دروست بکە — بەخۆڕایی'
                : `خزمەتگوزاری دیجیتاڵ بۆ بزنسەکانی ${city.name.ckb} لە Work.krd`}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href={service.slug === 'resume-writers' ? '/resume-builder' : '/services'}
                className="inline-flex items-center gap-2 bg-white text-indigo-700 font-bold px-8 py-4 rounded-xl hover:bg-indigo-50 transition-colors text-lg"
              >
                {service.slug === 'resume-writers' ? 'Build Your CV — Free' : 'View Our Services'}
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>

        {/* Internal Links */}
        <section className="bg-gray-50 py-16">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Explore More
            </h2>
            <div className="grid sm:grid-cols-3 gap-6">
              {/* Same service in other cities */}
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  {service.name.en} in Other Cities
                </h3>
                <ul className="space-y-2">
                  {otherCities.map((slug) => {
                    const otherCity = getCityBySlug(slug)
                    if (!otherCity) return null
                    return (
                      <li key={slug}>
                        <Link
                          href={`/best/${service.slug}/${slug}`}
                          className="text-indigo-600 hover:text-indigo-800 text-sm flex items-center gap-1"
                        >
                          Best {service.name.en} in {otherCity.name.en}
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </div>

              {/* Other services in this city */}
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  More in {city.name.en}
                </h3>
                <ul className="space-y-2">
                  {getAllServiceSlugs()
                    .filter((s) => s !== service.slug)
                    .slice(0, 4)
                    .map((slug) => {
                      const otherService = getServiceBySlug(slug)
                      if (!otherService) return null
                      return (
                        <li key={slug}>
                          <Link
                            href={`/best/${slug}/${citySlug}`}
                            className="text-indigo-600 hover:text-indigo-800 text-sm flex items-center gap-1"
                          >
                            Best {otherService.name.en} in {city.name.en}
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        </li>
                      )
                    })}
                </ul>
              </div>

              {/* Related job categories */}
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Related Jobs
                </h3>
                <ul className="space-y-2">
                  <li>
                    <Link
                      href={`/${citySlug}`}
                      className="text-indigo-600 hover:text-indigo-800 text-sm flex items-center gap-1"
                    >
                      Resume Builder for {city.name.en}
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </li>
                  <li>
                    <Link
                      href={`/jobs-in-${citySlug}`}
                      className="text-indigo-600 hover:text-indigo-800 text-sm flex items-center gap-1"
                    >
                      Jobs in {city.name.en}
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </li>
                  {relatedCategories.map((cat) => (
                    <li key={cat!.slug}>
                      <Link
                        href={`/jobs/category/${cat!.slug}`}
                        className="text-indigo-600 hover:text-indigo-800 text-sm flex items-center gap-1"
                      >
                        {cat!.name.en} Jobs
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Local SEO block */}
        <section className="max-w-5xl mx-auto px-4 py-16">
          <div className="grid sm:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">
                About {service.name.en} in {city.name.en}
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed mb-3">
                {city.name.en} ({city.name.ckb} / {city.name.ar}) is the heart of {city.region.en} with a population of {city.population}. As one of Kurdistan&apos;s major economic centers, the demand for quality {service.name.en.toLowerCase()} continues to grow alongside the city&apos;s thriving {city.keyIndustries.en[0].toLowerCase()} and {city.keyIndustries.en[1].toLowerCase()} sectors.
              </p>
              <p className="text-sm text-gray-600 leading-relaxed">
                Work.krd helps connect professionals and businesses across Kurdistan. Whether you&apos;re looking for {service.name.en.toLowerCase()} or building your career, we&apos;re here to help.
              </p>
            </div>
            <div dir="rtl">
              <h2 className="text-xl font-bold text-gray-900 mb-3">
                دەربارەی {service.name.ckb} لە {city.name.ckb}
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed mb-3">
                {service.description.ckb}
              </p>
              <p className="text-sm text-gray-600 leading-relaxed">
                {service.description.ar}
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
