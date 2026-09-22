import { Pool } from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DB_SSL === 'false' ? false : {
    rejectUnauthorized: false
  },
})

pool.connect((err, _client, release) => {
  if (err) {
    console.error('❌ DB Error:', err.message)
    console.error('❌ DB Error Details:', err)
  } else {
    console.log('✅ DB Connected to Supabase!')
    release()
  }
})

export default pool
