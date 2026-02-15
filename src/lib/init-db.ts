import { prisma } from './prisma'

// Track if initialization has been done in this session
let isInitialized = false

export async function initializeDatabase() {
  if (isInitialized) {
    return
  }

  try {
    const tableExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'SystemSettings'
      ) as exists
    ` as { exists: boolean }[]

    if (!tableExists[0].exists) {
      await prisma.$executeRaw`
        CREATE TABLE "SystemSettings" (
          id SERIAL PRIMARY KEY,
          "maxFreeResumes" INTEGER DEFAULT 10,
          "maxFreeAIUsage" INTEGER DEFAULT 100,
          "maxFreeExports" INTEGER DEFAULT 20,
          "maxFreeImports" INTEGER DEFAULT 1,
          "maxFreeATSChecks" INTEGER DEFAULT 0,
          "maxProResumes" INTEGER DEFAULT -1,
          "maxProAIUsage" INTEGER DEFAULT -1,
          "maxProExports" INTEGER DEFAULT -1,
          "maxProImports" INTEGER DEFAULT -1,
          "maxProATSChecks" INTEGER DEFAULT -1,
          "proPlanPrice" INTEGER DEFAULT 5000,
          "maintenanceMode" BOOLEAN DEFAULT FALSE,
          "updatedAt" TIMESTAMP DEFAULT NOW(),
          "freeTemplates" JSONB DEFAULT '["modern"]',
          "proTemplates" JSONB DEFAULT '["modern"]',
          "photoUploadPlans" JSONB DEFAULT '["PRO"]'
        )
      `
    }

    // Add any missing columns (for migration purposes)
    const alterStatements = [
      'ALTER TABLE "SystemSettings" ADD COLUMN IF NOT EXISTS "maxFreeExports" INTEGER DEFAULT 20',
      'ALTER TABLE "SystemSettings" ADD COLUMN IF NOT EXISTS "maxFreeImports" INTEGER DEFAULT 1',
      'ALTER TABLE "SystemSettings" ADD COLUMN IF NOT EXISTS "maxFreeATSChecks" INTEGER DEFAULT 0',
      'ALTER TABLE "SystemSettings" ADD COLUMN IF NOT EXISTS "maxProResumes" INTEGER DEFAULT -1',
      'ALTER TABLE "SystemSettings" ADD COLUMN IF NOT EXISTS "maxProAIUsage" INTEGER DEFAULT -1',
      'ALTER TABLE "SystemSettings" ADD COLUMN IF NOT EXISTS "maxProExports" INTEGER DEFAULT -1',
      'ALTER TABLE "SystemSettings" ADD COLUMN IF NOT EXISTS "maxProImports" INTEGER DEFAULT -1',
      'ALTER TABLE "SystemSettings" ADD COLUMN IF NOT EXISTS "maxProATSChecks" INTEGER DEFAULT -1'
    ]

    for (const statement of alterStatements) {
      try {
        await prisma.$executeRawUnsafe(statement)
      } catch (error) {
        console.error('[InitDB] Failed to alter column:', error);
      }
    }

    // Check if SystemSettings has any records
    const settingsCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM "SystemSettings"
    ` as { count: string | number | null }[]

    if (settingsCount[0].count === '0' || settingsCount[0].count === 0 || settingsCount[0].count === null) {
      await prisma.$executeRaw`
        INSERT INTO "SystemSettings"
        ("maxFreeResumes", "maxFreeAIUsage", "maxFreeExports", "maxProResumes", "maxProAIUsage", "maxProExports", "proPlanPrice", "maintenanceMode")
        VALUES (10, 100, 20, -1, -1, -1, 5000, FALSE)
      `
    }

    isInitialized = true
  } catch (error) {
    console.error('[InitDB] Failed to initialize database:', error);
  }
}
