-- Fix admission_plan sequence to sync with existing data
-- Run this in PostgreSQL/Supabase SQL Editor

-- Reset the sequence to the maximum ap_id in the table
SELECT setval('admission_plan_ap_id_seq', (SELECT COALESCE(MAX(ap_id), 0) + 1 FROM admission_plan), false);
