import { prisma } from './prisma'

// Track if initialization has been done in this session
let isInitialized = false

export async function initializeDatabase() {
  // Skip if already initialized in this session
  if (isInitialized) {
    return
  }

  try {
    // Check if table exists first
    const tableExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'SystemSettings'
      ) as exists
    ` as { exists: boolean }[]

    if (!tableExists[0].exists) {
      // Create table only if it doesn't exist
      await prisma.$executeRaw`
        CREATE TABLE "SystemSettings" (
          id SERIAL PRIMARY KEY,
          "maxFreeResumes" INTEGER DEFAULT 10,
          "maxFreeAIUsage" INTEGER DEFAULT 100,
          "maxFreeExports" INTEGER DEFAULT 20,
          "maxBasicResumes" INTEGER DEFAULT 50,
          "maxBasicAIUsage" INTEGER DEFAULT 500,
          "maxBasicExports" INTEGER DEFAULT 100,
          "maxProResumes" INTEGER DEFAULT -1,
          "maxProAIUsage" INTEGER DEFAULT -1,
          "maxProExports" INTEGER DEFAULT -1,
          "basicPlanPrice" INTEGER DEFAULT 5000,
          "proPlanPrice" INTEGER DEFAULT 10000,
          "maintenanceMode" BOOLEAN DEFAULT FALSE,
          "updatedAt" TIMESTAMP DEFAULT NOW()
        )
      `
      // Created SystemSettings table
    }

    // Add any missing columns (for migration purposes)
    const alterStatements = [
      'ALTER TABLE "SystemSettings" ADD COLUMN IF NOT EXISTS "maxFreeExports" INTEGER DEFAULT 20',
      'ALTER TABLE "SystemSettings" ADD COLUMN IF NOT EXISTS "maxBasicResumes" INTEGER DEFAULT 50',
      'ALTER TABLE "SystemSettings" ADD COLUMN IF NOT EXISTS "maxBasicAIUsage" INTEGER DEFAULT 500',
      'ALTER TABLE "SystemSettings" ADD COLUMN IF NOT EXISTS "maxBasicExports" INTEGER DEFAULT 100',
      'ALTER TABLE "SystemSettings" ADD COLUMN IF NOT EXISTS "maxProResumes" INTEGER DEFAULT -1',
      'ALTER TABLE "SystemSettings" ADD COLUMN IF NOT EXISTS "maxProAIUsage" INTEGER DEFAULT -1',
      'ALTER TABLE "SystemSettings" ADD COLUMN IF NOT EXISTS "maxProExports" INTEGER DEFAULT -1'
    ]

    for (const statement of alterStatements) {
      try {
        await prisma.$executeRawUnsafe(statement)
      } catch (error) {
        console.error('[InitDB] Failed to alter column:', error);
        // Column already exists, continue
      }
    }

    // Check if SystemSettings has any records
    const settingsCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM "SystemSettings"
    ` as { count: string | number | null }[]

    // If no records exist, insert the default record
    if (settingsCount[0].count === '0' || settingsCount[0].count === 0 || settingsCount[0].count === null) {
      await prisma.$executeRaw`
        INSERT INTO "SystemSettings" 
        ("maxFreeResumes", "maxFreeAIUsage", "maxFreeExports", "maxBasicResumes", "maxBasicAIUsage", "maxBasicExports", "maxProResumes", "maxProAIUsage", "maxProExports", "basicPlanPrice", "proPlanPrice", "maintenanceMode")
        VALUES (10, 100, 20, 50, 500, 100, -1, -1, -1, 5000, 10000, FALSE)
      `
      // Initialized SystemSettings with default values
    } else {
      // SystemSettings table has existing records
    }

    // Mark as initialized for this session
    isInitialized = true
  } catch (error) {
    console.error('[InitDB] Failed to initialize database:', error);
    // Error initializing database
  }
}