# work.krd — AI Learnings

## Rules
- For any task involving reading/exploring the codebase, use agent teams to parallelize across folders
- For implementation, plan first then use agent teams to implement in parallel
- After every change session, update this CLAUDE.md with new learnings, patterns, gotchas, and architecture changes before committing
- Commit only, wait for Alan to say "push" — Netlify auto-builds (20 deploys/month)
- Test mobile AND desktop after CSS changes

## Tech Stack
- Next.js 15 + Tailwind + Prisma (PostgreSQL) + Clerk auth
- Resume builder SaaS for Kurdish/Arabic speakers — RTL is critical
- A4 target: `width: 794px` (210mm at 96dpi), default `padding: 60px`
- A4 page height: `1123px` (297mm at 96dpi), content per page: `1043px` (1123 - 40px top - 40px bottom)

## Architecture Overview

### Template System
- **Registry** (`src/components/html-templates/registry.tsx`): Maps template IDs to `{ id, name, component }` entries
- **Current templates**: `placeholder` (fallback), `modern` (Modern Professional — dark sidebar + yellow accent)
- **Shared components** in `src/components/html-templates/shared/`: ResumeHeader, ContactInfo, ProfilePhoto, SectionTitle, ExperienceSection, EducationSection, SkillsSection, LanguagesSection, ProjectsSection, CertificationsSection, Watermark
- **Metadata** (`src/lib/templates.ts`): `getAllTemplates()`, `getTemplateIds()`, `getTemplateTier()`
- **Crop configs** (`src/lib/template-config.ts`): Per-template profile photo crop settings

### Resume Builder (3-Column Layout)
- **Page**: `src/app/resume-builder/page.tsx` — Desktop: sidebar icons + form + live preview; Mobile: single-column + FAB
- **6 Sections**: About You → Summary → Experience → Education → Skills & Languages → Additional (Projects + Certifications)
- **Auto-save**: `useAutoSave.ts` — refs pattern (avoids stale closures), 1s debounce, always full saves (not patches)
- **Download**: `useDownloadPDF.ts` → POST `/api/pdf/generate` with `action: 'download'`; 403 → opens `/billing`
- **Template switcher**: Popover in preview panel, checks `availableTemplates` from SubscriptionContext

### Subscription & Limits
- **Plans**: FREE, BASIC, PRO — limits in `SystemSettings` DB table (singleton row)
- **`-1` = unlimited** for PRO defaults (resumes, AI, exports, imports, ATS)
- **`checkUserLimits()`** in `db.ts`: Server-side gate for all features, PRO always gets all registered templates
- **SubscriptionContext** (`src/contexts/SubscriptionContext.tsx`): Client-side provider, fetches from `/api/user/subscription-data`
- **Template access**: `freeTemplates`, `basicTemplates`, `proTemplates` arrays in SystemSettings (Prisma Json fields — pass arrays directly, never JSON.stringify)

### Admin Dashboard
- **Components** in `src/components/admin/`: AdminDashboard, AdminStatsCards, AdminSubscriptionStatus, AdminSystemSettings, AdminQuickActions, UserManagement, ResumeManagement
- **Settings API**: GET/POST `/api/admin/settings` — singleton SystemSettings record
- **Subscription check**: GET (status) / POST (process expired → downgrade to FREE) `/api/subscriptions/check-expired`

## Creating New Templates

### Step-by-Step
1. Create `src/components/html-templates/{Name}Template.tsx` implementing `HtmlTemplateProps`
2. Register in `registry.tsx`: add to `templateRegistry` object
3. Add metadata in `templates.ts`: `getAllTemplates()` array
4. Optionally add crop config in `template-config.ts`
5. Add thumbnail SVG in `public/thumbnails/{id}.svg`

### Template Props
```typescript
interface HtmlTemplateProps {
  data: ResumeData    // personal, summary, experience, education, skills, languages, projects?, certifications?
  watermark?: boolean // render <Watermark /> overlay when true
}
```

### ResumeData Structure
```
personal: { fullName, email, phone, location, linkedin, website, title, profileImage, dateOfBirth, gender, nationality, maritalStatus, country }
summary: string
experience: [{ jobTitle, company, location, startDate, endDate, current, description (HTML) }]
education: [{ degree, field, school, location, startDate, endDate, gpa, achievements (HTML) }]
skills: [{ name, level? }]
languages: [{ name, proficiency }]
projects?: [{ name, description (HTML), technologies, link, startDate, endDate }]
certifications?: [{ name, issuer, date, expiryDate, credentialId, url }]
```

### Mandatory Template Rules

**Dimensions**: `width: '794px'`, NO `minHeight` on root container

**Font**: `fontFamily: 'system-ui, -apple-system, sans-serif'` (PDF pipeline injects Inter + Noto Sans Arabic)

**RTL Support** (MANDATORY):
```js
// Detect: /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/
// Root: direction: isRtl ? 'rtl' : 'ltr'
// Text blocks: textAlign: isRtl ? 'right' : 'left'
// Flex containers: flexDirection: isRtl ? 'row-reverse' : 'row'
// Contact/URLs: <span style={{ unicodeBidi: 'isolate' }}> inside direction:'ltr', unicodeBidi:'plaintext' container
// Line-height: increase for RTL (1.5-1.8 vs 1.3-1.5 LTR)
```

**Page Break CSS** (include via `<style>` in template):
```css
.resume-entry { break-inside: avoid; page-break-inside: avoid; }
.resume-section h2 { break-after: avoid; page-break-after: avoid; }
```
Apply `className="resume-section"` to sections, `className="resume-entry"` to items.

**List Styles** (Tailwind strips bullets, include via `<style>`):
```css
.resume-desc ul, .resume-desc ol { list-style: disc; padding-left: 1.2em; margin: 4px 0; }
.resume-desc ol { list-style: decimal; }
[dir="rtl"] .resume-desc ul, [dir="rtl"] .resume-desc ol { padding-left: 0; padding-right: 1.2em; }
```

**Rich text**: `dangerouslySetInnerHTML={{ __html: description }}` with `className="resume-desc"`

**Watermark**: `{watermark && <Watermark />}` — import from shared components

## PDF Pipeline
- `renderHtml.ts`: React SSR → full HTML document with embedded fonts (Inter LTR + Noto Sans Arabic RTL via base64)
- `generatePdf.ts`: Puppeteer (`puppeteer-core`) → A4 PDF; waits for `document.fonts.ready`
- PDF margins: `@page { margin: 40px 0; }` — templates must NOT add their own page margins
- Preview pagination: `ResumePageScaler.tsx` measures content, calculates page breaks matching Puppeteer output

## Key Patterns & Gotchas
- **Prisma Json fields**: Pass arrays directly (`proTemplates: ['modern']`), never `JSON.stringify()` — causes double-encoding
- **PRO template access**: `checkUserLimits` always includes all `getTemplateIds()` for PRO, regardless of DB settings
- **Export tracking**: Only `action: 'download'` increments `exportCount`; preview doesn't count
- **Two getSystemSettings()**: Private one in `db.ts` (parses JSON arrays, used by `checkUserLimits`) and exported one in `system-settings.ts` (raw Prisma result, used by admin API)
- **Subscription expiry**: Manual via admin button, not scheduled — downgrades to FREE, preserves usage counts
- **Auto-save refs pattern**: `formDataRef`, `resumeIdRef`, `templateRef` — prevents stale closures in debounced saves
- Buttons without `type="button"` cause page refresh
- `minHeight: 1123px` on template root causes wrong page count (remove it)
- Mixed LTR/RTL text garbles → use `unicode-bidi: isolate` spans
- AI max_tokens 200 cuts Kurdish text → use 500+ (Kurdish uses more tokens/word)
- Mobile toolbar → flex-wrap, smaller icons (no horizontal scroll)

## File Map
```
src/components/html-templates/
  registry.tsx                 # Template registry + getHtmlTemplate()
  PlaceholderTemplate.tsx      # Fallback single-column template
  ModernTemplate.tsx           # Dark sidebar + yellow accent two-column
  TemplateRenderer.tsx         # Wrapper: looks up registry, renders component
  ResumePageScaler.tsx         # Browser preview with page break simulation
  shared/                     # Reusable template building blocks (13 components)

src/lib/
  templates.ts                # Template metadata (getAllTemplates, getTemplateIds, getTemplateTier)
  template-config.ts          # Per-template crop configs for profile photos
  db.ts                       # getCurrentUser, checkUserLimits (private getSystemSettings)
  system-settings.ts          # getSystemSettings (exported), updateSystemSettings
  rtl.ts                      # isRTLText(), isResumeRTL() — Arabic/Kurdish detection
  pdf/renderHtml.ts           # React SSR → HTML with embedded fonts
  pdf/generatePdf.ts          # Puppeteer HTML → PDF buffer

src/components/resume-builder/
  page.tsx                    # Main builder (3-column desktop, mobile responsive)
  form/                       # 6 section components + FormSectionRenderer
  preview/                    # LivePreviewPanel, TemplateSwitcher, MobilePreviewSheet

src/components/admin/         # AdminDashboard + sub-components (stats, settings, users, resumes)
src/contexts/SubscriptionContext.tsx  # Client provider for subscription + permissions
src/hooks/useAutoSave.ts      # Refs-based debounced auto-save
src/hooks/useDownloadPDF.ts   # PDF download with 403 → billing redirect

src/app/api/
  pdf/generate/               # POST: generate PDF (checks limits + template access)
  admin/settings/             # GET/POST: system settings (requires admin)
  admin/stats/                # GET: platform metrics
  admin/users/                # GET: user listing; [userId]/upgrade POST
  subscriptions/check-expired/# GET: status; POST: process expired
  user/subscription-data/     # GET: subscription + permissions for client context
```
