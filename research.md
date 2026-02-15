# Homepage Redesign — Research

## Current State Analysis

### Current Sections (in order):
1. **Header** — Navigation bar
2. **Hero** — Main headline + CTA
3. **Features** — Feature list
4. **How It Works** — Step-by-step process
5. **Pricing** — Plans comparison
6. **About** — About the company
7. **Contact** — Contact form
8. **Footer** — Links + copyright

### Problems:
- Generic SaaS template feel — doesn't stand out
- "About" and "Contact" sections are unnecessary for a product landing page
- No social proof (testimonials were removed as fake)
- No visual preview of the actual product
- No urgency or motivation to sign up
- Not optimized for the Kurdistan/Iraq market
- No language switcher prominently displayed

## Competitive Analysis

### resume.io (Market Leader)
- **Hero:** "Only 2% of resumes win. Yours will be one of them" — powerful stat
- **Social proof:** 37,389 reviews, 4.4/5 rating, "resumes created today" counter
- **Key pattern:** Shows value prop with numbers (39% more likely to land job, 7% higher salary)
- **Tools ecosystem:** Resume builder, job board, interview prep, salary analyzer
- **CTA:** "Build My Resume" — action-oriented

### novoresume.com
- **Hero:** Live resume preview alongside the CTA
- **Trust badges:** "Trusted by professionals from" + company logos
- **Templates showcase:** Visual grid of templates
- **Stats:** "X resumes created" counter

### zety.com
- **Hero:** Interactive resume builder preview
- **Social proof:** Trustpilot rating prominently displayed
- **How it works:** 3 simple steps with animations
- **Bottom CTA:** Repeats the main CTA before footer

### rxresu.me (Open Source)
- **Minimalist:** Clean, developer-focused
- **Key differentiator:** "Free and open source"
- **No fluff:** Straight to the point

## Recommended Homepage Structure

### 1. Header (Sticky)
- Logo + language switcher (EN/عربی/کوردی) prominently
- "Sign In" and "Get Started Free" buttons
- Mobile: hamburger menu

### 2. Hero Section
- **Headline:** Bold, benefit-focused (not feature-focused)
- **Subheadline:** One line explaining what it does
- **CTA:** "Build Your Resume Free" — big, colored button
- **Visual:** Animated resume preview or template showcase
- **Trust indicator:** "Join X+ professionals in Kurdistan" (use real count from DB)
- **Language-aware:** Hero text changes with locale

### 3. Resume Templates Preview
- Visual carousel/grid of 3-4 templates
- Show actual resume previews (not icons)
- "Choose Your Template" CTA

### 4. How It Works (3 Steps)
- Step 1: Choose a template
- Step 2: Fill in your details (AI helps)
- Step 3: Download your professional PDF
- Keep it visual with icons/illustrations
- Each step has a small animation on scroll

### 5. Features Grid
- ATS-Optimized ✓
- AI-Powered Writing ✓
- Kurdish, Arabic & English ✓
- Professional Templates ✓
- PDF Export ✓
- Mobile-Friendly ✓
- Clean 2x3 or 3x2 grid with icons

### 6. Pricing (Simple)
- Free vs Pro comparison
- Pro: 5,000 IQD/month
- Highlight "Most Popular" on Pro
- CTA buttons on both plans

### 7. Final CTA Section
- "Ready to build your resume?" 
- Big CTA button
- Repeat the trust indicator

### 8. Footer
- Minimal: Logo, language switcher, links, copyright

## UI/UX Best Practices

### Mobile-First
- Single column layout on mobile
- Large touch targets (min 48px)
- Sticky CTA on mobile (floating button)
- Fast loading — lazy load images
- Thumb-friendly navigation

### RTL Considerations
- All layouts must flip correctly
- Use `dir="rtl"` with Tailwind's `rtl:` variants
- Test Arabic and Kurdish text wrapping
- Icons that imply direction should flip

### Color & Typography
- Keep current brand colors but make hero section more vibrant
- Use larger font sizes for Kurdish/Arabic (they render smaller than Latin)
- High contrast for readability on mobile in bright sunlight (Iraq!)

### Conversion Optimization
- Only ONE primary CTA per section
- Remove friction: "Free, no credit card required"
- Show the product early (template previews in hero)
- Real numbers only (actual user count from DB)
- Loading speed matters — minimize JavaScript in landing page
