# work.krd — Architecture

## Template System
- **Registry** (`src/components/html-templates/registry.tsx`): Maps template IDs to `{ id, name, component }` entries
- **Current templates**: `placeholder` (fallback), `modern` (Modern Professional — dark sidebar + yellow accent), `elegant` (Elegant Dark — both columns dark + gold accents), `bold` (Bold Creative — dark sidebar + white main, skill bars, HELLO greeting), `developer` (Developer — dark IDE theme with green syntax accents), `creative` (Creative — deep indigo sidebar #2D2B55 + coral accent strip, SVG circular skill rings, colored progress bars for languages, multi-color card system: coral=experience, yellow=education, mint=projects, lavender=certifications, diamond dividers)
- **Shared components** in `src/components/html-templates/shared/`: ResumeHeader, ContactInfo, ProfilePhoto, SectionTitle, ExperienceSection, EducationSection, SkillsSection, LanguagesSection, ProjectsSection, CertificationsSection, Watermark
- **Metadata** (`src/lib/templates.ts`): `getAllTemplates()`, `getTemplateIds()`, `getTemplateTier()`
- **Crop configs** (`src/lib/template-config.ts`): Per-template profile photo crop settings

## Resume Builder (3-Column Layout)
- **Page**: `src/app/resume-builder/page.tsx` — Desktop: sidebar icons + form + live preview; Mobile: single-column + FAB
- **6 Sections**: About You → Summary → Experience → Education → Skills & Languages → Additional (Projects + Certifications)
- **Auto-save**: `useAutoSave.ts` — refs pattern (avoids stale closures), 1s debounce, always full saves (not patches)
- **Download**: `useDownloadPDF.ts` → POST `/api/pdf/generate` with `action: 'download'`; 403 → opens `/billing`
- **Template switcher**: Popover in preview panel, checks `availableTemplates` from SubscriptionContext

## Subscription & Limits
- **Plans**: FREE, BASIC, PRO — limits in `SystemSettings` DB table (singleton row)
- **`-1` = unlimited** for PRO defaults (resumes, AI, exports, imports, ATS)
- **`checkUserLimits()`** in `db.ts`: Server-side gate for all features, PRO always gets all registered templates
- **SubscriptionContext** (`src/contexts/SubscriptionContext.tsx`): Client-side provider, fetches from `/api/user/subscription-data`
- **Template access**: `freeTemplates`, `basicTemplates`, `proTemplates` arrays in SystemSettings (Prisma Json fields — pass arrays directly, never JSON.stringify)

## Admin Dashboard
- **Components** in `src/components/admin/`: AdminDashboard, AdminStatsCards, AdminSubscriptionStatus, AdminSystemSettings, AdminQuickActions, UserManagement, ResumeManagement, PaymentItem, PaymentList, PaymentApprovalForm, AdminAnalytics, DeleteConfirmModal, AuditLogPanel, AdminErrorBoundary, AdminThemeToggle
- **Layout**: `src/app/admin/layout.tsx` — wraps all admin pages with skip-to-content link, theme toggle (fixed top-right), flash prevention script (reads localStorage synchronously before paint)
- **Dark mode**: `darkMode: 'class'` in tailwind.config.js. `AdminThemeToggle` toggles `.dark` on `<html>`, persists to `localStorage('admin-theme')`. shadcn components (Card, Button, Input, Badge) auto-adapt via CSS variables in globals.css `.dark` block. Non-shadcn elements need manual `dark:` variants (bg-gray-50→dark:bg-gray-900, text-gray-900→dark:text-gray-100, border-gray-200→dark:border-gray-700)
- **Settings API**: GET/POST `/api/admin/settings` — singleton SystemSettings record, POST validated with Zod schema (partial updates supported). Auto-snapshots settings before each save (last 5 kept)
- **Settings history**: GET/POST `/api/admin/settings/history` — list last 5 snapshots / revert to a snapshot. `SettingsSnapshot` Prisma model stores JSON data + savedBy + createdAt
- **Settings cache**: `getSystemSettings()` has 5-min TTL in-memory cache, invalidated by `invalidateSettingsCache()` on POST save
- **Analytics**: GET `/api/admin/analytics` — 12-month time-series via raw SQL (signups, revenue, active users, resumes). `AdminAnalytics` component renders 4 Recharts charts (2 line + 2 bar)
- **Subscription check**: GET (status) / POST (process expired → downgrade to FREE) `/api/subscriptions/check-expired`
- **Stats API**: Revenue uses dynamic `proPlanPrice` from SystemSettings (not hardcoded)
- **Payment review**: Approve/reject inside `$transaction` with PENDING check (race-condition safe), note max 1000 chars. Refund button on APPROVED payments (POST `/api/admin/payments/[id]/refund`) marks as REFUNDED + downgrades user to FREE
- **PaymentStatus enum**: PENDING, APPROVED, REJECTED, REFUNDED — PaymentList has filter tabs for all 4 statuses + date range filter (dateFrom/dateTo)
- **Dashboard data loading**: Uses `Promise.allSettled()` for parallel fetch of stats + settings + subscription status, with per-section error state UI + retry
- **Dashboard flow**: Stats Cards → Analytics → Subscription Status → System Settings → Quick Actions → Recently Viewed → Audit Log
- **Keyboard shortcuts**: `/` focuses search, `?` toggles shortcuts help panel (AdminDashboard). Escape closes modals (UserManagement, PaymentApprovalForm, DeleteConfirmModal)
- **Recently viewed**: `useRecentlyViewed` hook (`src/hooks/useRecentlyViewed.ts`) — localStorage-based, tracks last 10 admin items (users/resumes/payments), shown in AdminDashboard
- **AdminSystemSettings**: Dirty state tracking, "Saved!" toast on success (auto-dismiss 3s), history panel with restore buttons, tooltip hints on limit inputs (`cursor-help`)
- **AdminStatsCards**: Loading skeleton with animated pulse bars (including sub-stats for Payments card)
- **UserManagement**: Server-side pagination (20/page), search (debounced 500ms), plan filter (FREE/PRO), date range filter, bulk actions (upgrade/downgrade/delete), CSV export — uses `Pagination` component from `@/components/ui/Pagination`
- **AuditLogPanel**: Server-side pagination (20/page), action type filter (8 actions), date range filter, CSV export. API at `/api/admin/audit-log` supports `?action=&dateFrom=&dateTo=&page=&limit=`
- **ResumeTable**: Sortable column headers (opt-in via `sortBy`/`sortOrder`/`onSort` props, defaults to client-side sort). Column visibility toggle dropdown (Columns3 icon). API already supports `sortBy` + `sortOrder` query params
- **DeleteConfirmModal**: Reusable modal with warning icon, item details, "cannot be undone" text, red delete button, Escape key, focus-on-cancel. Used by ResumeManagement AND Dashboard (replaces both native `confirm()` and toast-based delete)
- **All admin lists use server-side pagination**: Users (20/page), Payments (20/page), Resumes (10/page) — all APIs return `hasNextPage`/`hasPrevPage` in response
- **Pagination constants**: `ADMIN_PAGINATION` in `src/lib/constants.ts` — `{ PAYMENTS: 20, RESUMES: 10, USERS: 20, AUDIT_LOGS: 20, MAX_LIMIT: 100 }`
- **CSV export pattern**: Build CSV string with proper escaping (double quotes), create Blob, trigger download via temporary anchor element. Used in UserManagement and AuditLogPanel

## Onboarding Wizard
- **3-step flow**: Welcome+Name → Template Picker → Upload CV or Start from Scratch
- **Guard logic**: Dashboard checks `resumeCount === 0` + `onboardingCompleted === false` → redirects to `/onboarding`. Onboarding page checks if already completed → redirects to `/dashboard`
- **Clerk webhook race**: The onboarding-status API returns `userNotFound: true` if the webhook hasn't created the DB user yet — the page retries after 2s
- **Routing**: `signUpForceRedirectUrl="/onboarding"` in layout.tsx, `signInForceRedirectUrl="/dashboard"` (existing users go to dashboard)
- **Template picker**: Uses SVG thumbnails from `public/thumbnails/{id}.svg` rendered large (no subscription gating during onboarding)
- **Upload flow**: Reuses existing `/api/resume/upload` endpoint. Free users get 1 import (`maxFreeImports: 1`)
- **Onboarding-complete API**: Creates resume via `createResume()`, optionally populates sections from CV data in a `$transaction`, sets `user.onboardingCompleted = true`
- **Skip**: Sets `onboardingCompleted = true` without creating a resume — user goes to dashboard and never sees onboarding again
- **i18n keys**: `pages.onboarding.*` in all 3 locales (en, ar, ckb) — ~15 keys covering all 3 steps + errors
- **Mobile-first**: Full-width cards, stacked vertically, `max-w-lg` for steps 1/3, `max-w-4xl` for step 2 (template grid)

## Landing Page
- **Components** in `src/components/landing/`: header, hero, stats-bar, tools-section, template-carousel, ai-features, logos-bar, testimonials, faq, pricing, final-cta, footer. **Retired but kept**: templates.tsx, how-it-works.tsx, features.tsx
- **Page structure** (`src/app/page.tsx`): Header → Hero → StatsBar → ToolsSection → TemplateCarousel → AIFeatures → LogosBar → Testimonials → Pricing → FAQ → FinalCTA → Footer
- **Hero (redesigned)**: Two-column layout — left: headline with blue-highlighted phrase (titleBefore + titleHighlight + titleAfter), subtitle, dual CTAs (Create my resume + Upload my resume), trust indicators (trustStat + user count). Right: floating resume card (modern.svg) with 4 absolutely-positioned animated badges (Resume Score SVG ring, ATS Perfect pill, Skills card, AI Coach bar). Badges fade in with staggered delays + `animate-float` (3s infinite). Skills + AI Coach hidden on mobile (`hidden sm:block`)
- **StatsBar**: `src/components/landing/stats-bar.tsx` — animated counter (useCountUp hook) + 4 feature cards. Fetches resumeCount from `/api/stats/public`. Counter uses IntersectionObserver-triggered rAF animation with ease-out-cubic. `Intl.NumberFormat` handles Eastern Arabic numerals for AR/CKB
- **useCountUp hook**: `src/hooks/useCountUp.ts` — takes target number + options (duration, locale, enabled). Returns `{ ref, displayValue }`. CKB locale maps to 'ar' for Intl. Server-renders "0" (no hydration mismatch)
- **ToolsSection**: `tools-section.tsx` — Tabbed "Every tool you need" section. 4 tabs (Resume Builder, Multilingual, ATS Templates, AI Assistance). Desktop: left sidebar tabs + right content area. Mobile: horizontal scrollable tab pills. Active tab has blue left/right border (RTL-aware). Content fades in via `@keyframes fadeIn` (injected `<style>` tag). Each tab: icon, title, description, 3 checkmark feature bullets
- **TemplateCarousel**: `template-carousel.tsx` — Dark background (`bg-gray-900`) horizontal scrolling carousel. 6 template thumbnails (modern, elegant, bold, developer, creative, basic). Scroll-snap, left/right arrow navigation (hidden on mobile), scrollbar hidden via CSS. CTA button (Browse all templates) with Clerk SignUpButton/Link pattern. RTL: arrow positions swap, scroll direction auto-reverses
- **AIFeatures**: `ai-features.tsx` — "Way beyond a resume builder" 3-card grid. Cards: Step-by-step Guidance (Compass), AI Writes for You (Sparkles), Job Description Matching (Link2). Light gray bg, hover shadow/lift
- **LogosBar**: `logos-bar.tsx` — Trust indicator bar with 6 icon+label badges (SSL Secured, Data Protected, Top Rated, 1000+ Users, 3 Languages, ATS Verified). Muted gray icons/text, border-y separator
- **Testimonials**: `testimonials.tsx` — 3 review cards (Aram K./Sara M./Dara H.) with 5-star ratings, quote text, colored avatar initials. Kurdish-appropriate names
- **FAQ**: `faq.tsx` — 6-item accordion (Is it free? / Languages? / What is ATS? / PDF download? / AI? / Data security?). `grid-rows-[1fr]/[0fr]` animation trick for smooth expand. Multiple items can be open. ChevronDown rotates 180deg
- **Retired sections**: templates.tsx, how-it-works.tsx, features.tsx — files kept but no longer imported in page.tsx
- **Pricing**: Free vs Pro (5,000 IQD/month) cards, Pro highlighted with "Most Popular" badge
- **FinalCTA**: Blue gradient section with "Ready to Land Your Dream Job?" + CTA button
- **Footer**: Minimal — logo text, tagline, privacy/terms links, language switcher, copyright
- **Scroll animations**: CSS `transition-all` + IntersectionObserver (no framer-motion), staggered delays via `transitionDelay`
- **Public stats API** (`/api/stats/public`): No auth required, returns `{ resumeCount, userCount }`, 5min `s-maxage` cache
- **Header**: Sticky, transparent→white on scroll, language switcher dropdown, Clerk auth buttons, mobile hamburger menu
- **RTL**: Arrow icons flip via `isRTL ? 'rotate-180' : ''`, language dropdown positioned with `isRTL ? 'left-0' : 'right-0'`, floating cards position swaps
- **Tailwind `animate-float`**: Custom keyframe in `tailwind.config.js` — `translateY(-6px)` 3s ease-in-out infinite, used by hero floating badges
- **No framer-motion** — all animations are pure CSS transitions + IntersectionObserver

## ATS Feature
- **Shared utilities**: `src/lib/ats-utils.ts` — `stripHtml()`, `buildResumeText()`, Zod `resumeDataSchema`, `ATS_AI_CONFIG` (env vars), `withTimeout()`, `ATS_SCORE_THRESHOLDS`, `MAX_REQUEST_SIZE`
- **Routes**: `src/app/api/ats/score/route.ts` and `src/app/api/ats/keywords/route.ts`
- **Rate limited**: 10 requests/60s per userId+IP (authenticated), uses `rateLimit()` from `@/lib/rate-limit`
- **Atomic limit enforcement**: Increment happens BEFORE AI call — prevents wasted API calls on race conditions. Uses `prisma.subscription.updateMany` with `where: { atsUsageCount: { lt: limit } }` — if `result.count === 0`, limit was reached concurrently
- **Unlimited plans** (`atsLimit === -1`): Just increment normally, skip atomic check
- **Zod validation**: Both routes validate `resumeData` shape via `resumeDataSchema.safeParse()` before processing
- **Request size limit**: 1MB max (checked via Content-Length header)
- **AI timeout**: 30s default via `Promise.race` wrapper (`withTimeout()`), configurable via `ATS_AI_TIMEOUT_MS` env var
- **Error sanitization**: API routes never expose `error.message` to client — always generic messages. `console.error` in catch blocks for server-side logging
- **Max job description**: 10,000 characters (keywords route only)
- **AI config env vars**: `ATS_AI_MODEL`, `ATS_AI_TEMPERATURE`, `ATS_SCORE_MAX_TOKENS`, `ATS_KEYWORDS_MAX_TOKENS`, `ATS_AI_TIMEOUT_MS`
- **i18n keys**: `pages.resumeBuilder.ats.*` — ~40 keys covering title, tabs, score, keywords, importance badges, upgrade, toasts. NO duplicate keys at `resumeBuilder.ats.*` (removed)
- **Frontend**: Split into 3 files:
  - `ATSOptimization.tsx` — Modal wrapper with accessibility (aria-modal, escape key, focus trap), usage update callback, client-side result caching (invalidates on resume change)
  - `ats/ScoreTab.tsx` — Score analysis tab with loading skeleton, score color constants from `ATS_SCORE_THRESHOLDS`
  - `ats/KeywordsTab.tsx` — Keyword matching tab with loading skeleton, default importance badge case, label/htmlFor association
- **Usage update**: `onUsageUpdate` callback prop → `refreshSubscription()` in page.tsx — keeps subtitle count fresh after each analysis
- **General issues**: Edit CTA disabled for `section: "general"` items (no misleading navigation)
- **Header button**: `BuilderHeader.tsx` — `ScanSearch` icon + always-visible "ATS" label (emerald color accent to distinguish from gray ghost buttons), uses `t('pages.resumeBuilder.actions.ats')` for label
- **AI prompts**: Multilingual awareness (English/Arabic/Kurdish), semantic keyword matching across languages, don't penalize non-English resumes. Score prompt has calibration ranges (90-100/70-89/50-69/<50), optional `targetRole` param, keyword density criterion. Keywords prompt sends ALL resume sections (not just 4), has importance categorization rules (critical/important/nice-to-have)

## Completion Progress Bar
- **Component**: `src/components/resume-builder/layout/CompletionProgressBar.tsx`
- **Placement**: Between header and main content in `BuilderShell` (new `progressBar` slot)
- **Calculation**: Average of 6 section completions from `useSectionCompletion` hook (0-100%)
- **Color thresholds**: <30% red, 30-69% amber, 70-99% blue, 100% green (text + bar gradient)
- **Encouraging messages**: 5 tiers (0%, 1-29%, 30-69%, 70-99%, 100%) via i18n keys `pages.resumeBuilder.completion.*`
- **Section dots**: Desktop only (`hidden sm:flex`), clickable, ring on active section — redundant with mobile bottom nav dots
- **Mobile**: Compact view (percentage + bar only), text/dots hidden
- **i18n keys**: `pages.resumeBuilder.completion.{label,getStarted,goodStart,gettingThere,almostDone,complete}` in en/ar/ckb

## Quick-Start Resume Templates
- **Data**: `src/lib/quick-start-templates.ts` — 5 role-based pre-filled resume data sets
- **Templates**: `software-engineer`, `marketing-sales`, `fresh-graduate`, `business-management`, `creative-design`
- **Picker UI**: `src/components/resume-builder/QuickStartPicker.tsx` — modal with accessible focus trap, i18n, mobile-responsive grid
- **Integration points**:
  - **Onboarding step 3**: Third card "Start from template" alongside Upload CV and Start from scratch → opens QuickStartPicker → submits formData to onboarding-complete API
  - **Resume builder**: Auto-shows QuickStartPicker when creating a new resume (no URL `id` param) → populates form data + triggers auto-save
- **Data merging**: Template data's `fullName` is always overridden with the user's actual name
- **IDs**: All template item IDs use `qs_` prefix (e.g., `qs_se_exp_1`) to avoid conflicts
- **i18n keys**: `pages.resumeBuilder.quickStart.*` (title, subtitle, startBlank, templates.{id}.name/description) + `pages.onboarding.step3.templateCard.*` in en/ar/ckb
- **Template content**: English only (users will replace with their own info)

## Manual Payment System (FIB)
- **Flow**: User selects plan → `/billing/payment-instructions?plan=pro` → 4-step wizard (plan details → FIB transfer instructions → screenshot upload → success) → `/api/payments/submit` → Telegram notification → admin reviews at `/admin/payments`
- **DB model**: `Payment` table with `Bytes` field for screenshot binary storage, `PaymentStatus` enum (PENDING/APPROVED/REJECTED)
- **Telegram notification**: Non-blocking `sendPhoto` via Bot API; env vars `TELEGRAM_BOT_TOKEN` + `TELEGRAM_ADMIN_CHAT_ID`
- **Admin review**: GET `/api/admin/payments/[id]/review` returns base64 screenshot data URL; POST approve (atomic `$transaction`: update payment + upsert subscription with 30-day endDate) or reject
- **Payment status API**: GET `/api/payments/status` returns `{ payments: [...] }` array sorted by createdAt desc; billing page extracts latest payment for banner
- **Duplicate payment guard**: Submit API checks for existing PENDING payment before creating new one
- **Subscription upgrade on approve**: Upsert subscription with `plan`, `paymentMethod: 'FIB'`, `paymentId`, 30-day `endDate`
- **i18n keys**: `billing.pay.*` (payment instructions page), `billing.pay.wizard.*` (wizard step titles/subtitles/nav), `billing.paymentStatus.*` (billing page banners), `billing.howItWorks.*`, `billing.freePlan.feature1-5`, `billing.proPlan.feature1-8`
- **Payment wizard**: 4-step onboarding-style flow with ProgressDots, fade transitions (goToStep pattern from onboarding page), mobile-first (max-w-lg, h-12 buttons)
- **Phone number**: `0750 491 0348` (Alan Ahmed) — NO QR code (removed `qrcode.react` dependency)
- **Screenshot storage**: `Bytes` field in Prisma = `Buffer` in Node.js; convert to base64 data URL for admin preview
- **Gotcha**: `perMonth` locale values must NOT include leading `/` — the code adds it: `/{t('billing.proPlan.perMonth')}`

## Resume Duplicate Feature
- **`duplicateResume()`** in `db.ts`: Takes `resumeId`, `userId`, `clerkId` — checks limits, copies resume + all sections atomically via `$transaction`, increments `resumeCount`
- **API**: POST `/api/resumes/[id]/duplicate` — returns new resume; 403 if limit reached, 404 if not found
- **Dashboard**: Copy button (blue) between Edit and Delete icons, `duplicatingId` state pattern mirrors `deletingId`
- **Template fallback**: If user's plan can't access the original's template, copy uses `'modern'`
- **i18n keys**: `pages.dashboard.resumes.actions.duplicateResume`, `pages.dashboard.resumes.messages.duplicateSuccess`, `pages.dashboard.resumes.messages.duplicateLimitReached`

## File Map
```
src/components/html-templates/
  registry.tsx                 # Template registry + getHtmlTemplate()
  PlaceholderTemplate.tsx      # Fallback single-column template
  ModernTemplate.tsx           # Dark sidebar + yellow accent two-column
  ElegantTemplate.tsx          # Both-dark columns + gold accents two-column
  BoldTemplate.tsx             # Dark sidebar + white main, skill bars, HELLO greeting
  DeveloperTemplate.tsx        # Dark IDE theme with syntax highlighting accents
  CreativeTemplate.tsx         # Deep indigo sidebar, circular skill rings, progress bars, multi-color cards
  TemplateRenderer.tsx         # Wrapper: looks up registry, renders component
  ResumePageScaler.tsx         # Browser preview with page break simulation
  shared/                      # Reusable template building blocks (13 components)

src/lib/
  templates.ts                # Template metadata (getAllTemplates, getTemplateIds, getTemplateTier)
  template-config.ts          # Per-template crop configs for profile photos
  constants.ts                # Plan names, default limits, ADMIN_PAGINATION, subscription duration
  admin-utils.ts              # formatAdminDate, formatAdminDateFull, devError — shared admin utilities
  db.ts                       # getCurrentUser, checkUserLimits, duplicateResume (private getSystemSettings)
  system-settings.ts          # getSystemSettings (cached, 60s TTL), updateSystemSettings, invalidateSettingsCache
  rtl.ts                      # isRTLText(), isResumeRTL() — Arabic/Kurdish detection
  ats-utils.ts                # Shared ATS utilities: stripHtml, buildResumeText, Zod schema, AI config, timeout
  quick-start-templates.ts    # 5 role-based pre-filled resume data for quick-start feature
  json-utils.ts               # parseJsonArray() — shared JSON array parsing for Prisma Json fields
  env-validation.ts           # validateEnvVars() — startup check for required env vars
  resume-upload-utils.ts      # Extracted upload utilities: date conversion, language/skill normalization, JSON cleaning
  pdf/fontData.ts             # getBase64Fonts() (Arabic) + getInterBase64Fonts() (LTR) — cached base64 font loading
  pdf/renderHtml.ts           # React SSR → HTML with ALL fonts embedded as base64 (no CDN)
  pdf/generatePdf.ts          # Puppeteer HTML → PDF buffer

src/components/resume-builder/
  page.tsx                    # Main builder (3-column desktop, mobile responsive)
  ATSOptimization.tsx         # ATS modal wrapper (accessibility, caching, usage callback)
  QuickStartPicker.tsx        # Role-based template picker modal (5 templates, focus trap, i18n)
  ats/ScoreTab.tsx            # Score analysis tab (loading skeleton, score thresholds)
  ats/KeywordsTab.tsx         # Keyword matching tab (loading skeleton, importance badges)
  form/                       # 6 section components + FormSectionRenderer
  preview/                    # LivePreviewPanel, TemplateSwitcher, MobilePreviewSheet
  layout/CompletionProgressBar.tsx  # Overall resume completion bar (avg of 6 sections, color-coded, i18n)

src/components/admin/         # AdminDashboard + sub-components (stats, settings, users, resumes, payments)
  AdminAnalytics.tsx          # 4 Recharts charts (signups line, revenue bar, active users line, resumes bar)
  AdminErrorBoundary.tsx      # Error boundary wrapper for each admin section
  DeleteConfirmModal.tsx      # Reusable delete confirmation dialog (warning icon, item detail, red button)
  PaymentItem.tsx             # Single payment card + shared types (Payment, PaymentUser) + helpers
  PaymentList.tsx             # Payment list with filters, search, pagination
  PaymentApprovalForm.tsx     # Review modal (screenshot, approve/reject, notes)
  AuditLogPanel.tsx           # Admin audit log viewer (filterable by action type)

src/contexts/SubscriptionContext.tsx  # Client provider for subscription + permissions
src/hooks/useAutoSave.ts      # Refs-based debounced auto-save
src/hooks/useDownloadPDF.ts   # PDF download with 403 → billing redirect

src/app/api/
  pdf/generate/               # POST: generate PDF (checks limits + template access)
  resumes/[id]/duplicate/     # POST: duplicate resume (checks limits + template fallback)
  admin/settings/             # GET/POST: system settings (auto-snapshots before save)
  admin/settings/history/     # GET: last 5 snapshots; POST: revert to snapshot
  admin/analytics/            # GET: 12-month time-series (signups, revenue, users, resumes)
  admin/stats/                # GET: platform metrics
  admin/users/                # GET: user listing; [userId]/upgrade POST
  subscriptions/check-expired/# GET: status; POST: process expired
  payments/submit/            # POST: submit payment (multipart, Telegram notification)
  payments/status/            # GET: user's payment history (array sorted by createdAt desc)
  admin/payments/             # GET: paginated admin payment listing with status filter
  admin/payments/[id]/review/ # GET: single payment + base64 screenshot; POST: approve/reject
  ats/score/                  # POST: ATS score analysis (rate limited, atomic limits)
  ats/keywords/               # POST: keyword matching (rate limited, atomic limits, 10K max)
  stats/public/               # GET: public stats (resumeCount, userCount) — 5min cache, no auth
  user/subscription-data/     # GET: subscription + permissions for client context
  user/onboarding-status/     # GET: check onboarding completion + resume count
  user/onboarding-complete/   # POST: create first resume + mark onboarding done
  user/onboarding-skip/       # POST: mark onboarding done without creating resume

src/app/onboarding/
  page.tsx                    # 3-step onboarding wizard (name → template → upload/scratch)

src/app/billing/
  page.tsx                    # Billing page (Free vs Pro pricing, payment status banners)
  payment-instructions/page.tsx # FIB payment flow (QR code, copy fields, screenshot upload)

src/app/admin/
  layout.tsx                  # Skip-to-content link + <main id="main-content"> wrapper
  payments/page.tsx           # Server component with admin guard → AdminPayments
```
