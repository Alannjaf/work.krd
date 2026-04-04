'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import { Header } from '@/components/landing/header'
import { Footer } from '@/components/landing/footer'
import Link from 'next/link'
import {
  MapPin,
  Briefcase,
  Clock,
  Building2,
  ChevronRight,
  MessageCircle,
  Mail,
  ExternalLink,
  Share2,
  ArrowLeft,
} from 'lucide-react'

interface SerializedJob {
  id: string
  title: string
  titleEn: string | null
  titleKu: string | null
  titleAr: string | null
  company: string
  location: string
  category: string | null
  jobType: string
  salary: string | null
  description: string | null
  contact: string | null
  source: string
  sourceUrl: string | null
  postedAt: string | null
  isActive: boolean
  slug: string
  createdAt: string
  updatedAt: string
}

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return ''
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return '1 day ago'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  return `${Math.floor(diffDays / 30)} months ago`
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function parseContact(contact: string | null): { type: 'whatsapp' | 'email' | 'phone' | 'other'; value: string } | null {
  if (!contact) return null
  const trimmed = contact.trim()

  // WhatsApp pattern: contains a phone number-like string
  const phoneMatch = trimmed.match(/(\+?\d[\d\s-]{7,})/)
  if (phoneMatch) {
    const cleaned = phoneMatch[1].replace(/[\s-]/g, '')
    return { type: 'whatsapp', value: cleaned }
  }

  // Email pattern
  const emailMatch = trimmed.match(/[\w.+-]+@[\w-]+\.[\w.-]+/)
  if (emailMatch) {
    return { type: 'email', value: emailMatch[0] }
  }

  return { type: 'other', value: trimmed }
}

export function JobDetailClient({
  job,
  relatedJobs,
}: {
  job: SerializedJob
  relatedJobs: SerializedJob[]
}) {
  const { language, isRTL } = useLanguage()

  const getJobTitle = (j: SerializedJob) => {
    if (language === 'ckb' && j.titleKu) return j.titleKu
    if (language === 'ar' && j.titleAr) return j.titleAr
    if (language === 'en' && j.titleEn) return j.titleEn
    return j.titleEn || j.title
  }

  const jobTitle = getJobTitle(job)
  const contactInfo = parseContact(job.contact)
  const isFjik = job.source === 'fjik.krd'
  const shareUrl = `https://work.krd/jobs/${job.slug}`

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: jobTitle, text: `${jobTitle} at ${job.company}`, url: shareUrl })
      } catch {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(shareUrl)
      alert(language === 'ckb' ? 'لینک کۆپی کرا' : language === 'ar' ? 'تم نسخ الرابط' : 'Link copied!')
    }
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        {/* Breadcrumb */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <nav className={`flex items-center gap-2 text-sm text-gray-500 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Link href="/" className="hover:text-gray-700 transition-colors">
                {language === 'ckb' ? 'سەرەکی' : language === 'ar' ? 'الرئيسية' : 'Home'}
              </Link>
              <ChevronRight className={`w-3.5 h-3.5 ${isRTL ? 'rotate-180' : ''}`} />
              <Link href="/jobs" className="hover:text-gray-700 transition-colors">
                {language === 'ckb' ? 'ئیشەکان' : language === 'ar' ? 'الوظائف' : 'Jobs'}
              </Link>
              <ChevronRight className={`w-3.5 h-3.5 ${isRTL ? 'rotate-180' : ''}`} />
              <span className="text-gray-900 font-medium truncate max-w-[200px]">{jobTitle}</span>
            </nav>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back link */}
          <Link
            href="/jobs"
            className={`inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors ${isRTL ? 'flex-row-reverse' : ''}`}
          >
            <ArrowLeft className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
            {language === 'ckb' ? 'گەڕانەوە بۆ ئیشەکان' : language === 'ar' ? 'العودة للوظائف' : 'Back to jobs'}
          </Link>

          {/* Main card */}
          <article className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="p-6 sm:p-8 border-b border-gray-100">
              <div className={`flex items-start gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-7 h-7 text-gray-400" />
                </div>
                <div className={`flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
                    {jobTitle}
                  </h1>
                  <p className="text-lg text-gray-600 mt-1">{job.company}</p>

                  <div className={`flex flex-wrap items-center gap-3 mt-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <span className="inline-flex items-center gap-1.5 text-sm text-gray-600">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      {job.location}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-sm text-gray-600">
                      <Briefcase className="w-4 h-4 text-gray-400" />
                      {job.jobType}
                    </span>
                    {job.salary && job.salary !== 'Not specified' && job.salary !== '0 - 0 IQD' && (
                      <span className="text-sm font-medium text-emerald-600">
                        {job.salary}
                      </span>
                    )}
                    {job.postedAt && (
                      <span className="inline-flex items-center gap-1.5 text-sm text-gray-400">
                        <Clock className="w-4 h-4" />
                        {timeAgo(job.postedAt)}
                      </span>
                    )}
                  </div>

                  {job.category && (
                    <span className="inline-block mt-3 text-xs font-medium px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full">
                      {job.category}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="px-6 sm:px-8 py-4 bg-gray-50 border-b border-gray-100">
              <div className={`flex flex-wrap items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                {isFjik && contactInfo?.type === 'whatsapp' && (
                  <a
                    href={`https://wa.me/${contactInfo.value}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#25D366] hover:bg-[#1fb855] rounded-xl transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    {language === 'ckb' ? 'پەیوەندی لە واتساپ' : language === 'ar' ? 'تقدم عبر واتساب' : 'Apply via WhatsApp'}
                  </a>
                )}
                {isFjik && contactInfo?.type === 'email' && (
                  <a
                    href={`mailto:${contactInfo.value}?subject=Application: ${job.titleEn || job.title}`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                    {language === 'ckb' ? 'پەیوەندی بە ئیمەیڵ' : language === 'ar' ? 'تقدم عبر البريد' : 'Apply via Email'}
                  </a>
                )}
                {!isFjik && (
                  <a
                    href={job.sourceUrl || 'https://jobs.krd/explore-jobs'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    {language === 'ckb' ? 'پەیوەندی لە jobs.krd' : language === 'ar' ? 'تقدم على jobs.krd' : 'Apply on jobs.krd'}
                  </a>
                )}
                {/* If fjik but no parsed contact, show raw contact */}
                {isFjik && contactInfo?.type === 'other' && (
                  <span className="text-sm text-gray-700 font-medium">
                    {language === 'ckb' ? 'پەیوەندی: ' : language === 'ar' ? 'التواصل: ' : 'Contact: '}
                    {contactInfo.value}
                  </span>
                )}
                {/* If fjik and no contact at all, but has sourceUrl */}
                {isFjik && !contactInfo && job.sourceUrl && (
                  <a
                    href={job.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    {language === 'ckb' ? 'بینینی ئیش' : language === 'ar' ? 'عرض الوظيفة' : 'View Job'}
                  </a>
                )}

                <button
                  type="button"
                  onClick={handleShare}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-xl transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  {language === 'ckb' ? 'هاوبەشکردن' : language === 'ar' ? 'مشاركة' : 'Share'}
                </button>
              </div>
            </div>

            {/* Description */}
            {job.description && (
              <div className={`p-6 sm:p-8 ${isRTL ? 'text-right' : 'text-left'}`}>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  {language === 'ckb' ? 'وردەکاری ئیش' : language === 'ar' ? 'تفاصيل الوظيفة' : 'Job Description'}
                </h2>
                <div
                  className="prose prose-gray max-w-none text-gray-700 leading-relaxed whitespace-pre-line"
                  dir={isRTL ? 'rtl' : 'ltr'}
                >
                  {job.description}
                </div>
              </div>
            )}

            {/* Job details summary */}
            <div className="px-6 sm:px-8 pb-8">
              <div className="bg-gray-50 rounded-xl p-5">
                <h3 className={`text-sm font-semibold text-gray-900 mb-3 ${isRTL ? 'text-right' : 'text-left'}`}>
                  {language === 'ckb' ? 'کورتە' : language === 'ar' ? 'ملخص' : 'Summary'}
                </h3>
                <dl className={`grid grid-cols-2 gap-3 text-sm ${isRTL ? 'text-right' : 'text-left'}`}>
                  <div>
                    <dt className="text-gray-500">
                      {language === 'ckb' ? 'شوێن' : language === 'ar' ? 'الموقع' : 'Location'}
                    </dt>
                    <dd className="font-medium text-gray-900">{job.location}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">
                      {language === 'ckb' ? 'جۆری ئیش' : language === 'ar' ? 'نوع الوظيفة' : 'Job Type'}
                    </dt>
                    <dd className="font-medium text-gray-900">{job.jobType}</dd>
                  </div>
                  {job.salary && job.salary !== 'Not specified' && job.salary !== '0 - 0 IQD' && (
                    <div>
                      <dt className="text-gray-500">
                        {language === 'ckb' ? 'مووچە' : language === 'ar' ? 'الراتب' : 'Salary'}
                      </dt>
                      <dd className="font-medium text-emerald-600">{job.salary}</dd>
                    </div>
                  )}
                  {job.category && (
                    <div>
                      <dt className="text-gray-500">
                        {language === 'ckb' ? 'بەش' : language === 'ar' ? 'القسم' : 'Category'}
                      </dt>
                      <dd className="font-medium text-gray-900">{job.category}</dd>
                    </div>
                  )}
                  {job.postedAt && (
                    <div>
                      <dt className="text-gray-500">
                        {language === 'ckb' ? 'بڵاوکراوەتەوە' : language === 'ar' ? 'تاريخ النشر' : 'Posted'}
                      </dt>
                      <dd className="font-medium text-gray-900">{formatDate(job.postedAt)}</dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>
          </article>

          {/* Related jobs */}
          {relatedJobs.length > 0 && (
            <section className="mt-10">
              <h2 className={`text-xl font-bold text-gray-900 mb-4 ${isRTL ? 'text-right' : 'text-left'}`}>
                {language === 'ckb' ? 'ئیشە پەیوەندیدارەکان' : language === 'ar' ? 'وظائف مشابهة' : 'Related Jobs'}
              </h2>
              <div className="space-y-3">
                {relatedJobs.map((rj) => (
                  <Link
                    key={rj.id}
                    href={`/jobs/${rj.slug}`}
                    className="block bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md hover:border-gray-300 transition-all group"
                  >
                    <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-5 h-5 text-gray-400" />
                      </div>
                      <div className={`flex-1 min-w-0 ${isRTL ? 'text-right' : 'text-left'}`}>
                        <h3 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                          {getJobTitle(rj)}
                        </h3>
                        <div className={`flex items-center gap-2 mt-0.5 text-xs text-gray-500 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <span>{rj.company}</span>
                          <span className="text-gray-300">|</span>
                          <span>{rj.location}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Browse more links */}
          <section className="mt-10 pt-8 border-t border-gray-200">
            <div className="flex flex-wrap gap-3">
              <Link
                href={`/jobs?location=${encodeURIComponent(job.location)}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 text-sm rounded-full hover:bg-blue-100 transition-colors"
              >
                <MapPin className="w-3.5 h-3.5" />
                {language === 'ckb'
                  ? `هەموو ئیشەکانی ${job.location}`
                  : language === 'ar'
                    ? `جميع وظائف ${job.location}`
                    : `All jobs in ${job.location}`}
              </Link>
              {job.category && (
                <Link
                  href={`/jobs?category=${encodeURIComponent(job.category)}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 text-sm rounded-full hover:bg-indigo-100 transition-colors"
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  {language === 'ckb'
                    ? `هەموو ئیشەکانی ${job.category}`
                    : language === 'ar'
                      ? `جميع وظائف ${job.category}`
                      : `All ${job.category} jobs`}
                </Link>
              )}
              <Link
                href="/jobs"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-gray-200 transition-colors"
              >
                {language === 'ckb' ? 'هەموو ئیشەکان' : language === 'ar' ? 'جميع الوظائف' : 'Browse all jobs'}
              </Link>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}
