export async function register() {
  // Validate critical env vars at startup — fail fast instead of silent degradation
  const required = [
    'DATABASE_URL',
    'CLERK_SECRET_KEY',
    'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
  ]

  const missing = required.filter((key) => !process.env[key])

  if (missing.length > 0) {
    throw new Error(
      `[ENV] Missing required environment variables: ${missing.join(', ')}. ` +
      'Check your .env.local file.'
    )
  }

  // Warn about optional but recommended vars
  const recommended = [
    'OPENROUTER_API_KEY',
    'CRON_SECRET',
    'TELEGRAM_BOT_TOKEN',
  ]

  const missingRecommended = recommended.filter((key) => !process.env[key])
  if (missingRecommended.length > 0) {
    console.warn(
      `[ENV] Missing recommended environment variables: ${missingRecommended.join(', ')}. ` +
      'Some features (AI, cron, notifications) will be disabled.'
    )
  }
}
