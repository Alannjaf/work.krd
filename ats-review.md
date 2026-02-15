# ATS Scoring System — End-to-End Review

## Architecture Overview

```
User clicks "ATS" button (BuilderHeader.tsx)
    ↓
ATSOptimization.tsx modal opens (two tabs: Score / Keywords)
    ↓
POST /api/ats/score          POST /api/ats/keywords
    ↓                            ↓
Rate limit (10/60s IP)       Rate limit (10/60s IP)
Clerk auth                   Clerk auth
checkUserLimits()            checkUserLimits()
    ↓                            ↓
AIService.analyzeATSScore()  AIService.matchKeywords()
    ↓                            ↓
OpenRouter → Gemini 3 Flash  OpenRouter → Gemini 3 Flash
    ↓                            ↓
Atomic usage increment       Atomic usage increment
    ↓                            ↓
JSON response to frontend    JSON response to frontend
```

**Model**: `google/gemini-3-flash-preview` via OpenRouter
**Temperature**: 0.3 (both endpoints)
**Max tokens**: 1500 (score), 2000 (keywords)

---

## How Scoring Works

### Score Analysis (`/api/ats/score`)

The AI receives a plain-text version of the resume (HTML stripped) and evaluates it against 7 weighted criteria:

| Criterion                          | Points |
|------------------------------------|--------|
| Contact information completeness   | 10     |
| Professional summary quality       | 15     |
| Work experience + achievements     | 25     |
| Skills section + keywords          | 20     |
| Education completeness             | 10     |
| Structure & formatting             | 10     |
| Action verbs & professional lang   | 10     |
| **Total**                          | **100**|

The AI returns a 0-100 score, an issues array (type/severity/section/suggestion), strengths list, and top suggestions. The code clamps the score to [0, 100] but otherwise trusts the AI's calculation entirely.

### Keyword Matching (`/api/ats/keywords`)

Takes resume + job description. AI extracts keywords from the JD, checks semantic matches in the resume (cross-language: English/Arabic/Kurdish), and categorizes each as:
- **critical** — required qualifications
- **important** — preferred qualifications
- **nice-to-have** — bonus skills

Returns a matchScore (0-100), matched keywords, missing keywords with per-section suggestions, and improvement recommendations.

---

## AI Prompts Analysis

### Score Prompt — Strengths
- Clear 7-criterion rubric with point allocations
- Multilingual awareness — doesn't penalize Arabic/Kurdish resumes
- Smart exclusions — ignores date formatting and bullet point styling (platform handles these)
- Cross-references skills before flagging missing ones (reduces false positives)
- Section-tagged issues enable the frontend to navigate users to the right form section

### Score Prompt — Weaknesses
1. **No job context**: Scores a resume in isolation. A perfect resume for a teacher would score the same when applying for a software engineer role. The score becomes meaningless without job context.
2. **Scoring is fully AI-delegated**: The 7-criteria breakdown is aspirational — the AI can weight however it wants. No programmatic verification that points add up to 100.
3. **"Structure & formatting" is meaningless**: The prompt tells the AI to ignore formatting issues (bullet points, headers, etc.) because the platform handles them — then awards 10 points for "structure and formatting." Contradictory.
4. **No penalty calibration**: No examples of what a 30 vs 60 vs 90 resume looks like. Different AI runs may calibrate differently.
5. **English-only feedback**: All suggestions come back in English regardless of resume language. Users writing in Kurdish see English improvement tips.

### Keywords Prompt — Strengths
- Semantic cross-language matching (Kurdish/Arabic ↔ English equivalents)
- Section-aware suggestions (tells users exactly where to add missing keywords)
- Importance categorization helps users prioritize

### Keywords Prompt — Weaknesses
1. **Resume text is severely truncated**: The `matchKeywords()` method only sends title, summary, experience descriptions, and skills. **Education, languages, projects, and certifications are omitted.** A keyword like "PMP certification" or "Master's degree" will always show as missing.
2. **Experience concatenation loses structure**: All entries joined with `;` — AI can't distinguish role boundaries.
3. **No importance weighting rules**: "Critical" vs "important" is entirely at the AI's discretion with no examples. Inconsistent across calls.
4. **No deduplication**: If user lists "JavaScript" and "JS", AI may count both or neither.

---

## Critical Issues

### 1. Wasted AI Call on Race Condition (Both Routes)
**Problem**: The limit check happens *before* the AI call, but the atomic increment happens *after*. If two requests pass the initial check simultaneously, both call the AI, but only one succeeds at increment. The losing request wasted an AI API call and the user sees a 403 after waiting for analysis.

**Fix**: Move the atomic increment *before* the AI call. If it fails, return 403 immediately without calling the AI.

### 2. Keywords Route Omits Half the Resume
**Problem**: `matchKeywords()` only includes `personal.title`, `summary`, `experience`, and `skills` in the text sent to AI. Education, languages, projects, and certifications are completely missing.

**Impact**: Keywords found only in education ("MBA"), certifications ("AWS Certified"), projects ("React Native"), or languages ("Fluent Arabic") will always be flagged as missing — false negatives.

**Fix**: Use the same comprehensive resume text builder from `analyzeATSScore()` (which includes all sections).

### 3. Usage Counter Never Updates in UI
**Problem**: `ATSOptimization.tsx` receives `atsUsed`/`atsLimit` as props but never updates them. The API returns fresh `usage` data in every response, but it's ignored. After running 3 analyses in one session, the subtitle still shows the original count.

**Fix**: Accept an `onUsageUpdate` callback prop or lift usage state to the parent.

### 4. No Server-Side Error Logging
**Problem**: Both routes have `catch (error) { return errorResponse('...', 500) }` with no `console.error()`. AI failures, JSON parse errors, and Prisma connection issues are completely silent in production.

**Fix**: Add `console.error('[ATS Score]', error)` in catch blocks.

---

## High-Priority Improvements

### 5. Score Without Job Context is Low-Value
The score endpoint evaluates a resume generically. Users get "85/100" with no indication of whether that's good for *their target role*. The keywords endpoint is job-specific but requires extra effort (paste JD).

**Suggestion**: Add optional `targetRole` parameter to the score endpoint. If provided, include it in the prompt: "Evaluate this resume for a [targetRole] position." This bridges the gap between generic scoring and job-specific keyword matching.

### 6. Inconsistent Resume Text Between Endpoints
`analyzeATSScore()` builds a comprehensive text with all sections. `matchKeywords()` builds a minimal 4-field text. This means the score endpoint evaluates the full resume while the keywords endpoint evaluates a subset.

**Fix**: Extract a shared `buildResumeText(resumeData)` utility used by both methods.

### 7. Hardcoded Model and Parameters
Model (`google/gemini-3-flash-preview`), temperature (0.3), and max tokens (1500/2000) are hardcoded. No way to A/B test or switch models without deploying.

**Fix**: Move to environment variables: `ATS_AI_MODEL`, `ATS_AI_TEMPERATURE`, `ATS_SCORE_MAX_TOKENS`.

### 8. No Input Schema Validation
Both routes accept `resumeData` without validating its shape. Malformed input (missing `personal`, arrays that are actually strings) gets passed to the AI, producing garbage results.

**Fix**: Add Zod schema validation before processing.

### 9. Duplicate i18n Key Namespaces
ATS keys exist in both `resumeBuilder.ats.*` and `pages.resumeBuilder.ats.*` across all three locales. Only the `pages.*` namespace is actually used.

**Fix**: Remove the duplicate `resumeBuilder.ats.*` keys from all locale files.

---

## Medium-Priority Improvements

### 10. IP-Based Rate Limiting is Fragile
Rate limiting uses IP address only. Behind Cloudflare/corporate proxies, all users share one bucket. An attacker can also spoof `x-forwarded-for` if the proxy isn't configured to strip it.

**Suggestion**: Use `userId + IP` as the rate limit key for authenticated requests. Trust only the last hop's IP if behind a known proxy.

### 11. No Timeout on AI Calls
If OpenRouter hangs, the request blocks indefinitely until the platform timeout (Vercel: 60s, Netlify: 26s). No explicit timeout in the code.

**Fix**: Wrap AI calls in `Promise.race()` with a 30s timeout.

### 12. No Request Size Limit
The score endpoint doesn't validate `Content-Length`. A malicious user could send a 100MB JSON body.

**Fix**: Check `Content-Length` header before parsing, reject > 1MB.

### 13. Missing Accessibility in Modal
- Textarea has no `id`/`htmlFor` label association
- No `aria-label` on modal or tab buttons
- No Escape key handler for closing modal
- No focus trap inside modal

### 14. Importance Badge Has No Fallback
The `getImportanceBadge()` switch in `ATSOptimization.tsx` has no `default` case. If AI returns an unexpected importance value, the badge renders nothing.

### 15. "General" Issues Navigate to Wrong Section
Issues with `section: "general"` map to section index 0 (Personal/About You). Clicking "Edit" on a general suggestion takes the user to the wrong place.

**Fix**: Disable the edit/navigate CTA for general issues.

---

## Low-Priority / Nice-to-Have

### 16. Client-Side Result Caching
Same resume analyzed twice = two AI calls. Cache last result per tab and invalidate on resume data change.

### 17. Loading Skeleton
During analysis, the content area is empty. Show placeholder cards matching the result layout.

### 18. Score Color Thresholds Duplicated
The 80/60 thresholds appear in 4 separate functions. Extract to a constant.

### 19. Component Size
`ATSOptimization.tsx` is 591 lines with inline sub-components. Consider extracting `ScoreTab` and `KeywordsTab` to separate files.

### 20. stripHtml() Is Duplicated
The `stripHtml()` helper is defined independently in both `analyzeATSScore()` and `matchKeywords()`. Extract to a shared utility.

---

## Prompt Improvement Suggestions

### Score Prompt
```diff
  Evaluation criteria:
- 6. Overall structure and formatting (10 points)
+ 6. Keyword density and relevance to stated job title (10 points)

+ CALIBRATION:
+ - 90-100: Exceptional — all sections complete, quantified achievements, strong keywords
+ - 70-89: Good — minor gaps in quantification or keywords
+ - 50-69: Needs work — missing sections or weak descriptions
+ - Below 50: Major issues — incomplete resume or critical sections missing

+ If the resume includes a job title in the personal section, weight your
+ evaluation toward relevance for that type of role.
```

### Keywords Prompt
```diff
  RESUME:
- [minimal 4-field text]
+ [full resume text including education, languages, projects, certifications]

+ When categorizing importance:
+ - "critical": Explicitly listed as "required" or "must-have" in the job description
+ - "important": Listed as "preferred", "desired", or appears in core responsibilities
+ - "nice-to-have": Mentioned once, in bonus/supplementary sections, or implied

+ Cross-reference ALL resume sections before marking a keyword as missing.
+ A certification listed under Certifications counts as a match.
+ A technology listed under Projects counts as a match.
```

---

## Summary

| Category | Finding | Severity |
|----------|---------|----------|
| Keywords route omits education/projects/certs | False negatives in matching | Critical |
| AI called before atomic limit check | Wasted API calls on race | Critical |
| No error logging in routes | Silent production failures | Critical |
| Usage count stale in UI | Misleading UX | High |
| Score has no job context | Low-value generic score | High |
| Resume text builders inconsistent | Different data per endpoint | High |
| No input validation (Zod) | Garbage-in, garbage-out | High |
| Duplicate i18n namespaces | Maintenance burden | Medium |
| No AI call timeout | Potential request hangs | Medium |
| IP-only rate limiting | Fragile under proxy | Medium |
| Missing accessibility (modal) | Screen reader issues | Medium |
| No result caching | Wasted API calls | Low |
| Hardcoded model/params | No A/B testing | Low |
| 591-line component | Poor maintainability | Low |
