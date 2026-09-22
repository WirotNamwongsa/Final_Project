<template>
  <div class="max-w-4xl mx-auto">
    <div class="bg-white rounded-2xl shadow-sm p-8">

      <!-- Document List -->
      <div class="mb-8">
        <h2 class="text-lg font-semibold text-gray-700 flex items-center gap-2 mb-6">
          <DocumentTextIcon class="w-5 h-5 text-emerald-500" /> โปรดเตรียมภาพถ่ายเอกสาร ให้พร้อม
        </h2>
        <div class="space-y-4">
          <div class="flex items-start space-x-4 p-4 bg-emerald-50 rounded-xl border border-emerald-200">
            <div class="flex-shrink-0 w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center">
              <span class="text-white font-bold">1</span>
            </div>
            <div class="flex-1">
              <h3 class="text-lg font-semibold text-gray-800 mb-1">สำเนาทะเบียนบ้านของตนเอง</h3>
              <p class="text-gray-600 text-sm">เตรียมสำเนาทะเบียนบ้านของนักเรียนโดยต้องเป็นเอกสารที่ชัดเจนและสมบูรณ์</p>
            </div>
          </div>
          <div class="flex items-start space-x-4 p-4 bg-green-50 rounded-xl border border-green-200">
            <div class="flex-shrink-0 w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
              <span class="text-white font-bold">2</span>
            </div>
            <div class="flex-1">
              <h3 class="text-lg font-semibold text-gray-800 mb-1">สำเนาทะเบียนบ้านของบิดา-มารดา</h3>
              <p class="text-gray-600 text-sm">เตรียมสำเนาทะเบียนบ้านของบิดาหรือมารดา หรือผู้ปกครองที่รับผิดชอบ</p>
            </div>
          </div>
          <div class="flex items-start space-x-4 p-4 bg-teal-50 rounded-xl border border-teal-200">
            <div class="flex-shrink-0 w-10 h-10 bg-teal-600 rounded-full flex items-center justify-center">
              <span class="text-white font-bold">3</span>
            </div>
            <div class="flex-1">
              <h3 class="text-lg font-semibold text-gray-800 mb-1">สลิปการโอนชำระค่าบำรุงการศึกษาและเครื่องแบบ</h3>
              <p class="text-gray-600 text-sm">
                กรุณาเตรียมสลิปการโอนเงินที่แสดงการชำระค่าบำรุงการศึกษาและค่าเครื่องแบบให้เรียบร้อย</p>
            </div>
          </div>
        </div>
      </div>

      <div class="border-t border-gray-200"></div>

      <!-- ID Card Input -->
      <div class="mt-8">
        <h3 class="text-lg font-semibold text-gray-700 flex items-center gap-2 mb-4">
          <UserIcon class="w-5 h-5 text-emerald-500" /> ข้อมูลส่วนตัว
        </h3>
        <div class="space-y-4">
          <div>
            <label for="idType" class="block text-sm font-medium text-gray-700 mb-2">
              ประเภทเอกสารยืนยันตัวตน *
            </label>
            <select id="idType" v-model="selectedIdType"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors duration-200 mb-4"
              @change="resetValidation">
              <option value="">เลือกประเภทเอกสาร</option>
              <option value="thai_id">บัตรประจำตัวประชาชนไทย</option>
              <option value="alien_id">บัตรประจำตัวคนต่างด้าว</option>
              <option value="passport">หนังสือเดินทาง (Passport)</option>
              <option value="g_code">G-Code (บุคคลไม่มีสัญชาติไทย)</option>
              <option value="other">เอกสารราชการอื่น ๆ</option>
            </select>
          </div>

          <div v-if="selectedIdType">
            <label for="idCard" class="block text-sm font-medium text-gray-700 mb-2">
              {{ idTypeLabel }} *
            </label>
            <input type="text" id="idCard" :maxlength="maxLength" :pattern="inputPattern" :inputmode="inputMode"
              :placeholder="idTypePlaceholder"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors duration-200"
              @input="validateIdCard" />
            <p class="mt-1 text-xs text-gray-500">{{ idTypeHint }}</p>
            <p v-if="errorMessage" class="mt-2 text-sm text-red-600">{{ errorMessage }}</p>
          </div>

          <div class="flex justify-center mt-6">
            <button v-if="!applicantInfo" @click="checkApplicant" :disabled="!isValidIdCard || isLoading"
              class="px-8 py-3 bg-emerald-500 text-white font-semibold rounded-lg hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105">
              <span v-if="isLoading" class="flex items-center gap-2">
                <svg class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none"
                  viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                </svg>
                กำลังตรวจสอบ...
              </span>
              <span v-else>ตรวจสอบผู้สมัคร</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Preview Section -->
      <div v-if="applicantInfo" class="mt-8">
        <h3 class="text-lg font-semibold text-gray-700 flex items-center gap-2 mb-4">
          <UserIcon class="w-5 h-5 text-emerald-500" /> ข้อมูลผู้สมัคร
        </h3>
        <div class="space-y-4">
          <!-- 1.  2.  3.  4.  5.  6. -->
          <div class="bg-gray-50 rounded-xl p-4">
            <p class="font-medium text-gray-700 mb-3">ข้อมูลส่วนตัว</p>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div v-if="applicantInfo.prefix || applicantInfo.full_name || applicantInfo.name">
                <p class="text-xs text-gray-400">ชื่อ-นามสกุล</p>
                <p class="font-medium">{{ applicantInfo.prefix }} {{ applicantInfo.full_name || applicantInfo.name }}
                </p>
              </div>
              <div v-if="applicantInfo.id_card_number || applicantInfo.id_card || applicantInfo.idCard">
                <p class="text-xs text-gray-400">เลขบัตรประชาชน</p>
                <p class="font-medium">{{ applicantInfo.id_card_number || applicantInfo.id_card || applicantInfo.idCard
                  }}</p>
              </div>
              <div v-if="applicantInfo.phone">
                <p class="text-xs text-gray-400">เบอร์โทรศัพท์</p>
                <p class="font-medium">{{ applicantInfo.phone }}</p>
              </div>
              <div v-if="applicantInfo.email">
                <p class="text-xs text-gray-400">อีเมล</p>
                <p class="font-medium">{{ applicantInfo.email }}</p>
              </div>
              <div v-if="applicantInfo.created_at" class="col-span-2">
                <p class="text-xs text-gray-400">วันที่สมัคร</p>
                <p class="font-medium">{{ formatDate(applicantInfo.created_at) }}</p>
              </div>
            </div>
          </div>

          <!--  7.  8.  9.  -->
          <div v-if="applicantInfo.cur_name || applicantInfo.div_name" class="bg-emerald-50 rounded-xl p-4">
            <p class="font-medium text-gray-700 mb-3">ข้อมูลการศึกษา</p>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div v-if="applicantInfo.cur_name">
                <p class="text-xs text-gray-400">แผนการเรียน</p>
                <p class="font-medium text-emerald-600">{{ applicantInfo.cur_name }}</p>
              </div>
              <div v-if="applicantInfo.div_name">
                <p class="text-xs text-gray-400">สาขา/ส่วนงาน</p>
                <p class="font-medium text-emerald-600">{{ applicantInfo.div_name }}</p>
              </div>
            </div>
          </div>

          <!--  10.  11.  12.  13.  -->
          <div
            v-if="applicantInfo.prev_school || applicantInfo.prev_level || applicantInfo.prev_year || applicantInfo.gpa"
            class="bg-blue-50 rounded-xl p-4">
            <p class="font-medium text-gray-700 mb-3">ข้อมูลการศึกษาก่อนหน้า</p>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div v-if="applicantInfo.prev_school">
                <p class="text-xs text-gray-400">โรงเรียนเดิม</p>
                <p class="font-medium">{{ applicantInfo.prev_school }}</p>
              </div>
              <div v-if="applicantInfo.prev_level">
                <p class="text-xs text-gray-400">ระดับการศึกษาเดิม</p>
                <p class="font-medium">{{ prevLevelLabel(applicantInfo.prev_level) }}</p>
              </div>
              <div v-if="applicantInfo.prev_year">
                <p class="text-xs text-gray-400">ปีการศึกษาเดิม</p>
                <p class="font-medium">{{ applicantInfo.prev_year }}</p>
              </div>
              <div v-if="applicantInfo.gpa">
                <p class="text-xs text-gray-400">เกรดเฉลี่ยการเรียน</p>
                <p class="font-medium">{{ applicantInfo.gpa }}</p>
              </div>
            </div>
          </div>

          <!--  14.  -->
          <div v-if="applicantInfo.total_amount || applicantInfo.due_date || applicantInfo.paid_at"
            class="bg-orange-50 rounded-xl p-4">
            <p class="font-medium text-gray-700 mb-3">ข้อมูลการชำระเงิน</p>
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-gray-600">ค่าใช้จ่ายทั้งหมดสำหรับการสมัครเข้าเรียน</p>
                </div>
                <p class="text-xl font-bold text-orange-600">{{ applicantInfo.total_amount || 0 }} บาท</p>
              </div>
              <div v-if="applicantInfo.paid_at" class="flex items-center justify-between">
                <p class="text-xs text-gray-400">วันที่ชำระเงิน</p>
                <p class="font-medium text-green-600">{{ formatDate(applicantInfo.paid_at) }}</p>
              </div>
              <div v-if="applicantInfo.enrolled_at" class="flex items-center justify-between">
                <p class="text-xs text-gray-400">วันที่สมัครเรียน</p>
                <p class="font-medium text-green-600">{{ formatDate(applicantInfo.enrolled_at) }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Proceed Button -->
        <div class="flex justify-center mt-6">
          <button @click="handleSubmit"
            class="px-8 py-3 bg-emerald-500 text-white font-semibold rounded-lg hover:bg-emerald-600 transition-all duration-200 transform hover:scale-105">
            ดำเนินการต่อ
          </button>
        </div>
      </div>

      <!-- ... -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { DocumentTextIcon, UserIcon } from '@heroicons/vue/24/outline'

import api from '@/services/httpClient.ts'

const router = useRouter()
const selectedIdType = ref('')
const idCard = ref('')
const errorMessage = ref('')
const isValidIdCard = ref(false)
const isLoading = ref(false)
const applicantInfo = ref<any>(null)

const prevLevelLabel = (level: string) => {
  const map: Record<string, string> = {
    m3: 'มัธยมศึกษาตอนต้น (ม.3)',
    m6: 'มัธยมศึกษาตอนปลาย (ม.6)',
    pvc: 'ประกาศนียบัตรวิชาชีพ (ปวช.)',
  }
  return map[level] || level
}

// Computed properties for different ID types
const idTypeLabel = computed(() => {
  const map: Record<string, string> = {
    thai_id: 'เลขประจำตัวประชาชน',
    alien_id: 'เลขประจำตัวคนต่างด้าว',
    passport: 'เลขหนังสือเดินทาง',
    g_code: 'G-Code',
    other: 'เลขเอกสารราชการ',
  }
  return map[selectedIdType.value] || 'หมายเลขประจำตัว'
})

const idTypePlaceholder = computed(() => {
  const map: Record<string, string> = {
    thai_id: 'เลขประจำตัวประชาชน 13 หลัก',
    alien_id: 'เช่น 6-1234-56789-12-3',
    passport: 'เช่น AA1234567',
    g_code: 'เช่น G-1234567',
    other: 'หมายเลขเอกสาร',
  }
  return map[selectedIdType.value] || ''
})

const idTypeHint = computed(() => {
  const map: Record<string, string> = {
    thai_id: 'กรอกตัวเลข 13 หลัก ไม่มีขีด',
    alien_id: 'ตามที่ระบุในบัตรประจำตัวคนต่างด้าว',
    passport: 'ตัวอักษรและตัวเลข ตามหน้าหนังสือเดินทาง',
    g_code: 'รหัส G ที่ออกโดยกรมการปกครอง',
    other: 'หมายเลขตามเอกสารราชการที่ใช้แสดงตน',
  }
  return map[selectedIdType.value] || ''
})

const maxLength = computed(() => {
  const map: Record<string, number> = {
    thai_id: 13,
    alien_id: 20,
    passport: 20,
    g_code: 15,
    other: 30,
  }
  return map[selectedIdType.value] || 30
})

const inputPattern = computed(() => {
  if (selectedIdType.value === 'thai_id') return '[0-9]*'
  if (selectedIdType.value === 'passport') return '[A-Za-z0-9]*'
  return '.*'
})

const inputMode = computed(() => {
  if (selectedIdType.value === 'thai_id') return 'numeric'
  if (selectedIdType.value === 'passport') return 'text'
  return 'text'
})

const resetValidation = () => {
  idCard.value = ''
  errorMessage.value = ''
  isValidIdCard.value = false
}

const validateIdCard = (event: Event) => {
  const value = (event.target as HTMLInputElement).value

  // Format input based on ID type
  if (selectedIdType.value === 'thai_id') {
    if (!/^\d*$/.test(value)) {
      (event.target as HTMLInputElement).value = value.replace(/\D/g, '')
      return
    }
  } else if (selectedIdType.value === 'passport') {
    (event.target as HTMLInputElement).value = value.toUpperCase()
  }

  idCard.value = value

  if (value.length === 0) {
    errorMessage.value = ''
    isValidIdCard.value = false
  } else {
    let minLength = 1
    let errorMsg = ''

    switch (selectedIdType.value) {
      case 'thai_id':
        minLength = 13
        if (value.length < 13) {
          errorMsg = 'กรุณากรอกเลขบัตรประชาชนให้ครบ 13 หลัก'
        }
        break
      case 'alien_id':
        minLength = 8
        if (value.length < 8) {
          errorMsg = 'กรุณากรอกเลขบัตรประจำตัวคนต่างด้าวให้ครบ'
        }
        break
      case 'passport':
        minLength = 6
        if (value.length < 6) {
          errorMsg = 'กรุณากรอกเลขหนังสือเดินทางให้ครบ'
        }
        break
      case 'g_code':
        minLength = 8
        if (value.length < 8) {
          errorMsg = 'กรุณากรอกรหัส G-Code ให้ครบ'
        }
        break
      case 'other':
        minLength = 3
        if (value.length < 3) {
          errorMsg = 'กรุณากรอกหมายเลขเอกสารให้ครบ'
        }
        break
      default:
        minLength = 1
        errorMsg = 'กรุณาเลือกประเภทเอกสารก่อน'
    }

    if (errorMsg) {
      errorMessage.value = errorMsg
      isValidIdCard.value = false
    } else {
      errorMessage.value = ''
      isValidIdCard.value = true
    }
  }
}

const checkApplicant = async () => {
  if (!isValidIdCard.value) return
  isLoading.value = true
  errorMessage.value = ''

  try {
    const res = await api.get(`/applications/check/${idCard.value}`)
    applicantInfo.value = res.data?.data || res.data
    if (!applicantInfo.value) {
      errorMessage.value = 'ไม่พบข้อมูลผู้สมัคร'
    }
  } catch (error: any) {
    if (error.response?.status === 404) {
      errorMessage.value = 'ไม่พบข้อมูลการสมัครในระบบ'
    } else {
      errorMessage.value = 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง'
    }
    applicantInfo.value = null
  } finally {
    isLoading.value = false
  }
}

const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    'pending_payment': '...',
    'paid': '...',
    'enrolled': '...'
  }
  return statusMap[status] || status
}

const formatDate = (dateString: string) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const handleSubmit = async () => {
  if (!applicantInfo.value) return
  router.push(`/enrollment/${idCard.value}`)
}
</script>