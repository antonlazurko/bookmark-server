import { readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { pool } from './pool'

const here = dirname(fileURLToPath(import.meta.url))

// Applies schema.sql. Safe to run repeatedly — every statement uses IF NOT EXISTS.
const migrate = async () => {
  const sql = await readFile(join(here, 'schema.sql'), 'utf8')
  await pool.query(sql)
  console.log('Migration applied: tables are ready.')
}

migrate()
  .catch((error) => {
    console.error('Migration failed:', error)
    process.exitCode = 1
  })
  .finally(() => pool.end())
