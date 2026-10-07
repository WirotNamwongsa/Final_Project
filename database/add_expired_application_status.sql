-- Add the payment-expired status used by the overdue application job.
ALTER TABLE public.applicants
DROP CONSTRAINT IF EXISTS applicants_status_check;

ALTER TABLE public.applicants
ADD CONSTRAINT applicants_status_check
CHECK (status IN ('pending_payment', 'paid', 'enrolled', 'pending_document_review', 'expired'));

COMMENT ON COLUMN public.applicants.status IS
  'Application status: pending_payment → paid → pending_document_review → enrolled; expired when payment deadline passes';
