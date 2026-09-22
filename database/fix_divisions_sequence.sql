-- Fix divisions sequence to sync with existing data
-- Run this in PostgreSQL/Supabase SQL Editor

-- Reset the sequence to the maximum div_id in the table
SELECT setval('divisions_div_id_seq', (SELECT COALESCE(MAX(div_id), 1) FROM divisions), true);
