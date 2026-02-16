# Internationalization (i18n) Guide

## Languages Supported
- English (`en`)
- Arabic (`ar`)
- Central Kurdish / Sorani (`ckb`)

## Translation Structure

### Namespaces
All translations organized under `pages.*` namespace:
```typescript
pages: {
  home: { ... },              // Landing page
  dashboard: { ... },         // User dashboard
  resumeBuilder: { ... },     // Resume builder + ATS
  billing: { ... },           // Billing + payment
  onboarding: { ... },        // Onboarding wizard
  admin: { ... }              // Admin panel (~200 keys)
}
```

### Admin Panel i18n
- All admin components use `useLanguage()` + `t()` with `pages.admin.*`
- **Exceptions**:
  - `AdminErrorBoundary` (class component, cannot use hooks) — English only
  - `admin/layout.tsx` (server component) — English only
- Both have comments noting the limitation

### Module-Level Constants Pattern
**Problem**: Constants with labels can't access hooks
```typescript
// ❌ BAD — can't use t() at module level
const ACTION_LABELS = {
  CREATE_USER: 'Create User',
  DELETE_RESUME: 'Delete Resume'
}
```

**Solution**: Split into maps + helper
```typescript
// Static color map (no i18n needed)
const ACTION_COLORS = {
  CREATE_USER: 'blue',
  DELETE_RESUME: 'red'
}

// i18n key map
const ACTION_I18N_KEYS = {
  CREATE_USER: 'pages.admin.auditLog.actions.createUser',
  DELETE_RESUME: 'pages.admin.auditLog.actions.deleteResume'
}

// Helper inside component (has access to t())
const getActionInfo = (action: string) => ({
  color: ACTION_COLORS[action],
  label: t(ACTION_I18N_KEYS[action])
})
```

## RTL Support

### Detection
**Never duplicate the regex** — always import from `@/lib/rtl`:
```typescript
import { isRTLText } from '@/lib/rtl'

const isRtl = isRTLText(text)  // Tests for Arabic/Kurdish script
```

### Root Direction
```jsx
<div style={{ direction: isRtl ? 'rtl' : 'ltr' }}>
  {/* Content */}
</div>
```

### Text Alignment
```jsx
<div style={{ textAlign: isRtl ? 'right' : 'left' }}>
  {text}
</div>
```

### Flex Layout
**IMPORTANT**: Use `flexDirection: 'row'` — NOT `'row-reverse'` for RTL
```jsx
// ✅ GOOD — direction:rtl already reverses row order
<div style={{ direction: 'rtl', flexDirection: 'row' }}>
  <div>Sidebar</div>
  <div>Main</div>
</div>

// ❌ BAD — double-reverses back to LTR
<div style={{ direction: 'rtl', flexDirection: 'row-reverse' }}>
```

**Why**: `direction: rtl` on root already reverses flex row order. Adding `row-reverse` cancels the effect.

### Line Height
```jsx
// Increase for RTL (Arabic/Kurdish need more vertical space)
<div style={{ lineHeight: isRtl ? 1.7 : 1.4 }}>
```

### Mixed LTR/RTL Content

**Problem**: Brand names reverse in RTL context
```jsx
// ❌ BAD — "LinkedIn" becomes "nIdekniL"
<div style={{ direction: 'rtl' }}>
  Visit my LinkedIn profile
</div>
```

**Solution**: `unicode-bidi: isolate` on Latin spans
```jsx
// ✅ GOOD
<div style={{ direction: 'rtl', unicodeBidi: 'plaintext' }}>
  Visit my <span style={{ unicodeBidi: 'isolate' }}>LinkedIn</span> profile
</div>
```

### Contact Info in Templates
```jsx
// Email/URL container
<div style={{ direction: 'ltr', unicodeBidi: 'plaintext' }}>
  <span style={{ unicodeBidi: 'isolate' }}>
    {email}
  </span>
</div>
```

**Why**: Emails/URLs are always LTR. `isolate` prevents RTL reordering.

## Date Formatting

### Locale-Aware Formatting
```typescript
// ❌ BAD — hardcoded English
date.toLocaleDateString('en-US')

// ✅ GOOD — adapts to language
date.toLocaleDateString(isRtl ? 'ar' : 'en-US')
```

**Result**:
- English: `1/15/2024`
- Arabic: `١٥/١/٢٠٢٤` (Eastern Arabic numerals)

### In Templates
Always pass locale to date methods:
```typescript
const formattedDate = new Date(startDate).toLocaleDateString(
  isRtl ? 'ar' : 'en-US',
  { year: 'numeric', month: 'short' }
)
```

## Number Formatting

### Currency
```typescript
const formatter = new Intl.NumberFormat(
  locale === 'ckb' ? 'ar' : locale,  // CKB uses Arabic numerals
  { style: 'currency', currency: 'IQD' }
)
```

**Note**: Central Kurdish (`ckb`) uses Arabic numeral system. Map to `'ar'` for Intl APIs.

### Counters & Stats
```typescript
const displayValue = new Intl.NumberFormat(
  locale === 'ckb' ? 'ar' : locale
).format(count)
```

**Landing page example**: `useCountUp` hook maps `ckb` → `ar` for `Intl.NumberFormat`.

## AI & Token Limits

### Kurdish Token Density
**Problem**: Kurdish text gets cut off
```typescript
// ❌ BAD — too small for Kurdish
max_tokens: 200

// ✅ GOOD — Kurdish needs more tokens
max_tokens: 500
```

**Why**: Kurdish script uses more tokens per word than English. 200 tokens ≈ 30 Kurdish words.

### Multilingual AI Prompts
**ATS Feature**: Prompts explicitly state:
- "Resume may be in English, Arabic, or Kurdish"
- "Use semantic matching across languages"
- "Don't penalize non-English resumes"

**Why**: Prevents bias toward English-only content.

## Component Patterns

### useLanguage Hook
```typescript
import { useLanguage } from '@/contexts/LanguageContext'

const { t, language, isRTL } = useLanguage()

// Use t() for translations
<h1>{t('pages.home.hero.title')}</h1>

// Use isRTL for layout
<div className={isRTL ? 'text-right' : 'text-left'}>
```

### Conditional Classes (Tailwind)
```jsx
<div className={isRTL ? 'mr-4' : 'ml-4'}>  {/* Margin */}
<div className={isRTL ? 'text-right' : 'text-left'}>  {/* Alignment */}
<div className={isRTL ? 'flex-row-reverse' : 'flex-row'}>  {/* Flex */}
```

**Note**: For inline styles, prefer `direction: rtl` on root. For Tailwind classes, use conditional logic.

## Translation Key Patterns

### Action Labels
```typescript
// Structure: pages.{area}.actions.{action}
t('pages.dashboard.resumes.actions.edit')
t('pages.dashboard.resumes.actions.delete')
t('pages.dashboard.resumes.actions.duplicateResume')
```

### Messages
```typescript
// Structure: pages.{area}.messages.{message}
t('pages.dashboard.resumes.messages.deleteSuccess')
t('pages.dashboard.resumes.messages.duplicateLimitReached')
```

### Form Labels
```typescript
// Structure: pages.{area}.form.{field}
t('pages.resumeBuilder.form.fullName.label')
t('pages.resumeBuilder.form.fullName.placeholder')
```

### Validation Errors
```typescript
// Structure: pages.{area}.form.{field}.errors.{error}
t('pages.resumeBuilder.form.email.errors.invalid')
t('pages.resumeBuilder.form.phone.errors.required')
```

## Accessibility (ARIA)

### RTL-Aware ARIA Labels
```jsx
<button
  aria-label={t('pages.admin.actions.closeModal')}
  onClick={onClose}
>
  <X className="h-4 w-4" />
</button>
```

### Screen Reader Announcements
```jsx
<div
  aria-live="polite"
  aria-atomic="true"
  className="sr-only"
>
  {t('pages.admin.messages.dataSaved')}
</div>
```

## Server Components Limitation

### Cannot Use Hooks
```typescript
// ❌ Can't do this in server component
import { useLanguage } from '@/contexts/LanguageContext'

// ✅ Accept locale as prop instead
export default function ServerComponent({ locale }: { locale: string }) {
  // Use hardcoded strings or pass translations from parent
}
```

**Example**: `admin/layout.tsx` is a server component — English only, with comment explaining why.

## Testing i18n

### Check All 3 Locales
1. Switch to English — verify text
2. Switch to Arabic — verify RTL layout + Arabic text
3. Switch to Kurdish — verify RTL layout + Kurdish text

### Common Issues
- Text overflow (Kurdish words can be long)
- Broken RTL layout (missing `direction: rtl`)
- Hardcoded English strings (forgot to use `t()`)
- Wrong date format (hardcoded `'en-US'`)
- Brand names reversed (missing `unicode-bidi: isolate`)

## Watermark Component

### RTL Support
```tsx
<Watermark isRTL={isRtl} />
```

**Implementation**: Renders Kurdish translations for RTL resumes. All 5 main templates pass `isRTL={isRtl}`.
