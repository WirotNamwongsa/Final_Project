<template>
  <div>
    <!-- Header -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
      <div>
        <h2 class="text-2xl font-bold text-gray-900 flex items-center">
          <div class="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center mr-3">
            <BuildingOffice2Icon class="w-5 h-5 text-emerald-600" />
          </div>
          จัดการสาขาวิชา
        </h2>
        <p class="text-gray-600 mt-1">เพิ่ม แก้ไข หรือลบข้อมูลสาขาวิชาต่างๆ</p>
      </div>
      <button
        @click="showAddModal = true"
        class="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-6 py-3 rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 shadow-sm hover:shadow-md flex items-center"
      >
        <PlusIcon class="w-5 h-5 mr-2" />
        เพิ่มสาขาวิชาใหม่
      </button>
    </div>

    <!-- Search and Filter -->
    <div class="bg-white rounded-lg border border-gray-200 p-4 mb-6">
      <div class="flex flex-col sm:flex-row gap-4">
        <div class="flex-1">
          <div class="relative">
            <MagnifyingGlassIcon class="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="ค้นหาสาขาวิชา"
              class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
            />
          </div>
        </div>
        <div class="sm:w-48">
          <select v-model="selectedAbbreviation"
            class="h-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors">
            <option value="">ทั้งหมด</option>
            <option v-for="curriculum in curriculumOptions" :key="curriculum.cur_id" :value="curriculum.cur_id">
              {{ curriculum.cur_shortname }}
            </option>
          </select>
        </div>
        <div class="flex items-center space-x-2 text-sm text-gray-600">
          <span>{{ filteredDivisions.length }} รายการ</span>
        </div>
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class=" px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">หลักสูตร - สาขาวิชา</th>
              <th class="w-25px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">จัดการ</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="division in filteredDivisions" :key="division.div_id" class="hover:bg-gray-50 transition-colors">
              
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm  text-gray-900">
                  {{ filteredDivisions.indexOf(division) + 1 }}. {{ division.curriculum?.cur_shortname }} - {{ division.div_name }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-center">
                <div class="flex items-center justify-center space-x-2">
                  <button @click="editDivision(division)"
                    class="inline-flex items-center px-3 py-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors" title="แก้ไข">
                    <PencilIcon class="w-4 h-4" />
                  </button>
                  <button @click="openDeleteModal(division)"
                    class="inline-flex items-center px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors" title="ลบ">
                    <TrashIcon class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Empty State -->
      <div v-if="filteredDivisions.length === 0" class="text-center py-12">
        <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <BuildingOffice2Icon class="w-8 h-8 text-gray-400" />
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">ไม่พบข้อมูลสาขาวิชา</h3>
        <p class="text-gray-500 mb-4">ยังไม่มีข้อมูลสาขาวิชาในระบบ หรือค้นหาไม่พบ</p>
        <button @click="showAddModal = true" class="bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors">
          เพิ่มสาขาวิชาแรก
        </button>
      </div>
    </div>

    <!-- Toast -->
    <Teleport to="body">
      <transition name="toast">
        <div v-if="toast.show"
          class="fixed top-4 right-4 z-[99999] flex items-center space-x-3 px-6 py-4 rounded-xl shadow-2xl text-white"
          :class="toast.type === 'success' ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gradient-to-r from-red-500 to-pink-600'">
          <svg v-if="toast.type === 'success'" class="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            <div class="relative bg-white rounded-lg shadow-xl w-full sm:max-w-lg z-[10000]">
              <form @submit.prevent="handleSubmit">
                <div class="px-6 pt-6 pb-4">
                  <h3 class="text-lg font-bold text-gray-900 flex items-center mb-4">
                    <div class="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center mr-3">
                      <component :is="showAddModal ? PlusIcon : PencilIcon" class="w-5 h-5 text-emerald-600" />
                    </div>
                    {{ showAddModal ? 'เพิ่มสาขาวิชาใหม่' : 'แก้ไขสาขาวิชา' }}
                  </h3>
                  <div class="space-y-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">ชื่อสาขาวิชา</label>
                      <input v-model="formData.div_name" type="text"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                        placeholder="เช่น เทคโนโลยีสารสนเทศ" required />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">หลักสูตร</label>
                      <select v-model="formData.cur_id"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                        required>
                        <option value="">เลือกหลักสูตร</option>
                        <option v-for="curriculum in curriculums" :key="curriculum.cur_id" :value="curriculum.cur_id">
                          {{ curriculum.cur_shortname }}
                        </option>
                      </select>
                    </div>
                  </div>
                </div>
                <div class="bg-gray-50 px-6 py-4 rounded-b-lg flex flex-row-reverse gap-3">
                  <button type="submit" :disabled="isSubmitting"
                    class="inline-flex justify-center rounded-lg px-4 py-2 bg-emerald-500 text-sm font-medium text-white hover:bg-emerald-600 transition-colors disabled:opacity-50">
                    {{ isSubmitting ? 'กำลังบันทึก...' : (showAddModal ? 'เพิ่มสาขาวิชา' : 'บันทึกการแก้ไข') }}
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
                  <h3 class="text-lg font-bold text-gray-900">ยืนยันการลบสาขาวิชา</h3>
                  <p class="text-sm text-gray-500 mt-0.5">{{ deletingDivision?.div_name }}</p>
                </div>
              </div>
            </div>

            <!-- Loading -->
            <div v-if="isLoadingChildren" class="p-6 flex items-center justify-center">
              <div class="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mr-3"></div>
              <span class="text-sm text-gray-500">กำลังโหลดข้อมูล...</span>
            </div>

            <!-- Children info -->
            <div v-else class="p-6 border-b border-gray-100 space-y-4">

              <!-- มีแผนรับสมัครที่เกี่ยวข้อง -->
              <div v-if="deleteChildren.plans.length > 0">
                <div class="flex items-start p-3 bg-amber-50 border border-amber-200 rounded-lg mb-4">
                  <svg class="w-5 h-5 text-amber-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  </svg>
                  <p class="text-sm text-amber-800">
                    สาขาวิชานี้มี
                    <span class="font-semibold">แผนรับสมัคร {{ deleteChildren.plans.length }} แผน</span>
                    ที่เกี่ยวข้อง <span class="font-semibold text-red-700">หากลบจะกระทบข้อมูลเหล่านี้ทั้งหมด</span>
                  </p>
                </div>
                <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">แผนรับสมัครที่จะถูกลบ</p>
                <div class="bg-red-50 rounded-lg p-3 space-y-1.5">
                  <div v-for="plan in deleteChildren.plans" :key="plan.ap_id"
                    class="flex items-center text-sm text-red-800">
                    <span class="w-1.5 h-1.5 bg-red-400 rounded-full mr-2 flex-shrink-0"></span>
                    ปีการศึกษา {{ plan.ap_years }} — รับ {{ plan.plan_num }} คน
                  </div>
                </div>
              </div>

              <!-- ไม่มีข้อมูลลูก -->
              <div v-else>
                <p class="text-gray-600 text-sm">
                  คุณต้องการลบสาขาวิชา
                  <span class="font-semibold text-gray-900">{{ deletingDivision?.div_name }}</span>
                  ใช่หรือไม่? การดำเนินการนี้ไม่สามารถย้อนกลับได้
                </p>
              </div>
            </div>

            <!-- Footer -->
            <div class="p-4 flex justify-end gap-3">
              <button @click="closeDeleteModal"
                class="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                ยกเลิก
              </button>
              <button @click="confirmDelete" :disabled="isDeleting || isLoadingChildren"
                class="px-4 py-2 text-sm text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors flex items-center disabled:opacity-50">
                <TrashIcon class="w-4 h-4 mr-2" />
                {{ isDeleting ? 'กำลังลบ...' : 'ยืนยันการลบทั้งหมด' }}
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
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  BuildingOffice2Icon,
  MagnifyingGlassIcon
} from '@heroicons/vue/24/outline'
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
  curriculum?: Curriculum
  created_at: string
}

interface DeleteChildren {
  plans: { ap_id: number; ap_years: string; plan_num: number }[]
}

const emit = defineEmits(['refresh'])

// ── State ──────────────────────────────────────────────
const divisions = ref<Division[]>([])
const curriculums = ref<Curriculum[]>([])
const searchQuery = ref('')
const selectedAbbreviation = ref('')
const isSubmitting = ref(false)

const showAddModal = ref(false)
const showEditModal = ref(false)
const formData = ref({ div_id: 0, div_name: '', cur_id: 0 })

const showDeleteModal = ref(false)
const isDeleting = ref(false)
const isLoadingChildren = ref(false)
const deletingDivision = ref<Division | null>(null)
const deleteChildren = ref<DeleteChildren>({ plans: [] })

const toast = ref({ show: false, type: 'success' as 'success' | 'error', title: '', message: '' })
let toastTimer: ReturnType<typeof setTimeout> | null = null

// ── Computed ───────────────────────────────────────────
const curriculumOptions = computed(() => {
  return curriculums.value
})

const filteredDivisions = computed(() => {
  let filtered = divisions.value
  if (selectedAbbreviation.value) {
    filtered = filtered.filter(d => d.curriculum?.cur_id === Number(selectedAbbreviation.value))
  }
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    filtered = filtered.filter(d => d.div_name.toLowerCase().includes(q))
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
const fetchDivisions = async () => {
  try {
    const response = await apiService.getDivisions()
    divisions.value = response.data
    // Fetch curriculum data for each division
    await fetchCurriculums()
  } catch (error) {
    showToast('error', 'โหลดข้อมูลไม่สำเร็จ', 'ไม่สามารถดึงข้อมูลสาขาวิชาได้')
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

// ── Add / Edit ─────────────────────────────────────────
const handleSubmit = async () => {
  isSubmitting.value = true
  try {
    if (showAddModal.value) {
      await apiService.createDivision(formData.value)
      showToast('success', 'เพิ่มสาขาวิชาสำเร็จ', 'ข้อมูลถูกบันทึกเรียบร้อยแล้ว')
    } else {
      await apiService.updateDivision(formData.value.div_id, formData.value)
      showToast('success', 'แก้ไขสาขาวิชาสำเร็จ', 'ข้อมูลถูกอัปเดตเรียบร้อยแล้ว')
    }
    await fetchDivisions()
    emit('refresh')
    closeModal()
  } catch (error: any) {
    showToast('error', 'บันทึกไม่สำเร็จ', error?.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่')
  } finally {
    isSubmitting.value = false
  }
}

const editDivision = (division: Division) => {
  formData.value = {
    div_id: division.div_id,
    div_name: division.div_name,
    cur_id: division.cur_id
  }
  showEditModal.value = true
}

const closeModal = () => {
  showAddModal.value = false
  showEditModal.value = false
  formData.value = { div_id: 0, div_name: '', cur_id: 0 }
}

// ── Delete ─────────────────────────────────────────────
const openDeleteModal = async (division: Division) => {
  deletingDivision.value = division
  deleteChildren.value = { plans: [] }
  showDeleteModal.value = true
  isLoadingChildren.value = true
  try {
    const response = await apiService.getDivisionChildren(division.div_id)
    deleteChildren.value = response.data
  } catch (error) {
    showToast('error', 'โหลดข้อมูลไม่สำเร็จ', 'ไม่สามารถดึงข้อมูลที่เกี่ยวข้องได้')
  } finally {
    isLoadingChildren.value = false
  }
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  deletingDivision.value = null
  deleteChildren.value = { plans: [] }
}

const confirmDelete = async () => {
  if (!deletingDivision.value) return
  isDeleting.value = true
  try {
    await apiService.deleteDivision(deletingDivision.value.div_id)
    showToast('success', 'ลบสาขาวิชาสำเร็จ', 'ลบสาขาวิชาและข้อมูลที่เกี่ยวข้องทั้งหมดแล้ว')
    await fetchDivisions()
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
})
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: all 0.25s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; transform: scale(0.96); }
.toast-enter-active, .toast-leave-active { transition: all 0.4s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateX(100%); }
</style>
