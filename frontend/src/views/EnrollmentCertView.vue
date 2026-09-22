<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <!-- Loading -->
    <div v-if="isLoading" class="text-center">
      <div class="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
      <p class="text-gray-500 text-sm">กำลังโหลดเอกสาร...</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="text-center">
      <p class="text-red-500 text-sm">{{ error }}</p>
    </div>

    <!-- แสดงใบรับรอง -->
    <div v-else-if="data" class="bg-white rounded-2xl shadow-xl w-full max-w-lg p-8 text-center space-y-6">
      
      <!-- โลโก้ -->
      <img src="@/assets/loeitech-logo.png" class="w-20 h-20 mx-auto" />

      <div>
        <h1 class="text-2xl font-bold text-gray-800">ใบรับรองการมอบตัว</h1>
        <p class="text-gray-500 text-sm mt-1">วิทยาลัยเทคนิคเลย</p>
      </div>

      <div class="w-full h-px bg-emerald-200"></div>

      <div class="text-left space-y-3">
        <p class="text-sm text-gray-500">ขอรับรองว่า</p>
        <p class="text-xl font-bold text-gray-800">{{ data.prefix }}{{ data.full_name }}</p>
        <p class="text-sm text-gray-500">หมายเลขประจำตัว: {{ data.id_card_number }}</p>
        <p class="text-sm text-gray-600 mt-2">ได้ดำเนินการมอบตัวเป็นนักเรียนนักศึกษาเรียบร้อยแล้ว</p>
        
        <div class="bg-emerald-50 rounded-xl p-4 space-y-1">
          <p class="text-sm font-semibold text-emerald-700">หลักสูตร: {{ data.cur_name }}</p>
          <p class="text-sm font-semibold text-emerald-700">สาขาวิชา: {{ data.div_name }}</p>
          <p class="text-sm text-emerald-600">
            วันที่มอบตัว: {{ data.enrolled_at 
              ? new Date(data.enrolled_at).toLocaleDateString('th-TH') 
              : new Date(data.updated_at).toLocaleDateString('th-TH') }}
          </p>
        </div>

        <div class="bg-green-500 rounded-xl p-3 text-center">
          <p class="text-white font-semibold text-sm">สถานะ: มอบตัวเสร็จสมบูรณ์ ✓</p>
        </div>
      </div>

      <!-- ปุ่ม Download -->
      <button @click="downloadPDF"
        :disabled="downloading"
        class="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold text-sm hover:opacity-90 transition disabled:opacity-50">
        {{ downloading ? 'กำลังสร้าง PDF...' : '⬇️ ดาวน์โหลดใบรับรอง PDF' }}
      </button>

      <p class="text-xs text-gray-400">
        เอกสารนี้ไม่ใช่สัญญาการมอบตัว โปรดนำพร้อมวุฒิการศึกษาเดิมในวันปฐมนิเทศ
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/services/httpClient'
import jsPDF from 'jspdf'

const route = useRoute()
const isLoading = ref(true)
const error = ref('')
const data = ref<any>(null)
const downloading = ref(false)

onMounted(async () => {
  const idCard = route.params.idCard as string
  if (!idCard) { error.value = 'ไม่พบหมายเลขประจำตัว'; isLoading.value = false; return }

  try {
    const res = await api.get(`/applications/check/${idCard}`)
    const d = res.data?.data
    if (!d || d.status !== 'enrolled') {
      error.value = 'ไม่พบข้อมูลการมอบตัว หรือยังไม่ได้มอบตัว'
    } else {
      data.value = d
    }
  } catch {
    error.value = 'โหลดข้อมูลไม่สำเร็จ'
  } finally {
    isLoading.value = false
  }
})

async function loadFont(): Promise<string> {
  const res = await fetch('/fonts/THSarabunNew.ttf')
  const buffer = await res.arrayBuffer()
  const bytes = new Uint8Array(buffer)
  let binary = ''
  bytes.forEach(b => binary += String.fromCharCode(b))
  return btoa(binary)
}

async function downloadPDF() {
  if (!data.value) return
  downloading.value = true

  try {
    const d = data.value
    const fontBase64 = await loadFont()
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

    doc.addFileToVFS('THSarabunNew.ttf', fontBase64)
    doc.addFont('THSarabunNew.ttf', 'THSarabun', 'normal')
    doc.addFont('THSarabunNew.ttf', 'THSarabun', 'bold')

    const pageW = 210
    const margin = 15
    let y = 2

    try {
      const logoRes = await fetch('/src/assets/loeitech-logo.png')
      const logoBuffer = await logoRes.arrayBuffer()
      const logoBase64 = btoa(String.fromCharCode(...new Uint8Array(logoBuffer)))
      doc.addImage(logoBase64, 'PNG', pageW / 2 - 20, y, 40, 40)
      y += 45
    } catch { y += 5 }

    doc.setFontSize(22); doc.setFont('THSarabun', 'bold')
    doc.text('ใบรับรองการมอบตัว', pageW / 2, y, { align: 'center' }); y += 8

    doc.setFontSize(14); doc.setFont('THSarabun', 'normal')
    doc.text('วิทยาลัยเทคนิคเลย', pageW / 2, y, { align: 'center' }); y += 6
    doc.setFontSize(11)
    doc.text('272 ถ.เจริญรัฐ ต.กุดป่อง อ.เมือง จ.เลย 42000  โทร 042811591', pageW / 2, y, { align: 'center' }); y += 6

    doc.setDrawColor(16, 185, 130); doc.setLineWidth(0.8)
    doc.line(15, y, pageW - 15, y); y += 12

    doc.setFontSize(13); doc.setFont('THSarabun', 'bold')
    doc.text('ขอรับรองว่า', pageW / 2, y, { align: 'center' }); y += 10

    doc.setFontSize(18)
    doc.text(`${d.prefix}${d.full_name}`, pageW / 2, y, { align: 'center' }); y += 8

    doc.setFontSize(12); doc.setFont('THSarabun', 'normal')
    doc.text(`หมายเลขประจำตัว: ${d.id_card_number}`, pageW / 2, y, { align: 'center' }); y += 12

    doc.setFontSize(13)
    doc.text('ได้ดำเนินการมอบตัวเป็นนักเรียนนักศึกษาเรียบร้อยแล้ว', pageW / 2, y, { align: 'center' }); y += 8

    doc.setFont('THSarabun', 'bold')
    doc.text(`หลักสูตร: ${d.cur_name}`, pageW / 2, y, { align: 'center' }); y += 7
    doc.text(`สาขาวิชา: ${d.div_name}`, pageW / 2, y, { align: 'center' }); y += 12

    doc.setFont('THSarabun', 'normal'); doc.setFontSize(12)
    const enrolledAt = d.enrolled_at
      ? new Date(d.enrolled_at).toLocaleDateString('th-TH')
      : new Date(d.updated_at).toLocaleDateString('th-TH')
    doc.text(`วันที่มอบตัว: ${enrolledAt}`, pageW / 2, y, { align: 'center' }); y += 10

    doc.setFillColor(240, 253, 244); doc.setDrawColor(16, 185, 130); doc.setLineWidth(0.5)
    doc.roundedRect(15, y, pageW - 30, 14, 3, 3, 'FD')
    doc.setFontSize(13); doc.setFont('THSarabun', 'bold'); doc.setTextColor(5, 150, 105)
    doc.text('สถานะ: มอบตัวเสร็จสมบูรณ์ ✓', pageW / 2, y + 9, { align: 'center' })
    doc.setTextColor(0, 0, 0); y += 19

    doc.setFillColor(255, 251, 235); doc.setDrawColor(251, 191, 36); doc.setLineWidth(0.4)
    doc.roundedRect(margin, y, pageW - margin * 2, 24, 3, 3, 'FD')
    doc.setFontSize(13); doc.setFont('THSarabun', 'bold'); doc.setTextColor(146, 64, 14)
    doc.text('หมายเหตุ', margin + 4, y + 7)
    doc.setFont('THSarabun', 'normal'); doc.setFontSize(12)
    doc.text('1. เอกสารนี้ไม่ใช่สัญญาการมอบตัวเป็น นักเรียน นักศึกษา', margin + 4, y + 14)
    doc.text('2. โปรดนำเอกสารนี้ พร้อมวุฒิการศึกษาเดิมติดต่อที่งานทะเบียน วิทยาลัยเทคนิคเลยในวันปฐมนิเทศ', margin + 4, y + 21)
    doc.setTextColor(0, 0, 0); y += 30

    doc.setFontSize(10); doc.setFont('THSarabun', 'normal'); doc.setTextColor(150, 150, 150)
    doc.text(`พิมพ์เมื่อ: ${new Date().toLocaleString('th-TH')}`, pageW / 2, y, { align: 'center' })

    doc.save(`ใบรับรองการมอบตัว-${d.id_card_number}.pdf`)
  } finally {
    downloading.value = false
  }
}
</script>