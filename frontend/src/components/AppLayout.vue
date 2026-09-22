<template>
  <div class="flex h-screen bg-gray-50">
    <!-- Mobile overlay -->
    <div v-if="sidebarOpen" class="fixed inset-0 bg-black/40 z-30 lg:hidden" @click="sidebarOpen = false" />

    <!-- Sidebar -->
    <aside
      class="fixed lg:static inset-y-0 left-0 z-40 w-64 h-screen flex-shrink-0 flex flex-col overflow-hidden transition-transform duration-300"
      :class="sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'"
      style="background: linear-gradient(to bottom, rgba(20, 184, 166, 0.9), rgba(101, 163, 13, 0.9))">
      <!-- Logo -->
      <div class="p-6 border-b border-white/20">
        <RouterLink to="/" class="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-white/20 rounded flex items-center justify-center">
              <AcademicCapIcon class="w-7 h-7 text-white" />
            </div>
            <div>
              <p class="text-white font-semibold text-sm">วิทยาลัยเทคนิคเลย</p>
              <p class="text-white/70 text-xs">LoeiTech <br /> Online Admission System</p>
            </div>
          </div>
        </RouterLink>
      </div>

      <!-- Menu -->
      <nav class="flex-1 p-4 space-y-1">
        <p class="text-white/50 text-xs font-medium px-3 py-2">เมนูหลัก</p>

        <RouterLink to="/register"
          class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
          :class="$route.path === '/register' ? 'bg-white/20 text-white' : 'text-white hover:bg-white/10'">
          <DocumentTextIcon class="w-5 h-5" /> กรอกใบสมัคร
        </RouterLink>

        <RouterLink to="/check-status"
          class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
          :class="$route.path === '/check-status' ? 'bg-white/20 text-white' : 'text-white hover:bg-white/10'">
          <MagnifyingGlassIcon class="w-5 h-5" /> ตรวจสอบสถานะ
        </RouterLink>

        <RouterLink to="/enrollment"
          class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
          :class="$route.path === '/enrollment' ? 'bg-white/20 text-white' : 'text-white hover:bg-white/10'">
          <ClipboardDocumentCheckIcon class="w-5 h-5" /> มอบตัว
        </RouterLink>

        <RouterLink to="/guide"
          class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
          :class="$route.path === '/guide' ? 'bg-white/20 text-white' : 'text-white hover:bg-white/10'">
          <BookOpenIcon class="w-5 h-5" /> คู่มือการสมัครเรียนและมอบตัว
        </RouterLink>

        <!-- เมนูเจ้าหน้าที่ - แสดงเฉพาะเมื่อ login แล้ว -->
        <div v-if="authStore.isAuthenticated">
          <p class="text-white/50 text-xs font-medium px-3 py-2 mt-4">เจ้าหน้าที่</p>

          <RouterLink to="/admin/dashboard"
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
            :class="$route.path.startsWith('/admin/dashboard') ? 'bg-white/20 text-white' : 'text-white hover:bg-white/10'">
            <HomeIcon class="w-5 h-5" /> Dashboard
          </RouterLink>

          <RouterLink to="/admin/users"
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
            :class="$route.path.startsWith('/admin/users') ? 'bg-white/20 text-white' : 'text-white hover:bg-white/10'">
            <UserGroupIcon class="w-5 h-5" /> ข้อมูลผู้สมัคร
          </RouterLink>


          <RouterLink to="/admin/manage-users"
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
            :class="$route.path.startsWith('/admin/manage-users') ? 'bg-white/20 text-white' : 'text-white hover:bg-white/10'">
            <ComputerDesktopIcon class="w-5 h-5" /> ผู้ใช้งานระบบ
          </RouterLink>

          <RouterLink to="/admin/settings"
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
            :class="$route.path.startsWith('/admin/settings') ? 'bg-white/20 text-white' : 'text-white hover:bg-white/10'">
            <Cog6ToothIcon class="w-5 h-5" /> แผนการรับสมัครนักศึกษา
          </RouterLink>

          <RouterLink to="/admin/expenses"
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
            :class="$route.path.startsWith('/admin/expenses') ? 'bg-white/20 text-white' : 'text-white hover:bg-white/10'">
            <ReceiptPercentIcon class="w-5 h-5" /> ค่าใช้จ่าย
          </RouterLink>

          <RouterLink to="/admin/onsite-enrollment"
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
            :class="$route.path === '/admin/onsite-enrollment' ? 'bg-white/20 text-white' : 'text-white hover:bg-white/10'">
            <ClipboardDocumentListIcon class="w-5 h-5" /> บันทึกยอดมอบตัวออนไซต์
          </RouterLink>
        </div>


      </nav>

      <!-- Footer -->
      <div class="p-4 border-t border-white/20">
        <!-- ปุ่ม Login/Logout -->
        <div class="text-center text-white/80 text-xs mb-2">
          สำหรับเจ้าหน้าที่
        </div>
        <button v-if="!authStore.isAuthenticated" @click="handleLogin"
          class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white hover:bg-white/10 transition-all w-full">
          <ArrowRightOnRectangleIcon class="w-5 h-5" />
          เข้าสู่ระบบ
        </button>
        <button v-else @click="handleLogout"
          class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white hover:bg-white/10 transition-all w-full">
          <ArrowRightOnRectangleIcon class="w-5 h-5" />
          ออกจากระบบ
        </button>
        <p class="text-white/40 text-xs text-center mt-3">© 2026 วิทยาลัยเทคนิคเลย</p>
        <p class="text-white/30 text-xs text-center mt-1">272 ถ.เจริญรัฐ ต.กุดป่อง อ.เมือง จ.เลย 42000</p>
        <p class="text-white/30 text-xs text-center">โทร 042811591</p>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col overflow-hidden min-w-0">
      <!-- Header -->
      <header class="bg-white border-b border-gray-200 px-4 md:px-8 py-3 flex items-center gap-3 shadow-2xl">
        <!-- Hamburger (mobile only) -->
        <button class="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors flex-shrink-0"
          @click="sidebarOpen = true">
          <Bars3Icon class="w-6 h-6" />
        </button>
        <div class="w-12 h-12 md:w-20 md:h-20 rounded-xl flex items-center justify-center flex-shrink-0">
          <img src="@/assets/loeitech-logo.png" alt="LoeiTech Logo" class="w-12 h-12 md:w-20 md:h-20" />
        </div>
        <div class="min-w-0">
          <h1 class="text-sm md:text-xl font-semibold text-gray-800 truncate">ระบบรับสมัครนักเรียนนักศึกษา</h1>
          <p class="text-sm md:text-xl text-emerald-500 truncate">วิทยาลัยเทคนิคเลย</p>
        </div>
      </header>

      <!-- Page Content -->
      <main class="flex-1 overflow-y-auto" :class="$route.path !== '/login' ? 'p-4 md:p-8' : ''">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter, useRoute } from 'vue-router'
import {
  AcademicCapIcon,
  DocumentTextIcon,
  HomeIcon,
  UserGroupIcon,
  Cog6ToothIcon,
  MagnifyingGlassIcon,
  ClipboardDocumentCheckIcon,
  ReceiptPercentIcon,
  ArrowRightOnRectangleIcon,
  ClipboardDocumentListIcon,
  BookOpenIcon,
  Bars3Icon,
  ComputerDesktopIcon, 
} from '@heroicons/vue/24/outline'

const sidebarOpen = ref(false)
const route = useRoute()
watch(() => route.path, () => { sidebarOpen.value = false })

const authStore = useAuthStore()
const router = useRouter()

// Computed property for checking authentication status
const isAdmin = computed(() => authStore.isAuthenticated)

// Login function
const handleLogin = () => {
  // สามารถเพิ่ม logic สำหรับเปิด modal หรือ redirect ไปหน้า login
  router.push('/login')
}

// Logout function
const handleLogout = () => {
  authStore.logout()
  router.push('/')
}
</script>