# Onboarding Wizard — Implementation Plan

## Overview

Build a 3-step onboarding wizard for new users:
1. Welcome + Name
2. Pick a template (full-size previews)
3. Upload CV or Start from scratch

After completion → create first resume → redirect to `/resume-builder?id=NEW_ID`

---

## 1. Database Changes

### 1a. Add `onboardingCompleted` to User model

**File**: `prisma/schema.prisma`

```prisma
model User {
  ...
  onboardingCompleted Boolean @default(false)   // NEW
}
```

**Why a field instead of just checking `resumeCount === 0`**: If a user clicks "Skip" during onboarding, they should not see it again. We need an explicit flag.

### 1b. Prisma migration

```bash
npx prisma migrate dev --name add-onboarding-completed
```

Existing users: They all have resumes already (production users), so `default: false` is fine — we only redirect to onboarding when `!onboardingCompleted && resumeCount === 0` (both conditions).

---

## 2. Routing & Redirect Logic

### 2a. Change Clerk redirect for sign-ups only

**File**: `src/app/layout.tsx`

```tsx
<ClerkProvider
  signInForceRedirectUrl="/dashboard"    // existing users → dashboard (unchanged)
  signUpForceRedirectUrl="/onboarding"   // NEW users → onboarding
>
```

### 2b. Add `/onboarding` to protected routes

**File**: `src/middleware.ts`

```ts
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/resume-builder(.*)',
  '/settings(.*)',
  '/billing(.*)',
  '/admin(.*)',
  '/onboarding(.*)',   // NEW
])
```

### 2c. Dashboard guard — redirect to onboarding if needed

**File**: `src/app/dashboard/page.tsx`

After fetching resumes, if `resumes.length === 0`, call a new API endpoint to check onboarding status. If not completed, `router.replace('/onboarding')`.

```ts
// Inside the fetchResumes useEffect, after setting resumes:
if (data.resumes.length === 0) {
  const statusRes = await fetch('/api/user/onboarding-status')
  const statusData = await statusRes.json()
  if (!statusData.onboardingCompleted) {
    router.replace('/onboarding')
    return
  }
}
```

### 2d. Onboarding page guard — redirect to dashboard if already done

**File**: `src/app/onboarding/page.tsx`

On mount, check if user already has resumes or completed onboarding. If so, redirect to `/dashboard`.

---

## 3. New API Endpoints

### 3a. GET `/api/user/onboarding-status`

**File**: `src/app/api/user/onboarding-status/route.ts`

Returns `{ onboardingCompleted: boolean, resumeCount: number, userName: string | null }`.

- Authenticates via Clerk `auth()`
- Looks up User record by clerkId
- Returns the `onboardingCompleted` flag + `subscription.resumeCount`

### 3b. POST `/api/user/onboarding-complete`

**File**: `src/app/api/user/onboarding-complete/route.ts`

Accepts `{ fullName: string, template: string }`. Creates the user's first resume and marks onboarding as complete.

Flow:
1. Authenticate via Clerk
2. Find user by clerkId
3. Update user `name` if provided
4. Check `canCreateResume` limit (should pass for new users)
5. Create resume via existing `createResume()` function with selected template
6. If `formData` provided (from CV upload), update resume with that data
7. Set `user.onboardingCompleted = true`
8. Return `{ resumeId: string }`

Request body:
```ts
{
  fullName: string
  template: string           // template ID from step 2
  formData?: ResumeData      // from CV upload (step 3, option A)
}
```

### 3c. POST `/api/user/onboarding-skip`

**File**: `src/app/api/user/onboarding-skip/route.ts`

Marks onboarding as complete without creating a resume. Sets `onboardingCompleted = true`.

---

## 4. Onboarding Page Component

### File: `src/app/onboarding/page.tsx`

Client component with 3 steps managed by `currentStep` state (1, 2, 3).

### Structure

```
OnboardingPage
├── Guard: check onboarding status → redirect if done
├── Progress Dots (top, centered)
├── Step Content (animated transition)
│   ├── Step 1: WelcomeStep (name input)
│   ├── Step 2: TemplatePickerStep (full-size template previews)
│   └── Step 3: StartMethodStep (upload CV or start blank)
└── Skip button (bottom, subtle text link)
```

### State

```ts
const [currentStep, setCurrentStep] = useState(1)
const [fullName, setFullName] = useState('')          // pre-filled from Clerk
const [selectedTemplate, setSelectedTemplate] = useState('modern')
const [uploadedData, setUploadedData] = useState<ResumeData | null>(null)
const [isSubmitting, setIsSubmitting] = useState(false)
```

### Layout (Mobile-First)

- Full viewport height (`min-h-screen`), centered content
- Max width container: `max-w-lg` for steps 1 & 3, `max-w-4xl` for step 2 (template grid needs room)
- White background, clean and minimal
- Content vertically centered with flexbox
- Progress dots: 3 small circles at top, filled = completed/current, outlined = future

### Transitions

Use CSS transitions on step containers:
- Wrap steps in a container with `transition-opacity duration-300`
- Fade out old step → fade in new step
- Or use `transform: translateX()` for slide effect
- Keep it simple — no heavy animation library needed

### Progress Dots Component

```tsx
function ProgressDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex justify-center gap-2 mb-8">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={`h-2.5 rounded-full transition-all duration-300 ${
            i + 1 === current
              ? 'w-8 bg-primary'
              : i + 1 < current
                ? 'w-2.5 bg-primary'
                : 'w-2.5 bg-gray-200'
          }`}
        />
      ))}
    </div>
  )
}
```

The current step dot is elongated (pill shape), completed dots are filled circles, future dots are gray outlines.

---

## 5. Step 1: Welcome + Name

### Design

- Warm greeting: "Welcome to Work.krd!" (large heading)
- Friendly subtext: "Let's create your first professional resume"
- Single input: "What's your full name?" with large, prominent input field
- Pre-fill from Clerk: `useUser()` hook → `user.firstName + ' ' + user.lastName`
- "Continue" button (primary, full-width on mobile)
- Input auto-focused on mount

### Pre-fill Logic

```tsx
const { user, isLoaded } = useUser()

useEffect(() => {
  if (isLoaded && user && !fullName) {
    const clerkName = [user.firstName, user.lastName].filter(Boolean).join(' ')
    if (clerkName) setFullName(clerkName)
  }
}, [isLoaded, user])
```

### Validation

- Name must not be empty to proceed (but don't be aggressive — show gentle inline message)
- Trim whitespace

---

## 6. Step 2: Pick Your Style

### Design

- Heading: "Pick your style"
- Subtext: "Choose a template — you can always change it later"
- Grid of template previews: 2 columns on mobile, 3 on desktop
- Each preview is a **full-size rendered template** (not just SVG thumbnails)
- Click to select → blue border/highlight
- Selected template shows a checkmark badge
- "Continue" button at bottom

### Template Preview Approach

**Option A (Recommended): Scaled-down TemplateRenderer**

Render each template using `TemplateRenderer` with sample data, wrapped in a scaled container:

```tsx
<div className="relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all"
     style={{ width: '100%', aspectRatio: '210/297' }}>
  <div style={{
    width: '794px',
    transform: `scale(${containerWidth / 794})`,
    transformOrigin: 'top left',
  }}>
    <TemplateRenderer templateId={template.id} data={sampleData} />
  </div>
</div>
```

This shows the ACTUAL template rendered with realistic data — much more compelling than static SVGs.

**Sample data**: Create a `sampleResumeData` constant with the user's name (from step 1) + realistic dummy data (job title, experience, education, skills). Use the user's actual name to make it feel personal.

**Performance note**: Rendering 6 full templates at once could be heavy on mobile. Mitigations:
- Lazy-load templates below the fold (IntersectionObserver)
- Or use the existing SVG thumbnails as initial view with a "Preview full size" tap that expands one at a time
- Or render 2 at a time in a carousel/swiper on mobile

**Recommendation**: On mobile, show a horizontal swipeable carousel (one template visible at a time, swipe to see next). On desktop, show 2×3 grid. This keeps mobile performance good and feels native.

**Actually, simplest approach**: Use the existing SVG thumbnails but rendered LARGER (filling most of the card width) rather than the tiny 72×96 boxes in TemplateSwitcher. This is fast and still looks good. Reserve full TemplateRenderer for desktop or for a "preview" tap.

**Final decision**: Use SVG thumbnails rendered large (fill card width, ~160×213px on mobile, ~240×320px on desktop). They're lightweight and already exist. Add the template name below each. The actual template building happens in step 3 anyway.

### No Subscription Gating

During onboarding, show ALL templates without lock badges. The user picks one they like — if it's a paid template, they'll see the watermark in the builder and can upgrade then. Don't kill the excitement during onboarding.

---

## 7. Step 3: How Do You Want to Start?

### Design

- Heading: "How do you want to start?"
- Two large option cards, stacked vertically on mobile, side by side on desktop:

**Card A — Upload your CV**
- Icon: Upload cloud
- Title: "Upload existing CV"
- Subtitle: "We'll extract your info from a PDF or Word file"
- On click: Show file upload area (reuse `ResumeUploader` component or inline a simplified version)

**Card B — Start from scratch**
- Icon: Pencil/Edit
- Title: "Start from scratch"
- Subtitle: "Build your resume step by step"
- On click: Immediately create resume and redirect

### Upload Flow

When user picks "Upload CV":
1. Show file upload area (drag-and-drop or browse)
2. Upload to existing `/api/resume/upload` endpoint
3. On success, store the parsed `ResumeData` in state (`uploadedData`)
4. Show brief success message: "Got it! We extracted your info"
5. Show "Create my resume" button
6. On click → POST `/api/user/onboarding-complete` with `{ fullName, template, formData: uploadedData }`

### Import Limit Consideration

**Current state**: Free users have `maxFreeImports: 0` — they can't import.

**Problem**: Most new users are FREE. If we block upload in onboarding, half the feature is useless.

**Solution**: Either:
1. **(Recommended)** Change `maxFreeImports` default to `1` (give every free user one import). This is a SystemSettings change, not a code change — update via admin dashboard or migration.
2. Bypass the import check during onboarding with an `onboarding: true` flag to the upload API.
3. Let free users see the upload option but show an upgrade prompt if they try.

**Recommendation**: Option 1 — change `maxFreeImports` to `1`. One free import is generous enough for onboarding and doesn't undermine the paid tier value.

### "Start from Scratch" Flow

1. POST `/api/user/onboarding-complete` with `{ fullName, template }` (no formData)
2. API creates resume with name pre-filled and selected template
3. Redirect to `/resume-builder?id=NEW_ID`

---

## 8. i18n — Translation Keys

### New key namespace: `pages.onboarding`

Add to all 3 locale files: `src/locales/{en,ar,ckb}/common.json`

```json
{
  "pages": {
    "onboarding": {
      "skip": "Skip for now",
      "step1": {
        "title": "Welcome to Work.krd!",
        "subtitle": "Let's create your first professional resume",
        "nameLabel": "What's your full name?",
        "namePlaceholder": "Enter your full name",
        "continue": "Continue"
      },
      "step2": {
        "title": "Pick your style",
        "subtitle": "Choose a template — you can always change it later",
        "continue": "Continue"
      },
      "step3": {
        "title": "How do you want to start?",
        "uploadCard": {
          "title": "Upload existing CV",
          "subtitle": "We'll extract your info from a PDF or Word file"
        },
        "scratchCard": {
          "title": "Start from scratch",
          "subtitle": "Build your resume step by step"
        },
        "uploadSuccess": "Got it! We extracted your info",
        "createResume": "Create my resume",
        "creating": "Creating your resume..."
      },
      "errors": {
        "nameRequired": "Please enter your name",
        "createFailed": "Something went wrong. Please try again."
      }
    }
  }
}
```

### Arabic (ar) translations — natural, not Google Translate

```json
{
  "pages": {
    "onboarding": {
      "skip": "تخطي الآن",
      "step1": {
        "title": "!Work.krd أهلاً بك في",
        "subtitle": "لنصنع سيرتك الذاتية الاحترافية الأولى",
        "nameLabel": "ما اسمك الكامل؟",
        "namePlaceholder": "أدخل اسمك الكامل",
        "continue": "متابعة"
      },
      "step2": {
        "title": "اختر تصميمك",
        "subtitle": "اختر قالباً — يمكنك تغييره لاحقاً",
        "continue": "متابعة"
      },
      "step3": {
        "title": "كيف تريد أن تبدأ؟",
        "uploadCard": {
          "title": "رفع سيرة ذاتية موجودة",
          "subtitle": "سنستخرج معلوماتك من ملف PDF أو Word"
        },
        "scratchCard": {
          "title": "البدء من الصفر",
          "subtitle": "ابنِ سيرتك الذاتية خطوة بخطوة"
        },
        "uploadSuccess": "تم! استخرجنا معلوماتك",
        "createResume": "أنشئ سيرتي الذاتية",
        "creating": "جارٍ إنشاء سيرتك الذاتية..."
      },
      "errors": {
        "nameRequired": "يرجى إدخال اسمك",
        "createFailed": "حدث خطأ ما. يرجى المحاولة مرة أخرى."
      }
    }
  }
}
```

### Kurdish Sorani (ckb) translations — natural Kurdish

```json
{
  "pages": {
    "onboarding": {
      "skip": "بازدان لە ئێستادا",
      "step1": {
        "title": "!Work.krd بەخێربێیت بۆ",
        "subtitle": "با یەکەم پێناسەنامەی پڕۆفیشناڵت دروست بکەین",
        "nameLabel": "ناوی تەواوت چییە؟",
        "namePlaceholder": "ناوی تەواوت بنووسە",
        "continue": "بەردەوامبوون"
      },
      "step2": {
        "title": "شێوازەکەت هەڵبژێرە",
        "subtitle": "داڕێژەیەک هەڵبژێرە — دواتر دەتوانیت بیگۆڕیت",
        "continue": "بەردەوامبوون"
      },
      "step3": {
        "title": "چۆن دەتەوێت دەست پێ بکەیت؟",
        "uploadCard": {
          "title": "پێناسەنامەی ئامادەت باربکە",
          "subtitle": "زانیارییەکانت لە فایلی PDF یان Word دەردەهێنین"
        },
        "scratchCard": {
          "title": "لە سفرەوە دەست پێ بکە",
          "subtitle": "پێناسەنامەکەت هەنگاو بە هەنگاو دروست بکە"
        },
        "uploadSuccess": "تەواو! زانیارییەکانت دەرهێنا",
        "createResume": "پێناسەنامەکەم دروست بکە",
        "creating": "پێناسەنامەکەت دروست دەکرێت..."
      },
      "errors": {
        "nameRequired": "تکایە ناوت بنووسە",
        "createFailed": "هەڵەیەک ڕوویدا. تکایە دووبارە هەوڵ بدەوە."
      }
    }
  }
}
```

---

## 9. File Plan (New + Modified)

### New Files

| File | Purpose |
|------|---------|
| `src/app/onboarding/page.tsx` | Onboarding wizard (3 steps, client component) |
| `src/app/api/user/onboarding-status/route.ts` | GET: check onboarding status |
| `src/app/api/user/onboarding-complete/route.ts` | POST: create resume + mark done |
| `src/app/api/user/onboarding-skip/route.ts` | POST: mark onboarding done without creating resume |
| `prisma/migrations/xxx_add_onboarding_completed/` | Prisma migration |

### Modified Files

| File | Change |
|------|--------|
| `prisma/schema.prisma` | Add `onboardingCompleted Boolean @default(false)` to User |
| `src/app/layout.tsx` | Change `signUpForceRedirectUrl` from `/dashboard` to `/onboarding` |
| `src/middleware.ts` | Add `/onboarding(.*)` to protected routes |
| `src/app/dashboard/page.tsx` | Add onboarding redirect check for users with 0 resumes |
| `src/locales/en/common.json` | Add `pages.onboarding.*` keys (~15 keys) |
| `src/locales/ar/common.json` | Add `pages.onboarding.*` keys (~15 keys) |
| `src/locales/ckb/common.json` | Add `pages.onboarding.*` keys (~15 keys) |

---

## 10. Implementation Order

### Phase 1: Backend (database + API)
1. Add `onboardingCompleted` to Prisma schema + migrate
2. Create `GET /api/user/onboarding-status` endpoint
3. Create `POST /api/user/onboarding-complete` endpoint
4. Create `POST /api/user/onboarding-skip` endpoint

### Phase 2: Routing changes
5. Update `layout.tsx` — change `signUpForceRedirectUrl` to `/onboarding`
6. Update `middleware.ts` — add `/onboarding` to protected routes
7. Update `dashboard/page.tsx` — add onboarding redirect guard

### Phase 3: Onboarding page
8. Build `onboarding/page.tsx` with all 3 steps
   - Progress dots
   - Step 1: Welcome + name input
   - Step 2: Template picker (SVG thumbnails, large format)
   - Step 3: Upload or start from scratch (reuse ResumeUploader)
   - Skip functionality
   - Submit flow → API call → redirect

### Phase 4: i18n
9. Add all translation keys to en, ar, ckb locale files

### Phase 5: Testing
10. Test: new user signup → lands on onboarding
11. Test: complete all 3 steps → resume created → redirected to builder
12. Test: skip onboarding → goes to dashboard → doesn't see onboarding again
13. Test: existing user with resumes → never sees onboarding
14. Test: returning user (sign in, not sign up) → goes to dashboard
15. Test: mobile layout (all 3 steps)
16. Test: RTL layout (Arabic/Kurdish)
17. Test: upload CV flow during onboarding

---

## 11. Design Specifications

### Colors & Styling
- Background: `bg-white` (clean, no distractions)
- Text: `text-gray-900` (headings), `text-gray-600` (subtext)
- Primary button: existing `Button` component (default variant)
- Skip link: `text-sm text-gray-400 hover:text-gray-600` — subtle, not prominent
- Template selected border: `border-2 border-primary ring-2 ring-primary/20`
- Template card: `rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow`

### Mobile Layout
- Full-width content with `px-4` padding
- Step 1: Name input full-width, large text (`text-lg`)
- Step 2: Template grid 1 column (full-width cards) or 2 small columns
- Step 3: Option cards stacked vertically, full-width
- Progress dots always visible at top
- Skip button at bottom center

### Desktop Layout
- Centered container `max-w-lg` (steps 1, 3) or `max-w-4xl` (step 2)
- Vertically centered with `min-h-screen flex items-center justify-center`
- Step 2 template grid: 3 columns

### Animations
- Step transitions: `opacity` + `transform: translateX()` with `duration-300 ease-in-out`
- Or simpler: just fade with `opacity transition-opacity duration-300`
- Progress dot width change: `transition-all duration-300`

---

## 12. Edge Cases & Considerations

### Race condition: Clerk webhook vs. onboarding page
- User signs up → Clerk redirects to `/onboarding`
- But the Clerk webhook (`user.created`) that creates the DB User + Subscription might not have fired yet
- **Solution**: The onboarding status API should handle "user not found" gracefully — return a loading/retry state. The onboarding page should poll or retry if user not found (webhook delay is typically <2 seconds).
- Alternative: The `onboarding-complete` API can create the user if it doesn't exist yet (upsert pattern).

### Template previews — sample data
- Generate a `sampleResumeData` object with:
  - `personal.fullName`: Use the name from step 1 (dynamic)
  - Other fields: Realistic but generic data (e.g., "Software Engineer", "Acme Corp")
- This makes the preview feel personalized

### Upload during onboarding and import limits
- Default `maxFreeImports` is `0` — free users can't import
- For onboarding: We need to either bump this to `1` or bypass the check
- **Recommendation**: Update SystemSettings to set `maxFreeImports: 1`
- This change should be a data migration or admin action, not a code change

### User who refreshes mid-onboarding
- State is lost (client-side only)
- This is acceptable — they start from step 1 again
- Name will be pre-filled from Clerk, so it's fast

### User who navigates away mid-onboarding
- They haven't created a resume yet, so `resumeCount === 0`
- Next time they visit dashboard, they'll be redirected back to onboarding
- Unless they clicked "Skip", which sets `onboardingCompleted = true`

### Multiple tabs
- Not a concern — onboarding is idempotent. If they complete it in two tabs, the second call to `onboarding-complete` will just fail gracefully (resume already created).
