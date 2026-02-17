import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import readingTime from 'reading-time'

export interface BlogPost {
  slug: string
  title: string
  date: string
  excerpt: string
  author: string
  lang: 'en' | 'ar' | 'ckb'
  tags?: string[]
  content: string
  readingTime: string
}

export interface BlogPostMetadata {
  slug: string
  title: string
  date: string
  excerpt: string
  author: string
  lang: 'en' | 'ar' | 'ckb'
  tags?: string[]
  readingTime: string
}

const postsDirectory = path.join(process.cwd(), 'content', 'blog')

// Ensure directory exists
if (!fs.existsSync(postsDirectory)) {
  fs.mkdirSync(postsDirectory, { recursive: true })
}

/**
 * Get all blog post slugs
 */
export function getAllPostSlugs(): string[] {
  if (!fs.existsSync(postsDirectory)) {
    return []
  }

  const files = fs.readdirSync(postsDirectory)
  return files
    .filter((file) => file.endsWith('.mdx'))
    .map((file) => file.replace(/\.mdx$/, ''))
}

/**
 * Get a single blog post by slug
 */
export function getPostBySlug(slug: string): BlogPost | null {
  try {
    const fullPath = path.join(postsDirectory, `${slug}.mdx`)

    if (!fs.existsSync(fullPath)) {
      return null
    }

    const fileContents = fs.readFileSync(fullPath, 'utf8')
    const { data, content } = matter(fileContents)
    const readTime = readingTime(content)

    return {
      slug,
      title: data.title || 'Untitled',
      date: data.date || new Date().toISOString(),
      excerpt: data.excerpt || '',
      author: data.author || 'Work.krd Team',
      lang: data.lang || 'en',
      tags: data.tags || [],
      content,
      readingTime: readTime.text,
    }
  } catch (error) {
    console.error(`Error reading post ${slug}:`, error)
    return null
  }
}

/**
 * Get all blog posts metadata (without content)
 */
export function getAllPosts(): BlogPostMetadata[] {
  const slugs = getAllPostSlugs()

  const posts = slugs
    .map((slug) => {
      const post = getPostBySlug(slug)
      if (!post) return null

      // Return metadata only (no content)
      const { content, ...metadata } = post
      return metadata
    })
    .filter((post): post is BlogPostMetadata => post !== null)
    .sort((a, b) => {
      // Sort by date descending (newest first)
      return new Date(b.date).getTime() - new Date(a.date).getTime()
    })

  return posts
}

/**
 * Get posts by language
 */
export function getPostsByLanguage(lang: 'en' | 'ar' | 'ckb'): BlogPostMetadata[] {
  const allPosts = getAllPosts()
  return allPosts.filter((post) => post.lang === lang)
}

/**
 * Get posts by tag
 */
export function getPostsByTag(tag: string): BlogPostMetadata[] {
  const allPosts = getAllPosts()
  return allPosts.filter((post) => post.tags?.includes(tag))
}
