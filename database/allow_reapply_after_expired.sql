-- Preserve expired applications as history while allowing a new active application
-- with the same identity document number.
ALTER TABLE public.applicants
  DROP CONSTRAINT IF EXISTS applicants_id_card_number_key;

CREATE UNIQUE INDEX IF NOT EXISTS applicants_active_id_card_number_key
  ON public.applicants (id_card_number)
  WHERE status <> 'expired';
