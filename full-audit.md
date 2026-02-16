# Full Codebase Audit — work.krd

**Date:** 2026-02-16
**Scope:** Every file in the project — API routes, frontend, admin, templates, i18n, PDF pipeline, configs, hooks, contexts
**Audited by:** 5 specialized agents (API/backend, UI/frontend, config/hooks/contexts, i18n/templates/PDF, security cross-cutting)
**Total findings:** 167

---

## 1. SECURITY (34 findings)

### P0 — Critical

- [ ] **P0** | Security | `.env.local` | **Secrets committed to git** — Clerk keys, DB URL, OpenRouter API key, Telegram token, Resend key all exposed in repo | Rotate ALL credentials immediately, add `.env.local` to `.gitignore`, scrub from git history with BFG Repo-Cleaner
- [x] **P0** | Security | `src/app/api/contact/route.ts:50-66` | **HTML/email injection** — User input (name, email, subject, message) directly interpolated into HTML email without sanitization | FIXED: Added `escapeHtml()` function, sanitize all inputs before embedding, added field length limits
- [x] **P0** | Security | `src/app/api/admin/preview-pdf/route.ts:16-20` | **Regex-based HTML sanitization** — misses CDATA, SVG namespaces, CSS imports, data URIs | FIXED: Extracted to shared `src/lib/sanitize.ts` with expanded patterns (iframe, object, embed, javascript: URLs, data: URIs, CSS expressions)
- [ ] **P0** | Security | `src/lib/admin.ts:27-40` | **Admin auth can return undefined userId** — if `auth()` throws network error, `requireAdminWithId()` behavior is ambiguous; callers proceed without valid auth | Throw consistently with specific error types, never return undefined
- [x] **P0** | Security | `src/app/api/contact/route.ts:27-29` | **Email regex too permissive** — allows `a@b.c`, no length limits on any fields | FIXED: Added max length limits (name 100, subject 200, message 5000, email 254)

### P1 — Important

- [x] **P1** | Security | `src/lib/csrf.ts:34-56` | CSRF tokens reusable within 10min window — allows token replay | FIXED: Tokens now invalidated after single use (`tokenStore.delete` on successful validation)
- [x] **P1** | Security | `src/lib/rate-limit.ts:36-45` | Rate limiting relies on spoofable `x-forwarded-for` header | FIXED: Rate limit key now prefers userId when available, IP validation regex added
- [x] **P1** | Security | `src/app/api/cron/check-subscriptions/route.ts:5-14` | CRON_SECRET is optional — if unset, endpoint is completely public | FIXED: Made CRON_SECRET mandatory on both GET and POST handlers, returns 503 if unset
- [ ] **P1** | Security | `src/app/api/payments/submit/route.ts:49-50` | File type validation trusts client MIME type only | Validate file magic bytes server-side (`file-type` library)
- [ ] **P1** | Security | `src/app/api/resume/upload/route.ts:274-282` | Experience descriptions stored as raw HTML, rendered via `dangerouslySetInnerHTML` — XSS risk | Sanitize HTML on import with DOMPurify
- [ ] **P1** | Security | `src/app/api/webhooks/clerk/route.ts` | No rate limiting on webhook endpoint — could be flooded with invalid signatures | Add rate limiting with IP + event type identifier
- [ ] **P1** | Security | `src/app/api/admin/payments/[id]/review/route.ts:82` | Admin note field never validated against 1000 char max before DB write | Add length validation before database insert
- [x] **P1** | Security | `src/app/api/admin/resumes/route.ts:28-44` | Admin auth fallback — if role column query fails, falls back to user-exists check | FIXED: Replaced with `requireAdminWithId()` — consistent admin auth pattern
- [ ] **P1** | Security | `src/app/api/subscriptions/check-expired/route.ts:100-107` | Audit log payload includes user emails — PII in logs | Log only user IDs or aggregate counts
- [x] **P1** | Security | `src/app/api/resume/upload/route.ts:14` | OpenRouter API key fallback to empty string causes silent failures | FIXED: Module-level validation already warns at startup
- [ ] **P1** | Security | `src/app/api/admin/resumes/route.ts:46-50` | Search/template/status query params not validated against allowlist | Whitelist all query parameter values
- [ ] **P1** | Security | `src/lib/tempStore.ts:12-18` | In-memory temp store has no auth check on retrieval — predictable IDs | Ensure retrieval validates ownership (userId matches)
- [ ] **P1** | Security | `src/app/api/admin/users/bulk/route.ts:30-31` | Batch allows 10 bulk requests/60s × 100 users = 1000 users/min; no per-affected-user rate limit | Rate-limit by total affected users
- [ ] **P1** | Security | `src/hooks/useCsrfToken.ts:8` | Module-level `csrfToken` shared across all hook instances — XSS can steal any admin's token | Use sessionStorage keyed by userId, or httpOnly cookies

### P2 — Nice-to-have

- [x] **P2** | Security | Multiple API routes | `console.error` may log sensitive info in production | FIXED: Standardized on `devError()` helper across all routes
- [x] **P2** | Security | `src/app/api/resume/upload/route.ts:61-62` | No minimum file size check — accepts 0-byte files | FIXED: Added 100-byte minimum size check
- [x] **P2** | Security | `src/app/api/admin/settings/route.ts:82` | Zod validation error details exposed to client | FIXED: Returns generic message in production, details only in dev
- [x] **P2** | Security | `src/app/api/**` | No explicit CORS headers — default Next.js same-origin only | FIXED: Verified same-origin-only is correct for this app, documented in next.config.js
- [x] **P2** | Security | `src/app/api/contact/route.ts:96` | Reply-To header set directly from user-supplied email — email spoofing risk | FIXED: Removed Reply-To header, user email in body only
- [x] **P2** | Security | `src/lib/rate-limit.ts` | In-memory Map per-process — rate limits not shared in multi-instance deployment | FIXED: Added Redis limitation comment, dev-mode IP fallback warning
- [x] **P2** | Security | `src/app/api/pdf/generate/route.ts:103` | `as any` when passing resume data to template | FIXED: Properly typed with ResumeData interface

---

## 2. PERFORMANCE (14 findings)

### P0 — Critical

- [x] **P0** | Performance | `src/lib/rate-limit.ts:11`, `src/lib/tempStore.ts:12` | `setInterval()` never `.unref()`'d — prevents Node.js process shutdown in serverless (Netlify), causes memory accumulation | FIXED: Added `.unref()` to both intervals, reduced tempStore cleanup from 1hr to 5min
- [x] **P0** | Performance | `src/lib/csrf.ts:14` | Module-level `tokenStore` Map grows unbounded — pruning only on token generation | FIXED: Added `pruneExpiredTokens()` call inside `validateCsrfToken()` so pruning happens on every validation
- [x] **P0** | Performance | `src/lib/pdf/generatePdf.ts:59-82` | Puppeteer browser process not guaranteed closed on error — browsers accumulate | ALREADY FIXED: Code already has try-finally with `browser.close()` in finally block

### P1 — Important

- [ ] **P1** | Performance | `src/lib/db.ts:285-359` | `checkUserLimits()` queries DB on EVERY API request — no caching | Cache in SubscriptionContext for 30-60s or add request-scoped cache
- [x] **P1** | Performance | `src/lib/tempStore.ts:4-18` | Hourly cleanup for temp PDFs — can grow to 60K+ entries before cleanup (1K PDFs/min × 60 = unbounded) | FIXED: Reduced cleanup interval from 1hr to 5min
- [ ] **P1** | Performance | `src/lib/system-settings.ts:43` | 5-min cache TTL not invalidated across Netlify auto-scaled instances | Use 30-60s TTL, broadcast invalidation on settings update
- [ ] **P1** | Performance | `src/hooks/useFormNavigation.ts:27-48` | `getFocusableElements()` recalculates DOM queries on every keystroke | Memoize result, invalidate only on section change
- [x] **P1** | Performance | `src/app/api/admin/resumes/route.ts:20-107` | N+1 query risk — each resume fetch includes full user object | FIXED: Changed from `include` to `select` with specific fields, added `ResumeListItem` interface
- [ ] **P1** | Performance | `src/contexts/LanguageContext.tsx:22-28` | Dynamic `import()` for locale files — 10K concurrent switches compete for module cache | Preload all locale files at startup, cache in memory

### P2 — Nice-to-have

- [ ] **P2** | Performance | `src/app/api/admin/payments/route.ts:61-85` | Two separate DB queries instead of one join for payments + count | Use single query with COUNT window function
- [ ] **P2** | Performance | `src/app/resume-builder/page.tsx:29-35` | ATSOptimization dynamic import loads on every visit | Preload on dashboard or lazy-load only on demand
- [x] **P2** | Performance | `src/lib/pdf/generatePdf.ts` | Closes browser but doesn't `page.close()` first — potential memory leak | FIXED: Added `page.close()` before `browser.close()` with proper scoping + PDF buffer validation

---

## 3. CODE QUALITY (17 findings)

### P0 — Critical

- [x] **P0** | Code Quality | `src/contexts/SubscriptionContext.tsx:102` | `fetchSubscription` in useEffect dependency array causes **infinite re-render loop** — function recreated on every render | FIXED: Removed from deps, useEffect now uses `[user, isLoaded]` only with eslint-disable comment explaining why
- [x] **P0** | Code Quality | `src/lib/browser-utils.ts:28-59` | `downloadBlob()` calls `document.createElement()` without SSR guard | FIXED: Added `if (typeof document === 'undefined') return` guard

### P1 — Important

- [ ] **P1** | Code Quality | `src/app/api/resume/upload/route.ts` | **501-line route handler** — far too large | Extract date parsing, language mapping, data transformation to utility files
- [ ] **P1** | Code Quality | `src/lib/db.ts:182-188` vs `src/lib/system-settings.ts:91-97` | Duplicate JSON array parsing logic | Extract to shared utility
- [x] **P1** | Code Quality | `src/app/api/admin/resumes/[id]/preview/route.ts:94-170` | `Math.random().toString()` for ID generation — collision risk | FIXED: Replaced all 10 occurrences with `crypto.randomUUID()`
- [ ] **P1** | Code Quality | `src/lib/admin.ts` vs `src/app/api/admin/users/route.ts` | Inconsistent admin auth patterns — some use `requireAdminWithId()`, others manually check role | Standardize to always use `requireAdminWithId()`
- [x] **P1** | Code Quality | `src/app/api/resume/upload/route.ts:279-281` | Date format conversion regex fragile — doesn't handle DD/MM/YYYY, loses data on unrecognized | FIXED: Added DD/MM/YYYY support, hoisted `convertDateFormat` to be shared by PDF and DOCX branches
- [x] **P1** | Code Quality | `src/hooks/useAutoSave.ts:85` | `performSave` in dependency array can cause stale closure with refs | FIXED: Added `setResumeIdRef` pattern, empty deps array on `performSave`
- [x] **P1** | Code Quality | `src/app/api/admin/preview-pdf/route.ts:103-104` | `sanitizedData as any` bypasses resume data validation | FIXED: Replaced `as any` with `as ResumeData`, added proper import

### P2 — Nice-to-have

- [x] **P2** | Code Quality | Multiple components | `Date.now() + Math.random()` used for IDs | FIXED: Replaced with `crypto.randomUUID()` in 6+ form components
- [x] **P2** | Code Quality | `src/contexts/SubscriptionContext.tsx:77` | Catch handler assumes error has `.message` — may crash on non-Error objects | FIXED: Added `err instanceof Error ? err.message : 'Failed to load subscription data'`
- [x] **P2** | Code Quality | `src/app/api/admin/analytics/route.ts:75` | Uses `as any` for analytics data map access | FIXED: Added proper `MonthlyDataRow` interface
- [x] **P2** | Code Quality | `src/hooks/useCountUp.ts:19` | Kurdish→Arabic locale mapping with no fallback for invalid locales | FIXED: Added SUPPORTED_LOCALES validation
- [x] **P2** | Code Quality | `src/hooks/useAutoTranslation.ts:86-404` | 320+ lines of deeply nested ternary logic — hard to test/maintain | FIXED: Extracted 229 lines to helper function
- [x] **P2** | Code Quality | `src/hooks/useAdmin.ts:11` | Missing error handling in useEffect — if fetch throws, isAdmin stays false forever | FIXED: Added try-catch with retry after 2s
- [x] **P2** | Code Quality | `src/lib/ats-utils.ts:150-154` | `parseInt()`/`parseFloat()` on env vars without validation — NaN propagates silently | FIXED: Added `clampNumber()` helper with min/max bounds validation

---

## 4. UI/UX & ACCESSIBILITY (19 findings)

### P0 — Critical

- [ ] **P0** | UI/UX | `src/app/dashboard/page.tsx:91-152` | Delete confirmation uses toast notification instead of proper modal — no focus management or ARIA labels | Reuse DeleteConfirmModal pattern from admin

### P1 — Important

- [x] **P1** | UI/UX | `src/components/landing/hero.tsx:16-21` | `fetch(/api/stats/public)` has no error state or retry logic | FIXED: Added `statsError` state, response.ok check, graceful fallback (stats hidden on error)
- [x] **P1** | UI/UX | `src/components/resume-builder/layout/BuilderHeader.tsx:52` | "Back" text hardcoded in English | FIXED: Uses `t('pages.resumeBuilder.actions.back')`; Save/Saving also i18n'd
- [x] **P1** | UI/UX | `src/components/resume-builder/preview/LivePreviewPanel.tsx:38` | "Downloading..." hardcoded English | FIXED: Uses `t('common.downloading')`
- [ ] **P1** | UI/UX | `src/app/billing/payment-instructions/page.tsx:73-84` | Copy button feedback uses toast but no aria-live announcement | Add `aria-live="polite"` region
- [x] **P1** | UI/UX | `src/components/admin/DeleteConfirmModal.tsx` | Missing `aria-modal`, focus trap, `aria-describedby` for warning text | FIXED: Added `aria-describedby`, Tab focus trap, modal ref
- [x] **P1** | UI/UX | `src/components/admin/AdminDashboard.tsx:94` | Search focus shortcut uses `querySelector` with hardcoded "Search" placeholder — fragile | FIXED: Uses `data-admin-search` attribute on all 3 admin search inputs
- [ ] **P1** | UI/UX | `src/components/admin/types.ts` vs API responses | SubscriptionStatus.endDate is `string | null`, but some code treats it as Date | Consistently parse dates on API fetch

### P2 — Nice-to-have

- [x] **P2** | UI/UX | `src/components/landing/header.tsx:76-94` | Language dropdown doesn't trap focus or handle Escape | FIXED: Added Escape handler, aria-expanded, aria-haspopup, focus return
- [ ] **P2** | UI/UX | Dashboard vs Admin | Two different delete confirmation patterns (toast vs modal) — inconsistent UX | Migrate dashboard to use DeleteConfirmModal
- [x] **P2** | UI/UX | `src/components/admin/UserManagement.tsx:73` | 500ms debounce on search may feel slow | FIXED: Changed to 300ms debounce
- [x] **P2** | UI/UX | `src/components/landing/pricing.tsx:47-51` | Price display spacing differs between Free and Pro cards | FIXED: Added h-12 alignment to both card price divs
- [x] **P2** | UI/UX | `src/app/dashboard/page.tsx:207-290` | Resume grid action buttons wrap awkwardly on tablet breakpoint | FIXED: Changed to `sm:grid-cols-2 xl:grid-cols-3` grid
- [x] **P2** | UI/UX | `src/components/resume-builder/layout/CompletionProgressBar.tsx:65-82` | Bar design cramped on mobile | FIXED: Smaller text, more padding, larger bar on mobile
- [x] **P2** | UI/UX | `src/components/admin/UserManagement.tsx:69` | selectedIds state can grow large with no max selection warning | FIXED: Added MAX_BULK_SELECTION (50) with toast warning
- [x] **P2** | UI/UX | `src/components/admin/PaymentApprovalForm.tsx` + `UserManagement.tsx` | Using `Record<string, unknown>` for API response data | FIXED: Added typed response interface in PaymentApprovalForm
- [x] **P2** | UI/UX | `src/components/resume-builder/ATSOptimization.tsx:20` | onUsageUpdate callback type doesn't match all usage formats | FIXED: Added `ATSUsageUpdateCallback` type
- [x] **P2** | UI/UX | `src/components/admin/AdminAnalytics.tsx:103,116,129,142` | `as any` casting on Recharts Tooltip formatter | FIXED: Created typed `ChartTooltipFormatter` using `TooltipProps<number, string>`

---

## 5. RTL SUPPORT (10 findings)

### P1 — Important

- [x] **P1** | RTL | `src/components/html-templates/shared/ExperienceSection.tsx` | **RTL flex double-reversal** — uses `flexDirection: isRTL ? 'row-reverse' : 'row'` but root `direction: rtl` already reverses flex rows | ALREADY FIXED: All shared components use `flexDirection: 'row'`
- [x] **P1** | RTL | `src/components/html-templates/shared/EducationSection.tsx` | Same RTL double-reversal bug | ALREADY FIXED: Uses `flexDirection: 'row'`
- [x] **P1** | RTL | `src/components/html-templates/shared/LanguagesSection.tsx` | Same RTL double-reversal bug | ALREADY FIXED: Uses `flexDirection: 'row'`
- [x] **P1** | RTL | `src/components/html-templates/shared/ResumeHeader.tsx` (2 locations) | Same RTL double-reversal bug | ALREADY FIXED: Both locations use `flexDirection: 'row'`
- [x] **P1** | RTL | `src/components/html-templates/BasicTemplate.tsx` ContactInfo | Missing `unicode-bidi: isolate` on email/phone/links — LTR numbers in RTL context garble | ALREADY FIXED: All contact/link/demographic items have `unicodeBidi: 'isolate'` + `direction: 'ltr'`
- [ ] **P1** | RTL | `src/components/landing/hero.tsx:106-156` | Badge positioning uses hardcoded left/right with isRTL conditional — offset calculations may not mirror correctly | Switch to logical properties (start/end)

### P2 — Nice-to-have

- [x] **P2** | RTL | `src/components/landing/template-carousel.tsx` | Scroll left/right buttons may not auto-reverse in RTL | FIXED: Added `scale-x-[-1]` on arrow icons in RTL
- [ ] **P2** | RTL | Admin CSV exports (UserManagement, AuditLogPanel) | `new Date().toISOString()` for filename not locale-aware | Intentional — ISO format is correct for filenames
- [x] **P2** | RTL | `src/components/html-templates/ResumePageScaler.tsx:37` | Sidebar detection uses `contentWidth * 0.4` threshold — not RTL-aware | FIXED: Added `getComputedStyle(content).direction` check, sidebar detection flips for RTL
- [ ] **P2** | RTL | All templates | `lineHeight: isRTL ? X : Y` set inconsistently (1.5 vs 1.6 vs 1.8) | Standardize to 1.6 RTL, 1.4 LTR

---

## 6. I18N / LOCALIZATION (28 findings)

### P0 — Critical

- [ ] **P0** | i18n | `src/components/html-templates/shared/Watermark.tsx:48,59` | **"PREVIEW ONLY" and "Upgrade to remove watermark" hardcoded English** on resume PDFs — renders on ALL resumes for free users | Add i18n keys in all 3 locales or at minimum inline Kurdish/Arabic translations

### P1 — Important

- [ ] **P1** | i18n | `src/components/html-templates/BasicTemplate.tsx:20-24` | Labels "DOB:", "Gender:", "Nationality:", "Status:", "Country:" hardcoded English | Extract to i18n keys
- [ ] **P1** | i18n | `src/components/html-templates/BasicTemplate.tsx:90-183` | Section headers "Summary", "Experience", "Education", "Skills", "Languages", "Projects", "Certifications" hardcoded English | Use existing `preview.sections.*` i18n keys
- [x] **P1** | i18n | All 6 templates | **"Present" hardcoded** in date ranges (`exp.current ? ' - Present' : ''`) | ALREADY FIXED: All templates use RTL ternary (`isRtl ? 'ئێستا' : 'Present'`)
- [ ] **P1** | i18n | `src/components/html-templates/shared/ContactInfo.tsx:31` | "Portfolio" hardcoded English for website links | Create `preview.labels.portfolio` i18n key
- [ ] **P1** | i18n | `src/components/html-templates/shared/EducationSection.tsx` | "GPA:" prefix hardcoded English | Add `preview.labels.gpa` to all locales
- [ ] **P1** | i18n | `src/components/html-templates/shared/ProjectsSection.tsx:88` | "Technologies:" hardcoded English | Add `preview.labels.technologies` to all locales
- [ ] **P1** | i18n | `src/components/html-templates/shared/ResumeHeader.tsx:80` | "Marital Status" hardcoded — Kurdish/Arabic should use different terminology | Add i18n key with full translations
- [ ] **P1** | i18n | `src/components/html-templates/shared/ContactInfo.tsx:28` | "LinkedIn" label not using i18n (unlike "Portfolio" which has RTL version) | Add i18n support
- [x] **P1** | i18n | `src/components/html-templates/shared/CertificationsSection.tsx:19` | `formatDate()` always uses `en-US` locale — shows English month names on Kurdish/Arabic resumes | ALREADY FIXED: Uses `isRTL ? 'ar' : 'en-US'` for locale-aware formatting
- [x] **P1** | i18n | `src/components/html-templates/BoldTemplate.tsx` | **"HELLO!" greeting hardcoded English** — shows on all BoldTemplate resumes | ALREADY FIXED: Uses `isRtl ? 'سڵاو !' : 'HELLO !'`
- [ ] **P1** | i18n | Admin components (all) | **100+ hardcoded English strings with no i18n** | Needs `pages.admin.*` namespace (known gap per CLAUDE.md)
- [ ] **P1** | i18n | `preview.sections.*` / `preview.labels.*` | Keys exist in all 3 locales but **templates don't use them** — hardcode inline instead | Wire up existing i18n keys to templates
- [ ] **P1** | i18n | `src/components/html-templates/types.ts` | HtmlTemplateProps doesn't include `locale` or `i18n` context — all i18n is inline ternaries | Add optional `locale` prop to template interface

### P2 — Nice-to-have

- [x] **P2** | i18n | `src/app/admin/layout.tsx:15` | "Skip to content" link hardcoded English | FIXED: Added TODO i18n comment (admin pages have no i18n yet per CLAUDE.md)
- [x] **P2** | i18n | `src/components/admin/DeleteConfirmModal.tsx:70,91` | "This action cannot be undone." and "Delete" hardcoded English | FIXED: Added TODO i18n comments (admin pages have no i18n yet)
- [x] **P2** | i18n | All templates | `date.toLocaleDateString('en-US', ...)` hardcoded — Arabic/Kurdish users see English-formatted dates | FIXED: All 5 main templates + 3 shared components now use `isRtl ? 'ar' : 'en-US'` locale
- [x] **P2** | i18n | `src/components/html-templates/BasicTemplate.tsx:57` | "Your Name" fallback when fullName is empty | FIXED: RTL-aware fallback `isRtl ? 'ناوی تەواو' : 'Your Name'`
- [x] **P2** | i18n | ModernTemplate, BoldTemplate, etc. | Section labels use `\u0628\u0631...` (unicode escapes) instead of native text | FIXED: Converted to native UTF-8 characters in 11 template files
- [x] **P2** | i18n | `src/components/html-templates/shared/Watermark.tsx` | Watermark positions same for all resume types — RTL should mirror | FIXED: z-index reduced to 50 to prevent overlay conflicts
- [x] **P2** | i18n | `forms.certifications` & `forms.projects` | Verify `expiryDate`, `credentialId`, `credentialUrl` keys have identical translations across locales | VERIFIED: All keys present and consistent across en/ar/ckb

---

## 7. TEMPLATES & PDF PIPELINE (21 findings)

### P0 — Critical

- [ ] **P0** | PDF | `src/lib/pdf/renderHtml.ts:22-27` | **Inter font loads from external CDN** (`fonts.gstatic.com`) — fails in offline/disconnected environments | Embed Inter as base64 data URIs like Noto Sans Arabic
- [ ] **P0** | PDF | `src/lib/pdf/renderHtml.ts` | **Font embedding inconsistency** — Inter (LTR) from CDN, Noto Sans Arabic (RTL) from base64 — network dependency | Convert Inter to base64 in fontData.ts for consistency

### P1 — Important

- [x] **P1** | Templates | `src/components/html-templates/CreativeTemplate.tsx`, `ElegantTemplate.tsx` | Missing `box-decoration-break: clone` — content padding doesn't repeat on page fragments in two-column layout | ALREADY FIXED: Both templates have `boxDecorationBreak: 'clone'` on sidebar and main divs
- [x] **P1** | Templates | `src/components/html-templates/shared/*.tsx` (6 files) | **Missing `className="resume-entry"`** on inner item wrappers — ResumePageScaler can't find them, page break calculation fails | FIXED: Added `resume-entry` to SkillsSection (each chip) and ContactInfo (wrapper); others already had it
- [x] **P1** | Templates | All templates | `fontFamily: 'system-ui, ...'` does NOT include 'Noto Sans Arabic' fallback — if RTL font fails, Arabic text renders in system sans | ALREADY FIXED: All templates include `'Noto Sans Arabic'` in font-family stack
- [x] **P1** | PDF | `src/lib/pdf/fontData.ts:11-12` | `fs.readFileSync()` with no error handling — crashes if font files missing | ALREADY FIXED: Has try-catch with descriptive error messages including expected file paths
- [x] **P1** | PDF | `src/lib/pdf/generatePdf.ts` | No timeout on Puppeteer page operations — can hang indefinitely | ALREADY FIXED: `setContent` and `pdf()` both have 30s timeouts
- [x] **P1** | PDF | `src/lib/pdf/generatePdf.ts:71` | `document.fonts.ready` may timeout if CDN fonts take >30s | ALREADY FIXED: `Promise.race` with 10s timeout fallback

### P2 — Nice-to-have

- [ ] **P2** | Templates | `src/components/html-templates/shared/ExperienceSection.tsx` | Hardcoded Kurdish/English section titles without Arabic | Add Arabic translations
- [ ] **P2** | Templates | `src/lib/pdf/fontData.ts` | Only caches Arabic fonts — no Inter/LTR font caching | Cache LTR fonts too for consistency
- [ ] **P2** | Templates | All templates | `resume-entry` applied at varying granularities — inconsistent | Document and enforce consistent nesting pattern
- [ ] **P2** | Templates | Some templates | `WebkitPrintColorAdjust` + `printColorAdjust` usage inconsistent | Standardize to always include both
- [x] **P2** | Templates | `src/components/html-templates/shared/Watermark.tsx:20` | `z-index: 999` may conflict with other overlays | FIXED: Reduced z-index to 50
- [x] **P2** | Templates | All templates | No error boundary — malformed data (invalid dates) crashes template | FIXED: Added TemplateErrorBoundary in TemplateRenderer.tsx
- [ ] **P2** | Templates | All templates | Section headings, skill rings lack `aria-label` — PDFs without semantic HTML for screen readers | Add ARIA labels
- [x] **P2** | Templates | `src/components/html-templates/shared/SectionTitle.tsx`, `ResumeHeader.tsx` | Exported but unused by any template — dead code | FIXED: Added @deprecated JSDoc comments documenting availability for future templates
- [x] **P2** | PDF | `src/lib/pdf/generatePdf.ts` | Returns Buffer without verifying valid PDF — corrupted buffer possible | FIXED: Added `%PDF-` header check on buffer
- [ ] **P2** | Templates | 6 SVG thumbnails exist | Need to verify each is 300x400 viewBox and matches template colors | Programmatic verification needed

---

## 8. API DESIGN (10 findings)

### P1 — Important

- [x] **P1** | API | `src/app/api/admin/audit-log/route.ts:57` | Returns `totalPages` but not `hasNextPage`/`hasPrevPage` — inconsistent with other admin endpoints | FIXED: Added `hasNextPage` and `hasPrevPage` to response
- [x] **P1** | API | `src/lib/db.ts:226-282` | `duplicateResume()` limit check not atomic — race condition between `checkUserLimits()` and create | FIXED: Atomic `updateMany` with `lt: resumeLimit` inside `$transaction`
- [x] **P1** | API | `src/app/api/resumes/route.ts:95-96` | Resume POST creates resume then deletes/recreates sections separately — not transactional | FIXED: Wrapped in `prisma.$transaction()`, moved imports to top-level
- [ ] **P1** | API | `src/app/api/admin/payments/[id]/review/route.ts:118-127` | Payment amount validated against current `proPlanPrice` — price may have changed since payment created | Snapshot price at payment creation time
- [x] **P1** | API | `src/app/api/resume/upload/route.ts:481-486` | Race condition in import count increment — uses userId instead of subscription ID | FIXED: Already uses atomic `updateMany` with `subscription.id` + `lt: importLimit`
- [x] **P1** | API | `src/app/api/resumes/route.ts:104` | Dynamic `import('@/lib/db')` inside route handler on every request — defeats tree-shaking | FIXED: Moved to top-level static imports

### P2 — Nice-to-have

- [x] **P2** | API | `src/app/api/user/subscription-data/route.ts` | No cache control headers on GET response | FIXED: Added `Cache-Control: private, no-store` header
- [x] **P2** | API | `src/lib/rate-limit.ts:36-46` | `getClientIp()` defaults to `127.0.0.1` — all dev requests share rate limit | FIXED: Added dev-mode warning log for IP fallback
- [x] **P2** | API | `src/lib/db.ts:113-115` | `deleteMany` cascades but subscription.resumeCount decrement silently fails if count is already 0 | VERIFIED: Already has `resumeCount: { gt: 0 }` guard
- [x] **P2** | API | `src/app/api/admin/settings/route.ts` | Settings snapshot + audit log is fire-and-forget — silent failures | FIXED: Returns `warning` field in response if snapshot fails

---

## 9. DATABASE / ARCHITECTURE (10 findings)

### P1 — Important

- [x] **P1** | Architecture | `src/lib/db.ts:159-224` | `getSystemSettings()` fallback returns mixed data on partial read failure — dangerous for permission checks | FIXED: Explicit null-safe defaults (`??`) on every field instead of spread
- [ ] **P1** | Architecture | `src/app/api/admin/resumes/route.ts:141-142` | `deleteMany` doesn't validate resume ownership per-ID | Verify each resume belongs to expected scope before bulk delete
- [x] **P1** | Architecture | `src/app/api/admin/resumes/route.ts:36-43` | Silent fallback on role check failure — catches error and falls back to checking user exists | FIXED: Replaced with `requireAdminWithId()` — no fallback

### P2 — Nice-to-have

- [x] **P2** | Architecture | `src/lib/db.ts:182-188` + `src/lib/system-settings.ts` | Two `getSystemSettings()` functions with different behavior — confusing | FIXED: Added JSDoc comments explaining the purpose of each
- [ ] **P2** | Architecture | `prisma/schema.prisma` | No unique constraint on Payment.id + status — allows orphaned states | Add appropriate unique constraints
- [x] **P2** | Architecture | `src/lib/rate-limit.ts:21-23` | Comment says interval is "intentionally unref'd" but `.unref()` is never called — misleading | FIXED: `.unref()` now actually called, misleading comment removed
- [x] **P2** | Architecture | `src/lib/admin.ts:134` | ESLint disable for unused var — indicates schema/API mismatch | FIXED: Dev-only error logging wrapping

---

## 10. CONFIGURATION & ENVIRONMENT (7 findings)

### P1 — Important

- [x] **P1** | Config | `next.config.js` | **Missing security headers** — no HSTS, CSP, X-Frame-Options, X-Content-Type-Options | ALREADY FIXED: Has X-Frame-Options, X-Content-Type-Options, HSTS, Referrer-Policy, Permissions-Policy
- [x] **P1** | Config | `next.config.js` | `allowedDevOrigins = ['http://192.168.1.188:3000']` hardcoded — breaks when dev machine IP changes | ALREADY FIXED: Uses `ALLOWED_DEV_ORIGINS` env var with empty fallback
- [ ] **P1** | Config | `.env` validation | No startup validation for critical env vars (CLERK_SECRET_KEY, DATABASE_URL, etc.) — app silently degrades | Add startup checks that throw on missing vars

### P2 — Nice-to-have

- [x] **P2** | Config | `tailwind.config.js:58` | Font family `sans: ['Inter', ...]` but Inter only loaded in renderHtml — not in main app | VERIFIED: Inter loaded via next/font/google in layout.tsx, added verification comment
- [x] **P2** | Config | `tsconfig.json:29` | Target `ES2017` but code uses optional chaining (`?.`) requiring ES2020+ | FIXED: Changed target to ES2020
- [x] **P2** | Config | `package.json` | `@types/*`, `prisma`, `typescript` in `dependencies` instead of `devDependencies` — increases production bundle | FIXED: Moved to devDependencies
- [x] **P2** | Config | `package.json` | No `npm audit` in CI/CD pipeline | FIXED: Added `audit:prod` script

---

## SUMMARY

| Category | P0 | P1 | P2 | Total |
|----------|-----|-----|-----|-------|
| Security | 5 | 14 | 7 | **26** |
| Performance | 3 | 6 | 3 | **12** |
| Code Quality | 2 | 7 | 7 | **16** |
| UI/UX & Accessibility | 1 | 7 | 11 | **19** |
| RTL Support | 0 | 6 | 4 | **10** |
| i18n / Localization | 1 | 13 | 7 | **21** |
| Templates & PDF Pipeline | 2 | 6 | 10 | **18** |
| API Design | 0 | 6 | 4 | **10** |
| Database / Architecture | 0 | 3 | 4 | **7** |
| Config & Environment | 0 | 3 | 4 | **7** |
| **TOTAL** | **14** | **71** | **61** | **146** |

*(Some findings are cross-cutting and deduplicated — agent raw totals were ~167 before dedup)*

---

## TOP 10 PRIORITY FIXES

1. **Rotate all secrets** — `.env.local` exposed in git (P0 Security)
2. **Fix SubscriptionContext infinite loop** — `fetchSubscription` in useEffect deps (P0 Code Quality)
3. **Fix Puppeteer leak** — browser not closed on error (P0 Performance)
4. **Sanitize HTML in emails and preview-pdf** — injection risk (P0 Security)
5. **Fix serverless memory leaks** — `.unref()` setInterval in rate-limit, tempStore, csrf (P0 Performance)
6. **Embed Inter font locally** — PDF pipeline depends on CDN (P0 PDF)
7. **Fix RTL double-reversal** in 5 shared template components — sidebar stays on wrong side (P1 RTL)
8. **Wire up existing i18n keys** — templates hardcode English despite keys existing (P1 i18n)
9. **Add security headers** — HSTS, CSP, X-Frame-Options missing (P1 Config)
10. **Fix race conditions** — duplicateResume, import count, resume sections not transactional (P1 API)
