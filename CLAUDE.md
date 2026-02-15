# work.krd — AI Learnings

## Rules
- For any task involving reading/exploring the codebase, use agent teams to parallelize across folders
- For implementation, plan first then use agent teams to implement in parallel
- After every change session, update this CLAUDE.md with new learnings, patterns, gotchas, and architecture changes before committing
- Commit only, wait for Alan to say "push" — Netlify auto-builds (20 deploys/month)
- Test mobile AND desktop after CSS changes

## Self-Improvement Rule
After completing a task that took 8+ tool calls, append ONE optimization hint as a comment at the end of your response. Format: "💡 Optimization: [one sentence - reusable skill, memory pattern, or workflow fix]". Skip if the task was exploratory.

## Tech Stack
- Next.js 15 + Tailwind + Prisma (PostgreSQL) + Clerk auth
- Resume builder SaaS for Kurdish/Arabic speakers — RTL is critical
- A4 target: `width: 794px` (210mm at 96dpi), default `padding: 60px`
- A4 page height: `1123px` (297mm at 96dpi), content per page: `1043px` (1123 - 40px top - 40px bottom)

## Architecture Overview

### Template System
- **Registry** (`src/components/html-templates/registry.tsx`): Maps template IDs to `{ id, name, component }` entries
- **Current templates**: `placeholder` (fallback), `modern` (Modern Professional — dark sidebar + yellow accent), `elegant` (Elegant Dark — both columns dark + gold accents), `bold` (Bold Creative — dark sidebar + white main, skill bars, HELLO greeting), `developer` (Developer — dark IDE theme with green syntax accents), `creative` (Creative — deep indigo sidebar #2D2B55 + coral accent strip, SVG circular skill rings, colored progress bars for languages, multi-color card system: coral=experience, yellow=education, mint=projects, lavender=certifications, diamond dividers)
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
5. **REQUIRED**: Create thumbnail SVG at `public/thumbnails/{id}.svg` (300×400 viewBox) — must match the template's actual colors, layout, and accent elements. TemplateSwitcher loads these via `<img src={/thumbnails/${id}.svg}>` into 72×96 boxes

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

### Mandatory Template Rules (ALL templates)

**Dimensions**: `width: '794px'`, NO `minHeight` on root container

**Font**: `fontFamily: 'system-ui, -apple-system, sans-serif'` (PDF pipeline injects Inter + Noto Sans Arabic)

**RTL Support** (MANDATORY):
```js
// Detect: use isRTLText() from '@/lib/rtl' — never duplicate the regex
// Root: direction: isRtl ? 'rtl' : 'ltr'
// Text blocks: textAlign: isRtl ? 'right' : 'left'
// Flex containers: use flexDirection: 'row' (NOT 'row-reverse' for RTL!)
//   — direction: rtl on root already reverses flex row order
//   — adding row-reverse DOUBLE-REVERSES back to LTR layout
// Contact/URLs: <span style={{ unicodeBidi: 'isolate' }}> inside direction:'ltr', unicodeBidi:'plaintext' container
// Line-height: increase for RTL (1.5-1.8 vs 1.3-1.5 LTR)
```

**Page Break CSS** (include via `<style>` in template):
```css
.resume-entry { break-inside: avoid; page-break-inside: avoid; }
.resume-section h2 { break-after: avoid; page-break-after: avoid; }
```

**resume-entry granularity** (CRITICAL — gets page breaks right the first time):
- `className="resume-entry"` goes on the **smallest atomic item** that shouldn't be split: one experience entry, one skill line, one contact field, one demographic field, one language line
- NEVER put `resume-entry` on a section wrapper that contains multiple items — the break algorithm will push the entire section to the next page, wasting space
- `className="resume-section"` goes on the outer section container (Experience, Education, etc.) — its `h2` gets `break-after: avoid` to stay with content

**List Styles** (Tailwind strips bullets, include via `<style>`):
```css
.resume-desc ul, .resume-desc ol { list-style: disc; padding-left: 1.2em; margin: 4px 0; }
.resume-desc ol { list-style: decimal; }
[dir="rtl"] .resume-desc ul, [dir="rtl"] .resume-desc ol { padding-left: 0; padding-right: 1.2em; }
```

**Rich text**: `dangerouslySetInnerHTML={{ __html: description }}` with `className="resume-desc"`

**Watermark**: `{watermark && <Watermark />}` — import from shared components

### Two-Column Template Checklist (sidebar + main content)

Follow this EXACTLY to avoid the multi-iteration mistakes made on ModernTemplate:

**1. Sidebar background (PDF — edge-to-edge on every page)**:
```jsx
// In <style> tag:
.sidebar-bg { display: none; }
@media print {
  .sidebar-bg {
    display: block !important;
    position: fixed !important;
    top: 0 !important; bottom: 0 !important;
    ${isRtl ? 'right' : 'left'}: 0;
    width: ${SIDEBAR_WIDTH}px;
    background-color: ${SIDEBAR_BG};
    z-index: 0;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
}
// Then render: <div className="sidebar-bg" />
```

**2. Sidebar background (Preview — `--resume-page-bg` variable)**:
```jsx
// On root div, use percentage-based gradient stops (scales with page card):
'--resume-page-bg': isRtl
  ? `linear-gradient(to left, ${ACCENT} 0.756%, ${SIDEBAR_BG} 0.756%, ${SIDEBAR_BG} 35.265%, #ffffff 35.265%)`
  : `linear-gradient(to right, ${ACCENT} 0.756%, ${SIDEBAR_BG} 0.756%, ${SIDEBAR_BG} 35.265%, #ffffff 35.265%)`
// Calculate percentages: accentWidth / 794 * 100, sidebarWidth / 794 * 100
```

**3. Per-page content padding (`box-decoration-break: clone`)**:
```jsx
// On BOTH sidebar and main content divs:
{ padding: '40px 24px', WebkitBoxDecorationBreak: 'clone' as const, boxDecorationBreak: 'clone' as const }
// This repeats padding on every page fragment — no content touching page edges
```

**4. Page break classes (granular — one per atomic item)**:
```jsx
// Section wrapper (Experience, Education, etc.):
<div className="resume-section" style={{ marginBottom: 24 }}>
  <MainSectionTitle>Experience</MainSectionTitle>
  {data.experience.map(exp => (
    <div key={exp.id} className="resume-entry" style={{ marginBottom: 16 }}>  // ← each entry
      ...
    </div>
  ))}
</div>

// Sidebar items — EACH field is its own resume-entry:
<div style={{ marginBottom: 24 }}>  // ← section wrapper has NO resume-entry
  <SidebarSectionTitle>Contact</SidebarSectionTitle>
  {data.personal.email && (
    <div className="resume-entry" style={{ marginBottom: 10 }}>  // ← individual field
      <div>Email</div>
      <div>{data.personal.email}</div>
    </div>
  )}
  // ... same for phone, location, etc.
</div>
```

**5. Flex layout with RTL**:
```jsx
// IMPORTANT: use flexDirection: 'row' — NOT 'row-reverse' for RTL!
// The root div's direction: rtl already reverses flex row order.
// Using row-reverse + direction:rtl = double-reversal = sidebar stays on LEFT (wrong!)
<div style={{ display: 'flex', flexDirection: 'row', position: 'relative', zIndex: 1 }}>
  <div style={{ width: SIDEBAR_WIDTH, ... }}>  {/* sidebar — auto-flips to right in RTL */}
  <div style={{ flex: 1, ... }}>                {/* main content */}
</div>
// Same for section title flex containers — just use flexDirection: 'row'
```

**6. DO NOT**:
- Add `@page` rules in template CSS (handled by `renderHtml.ts`)
- Add `minHeight` on root container (breaks page count)
- Use `html { background }` for print backgrounds (Chromium doesn't propagate to page canvas)
- Remove `@page { margin: 0 }` from renderHtml.ts (clips `position: fixed` elements)
- Wrap entire sidebar sections in `resume-entry` (causes cascading break algorithm to waste space)
- Assume page break convergence works the same for sidebar and main content — sidebar entries are dense and cascade badly; ResumePageScaler skips them in Phase 2 re-convergence
- Use `flexDirection: isRtl ? 'row-reverse' : 'row'` — the root `direction: rtl` already reverses flex rows, so `row-reverse` double-reverses back to LTR
- Duplicate RTL detection regex — always import `isRTLText` from `@/lib/rtl`
- Skip creating a thumbnail SVG — every template MUST have `public/thumbnails/{id}.svg` (300×400) with accurate colors/layout

## PDF Pipeline
- `renderHtml.ts`: React SSR → full HTML document with embedded fonts (Inter LTR + Noto Sans Arabic RTL via base64)
- `generatePdf.ts`: Puppeteer (`puppeteer-core`) → A4 PDF; waits for `document.fonts.ready`
- Page margins: `@page { size: A4; margin: 0; }` in `renderHtml.ts` — zero margin so `position: fixed` backgrounds extend edge-to-edge
- Content spacing handled by template padding + `box-decoration-break: clone` on sidebar/main divs — padding repeats on every page fragment (Chrome 130+)
- Puppeteer `margin: { top: 40px, bottom: 40px }` in `generatePdf.ts` — overridden by @page but kept as fallback
- Templates must NOT add their own `@page` margin overrides
- For two-column templates with sidebar backgrounds: use `position: fixed` div in `@media print` (repeats every page with @page margin:0). Preview uses `--resume-page-bg` CSS variable read by ResumePageScaler.
- Preview pagination: `ResumePageScaler.tsx` measures content, calculates page breaks matching Puppeteer output

## Resume Duplicate Feature
- **`duplicateResume()`** in `db.ts`: Takes `resumeId`, `userId`, `clerkId` — checks limits, copies resume + all sections atomically via `$transaction`, increments `resumeCount`
- **API**: POST `/api/resumes/[id]/duplicate` — returns new resume; 403 if limit reached, 404 if not found
- **Dashboard**: Copy button (blue) between Edit and Delete icons, `duplicatingId` state pattern mirrors `deletingId`
- **Template fallback**: If user's plan can't access the original's template, copy uses `'modern'`
- **i18n keys**: `pages.dashboard.resumes.actions.duplicateResume`, `pages.dashboard.resumes.messages.duplicateSuccess`, `pages.dashboard.resumes.messages.duplicateLimitReached`

## Key Patterns & Gotchas
- **Prisma Json fields**: Pass arrays directly (`proTemplates: ['modern']`), never `JSON.stringify()` — causes double-encoding
- **PRO template access**: `checkUserLimits` always includes all `getTemplateIds()` for PRO, regardless of DB settings
- **Export tracking**: Only `action: 'download'` increments `exportCount`; preview doesn't count
- **Two getSystemSettings()**: Private one in `db.ts` (parses JSON arrays, used by `checkUserLimits`) and exported one in `system-settings.ts` (raw Prisma result, used by admin API)
- **Subscription expiry**: Manual via admin button, not scheduled — downgrades to FREE, preserves usage counts
- **Auto-save refs pattern**: `formDataRef`, `resumeIdRef`, `templateRef` — prevents stale closures in debounced saves
- Buttons without `type="button"` cause page refresh
- `minHeight: 1123px` on template root causes wrong page count (remove it)
- `@page { margin: X }` clips `position: fixed` elements — must use `@page { margin: 0 }` (see Two-Column Checklist)
- `html { background }` does NOT propagate to print page canvas in Chromium — don't try it, use `position: fixed` instead
- **Preview break algorithm** (`ResumePageScaler.tsx`): Column-aware 2-phase approach:
  - Phase 1: Converge ALL entries (sidebar + main) — stable base break
  - Phase 2: Fix heading orphans (heading on page but `firstEntryTop >= adjustedEnd`), re-converge ONLY main-content entries (skip sidebar via `isSidebar` flag)
  - `isSidebar` determined by horizontal center position < 40% of content width
  - **Why column-aware**: Sidebar entries (e.g., skill rings) are densely packed → cascading re-convergence pushes break far back, wasting page space. Skipping sidebar in Phase 2 prevents this cascade while keeping main content sections grouped with their headings
- Mixed LTR/RTL text garbles → use `unicode-bidi: isolate` spans
- AI max_tokens 200 cuts Kurdish text → use 500+ (Kurdish uses more tokens/word)
- Mobile toolbar → flex-wrap, smaller icons (no horizontal scroll)
- **Hydration**: Never use `new Date()`, `Date.now()`, or `Math.random()` in `useState` initializers — they differ server vs client. Use empty default + `useEffect` to set client-only values
- **Dev mobile testing (WSL)**: Access via `http://<WSL_IP>:3000`. Requires `allowedDevOrigins` in `next.config.js` for Next.js 15.3+ (validates Host header). Chunk load errors → `error.tsx` auto-reloads on `ChunkLoadError`

## ATS Feature
- **Routes**: `src/app/api/ats/score/route.ts` and `src/app/api/ats/keywords/route.ts`
- **Rate limited**: 10 requests/60s per IP, uses `rateLimit()` from `@/lib/rate-limit`
- **Atomic limit enforcement**: Uses `prisma.subscription.updateMany` with `where: { atsUsageCount: { lt: limit } }` to prevent race conditions — if `result.count === 0`, limit was reached concurrently
- **Unlimited plans** (`atsLimit === -1`): Just increment normally, skip atomic check
- **Error sanitization**: API routes never expose `error.message` to client — always generic messages
- **Max job description**: 10,000 characters (keywords route only)
- **i18n keys**: `pages.resumeBuilder.ats.*` — ~40 keys covering title, tabs, score, keywords, importance badges, upgrade, toasts
- **Frontend**: `ATSOptimization.tsx` — `useLanguage()` for `t()` and `isRTL`, `dir` attribute on modal root, `rotate-180` on ArrowRight icons for RTL, logical margins (`me-2` not `mr-2`)
- **Header button**: `BuilderHeader.tsx` — `ScanSearch` icon + always-visible "ATS" label (emerald color accent to distinguish from gray ghost buttons), uses `t('pages.resumeBuilder.actions.ats')` for label
- **AI prompts**: Multilingual awareness (English/Arabic/Kurdish), semantic keyword matching across languages, don't penalize non-English resumes

## File Map
```
src/components/html-templates/
  registry.tsx                 # Template registry + getHtmlTemplate()
  PlaceholderTemplate.tsx      # Fallback single-column template
  ModernTemplate.tsx           # Dark sidebar + yellow accent two-column
  ElegantTemplate.tsx          # Both-dark columns + gold accents two-column
  BoldTemplate.tsx             # Dark sidebar + white main, skill bars, HELLO greeting
  DeveloperTemplate.tsx          # Dark IDE theme with syntax highlighting accents
  CreativeTemplate.tsx           # Deep indigo sidebar, circular skill rings, progress bars, multi-color cards
  TemplateRenderer.tsx         # Wrapper: looks up registry, renders component
  ResumePageScaler.tsx         # Browser preview with page break simulation
  shared/                     # Reusable template building blocks (13 components)

src/lib/
  templates.ts                # Template metadata (getAllTemplates, getTemplateIds, getTemplateTier)
  template-config.ts          # Per-template crop configs for profile photos
  db.ts                       # getCurrentUser, checkUserLimits, duplicateResume (private getSystemSettings)
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
  resumes/[id]/duplicate/     # POST: duplicate resume (checks limits + template fallback)
  admin/settings/             # GET/POST: system settings (requires admin)
  admin/stats/                # GET: platform metrics
  admin/users/                # GET: user listing; [userId]/upgrade POST
  subscriptions/check-expired/# GET: status; POST: process expired
  ats/score/                  # POST: ATS score analysis (rate limited, atomic limits)
  ats/keywords/               # POST: keyword matching (rate limited, atomic limits, 10K max)
  user/subscription-data/     # GET: subscription + permissions for client context
```
