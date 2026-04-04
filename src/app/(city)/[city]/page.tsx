import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getCityBySlug, getAllCitySlugs, type CityData } from '@/lib/cities'
import { Header } from '@/components/landing/header'
import { Footer } from '@/components/landing/footer'
import { FileText, Sparkles, Download, CheckCircle2, Briefcase, MapPin, ArrowRight } from 'lucide-react'

export async function generateStaticParams() {
  return getAllCitySlugs().map((city) => ({ city }))
}

export async function generateMetadata({ params }: { params: Promise<{ city: string }> }): Promise<Metadata> {
  const { city: slug } = await params
  const city = getCityBySlug(slug)
  if (!city) return {}

  const title = `Best Resume Builder in ${city.name.en} | دروستکردنی سیڤی لە ${city.name.ckb}`
  const description = `Create a professional CV for jobs in ${city.name.en}, Kurdistan. AI-powered resume builder with Kurdish, Arabic & English support. ATS-optimized templates. Free to start.`

  return {
    title,
    description,
    keywords: [
      `resume builder ${city.name.en}`,
      `CV maker ${city.name.en}`,
      `jobs in ${city.name.en}`,
      `${city.name.en} career`,
      `سیڤی ${city.name.ckb}`,
      `دروستکردنی سیڤی ${city.name.ckb}`,
      `سيرة ذاتية ${city.name.ar}`,
      'Kurdish resume builder',
      'ATS resume Kurdistan',
    ],
    alternates: {
      canonical: `https://work.krd/${slug}`,
    },
    openGraph: {
      title,
      description,
      url: `https://work.krd/${slug}`,
      siteName: 'Work.krd',
      type: 'website',
      locale: 'en_US',
      alternateLocale: ['ar_AR', 'ku_IQ'],
    },
  }
}

function CityJsonLd({ city }: { city: CityData }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `Best Resume Builder in ${city.name.en}`,
    description: `Professional AI resume builder for job seekers in ${city.name.en}, Kurdistan Region.`,
    url: `https://work.krd/${city.slug}`,
    mainEntity: {
      '@type': 'SoftwareApplication',
      name: 'Work.krd Resume Builder',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
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

const steps = [
  {
    icon: FileText,
    title: { en: 'Choose a Template', ar: 'اختر قالباً', ckb: 'داڕێژەیەک هەڵبژێرە' },
    desc: { en: 'Pick from professional, ATS-optimized templates', ar: 'اختر من قوالب احترافية متوافقة مع ATS', ckb: 'لە داڕێژە پەسەندانەکان هەڵبژێرە' },
  },
  {
    icon: Sparkles,
    title: { en: 'Fill with AI Help', ar: 'املأ بمساعدة الذكاء الاصطناعي', ckb: 'بە یارمەتی AI پڕی بکەرەوە' },
    desc: { en: 'AI writes bullet points in Kurdish, Arabic, or English', ar: 'الذكاء الاصطناعي يكتب النقاط بالعربية والكردية والإنجليزية', ckb: 'AI خاڵەکان بە کوردی، عەرەبی یان ئینگلیزی دەنووسێت' },
  },
  {
    icon: Download,
    title: { en: 'Download PDF', ar: 'حمّل PDF', ckb: 'PDF دابەزێنە' },
    desc: { en: 'Get a pixel-perfect PDF ready to send', ar: 'احصل على PDF جاهز للإرسال', ckb: 'PDFێکی ئامادە بۆ ناردن وەربگرە' },
  },
]

export default async function CityPage({ params }: { params: Promise<{ city: string }> }) {
  const { city: slug } = await params
  const city = getCityBySlug(slug)
  if (!city) notFound()

  return (
    <>
      <CityJsonLd city={city} />
      <Header />
      <main className="min-h-screen bg-white">
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 25% 50%, rgba(99,102,241,0.3) 0%, transparent 50%), radial-gradient(circle at 75% 50%, rgba(168,85,247,0.2) 0%, transparent 50%)' }} />
          </div>
          <div className="relative max-w-5xl mx-auto px-4 py-20 sm:py-28">
            <div className="flex items-center gap-2 text-indigo-300 text-sm font-medium mb-4">
              <MapPin className="w-4 h-4" />
              <span>{city.region.en}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-4">
              Build Your Professional Resume in{' '}
              <span className="text-indigo-400">{city.name.en}</span>
            </h1>
            <p className="text-xl sm:text-2xl text-gray-300 font-medium mb-2" dir="rtl">
              دروستکردنی سیڤی پەسەندانە لە {city.name.ckb}
            </p>
            <p className="text-lg text-gray-400 mb-8 max-w-2xl">
              {city.description.en}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/resume-builder"
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
              >
                Build Your CV — Free
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/jobs"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3 rounded-lg transition-colors border border-white/20"
              >
                <Briefcase className="w-4 h-4" />
                Browse Jobs in Kurdistan
              </Link>
            </div>
          </div>
        </section>

        {/* Industries */}
        <section className="max-w-5xl mx-auto px-4 py-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Top Industries in {city.name.en}
          </h2>
          <p className="text-gray-500 mb-8">Tailor your resume to the industries hiring in your city</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {city.keyIndustries.en.map((industry, i) => (
              <div
                key={industry}
                className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3"
              >
                <CheckCircle2 className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{industry}</p>
                  <p className="text-xs text-gray-500" dir="rtl">{city.keyIndustries.ckb[i]}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section className="bg-gray-50 py-16">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 text-center">
              3 Steps to Your New CV
            </h2>
            <p className="text-gray-500 mb-10 text-center">Works in Kurdish, Arabic, and English</p>
            <div className="grid sm:grid-cols-3 gap-8">
              {steps.map((step, i) => (
                <div key={i} className="text-center">
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-100 rounded-xl mb-4">
                    <step.icon className="w-7 h-7 text-indigo-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{step.title.en}</h3>
                  <p className="text-sm text-gray-500 mb-1">{step.desc.en}</p>
                  <p className="text-sm text-gray-400" dir="rtl">{step.title.ckb}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="max-w-5xl mx-auto px-4 py-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8 text-center">
            Why {city.name.en} Job Seekers Choose Work.krd
          </h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {[
              { title: 'Kurdish & Arabic First', desc: `Full RTL support — write your CV in Sorani Kurdish or Arabic, and it renders perfectly. Built for ${city.name.en} job seekers.` },
              { title: 'ATS-Optimized Templates', desc: 'Our templates pass Applicant Tracking Systems used by international companies and NGOs operating in Kurdistan.' },
              { title: 'AI-Powered Writing', desc: 'Stuck on bullet points? AI helps you write professional descriptions in your language — no English required.' },
              { title: 'Free to Start', desc: `Create and download your first CV for free. Upgrade to Pro for unlimited resumes and premium templates.` },
            ].map((feature) => (
              <div key={feature.title} className="border border-gray-200 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Trilingual CTA */}
        <section className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-16">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">
              Ready to Build Your CV?
            </h2>
            <p className="text-lg text-indigo-100 mb-2" dir="rtl">
              سیڤیت ئامادەیە؟ ئێستا دەست پێ بکە — بەخۆڕایی
            </p>
            <p className="text-lg text-indigo-100 mb-8" dir="rtl">
              هل أنت مستعد لإنشاء سيرتك الذاتية؟ ابدأ الآن مجاناً
            </p>
            <Link
              href="/resume-builder"
              className="inline-flex items-center gap-2 bg-white text-indigo-700 font-bold px-8 py-4 rounded-xl hover:bg-indigo-50 transition-colors text-lg"
            >
              Start Building — It&apos;s Free
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>

        {/* Local SEO content block */}
        <section className="max-w-5xl mx-auto px-4 py-16">
          <div className="grid sm:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">
                About {city.name.en}
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed mb-3">
                {city.name.en} ({city.name.ckb} / {city.name.ar}) is located in {city.region.en} with a population of {city.population}. The city&apos;s economy is driven by {city.keyIndustries.en.join(', ').toLowerCase()}.
              </p>
              <p className="text-sm text-gray-600 leading-relaxed">
                Work.krd is the first resume builder designed specifically for Kurdistan. Whether you&apos;re applying for jobs in {city.name.en} or abroad, our AI-powered tools help you create a professional CV in minutes.
              </p>
            </div>
            <div dir="rtl">
              <h2 className="text-xl font-bold text-gray-900 mb-3">
                دەربارەی {city.name.ckb}
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed mb-3">
                {city.description.ckb}
              </p>
              <p className="text-sm text-gray-600 leading-relaxed">
                {city.description.ar}
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
