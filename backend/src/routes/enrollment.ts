import { Router } from 'express'
import {
  confirmEnrollment,
  getEnrollmentStatus,
  getOnsiteEnrollments,
  upsertOnsiteEnrollment,
  getEnrollmentSummary,
  verifySlip,
  getOrdersByIdCard,
} from '../controllers/enrollmentController'
import { upload } from '../middleware/upload'
import { requireAuth } from '../middleware/auth'

const router = Router()

// มอบตัว + อัปโหลดเอกสาร (นักเรียนใช้ — public)
router.post('/confirm', upload.fields([
  { name: 'self_front',   maxCount: 1 },
  { name: 'self_back',    maxCount: 1 },
  { name: 'father_front', maxCount: 1 },
  { name: 'father_back',  maxCount: 1 },
  { name: 'mother_front', maxCount: 1 },
  { name: 'mother_back',  maxCount: 1 },
  { name: 'payment_slip', maxCount: 1 },
]), confirmEnrollment)

// ตรวจสอบสลิป (นักเรียนใช้ — public)
router.post('/verify-slip', upload.single('slip'), verifySlip)

// ตรวจสอบสถานะ (นักเรียนใช้ — public)
router.get('/status/:idCard', getEnrollmentStatus)

// ดึงข้อมูลการสั่งซื้อ (นักเรียนใช้ — public)
router.get('/orders/:idCard', getOrdersByIdCard)

// สรุปยอดรวม (public — ใช้แสดงสถิติหน้าแรก)
router.get('/summary', getEnrollmentSummary)

// Admin-only routes
router.get('/onsite', requireAuth, getOnsiteEnrollments)
router.post('/onsite', requireAuth, upsertOnsiteEnrollment)

export default router