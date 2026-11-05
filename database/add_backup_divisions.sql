-- Store the applicant's first and second alternative division choices.
ALTER TABLE public.applicants
  ADD COLUMN IF NOT EXISTS backup_div_id_1 int4 NULL,
  ADD COLUMN IF NOT EXISTS backup_div_id_2 int4 NULL;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_backup_div_id_1') THEN
    ALTER TABLE public.applicants
      ADD CONSTRAINT fk_backup_div_id_1
      FOREIGN KEY (backup_div_id_1) REFERENCES public.divisions(div_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_backup_div_id_2') THEN
    ALTER TABLE public.applicants
      ADD CONSTRAINT fk_backup_div_id_2
      FOREIGN KEY (backup_div_id_2) REFERENCES public.divisions(div_id);
  END IF;
END $$;

COMMENT ON COLUMN public.applicants.backup_div_id_1 IS 'Applicant first alternative division choice';
COMMENT ON COLUMN public.applicants.backup_div_id_2 IS 'Applicant second alternative division choice';
