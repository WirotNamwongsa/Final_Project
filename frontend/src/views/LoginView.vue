<template>
  <div class="min-h-screen bg-green-50 relative overflow-hidden">
    <!-- Background decoration -->
    <div class="absolute inset-0 overflow-hidden">
      <div class="absolute -top-40 -right-40 w-80 h-80 bg-green-100 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
      <div class="absolute -bottom-40 -left-40 w-80 h-80 bg-green-100 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-green-100 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
    </div>
    
    <!-- Content container -->
    <div class="relative min-h-screen flex flex-col justify-between p-0">
      <!-- Logo and title section -->
      <div class="text-center pt-8 pb-4">
        <div class="bg-white/90 rounded-full p-6 shadow-lg inline-block mb-6 transform transition-all duration-300 hover:scale-110 hover:rotate-12">
          <AcademicCapIcon class="h-16 w-16 text-green-600" />
        </div>
        <h1 class="text-4xl font-bold text-gray-800 mb-2">เข้าสู่ระบบเจ้าหน้าที่</h1>
        <p class="text-xl text-green-600 mb-4">วิทยาลัยเทคนิคเลย</p>
        <p class="text-gray-600 max-w-md mx-auto">เข้าสู่ระบบเพื่อใช้งานระบบ</p>
      </div>
      
      <!-- Login form -->
      <div class="flex-1 flex items-center justify-center w-full">
        <form class="space-y-6 w-full max-w-lg" @submit.prevent="handleLogin">
          <!-- Username field -->
          <div class="group">
            <label for="username" class="block text-sm font-semibold text-gray-700 mb-2 transition-colors group-focus-within:text-green-600">
              ชื่อผู้ใช้
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <UserIcon class="h-5 w-5 text-gray-400 group-focus-within:text-green-500 transition-colors" />
              </div>
              <input
                id="username"
                v-model="loginForm.username"
                name="username"
                type="text"
                required
                class="appearance-none block w-full pl-10 pr-3 py-3 border-2 border-gray-300 rounded-xl placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-white shadow-sm focus:shadow-md"
                placeholder="กรอกชื่อผู้ใช้"
              />
            </div>
          </div>

          <!-- Password field -->
          <div class="group">
            <label for="password" class="block text-sm font-semibold text-gray-700 mb-2 transition-colors group-focus-within:text-green-600">
              รหัสผ่าน
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LockClosedIcon class="h-5 w-5 text-gray-400 group-focus-within:text-green-500 transition-colors" />
              </div>
              <input
                id="password"
                v-model="loginForm.password"
                name="password"
                type="password"
                required
                class="appearance-none block w-full pl-10 pr-3 py-3 border-2 border-gray-300 rounded-xl placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-white shadow-sm focus:shadow-md"
                placeholder="กรอกรหัสผ่าน"
              />
            </div>
          </div>

          <!-- Error message -->
          <div v-if="errorMessage" class="bg-red-50 border-2 border-red-300 text-red-700 px-4 py-3 rounded-xl text-sm animate-shake">
            <div class="flex items-center">
              <ExclamationTriangleIcon class="h-5 w-5 text-red-500 mr-2" />
              {{ errorMessage }}
            </div>
          </div>

          <!-- Submit button -->
          <div>
            <button
              type="submit"
              :disabled="isLoading"
              class="group relative w-full flex justify-center items-center py-4 px-4 border-2 border-transparent text-sm font-semibold rounded-xl text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg"
            >
              <LockClosedIcon v-if="!isLoading" class="h-5 w-5 mr-2 group-hover:rotate-12 transition-transform duration-300" />
              <div v-else class="h-5 w-5 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              {{ isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ' }}
            </button>
          </div>

          <!-- Back link -->
          <div class="text-center pt-4 pb-8">
            <router-link 
              to="/" 
              class="inline-flex items-center text-green-600 hover:text-green-700 text-sm font-medium transition-all duration-200 hover:translate-x-1"
            >
              <ArrowLeftIcon class="h-4 w-4 mr-1" />
              กลับหน้าแรก
            </router-link>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { api } from '@/services/api'
import { 
  AcademicCapIcon, 
  LockClosedIcon, 
  UserIcon, 
  ExclamationTriangleIcon, 
  ArrowLeftIcon 
} from '@heroicons/vue/24/outline'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const loginForm = ref({
  username: '',
  password: ''
})

const isLoading = ref(false)
const errorMessage = ref('')

const handleLogin = async () => {
  isLoading.value = true
  errorMessage.value = ''

  try {
    // เรียก API login จริง
    const response = await api.login(loginForm.value.username, loginForm.value.password)
    
    if (response.success) {
      const userData = response.data
      authStore.login(userData)
      const redirect = (route.query.redirect as string) || '/admin/users'
      router.push(redirect)
    } else {
      errorMessage.value = response.message || 'เข้าสู่ระบบล้มเหลว'
    }
  } catch (error: any) {
    errorMessage.value = error.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
  20%, 40%, 60%, 80% { transform: translateX(2px); }
}

.animate-shake {
  animation: shake 0.5s ease-in-out;
}

/* Custom animations for better UX */
.group:focus-within label {
  color: rgb(34, 197, 94);
}
</style>
