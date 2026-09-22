-- Add onsite_enrollments table for recording walk-in enrollment counts per admission plan
CREATE TABLE IF NOT EXISTS public.onsite_enrollments (
  onsite_id    SERIAL PRIMARY KEY,
  ap_id        INTEGER NOT NULL UNIQUE REFERENCES admission_plan(ap_id) ON DELETE CASCADE,
  count        INTEGER NOT NULL DEFAULT 0,
  note         TEXT,
  recorded_by  VARCHAR(100),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
