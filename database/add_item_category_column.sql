-- ============================================================
-- ADD item_category COLUMN TO expense_detail
-- เพิ่มฟิลด์ item_category เพื่อแยกประเภทรายการอย่างชัดเจน
-- ============================================================

-- เพิ่มคอลัมน์ item_category
ALTER TABLE public.expense_detail
ADD COLUMN IF NOT EXISTS item_category varchar(20) NULL;

-- อัพเดทข้อมูลที่มีอยู่ตาม payment_type และชื่อรายการ
UPDATE public.expense_detail
SET item_category = CASE
  WHEN payment_type = 'mandatory' THEN 'general'
  WHEN payment_type = 'custom' THEN 'custom'
  WHEN payment_type = 'optional' AND exp_name LIKE '%เครื่องแบบ%' THEN 'uniform'
  WHEN payment_type = 'optional' AND exp_name LIKE '%อุปกรณ์%' THEN 'equipment'
  ELSE 'equipment'
END
WHERE item_category IS NULL;

-- เพิ่ม constraint check สำหรับ item_category
ALTER TABLE public.expense_detail
ADD CONSTRAINT expense_detail_item_category_check
CHECK (item_category IN ('general', 'uniform', 'equipment', 'custom'));
