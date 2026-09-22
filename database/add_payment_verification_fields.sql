-- Add payment verification fields to payments table
-- These fields track the slip verification process

ALTER TABLE public.payments
ADD COLUMN slip_sender varchar(200) NULL,
ADD COLUMN slip_receiver varchar(200) NULL,
ADD COLUMN slip_approved boolean NULL,
ADD COLUMN slip_error_message text NULL;

-- Add comments for documentation
COMMENT ON COLUMN public.payments.slip_sender IS 'Line ID or username of person who sent the payment slip';
COMMENT ON COLUMN public.payments.slip_receiver IS 'Line ID or username of staff who received the payment slip';
COMMENT ON COLUMN public.payments.slip_approved IS 'Whether the payment slip has been approved (true/false/null)';
COMMENT ON COLUMN public.payments.slip_error_message IS 'Error message if slip verification failed';
