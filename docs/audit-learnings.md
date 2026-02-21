# Gotchas & Audit Learnings

## Prisma Patterns

### Json Field Encoding
**Problem**: Double-encoding JSON arrays
```typescript
// ❌ BAD
data: { proTemplates: JSON.stringify(['modern']) }  // Stored as "\"[\\\"modern\\\"]\""

// ✅ GOOD
data: { proTemplates: ['modern'] }  // Stored correctly
```
**Why**: Prisma Json fields handle serialization automatically. JSON.stringify causes double-encoding.

### PRO Template Access
**Pattern**: PRO always gets all registered templates
```typescript
const availableTemplates = plan === 'PRO'
  ? getTemplateIds()  // All templates, ignore DB settings
  : settings.freeTemplates || ['modern']
```
**Why**: Prevents DB config errors from blocking PRO users.

### Two getSystemSettings()
- Private one in `db.ts` (30s TTL, parses JSON arrays, used by `checkUserLimits`)
- Exported one in `system-settings.ts` (60s TTL, raw result, used by admin API)

**Why**: Different callers need different shapes. Parser avoids duplicating array-parse logic.

### WSL Prisma DLL Lock
**Problem**: `prisma generate` fails when Windows process holds `query_engine-windows.dll.node`

**Workaround**:
```bash
sed -i 's/"windows", //' prisma/schema.prisma
npx prisma generate
git checkout prisma/schema.prisma
```
**Why**: WSL can't overwrite DLL when Cursor or Next dev server (Windows) has it loaded.

## Hydration Issues

### useState with Date/Random
**Problem**: Server and client render different values
```typescript
// ❌ BAD
const [id] = useState(Date.now() + Math.random())

// ✅ GOOD
const [id, setId] = useState('')
useEffect(() => setId(crypto.randomUUID()), [])
```
**Why**: Server executes at build time, client at runtime. Different timestamps/randoms = hydration mismatch.

### ID Generation
**Always**: Use `crypto.randomUUID()` — never `Date.now() + Math.random()`
**Why**: UUID avoids collisions AND hydration mismatches (when used correctly with useEffect).

## CSS & Layout

### minHeight on Template Root
**Problem**: Wrong page count in PDF
```typescript
// ❌ BAD
<div style={{ width: '794px', minHeight: '1123px' }}>

// ✅ GOOD
<div style={{ width: '794px' }}>
```
**Why**: PDF renderer measures actual content. minHeight forces extra blank pages.

### @page Margins and position:fixed
**Problem**: Sidebar backgrounds clip at page edges
```css
/* ❌ BAD */
@page { margin: 20px; }  /* Clips fixed elements */

/* ✅ GOOD */
@page { margin: 0; }     /* Fixed elements extend edge-to-edge */
```
**Why**: Chromium applies @page margin to page canvas. `position: fixed` calculates from canvas edge, gets clipped.

### html { background } in Print
**Problem**: Background doesn't show in PDF
```css
/* ❌ Doesn't work */
html { background: #333; }

/* ✅ Works */
@media print {
  .sidebar-bg { position: fixed; background: #333; }
}
```
**Why**: Chromium doesn't propagate `<html>` background to print page canvas. Use fixed-position divs.

### RTL Flex Direction
**Problem**: Sidebar stays on left in RTL
```jsx
// ❌ BAD (double-reverses back to LTR)
<div style={{ direction: 'rtl', flexDirection: 'row-reverse' }}>

// ✅ GOOD (direction:rtl already reverses row)
<div style={{ direction: 'rtl', flexDirection: 'row' }}>
```
**Why**: `direction: rtl` on root already reverses flex row order. Adding `row-reverse` cancels it.

### resume-entry Granularity
**Problem**: Entire sections pushed to next page, wasting space
```jsx
// ❌ BAD — wraps multiple items
<div className="resume-entry">
  <SectionTitle>Experience</SectionTitle>
  {experience.map(exp => <div>{exp.jobTitle}</div>)}
</div>

// ✅ GOOD — each item separate
<div className="resume-section">
  <SectionTitle>Experience</SectionTitle>
  {experience.map(exp => (
    <div key={exp.id} className="resume-entry">{exp.jobTitle}</div>
  ))}
</div>
```
**Why**: Break algorithm treats `resume-entry` as atomic. Large entries push to next page even if only half-full.

### Sidebar Page Break Cascade
**Problem**: Dense sidebar entries cause re-convergence loops
**Solution**: `ResumePageScaler` Phase 2 skips sidebar entries (re-converges only main content)
**Why**: Sidebar entries densely packed. Re-converging them pushes break too far back, wastes space.

## RTL & i18n

### Duplicating RTL Regex
**Problem**: Multiple definitions of same regex
```typescript
// ❌ BAD
const isRtl = /[\u0600-\u06FF\u0750-\u077F]/.test(text)

// ✅ GOOD
import { isRTLText } from '@/lib/rtl'
const isRtl = isRTLText(text)
```
**Why**: Single source of truth. Update once, applies everywhere.

### AI Token Limits for Kurdish
**Problem**: Kurdish text gets cut off
**Before**: `max_tokens: 200` (too small)
**After**: `max_tokens: 500+` (Kurdish uses more tokens/word)
**Why**: Kurdish script is token-dense. 200 tokens = ~30 words in Kurdish.

### Mixed LTR/RTL Text
**Problem**: Brand names (LinkedIn, GitHub) reverse in RTL
```jsx
// ❌ BAD
<div style={{ direction: 'rtl' }}>LinkedIn</div>

// ✅ GOOD
<div style={{ direction: 'rtl', unicodeBidi: 'plaintext' }}>
  <span style={{ unicodeBidi: 'isolate' }}>LinkedIn</span>
</div>
```
**Why**: `unicode-bidi: isolate` treats span as neutral direction (preserves Latin order in RTL context).

### Date Formatting for Locales
```typescript
// ❌ BAD
date.toLocaleDateString('en-US')

// ✅ GOOD
date.toLocaleDateString(isRtl ? 'ar' : 'en-US')
```
**Why**: Arabic/Kurdish users expect Eastern Arabic numerals (٠-٩) and RTL month names.

## Auto-Save & State Management

### Stale Closures in Debounced Saves
**Problem**: `setTimeout` callback captures old state
```typescript
// ❌ BAD
const [formData, setFormData] = useState({})
const debouncedSave = () => {
  setTimeout(() => {
    saveResume(formData)  // Stale! Captured at setTimeout() call
  }, 1000)
}

// ✅ GOOD
const formDataRef = useRef(formData)
useEffect(() => { formDataRef.current = formData }, [formData])

const debouncedSave = () => {
  setTimeout(() => {
    saveResume(formDataRef.current)  // Fresh! Reads current value
  }, 1000)
}
```
**Why**: Refs bypass closure capture. `formDataRef.current` always reads latest value.

### Buttons Without type="button"
**Problem**: Form submits on button click, page refreshes
```jsx
// ❌ BAD
<button onClick={handleClick}>Click</button>

// ✅ GOOD
<button type="button" onClick={handleClick}>Click</button>
```
**Why**: Buttons default to `type="submit"`. Clicking triggers form submission unless type is explicit.

## Mobile & WSL Dev

### Dev Mobile Testing (WSL)
**Setup**: Access via `http://<WSL_IP>:3000`
**Required**: `allowedDevOrigins` in `next.config.js` for Next.js 15.3+ (validates Host header)
**Gotcha**: Chunk load errors → `error.tsx` auto-reloads on `ChunkLoadError`

### Mobile Toolbar Wrap
**Problem**: Horizontal scroll on small screens
```jsx
// ❌ BAD
<div className="flex">

// ✅ GOOD
<div className="flex flex-wrap">
```
**Why**: No wrap = toolbar overflows. flex-wrap + smaller icons prevent scroll.

## Admin Panel

### admin.ts Hardening
- `auth()` wrapped in try-catch
- Explicit `typeof userId !== 'string'` check
- Null user vs non-admin handled separately
**Why**: Robust error handling prevents 500s, gives clear 401/403.

### admin/resumes deleteMany Guards
- IDs validated non-empty
- Capped at 100 per request
- Pre-deletion count check detects mismatched IDs
**Why**: Prevents accidental mass-delete, catches race conditions.

### AdminErrorBoundary Limitation
- Class component, cannot use hooks
- English only (no i18n)
**Comment in code**: Notes the limitation for future maintainers.

## Payment System

### perMonth Locale Values
**Problem**: Double-slash in UI: `//شهر`
```typescript
// ❌ BAD (locale has "/" prefix)
{ perMonth: '/شهر' }
<span>/{t('billing.proPlan.perMonth')}</span>  // Renders "//شهر"

// ✅ GOOD (no prefix in locale)
{ perMonth: 'شهر' }
<span>/{t('billing.proPlan.perMonth')}</span>  // Renders "/شهر"
```
**Why**: Code adds the slash — locale value shouldn't include it.

## Performance Patterns

### Context Provider Values Must Be Memoized
**Why**: Without `useMemo`, every render of the provider creates a new value object, triggering re-renders in *all* consumers even when nothing changed.
```tsx
// ✅ GOOD
const value = useMemo(() => ({ language, t, isRTL }), [language, t, isRTL])
```

### Dynamic Import Heavy Libraries Only Used in Subpages
**Why**: `recharts` (~200KB), `mammoth` (~80KB) ship to all users even if only admins or uploaders need them.
```tsx
// ✅ AdminDashboard dynamically imports AdminAnalytics (which pulls in recharts)
const AdminAnalytics = dynamic(() => import('./AdminAnalytics').then(m => ({ default: m.AdminAnalytics })), { ssr: false })
// ✅ mammoth loaded at call-site only when DOCX is actually parsed
const mammoth = (await import('mammoth')).default
```

### PDF Browser Pooling
**Why**: Launching a new Chromium instance per PDF request adds 2-3s overhead. Reuse browser with page-level isolation. Close after 30s idle.

### API Cache-Control for Static-ish Data
**Why**: `/api/templates` and `/api/pricing` rarely change but hit the DB every request. Adding `Cache-Control: public, s-maxage=300` lets CDN/edge serve cached responses.

### `optimizePackageImports` in next.config.js
**Why**: Barrel-exported libraries like `lucide-react` import all exports. This config tree-shakes unused exports at build time, saving 50-100KB+.

## Testing Rules

### Test Mobile AND Desktop After CSS Changes
**Why**: Responsive breakpoints can break either view. Tailwind `sm:`, `md:`, `lg:` change layout.

## Deployment

### Commit Only, Wait for "push"
**Rule**: Netlify auto-builds on push (20 deploys/month limit)
**Why**: Avoid wasting build quota on WIP commits. Alan controls when to deploy.
