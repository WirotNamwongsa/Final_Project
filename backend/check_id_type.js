const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DB_SSL === 'false' ? false : { rejectUnauthorized: false }
});

(async () => {
  try {
    // Check applicant with id_card_number 0111111111111
    const result = await pool.query(`
      SELECT id_card_number, id_type, full_name, status
      FROM applicants
      WHERE id_card_number = $1
    `, ['0111111111111']);

    if (result.rows.length === 0) {
      console.log('❌ ไม่พบข้อมูลสำหรับ id_card_number: 0111111111111');
    } else {
      console.log('✅ พบข้อมูล:');
      console.log('id_card_number:', result.rows[0].id_card_number);
      console.log('id_type:', result.rows[0].id_type);
      console.log('full_name:', result.rows[0].full_name);
      console.log('status:', result.rows[0].status);
    }

    // Check all applicants with this id_card_number
    const allResults = await pool.query(`
      SELECT id_card_number, id_type, full_name, status
      FROM applicants
      WHERE id_card_number = $1
    `, ['0111111111111']);

    console.log('\n📊 ข้อมูลทั้งหมดในฐานข้อมูลสำหรับเลขบัตรนี้:');
    console.log('จำนวนทั้งหมด:', allResults.rows.length);
    allResults.rows.forEach((row, i) => {
      console.log(`${i + 1}. id_type: ${row.id_type}, status: ${row.status}, full_name: ${row.full_name}`);
    });

  } catch (err) {
    console.error('❌ Error:', err);
  } finally {
    await pool.end();
  }
})();
