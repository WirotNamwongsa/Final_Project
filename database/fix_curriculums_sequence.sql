-- Fix curriculums sequence to sync with existing data
-- Run this in PostgreSQL/Supabase SQL Editor

-- Reset the sequence to the maximum cur_id in the table
SELECT setval('curriculums_cur_id_seq', (SELECT COALESCE(MAX(cur_id), 1) FROM curriculums), true);
