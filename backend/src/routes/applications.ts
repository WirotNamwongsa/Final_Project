import { Router } from 'express'
import {
  getCurriculums,
  getDivisions,
  getExpenses,
  getAdmissionPlan,
  createApplication,
  checkStatus,
  getStats,
  checkDuplicateIdCard,
  getPendingApplicants,
  getApplicants,
} from '../controllers/applicationController'
import { ocrIdCard } from '../controllers/ocrController'
import { upload } from '../middleware/upload'
import { requireAuth } from '../middleware/auth'

const router = Router()

// ข้อมูลสำหรับฟอร์มสมัคร (public — ใช้ตอนกรอกฟอร์ม)
router.get('/curriculums', getCurriculums)
router.get('/divisions', getDivisions)
router.get('/expenses', getExpenses)
router.get('/admission-plan', getAdmissionPlan)

// OCR บัตรประชาชน (Gemini Vision)
router.post('/ocr-idcard', upload.single('image'), ocrIdCard)

// ส่งใบสมัคร
router.post('/', upload.fields([
  { name: 'id_front', maxCount: 1 },
  { name: 'id_back', maxCount: 1 },
  { name: 'edu_front', maxCount: 1 },
  { name: 'edu_back', maxCount: 1 },
]), createApplication)

// ตรวจสอบบัตรประชาชนซ้ำ (public — ใช้ตอนกรอกฟอร์ม)
router.post('/check-duplicate', checkDuplicateIdCard)

// ตรวจสอบสถานะ (public — นักเรียนเช็คสถานะตัวเอง)
router.get('/check/:idCard', checkStatus)

// สถิติ (public — แสดงหน้าเว็บหลัก)
router.get('/stats', getStats)

// Admin-only routes
router.get('/pending', requireAuth, getPendingApplicants)
router.get('/applicants', requireAuth, getApplicants)

export default router
