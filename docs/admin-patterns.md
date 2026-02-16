# Admin Panel Patterns

## Admin Shared Utilities

### `src/lib/admin-utils.ts`
- `formatAdminDate(date)` — relative time for recent (<7d: "Just now", "5m ago", "3h ago", "2d ago"), ISO `YYYY-MM-DD` for older
- `formatAdminDateFull(date)` — full ISO datetime `YYYY-MM-DD HH:MM` for title/tooltip attributes
- `devError(...args)` — `console.error` gated behind `NODE_ENV !== 'production'`, tree-shaken in prod builds

### Usage
- **All API routes and admin components use `devError`** instead of `console.error` (30+ call sites migrated)
- **All admin dates use `formatAdminDate`** with `title={formatAdminDateFull(...)}` for hover tooltips
- **PaymentItem.tsx** exports `formatDate` as alias for `formatAdminDate` (backwards compat for PaymentApprovalForm import)

## Admin Auth (`lib/admin.ts`)

### `isAdmin()`
- Returns false for non-admins
- Throws on DB errors (callers handle 500 vs 403)
- `auth()` wrapped in try-catch
- Explicit `typeof userId !== 'string'` check
- Null user vs non-admin handled separately

### `requireAdminWithId()`
- Standard pattern for admin API routes
- Returns `{ userId, clerkId }` or throws appropriate error

### `logAdminAction()`
- Writes to `AdminAuditLog` table
- Required for all admin mutations

## Admin API Route Checklist

When adding new admin API routes:
1. ✅ `requireAdminWithId()` at the top
2. ✅ `rateLimit()` for rate limiting
3. ✅ CSRF validation on POST/DELETE
4. ✅ `devError()` not `console.error`
5. ✅ `logAdminAction()` for mutations
6. ✅ Never expose `error.message` to client — use generic messages

## Component Patterns

### Naming Conventions
- No semicolons
- Single quotes for JS strings (double quotes OK in JSX attributes)
- All admin components follow this convention

### TypeScript Strict
- No `any` in admin code
- Use `Prisma.PaymentWhereInput`, `Prisma.InputJsonValue`
- `Record<string, unknown> | object | unknown[]` for response data

### i18n in Admin
- All admin components use `useLanguage()` + `t()` with `pages.admin.*` namespace (~200 keys in en/ar/ckb)
- **Exceptions**:
  - `AdminErrorBoundary` (class component, cannot use hooks) — English only
  - `admin/layout.tsx` (server component) — English only
- Module-level constants with labels (like `ACTION_LABELS`) were split into:
  - Static color maps (e.g., `ACTION_COLORS`)
  - i18n key maps (e.g., `ACTION_I18N_KEYS`)
  - `getActionInfo()` helper inside the component that combines both

## Data Loading Patterns

### Parallel Fetching
- Use `Promise.allSettled()` for independent data (stats, settings, subscription status)
- Per-section error state UI + retry buttons
- No full-page error — graceful degradation

### Loading States
- **AdminStatsCards**: Skeleton with animated pulse bars (including sub-stats for Payments card)
- **All lists**: Loading skeletons match table structure

## Pagination

### Constants (`src/lib/constants.ts`)
```typescript
ADMIN_PAGINATION = {
  PAYMENTS: 20,
  RESUMES: 10,
  USERS: 20,
  AUDIT_LOGS: 20,
  MAX_LIMIT: 100
}
```

### Server-Side Pagination
- All admin lists use server-side pagination
- APIs return `hasNextPage`/`hasPrevPage` in response
- Uses `Pagination` component from `@/components/ui/Pagination`

## List Patterns

### Search
- Debounced 500ms
- Server-side implementation
- Search query in URL params for shareable links

### Filters
- Status filters (tabs for payments, dropdown for others)
- Date range filters (dateFrom/dateTo)
- All filters in URL params

### Sorting
- `ResumeTable`: Sortable column headers (opt-in via `sortBy`/`sortOrder`/`onSort` props)
- Column visibility toggle dropdown (Columns3 icon)
- API supports `sortBy` + `sortOrder` query params

### Bulk Actions
- Checkbox selection pattern
- Bulk API: POST `/api/admin/users/bulk` — supports `upgrade`, `downgrade`, `delete`
- Processes in Prisma transaction
- Logs to audit trail
- Skips admin users on delete

### CSV Export
- Build CSV string with proper escaping (double quotes)
- Create Blob
- Trigger download via temporary anchor element
- Used in UserManagement and AuditLogPanel

## Modal Patterns

### DeleteConfirmModal
- Reusable modal with warning icon
- Item details display
- "cannot be undone" text
- Red delete button
- Escape key support
- Focus-on-cancel
- Used by ResumeManagement AND Dashboard (replaces both native `confirm()` and toast-based delete)

### PaymentApprovalForm
- Review modal (screenshot, approve/reject, notes)
- Self-contained state
- Note max 1000 chars
- Escape key closes
- Focus trap

## Keyboard Shortcuts

### AdminDashboard
- `/` focuses search
- `?` toggles shortcuts help panel
- Escape closes modals (UserManagement, PaymentApprovalForm, DeleteConfirmModal)

## Settings Management

### System Settings
- Singleton record in `SystemSettings` table
- GET/POST `/api/admin/settings`
- Zod validation on POST (partial updates supported)
- Auto-snapshots before each save (last 5 kept)

### Settings Cache
- `getSystemSettings()` has 5-min TTL in-memory cache
- Invalidated by `invalidateSettingsCache()` on POST save
- Two implementations:
  - Private one in `db.ts` (parses JSON arrays, 30s TTL, used by `checkUserLimits`)
  - Exported one in `system-settings.ts` (raw Prisma result, 60s TTL, used by admin API)

### Settings History
- GET/POST `/api/admin/settings/history`
- List last 5 snapshots / revert to a snapshot
- `SettingsSnapshot` Prisma model stores JSON data + savedBy + createdAt

### AdminSystemSettings Component
- Dirty state tracking
- "Saved!" toast on success (auto-dismiss 3s)
- History panel with restore buttons
- Tooltip hints on limit inputs (`cursor-help`)
- Warning field if snapshot fails (save succeeded but no rollback point)

## Dark Mode

### Configuration
- `darkMode: 'class'` in tailwind.config.js
- `AdminThemeToggle` toggles `.dark` on `<html>`
- Persists to `localStorage('admin-theme')`

### Component Adaptation
- shadcn components (Card, Button, Input, Badge) auto-adapt via CSS variables in globals.css `.dark` block
- Non-shadcn elements need manual `dark:` variants:
  - `bg-gray-50` → `dark:bg-gray-900`
  - `text-gray-900` → `dark:text-gray-100`
  - `border-gray-200` → `dark:border-gray-700`

### Flash Prevention
- `src/app/admin/layout.tsx` includes flash prevention script
- Reads localStorage synchronously before paint
- Applied in layout wrapper

## Analytics

### Time-Series Data
- GET `/api/admin/analytics`
- 12-month time-series via raw SQL
- Metrics: signups, revenue, active users, resumes
- `AdminAnalytics` component renders 4 Recharts charts (2 line + 2 bar)

### Recharts Typing
- Import `TooltipProps` from `'recharts'`
- Use `TooltipProps<number, string>['formatter']` for typed tooltip formatters
- Never `as any`

### Dynamic Pricing
- Revenue uses dynamic `proPlanPrice` from SystemSettings (not hardcoded)

## Audit Trail

### AuditLogPanel
- Server-side pagination (20/page)
- Action type filter (8 actions)
- Date range filter
- CSV export
- API at `/api/admin/audit-log` supports `?action=&dateFrom=&dateTo=&page=&limit=`

### Action Info Pattern
```typescript
// Static maps
const ACTION_COLORS = { ... }
const ACTION_I18N_KEYS = { ... }

// Helper inside component
const getActionInfo = (action: string) => ({
  color: ACTION_COLORS[action],
  label: t(ACTION_I18N_KEYS[action])
})
```

## Recently Viewed

### `useRecentlyViewed` Hook
- Location: `src/hooks/useRecentlyViewed.ts`
- localStorage-based
- Tracks last 10 admin items (users/resumes/payments)
- Shown in AdminDashboard
- Auto-deduplicates
- Most recent first

## Payment Management

### Payment Components (Refactored)
- `PaymentItem.tsx`: Single payment card + shared types/helpers
- `PaymentList.tsx`: List + filters + pagination
- `PaymentApprovalForm.tsx`: Review modal
- `AdminPayments.tsx`: Thin wrapper (AppHeader + PaymentList)

### Payment Review
- GET `/api/admin/payments/[id]/review`: Returns base64 screenshot data URL
- POST approve: Atomic `$transaction` with PENDING check (race-condition safe)
- POST reject: Updates status, logs action
- Refund button on APPROVED payments: POST `/api/admin/payments/[id]/refund` marks as REFUNDED + downgrades user to FREE

### PaymentStatus Enum
- PENDING, APPROVED, REJECTED, REFUNDED
- PaymentList has filter tabs for all 4 statuses
- Date range filter (dateFrom/dateTo)

## Accessibility

### ARIA
- `aria-live="polite"` on AdminDashboard error banner for screen reader announcements
- Skip-to-content link in `admin/layout.tsx`
- `<main id="main-content">` wrapper
- Modal focus traps
- Keyboard navigation support

## Gotchas

### Prisma Schema Changes
- Need `npx prisma db push` + `npx prisma generate`
- Run from Windows terminal (not WSL) when DATABASE_URL is configured there

### admin/resumes deleteMany
- IDs validated non-empty
- Capped at 100 per request
- Pre-deletion count check detects mismatched IDs
