const { Pool } = require('pg')
const bcrypt = require('bcrypt')
require('dotenv').config({ path: '.env' })

// Allow passing a connection string as the first argument to avoid shell
// quoting/trailing-space issues. Trim to remove accidental whitespace.
const rawConn = process.argv[2] || process.env.DATABASE_URL
const connectionString = rawConn ? String(rawConn).trim() : undefined

const pool = new Pool({
  connectionString,
  ssl: process.env.DB_SSL === 'false' ? false : undefined,
})

async function run() {
  try {
    const username = 'admin'
    const password = 'admin123'
    const role = 'admin'

    const exists = await pool.query('SELECT id FROM users WHERE username = $1', [username])
    if (exists.rows.length > 0) {
      console.log('Admin user already exists:', username)
      await pool.end()
      process.exit(0)
    }

    const hash = await bcrypt.hash(password, 10)
    await pool.query('INSERT INTO users (username, password_hash, role) VALUES ($1, $2, $3)', [username, hash, role])
    console.log('Created admin user:', username)
    await pool.end()
  } catch (err) {
    console.error('Failed to create admin user:', err)
    try { await pool.end() } catch(e){}
    process.exit(1)
  }
}

run()
