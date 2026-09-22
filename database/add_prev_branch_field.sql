-- Add prev_branch field to applicants table
-- This field will store the division ID of the PVC branch that applicant graduated from

ALTER TABLE public.applicants 
ADD COLUMN prev_branch int4 NULL;

-- Add comment
COMMENT ON COLUMN public.applicants.prev_branch IS 'ID  of the division/branch where applicant graduated from PVC (only for prev_level = pvc)';
