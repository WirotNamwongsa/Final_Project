<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <div>
        <h2 class="text-2xl font-bold text-gray-900 flex items-center">
          <div class="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center mr-3">
            <CalendarDaysIcon class="w-5 h-5 text-emerald-600" />
          </div>
          จัดการเเผนรับสมัคร
        </h2>
        <p class="text-gray-600 mt-1">เพิ่ม แก้ไข หรือลบข้อมูลเเผนการรับสมัครต่างๆ</p>
      </div>
      <button @click="showAddModal = true"
        class="bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors">
        <PlusIcon class="w-5 h-5 inline-block mr-1" />
        เพิ่มแผนรับสมัคร
      </button>



    </div>

    <!-- Filter by Curriculum and Division -->
    <div class="bg-white rounded-lg border border-gray-200 p-4 mb-6">
      <div class="flex flex-col sm:flex-row gap-4">
        <div class="flex items-center gap-4">
          <select v-model="selectedCurriculum" @change="selectedDivision = ''"
            class="h-10 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors">
            <option value="">หลักสูตร</option>
            <option v-for="curriculum in curriculums" :key="curriculum.cur_id" :value="curriculum.cur_id">
              {{ curriculum.cur_shortname }}
            </option>
          </select>
        </div>
        <div class="flex items-center gap-4">
          <select v-model="selectedDivision" class="h-10 px-4 py-2 border border-gray-300 rounded-lg ...">
            <option value="">สาขาวิชา</option>
            <option v-for="division in filteredDivisionsForFilter" :key="division.div_id" :value="division.div_id">
              {{ division.div_name }}
            </option>
          </select>
        </div>
        <div class="flex items-center space-x-2 text-sm text-gray-600">
          <span>{{ filteredAdmissionPlans.length }} รายการ</span>
        </div>
      </div>
    </div>

    <!-- Table -->
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ปีการศึกษา</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">หลักสูตร-สาขาวิชา
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">จำนวนรับ</th>
            <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">จัดการ</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="(plan, index) in filteredAdmissionPlans" :key="plan.ap_id">

            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ plan.ap_years }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ plan.curriculum?.cur_shortname}}
               - 
               {{ plan.division?.div_name ||'N/A' }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ plan.plan_num }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-center">
              <div class="flex items-center justify-center space-x-2">
                <button @click="editAdmissionPlan(plan)"
                  class="inline-flex items-center px-3 py-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors">
                  <PencilIcon class="w-4 h-4" />
                </button>
                <button @click="openDeleteModal(plan)"
                  class="inline-flex items-center px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors">
                  <TrashIcon class="w-4 h-4" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- No data found message -->
      <div v-if="filteredAdmissionPlans.length === 0" class="text-center py-12">
        <div class="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <CalendarDaysIcon class="w-10 h-10 text-gray-400" />
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">ไม่พบข้อมูลแผนรับสมัคร</h3>
        <p class="text-gray-500 mb-6">ไม่พบข้อมูลที่ตรงกับเงื่อนไขการค้นหา หรือยังไม่มีข้อมูลในระบบ</p>
        <button @click="showAddModal = true"
          class="bg-emerald-500 text-white px-6 py-2 rounded-lg hover:bg-emerald-600 transition-colors inline-flex items-center">
          <PlusIcon class="w-5 h-5 mr-2" />
          เพิ่มแผนรับสมัครแรก
        </button>
      </div>
    </div>

    <!-- Toast -->
    <Teleport to="body">
      <transition name="toast">
        <div v-if="toast.show"
          class="fixed top-4 right-4 z-[99999] flex items-center space-x-3 px-6 py-4 rounded-xl shadow-2xl text-white"
          :class="toast.type === 'success' ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gradient-to-r from-red-500 to-pink-600'">
          <svg v-if="toast.type === 'success'" class="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor"
            viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          <svg v-else class="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
          <div>
            <p class="font-semibold">{{ toast.title }}</p>
            <p class="text-sm opacity-90">{{ toast.message }}</p>
          </div>
        </div>
      </transition>
    </Teleport>

    <!-- Add / Edit Modal -->
    <Teleport to="body">
      <transition name="modal">
        <div v-if="showAddModal || showEditModal" class="fixed inset-0 z-[9999] overflow-y-auto">
          <div class="fixed inset-0 z-[9998]" style="background-color: rgba(0,0,0,0.3);" @click="closeModal"></div>
          <div class="flex items-center justify-center min-h-screen px-4 py-8">
            <div class="relative bg-white rounded-lg shadow-xl w-full sm:max-w-md z-[10000]">
              <form @submit.prevent="handleSubmit">
                <div class="bg-white px-6 pt-6 pb-4 rounded-t-lg">
                  <h3 class="text-lg font-bold text-gray-900 mb-4">
                    {{ showAddModal ? 'เพิ่มแผนรับสมัคร' : 'แก้ไขแผนรับสมัคร' }}
                  </h3>
                  <div class="space-y-4">
                    <div>
                      <label class="block text-gray-700 text-sm font-bold mb-2">ปีการศึกษา</label>
                      <input v-model="formData.ap_years" type="text" placeholder="เช่น 2569"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                        required />
                    </div>
                    <div>
                      <label class="block text-gray-700 text-sm font-bold mb-2">หลักสูตร</label>
                      <select v-model="formData.cur_id" @change="onCurriculumChange"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                        required>
                        <option value="">เลือกหลักสูตร</option>
                        <option v-for="curriculum in curriculums" :key="curriculum.cur_id" :value="curriculum.cur_id">
                          {{ curriculum.cur_name }}
                        </option>
                      </select>
                    </div>
                    <div>
                      <label class="block text-gray-700 text-sm font-bold mb-2">สาขาวิชา</label>
                      <select v-model="formData.div_id"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                        required>
                        <option value="">เลือกสาขาวิชา</option>
                        <option v-for="division in filteredDivisions" :key="division.div_id" :value="division.div_id">
                          {{ division.div_name }}
                        </option>
                      </select>
                    </div>
                    <div>
                      <label class="block text-gray-700 text-sm font-bold mb-2">จำนวนที่เปิดรับสมัคร</label>
                      <input v-model.number="formData.plan_num" type="number" min="0"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                        required />
                    </div>
                  </div>
                </div>
                <div class="bg-gray-50 px-6 py-4 rounded-b-lg flex flex-row-reverse gap-3">
                  <button type="submit" :disabled="isSubmitting"
                    class="inline-flex justify-center rounded-lg px-4 py-2 bg-emerald-500 text-sm font-medium text-white hover:bg-emerald-600 transition-colors disabled:opacity-50">
                    {{ isSubmitting ? 'กำลังบันทึก...' : (showAddModal ? 'เพิ่ม' : 'บันทึก') }}
                  </button>
                  <button type="button" @click="closeModal"
                    class="inline-flex justify-center rounded-lg border border-gray-300 px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                    ยกเลิก
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>

    <!-- Delete Modal -->
    <Teleport to="body">
      <transition name="modal">
        <div v-if="showDeleteModal" class="fixed inset-0 z-[9999] flex items-center justify-center px-4">
          <div class="fixed inset-0 bg-black/40" @click="closeDeleteModal"></div>
          <div class="relative bg-white rounded-xl shadow-xl w-full max-w-md z-[10000]">

            <!-- Header -->
            <div class="p-6 border-b border-gray-100">
              <div class="flex items-center">
                <div class="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                  <TrashIcon class="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 class="text-lg font-bold text-gray-900">ยืนยันการลบแผนรับสมัคร</h3>
                  <p class="text-sm text-gray-500 mt-0.5">
                    ปีการศึกษา {{ deletingPlan?.ap_years }} — {{ deletingPlan?.curriculum?.cur_name }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Body -->
            <div class="p-6 border-b border-gray-100">
              <p class="text-gray-600 text-sm">
                คุณต้องการลบแผนรับสมัครของ
                <span class="font-semibold text-gray-900">{{ deletingPlan?.division?.div_name }}</span>
                ปีการศึกษา <span class="font-semibold text-gray-900">{{ deletingPlan?.ap_years }}</span>
                ใช่หรือไม่? การดำเนินการนี้ไม่สามารถย้อนกลับได้
              </p>
            </div>

            <!-- Footer -->
            <div class="p-4 flex justify-end gap-3">
              <button @click="closeDeleteModal"
                class="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                ยกเลิก
              </button>
              <button @click="confirmDelete" :disabled="isDeleting"
                class="px-4 py-2 text-sm text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors flex items-center disabled:opacity-50">
                <TrashIcon class="w-4 h-4 mr-2" />
                {{ isDeleting ? 'กำลังลบ...' : 'ยืนยันการลบ' }}
              </button>
            </div>

          </div>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { PlusIcon, PencilIcon, TrashIcon, CalendarDaysIcon } from '@heroicons/vue/24/outline'
import { apiService } from '@/utils/api'

interface Curriculum {
  cur_id: number
  cur_name: string
  cur_shortname: string
}

interface Division {
  div_id: number
  div_name: string
  cur_id: number
}

interface AdmissionPlan {
  ap_id: number
  ap_years: string
  div_id: number
  cur_id: number
  plan_num: number
  curriculum?: Curriculum
  division?: Division
  created_at: string
}

const emit = defineEmits(['refresh'])

// ── State ──────────────────────────────────────────────
const admissionPlans = ref<AdmissionPlan[]>([])
const curriculums = ref<Curriculum[]>([])
const divisions = ref<Division[]>([])
const isSubmitting = ref(false)
const showAddModal = ref(false)
const showEditModal = ref(false)
const formData = ref({
  ap_id: 0,
  ap_years: '',
  div_id: 0,
  cur_id: 0,
  plan_num: 0
})
const showDeleteModal = ref(false)
const isDeleting = ref(false)
const deletingPlan = ref<AdmissionPlan | null>(null)
const selectedCurriculum = ref('')
const selectedDivision = ref('')
const toast = ref({ show: false, type: 'success' as 'success' | 'error', title: '', message: '' })
let toastTimer: ReturnType<typeof setTimeout> | null = null

// แทนที่ filteredDivisions และ filteredAdmissionPlans เดิม

// สาขาที่กรองตาม selectedCurriculum (สำหรับ dropdown filter)
const filteredDivisionsForFilter = computed(() => {
  let divs = divisions.value
  if (selectedCurriculum.value) {
    divs = divs.filter(d => d.cur_id === Number(selectedCurriculum.value))
  }
  // deduplicate ชื่อซ้ำ
  const seen = new Set<string>()
  return divs.filter(d => {
    if (seen.has(d.div_name)) return false
    seen.add(d.div_name)
    return true
  })
})

const filteredDivisions = computed(() => {
  const curId = Number(formData.value.cur_id)
  if (!curId) return divisions.value
  return divisions.value.filter(d => d.cur_id === curId)
})

const filteredAdmissionPlans = computed(() => {
  let filtered = admissionPlans.value
  if (selectedCurriculum.value) {
    filtered = filtered.filter(plan =>
      // รองรับทั้ง plan.cur_id และ plan.curriculum.cur_id
      Number(plan.cur_id || plan.curriculum?.cur_id) === Number(selectedCurriculum.value)
    )
  }
  if (selectedDivision.value) {
    filtered = filtered.filter(plan =>
      Number(plan.div_id || plan.division?.div_id) === Number(selectedDivision.value)
    )
  }
  return filtered
})

// ── Toast ──────────────────────────────────────────────
const showToast = (type: 'success' | 'error', title: string, message: string) => {
  if (toastTimer) clearTimeout(toastTimer)
  toast.value = { show: true, type, title, message }
  toastTimer = setTimeout(() => { toast.value.show = false }, 4000)
}

// ── Fetch ──────────────────────────────────────────────
const fetchAdmissionPlans = async () => {
  try {
    // Fetch all data first
    const [plansResponse, curriculumsResponse, divisionsResponse] = await Promise.all([
      apiService.getAdmissionPlans(),
      apiService.getCurriculums(),
      apiService.getDivisions()
    ])

    admissionPlans.value = plansResponse.data
    curriculums.value = curriculumsResponse.data
    divisions.value = divisionsResponse.data
  } catch (error) {
    showToast('error', 'โหลดข้อมูลไม่สำเร็จ', 'ไม่สามารถดึงข้อมูลแผนรับสมัครได้')
  }
}

const fetchCurriculums = async () => {
  try {
    const response = await apiService.getCurriculums()
    curriculums.value = response.data
  } catch (error) {
    console.error('Error fetching curriculums:', error)
  }
}

const fetchDivisions = async () => {
  try {
    const response = await apiService.getDivisions()
    divisions.value = response.data
  } catch (error) {
    console.error('Error fetching divisions:', error)
  }
}

// ── Add / Edit ─────────────────────────────────────────
const onCurriculumChange = () => {
  formData.value.div_id = 0
}

const handleSubmit = async () => {
  isSubmitting.value = true
  try {
    if (showAddModal.value) {
      await apiService.createAdmissionPlan(formData.value)
      showToast('success', 'เพิ่มแผนรับสมัครสำเร็จ', 'ข้อมูลถูกบันทึกเรียบร้อยแล้ว')
    } else {
      await apiService.updateAdmissionPlan(formData.value.ap_id, formData.value)
      showToast('success', 'แก้ไขแผนรับสมัครสำเร็จ', 'ข้อมูลถูกอัปเดตเรียบร้อยแล้ว')
    }
    await fetchAdmissionPlans()
    emit('refresh')
    closeModal()
  } catch (error) {
    console.error('Error saving admission plan:', error)
  }finally {
    isSubmitting.value = false
  }
}

const editAdmissionPlan = (plan: AdmissionPlan) => {
  console.log('plan to edit:', plan)
  
  // ใช้ค่าจาก nested object ด้วยถ้า root ไม่มี
  const curId = plan.cur_id || plan.curriculum?.cur_id || 0
  const divId = plan.div_id || plan.division?.div_id || 0

  formData.value = {
    ap_id: plan.ap_id,
    ap_years: plan.ap_years,
    div_id: Number(divId),
    cur_id: Number(curId),
    plan_num: plan.plan_num
  }
  showEditModal.value = true
}

const deleteAdmissionPlan = async (id: number) => {
  if (confirm('คุณต้องการลบแผนรับสมัครนี้ใช่หรือไม่?')) {
    try {
      const response = await apiService.deleteAdmissionPlan(id)

      if (response.success) {
        // Success toast
        const toast = document.createElement('div')
        toast.className = 'fixed top-4 right-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-4 rounded-xl shadow-2xl z-50 flex items-center space-x-3 transform translate-x-full transition-all duration-500 ease-out'
        toast.innerHTML = `
          <div class="flex-shrink-0">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <div class="flex-1">
            <p class="font-semibold">ลบแผนรับสมัครสำเร็จแล้ว</p>
            <p class="text-sm opacity-90">ข้อมูลถูกลบจากระบบเรียบร้อย</p>
          </div>
        `
        document.body.appendChild(toast)

        // Animate in
        setTimeout(() => {
          toast.classList.remove('translate-x-full')
          toast.classList.add('translate-x-0')
        }, 100)

        // Remove after delay
        setTimeout(() => {
          toast.classList.add('translate-x-full', 'opacity-0')
          setTimeout(() => toast.remove(), 500)
        }, 4000)
      }

      await fetchAdmissionPlans()
    } catch (error: any) {
      console.error('Error deleting admission plan:', error)

      // Error toast
      const errorMessage = error?.message || 'เกิดข้อผิดพลาดในการลบแผนรับสมัคร'
      const toast = document.createElement('div')
      toast.className = 'fixed top-4 right-4 bg-gradient-to-r from-red-500 to-pink-600 text-white px-6 py-4 rounded-xl shadow-2xl z-50 flex items-center space-x-3 transform translate-x-full transition-all duration-500 ease-out'
      toast.innerHTML = `
        <div class="flex-shrink-0">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </div>
        <div class="flex-1">
          <p class="font-semibold">ไม่สามารถลบแผนรับสมัครได้</p>
          <p class="text-sm opacity-90">${errorMessage}</p>
        </div>
      `
      document.body.appendChild(toast)

      // Animate in
      setTimeout(() => {
        toast.classList.remove('translate-x-full')
        toast.classList.add('translate-x-0')
      }, 100)

      // Remove after delay
      setTimeout(() => {
        toast.classList.add('translate-x-full', 'opacity-0')
        setTimeout(() => toast.remove(), 500)
      }, 6000)
    }
  }
}

const closeModal = () => {
  showAddModal.value = false
  showEditModal.value = false
  isSubmitting.value = false
  formData.value = { ap_id: 0, ap_years: '', div_id: 0, cur_id: 0, plan_num: 0 }
}

// ── Delete ─────────────────────────────────────────────
const openDeleteModal = (plan: AdmissionPlan) => {
  deletingPlan.value = plan
  showDeleteModal.value = true
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  deletingPlan.value = null
}

const confirmDelete = async () => {
  if (!deletingPlan.value) return
  isDeleting.value = true
  try {
    await apiService.deleteAdmissionPlan(deletingPlan.value.ap_id)
    showToast('success', 'ลบแผนรับสมัครสำเร็จ', 'ข้อมูลถูกลบจากระบบเรียบร้อยแล้ว')
    await fetchAdmissionPlans()
    emit('refresh')
    closeDeleteModal()
  } catch (error: any) {
    showToast('error', 'ลบไม่สำเร็จ', error?.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่')
  } finally {
    isDeleting.value = false
  }
}

onMounted(() => {
  fetchCurriculums()
  fetchDivisions()
  fetchAdmissionPlans()
})
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: all 0.25s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(0.96);
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.4s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>