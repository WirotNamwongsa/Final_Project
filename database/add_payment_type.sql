-- Add payment_type column to expense_detail table
ALTER TABLE expense_detail 
ADD COLUMN IF NOT EXISTS payment_type VARCHAR(20) DEFAULT 'mandatory' 
CHECK (payment_type IN ('mandatory', 'optional'));

-- Update existing records to have default payment_type
UPDATE expense_detail 
SET payment_type = 'mandatory' 
WHERE payment_type IS NULL;

-- Convert to Thai values to match schema
UPDATE expense_detail 
SET payment_type = 'mandatory' 
WHERE payment_type = 'mandatory';

-- Add proper Thai ENUM values
ALTER TABLE expense_detail 
DROP CONSTRAINT IF EXISTS expense_detail_payment_type_check;

ALTER TABLE expense_detail 
ADD CONSTRAINT expense_detail_payment_type_check 
CHECK (payment_type IN ('mandatory', 'optional'));
