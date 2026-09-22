import { Router } from 'express'
import cors from 'cors'
import {
  getAdmissionPlans,
  createAdmissionPlan,
  updateAdmissionPlan,
  deleteAdmissionPlan
} from '../controllers/admissionPlanController'
import {
  getExpenseDetails,
  createExpenseDetail,
  updateExpenseDetail,
  deleteExpenseDetail,
  getExpenseImage,
  deleteExpenseImage
} from '../controllers/expenseDetailController'
import {
  getCurriculums,
  createCurriculum,
  updateCurriculum,
  deleteCurriculum,
  getCurriculumChildren
} from '../controllers/curriculumController'
import {
  getDivisions,
  createDivision,
  updateDivision,
  deleteDivision,
  getDivisionChildren
} from '../controllers/divisionController'
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser
} from '../controllers/userController'
import {
  login
} from '../controllers/authController'
import { getApplicants, getApplicantDocuments, getApplicantDetail, deleteApplicant, truncateApplicants } from '../controllers/adminControllers'
import { requireAuth, requireSuperAdmin } from '../middleware/auth'

const router = Router()

router.use(cors({
  origin: ['http://localhost:13000', 'http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}))

// Curriculum routes
router.get('/curriculums', requireAuth, getCurriculums)
router.post('/curriculums', requireAuth, createCurriculum)
router.put('/curriculums/:id', requireAuth, updateCurriculum)
router.delete('/curriculums/:id', requireAuth, deleteCurriculum)
router.get('/curriculums/:id/children', requireAuth, getCurriculumChildren)

// Division routes
router.get('/divisions', requireAuth, getDivisions)
router.post('/divisions', requireAuth, createDivision)
router.put('/divisions/:id', requireAuth, updateDivision)
router.delete('/divisions/:id', requireAuth, deleteDivision)
router.get('/divisions/:id/children', requireAuth, getDivisionChildren)

// Admission Plan routes
router.get('/admission-plan', requireAuth, getAdmissionPlans)
router.post('/admission-plan', requireAuth, createAdmissionPlan)
router.put('/admission-plan/:id', requireAuth, updateAdmissionPlan)
router.delete('/admission-plan/:id', requireAuth, deleteAdmissionPlan)

// Expense Detail routes
router.get('/expense-detail', requireAuth, getExpenseDetails)
router.post('/expense-detail', requireAuth, createExpenseDetail)
router.put('/expense-detail/:id', requireAuth, updateExpenseDetail)
router.delete('/expense-detail/:id', requireAuth, deleteExpenseDetail)
router.delete('/expense-detail/:id/image', requireAuth, deleteExpenseImage)
router.get('/expense-detail/:id/image', getExpenseImage)

// Auth routes
router.post('/login', login)

// User routes
router.get('/users', requireAuth, getUsers)
router.post('/users', requireAuth, createUser)
router.put('/users/:id', requireAuth, updateUser)
router.delete('/users/:id', requireAuth, deleteUser)

router.get('/applicants', requireAuth, getApplicants)
router.get('/applicants/detail/:idCard', requireAuth, getApplicantDetail)
router.get('/applicants/:app_id/documents', requireAuth, getApplicantDocuments)
router.delete('/applicants/:app_id', requireAuth, deleteApplicant)

router.delete('/truncate-applicants', requireSuperAdmin, truncateApplicants)

export default router