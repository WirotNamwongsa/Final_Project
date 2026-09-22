-- Add exp_sizes column to expense_detail table
-- This column will store shirt sizes as a text array or JSON array

ALTER TABLE expense_detail
ADD COLUMN IF NOT EXISTS exp_sizes text[];
