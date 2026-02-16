# Admin Dashboard — Deep Audit Report

Generated: 2026-02-15 | Audited: 13 components, 10 API routes, 4 pages, payment/billing flows

---

## 1. Current State

### Dashboard (`/admin`)
- **AdminDashboard.tsx** — Main hub. Renders stats cards, subscription status, system settings, quick actions. Fetches from 3 APIs on mount (`/api/admin/stats`, `/api/admin/settings`, `/api/subscriptions/check-expired`).
- **AdminStatsCards.tsx** — 5 cards: Total Users, Total Resumes, Pro Subscriptions, Monthly Revenue (IQD), Payments (pending/approved/rejected breakdown).
- **AdminSubscriptionStatus.tsx** — Two panels: expired subscriptions (red) and expiring-soon (orange, 3-day window). "Check & Process Expired" button.
- **AdminSystemSettings.tsx** — Form for FREE/PRO plan limits, template access checkboxes, photo upload plans, PRO pricing, maintenance mode toggle. Save button.
- **AdminQuickActions.tsx** — 3 navigation buttons: Manage Users, View All Resumes, Review Payments.

### User Management (`/admin/users`)
- **UserManagement.tsx** — Lists all users as cards with avatar, email, join date, plan badge, usage stats. Search by email/name. "Manage Plan" modal to upgrade/downgrade (FREE ↔ PRO).

### Resume Management (`/admin/resumes`)
- **ResumeManagement.tsx** — Paginated resume table with search, status filter, template filter. Checkbox selection for bulk delete. CSV export. View button opens details modal.
- **ResumeTable.tsx** — Table with columns: checkbox, title+template, user, status badge, section count, created date, actions (view/delete).
- **ResumeFilters.tsx** — Search input + status dropdown + template dropdown.
- **ResumeDetailsModal.tsx** — Modal showing resume metadata (title, status, template, user info, dates). "Preview Resume" button.
- **AdminResumePreview.tsx** — Full resume preview modal with HTML/PDF toggle, zoom controls (0.5x–3x), download button. Uses `/api/admin/preview-pdf`.

### Payment Reviews (`/admin/payments`)
- **AdminPayments.tsx** — Paginated payment list with status filter tabs (All/Pending/Approved/Rejected). Review modal shows user details, screenshot (base64), approve/reject buttons. Rejection supports admin notes.

### API Routes
| Route | Method | Purpose |
|-------|--------|---------|
| `/api/admin/stats` | GET | Platform metrics + payment counts |
| `/api/admin/settings` | GET/POST | System settings CRUD |
| `/api/admin/users` | GET | User listing (no pagination!) |
| `/api/admin/users/[userId]/upgrade` | POST | Change user plan |
| `/api/admin/resumes` | GET/DELETE | Resume listing + bulk delete |
| `/api/admin/resumes/[id]/preview` | GET | Transform resume to ResumeData |
| `/api/admin/preview-pdf` | POST | Generate PDF without watermark |
| `/api/admin/payments` | GET | Paginated payment listing |
| `/api/admin/payments/[id]/review` | GET/POST | Payment details + approve/reject |
| `/api/admin/test-db` | GET | DB connectivity test |

---

## 2. Expiring Plans

### How It Works
- **Completely manual.** No cron job, no webhook, no scheduled task.
- Admin must click "Check & Process Expired" button on dashboard.
- `GET /api/subscriptions/check-expired` — Returns expired + expiring-soon lists (read-only).
- `POST /api/subscriptions/check-expired` — Processes expired: downgrades to FREE, sets endDate=null, preserves usage counts.

### What Happens When Pro Expires
1. Nothing automatic — subscription stays ACTIVE with past endDate until admin clicks button.
2. On manual check: plan → FREE, endDate → null, usage counts preserved.
3. User is NOT notified (no email, no in-app notification). Must visit `/billing` to discover downgrade.

### Timeline Gap
```
Day 30: Subscription endDate passes
Day 30-???: User still has PRO access (nobody checked!)
Day ???: Admin remembers to click button
Day ???: User downgraded, still unaware
```

### Flags
- **No automation** — Critical for production. Users retain PRO access indefinitely if admin forgets.
- **No user notification** — User doesn't know they've been downgraded.
- **No upcoming expiry warnings** — Expiring-soon panel is admin-only; user never sees "Your plan expires in 3 days."
- **BASIC still in expiry query** — `check-expired/route.ts` line 16 filters for `['BASIC', 'PRO']`. Harmless dead code but should be cleaned.

---

## 3. User Management

### What Admin Can Do
- View all users (cards with avatar, email, join date, plan badge, usage stats)
- Search by email or name
- Upgrade/downgrade any user between FREE ↔ PRO (modal)
- See per-user metrics: resume count, AI uses, exports, imports

### What's Missing
- **No pagination** — Fetches ALL users. Will timeout/OOM at scale (10K+ users).
- **No bulk actions** — Can't bulk-upgrade, bulk-downgrade, or bulk-delete users.
- **No advanced filters** — Can't filter by plan, join date range, or activity level.
- **No user detail page** — Can't see a user's resumes, payments, or activity history.
- **No impersonation** — Can't "view as user" for debugging.
- **No export** — Can't export user list (CSV/Excel).
- **No subscription end date visibility** — Modal shows plan name but not when it expires.
- **No custom expiry dates** — Can only set plan type; always gets 30-day window.

### Bug: Usage Count Reset on Upgrade
`upgrade/route.ts` resets `resumeCount`, `aiUsageCount`, `exportCount` to 0 on plan change. This wipes real usage history. Should NOT reset counts — they track cumulative usage.

---

## 4. Resume Management

### What Admin Can Do
- View paginated list of all resumes across all users
- Search by resume title, user email, or user name
- Filter by status (Draft/Published/Archived) and template
- Select multiple resumes and bulk delete
- Export current page to CSV
- View resume details (metadata modal)
- Preview resume as HTML or PDF with zoom controls
- Download resume PDF

### What's Missing
- **CSV exports only current page** — Not all filtered results.
- **No resume editing** — Admin can view but not edit resumes.
- **No template reassignment** — Can't change a user's resume template.
- **No resume statistics** — No insights on most popular templates, avg sections filled, etc.

### Minor Issues
- **ResumeFilters.tsx dead code** — `TemplatesByTier` interface still has `basic` field. Fetches `data.basic` from API but discards it.
- **AdminResumePreview.tsx bug** — `useEffect` dependencies include `data` and `template`, causing PDF regeneration on every parent re-render. Should be `[isOpen, viewMode]` only.
- **Preview modal** — No click-on-overlay-to-close. Only X button dismisses.

---

## 5. Payment Flow

### Full End-to-End Flow

```
USER SIDE:
1. User clicks "Upgrade Now" on /billing
2. Routes to /billing/payment-instructions?plan=pro
3. 4-step wizard:
   Step 1: PRO plan details (5,000 IQD, features list)
   Step 2: FIB transfer instructions (recipient: Alan Ahmed, FIB: 0750 491 0348)
   Step 3: Upload screenshot (drag-drop, max 10MB, image only)
   Step 4: Success page ("Review typically takes 24-48 hours")
4. POST /api/payments/submit:
   - Checks for existing PENDING payment (prevents duplicates ✓)
   - Stores screenshot as binary in Payment.screenshotData
   - Sends Telegram notification (non-blocking)
   - Returns 201

ADMIN SIDE:
5. Admin gets Telegram notification with screenshot + user details
6. Admin navigates to /admin/payments
7. Clicks "Review" on pending payment
8. Modal loads screenshot (base64 from DB)
9. Admin clicks Approve or Reject:
   - Approve: atomic transaction → Payment=APPROVED + Subscription upserted (PRO, 30 days)
   - Reject: Payment=REJECTED + optional admin note

USER SEES RESULT:
10. User visits /billing → sees status banner:
    - PENDING (yellow): "Your payment is being reviewed..."
    - APPROVED (green): "Payment approved! Your PRO plan is now active."
    - REJECTED (red): "Payment rejected. Reason: {adminNote}"
```

### Gaps in Payment Flow
- **No email notifications** — User must manually check /billing to see approval/rejection.
- **No payment resubmission** — Rejected users must restart wizard from scratch.
- **Hardcoded payment details** — FIB phone, recipient name, amount all hardcoded in component. Requires code deploy to change.
- **Screenshot stored in DB forever** — No cleanup after approval. DB bloat risk.
- **No payment search by user** — Admin can only filter by status, not find a specific user's payment.
- **No bulk approve** — Must review one payment at a time.
- **No auto-reject stale payments** — If user submitted but never actually transferred money, payment stays PENDING forever.
- **Telegram can fail silently** — If bot token not configured or API down, admin never sees notification.
- **30-day subscription hardcoded** — All approvals grant exactly 30 days. No configurable durations.

---

## 6. Issues & Bugs

### BASIC Plan Leftovers (Still in Codebase)

| File | References |
|------|-----------|
| `prisma/schema.prisma` | `BASIC` in `SubscriptionPlan` enum; `maxBasicResumes`, `maxBasicAIUsage`, `maxBasicExports`, `maxBasicImports`, `maxBasicATSChecks`, `basicTemplates`, `basicPlanPrice` in SystemSettings model |
| `src/lib/system-settings.ts` | Default values for all maxBasic* fields, basicTemplates, basicPlanPrice |
| `src/app/api/subscriptions/check-expired/route.ts` | Filters for `['BASIC', 'PRO']` in expiry query |
| `src/app/api/templates/route.ts` | Processes and returns `basicTemplates` tier |
| `src/lib/init-db.ts` | Migration SQL creates BASIC-related columns |
| `src/components/admin/ResumeFilters.tsx` | `TemplatesByTier` interface has `basic` field; fetches `data.basic` |

**Admin UI is clean** — no BASIC references in dashboard, settings, stats, or user management components. But the backend/schema still carries the dead weight.

### Confirmed Bugs

1. **Usage count reset on admin upgrade** — `upgrade/route.ts` resets resumeCount/aiUsageCount/exportCount to 0. Destroys usage history.
2. **AdminResumePreview expensive re-renders** — useEffect deps include data/template, triggering PDF regeneration on every parent re-render.
3. **Error message leakage** — `preview-pdf/route.ts` and `resumes/[id]/preview/route.ts` expose `error.message` in API responses. Could leak DB schema details.
4. **No user existence check on upgrade** — `upgrade/route.ts` doesn't verify userId exists before creating subscription. Could create orphan subscription records.
5. **test-db route has no auth** — `GET /api/admin/test-db` doesn't require admin auth. Exposes user/resume counts to unauthenticated clients.

### Auth Inconsistency
- Most admin routes use `requireAdmin()` helper.
- `resumes/route.ts` uses raw `auth()` + manual role check — different pattern, easier to miss auth bugs.

---

## 7. Missing Features (Production SaaS Needs)

### Critical (Business Operations)
- [ ] **Automated subscription expiry** — Cron job or middleware check, not manual button
- [ ] **Email notifications** — Payment submitted/approved/rejected, subscription expiring/expired
- [ ] **Admin audit log** — Who did what, when (settings changes, user upgrades, payment approvals)
- [ ] **User notification system** — In-app alerts for subscription changes, payment updates

### High Priority (Scale)
- [ ] **User management pagination** — Currently fetches ALL users in one request
- [ ] **Payment search by user** — Filter payments by email/name
- [ ] **Bulk payment actions** — Approve/reject multiple at once
- [ ] **External screenshot storage** — Move from DB Bytes to S3/GCS
- [ ] **Configurable payment details** — Admin-editable FIB account info (not hardcoded)
- [ ] **Rate limiting on admin routes** — Prevent DoS on PDF generation, batch deletes

### Medium Priority (UX)
- [ ] **User detail page** — See user's resumes, payments, activity history in one place
- [ ] **Payment resubmission flow** — Let rejected users retry without restarting wizard
- [ ] **Subscription extension** — Admin set custom end dates (not just 30-day window)
- [ ] **Dashboard analytics** — Charts for signups over time, revenue trends, template popularity
- [ ] **Auto-reject stale payments** — Payments pending >5 days get auto-rejected
- [ ] **Admin roles/delegation** — Multiple admin levels (viewer, operator, super-admin)

### Low Priority (Polish)
- [ ] **Real-time dashboard** — WebSocket/polling for live stats updates
- [ ] **User impersonation** — "View as user" for debugging
- [ ] **GDPR compliance** — User data export, account deletion
- [ ] **Settings change history** — Version history for system settings
- [ ] **Payment receipt emails** — Send confirmation with reference number
- [ ] **QR code for FIB transfers** — Better than copy-paste

---

## 8. Quick Wins (< 30 min each)

1. **Remove BASIC from Prisma schema + system-settings.ts** — Delete dead enum value, fields, and defaults. Run migration. ~15 min.

2. **Fix usage count reset bug** — Remove `resumeCount: 0, aiUsageCount: 0, exportCount: 0` from `upgrade/route.ts`. ~5 min.

3. **Add auth to test-db route** — Add `await requireAdmin()` to `/api/admin/test-db`. ~2 min.

4. **Fix error message leakage** — Replace `error.message` with generic messages in `preview-pdf/route.ts` and `resumes/[id]/preview/route.ts`. ~10 min.

5. **Fix AdminResumePreview useEffect** — Change deps from `[data, template]` to `[isOpen, viewMode]` to prevent expensive re-renders. ~5 min.

6. **Add pagination to users API** — Add `page` and `limit` query params to `/api/admin/users`. ~20 min.

7. **Remove BASIC from check-expired filter** — Change `['BASIC', 'PRO']` to `['PRO']` in expiry query. ~2 min.

8. **Remove BASIC from ResumeFilters** — Clean dead `basic` field from interface and template fetch. ~5 min.

9. **Use Next.js router in AdminQuickActions** — Replace `window.location.href` with `useRouter().push()` for client-side nav. ~5 min.

10. **Add payment search** — Add search input to AdminPayments that filters by user email. ~20 min.

---

## 9. Big Improvements (Worth Building)

### 1. Automated Subscription Lifecycle
**Effort:** 1-2 days | **Impact:** Critical

Replace manual "Check Expired" button with:
- Middleware that checks `subscription.endDate` on every authenticated request
- Or: Daily cron via Vercel Cron / external service
- Send email warning 3 days before expiry
- Auto-downgrade on expiry day
- Send email confirmation of downgrade

### 2. Email Notification System
**Effort:** 1-2 days | **Impact:** Critical

Add transactional emails via Resend/SendGrid:
- Payment submitted (to user + admin)
- Payment approved (to user)
- Payment rejected with reason (to user)
- Subscription expiring in 3 days (to user)
- Subscription expired/downgraded (to user)

### 3. Admin Analytics Dashboard
**Effort:** 2-3 days | **Impact:** High

Add charts/graphs:
- User signups over time
- Revenue trend (monthly)
- Payment approval rate and avg review time
- Template popularity breakdown
- Active vs churned users
- Resume completion rates

### 4. External Screenshot Storage
**Effort:** 1 day | **Impact:** Medium (prevents DB bloat)

Move payment screenshots to S3/Cloudflare R2:
- Upload to bucket on submission
- Store URL in Payment record (not binary)
- Serve via signed URLs with expiry
- Clean up old screenshots periodically

### 5. Comprehensive Admin Audit Log
**Effort:** 1-2 days | **Impact:** High

Create `AdminAuditLog` table:
- Track: who (admin email), what (action type), target (user/payment/setting), before/after values, timestamp
- Show log in admin dashboard
- Filter by action type, admin, date range
- Helps with compliance, debugging, accountability

### 6. User Detail Page
**Effort:** 1 day | **Impact:** Medium

Single page showing everything about a user:
- Profile info + subscription status
- All resumes with quick preview
- Payment history
- Activity timeline (created resume, exported PDF, ran ATS, etc.)
- Admin actions (upgrade, extend subscription, add note)
