# Template Creation Guide

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

## Mandatory Template Rules (ALL templates)

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

## Two-Column Template Checklist (sidebar + main content)

Follow this EXACTLY to avoid multi-iteration mistakes:

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

### Rendering Process
- `renderHtml.ts`: React SSR → full HTML document with ALL fonts embedded as base64 (Inter 400+700 for LTR + Noto Sans Arabic 400+700 for RTL). NO CDN dependencies — works offline
- `fontData.ts`: `getBase64Fonts()` (Arabic) + `getInterBase64Fonts()` (LTR) — both cached after first load via `loadFontPair()` helper. Font files in `public/fonts/`
- `generatePdf.ts`: Puppeteer (`puppeteer-core`) → A4 PDF; waits for `document.fonts.ready`

### Page Margins & Spacing
- Page margins: `@page { size: A4; margin: 0; }` in `renderHtml.ts` — zero margin so `position: fixed` backgrounds extend edge-to-edge
- Content spacing handled by template padding + `box-decoration-break: clone` on sidebar/main divs — padding repeats on every page fragment (Chrome 130+)
- Puppeteer `margin: { top: 40px, bottom: 40px }` in `generatePdf.ts` — overridden by @page but kept as fallback
- Templates must NOT add their own `@page` margin overrides

### Two-Column Backgrounds
- For two-column templates with sidebar backgrounds: use `position: fixed` div in `@media print` (repeats every page with @page margin:0)
- Preview uses `--resume-page-bg` CSS variable read by ResumePageScaler

### Preview Pagination
- **ResumePageScaler.tsx** measures content, calculates page breaks matching Puppeteer output
- **Preview break algorithm**: Column-aware 2-phase approach:
  - Phase 1: Converge ALL entries (sidebar + main) — stable base break
  - Phase 2: Fix heading orphans (heading on page but `firstEntryTop >= adjustedEnd`), re-converge ONLY main-content entries (skip sidebar via `isSidebar` flag)
  - `isSidebar` determined by horizontal center position — RTL-aware (checks `getComputedStyle(content).direction`)
  - **Why column-aware**: Sidebar entries (e.g., skill rings) are densely packed → cascading re-convergence pushes break far back, wasting page space. Skipping sidebar in Phase 2 prevents this cascade while keeping main content sections grouped with their headings

### A4 Dimensions
- A4 target: `width: 794px` (210mm at 96dpi), default `padding: 60px`
- A4 page height: `1123px` (297mm at 96dpi), content per page: `1043px` (1123 - 40px top - 40px bottom)

### Template Date Formatting
- Always pass `isRtl ? 'ar' : 'en-US'` to `toLocaleDateString()` — never hardcode `'en-US'`

### Error Handling
- **TemplateRenderer**: Has `TemplateErrorBoundary` — malformed data won't crash the entire preview

### Shared Components
- **Watermark component**: Accepts `isRTL` prop — Kurdish translations rendered for RTL resumes. All 5 main templates pass `isRTL={isRtl}` to `<Watermark />`
- **Template shared ARIA**: All section title divs in shared components use `role="heading" aria-level={2}` for screen reader accessibility
- **ContactInfo link labels**: `unicodeBidi: 'isolate'` on link labels prevents RTL reordering of brand names (LinkedIn, Portfolio)
