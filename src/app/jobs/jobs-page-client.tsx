'use client'

import { useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useLanguage } from '@/contexts/LanguageContext'
import { Header } from '@/components/landing/header'
import { Footer } from '@/components/landing/footer'
import Link from 'next/link'
import {
  Search,
  MapPin,
  Briefcase,
  Clock,
  Building2,
  ChevronLeft,
  ChevronRight,
  Filter,
  X,
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

interface Filters {
  location?: string
  category?: string
  jobType?: string
  search?: string
}

interface JobsPageClientProps {
  jobs: SerializedJob[]
  total: number
  page: number
  totalPages: number
  locations: string[]
  categories: string[]
  filters: Filters
}

const JOB_TYPES = ['Full Time', 'Part Time', 'Contract', 'Remote', 'Internship']

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

export function JobsPageClient({
  jobs,
  total,
  page,
  totalPages,
  locations,
  categories,
  filters,
}: JobsPageClientProps) {
  const { language, isRTL } = useLanguage()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [searchInput, setSearchInput] = useState(filters.search || '')

  const buildUrl = useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString())
      Object.entries(updates).forEach(([key, value]) => {
        if (value) {
          params.set(key, value)
        } else {
          params.delete(key)
        }
      })
      // Reset page when filters change (unless explicitly setting page)
      if (!('page' in updates)) {
        params.delete('page')
      }
      const qs = params.toString()
      return `/jobs${qs ? `?${qs}` : ''}`
    },
    [searchParams]
  )

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    router.push(buildUrl({ search: searchInput || undefined }))
  }

  const handleFilter = (key: string, value: string | undefined) => {
    router.push(buildUrl({ [key]: value }))
  }

  const clearAllFilters = () => {
    router.push('/jobs')
    setSearchInput('')
  }

  const hasActiveFilters = filters.location || filters.category || filters.jobType || filters.search

  const getJobTitle = (job: SerializedJob) => {
    if (language === 'ckb' && job.titleKu) return job.titleKu
    if (language === 'ar' && job.titleAr) return job.titleAr
    if (language === 'en' && job.titleEn) return job.titleEn
    return job.titleEn || job.title
  }

  const FilterSidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={mobile ? '' : 'sticky top-24'}>
      {/* Location filter */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">
          {language === 'ckb' ? 'شوێن' : language === 'ar' ? 'الموقع' : 'Location'}
        </h3>
        <div className="space-y-1.5">
          {locations.map((loc) => (
            <button
              key={loc}
              type="button"
              onClick={() =>
                handleFilter('location', filters.location === loc ? undefined : loc)
              }
              className={`block w-full text-sm px-3 py-2 rounded-lg transition-colors ${
                isRTL ? 'text-right' : 'text-left'
              } ${
                filters.location === loc
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {loc}
            </button>
          ))}
        </div>
      </div>

      {/* Category filter */}
      {categories.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">
            {language === 'ckb' ? 'بەش' : language === 'ar' ? 'القسم' : 'Category'}
          </h3>
          <div className="space-y-1.5">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() =>
                  handleFilter('category', filters.category === cat ? undefined : cat)
                }
                className={`block w-full text-sm px-3 py-2 rounded-lg transition-colors ${
                  isRTL ? 'text-right' : 'text-left'
                } ${
                  filters.category === cat
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Job Type filter */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">
          {language === 'ckb' ? 'جۆری ئیش' : language === 'ar' ? 'نوع الوظيفة' : 'Job Type'}
        </h3>
        <div className="space-y-1.5">
          {JOB_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() =>
                handleFilter('jobType', filters.jobType === type ? undefined : type)
              }
              className={`block w-full text-sm px-3 py-2 rounded-lg transition-colors ${
                isRTL ? 'text-right' : 'text-left'
              } ${
                filters.jobType === type
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {hasActiveFilters && (
        <button
          type="button"
          onClick={clearAllFilters}
          className="w-full text-sm text-red-600 hover:text-red-700 font-medium py-2"
        >
          {language === 'ckb' ? 'پاککردنەوەی فلتەرەکان' : language === 'ar' ? 'مسح الفلاتر' : 'Clear all filters'}
        </button>
      )}
    </div>
  )

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        {/* Hero */}
        <section className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
            <div className={isRTL ? 'text-right' : 'text-left'}>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
                {language === 'ckb'
                  ? 'ئیشەکان لە کوردستان'
                  : language === 'ar'
                    ? 'وظائف في كوردستان'
                    : 'Jobs in Kurdistan'}
              </h1>
              <p className="mt-3 text-lg text-gray-600 max-w-2xl">
                {language === 'ckb'
                  ? 'دوایین ئیشەکان لە هەولێر، سلێمانی، کەرکوک، و دهۆک. کۆکراوەتەوە لە fjik.krd و jobs.krd.'
                  : language === 'ar'
                    ? 'أحدث الوظائف في أربيل، السليمانية، كركوك، ودهوك. مجمعة من fjik.krd و jobs.krd.'
                    : 'Latest job listings in Erbil, Sulaymaniyah, Kirkuk, and Duhok. Aggregated from fjik.krd and jobs.krd.'}
              </p>
            </div>

            {/* Search bar */}
            <form onSubmit={handleSearch} className="mt-6 max-w-xl">
              <div className="relative">
                <Search className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 ${isRTL ? 'right-3' : 'left-3'}`} />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder={
                    language === 'ckb'
                      ? 'گەڕان بۆ ناونیشان، کۆمپانیا...'
                      : language === 'ar'
                        ? 'البحث عن عنوان، شركة...'
                        : 'Search by title, company...'
                  }
                  className={`w-full py-3 border border-gray-300 rounded-xl bg-white text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isRTL ? 'pr-10 pl-24' : 'pl-10 pr-24'
                  }`}
                  dir={isRTL ? 'rtl' : 'ltr'}
                />
                <button
                  type="submit"
                  className={`absolute top-1/2 -translate-y-1/2 px-4 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors ${
                    isRTL ? 'left-2' : 'right-2'
                  }`}
                >
                  {language === 'ckb' ? 'گەڕان' : language === 'ar' ? 'بحث' : 'Search'}
                </button>
              </div>
            </form>

            {/* Active filter pills */}
            {hasActiveFilters && (
              <div className="mt-4 flex flex-wrap gap-2">
                {filters.search && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full">
                    &quot;{filters.search}&quot;
                    <button type="button" onClick={() => { setSearchInput(''); handleFilter('search', undefined) }}>
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                )}
                {filters.location && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full">
                    {filters.location}
                    <button type="button" onClick={() => handleFilter('location', undefined)}>
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                )}
                {filters.category && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full">
                    {filters.category}
                    <button type="button" onClick={() => handleFilter('category', undefined)}>
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                )}
                {filters.jobType && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full">
                    {filters.jobType}
                    <button type="button" onClick={() => handleFilter('jobType', undefined)}>
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Mobile filter toggle */}
        <div className="lg:hidden sticky top-16 z-30 bg-white border-b border-gray-200 px-4 py-3">
          <button
            type="button"
            onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-700"
          >
            <Filter className="w-4 h-4" />
            {language === 'ckb' ? 'فلتەرەکان' : language === 'ar' ? 'الفلاتر' : 'Filters'}
            {hasActiveFilters && (
              <span className="w-2 h-2 bg-blue-600 rounded-full" />
            )}
          </button>
        </div>

        {/* Mobile filters overlay */}
        {mobileFiltersOpen && (
          <div className="lg:hidden fixed inset-0 z-40 bg-black/30" onClick={() => setMobileFiltersOpen(false)}>
            <div
              className={`absolute top-0 bottom-0 w-80 max-w-[85vw] bg-white shadow-xl overflow-y-auto ${
                isRTL ? 'right-0' : 'left-0'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  {language === 'ckb' ? 'فلتەرەکان' : language === 'ar' ? 'الفلاتر' : 'Filters'}
                </h2>
                <button type="button" onClick={() => setMobileFiltersOpen(false)}>
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="p-4">
                <FilterSidebar mobile />
              </div>
            </div>
          </div>
        )}

        {/* Main content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="lg:grid lg:grid-cols-4 lg:gap-8">
            {/* Desktop sidebar */}
            <aside className="hidden lg:block lg:col-span-1">
              <FilterSidebar />
            </aside>

            {/* Job listings */}
            <div className="lg:col-span-3">
              {/* Results count */}
              <div className={`mb-4 text-sm text-gray-500 ${isRTL ? 'text-right' : 'text-left'}`}>
                {total === 0
                  ? language === 'ckb'
                    ? 'هیچ ئیشێک نەدۆزرایەوە'
                    : language === 'ar'
                      ? 'لم يتم العثور على وظائف'
                      : 'No jobs found'
                  : language === 'ckb'
                    ? `${total} ئیش دۆزرایەوە`
                    : language === 'ar'
                      ? `تم العثور على ${total} وظيفة`
                      : `${total} job${total !== 1 ? 's' : ''} found`}
              </div>

              {/* Job cards list */}
              <div className="space-y-3">
                {jobs.map((job) => (
                  <Link
                    key={job.id}
                    href={`/jobs/${job.slug}`}
                    className="block bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-gray-300 transition-all group"
                  >
                    <div className={`flex items-start gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      {/* Company logo placeholder */}
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-6 h-6 text-gray-400" />
                      </div>

                      <div className={`flex-1 min-w-0 ${isRTL ? 'text-right' : 'text-left'}`}>
                        {/* Title */}
                        <h2 className="text-base font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                          {getJobTitle(job)}
                        </h2>

                        {/* Company */}
                        <p className="text-sm text-gray-600 mt-0.5">{job.company}</p>

                        {/* Meta row */}
                        <div className={`flex flex-wrap items-center gap-3 mt-2.5 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                            <MapPin className="w-3.5 h-3.5" />
                            {job.location}
                          </span>
                          <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                            <Briefcase className="w-3.5 h-3.5" />
                            {job.jobType}
                          </span>
                          {job.salary && job.salary !== 'Not specified' && job.salary !== '0 - 0 IQD' && (
                            <span className="text-xs text-emerald-600 font-medium">
                              {job.salary}
                            </span>
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

              {/* Empty state */}
              {jobs.length === 0 && (
                <div className="text-center py-16">
                  <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {language === 'ckb'
                      ? 'هیچ ئیشێک نەدۆزرایەوە'
                      : language === 'ar'
                        ? 'لم يتم العثور على وظائف'
                        : 'No jobs found'}
                  </h3>
                  <p className="text-sm text-gray-500 mb-6">
                    {language === 'ckb'
                      ? 'هەوڵبدە فلتەرەکان بگۆڕیت یان گەڕانێکی تر بکە.'
                      : language === 'ar'
                        ? 'حاول تغيير الفلاتر أو البحث عن شيء آخر.'
                        : 'Try changing your filters or search for something else.'}
                  </p>
                  {hasActiveFilters && (
                    <button
                      type="button"
                      onClick={clearAllFilters}
                      className="text-sm font-medium text-blue-600 hover:text-blue-700"
                    >
                      {language === 'ckb' ? 'پاککردنەوەی فلتەرەکان' : language === 'ar' ? 'مسح الفلاتر' : 'Clear all filters'}
                    </button>
                  )}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                  <Link
                    href={buildUrl({ page: String(Math.max(1, page - 1)) })}
                    className={`inline-flex items-center gap-1 px-3 py-2 text-sm rounded-lg border transition-colors ${
                      page <= 1
                        ? 'border-gray-200 text-gray-300 pointer-events-none'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    {language === 'ckb' ? 'پێشوو' : language === 'ar' ? 'السابق' : 'Previous'}
                  </Link>

                  <span className="text-sm text-gray-600 px-3">
                    {page} / {totalPages}
                  </span>

                  <Link
                    href={buildUrl({ page: String(Math.min(totalPages, page + 1)) })}
                    className={`inline-flex items-center gap-1 px-3 py-2 text-sm rounded-lg border transition-colors ${
                      page >= totalPages
                        ? 'border-gray-200 text-gray-300 pointer-events-none'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {language === 'ckb' ? 'داهاتوو' : language === 'ar' ? 'التالي' : 'Next'}
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
