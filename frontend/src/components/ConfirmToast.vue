<template>
  <Teleport to="body">
    <Transition name="toast">
      <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/40" @click="emit('cancel')" />
        <!-- Modal -->
        <div class="relative bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full mx-4 z-10">
          <div class="flex flex-col items-center text-center gap-3">
            <div class="w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center">
              <ExclamationTriangleIcon class="w-7 h-7 text-orange-500" />
            </div>
            <h3 class="text-base font-semibold text-gray-800">ยืนยันการส่งใบสมัคร?</h3>
            <p class="text-sm text-gray-500 leading-relaxed">
              เมื่อยืนยันข้อมูลและมอบตัวแล้ว<br>
              <span class="text-red-500 font-medium">จะไม่สามารถแก้ไขข้อมูลได้</span>
            </p>
          </div>
          <div class="flex gap-3 mt-6">
            <button @click="emit('cancel')"
              class="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 text-gray-600 text-sm hover:bg-gray-50 transition-all">
              ยกเลิก
            </button>
            <button @click="emit('confirm')"
              class="flex-1 px-4 py-2.5 rounded-xl bg-emerald-500 text-white text-sm hover:bg-emerald-600 transition-all font-medium">
              ยืนยันและปริ้นท์
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ExclamationTriangleIcon } from '@heroicons/vue/24/outline'
defineProps<{ show: boolean }>()
const emit = defineEmits<{ confirm: []; cancel: [] }>()
</script>

<style scoped>
.toast-enter-active, .toast-leave-active { transition: opacity 0.2s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; }
</style>