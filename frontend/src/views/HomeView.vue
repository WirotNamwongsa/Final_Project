<template>
  <div class="max-w-4xl mx-auto space-y-8 pb-16">

    <!-- Quick Nav -->
    <div class="flex items-center gap-2 flex-wrap">
      <a v-for="nav in quickNav" :key="nav.id" :href="`#${nav.id}`"
        class="inline-flex items-center gap-1.5 px-4 py-2 bg-white rounded-xl text-sm text-gray-600 hover:text-emerald-600 hover:border-emerald-300 border border-gray-200 transition-all shadow-sm">
        <component :is="nav.icon" class="w-4 h-4" />
        {{ nav.label }}
      </a>
    </div>

    <!-- Hero -->
    <div id="hero" class="rounded-2xl overflow-hidden relative"
      style="background: linear-gradient(135deg, rgba(20,184,166,0.9), rgba(101,163,13,0.9))">
      <div class="px-6 py-8 md:px-10 md:py-12 relative z-10">
        <div class="flex items-center gap-3 md:gap-4 mb-6">
          <div class="w-12 h-12 md:w-16 md:h-16 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
            <AcademicCapIcon class="w-7 h-7 md:w-9 md:h-9 text-white" />
          </div>
          <div>
            <h1 class="text-lg md:text-2xl font-bold text-white">ระบบรับสมัครนักเรียนนักศึกษา</h1>
            <p class="text-white/80 text-xs md:text-sm">วิทยาลัยเทคนิคเลย ประจำปีการศึกษา 2569</p>
          </div>
        </div>
        <p class="text-white/90 text-sm leading-relaxed mb-8 max-w-xl">
          สมัครเรียนออนไลน์ได้ง่าย สะดวก รวดเร็ว ไม่ต้องเดินทางมาที่วิทยาลัย
          รองรับทั้งหลักสูตร ปวช. และ ปวส. หลากหลายสาขาวิชา
        </p>
        <div class="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
          <RouterLink to="/register"
            class="inline-flex items-center gap-2 px-5 py-2.5 md:px-6 md:py-3 bg-white text-emerald-600 rounded-xl font-medium text-sm hover:bg-emerald-50 transition-all shadow-sm">
            <PencilSquareIcon class="w-4 h-4" /> สมัครเรียนเลย
          </RouterLink>
          <RouterLink to="/check-status"
            class="inline-flex items-center gap-2 px-5 py-2.5 md:px-6 md:py-3 bg-white/20 text-white rounded-xl font-medium text-sm hover:bg-white/30 transition-all">
            <MagnifyingGlassIcon class="w-4 h-4" /> ตรวจสอบสถานะ
          </RouterLink>
        </div>
      </div>
      <div class="absolute -right-10 -top-10 w-48 h-48 bg-white/10 rounded-full" />
      <div class="absolute -right-4 -bottom-8 w-32 h-32 bg-white/10 rounded-full" />
    </div>

    <!-- ขั้นตอนการสมัคร + เอกสาร -->
    <div id="howto">
      <h2 class="text-base font-semibold text-gray-700 mb-4 flex items-center gap-2">
        <ListBulletIcon class="w-5 h-5 text-emerald-500" /> ขั้นตอนการสมัครเรียน
      </h2>
      <div class="bg-white rounded-2xl shadow-sm p-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          <div>
            <p class="text-xs font-medium text-gray-400 uppercase tracking-wide mb-4">ขั้นตอน</p>
            <div class="flex flex-col">
              <div v-for="(step, i) in howToSteps" :key="i" class="flex gap-3">
                <div class="flex flex-col items-center">
                  <div
                    class="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style="background: linear-gradient(135deg, rgba(20,184,166,0.9), rgba(101,163,13,0.9))">
                    {{ i + 1 }}
                  </div>
                  <div v-if="i < howToSteps.length - 1" class="w-0.5 bg-gray-100 flex-1 my-1"
                    style="min-height: 20px;" />
                </div>
                <div class="pb-4">
                  <p class="font-medium text-gray-800 text-sm">{{ step.title }}</p>
                  <p class="text-xs text-gray-400 mt-0.5">{{ step.desc }}</p>
                </div>
              </div>
            </div>
          </div>
          <div>
            <p class="text-xs font-medium text-gray-400 uppercase tracking-wide mb-4">เอกสารที่ต้องใช้</p>
            <div class="space-y-2">
              <div v-for="doc in documents" :key="doc.label" class="flex items-start gap-2.5 p-3 rounded-xl bg-gray-50">
                <div class="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                  :class="doc.type === 'required' ? 'bg-emerald-100' : doc.type === 'either' ? 'bg-orange-100' : 'bg-blue-100'">
                  <component :is="doc.icon" class="w-3.5 h-3.5"
                    :class="doc.type === 'required' ? 'text-emerald-600' : doc.type === 'either' ? 'text-orange-500' : 'text-blue-500'" />
                </div>
                <div class="flex-1">
                  <p class="text-xs font-medium text-gray-700">{{ doc.label }}</p>
                  <p class="text-xs text-gray-400 mt-0.5">{{ doc.desc }}</p>
                </div>
                <span class="text-xs px-2 py-0.5 rounded-full flex-shrink-0 font-medium" :class="doc.type === 'required' ? 'bg-emerald-100 text-emerald-600'
                  : doc.type === 'either' ? 'bg-orange-100 text-orange-500'
                    : 'bg-blue-100 text-blue-500'">
                  {{ doc.type === 'required' ? 'จำเป็น' : doc.type === 'either' ? 'อย่างใดอย่างหนึ่ง' : 'เพิ่มเติม' }}
                </span>
              </div>
            </div>
          </div>
        </div>
        <RouterLink to="/register"
          class="mt-6 w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium text-white transition-all"
          style="background: linear-gradient(to right, rgba(20,184,166,0.9), rgba(101,163,13,0.9))">
          <PencilSquareIcon class="w-4 h-4" /> เริ่มสมัครเรียนเลย
        </RouterLink>
      </div>
    </div>

    <!-- สถิติการรับสมัคร -->
    <div id="stats">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-base md:text-2xl font-semibold text-gray-700 flex items-center gap-2">
          <ChartBarIcon class="w-5 h-5 md:w-7 md:h-7 text-emerald-500 flex-shrink-0" /> สถิติการรับสมัครนักเรียน นักศึกษา ปีการศึกษา 2569
        </h2>
      </div>
      <div class="flex flex-wrap items-center gap-2 mb-1">
        <span v-if="isLoading" class="text-xs text-gray-400 flex items-center gap-1">
          <ArrowPathIcon class="w-3 h-3 animate-spin" /> กำลังโหลด...
        </span>
        <div class="flex flex-wrap gap-2 mb-3">
          <button v-for="f in filters" :key="f.id" @click="activeFilter = f.id"
            class="px-3 py-1.5 rounded-xl text-xs font-medium transition-all border" :class="activeFilter === f.id
              ? 'bg-emerald-500 text-white border-emerald-500'
              : 'bg-white text-gray-500 border-gray-200 hover:border-emerald-300'">
            {{ f.label }}
          </button>
        </div>
      </div>

      <!-- ภาพรวม -->
      <div v-if="activeFilter === 'all'" class="grid grid-cols-2 gap-4 my-4">
        <div v-for="stat in overviewStats" :key="stat.label" class="bg-white rounded-2xl p-5 shadow-sm">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
            :style="`background-color: ${stat.bgColor}`">
            <component :is="stat.icon" class="w-5 h-5" :style="`color: ${stat.color}`" />
          </div>
          <p class="text-2xl font-bold text-gray-800">{{ stat.value.toLocaleString() }}</p>
          <p class="text-xs text-gray-400 mt-0.5">{{ stat.label }}</p>
          <p class="text-xs mt-1" :style="`color: ${stat.color}`">{{ stat.desc }}</p>
        </div>
      </div>

      <!-- กราฟ ปวช. vs ปวส. -->
      <div v-for="c in courseStats" :key="c.name" class="mt-4">
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center gap-2">
            <span class="text-xl font-semibold" :class="c.name === 'ปวช.' ? 'text-emerald-600' : 'text-blue-600'">
              {{ c.name }}
            </span>
            <span class="text-xs text-gray-400">เปิดรับ {{ c.quota }} ที่นั่ง</span>
          </div>
        </div>
        <div class="relative h-8 bg-gray-100 rounded-xl overflow-hidden">
          <div class="absolute left-0 top-0 h-full rounded-xl transition-all"
            :style="`width: ${c.quota > 0 ? (c.applicant / c.quota) * 100 : 0}%; background-color: ${c.name === 'ปวช.' ? '#6ee7b7' : '#93c5fd'}`" />
          <div class="absolute left-0 top-0 h-full rounded-xl transition-all"
            :style="`width: ${c.quota > 0 ? (c.enrolled / c.quota) * 100 : 0}%; background-color: ${c.name === 'ปวช.' ? '#10b981' : '#3b82f6'}`" />
        </div>
        <div class="flex items-center gap-4 mt-2">
          <div class="flex items-center gap-1.5">
            <div class="w-3 h-3 rounded-full" :class="c.name === 'ปวช.' ? 'bg-emerald-500' : 'bg-blue-500'" />
            <span class="text-xs text-gray-500">มอบตัวแล้ว {{ c.enrolled }} คน</span>
          </div>
          <div class="flex items-center gap-1.5">
            <div class="w-3 h-3 rounded-full" :class="c.name === 'ปวช.' ? 'bg-emerald-200' : 'bg-blue-200'" />
            <span class="text-xs text-gray-500">ผู้สมัคร {{ c.applicant }} คน</span>
          </div>
          <div class="flex items-center gap-1.5">
            <div class="w-3 h-3 rounded-full bg-gray-200" />
            <!-- ที่ว่าง = จำนวนเปิดรับ - มอบตัวรวม (online+onsite) -->
            <span class="text-xs text-gray-500">ที่ว่าง {{ c.quota - c.enrolled }} ที่นั่ง</span>
          </div>
        </div>
      </div>

      <!-- กราฟสาขา ปวช. -->
      <div v-if="activeFilter === 'all' || activeFilter === 'pvc'" class="bg-white rounded-2xl shadow-sm p-6 mt-4">
        <p class="text-sm font-semibold text-gray-700 mb-1">
          สาขาวิชา <span class="text-emerald-600">ปวช.</span>
        </p>
        <div class="space-y-3">
          <div v-for="b in pvcStats" :key="b.name">
            <div class="flex items-center justify-between mb-1">
              <p class="text-xs font-medium text-gray-600">{{ b.name }} <span
                  class="text-xs font-normal text-gray-400">เปิดรับ {{ b.quota }} ที่นั่ง</span></p>
              <div class="flex items-center gap-1 text-xs text-gray-400">
                <span class="font-medium" :class="b.name.includes('ปวช') ? 'text-emerald-600' : 'text-blue-600'">
                  มอบตัว {{ b.enrolled }}
                </span>
                <span class="mx-1">/</span>
                <span>ที่ว่าง {{ b.remaining }}</span>
                <span v-if="b.remaining <= 0"
                  class="text-red-500 font-medium text-xs px-1.5 py-0.5 bg-red-50 rounded-md ml-1">เต็ม</span>
              </div>
            </div>
            <div class="relative h-4 bg-gray-100 rounded-full overflow-hidden">
              <div class="absolute left-0 top-0 h-full bg-emerald-200 rounded-full transition-all"
                :style="`width: ${b.quota > 0 ? (b.applicant / b.quota) * 100 : 0}%`" />
              <div class="absolute left-0 top-0 h-full bg-emerald-500 rounded-full transition-all"
                :style="`width: ${b.quota > 0 ? (b.enrolled / b.quota) * 100 : 0}%`" />
            </div>
          </div>
        </div>
        <div class="flex items-center gap-4 mt-4 pt-3 border-t border-gray-100">
          <div class="flex items-center gap-1.5">
            <div class="w-3 h-3 rounded-full bg-emerald-500" /><span class="text-xs text-gray-400">มอบตัวแล้ว</span>
          </div>
          <div class="flex items-center gap-1.5">
            <div class="w-3 h-3 rounded-full bg-emerald-200" /><span class="text-xs text-gray-400">ผู้สมัคร</span>
          </div>
          <div class="flex items-center gap-1.5">
            <div class="w-3 h-3 rounded-full bg-gray-100" /><span class="text-xs text-gray-400">จำนวนเปิดรับ</span>
          </div>
        </div>
      </div>

      <!-- กราฟสาขา ปวส. -->
      <div v-if="activeFilter === 'all' || activeFilter === 'pvs'" class="bg-white rounded-2xl shadow-sm p-6 mt-4">
        <p class="text-sm font-semibold text-gray-700 mb-1">
          สาขาวิชา <span class="text-blue-600">ปวส.</span>
        </p>
        <div class="space-y-3">
          <div v-for="b in pvsStats" :key="`${b.name}-${b.curLabel}`">
            <div class="flex items-center justify-between mb-1">
              <div>
                <p class="text-xs font-medium text-gray-600">{{ b.name }}. <span
                    class="font-normal text-xs text-gray-400">{{ b.curLabel }}</span>
                  <span class="text-xs font-normal text-gray-400"> - เปิดรับ {{ b.quota }} ที่นั่ง</span>
                </p>

              </div>
              <div class="flex items-center gap-1 text-xs text-gray-400">
                <span class="text-blue-600 font-medium">มอบตัว {{ b.enrolled }}</span>
                <span class="mx-1">/</span>
                <span> ที่ว่าง {{ b.remaining }}</span>
                <span v-if="b.remaining <= 0"
                  class="text-red-500 font-medium text-xs px-1.5 py-0.5 bg-red-50 rounded-md ml-1">เต็ม</span>
              </div>
            </div>
            <div class="relative h-4 bg-gray-100 rounded-full overflow-hidden mb-3">
              <div class="absolute left-0 top-0 h-full bg-blue-200 rounded-full transition-all"
                :style="`width: ${b.quota > 0 ? (b.applicant / b.quota) * 100 : 0}%`" />
              <div class="absolute left-0 top-0 h-full bg-blue-500 rounded-full transition-all"
                :style="`width: ${b.quota > 0 ? (b.enrolled / b.quota) * 100 : 0}%`" />
            </div>
          </div>
        </div>
        <div class="flex items-center gap-4 mt-4 pt-3 border-t border-gray-100">
          <div class="flex items-center gap-1.5">
            <div class="w-3 h-3 rounded-full bg-blue-500" /><span class="text-xs text-gray-400">มอบตัวแล้ว</span>
          </div>
          <div class="flex items-center gap-1.5">
            <div class="w-3 h-3 rounded-full bg-blue-200" /><span class="text-xs text-gray-400">ผู้สมัคร</span>
          </div>
          <div class="flex items-center gap-1.5">
            <div class="w-3 h-3 rounded-full bg-gray-100" /><span class="text-xs text-gray-400">จำนวนเปิดรับ</span>
          </div>
        </div>
      </div>

    </div>

    <!-- ปุ่มขึ้นบนสุด -->
    <Transition name="fade">
      <button v-if="showScrollTop" @click="scrollToTop"
        class="fixed bottom-6 right-6 w-11 h-11 bg-white border border-gray-200 rounded-xl shadow-md flex items-center justify-center text-gray-500 hover:text-emerald-600 hover:border-emerald-300 transition-all z-40">
        <ChevronUpIcon class="w-5 h-5" />
      </button>
    </Transition>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { apiService } from '../utils/api'
import {
  AcademicCapIcon, PencilSquareIcon, MagnifyingGlassIcon,
  ChartBarIcon, ListBulletIcon, ChevronUpIcon, ArrowPathIcon,
  UserGroupIcon, CheckBadgeIcon, ClockIcon,
  IdentificationIcon, DocumentTextIcon, PhotoIcon, DocumentDuplicateIcon,
  HomeIcon
} from '@heroicons/vue/24/outline'

const activeFilter = ref('all')
const showScrollTop = ref(false)
const isLoading = ref(false)

// ข้อมูลจาก API
const statsData = ref<any>(null)
const summaryData = ref<any[]>([])

const quickNav = [
  { id: 'howto', label: 'ขั้นตอนการสมัคร', icon: ListBulletIcon },
  { id: 'stats', label: 'สถิติการรับสมัคร', icon: ChartBarIcon },
]

const filters = [
  { id: 'all', label: 'ภาพรวม' },
  { id: 'course', label: 'ปวช. vs ปวส.' },
  { id: 'pvc', label: 'สาขา ปวช.' },
  { id: 'pvs', label: 'สาขา ปวส.' },
]

const howToSteps = [
  { title: 'กรอกข้อมูลส่วนตัวและอัพโหลดบัตรประชาชน', desc: 'เตรียมบัตรประชาชนด้านหน้าและด้านหลัง' },
  { title: 'กรอกประวัติการศึกษาและอัพโหลดหลักฐาน', desc: 'เลือกอัพ ป.พ. / หนังสือรับรอง / บัตรนักเรียน' },
  { title: 'เลือกหลักสูตรและสาขาวิชาที่ต้องการสมัคร', desc: 'ปวช. หรือ ปวส. ตามวุฒิที่มี — ดูที่ว่างแบบ real-time' },
  { title: 'สั่งจองเครื่องแบบและอุปกรณ์การเรียน', desc: 'สั่งล่วงหน้าผ่านระบบได้เลย (ไม่บังคับ)' },
  { title: 'ยืนยันข้อมูลและชำระค่าสมัคร', desc: 'พิมพ์ใบชำระเงิน โอนเงิน และอัพโหลดสลิปภายใน 3 วัน' },
  { title: 'มอบตัวผ่านระบบออนไลน์', desc: 'อัพสำเนาทะเบียนบ้านของตนเอง บิดา และมารดา เพื่อยืนยันการมอบตัว' },
]

const documents = [
  { label: 'บัตรประจำตัวประชาชน', desc: 'ด้านหน้าและด้านหลัง (ใช้ตอนสมัคร)', icon: IdentificationIcon, type: 'required' },
  { label: 'วุฒิการศึกษา (ป.พ.)', desc: 'ด้านหน้าและด้านหลัง', icon: DocumentDuplicateIcon, type: 'either' },
  { label: 'หนังสือรับรองการเป็นนักเรียน', desc: 'ด้านหน้าเพียงด้านเดียว', icon: DocumentTextIcon, type: 'either' },
  { label: 'บัตรนักเรียน', desc: 'ด้านหน้าเพียงด้านเดียว', icon: PhotoIcon, type: 'either' },
  { label: 'สำเนาทะเบียนบ้าน (ของตนเอง)', desc: 'ใช้ตอนมอบตัวผ่านระบบ', icon: HomeIcon, type: 'enrollment' },
  { label: 'สำเนาทะเบียนบ้าน (บิดา)', desc: 'ใช้ตอนมอบตัวผ่านระบบ', icon: HomeIcon, type: 'enrollment' },
  { label: 'สำเนาทะเบียนบ้าน (มารดา)', desc: 'ใช้ตอนมอบตัวผ่านระบบ', icon: HomeIcon, type: 'enrollment' },
]

// ===== Computed จาก API data =====

const overviewStats = computed(() => {
  const overview = statsData.value?.overview
  // applicant_count = คนที่ยังไม่มอบตัว (pending_payment + paid)
  const pendingCount = Number(overview?.applicant_count || 0)
  const onlineEnrolled = summaryData.value.reduce((s, r) => s + Number(r.online_enrolled || 0), 0)
  const onsiteEnrolled = summaryData.value.reduce((s, r) => s + Number(r.onsite_enrolled || 0), 0)
  const totalEnrolled = onlineEnrolled + onsiteEnrolled

  return [
    {
      label: 'มอบตัวแล้ว (รวมออนไลน์+ออนไซต์)',
      value: totalEnrolled,
      desc: `ออนไลน์ ${onlineEnrolled} | ออนไซต์ ${onsiteEnrolled}`,
      color: '#3b82f6', bgColor: '#dbeafe', icon: CheckBadgeIcon,
    },
    {
      label: 'รอชำระเงิน / ดำเนินการมอบตัว',
      value: pendingCount,
      desc: 'ยังไม่ได้มอบตัว',
      color: '#f59e0b', bgColor: '#fef3c7', icon: ClockIcon,
    },

  ]
})

const courseStats = computed(() => {
  const byCourse = statsData.value?.by_course || []
  const result = byCourse.map((c: any) => {
    const isPvc = c.cur_group === 'ปวช.'
    const onsiteForGroup = summaryData.value
      .filter(r => isPvc ? r.cur_shortname === 'ปวช.' : r.cur_shortname !== 'ปวช.')
      .reduce((s: number, r: any) => s + Number(r.onsite_enrolled || 0), 0)
    const enrolled = Number(c.enrolled || 0) + onsiteForGroup
    const quota = Number(c.quota || 0)
    // applicant = สมัครแล้วแต่ยังไม่มอบตัว
    const applicant = Number(c.applicants || 0) - Number(c.enrolled || 0)
    return { name: c.cur_group, quota, applicant, enrolled }
  })
  return result.sort((a: any, b: any) => a.name === 'ปวช.' ? -1 : 1)
})

const pvcStats = computed(() => {
  const byDiv = statsData.value?.by_division || []
  return byDiv
    .filter((d: any) => d.cur_shortname === 'ปวช.')
    .map((d: any) => {
      // หา onsite จาก summaryData ด้วย ap_id (ตรงกว่า div_id)
      const summaryRow = summaryData.value
        .find((r: any) => Number(r.ap_id) === Number(d.ap_id))
      const onsiteCount = Number(summaryRow?.onsite_enrolled || 0)
      const enrolled = Number(d.enrolled || 0) + onsiteCount
      return {
        name: d.div_name,
        quota: Number(d.quota || 0),
        applicant: Number(d.applicants || 0) - Number(d.enrolled || 0),
        enrolled,
        remaining: Number(d.quota || 0) - enrolled,
      }
    })
})

const pvsStats = computed(() => {
  const byDiv = statsData.value?.by_division || []
  const pvsDiv = byDiv.filter((d: any) => d.cur_shortname !== 'ปวช.')
  return pvsDiv.map((d: any) => {
    const summaryRow = summaryData.value
      .find((r: any) => Number(r.ap_id) === Number(d.ap_id))
    const onsiteCount = Number(summaryRow?.onsite_enrolled || 0)
    const enrolled = Number(d.enrolled || 0) + onsiteCount
    return {
      name: d.div_name,
      curLabel: d.cur_shortname,
      quota: Number(d.quota || 0),
      applicant: Number(d.applicants || 0) - Number(d.enrolled || 0),
      enrolled,
      remaining: Number(d.quota || 0) - enrolled,
    }
  }).sort((a: any, b: any) => {
    if (a.name !== b.name) return a.name.localeCompare(b.name, 'th')
    const order: Record<string, number> = {
      'ปวส. (ม.6/ต่างสาขา)': 1,
      'ปวส. (สายตรง)': 2,
      'ปวส. ทวิภาคี': 3,
    }
    return (order[a.curLabel] || 99) - (order[b.curLabel] || 99)
  })
})

// ===== Load Data =====

async function loadStats() {
  isLoading.value = true
  try {
    const [statsRes, summaryRes] = await Promise.all([
      apiService.getStats(),
      apiService.getEnrollmentSummary(),
    ])
    statsData.value = statsRes.data
    summaryData.value = summaryRes.data
  } catch (err) {
    console.error('โหลดสถิติไม่สำเร็จ', err)
  } finally {
    isLoading.value = false
  }
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function onScroll() {
  showScrollTop.value = window.scrollY > 300
}

onMounted(() => {
  window.addEventListener('scroll', onScroll)
  loadStats()
})
onUnmounted(() => window.removeEventListener('scroll', onScroll))
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>