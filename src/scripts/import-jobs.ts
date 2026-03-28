import 'dotenv/config'
import fs from 'fs'
import path from 'path'

const CACHE_PATH = 'C:/Users/alan0/Desktop/Projects/tools/jobs_cache.json'
const API_BASE = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
const IMPORT_KEY = process.env.JOB_IMPORT_KEY

async function main() {
  if (!IMPORT_KEY) {
    console.error('ERROR: JOB_IMPORT_KEY environment variable is not set.')
    console.error('Set it in .env: JOB_IMPORT_KEY=your-secret-key')
    process.exit(1)
  }

  // Read cache file
  let jobs: unknown[]
  try {
    const raw = fs.readFileSync(path.resolve(CACHE_PATH), 'utf-8')
    jobs = JSON.parse(raw)
    if (!Array.isArray(jobs)) {
      console.error('ERROR: jobs_cache.json is not an array')
      process.exit(1)
    }
  } catch (err) {
    console.error('ERROR: Could not read jobs_cache.json:', err)
    process.exit(1)
  }

  console.log(`Found ${jobs.length} jobs in cache file`)
  console.log(`Importing to ${API_BASE}/api/jobs/import ...`)

  try {
    const res = await fetch(`${API_BASE}/api/jobs/import`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Import-Key': IMPORT_KEY,
      },
      body: JSON.stringify({ jobs }),
    })

    if (!res.ok) {
      const text = await res.text()
      console.error(`ERROR: API returned ${res.status}: ${text}`)
      process.exit(1)
    }

    const result = await res.json()
    console.log('Import complete:')
    console.log(`  Imported: ${result.imported}`)
    console.log(`  Skipped (duplicates): ${result.skipped}`)
    console.log(`  Total in file: ${result.total}`)
  } catch (err) {
    console.error('ERROR: Failed to call import API:', err)
    process.exit(1)
  }
}

main()
