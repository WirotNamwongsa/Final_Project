<template>
  <div class="space-y-6">

    <!-- Stat Cards -->
    <div v-if="isLoading" class="grid grid-cols-2 lg:grid-cols-5 gap-4">
      <div v-for="i in 5" :key="i" class="bg-white rounded-2xl p-5 animate-pulse h-32"></div>
    </div>

    <div v-else class="grid grid-cols-2 lg:grid-cols-5 gap-4">
      <!-- ผู้สมัครทั้งหมด -->
      <div class="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
        <div class="flex items-center justify-between mb-3">
          <div class="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <UsersIcon class="w-5 h-5 text-blue-500" />
          </div>
          <span class="text-xs font-medium text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full">ทั้งหมด</span>
        </div>
        <p class="text-3xl font-bold text-gray-900">{{ stats.totalApplicants.toLocaleString() }}</p>
        <p class="text-sm text-gray-400 mt-1">ผู้สมัครทั้งหมด</p>
      </div>

      <!-- รอตรวจสอบสลิป -->
      <div class="bg-white rounded-2xl p-5 border border-amber-100 shadow-sm hover:shadow-md transition-shadow">
        <div class="flex items-center justify-between mb-3">
          <div class="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
            <ClockIcon class="w-5 h-5 text-amber-500" />
          </div>
          <span class="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">รอตรวจสอบ</span>
        </div>
        <p class="text-3xl font-bold text-amber-600">{{ stats.pendingApprove.toLocaleString() }}</p>
        <p class="text-sm text-gray-400 mt-1">รอตรวจสอบสลิป</p>
      </div>

      <!-- รอชำระเงิน -->
      <div class="bg-white rounded-2xl p-5 border border-orange-100 shadow-sm hover:shadow-md transition-shadow">
        <div class="flex items-center justify-between mb-3">
          <div class="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
            <BanknotesIcon class="w-5 h-5 text-orange-500" />
          </div>
          <span class="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">รอชำระ</span>
        </div>
        <p class="text-3xl font-bold text-orange-500">{{ stats.pendingPayment.toLocaleString() }}</p>
        <p class="text-sm text-gray-400 mt-1">รอชำระเงิน</p>
      </div>

      <!-- มอบตัวออนไลน์ -->
      <div class="bg-white rounded-2xl p-5 border border-emerald-100 shadow-sm hover:shadow-md transition-shadow">
        <div class="flex items-center justify-between mb-3">
          <div class="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
            <ComputerDesktopIcon class="w-5 h-5 text-emerald-500" />
          </div>
          <span class="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">ออนไลน์</span>
        </div>
        <p class="text-3xl font-bold text-emerald-600">{{ stats.onlineEnrolled.toLocaleString() }}</p>
        <p class="text-sm text-gray-400 mt-1">มอบตัวออนไลน์</p>
      </div>

      <!-- มอบตัวทั้งหมด -->
      <div class="bg-white rounded-2xl p-5 border border-teal-100 shadow-sm hover:shadow-md transition-shadow">
        <div class="flex items-center justify-between mb-3">
          <div class="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center">
            <ClipboardDocumentCheckIcon class="w-5 h-5 text-teal-500" />
          </div>
          <span class="text-xs font-medium text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full">รวม</span>
        </div>
        <p class="text-3xl font-bold text-teal-600">{{ (stats.onlineEnrolled + stats.onsiteEnrolled).toLocaleString() }}</p>
        <p class="text-sm text-gray-400 mt-1">มอบตัวทั้งหมด</p>
        <p class="text-xs text-gray-300 mt-0.5">ออนไซต์ {{ stats.onsiteEnrolled }} คน</p>
      </div>
    </div>

    <!-- รายการรอตรวจสอบ + สรุปมอบตัวตามสาขา -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

      <!-- รายการรอตรวจสอบ -->
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div class="flex items-center justify-between px-5 py-4 border-b border-gray-50">
          <div class="flex items-center gap-2">
            <div class="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></div>
            <h2 class="font-semibold text-gray-800 text-sm">รายการรอตรวจสอบ</h2>
            <span class="text-xs bg-amber-100 text-amber-700 font-semibold px-2 py-0.5 rounded-full">
              {{ pendingList.length }} รายการ
            </span>
          </div>
          <RouterLink to="/admin/users"
            class="text-xs text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1">
            ดูทั้งหมด <ChevronRightIcon class="w-3.5 h-3.5" />
          </RouterLink>
        </div>

        <div v-if="isLoading" class="p-5 space-y-3">
          <div v-for="i in 4" :key="i" class="h-14 bg-gray-50 rounded-xl animate-pulse"></div>
        </div>

        <div v-else-if="pendingList.length === 0"
          class="flex flex-col items-center justify-center py-12 text-gray-300">
          <CheckCircleIcon class="w-10 h-10 mb-2" />
          <p class="text-sm font-medium">ไม่มีรายการรอตรวจสอบ</p>
        </div>

        <div v-else class="divide-y divide-gray-50 max-h-80 overflow-y-auto">
          <div v-for="item in pendingList" :key="item.app_id"
            class="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors">
            <div class="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
              <span class="text-xs font-bold text-amber-700">{{ item.full_name?.charAt(0) }}</span>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-800 truncate">{{ item.prefix }}{{ item.full_name }}</p>
              <p class="text-xs text-gray-400 truncate">{{ item.cur_shortname }} — {{ item.div_name }}</p>
            </div>
            <div class="flex flex-col items-end gap-1">
              <span :class="statusBadge(item.status).class">
                {{ statusBadge(item.status).label }}
              </span>
              <span class="text-xs text-gray-300">{{ formatDate(item.created_at) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- สรุปมอบตัวตามสาขา -->
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div class="flex items-center justify-between px-5 py-4 border-b border-gray-50">
          <div class="flex items-center gap-2">
            <ChartBarIcon class="w-4 h-4 text-emerald-500" />
            <h2 class="font-semibold text-gray-800 text-sm">ยอดมอบตัวตามสาขา</h2>
          </div>
          <RouterLink to="/admin/onsite-enrollment"
            class="text-xs text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1">
            จัดการ <ChevronRightIcon class="w-3.5 h-3.5" />
          </RouterLink>
        </div>

        <div v-if="isLoading" class="p-5 space-y-3">
          <div v-for="i in 4" :key="i" class="h-10 bg-gray-50 rounded-xl animate-pulse"></div>
        </div>

        <div v-else-if="enrollmentSummary.length === 0"
          class="flex flex-col items-center justify-center py-12 text-gray-300">
          <ChartBarIcon class="w-10 h-10 mb-2" />
          <p class="text-sm font-medium">ยังไม่มีข้อมูล</p>
        </div>

        <div v-else class="p-5 space-y-3 max-h-80 overflow-y-auto">
          <div v-for="row in enrollmentSummary" :key="row.ap_id">
            <div class="flex items-center justify-between mb-1.5">
              <p class="text-xs font-semibold text-gray-700 truncate min-w-0">
                {{ row.cur_shortname }} — {{ row.div_name }}
              </p>
              <div class="flex items-center gap-1 flex-shrink-0 ml-2">
                <span class="text-xs text-emerald-600 font-bold">{{ row.total_enrolled }}</span>
                <span class="text-xs text-gray-300">/</span>
                <span class="text-xs text-gray-500">{{ row.plan_num }}</span>
              </div>
            </div>
            <div class="w-full bg-gray-100 rounded-full h-2">
              <div class="h-2 rounded-full transition-all duration-500"
                :class="progressColor(row.total_enrolled, row.plan_num)"
                :style="{ width: Math.min((row.total_enrolled / row.plan_num) * 100, 100) + '%' }">
              </div>
            </div>
            <div class="flex justify-between text-xs text-gray-400 mt-1">
              <span>ออนไลน์ {{ row.online_enrolled }} | ออนไซต์ {{ row.onsite_enrolled }}</span>
              <span>เหลือ {{ row.remaining }} ที่นั่ง</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import {
  UsersIcon, ClockIcon, ComputerDesktopIcon, BanknotesIcon,
  ChevronRightIcon, ChartBarIcon, CheckCircleIcon, ClipboardDocumentCheckIcon,
} from '@heroicons/vue/24/outline'
import api from '@/services/httpClient'

const isLoading = ref(true)

const stats = ref({
  totalApplicants: 0,
  pendingApprove: 0,
  pendingPayment: 0,
  onlineEnrolled: 0,
  onsiteEnrolled: 0,
})

const pendingList = ref<any[]>([])
const enrollmentSummary = ref<any[]>([])

const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })
}

const progressColor = (current: number, max: number) => {
  const pct = (current / max) * 100
  if (pct >= 90) return 'bg-red-400'
  if (pct >= 70) return 'bg-amber-400'
  return 'bg-emerald-400'
}

const statusBadge = (status: string) => {
  if (status === 'pending_approve') {
    return {
      label: 'รอตรวจสอบสลิป',
      class: 'text-xs bg-amber-50 text-amber-600 border border-amber-200 px-2 py-0.5 rounded-full font-medium whitespace-nowrap'
    }
  }
  if (status === 'pending_payment') {
    return {
      label: 'รอชำระเงิน',
      class: 'text-xs bg-orange-50 text-orange-500 border border-orange-200 px-2 py-0.5 rounded-full font-medium whitespace-nowrap'
    }
  }
  return {
    label: status,
    class: 'text-xs bg-gray-50 text-gray-400 border border-gray-200 px-2 py-0.5 rounded-full font-medium whitespace-nowrap'
  }
}

onMounted(async () => {
  try {
    const [statsRes, summaryRes, pendingRes] = await Promise.all([
      api.get('/applications/stats'),
      api.get('/enrollments/summary'),
      api.get('/applications/pending'),
    ])

    const overview = statsRes.data?.data?.overview
    const summary: any[] = summaryRes.data?.data ?? []

    stats.value.totalApplicants = Number(overview?.total_applicants ?? 0)
    stats.value.pendingApprove  = Number(overview?.pending_approve ?? 0)
    stats.value.pendingPayment = Number(overview?.pending_payment ?? 0)
    stats.value.onlineEnrolled  = Number(overview?.enrolled ?? 0)
    stats.value.onsiteEnrolled  = summary.reduce((sum: number, r: any) => sum + Number(r.onsite_enrolled || 0), 0)

    pendingList.value       = pendingRes.data?.data ?? []
    enrollmentSummary.value = summary

  } catch (e) {
    console.error('Dashboard load error:', e)
  } finally {
    isLoading.value = false
  }
})
</script>