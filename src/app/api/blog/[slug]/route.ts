import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin'
import readingTime from 'reading-time'

// GET /api/blog/[slug] — get single published post (public)
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const post = await prisma.blogPost.findUnique({
      where: { slug },
    })

    if (!post || !post.published) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    return NextResponse.json({
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      author: post.author,
      lang: post.lang,
      tags: post.tags,
      date: (post.publishedAt || post.createdAt).toISOString(),
      readingTime: readingTime(post.content).text,
      featuredImage: post.featuredImage,
      metaDescription: post.metaDescription,
      metaKeywords: post.metaKeywords,
    })
  } catch (error) {
    console.error('[Blog API] GET slug error:', error)
    return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 })
  }
}

// PUT /api/blog/[slug] — update a blog post (admin only)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await requireAdmin()
    const { slug } = await params
    const body = await req.json()

    const existing = await prisma.blogPost.findUnique({ where: { slug } })
    if (!existing) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    const updateData: Record<string, unknown> = {}
    if (body.title !== undefined) updateData.title = body.title
    if (body.excerpt !== undefined) updateData.excerpt = body.excerpt
    if (body.content !== undefined) updateData.content = body.content
    if (body.author !== undefined) updateData.author = body.author
    if (body.lang !== undefined) updateData.lang = body.lang
    if (body.tags !== undefined) updateData.tags = body.tags
    if (body.published !== undefined) updateData.published = body.published
    if (body.publishedAt !== undefined) updateData.publishedAt = body.publishedAt ? new Date(body.publishedAt) : null
    if (body.metaDescription !== undefined) updateData.metaDescription = body.metaDescription
    if (body.metaKeywords !== undefined) updateData.metaKeywords = body.metaKeywords
    if (body.featuredImage !== undefined) updateData.featuredImage = body.featuredImage
    if (body.slug !== undefined) updateData.slug = body.slug

    // Auto-set publishedAt when publishing for the first time
    if (body.published === true && !existing.publishedAt && !body.publishedAt) {
      updateData.publishedAt = new Date()
    }

    const post = await prisma.blogPost.update({
      where: { slug },
      data: updateData,
    })

    return NextResponse.json(post)
  } catch (error) {
    console.error('[Blog API] PUT error:', error)
    if ((error as Error).message?.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 })
  }
}

// DELETE /api/blog/[slug] — delete a blog post (admin only)
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await requireAdmin()
    const { slug } = await params

    const existing = await prisma.blogPost.findUnique({ where: { slug } })
    if (!existing) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    await prisma.blogPost.delete({ where: { slug } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Blog API] DELETE error:', error)
    if ((error as Error).message?.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 })
  }
}
