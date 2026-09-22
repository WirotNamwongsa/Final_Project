-- ============================================================
-- SEED DATA FOR LOEITECH ADMISSION SYSTEM
-- เพิ่มข้อมูลเริ่มต้นสำหรับระบบ
-- ============================================================

-- ============================================================
-- ADMIN USER
-- ============================================================
-- Username: admin
-- Password: admin123 (bcrypt hash)
INSERT INTO public.users (username, password_hash, role, created_at)
VALUES (
  'admin',
  '$2b$10$einNFi6wa5owKhmT59JfzO0.Bz871wNKJg8DwT9MrDNiAjU7AwmuG',
  'admin',
  NOW()
)
ON CONFLICT (username) DO NOTHING;

-- ============================================================
-- CURRICULUMS (หลักสูตร)
-- ============================================================
INSERT INTO public.curriculums (cur_id, cur_name, cur_shortname) VALUES
  (1, 'ประกาศนียบัตรวิชาชีพ(ปวช)', 'ปวช.'),
  (2, 'ประกาศนียบัตรวิชาชีพชั้นสูง(ปวส)', 'ปวส.')
ON CONFLICT (cur_id) DO NOTHING;

-- ============================================================
-- DIVISIONS (สาขาวิชา) - 13 แผนกวิชาตามวิทยาลัยเทคนิคเลย
-- ============================================================
INSERT INTO public.divisions (div_id, div_name, cur_id) VALUES
  -- ปวช. (12 แผนกวิชา)
  (1, 'ช่างยนต์', 1),
  (2, 'ช่างยนต์', 2),
  (3, 'ช่างไฟฟ้า', 1),
  (4, 'ช่างไฟฟ้า', 2),
  (5, 'ช่างอิเล็กทรอนิกส์', 1),
  (6, 'ช่างอิเล็กทรอนิกส์', 2),
  (7, 'สถาปัตยกรรม์', 1),
  (8, 'สถาปัตยกรรม์', 1),
  (9, 'เทคโนโลยีสารสนเทศ', 1),
  (10, 'เทคโนโลยีสารสนเทศ', 2),
  (11, 'ช่างกลโรงงาน', 1),
  (12, 'เทคนิคการผลิต', 2),
  (13, 'ช่างก่อสร้าง/โยธา', 1),
  (14, 'ช่างก่อสร้าง/โยธา', 2),
  (15, 'ช่างเชื่อมโลหะ', 1)
ON CONFLICT (div_id) DO NOTHING;

-- ============================================================
-- ADMISSION PLAN (แผนรับสมัคร) - 15 แผนกวิชาสำหรับปีการศึกษา 2568
-- ============================================================
INSERT INTO public.admission_plan (ap_id, ap_years, div_id, cur_id, plan_num) VALUES
  -- ปวช. (11 แผนกวิชา - div_id 1,3,5,7,9,11,13,15)
  (1, '2568', 1, 1, 40),   -- ช่างยนต์
  (2, '2568', 3, 1, 35),   -- ช่างไฟฟ้า
  (3, '2568', 5, 1, 35),   -- ช่างอิเล็กทรอนิกส์
  (4, '2568', 7, 1, 25),   -- สถาปัตยกรรม์
  (5, '2568', 9, 1, 35),   -- เทคโนโลยีสารสนเทศ
  (6, '2568', 11, 1, 35),  -- ช่างกลโรงงาน
  (7, '2568', 13, 1, 30),  -- ช่างก่อสร้าง/โยธา
  (8, '2568', 15, 1, 35),  -- ช่างเชื่อมโลหะ

  -- ปวส. (4 แผนกวิชา - div_id 2,4,6,10,12,14)
  (9, '2568', 2, 2, 20),   -- ช่างยนต์
  (10, '2568', 4, 2, 20),  -- ช่างไฟฟ้า
  (11, '2568', 6, 2, 15),  -- ช่างอิเล็กทรอนิกส์
  (12, '2568', 10, 2, 15), -- เทคโนโลยีสารสนเทศ
  (13, '2568', 12, 2, 20), -- เทคนิคการผลิต
  (14, '2568', 14, 2, 15)  -- ช่างก่อสร้าง/โยธา
ON CONFLICT (ap_id) DO NOTHING;

-- ============================================================
-- EXPENSE DETAIL (ค่าใช้จ่าย) - ค่าใช้จ่ายทั่วไปและเฉพาะทาง
-- ============================================================
INSERT INTO public.expense_detail (exp_id, exp_name, exp_detail, exp_img, cur_id, exp_cost, payment_type) VALUES
  -- ค่าใช้จ่ายทั่วไป (ทุกหลักสูตร)
  (1, 'ค่าเล่าเรียน', 'ค่าเล่าเรียนตลอดปีการศึกษา', NULL, NULL, 5000, 'mandatory'),
  (2, 'ค่าหนังสือเรียน', 'ค่าหนังสือเรียนและอุปกรณ์การเรียน', NULL, NULL, 2000, 'mandatory'),
  (3, 'ค่าประกันอุบัติเหตุ', 'ค่าประกันอุบัติเหตุนักเรียน', NULL, NULL, 500, 'mandatory'),
  (4, 'ค่ากิจกรรม', 'ค่ากิจกรรมนักเรียนตลอดปี', NULL, NULL, 300, 'mandatory'),

  -- ค่าเครื่องแบบ (optional)
  (5, 'เครื่องแบบนักเรียน', 'เครื่องแบบนักเรียนชุดเต็ม (เสื้อ + กางเกง)', NULL, NULL, 800, 'optional'),
  (6, 'เครื่องแบบพละ', 'เครื่องแบบพละกีฬา', NULL, NULL, 600, 'optional'),

  -- ค่าเครื่องมือเฉพาะทาง (แยกตามหลักสูตร)
  (7, 'อุปกรณ์ช่างยนต์', 'อุปกรณ์ช่างยนต์และเครื่องมือ', NULL, 1, 1500, 'optional'),
  (8, 'อุปกรณ์ช่างกลโรงงาน', 'อุปกรณ์ช่างกลโรงงานและเครื่องมือ', NULL, 1, 1400, 'optional'),
  (9, 'อุปกรณ์ช่างเชื่อม', 'อุปกรณ์ช่างเชื่อมโลหะและเครื่องมือ', NULL, 1, 1300, 'optional'),
  (10, 'อุปกรณ์ช่างไฟฟ้า', 'อุปกรณ์ไฟฟ้าและเครื่องมือวัด', NULL, 1, 1200, 'optional'),
  (11, 'อุปกรณ์ช่างอิเล็กทรอนิกส์', 'อุปกรณ์อิเล็กทรอนิกส์และอุปกรณ์ทดลอง', NULL, 1, 1400, 'optional'),
  (12, 'อุปกรณ์ช่างก่อสร้าง', 'อุปกรณ์ช่างก่อสร้างและเครื่องมือ', NULL, 1, 1100, 'optional'),
  (13, 'อุปกรณ์สถาปัตยกรรม', 'อุปกรณ์สถาปัตยกรรมและเครื่องมือ', NULL, 1, 1000, 'optional'),
  (14, 'อุปกรณ์คอมพิวเตอร์', 'อุปกรณ์คอมพิวเตอร์และเครือข่าย', NULL, 1, 1500, 'optional'),
  (15, 'อุปกรณ์สารสนเทศ', 'อุปกรณ์เทคโนโลยีสารสนเทศ', NULL, 1, 1200, 'optional'),
  (16, 'อุปกรณ์สามัญสัมพันธ์', 'อุปกรณ์สามัญสัมพันธ์', NULL, 1, 800, 'optional'),
  (17, 'อุปกรณ์พื้นฐานวิชาชีพ', 'อุปกรณ์เทคโนโลยีพื้นฐานวิชาชีพ', NULL, 1, 900, 'optional'),
  (18, 'อุปกรณ์ช่างยนต์', 'อุปกรณ์ช่างยนต์และเครื่องมือ (ปวส.)', NULL, 2, 1800, 'optional'),
  (19, 'อุปกรณ์ช่างไฟฟ้า', 'อุปกรณ์ไฟฟ้าและเครื่องมือวัด (ปวส.)', NULL, 2, 1600, 'optional'),
  (20, 'อุปกรณ์ช่างอิเล็กทรอนิกส์', 'อุปกรณ์อิเล็กทรอนิกส์และอุปกรณ์ทดลอง (ปวส.)', NULL, 2, 1700, 'optional'),
  (21, 'อุปกรณ์สารสนเทศ', 'อุปกรณ์เทคโนโลยีสารสนเทศ (ปวส.)', NULL, 2, 1400, 'optional'),
  (22, 'อุปกรณ์ช่างก่อสร้าง', 'อุปกรณ์ช่างก่อสร้างและเครื่องมือ (ปวส.)', NULL, 2, 1300, 'optional'),
  (23, 'อุปกรณ์เทคนิคการผลิต', 'อุปกรณ์เทคนิคการผลิตและเครื่องมือ', NULL, 2, 1600, 'optional'),

  -- ค่าอื่นๆ
  (24, 'ค่าโฮสเทล', 'ค่าหอพักนักเรียน (ต่อเดือน)', NULL, NULL, 1500, 'custom'),
  (25, 'ค่าอาหาร', 'ค่าอาหารกลางวัน (ต่อเดือน)', NULL, NULL, 1200, 'custom'),
  (26, 'ค่ารถรับส่ง', 'ค่ารถรับส่งนักเรียน (ต่อเดือน)', NULL, NULL, 800, 'custom')
ON CONFLICT (exp_id) DO NOTHING;

-- ============================================================
-- สรุปข้อมูลที่เพิ่ม
-- ============================================================
-- Admin user: username = admin, password = admin123
-- Curriculums: 2 หลักสูตร (ปวช., ปวส.) - ไม่แก้ตามผู้ใช้
-- Divisions: 15 แผนกวิชาตามการตั้งค่าของผู้ใช้ - ไม่แก้ตามผู้ใช้
-- Admission Plan: 14 แผนรับสมัครสำหรับปีการศึกษา 2568 - ปรับให้เข้ากับ divisions
-- Expense Details: 26 รายการค่าใช้จ่าย - ปรับให้เข้ากับ curriculums
-- ============================================================

-- ============================================================
-- DEMO APPLICANTS FOR ADMIN DASHBOARD DISPLAY
-- เพิ่มข้อมูลตัวอย่างจำนวน 6 คน เพื่อให้หน้า admin แสดงรายการได้ทันที
-- ============================================================
INSERT INTO public.applicants (
  app_id, id_card_number, prefix, full_name, address, phone, email,
  prev_school, prev_level, prev_year, gpa, cur_id, div_id, ap_id,
  status, created_at, updated_at, id_type
) VALUES
  (
    '11111111-1111-4111-8111-111111111111', '110170000001', 'นาย', 'กิตติคุณ พรหมมา',
    '123/45 ตำบลในเมือง อำเภอเมืองเลย จังหวัดเลย 42000', '0812345678', 'kittikun@example.com',
    'โรงเรียนสตรีวิทยา', 'm6', '2567', '3.75', 1, 1, 1,
    'pending_payment', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days', 'thai_id'
  ),
  (
    '22222222-2222-4222-8222-222222222222', '110170000002', 'นางสาว', 'พิมพ์ชนก ศรีสวัสดิ์',
    '88/2 ตำบลนาดี อำเภอเมืองเลย จังหวัดเลย 42000', '0898765432', 'pimchanok@example.com',
    'โรงเรียนเลยพิทยาคม', 'm6', '2567', '3.82', 1, 3, 2,
    'paid', NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days', 'thai_id'
  ),
  (
    '33333333-3333-4333-8333-333333333333', '110170000003', 'นาย', 'ธนวัฒน์ ทองคำ',
    '21/7 ตำบลนาอ้อ อำเภอเมืองเลย จังหวัดเลย 42000', '0823456789', 'thanawat@example.com',
    'โรงเรียนศรีสำโรงวิทยา', 'm6', '2567', '3.68', 1, 5, 3,
    'enrolled', NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days', 'thai_id'
  ),
  (
    '44444444-4444-4444-8444-444444444444', '110170000004', 'นางสาว', 'อารีรัตน์ แก้วกาญจน์',
    '45/11 ตำบลกุดป่อง อำเภอเมืองเลย จังหวัดเลย 42000', '0834567890', 'areerat@example.com',
    'โรงเรียนกุดป่องวิทยา', 'm6', '2567', '3.91', 2, 2, 9,
    'paid', NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days', 'thai_id'
  ),
  (
    '55555555-5555-4555-8555-555555555555', '110170000005', 'นาย', 'วรพล หนูนวล',
    '9/6 ตำบลห้วยชัน อำเภอเมืองเลย จังหวัดเลย 42000', '0845678901', 'voraphon@example.com',
    'โรงเรียนประสานมิตร', 'm6', '2567', '3.80', 2, 4, 10,
    'pending_payment', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day', 'thai_id'
  ),
  (
    '66666666-6666-4666-8666-666666666666', '110170000006', 'นาย', 'ชยุตม์ รัตนกุล',
    '67/14 ตำบลกุดป่อง อำเภอเมืองเลย จังหวัดเลย 42000', '0856789012', 'chayut@example.com',
    'โรงเรียนลานกระบือวิทยา', 'm3', '2566', '3.64', 1, 7, 4,
    'enrolled', NOW() - INTERVAL '9 days', NOW() - INTERVAL '9 days', 'thai_id'
  )
ON CONFLICT (id_card_number) DO NOTHING;

INSERT INTO public.payments (
  pay_id, app_id, total_amount, required_amount, optional_amount,
  slip_path, slip_name, paid_at, due_date, verified_at, verified_by
) VALUES
  (
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '11111111-1111-4111-8111-111111111111', 9500, 9500, 0,
    NULL, NULL, NULL, NOW() + INTERVAL '3 days', NULL, NULL
  ),
  (
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', '22222222-2222-4222-8222-222222222222', 12800, 12800, 0,
    'demo/slip_pimchanok.png', 'slip_pimchanok.png', NOW() - INTERVAL '2 days', NOW() + INTERVAL '1 day', NOW() - INTERVAL '1 day', 'admin'
  ),
  (
    'cccccccc-cccc-4ccc-8ccc-cccccccccccc', '33333333-3333-4333-8333-333333333333', 14500, 14500, 0,
    'demo/slip_thanawat.png', 'slip_thanawat.png', NOW() - INTERVAL '5 days', NOW() - INTERVAL '1 day', NOW() - INTERVAL '4 days', 'admin'
  ),
  (
    'dddddddd-dddd-4ddd-8ddd-dddddddddddd', '44444444-4444-4444-8444-444444444444', 13250, 13250, 0,
    'demo/slip_areerat.png', 'slip_areerat.png', NOW() - INTERVAL '3 days', NOW() + INTERVAL '2 days', NOW() - INTERVAL '2 days', 'admin'
  ),
  (
    'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee', '55555555-5555-4555-8555-555555555555', 9800, 9800, 0,
    NULL, NULL, NULL, NOW() + INTERVAL '3 days', NULL, NULL
  ),
  (
    'ffffffff-ffff-4fff-8fff-ffffffffffff', '66666666-6666-4666-8666-666666666666', 11750, 11750, 0,
    'demo/slip_chayut.png', 'slip_chayut.png', NOW() - INTERVAL '6 days', NOW() - INTERVAL '1 day', NOW() - INTERVAL '4 days', 'admin'
  )
ON CONFLICT (app_id) DO NOTHING;

INSERT INTO public.enrollments (
  enroll_id, app_id, enrolled_at, verified_at, verified_by
) VALUES
  (
    '11111111-aaaa-4aaa-8aaa-111111111111', '33333333-3333-4333-8333-333333333333',
    NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days', 'admin'
  ),
  (
    '22222222-bbbb-4bbb-8bbb-222222222222', '66666666-6666-4666-8666-666666666666',
    NOW() - INTERVAL '4 days', NOW() - INTERVAL '3 days', 'admin'
  )
ON CONFLICT (app_id) DO NOTHING;

INSERT INTO public.documents (
  doc_id, app_id, doc_type, file_path, file_name, file_size, uploaded_at
) VALUES
  (
    'a1111111-1111-4111-8111-111111111111', '11111111-1111-4111-8111-111111111111', 'id_front',
    'demo/id_front_001.png', 'id_front_001.png', 256000, NOW() - INTERVAL '2 days'
  ),
  (
    'a2222222-2222-4222-8222-222222222222', '22222222-2222-4222-8222-222222222222', 'id_back',
    'demo/id_back_002.png', 'id_back_002.png', 248000, NOW() - INTERVAL '4 days'
  ),
  (
    'a3333333-3333-4333-8333-333333333333', '33333333-3333-4333-8333-333333333333', 'payment_slip',
    'demo/slip_thanawat.png', 'slip_thanawat.png', 420000, NOW() - INTERVAL '5 days'
  ),
  (
    'a4444444-4444-4444-8444-444444444444', '44444444-4444-4444-8444-444444444444', 'id_front',
    'demo/id_front_004.png', 'id_front_004.png', 230000, NOW() - INTERVAL '6 days'
  ),
  (
    'a5555555-5555-4555-8555-555555555555', '55555555-5555-4555-8555-555555555555', 'id_front',
    'demo/id_front_005.png', 'id_front_005.png', 214000, NOW() - INTERVAL '1 day'
  )
ON CONFLICT DO NOTHING;

-- ============================================================
-- COMPACT SAMPLE DATA FOR ALL TABLES
-- เหล่านี้คือข้อมูลตัวอย่างที่พอดีสำหรับทดสอบทุกหน้าและทุกตาราง
-- ============================================================

INSERT INTO public.users (id, username, password_hash, role, created_at)
VALUES
  ('f1d7a101-9b2d-4c4e-b0f1-111111111111', 'superadmin', '$2b$10$P7K3tL5F5T1H6kXGUk1Jb.h7qe2mIBm8P7tLzWmQ8jO7t26K1m4fG', 'superadmin', NOW()),
  ('f1d7a101-9b2d-4c4e-b0f1-222222222222', 'staff01', '$2b$10$LZP1vyrwQNZxjI3sL3kSNu2WqvSx57.0PNHzI5prG9VgF3M9IVjmm', 'staff', NOW())
ON CONFLICT (username) DO NOTHING;

INSERT INTO public.payments (
  pay_id, app_id, total_amount, required_amount, optional_amount,
  slip_path, slip_name, paid_at, due_date, verified_at, verified_by
) VALUES
  (
    '901c0f9d-1e88-4d0d-bdc6-1a0000000001', '11111111-1111-4111-8111-111111111111', 9500, 9500, 0,
    'demo/slip_kittikun.png', 'slip_kittikun.png', NOW() - INTERVAL '2 days', NOW() + INTERVAL '1 day', NOW() - INTERVAL '1 day', 'superadmin'
  ),
  (
    '901c0f9d-1e88-4d0d-bdc6-1a0000000002', '22222222-2222-4222-8222-222222222222', 12800, 12800, 0,
    'demo/slip_pimchanok.png', 'slip_pimchanok.png', NOW() - INTERVAL '4 days', NOW() + INTERVAL '1 day', NOW() - INTERVAL '3 days', 'superadmin'
  ),
  (
    '901c0f9d-1e88-4d0d-bdc6-1a0000000003', '33333333-3333-4333-8333-333333333333', 14500, 14500, 0,
    'demo/slip_thanawat.png', 'slip_thanawat.png', NOW() - INTERVAL '6 days', NOW() + INTERVAL '1 day', NOW() - INTERVAL '5 days', 'superadmin'
  ),
  (
    '901c0f9d-1e88-4d0d-bdc6-1a0000000004', '44444444-4444-4444-8444-444444444444', 13250, 13250, 0,
    'demo/slip_areerat.png', 'slip_areerat.png', NOW() - INTERVAL '3 days', NOW() + INTERVAL '2 days', NOW() - INTERVAL '2 days', 'admin'
  )
ON CONFLICT (app_id) DO NOTHING;

INSERT INTO public.documents (
  doc_id, app_id, doc_type, file_path, file_name, file_size, uploaded_at
) VALUES
  (
    'd1111111-1111-4111-8111-111111111111', '11111111-1111-4111-8111-111111111111', 'id_front',
    'demo/id_front_kittikun.png', 'id_front_kittikun.png', 260000, NOW() - INTERVAL '2 days'
  ),
  (
    'd1111111-1111-4111-8111-222222222222', '22222222-2222-4222-8222-222222222222', 'id_back',
    'demo/id_back_pimchanok.png', 'id_back_pimchanok.png', 250000, NOW() - INTERVAL '4 days'
  ),
  (
    'd1111111-1111-4111-8111-333333333333', '33333333-3333-4333-8333-333333333333', 'payment_slip',
    'demo/slip_thanawat.png', 'slip_thanawat.png', 420000, NOW() - INTERVAL '6 days'
  ),
  (
    'd1111111-1111-4111-8111-444444444444', '44444444-4444-4444-8444-444444444444', 'edu_front',
    'demo/edu_front_areerat.png', 'edu_front_areerat.png', 330000, NOW() - INTERVAL '3 days'
  )
ON CONFLICT DO NOTHING;

INSERT INTO public.enrollments (
  enroll_id, app_id, tabien_self_path, tabien_father_path, tabien_mother_path,
  enrolled_at, verified_at, verified_by
) VALUES
  (
    'e1111111-1111-4111-8111-111111111111', '33333333-3333-4333-8333-333333333333',
    'demo/tabien_self_1.png', 'demo/tabien_father_1.png', 'demo/tabien_mother_1.png',
    NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days', 'superadmin'
  ),
  (
    'e1111111-1111-4111-8111-222222222222', '66666666-6666-4666-8666-666666666666',
    'demo/tabien_self_2.png', NULL, NULL,
    NOW() - INTERVAL '4 days', NOW() - INTERVAL '3 days', 'admin'
  )
ON CONFLICT (app_id) DO NOTHING;

INSERT INTO public.onsite_enrollments (ap_id, count, note, recorded_by)
VALUES
  (1, 3, 'walk-in สำหรับปวช. ช่างยนต์', 'staff01'),
  (9, 2, 'walk-in สำหรับปวส. ช่างยนต์', 'staff01')
ON CONFLICT (ap_id) DO NOTHING;

-- ============================================================
-- END COMPACT SAMPLE DATA
-- ============================================================