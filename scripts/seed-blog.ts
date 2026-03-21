import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedBlog() {
  const blogDir = path.join(process.cwd(), 'content', 'blog')
  
  if (!fs.existsSync(blogDir)) {
    console.log('No content/blog directory found')
    return
  }

  const files = fs.readdirSync(blogDir).filter((f) => f.endsWith('.mdx'))
  console.log(`Found ${files.length} MDX files`)

  for (const file of files) {
    const slug = file.replace(/\.mdx$/, '')
    const filePath = path.join(blogDir, file)
    const raw = fs.readFileSync(filePath, 'utf8')
    const { data, content } = matter(raw)

    // Handle frontmatter variations: some use 'lang', some use 'language'
    const lang = data.lang || data.language || 'en'
    const date = data.date ? new Date(data.date) : new Date()

    // Check if already exists
    const existing = await prisma.blogPost.findUnique({ where: { slug } })
    if (existing) {
      console.log(`  SKIP (exists): ${slug}`)
      continue
    }

    await prisma.blogPost.create({
      data: {
        slug,
        title: data.title || slug,
        excerpt: data.excerpt || data.description || '',
        content,
        author: data.author || 'Work.krd Team',
        lang,
        tags: data.tags || [],
        published: true,
        publishedAt: date,
        metaDescription: data.description || data.excerpt || null,
        metaKeywords: data.keywords || [],
        featuredImage: data.featuredImage || null,
      },
    })

    console.log(`  CREATED: ${slug}`)
  }

  console.log('Done seeding blog posts!')
}

seedBlog()
  .catch((e) => {
    console.error('Seed error:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
