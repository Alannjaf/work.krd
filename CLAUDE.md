# work.krd — AI Learnings

## Rules
- Commit only, don't push — wait for Alan to say "push"
- Netlify auto-builds on push (credit-based: 20 free deploys/month, batch changes)
- Always test mobile AND desktop after CSS changes

## Patterns
- Next.js 15 app with Tailwind CSS, Prisma, Clerk auth
- Resume builder SaaS — users create CVs/resumes online
- Target audience includes Kurdish/Arabic speakers — RTL is critical
- Mobile-first responsive design

## Resume Template Rules (CRITICAL — apply to ALL new templates)
Reference implementation: `src/components/html-templates/registry.tsx` (PlaceholderTemplate)

### Layout & Sizing
- Root div: `width: '794px'` (A4 at 96dpi). NO `minHeight` — ResumePageScaler handles page sizing
- Padding: `padding: '60px'` on root for content margins
- Background: `backgroundColor: '#ffffff'`

### RTL Support (MANDATORY)
- Detect RTL with `hasRtlChars()` — checks Arabic/Kurdish Unicode ranges `[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]`
- Set `direction: dir` on root container (`dir = isRtl ? 'rtl' : 'ltr'`)
- Set `textAlign` on all text blocks (headings, paragraphs, descriptions)
- Use `direction: dir` on flex rows (title/date layouts)
- Contact items, links, demographics: render each as `<span style={{ unicodeBidi: 'isolate' }}>` inside a container with `direction: 'ltr', unicodeBidi: 'plaintext'`
- Skills/languages flex containers: set `direction: dir`

### Page Break CSS (MANDATORY)
Every template must include this style block:
```css
.resume-entry { break-inside: avoid; page-break-inside: avoid; }
.resume-section h2 { break-after: avoid; page-break-after: avoid; }
```
- Add `className="resume-section"` to each section wrapper div
- Add `className="resume-entry"` to each individual entry (experience item, education item, etc.)
- Also add `className="resume-entry"` to small sections that should never split (Skills, Languages, Summary)

### List Styles (Tailwind preflight fix)
Every template must include this style block to restore bullet points stripped by Tailwind:
```css
.resume-desc ul, .resume-desc ol { list-style: disc; padding-left: 1.2em; padding-right: 0; margin: 4px 0; }
.resume-desc ol { list-style: decimal; }
.resume-desc li { margin-bottom: 2px; }
[dir="rtl"] .resume-desc ul, [dir="rtl"] .resume-desc ol { padding-left: 0; padding-right: 1.2em; }
```

### Rich Text Descriptions
- Experience descriptions, project descriptions: use `dangerouslySetInnerHTML={{ __html: description }}` with `className="resume-desc"`
- Education achievements: plain text (not rich text)

### Data Structure (from HtmlTemplateProps)
- `data.personal`: fullName, title, email, phone, location, linkedin, website, profileImage, dateOfBirth, gender, nationality, maritalStatus, country
- `data.summary`: string
- `data.experience[]`: jobTitle, company, location, startDate, endDate, current, description (HTML)
- `data.education[]`: degree, field, school, location, startDate, endDate, gpa, achievements
- `data.skills[]`: name, level
- `data.languages[]`: name, proficiency
- `data.projects[]`: name, description (HTML), technologies, link, startDate, endDate
- `data.certifications[]`: name, issuer, date, expiryDate, credentialId, url

### PDF Pipeline
- Fonts embedded in `renderHtml.ts`: Inter (LTR) + Noto Sans Arabic (RTL) via base64
- PDF margins: `@page { margin: 40px 0; }` — templates should NOT add their own top/bottom page margins
- Template `fontFamily` should include fallback: `'system-ui, -apple-system, sans-serif'`
- ResumePageScaler simulates page breaks in preview to match PDF output

### Template Registration
- Register in `templateRegistry` object in `registry.tsx`
- Each template: `{ id: string, name: string, component: ComponentType<HtmlTemplateProps> }`
- `getHtmlTemplate(id)` falls back to `placeholder` if template not found
- Add template ID to plan access lists in `src/lib/db.ts` → `getSystemSettings()`

## Mistakes & Fixes
- [Feb 9] Mobile toolbar had horizontal scroll → Changed overflow-x-auto to flex-wrap, smaller icons/text on mobile
- [Feb 9] LTE carriers in Iraq can't load site (Netlify CDN routing) — Wi-Fi works fine. Potential fix: Cloudflare proxy
- [Feb 11] Buttons without `type="button"` cause page refresh (HTML default is `type="submit"`)
- [Feb 11] `@page { margin: 0 }` in renderHtml.ts overrides Puppeteer's margin option
- [Feb 11] `minHeight: 1123px` on template root causes wrong page count (1123/1043 = 2 pages always)
- [Feb 11] puppeteer-core v24 + @sparticuz/chromium-min v143 = "protocol mismatch" — prefer local Chrome in dev
- [Feb 11] Mixed LTR/RTL text (labels + Arabic values) garbles in single string — use `unicode-bidi: isolate` spans
- [Feb 11] AI max_tokens 200 cuts off Kurdish text — Kurdish/Arabic uses more tokens per word, use 500+
- [Feb 11] Stale closures in useAutoSave lost data — use refs for latest values, always full saves

## Dependencies
- Next.js 15, Tailwind CSS, Prisma, Clerk
- puppeteer-core + @sparticuz/chromium-min (PDF generation)
- Deployed on Netlify (main branch)

## Notes
- Photo crop, AI language matching, date format still need testing
- `src/lib/templates.ts` still has old template IDs — update when new templates are created
