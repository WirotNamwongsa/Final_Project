<template>
    <div class="max-w-5xl mx-auto space-y-6">

        <!-- Header -->
        <div class="bg-white rounded-2xl shadow-sm p-6 flex items-center justify-between ">
            <div>
                <h1 class="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <ClipboardDocumentListIcon class="w-5 h-5 text-emerald-500" />
                    บันทึกยอดมอบตัวออนไซต์
                </h1>
                <p class="text-sm text-gray-400 mt-1">กรอกจำนวนนักเรียน นักศึกษามอบตัวที่วิทยาลัย</p>
            </div>
            <button @click="loadData" :disabled="isLoading"
                class="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-all">
                <ArrowPathIcon class="w-4 h-4" :class="isLoading ? 'animate-spin' : ''" />
                รีเฟรช
            </button>
        </div>

        <!-- Filter -->
        <div class="bg-white rounded-2xl shadow-sm p-4 flex items-center gap-4">
            <select v-model="filterCurId" class="input-field !w-48">
                <option value="">ทุกหลักสูตร</option>
                <option v-for="c in curriculums" :key="c.cur_id" :value="String(c.cur_id)">
                    {{ c.cur_shortname }}
                </option>
            </select>
            <select v-model="filterYear" class="input-field !w-36">
                <option value="">ทุกปีการศึกษา</option>
                <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
            </select>
            <span class="text-sm text-gray-400">พบ {{ filteredSummary.length }} สาขา</span>
        </div>

        <!-- Summary Cards -->
        <div class="grid grid-cols-3 gap-4">
            <div class="bg-white rounded-2xl shadow-sm p-5 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <p class="text-xs text-gray-400 mb-1">มอบตัวออนไลน์รวม</p>
                <p class="text-2xl font-bold text-emerald-600">{{ totalOnline }}</p>
            </div>
            <div class="bg-white rounded-2xl shadow-sm p-5 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <p class="text-xs text-gray-400 mb-1">มอบตัวออนไซต์รวม</p>
                <p class="text-2xl font-bold text-blue-600">{{ totalOnsite }}</p>
            </div>
            <div class="bg-white rounded-2xl shadow-sm p-5 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <p class="text-xs text-gray-400 mb-1">มอบตัวรวมทั้งหมด</p>
                <p class="text-2xl font-bold text-gray-800">{{ totalOnline + totalOnsite }}</p>
            </div>
        </div>

        <!-- Table -->
        <div class="bg-white rounded-2xl shadow-sm overflow-hidden">
            <table class="w-full">
                <thead>
                    <tr class="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                        <th class="px-6 py-3 text-left">หลักสูตร / สาขาวิชา</th>
                        <th class="px-6 py-3 text-center">จำนวนที่เปิดรับ</th>
                        <th class="px-6 py-3 text-center">มอบตัวออนไลน์</th>
                        <th class="px-6 py-3 text-center">มอบตัวออนไซต์</th>
                        <th class="px-6 py-3 text-center">รวม</th>
                        <th class="px-6 py-3 text-center">คงเหลือ</th>
                        <th class="px-6 py-3 text-center">บันทึก</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                    <tr v-if="isLoading">
                        <td colspan="7" class="text-center py-12 text-gray-400 text-sm">กำลังโหลด...</td>
                    </tr>
                    <tr v-else-if="filteredSummary.length === 0">
                        <td colspan="7" class="text-center py-12 text-gray-400 text-sm">ไม่พบข้อมูล</td>
                    </tr>
                    <tr v-for="row in filteredSummary" :key="row.ap_id" class="hover:bg-gray-50 transition-all">
                        <!-- หลักสูตร/สาขา -->
                        <td class="px-6 py-4">
                            <p class="text-xs px-2 py-0.5 rounded-full  mr-2"
                                :class="row.cur_shortname === 'ปวช.' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'">
                                {{ row.cur_shortname }}
                            </p>
                            <span class="text-sm text-gray-800">{{ row.div_name }}</span>
                        </td>
                        <!-- แผนรับ -->
                        <td class="px-6 py-4 text-center text-sm font-medium text-gray-700">
                            {{ row.plan_num }}
                        </td>
                        <!-- ออนไลน์ -->
                        <td class="px-6 py-4 text-center">
                            <span class="text-sm text-emerald-600">{{ row.online_enrolled }}</span>
                        </td>
                        <!-- ออนไซต์ — กรอกได้เลย -->
                        <td class="px-6 py-4 text-center">
                            <input v-model.number="onsiteInputs[row.ap_id].count" type="number" min="0"
                                class="w-20 text-center border border-gray-200 rounded-lg px-2 py-1 text-sm focus:border-emerald-400 focus:ring-1 focus:ring-emerald-100 outline-none" />
                        </td>
                        <!-- รวม -->
                        <td class="px-6 py-4 text-center">
                            <span class="text-sm font-bold text-gray-800">
                                {{ Number(row.online_enrolled) + Number(onsiteInputs[row.ap_id]?.count || 0) }}
                            </span>
                        </td>
                        <!-- คงเหลือ -->
                        <td class="px-6 py-4 text-center">
                            <span class="text-sm font-bold px-2 py-0.5 rounded-full" :class="remainingColor(row)">
                                {{ row.plan_num - Number(row.online_enrolled) - Number(onsiteInputs[row.ap_id]?.count ||
                                    0) }}
                            </span>
                        </td>
                        <!-- ปุ่มบันทึก -->
                        <td class="px-6 py-4 text-center">
                            <button @click="saveOnsite(row)" :disabled="savingId === row.ap_id"
                                class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-500 text-white hover:bg-emerald-600 transition-all disabled:opacity-50">
                                <CheckIcon v-if="savedIds.has(row.ap_id)" class="w-3.5 h-3.5" />
                                <ArrowUpTrayIcon v-else class="w-3.5 h-3.5" />
                                {{ savingId === row.ap_id ? 'กำลังบันทึก...' : savedIds.has(row.ap_id) ? 'บันทึกแล้ว' :
                                    'บันทึก' }}
                            </button>
                            <p v-if="onsiteInputs[row.ap_id]?.note_text !== undefined" class="mt-1">
                                <input v-model="onsiteInputs[row.ap_id].note_text" placeholder="หมายเหตุ (ถ้ามี)"
                                    class="w-full text-xs border border-gray-200 rounded px-2 py-1 outline-none focus:border-emerald-300" />
                            </p>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        

        <!-- Toast -->
        <Transition name="fade">
            <div v-if="toast.show"
                class="fixed bottom-6 right-6 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium z-50"
                :class="toast.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'">
                {{ toast.message }}
            </div>
        </Transition>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { apiService } from '../utils/api'
import {
    ClipboardDocumentListIcon, ArrowPathIcon,
    CheckIcon, ArrowUpTrayIcon
} from '@heroicons/vue/24/outline'

const isLoading = ref(false)
const savingId = ref<number | null>(null)
const savedIds = ref<Set<number>>(new Set())
const summary = ref<any[]>([])
const curriculums = ref<any[]>([])
const filterCurId = ref('')
const filterYear = ref('')
const toast = ref({ show: false, type: 'success', message: '' })

// input state สำหรับแต่ละ ap_id
const onsiteInputs = reactive<Record<number, { count: number; note_text?: string }>>({})

const years = computed(() => [...new Set(summary.value.map(r => r.ap_years))].sort().reverse())

const filteredSummary = computed(() => {
  return summary.value.filter(r => {
    if (filterCurId.value && Number(r.cur_id) !== Number(filterCurId.value)) return false
    if (filterYear.value && r.ap_years !== filterYear.value) return false
    return true
  })
})

const totalOnline = computed(() =>
    filteredSummary.value.reduce((sum, r) => sum + Number(r.online_enrolled), 0)
)
const totalOnsite = computed(() =>
    filteredSummary.value.reduce((sum, r) => sum + Number(onsiteInputs[r.ap_id]?.count || 0), 0)
)

function remainingColor(row: any) {
    const rem = row.plan_num - Number(row.online_enrolled) - Number(onsiteInputs[row.ap_id]?.count || 0)
    if (rem <= 0) return 'bg-red-100 text-red-600'
    if (rem <= 5) return 'bg-orange-100 text-orange-600'
    return 'bg-emerald-100 text-emerald-600'
}

async function loadData() {
    isLoading.value = true
    try {
        const [summaryRes, curRes] = await Promise.all([
            apiService.getEnrollmentSummary(),
            apiService.getCurriculums(),
        ])


        summary.value = summaryRes.data
        curriculums.value = curRes.data

        // init inputs
        summary.value.forEach(r => {
            if (!onsiteInputs[r.ap_id]) {
                onsiteInputs[r.ap_id] = {
                    count: Number(r.onsite_enrolled) || 0,
                    note_text: undefined,
                }
            }
        })
    } catch (err) {
        showToast('error', 'โหลดข้อมูลไม่สำเร็จ')
    } finally {
        isLoading.value = false
    }
}

async function saveOnsite(row: any) {
    savingId.value = row.ap_id
    try {
        await apiService.upsertOnsiteEnrollment({
            ap_id: row.ap_id,
            count: onsiteInputs[row.ap_id]?.count || 0,
            note: onsiteInputs[row.ap_id]?.note_text || '',
            recorded_by: 'staff',
        })
        savedIds.value.add(row.ap_id)
        setTimeout(() => savedIds.value.delete(row.ap_id), 3000)
        showToast('success', `บันทึก ${row.div_name} เรียบร้อยแล้ว`)
        await loadData()
    } catch (err) {
        showToast('error', 'บันทึกไม่สำเร็จ กรุณาลองใหม่')
    } finally {
        savingId.value = null
    }
}

function showToast(type: 'success' | 'error', message: string) {
    toast.value = { show: true, type, message }
    setTimeout(() => { toast.value.show = false }, 3000)
}

onMounted(loadData)
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>