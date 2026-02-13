# work.krd — AI Learnings

## Deploy
- Commit only, wait for Alan to say "push" — Netlify auto-builds (20 deploys/month)
- Test mobile AND desktop after CSS changes

## Tech
- Next.js 15 + Tailwind + Prisma + Clerk auth
- Resume builder SaaS for Kurdish/Arabic speakers — RTL is critical
- Target: `width: 794px` (A4 at 96dpi), `padding: 60px`

## RTL Rules (MANDATORY for all templates)
```js
// Detect RTL: /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/
const dir = isRtl ? 'rtl' : 'ltr';
// Set on root: direction: dir
// Set textAlign on all text blocks
// Contact/links: <span style={{ unicodeBidi: 'isolate' }}> in container with direction: 'ltr', unicodeBidi: 'plaintext'
```

## Page Break CSS (MANDATORY)
```css
.resume-entry { break-inside: avoid; page-break-inside: avoid; }
.resume-section h2 { break-after: avoid; page-break-after: avoid; }
```
Apply `className="resume-section"` to sections, `className="resume-entry"` to items.

## List Styles (Tailwind strips bullets)
```css
.resume-desc ul, .resume-desc ol { list-style: disc; padding-left: 1.2em; margin: 4px 0; }
.resume-desc ol { list-style: decimal; }
[dir="rtl"] .resume-desc ul { padding-left: 0; padding-right: 1.2em; }
```

## PDF Pipeline
- Fonts in `renderHtml.ts`: Inter (LTR) + Noto Sans Arabic (RTL) via base64
- PDF margins: `@page { margin: 40px 0; }` — templates should NOT add their own
- Template `fontFamily` needs fallback: `'system-ui, -apple-system, sans-serif'`
- Rich text: `dangerouslySetInnerHTML={{ __html: description }}` with `className="resume-desc"`

## Mistakes Fixed
- Mobile toolbar horizontal scroll → flex-wrap, smaller icons
- Buttons without `type="button"` cause page refresh
- `minHeight: 1123px` on root causes wrong page count (remove it)
- Mixed LTR/RTL text garbles in single string → use `unicode-bidi: isolate` spans
- AI max_tokens 200 cuts Kurdish text → use 500+ (Kurdish uses more tokens/word)
- Stale closures in useAutoSave → use refs, always full saves
