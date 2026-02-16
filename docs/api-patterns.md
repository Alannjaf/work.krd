# API Patterns & Conventions

## Rate Limiting

### Pattern
```typescript
import { rateLimit } from '@/lib/rate-limit'

// In API route
const identifier = `${userId}:${ipAddress}`
const { success, remaining } = await rateLimit(identifier, 10, 60000) // 10 req/60s
if (!success) {
  return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
}
```

### ATS Feature
- 10 requests/60s per userId+IP (authenticated)
- Uses `rateLimit()` from `@/lib/rate-limit`

## Error Handling

### Never Expose Internal Errors
```typescript
// ❌ BAD
return NextResponse.json({ error: error.message }, { status: 500 })

// ✅ GOOD
console.error('Failed to process request:', error)
return NextResponse.json({ error: 'Failed to process request' }, { status: 500 })
```

### Use devError in Production Code
```typescript
import { devError } from '@/lib/admin-utils'

// Only logs in development, tree-shaken in production
devError('Failed to fetch user:', error)
```

## Validation

### Zod Schemas
```typescript
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(1),
  age: z.number().int().positive()
})

const result = schema.safeParse(data)
if (!result.success) {
  return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
}
```

### ATS Example
```typescript
import { resumeDataSchema } from '@/lib/ats-utils'

const result = resumeDataSchema.safeParse(resumeData)
if (!result.success) {
  return NextResponse.json({ error: 'Invalid resume data' }, { status: 400 })
}
```

### Request Size Limits
```typescript
// Check Content-Length header
const contentLength = parseInt(req.headers.get('content-length') || '0')
if (contentLength > MAX_REQUEST_SIZE) {
  return NextResponse.json({ error: 'Request too large' }, { status: 413 })
}
```

### Env Var Parsing
- Use `clampNumber(value, fallback, min, max)` from `ats-utils.ts`
- For bounded validation of `parseInt`/`parseFloat` env vars
```typescript
const timeout = clampNumber(
  parseInt(process.env.TIMEOUT_MS || ''),
  30000,  // fallback
  1000,   // min
  120000  // max
)
```

## Atomic Operations

### Limit Enforcement Pattern
```typescript
// ✅ GOOD — Atomic check + increment
const result = await prisma.subscription.updateMany({
  where: {
    userId,
    atsUsageCount: { lt: limit }  // Only update if under limit
  },
  data: {
    atsUsageCount: { increment: 1 }
  }
})

if (result.count === 0) {
  // Limit was reached (concurrent request won the race)
  return NextResponse.json({ error: 'Limit reached' }, { status: 403 })
}

// Now proceed with expensive AI call...
```

### Unlimited Plans
```typescript
if (atsLimit === -1) {
  // Just increment, skip atomic check
  await prisma.subscription.update({
    where: { userId },
    data: { atsUsageCount: { increment: 1 } }
  })
}
```

## Timeouts

### Timeout Wrapper
```typescript
import { withTimeout } from '@/lib/ats-utils'

const response = await withTimeout(
  expensiveAICall(),
  30000,  // 30s timeout
  'AI request timed out'
)
```

## Response Formats

### Success Response
```typescript
return NextResponse.json({
  data: result,
  message: 'Operation successful'
}, { status: 200 })
```

### Error Response
```typescript
return NextResponse.json({
  error: 'User-friendly error message'
}, { status: 400 })
```

### Paginated Response
```typescript
return NextResponse.json({
  data: items,
  pagination: {
    page,
    limit,
    total,
    hasNextPage: (page * limit) < total,
    hasPrevPage: page > 1
  }
})
```

## Cache Control

### Sensitive User Data
```typescript
// Subscription data, permissions — never cache
return NextResponse.json(data, {
  status: 200,
  headers: {
    'Cache-Control': 'private, no-store'
  }
})
```

### Public Stats
```typescript
// Public data with shared cache
return NextResponse.json(data, {
  status: 200,
  headers: {
    'Cache-Control': 'public, s-maxage=300'  // 5min CDN cache
  }
})
```

## Authentication Helpers

### `requireAdminWithId()`
```typescript
import { requireAdminWithId } from '@/lib/admin'

export async function POST(req: Request) {
  const { userId, clerkId } = await requireAdminWithId()
  // ... admin-only logic
}
```

### `getCurrentUser()`
```typescript
import { getCurrentUser } from '@/lib/db'

const user = await getCurrentUser()
if (!user) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
```

## Transaction Patterns

### Multi-Step Operations
```typescript
await prisma.$transaction(async (tx) => {
  // Step 1: Update payment status with race-condition check
  const payment = await tx.payment.updateMany({
    where: {
      id: paymentId,
      status: 'PENDING'  // Only update if still pending
    },
    data: {
      status: 'APPROVED',
      reviewedBy: adminId,
      reviewedAt: new Date()
    }
  })

  if (payment.count === 0) {
    throw new Error('Payment already processed')
  }

  // Step 2: Upsert subscription
  await tx.subscription.upsert({
    where: { userId },
    create: { userId, plan: 'PRO', ... },
    update: { plan: 'PRO', ... }
  })

  // Step 3: Log action
  await tx.adminAuditLog.create({
    data: { action: 'APPROVE_PAYMENT', ... }
  })
})
```

## CSRF Protection

### POST/DELETE Routes
```typescript
const origin = req.headers.get('origin')
const host = req.headers.get('host')

if (origin && !origin.includes(host || '')) {
  return NextResponse.json({ error: 'Invalid origin' }, { status: 403 })
}
```

## Prisma Patterns

### Json Field Handling
```typescript
// ✅ GOOD — Pass arrays directly
await prisma.systemSettings.update({
  where: { id: 1 },
  data: {
    proTemplates: ['modern', 'elegant', 'bold']
  }
})

// ❌ BAD — Don't JSON.stringify
data: {
  proTemplates: JSON.stringify(['modern', 'elegant', 'bold'])  // Double-encoding!
}
```

### Template Access for PRO
```typescript
// PRO always gets all registered templates, regardless of DB settings
const availableTemplates = plan === 'PRO'
  ? getTemplateIds()  // All templates
  : settings.freeTemplates || ['modern']
```

### Two getSystemSettings()
- Private one in `db.ts`: Parses JSON arrays, 30s TTL, used by `checkUserLimits`
- Exported one in `system-settings.ts`: Raw Prisma result, 60s TTL, used by admin API

## Upload Handling

### Multipart Form Data
```typescript
const formData = await req.formData()
const file = formData.get('screenshot') as File

if (!file) {
  return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
}

// Convert to Buffer for Prisma Bytes field
const bytes = await file.arrayBuffer()
const buffer = Buffer.from(bytes)

await prisma.payment.create({
  data: {
    screenshot: buffer
  }
})
```

### Binary Storage
```typescript
// Prisma Bytes field = Buffer in Node.js
// Convert to base64 data URL for client
const base64 = payment.screenshot.toString('base64')
const dataUrl = `data:image/png;base64,${base64}`
```

## External API Integration

### Telegram Notifications
```typescript
// Non-blocking notification (don't await, don't fail on error)
sendTelegramNotification(data).catch(err => {
  console.error('Telegram notification failed:', err)
  // Don't throw — notification failure shouldn't break the main flow
})
```

## Shared Utilities

### Resume Upload Utils (`src/lib/resume-upload-utils.ts`)
- `convertDateFormat(date)` — normalize date strings
- `isCurrentDate(date)` — detect "Present"/"Current"
- `normalizeLanguage(lang)` — clean language names
- `normalizeSkill(skill)` — clean skill names
- `cleanJsonResponse(text)` — strip markdown code fences from AI responses

### ATS Utils (`src/lib/ats-utils.ts`)
- `stripHtml(html)` — remove HTML tags
- `buildResumeText(data)` — flatten resume data to text
- `resumeDataSchema` — Zod validation
- `ATS_AI_CONFIG` — env var config
- `withTimeout(promise, ms, msg)` — timeout wrapper
- `ATS_SCORE_THRESHOLDS` — score color ranges
- `MAX_REQUEST_SIZE` — 1MB limit

### JSON Utils (`src/lib/json-utils.ts`)
- `parseJsonArray(value)` — safely parse Prisma Json fields to arrays
- Used by both `db.ts` and `system-settings.ts`

## Environment Validation

### Startup Check (`src/lib/env-validation.ts`)
```typescript
// Called at module load in db.ts
validateEnvVars()

// Checks:
// - CLERK_SECRET_KEY
// - DATABASE_URL
// - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

// Throws if missing — app won't start with bad config
```

## Export Tracking

### Download vs Preview
```typescript
// Only 'download' action increments exportCount
if (action === 'download') {
  await prisma.subscription.update({
    where: { userId },
    data: { exportCount: { increment: 1 } }
  })
}
// Preview generates PDF but doesn't count as export
```

## Subscription Expiry

### Manual Process
- Not scheduled/automated
- Admin triggers via button: POST `/api/subscriptions/check-expired`
- Downgrades to FREE
- Preserves usage counts (doesn't reset counters)

### Status Check
```typescript
// GET /api/subscriptions/check-expired
// Returns count of expired subscriptions without processing
```
