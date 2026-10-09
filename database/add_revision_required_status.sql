-- Track rejected enrollment submissions separately from paid applicants.
ALTER TABLE public.applicants
  ADD COLUMN IF NOT EXISTS review_error_message TEXT;

ALTER TABLE public.applicants
  DROP CONSTRAINT IF EXISTS applicants_status_check;

ALTER TABLE public.applicants
  ADD CONSTRAINT applicants_status_check
  CHECK (status IN (
    'pending_payment',
    'paid',
    'enrolled',
    'pending_document_review',
    'revision_required',
    'pending_approve',
    'expired'
  ));

COMMENT ON COLUMN public.applicants.review_error_message IS
  'Reason the enrollment documents were rejected; cleared when the applicant resubmits';
