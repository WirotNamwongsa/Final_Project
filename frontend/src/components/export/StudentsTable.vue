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
          <th class="px-4 py-3 text-left">สาขาวิชา</th>
          <th class="px-4 py-3 text-left">วันที่มอบตัว</th>
          <th class="px-4 py-3 text-center">เอกสาร</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-50">
        <tr
          v-for="row in data"
          :key="row.ลำดับ"
          class="cursor-pointer hover:bg-gray-50 transition"
          :class="selectedIds.includes(row.ลำดับ) ? 'bg-green-50/50' : ''"
          @click="$emit('view-detail', row)">
          <td class="px-4 py-3 text-center" @click.stop>
            <input
              type="checkbox"
              :value="row.ลำดับ"
              :checked="selectedIds.includes(row.ลำดับ)"
              @change="toggleRow(row.ลำดับ)" />
          </td>
          <td class="px-4 py-3 text-gray-800 font-medium">{{ row.คำนำหน้า }}{{ row.ชื่อ_นามสกุล }}</td>
          <td class="px-4 py-3 text-gray-500">{{ row.หลักสูตร }}</td>
          <td class="px-4 py-3">
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">
              {{ row.สาขาวิชา }}
            </span>
          </td>
          <td class="px-4 py-3 text-gray-600 text-sm">
            {{ row.enrolled_at ? new Date(row.enrolled_at).toLocaleDateString('th-TH') : '-' }}
          </td>
          <td class="px-4 py-3 text-center" @click.stop>
            <div class="flex items-center justify-center gap-1.5">
              <button
                @click="$emit('view-documents', row)"
                class="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg text-xs font-semibold transition">
                <FileText class="w-3.5 h-3.5" /> หลักฐาน
              </button>
              <button
                @click="$emit('generate-pdf', row)"
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
</template>

<script setup lang="ts">
import { watch, ref } from 'vue'
import { FileText, Download } from 'lucide-vue-next'

const props = defineProps<{
  data: any[]
  selectedIds: string[]
  isAllSelected: boolean
}>()

const emit = defineEmits<{
  'update:selected-ids': [ids: string[]]
  'toggle-all': []
  'update:date-search': [val: string]
  'generate-pdf': [row: any]
  'view-documents': [row: any]
  'view-detail': [row: any]
}>()

const dateSearch = ref('')
watch(dateSearch, (val) => emit('update:date-search', val))

const toggleRow = (id: string) => {
  const current = [...props.selectedIds]
  const idx = current.indexOf(id)
  if (idx === -1) current.push(id)
  else current.splice(idx, 1)
  emit('update:selected-ids', current)
}
</script>
