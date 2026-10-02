-- Add CHECK constraint for id_type field in applicants table
-- Ensures only valid ID types are allowed

ALTER TABLE public.applicants
DROP CONSTRAINT IF EXISTS applicants_id_type_check;

ALTER TABLE public.applicants
ADD CONSTRAINT applicants_id_type_check
CHECK (id_type IN ('thai_id', 'alien_id', 'passport', 'g_code', 'other'));

-- Add comment for documentation
COMMENT ON COLUMN public.applicants.id_type IS 'Type of identification document: thai_id, alien_id, passport, g_code, or other';
