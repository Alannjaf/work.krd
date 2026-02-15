# Homepage Redesign — Implementation Plan

## Architecture

### Delete These (current landing components):
- `src/components/landing/about.tsx` — unnecessary
- `src/components/landing/contact.tsx` — unnecessary  
- `src/components/landing/hero.tsx` — rewrite from scratch
- `src/components/landing/features.tsx` — rewrite
- `src/components/landing/how-it-works.tsx` — rewrite
- `src/components/landing/pricing.tsx` — rewrite (use billing page pricing instead)
- `src/components/landing/header.tsx` — rewrite
- `src/components/landing/footer.tsx` — simplify

### New Page Structure (`src/app/page.tsx`):
```tsx
<main>
  <Header />           {/* Sticky nav with language switcher */}
  <Hero />             {/* Bold headline + CTA + resume preview */}
  <Templates />        {/* Visual template carousel */}
  <HowItWorks />       {/* 3 simple steps */}
  <Features />         {/* 6 features in grid */}
  <Pricing />          {/* Free vs Pro */}
  <FinalCTA />         {/* "Ready to build?" repeat CTA */}
  <Footer />           {/* Minimal footer */}
</main>
```

## Section Details

### 1. Header (Sticky)
- Logo (left) + Nav links (center) + Language switcher + Auth buttons (right)
- Nav: Features, Pricing, How It Works (smooth scroll)
- Mobile: Logo + hamburger + "Get Started" button
- Transparent on top, solid white on scroll
- `position: sticky; top: 0; z-index: 50`

### 2. Hero Section
- **Layout:** Left text + Right resume mockup (desktop) / Stacked (mobile)
- **Headline:** 
  - EN: "Build a Professional Resume in Minutes"
  - AR: "أنشئ سيرة ذاتية احترافية في دقائق"
  - CKB: "لە چەند خولەکدا CVیەکی پڕۆفیشناڵ دروست بکە"
- **Subheadline:**
  - EN: "AI-powered resume builder with ATS optimization. Free to start."
  - AR: "منشئ السيرة الذاتية بالذكاء الاصطناعي مع تحسين ATS. ابدأ مجاناً."
  - CKB: "دروستکەری CV بە یارمەتی AI لەگەڵ باشکردنی ATS. بەخۆڕایی دەست پێبکە."
- **CTA Button:** "Build Your Resume — It's Free" (big, primary color, rounded)
- **Secondary CTA:** "See Templates →" (text link)
- **Trust line:** "Used by {count} professionals in Kurdistan" (real count from DB)
- **Right side:** Animated resume template preview (rotate through 2-3 templates)
- **Background:** Subtle gradient or geometric pattern

### 3. Templates Preview
- **Headline:** "Choose from Professional Templates"
- Show 3-4 template previews as cards
- Each card: template thumbnail + template name
- Hover: subtle scale animation
- **CTA:** "View All Templates" → links to /resume-builder
- Mobile: horizontal scroll carousel

### 4. How It Works
- **Headline:** "3 Simple Steps to Your New Resume"
- Step 1: 📝 "Choose a Template" — Pick from professional designs
- Step 2: ✍️ "Fill Your Details" — AI helps you write better
- Step 3: 📄 "Download PDF" — ATS-optimized, ready to send
- Visual: numbered circles connected with a line/arrow
- Mobile: vertical stack with numbers

### 5. Features Grid
- **Headline:** "Everything You Need"
- 2x3 grid (desktop) / 1 column (mobile)
- Each feature: icon + title + one-line description
- Features:
  1. 🤖 AI-Powered Writing — "Smart suggestions for every section"
  2. 📊 ATS Optimization — "Pass automated screening systems"
  3. 🌍 Multilingual — "Kurdish, Arabic & English support"
  4. 📱 Mobile-Friendly — "Build your resume from your phone"
  5. 📄 PDF Export — "Download professional PDFs instantly"
  6. 🎨 Pro Templates — "Stand out with modern designs"

### 6. Pricing
- **Headline:** "Simple, Affordable Pricing"
- Two cards side by side (desktop) / stacked (mobile)
- FREE card: basic features, "Get Started Free" button
- PRO card: highlighted/bordered, 5,000 IQD/month, all features, "Upgrade to Pro" button
- Pro card has a "Most Popular" badge
- Below: "No credit card required for free plan"

### 7. Final CTA
- Full-width colored background section
- **Headline:** "Ready to Land Your Dream Job?"
- **Subheadline:** "Join thousands of professionals building better resumes"
- **CTA Button:** "Get Started Free" (white button on colored bg)

### 8. Footer
- Logo + tagline
- Links: Privacy, Terms, Contact
- Language switcher
- "© 2026 work.krd"
- Social links if any

## i18n Keys Needed

All under `pages.home.*`:
```
hero.title, hero.subtitle, hero.cta, hero.secondaryCta, hero.trust
templates.title, templates.viewAll
howItWorks.title, howItWorks.step1.title, howItWorks.step1.desc, 
howItWorks.step2.title, howItWorks.step2.desc,
howItWorks.step3.title, howItWorks.step3.desc
features.title, features.ai.title, features.ai.desc,
features.ats.title, features.ats.desc,
features.multilingual.title, features.multilingual.desc,
features.mobile.title, features.mobile.desc,
features.pdf.title, features.pdf.desc,
features.templates.title, features.templates.desc
pricing.title, pricing.subtitle, pricing.free.*, pricing.pro.*
finalCta.title, finalCta.subtitle, finalCta.button
footer.tagline, footer.privacy, footer.terms, footer.contact
```

## Animations
- Hero: fade-in on load (text first, then resume preview)
- Templates: cards slide up on scroll (staggered)
- How It Works: steps appear one by one on scroll
- Features: grid items fade in on scroll
- Use CSS animations or Framer Motion (already in deps?)
- Keep animations subtle — don't slow down the page

## Implementation Checklist
- [x] Delete old landing components (about, contact)
- [x] Create new Header with language switcher + sticky behavior
- [x] Create Hero with headline, CTA, and resume preview
- [x] Create Templates carousel/grid section
- [x] Create HowItWorks with 3 steps
- [x] Create Features grid (6 items)
- [x] Create Pricing section (Free vs Pro)
- [x] Create FinalCTA section
- [x] Create minimal Footer
- [x] Add all i18n keys (en/ar/ckb)
- [x] Test RTL layout (Arabic + Kurdish) — RTL support via isRTL + Tailwind rtl: + document.dir
- [x] Test mobile responsiveness — mobile-first Tailwind breakpoints throughout
- [x] Optimize for performance (lazy loading, minimal JS) — IntersectionObserver scroll animations, no framer-motion
- [x] Commit
