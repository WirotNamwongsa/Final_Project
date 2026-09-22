-- Add superadmin to role CHECK constraint
ALTER TABLE public.users
  DROP CONSTRAINT users_role_check,
  ADD CONSTRAINT users_role_check CHECK (role IN ('superadmin', 'admin', 'staff'));
