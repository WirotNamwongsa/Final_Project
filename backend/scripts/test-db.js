const { Pool } = require('pg');
require('dotenv').config({ path: '.env' });

async function tryConnect(options) {
  const pool = new Pool(options)
  try {
    const client = await pool.connect()
    console.log('✅ Connected to DB (options):', options.ssl ? 'ssl' : 'no-ssl')
    client.release()
    await pool.end()
    return true
  } catch (err) {
    console.error('❌ Connection error (options):', options.ssl ? 'ssl' : 'no-ssl', err)
    try { await pool.end() } catch(e){}
    return false
  }
}

(async () => {
  const connStr = process.env.DATABASE_URL && process.env.DATABASE_URL.trim()
  console.log('Using connection string:', JSON.stringify(connStr))
  // Try without SSL first
  const ok1 = await tryConnect({ connectionString: connStr, ssl: process.env.DB_SSL === 'false' ? false : undefined })
  if (ok1) return

  // Try with SSL allow self-signed
  await tryConnect({ connectionString: connStr, ssl: { rejectUnauthorized: false } })
  process.exit(1)
})()
