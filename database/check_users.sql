-- ตรวจสอบข้อมูลในตาราง users
SELECT 
    id,
    username,
    role,
    created_at,
    CASE 
        WHEN password_hash IS NOT NULL THEN 'มี password'
        ELSE 'ไม่มี password'
    END as password_status
FROM users 
ORDER BY created_at DESC;
