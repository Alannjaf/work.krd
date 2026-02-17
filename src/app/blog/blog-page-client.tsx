'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'
import { Header } from '@/components/landing/header'
import { Footer } from '@/components/landing/footer'
import { Calendar, Clock, User, Tag } from 'lucide-react'
import type { BlogPostMetadata } from '@/lib/blog'

const langLabels: Record<string, string> = {
  all: 'All',
  en: 'English',
  ar: 'العربية',
  ckb: 'کوردی',
}

function formatDate(dateStr: string, lang: string): string {
  const date = new Date(dateStr)
  const localeMap: Record<string, string> = {
    en: 'en-US',
    ar: 'ar-IQ',
    ckb: 'ckb-IQ',
  }
  try {
    return date.toLocaleDateString(localeMap[lang] || 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch {
    // ckb locale may not be supported in all browsers
    return date.toLocaleDateString('ar-IQ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }
}

interface BlogPageClientProps {
  posts: BlogPostMetadata[]
}

export function BlogPageClient({ posts }: BlogPageClientProps) {
  const { isRTL } = useLanguage()
  const [langFilter, setLangFilter] = useState<string>('all')

  const filteredPosts =
    langFilter === 'all'
      ? posts
      : posts.filter((post) => post.lang === langFilter)

  // Collect available languages from posts
  const availableLangs = ['all', ...new Set(posts.map((p) => p.lang))]

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero section */}
      <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50 -z-10" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100 rounded-full opacity-20 blur-3xl -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900">
            Blog
          </h1>
          <p className="mt-4 text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
            Tips, guides, and insights on resume writing, career development,
            and job hunting.
          </p>

          {/* Language filter */}
          {availableLangs.length > 2 && (
            <div className="mt-8 flex items-center justify-center gap-2 flex-wrap">
              {availableLangs.map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setLangFilter(lang)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    langFilter === lang
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {langLabels[lang] || lang}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Posts grid */}
      <section className="pb-20 sm:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredPosts.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">No posts yet. Check back soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {filteredPosts.map((post) => {
                const isPostRTL = post.lang === 'ar' || post.lang === 'ckb'

                return (
                  <Link
                    key={post.slug}
                    href={`/blog/${post.slug}`}
                    className="group bg-white rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col"
                  >
                    {/* Card body */}
                    <div
                      className="p-6 flex flex-col flex-1"
                      dir={isPostRTL ? 'rtl' : 'ltr'}
                    >
                      {/* Tags */}
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {post.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-blue-50 text-blue-700 rounded"
                            >
                              <Tag className="w-3 h-3" />
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Title */}
                      <h2
                        className={`text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-2 line-clamp-2 ${
                          isPostRTL ? 'font-arabic' : ''
                        }`}
                      >
                        {post.title}
                      </h2>

                      {/* Excerpt */}
                      <p
                        className={`text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3 flex-1 ${
                          isPostRTL ? 'font-arabic' : ''
                        }`}
                      >
                        {post.excerpt}
                      </p>

                      {/* Meta */}
                      <div className="flex items-center gap-4 text-xs text-gray-400 pt-3 border-t border-gray-50">
                        <span className="inline-flex items-center gap-1">
                          <User className="w-3.5 h-3.5" />
                          {post.author}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDate(post.date, post.lang)}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {post.readingTime}
                        </span>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}
