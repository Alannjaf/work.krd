/**
 * Validate that required environment variables are set.
 * Called at module load time in critical server modules (e.g., db.ts).
 * Fails fast with a clear error rather than silently degrading.
 */
const REQUIRED_ENV_VARS = [
  'CLERK_SECRET_KEY',
  'DATABASE_URL',
  'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
] as const

let validated = false

export function validateEnvVars() {
  if (validated) return
  validated = true

  const missing = REQUIRED_ENV_VARS.filter(key => !process.env[key])
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}. ` +
      `Check your .env.local file.`
    )
  }
}
