-- Add pending_document_review status to applicants table
-- This status is used when applicant submits enrollment and is waiting for admin to verify documents

-- Add the new status to the check constraint
ALTER TABLE public.applicants
DROP CONSTRAINT IF EXISTS applicants_status_check;

ALTER TABLE public.applicants
ADD CONSTRAINT applicants_status_check
CHECK (status IN ('pending_payment', 'paid', 'enrolled', 'pending_document_review'));

-- Update status flow comment
COMMENT ON COLUMN public.applicants.status IS 'Application status: pending_payment → paid → pending_document_review → enrolled';
