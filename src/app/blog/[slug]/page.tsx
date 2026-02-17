import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import Link from 'next/link'
import { getPostBySlug, getAllPostSlugs } from '@/lib/blog'
import { MDXContent } from './mdx-content'

// Generate static paths for all blog posts
export function generateStaticParams() {
  const slugs = getAllPostSlugs()
  return slugs.map((slug) => ({ slug }))
}

// Generate dynamic metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = getPostBySlug(slug)

  if (!post) {
    return { title: 'Post Not Found' }
  }

  const url = `https://work.krd/blog/${post.slug}`

  return {
    title: post.title,
    description: post.excerpt,
    authors: [{ name: post.author }],
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url,
      type: 'article',
      publishedTime: post.date,
      authors: [post.author],
      locale: post.lang === 'ar' ? 'ar_AR' : post.lang === 'ckb' ? 'ku_IQ' : 'en_US',
      siteName: 'Work.krd',
      tags: post.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      creator: '@workkrd',
    },
    alternates: {
      canonical: url,
    },
  }
}

function formatDate(dateString: string, lang: string): string {
  const date = new Date(dateString)
  const locale = lang === 'ar' ? 'ar' : lang === 'ckb' ? 'ckb' : 'en-US'
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = getPostBySlug(slug)

  if (!post) {
    notFound()
  }

  const isRTL = post.lang === 'ar' || post.lang === 'ckb'
  const fontClass = isRTL ? 'font-arabic' : ''

  // JSON-LD structured data for BlogPosting
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    author: {
      '@type': 'Person',
      name: post.author,
    },
    datePublished: post.date,
    dateModified: post.date,
    publisher: {
      '@type': 'Organization',
      name: 'Work.krd',
      url: 'https://work.krd',
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://work.krd/blog/${post.slug}`,
    },
    keywords: post.tags?.join(', '),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className={`min-h-screen bg-gray-50 ${fontClass}`} dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Header */}
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-primary-600 transition-colors"
            >
              <svg
                className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              {isRTL ? 'العودة إلى المدونة' : 'Back to Blog'}
            </Link>
          </div>
        </header>

        {/* Article */}
        <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <article>
            {/* Post header */}
            <header className="mb-8 sm:mb-10">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-4">
                {post.title}
              </h1>

              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                <span>{post.author}</span>
                <span className="hidden sm:inline" aria-hidden="true">·</span>
                <time dateTime={post.date}>{formatDate(post.date, post.lang)}</time>
                <span className="hidden sm:inline" aria-hidden="true">·</span>
                <span>{post.readingTime}</span>
              </div>

              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-block bg-primary-50 text-primary-700 text-xs font-medium px-2.5 py-1 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </header>

            {/* Post content */}
            <div
              className={`prose prose-lg max-w-none
                prose-headings:text-gray-900 prose-headings:font-bold
                prose-p:text-gray-700 prose-p:leading-relaxed
                prose-a:text-primary-600 prose-a:no-underline hover:prose-a:underline
                prose-strong:text-gray-900
                prose-blockquote:border-primary-500 prose-blockquote:text-gray-600
                prose-code:text-primary-700 prose-code:bg-primary-50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none
                prose-pre:bg-gray-900
                prose-img:rounded-lg
                prose-li:text-gray-700
                ${isRTL ? 'text-right' : ''}
              `}
            >
              <MDXContent source={post.content} />
            </div>
          </article>

          {/* Footer navigation */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium transition-colors"
            >
              <svg
                className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              {isRTL ? 'جميع المقالات' : 'All Posts'}
            </Link>
          </div>
        </main>
      </div>
    </>
  )
}
