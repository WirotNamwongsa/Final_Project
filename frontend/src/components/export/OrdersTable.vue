<template>
  <div class="bg-white rounded-2xl border border-gray-100 overflow-hidden">
    <table class="w-full text-sm">
      <thead class="bg-gray-50 text-gray-500">
        <tr>
          <th class="px-4 py-3 text-center w-10">
            <input type="checkbox" @change="$emit('toggle-all')" :checked="isAllSelected" />
          </th>

          <th class="px-4 py-3 text-left">ชื่อ-สกุล</th>
          <th class="px-4 py-3 text-left">หลักสูตร</th>
          <th class="px-4 py-3 text-left">สาขา</th>
          <th class="px-4 py-3 text-center">วันที่ชำระ</th>
          <th class="px-4 py-3 text-center">ใบรายการสั่งจอง</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-50">
        <tr v-for="row in data" :key="row.ลำดับ"
          :class="['hover:bg-gray-50', selectedIds.includes(row.ลำดับ) ? 'bg-green-50/50' : '']">
          <td class="px-4 py-3 text-center">
            <input type="checkbox" :value="row.ลำดับ" :checked="selectedIds.includes(row.ลำดับ)"
              @change="toggleRow(row.ลำดับ)" />
          </td>
          <td class="px-4 py-3 text-gray-800">{{ row.คำนำหน้า }}{{ row.ชื่อ_นามสกุล }}</td>
          <td class="px-4 py-3 text-gray-500">{{ row.หลักสูตร }}</td>
          <td class="px-4 py-3">
            <span
              class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">
              {{ row.สาขาวิชา }}
            </span>
          </td>
          <td class="px-4 py-3 text-center text-sm text-gray-600">
            {{ row.วันที่ชำระ || '-' }}
          </td>
          <td class="px-4 py-3 text-center">
            <div class="flex items-center justify-center gap-1.5 flex-wrap">
              <button @click="$emit('view-documents', row)"
                class="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg text-xs font-semibold transition">
                <FileText class="w-3.5 h-3.5" /> หลักฐาน
              </button>
              <button v-if="row._slipUrl" @click="openSlipModal(row)"
                class="inline-flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-xs font-semibold transition">
                <Eye class="w-3.5 h-3.5" /> สลิป
              </button>
              <button @click="generatePDF(row)"
                class="inline-flex items-center gap-1 px-2.5 py-1.5 bg-green-50 hover:bg-green-100 text-green-600 rounded-lg text-xs font-semibold transition">
                <Download class="w-3.5 h-3.5" /> ออเดอร์
              </button>
            </div>
          </td>
        </tr>
        <tr v-if="data.length === 0">
          <td colspan="6" class="px-4 py-8 text-center text-gray-400">ไม่พบข้อมูล</td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- Slip Modal -->
  <Teleport to="body">
    <div v-if="slipModal.open" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      @click.self="slipModal.open = false">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden flex flex-col"
        style="max-height: 90vh">
        <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
          <div>
            <p class="font-bold text-gray-800 text-base">สลิปการชำระเงิน</p>
            <p class="text-xs text-gray-400 mt-0.5">{{ slipModal.name }}</p>
          </div>
          <button @click="slipModal.open = false" class="p-2 hover:bg-gray-100 rounded-lg transition">
            <X class="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div class="flex-1 flex items-center justify-center p-4 bg-gray-50 overflow-auto">
          <img :src="slipModal.slipUrl" class="max-w-full rounded-xl object-contain shadow-md"
            style="max-height: 65vh" />
        </div>
        <div class="flex justify-end gap-2 px-5 py-3 border-t border-gray-100 bg-gray-50 flex-shrink-0">
          <button @click="slipModal.open = false"
            class="px-4 py-2 text-sm text-gray-500 hover:bg-gray-200 rounded-xl font-semibold transition">
            ปิด
          </button>
          <button @click="() => window.open(slipModal.slipUrl, '_blank')"
            class="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-semibold transition">
            <ExternalLink class="w-4 h-4" /> เปิดในแท็บใหม่
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Download, Eye, X, ExternalLink, FileText } from 'lucide-vue-next'

const props = defineProps<{
  data: any[]
  selectedIds: string[]
  isAllSelected: boolean
}>()

const emit = defineEmits<{
  'update:selected-ids': [ids: string[]]
  'toggle-all': []
  'generate-pdf': [row: any]
  'view-documents': [row: any]
}>()

const toggleRow = (id: string) => {
  const current = [...props.selectedIds]
  const idx = current.indexOf(id)
  if (idx === -1) current.push(id)
  else current.splice(idx, 1)
  emit('update:selected-ids', current)
}

// ─── Slip Modal ───────────────────────────────────────────────
const slipModal = ref({ open: false, name: '', slipUrl: '' })

const openSlipModal = (row: any) => {
  slipModal.value = {
    open: true,
    name: `${row.คำนำหน้า}${row.ชื่อ_นามสกุล}`,
    slipUrl: row._slipUrl,
  }
}

const generatePDF = (row: any) => {
  emit('generate-pdf', row)
}


</script>