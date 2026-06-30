// One-time migration: copies schema + data from the local SQLite DB (prisma/dev.db)
// into a remote Turso database using the libSQL client.
//
// Usage (after setting TURSO_DATABASE_URL and TURSO_AUTH_TOKEN in .env):
//   node --env-file=.env scripts/migrate-to-turso.mjs
//
import { createClient } from '@libsql/client'

const SOURCE_URL = 'file:./prisma/dev.db'
const url = process.env.TURSO_DATABASE_URL
const authToken = process.env.TURSO_AUTH_TOKEN

if (!url || !authToken) {
  console.error('ERROR: TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be set in .env')
  process.exit(1)
}
if (!url.startsWith('libsql://') && !url.startsWith('https://')) {
  console.error(`ERROR: TURSO_DATABASE_URL looks wrong: "${url}" (expected libsql://...)`)
  process.exit(1)
}

const src = createClient({ url: SOURCE_URL })
const dst = createClient({ url, authToken })

const chunk = (arr, n) => Array.from({ length: Math.ceil(arr.length / n) }, (_, i) => arr.slice(i * n, i * n + n))

try {
  // 1. Read schema objects (tables first, then indexes), skipping SQLite internals.
  const schema = await src.execute(
    "SELECT type, name, sql FROM sqlite_master " +
    "WHERE sql IS NOT NULL AND name NOT LIKE 'sqlite_%' " +
    "ORDER BY CASE type WHEN 'table' THEN 0 ELSE 1 END, name"
  )
  const tables = schema.rows.filter((r) => r.type === 'table').map((r) => r.name)
  const indexes = schema.rows.filter((r) => r.type === 'index').map((r) => r.name)

  console.log(`Found ${tables.length} tables, ${indexes.length} indexes in source.`)

  // 2. Clean slate on destination so this script is safely re-runnable.
  for (const name of indexes) await dst.execute(`DROP INDEX IF EXISTS "${name}"`)
  for (const name of tables) await dst.execute(`DROP TABLE IF EXISTS "${name}"`)

  // 3. Recreate tables then indexes on the destination.
  for (const row of schema.rows) await dst.execute(row.sql)
  console.log('Schema created on Turso.')

  // 4. Copy data table by table (collected into one FK-safe migration batch).
  let totalRows = 0
  const inserts = []
  for (const table of tables) {
    const data = await src.execute(`SELECT * FROM "${table}"`)
    if (data.rows.length === 0) {
      console.log(`  ${table}: 0 rows`)
      continue
    }
    const cols = data.columns
    const colList = cols.map((c) => `"${c}"`).join(', ')
    const placeholders = cols.map(() => '?').join(', ')
    for (const r of data.rows) {
      inserts.push({
        sql: `INSERT INTO "${table}" (${colList}) VALUES (${placeholders})`,
        args: cols.map((c) => r[c]),
      })
    }
    totalRows += data.rows.length
    console.log(`  ${table}: ${data.rows.length} rows`)
  }
  // migrate() runs the batch with foreign-key enforcement disabled, so insertion
  // order across related tables does not matter.
  if (inserts.length > 0) await dst.migrate(inserts)

  // 5. Verify counts match.
  console.log('\nVerifying row counts on Turso:')
  let ok = true
  for (const table of tables) {
    const s = await src.execute(`SELECT COUNT(*) AS c FROM "${table}"`)
    const d = await dst.execute(`SELECT COUNT(*) AS c FROM "${table}"`)
    const sc = Number(s.rows[0].c)
    const dc = Number(d.rows[0].c)
    const match = sc === dc ? 'OK' : 'MISMATCH'
    if (sc !== dc) ok = false
    console.log(`  ${table}: source=${sc} turso=${dc} [${match}]`)
  }

  console.log(`\n${ok ? 'SUCCESS' : 'COMPLETED WITH MISMATCHES'} — copied ${totalRows} rows total.`)
  process.exit(ok ? 0 : 1)
} catch (err) {
  console.error('\nMIGRATION FAILED:', err.message)
  process.exit(1)
}
