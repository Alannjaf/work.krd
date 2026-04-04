# SEO Audit: work.krd
**URL:** https://work.krd
**Date:** 2026-04-04
**Business Type:** SaaS (Resume Builder) + Agency/Services + Job Board

---

## SEO Health Score: 62/100 (Grade: C)

Good foundation with proper metadata, schema markup, and canonical tags. Major gaps in sitemap coverage (jobs pages missing), Google Search Console verification, content depth, and programmatic SEO pages.

---

## On-Page SEO Checklist

### Title Tag
- **Status:** Pass
- **Current:** "Work.krd — Kurdish & Arabic AI Resume Builder | دروستکردنی سیڤی"
- **Length:** 65 chars — slightly over 60 char ideal, may truncate in SERPs
- **Issues:** Mixed-script title may confuse Google SERP display. The Kurdish text is good for local SEO but may reduce CTR for English searchers.
- **Recommendation:** Consider two variants: English-only for English content, Kurdish for Kurdish content via hreflang.

### Meta Description
- **Status:** Pass
- **Current:** "Build stunning resumes with AI assistance in multiple languages including Kurdish, Arabic, and English..."
- **Length:** ~160 chars — good
- **Issue:** Generic. Doesn't mention "Kurdistan", "Erbil", or "free" — the key differentiators.
- **Recommended:** "Free AI resume builder for Kurdistan — create professional CVs in Kurdish, Arabic & English. ATS-optimized templates, PDF export. Used by 1000+ job seekers in Erbil."

### Heading Hierarchy
- **Status:** Needs Work
- Homepage uses component-based H1/H2 — need to verify a single H1 exists in Hero
- Services page: client component — headings likely in JSX
- Jobs page: headings in client component
- **Action:** Verify each page has exactly one H1 containing target keyword

### Image Optimization
- **Status:** Needs Work
- OG image exists (`/og-image.png`) — good
- Template thumbnails at `/thumbnails/{id}.svg` — good for internal use
- **Missing:** No WebP optimized images detected, no `next/image` with alt text audit done
- **Action:** Audit all `<img>` tags for descriptive alt text

### Internal Linking
- **Status:** Needs Work
- Homepage links to: services, blog, jobs (via header/footer)
- Blog posts should link to /services and /resume-builder
- Jobs pages don't link back to resume builder (missed conversion funnel!)
- **Action:** Add contextual CTAs: "Found a job? Build your resume" on every job listing

### URL Structure
- **Status:** Pass
- Clean URLs: `/jobs`, `/blog`, `/services`, `/blog/[slug]`, `/jobs/[slug]`
- All lowercase, hyphen-separated, no parameters

---

## Content Quality (E-E-A-T)

| Dimension | Score | Evidence |
|---|---|---|
| Experience | Weak | No case studies showing real users getting jobs with work.krd resumes |
| Expertise | Present | AI-powered suggestions, ATS optimization features demonstrate domain knowledge |
| Authoritativeness | Weak | No author bios on blog, no press mentions, limited backlinks |
| Trustworthiness | Present | HTTPS, privacy policy, terms, Clerk auth, but no physical address on site |

**Key Gap:** No "About" page showing the team, no testimonials with real names/photos, no case studies.

---

## Keyword Analysis

### Primary Keywords (by page)

| Page | Target Keyword | In Title | In H1 | In URL | In Meta Desc | Density |
|---|---|---|---|---|---|---|
| Homepage | "Kurdish resume builder" | Yes | ? | N/A | Yes | Low |
| Jobs | "jobs Kurdistan" | Yes | ? | Yes | Yes | Medium |
| Services | "digital services Kurdistan" | Yes | ? | Partial | Yes | Low |
| Blog | "resume writing tips" | No | ? | No | Partial | Low |

### Missing High-Value Keywords
These keywords are NOT targeted anywhere on the site:

| Keyword | Intent | Monthly Search Est. | Competition | Priority |
|---|---|---|---|---|
| "CV maker Erbil" | Transactional | Medium | Low | **1 — CRITICAL** |
| "وەزیفە لە هەولێر" (jobs in Erbil - Kurdish) | Navigational | High | Very Low | **2 — CRITICAL** |
| "best resume template 2026" | Commercial | High | Medium | 3 |
| "سیڤی دروستکردن" (making CV - Kurdish) | Transactional | Medium | Very Low | **4 — HIGH** |
| "jobs Sulaymaniyah 2026" | Navigational | Medium | Low | 5 |
| "ATS resume checker free" | Transactional | High | Medium | 6 |
| "فۆرمی سیڤی" (CV form - Kurdish) | Transactional | Medium | Very Low | 7 |

---

## Technical SEO

### robots.txt
- **Status:** Pass with Issues
- Properly blocks admin, dashboard, API routes
- Points to sitemap.xml
- **Issue:** Cloudflare managed rules block ClaudeBot, GPTBot, etc. — this is fine but means AI search summaries won't feature work.krd. Consider allowing Google-Extended for AI Overviews visibility.

### XML Sitemap
- **Status:** CRITICAL — Incomplete
- Sitemap exists at `/sitemap.xml` (dynamic Next.js)
- **Includes:** Homepage, /services, /blog, /privacy, /terms, blog posts
- **MISSING:** `/jobs` page (priority 0.9 content!), individual job pages (`/jobs/[slug]`), no job-specific URLs
- **Impact:** Hundreds of job pages are invisible to Google
- **Fix:** Add jobs and individual job pages to sitemap.ts

### Canonical Tags
- **Status:** Pass
- All pages have proper canonical URLs
- Self-referencing canonicals on homepage, jobs, services, blog

### Google Search Console
- **Status:** FAIL — Not Verified
- Verification token is commented out in layout.tsx (line 71)
- **Impact:** Cannot monitor search performance, submit sitemaps, or get indexing alerts
- **Fix:** Add Google verification meta tag

### Schema Markup
- **Status:** Good
- Organization schema: Present with social profiles
- WebSite with SearchAction: Present
- FAQPage: Present on homepage (6 questions)
- SoftwareApplication: Present with pricing
- **Missing:** JobPosting schema on job pages (HUGE missed opportunity for Google Jobs)
- **Missing:** LocalBusiness schema (even though services target Erbil)
- **Missing:** Article/BlogPosting schema on blog posts

### Page Speed (estimated from code)
- **Status:** Likely Good
- Next.js 15 with font optimization (`display: 'swap'`)
- `preconnect` to Google Fonts, Clerk
- SVG thumbnails (small file size)
- **Concern:** Clerk auth JS bundle may impact FCP
- **Action:** Run Lighthouse audit to get actual Core Web Vitals

### Mobile-Friendliness
- **Status:** Pass
- Viewport meta tag present
- Tailwind CSS (responsive by design)
- RTL support built in

---

## Content Gap Analysis — BIGGEST OPPORTUNITY

### Missing Programmatic SEO Pages

These pages don't exist yet but could capture hundreds of monthly searches with near-zero competition:

| Page Pattern | Example URL | Search Volume Potential | Competition | Priority |
|---|---|---|---|---|
| "Jobs in [City]" | `/jobs/erbil` | High | Very Low | **1** |
| "Jobs in [City] [Category]" | `/jobs/erbil/engineering` | Medium | Very Low | **2** |
| "Best [service] in [City]" | `/best-web-design-erbil` | Medium | Low | **3** |
| "[Kurdish keyword] landing" | `/سیڤی-دروستکردن` | Medium | Very Low | **4** |
| "Resume template for [industry]" | `/resume-templates/engineering` | Medium | Medium | **5** |
| "How to write a CV in Kurdish" | `/blog/how-to-write-cv-kurdish` | Medium | Very Low | **6** |

**Estimated Traffic Gain:** 500-2000 monthly organic visits within 3 months of implementation.

### Blog Content Gaps
Currently 11 blog posts. Need:
- "Best jobs in Erbil 2026" (evergreen, update monthly)
- "How to write CV in Kurdish" (tutorial with screenshots)
- "Top companies hiring in Kurdistan" (linkbait for backlinks)
- "Salary guide Kurdistan 2026" (data-driven content)
- "Interview tips for Kurdish job seekers" (supporting content)

---

## Featured Snippet Opportunities

| Query | Snippet Type | Current Status | Action |
|---|---|---|---|
| "how to write CV in Kurdish" | Paragraph | No page | Create blog post with 50-word answer after H2 |
| "jobs in Erbil" | List | Jobs page exists but not optimized | Add structured job count and category summary |
| "what is ATS" | Paragraph | FAQ answer exists | Already in FAQ schema — good |
| "free resume builder" | List | Competitor-dominated | Homepage FAQ could target this |

---

## Internal Linking Opportunities — Quick Wins

1. **Jobs → Resume Builder funnel:** Every job listing should have "Apply with a professional CV — Build yours free" CTA linking to `/resume-builder`
2. **Blog → Services:** Each blog post should link to relevant service
3. **Homepage → Jobs:** Add a "Latest Jobs in Kurdistan" section on homepage with 3-5 recent listings
4. **Services → Case Studies:** Link from service descriptions to relevant blog posts/portfolio
5. **Footer:** Add links to top job categories (Engineering, Medical, IT, etc.)

---

## Prioritized Recommendations

### CRITICAL — Fix This Week (Est. Impact: +30% organic traffic)

1. **Add /jobs to sitemap.ts** — Job pages are completely invisible to Google. Add both `/jobs` and all `/jobs/[slug]` pages. This alone could index hundreds of pages.
   ```typescript
   // In sitemap.ts, add:
   const jobs = await prisma.job.findMany({
     where: { isActive: true },
     select: { slug: true, updatedAt: true },
   });
   for (const job of jobs) {
     sitemap.push({
       url: `${baseUrl}/jobs/${job.slug}`,
       lastModified: job.updatedAt,
       changeFrequency: 'daily',
       priority: 0.6,
     });
   }
   ```

2. **Add JobPosting schema to job detail pages** — Google Jobs integration. Each `/jobs/[slug]` page should have JSON-LD with title, company, location, datePosted, description.

3. **Verify Google Search Console** — Uncomment and add verification token in layout.tsx line 71. Submit sitemap.

### HIGH PRIORITY — This Month (Est. Impact: +50% organic traffic)

4. **Build programmatic city pages** — `/jobs/erbil`, `/jobs/sulaymaniyah`, `/jobs/duhok`, `/jobs/kirkuk` with filtered job listings and city-specific metadata.

5. **Add Kurdish-language landing page** — A dedicated Kurdish homepage variant at `/ku` targeting "سیڤی دروستکردن" and "وەزیفە لە هەولێر".

6. **Blog: publish 5 Kurdish SEO posts** — Target the zero-competition Kurdish keywords. Each post links to resume builder and jobs.

7. **Add "Latest Jobs" section to homepage** — Fresh content signals + internal links to job pages.

### MEDIUM PRIORITY — This Quarter

8. **Build an About page** — Team, mission, story. E-E-A-T signal.
9. **Add BlogPosting schema** to all blog posts with author, datePublished, dateModified.
10. **Create industry-specific resume template pages** — `/resume-templates/engineering`, `/resume-templates/medical` etc.
11. **Optimize meta descriptions** for each page with location-specific keywords and CTAs.
12. **Add hreflang tags** for en/ar/ckb content variants.

### LOW PRIORITY — When Resources Allow

13. Register with Google Business Profile (even as a virtual business)
14. Build backlinks via Kurdish tech community, university career centers
15. Create a "Salary Guide Kurdistan 2026" data piece for backlink earning
16. A/B test homepage title tag variations

---

## Revenue Impact Summary

| Recommendation | Est. Monthly Impact | Confidence | Timeline |
|---|---|---|---|
| Index job pages (sitemap fix) | +200-500 organic visits | High | 1 day |
| JobPosting schema | +100-300 Google Jobs impressions | High | 2 days |
| Google Search Console | Monitoring + indexing requests | High | 1 hour |
| Programmatic city pages | +300-800 organic visits | Medium | 1 week |
| Kurdish SEO blog posts | +200-500 Kurdish searches | Medium | 2 weeks |
| Homepage jobs section | +50-100 internal pageviews | Medium | 3 hours |
| **Total Potential** | **+850-2200 monthly visits** | | |

At even 1% conversion to service inquiries → **8-22 new leads/month** → potential 10-20M IQD revenue.

---

*Generated by market-seo skill — 2026-04-04*
