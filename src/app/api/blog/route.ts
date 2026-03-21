import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin'
import readingTime from 'reading-time'

// GET /api/blog — list all published posts (public)
export async function GET() {
  try {
    const posts = await prisma.blogPost.findMany({
      where: { published: true },
      orderBy: { publishedAt: 'desc' },
      select: {
        slug: true,
        title: true,
        excerpt: true,
        author: true,
        lang: true,
        tags: true,
        content: true,
        publishedAt: true,
        createdAt: true,
        featuredImage: true,
      },
    })

    const result = posts.map((post) => ({
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      author: post.author,
      lang: post.lang,
      tags: post.tags,
      date: (post.publishedAt || post.createdAt).toISOString(),
      readingTime: readingTime(post.content).text,
      featuredImage: post.featuredImage,
    }))

    return NextResponse.json(result)
  } catch (error) {
    console.error('[Blog API] GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
  }
}

// POST /api/blog — create a new blog post (admin only)
export async function POST(req: NextRequest) {
  try {
    await requireAdmin()

    const body = await req.json()
    const { slug, title, excerpt, content, author, lang, tags, published, publishedAt, metaDescription, metaKeywords, featuredImage } = body

    if (!slug || !title || !content) {
      return NextResponse.json({ error: 'slug, title, and content are required' }, { status: 400 })
    }

    const post = await prisma.blogPost.create({
      data: {
        slug,
        title,
        excerpt: excerpt || '',
        content,
        author: author || 'Work.krd Team',
        lang: lang || 'en',
        tags: tags || [],
        published: published ?? false,
        publishedAt: publishedAt ? new Date(publishedAt) : published ? new Date() : null,
        metaDescription: metaDescription || null,
        metaKeywords: metaKeywords || [],
        featuredImage: featuredImage || null,
      },
    })

    return NextResponse.json(post, { status: 201 })
  } catch (error) {
    console.error('[Blog API] POST error:', error)
    if ((error as Error).message?.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 })
  }
}
