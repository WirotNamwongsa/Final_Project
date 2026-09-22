<template>
  <div class="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
    <!-- Header Section -->
    <div class="bg-white shadow-lg  border-emerald-100">
      <div class="max-w-7xl mx-auto px-6 py-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-4xl font-bold text-gray-900 flex items-center">
              <div class="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                <UserGroupIcon class="w-6 h-6 text-white" />
              </div>
              จัดการสมาชิก
            </h1>
            <p class="text-gray-600 mt-3 text-lg">จัดการข้อมูลเจ้าหน้าที่ในระบบ</p>
          </div>
          <div class="flex items-center space-x-3">
            <div class="flex items-center bg-emerald-50 px-4 py-2 rounded-lg">
              <div class="w-3 h-3 bg-emerald-500 rounded-full mr-2 animate-pulse"></div>
              <span class="text-emerald-700 font-medium">ระบบพร้อมใช้งาน</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-6 py-8">
      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div class="flex items-center">
            <div class="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
              <UserGroupIcon class="w-6 h-6 text-emerald-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm text-gray-600">สมาชิกทั้งหมด</p>
              <p class="text-2xl font-bold text-gray-900">{{ users?.length ?? 0 }}</p>
            </div>
          </div>
        </div>
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div class="flex items-center">
            <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <ShieldCheckIcon class="w-6 h-6 text-purple-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm text-gray-600">Admin</p>
              <p class="text-2xl font-bold text-gray-900">{{ users?.filter(u => u.role === 'admin').length ?? 0 }}</p>
            </div>
          </div>
        </div>
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div class="flex items-center">
            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <UserIcon class="w-6 h-6 text-blue-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm text-gray-600">Staff</p>
              <p class="text-2xl font-bold text-gray-900">{{ users?.filter(u => u.role === 'staff').length ?? 0 }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Danger Zone — superadmin only -->
      <div v-if="authStore.isSuperAdmin" class="bg-white rounded-xl shadow-sm border border-red-200 mb-6">
        <div class="border-b border-red-100 px-6 py-4 flex items-center gap-3">
          <div class="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
            <ExclamationTriangleIcon class="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h2 class="text-sm font-semibold text-red-700">Danger Zone</h2>
            <p class="text-xs text-red-400">การดำเนินการนี้ไม่สามารถย้อนกลับได้</p>
          </div>
        </div>
        <div class="px-6 py-5 flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-800">ล้างข้อมูลผู้สมัครทั้งหมด</p>
            <p class="text-xs text-gray-500 mt-0.5">ลบข้อมูลผู้สมัคร เอกสาร การชำระเงิน และไฟล์อัปโหลดทั้งหมดออกจากระบบ</p>
          </div>
          <button
            @click="showTruncateModal = true"
            class="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
          >
            <TrashIcon class="w-4 h-4" />
            ล้างข้อมูล
          </button>
        </div>
      </div>

      <!-- Actions Bar + Table -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
        <!-- Actions Bar -->
        <div class="border-b border-gray-200 px-6 py-4">
          <div class="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div class="flex flex-col sm:flex-row gap-3 flex-1">
              <div class="relative flex-1 lg:max-w-md">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon class="h-5 w-5 text-gray-400" />
                </div>
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="ค้นหาชื่อผู้ใช้..."
                  class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 bg-gray-50 hover:bg-white text-sm"
                />
              </div>
              <select
                v-model="selectedRole"
                class="px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 bg-gray-50 hover:bg-white cursor-pointer text-sm"
              >
                <option value="">ทุกบทบาท</option>
                <option value="admin">Admin</option>
                <option value="staff">Staff</option>
              </select>
            </div>
            <button
              @click="showAddModal = true"
              class="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md text-sm font-medium"
            >
              <PlusIcon class="h-4 w-4" />
              เพิ่มสมาชิก
            </button>
          </div>
        </div>

        <!-- Users Table -->
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-100">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  <div class="flex items-center gap-2"><UserIcon class="w-4 h-4" />ชื่อผู้ใช้</div>
                </th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  <div class="flex items-center gap-2"><ShieldCheckIcon class="w-4 h-4" />บทบาท</div>
                </th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  <div class="flex items-center gap-2"><CalendarIcon class="w-4 h-4" />วันที่สร้าง</div>
                </th>
                <th class="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  <div class="flex items-center justify-end gap-2"><CogIcon class="w-4 h-4" />จัดการ</div>
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-50">
              <tr v-if="filteredUsers.length === 0">
                <td colspan="4" class="px-6 py-16 text-center">
                  <div class="flex flex-col items-center gap-4">
                    <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                      <UserGroupIcon class="w-8 h-8 text-gray-400" />
                    </div>
                    <div>
                      <p class="text-gray-500 font-medium mb-1">ไม่พบข้อมูลสมาชิก</p>
                      <p class="text-gray-400 text-sm">ลองปรับเงื่อนไขการค้นหาหรือเพิ่มสมาชิกใหม่</p>
                    </div>
                    <button
                      @click="showAddModal = true"
                      class="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors flex items-center gap-2 text-sm"
                    >
                      <PlusIcon class="h-4 w-4" />เพิ่มสมาชิกใหม่
                    </button>
                  </div>
                </td>
              </tr>
              <tr
                v-for="user in filteredUsers"
                :key="user.id"
                class="hover:bg-emerald-50 transition-colors duration-150"
              >
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center gap-3">
                    <div class="w-9 h-9 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                      {{ user.username.charAt(0).toUpperCase() }}
                    </div>
                    <div>
                      <div class="text-sm font-semibold text-gray-900">{{ user.username }}</div>
                      <div class="text-xs text-gray-400 font-mono">{{ user.id.slice(0, 8) }}...</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    :class="[
                      'inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full',
                      user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                    ]"
                  >
                    <ShieldCheckIcon v-if="user.role === 'admin'" class="w-3 h-3 mr-1" />
                    <UserIcon v-else class="w-3 h-3 mr-1" />
                    {{ user.role === 'admin' ? 'Admin' : 'Staff' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center gap-2 text-sm text-gray-600">
                    <CalendarIcon class="w-4 h-4 text-gray-400" />
                    <span>{{ formatDate(user.created_at) }}</span>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right">
                  <div class="flex items-center justify-end gap-2">
                    <button
                      @click="editUser(user)"
                      class="px-3 py-1.5 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-200 transition-colors flex items-center gap-1 text-xs font-medium"
                    >
                    <PencilIcon class="w-4 h-4" />
                    </button>
                    <button
                      @click="deleteUser(user)"
                      class="px-3 py-1.5 bg-red-100 text-red-500 rounded-lg hover:bg-red-200 transition-colors flex items-center gap-1 text-xs font-medium"
                    >
                       <TrashIcon class="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <div v-if="showAddModal || showEditModal" class="fixed inset-0 bg-gray-500/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
        <div class="border-b border-gray-200 px-6 py-4">
          <h3 class="text-lg font-semibold text-gray-900">
            {{ showAddModal ? 'เพิ่มสมาชิกใหม่' : 'แก้ไขข้อมูลสมาชิก' }}
          </h3>
        </div>
        <form @submit.prevent="saveUser" class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">ชื่อผู้ใช้</label>
            <input
              v-model="userForm.username"
              type="text"
              required
              placeholder="กรอกชื่อผู้ใช้"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">รหัสผ่าน</label>
            <input
              v-model="userForm.password"
              type="password"
              :required="showAddModal"
              :placeholder="showEditModal ? 'ปล่อยว่างหากไม่ต้องการเปลี่ยน' : 'กรอกรหัสผ่าน'"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">บทบาท</label>
            <select
              v-model="userForm.role"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
            >
              <option value="">เลือกบทบาท</option>
              <option value="admin">Admin</option>
              <option value="staff">Staff</option>
            </select>
          </div>
          <div class="flex gap-3 pt-2">
            <button type="submit" class="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium">
              บันทึก
            </button>
            <button type="button" @click="closeModal" class="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium">
              ยกเลิก
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Truncate Confirmation Modal -->
    <div v-if="showTruncateModal" class="fixed inset-0 bg-gray-900/60 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
        <div class="p-6">
          <div class="flex items-start gap-4 mb-5">
            <div class="w-11 h-11 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
              <ExclamationTriangleIcon class="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p class="text-gray-900 font-semibold">ล้างข้อมูลผู้สมัครทั้งหมด?</p>
              <p class="text-sm text-gray-500 mt-1">ข้อมูลผู้สมัคร เอกสาร การชำระเงิน และไฟล์อัปโหลดทั้งหมดจะถูกลบถาวร ไม่สามารถกู้คืนได้</p>
            </div>
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">
              พิมพ์ <span class="font-bold text-red-600">ยืนยัน</span> เพื่อดำเนินการต่อ
            </label>
            <input
              v-model="truncateConfirmText"
              type="text"
              placeholder="ยืนยัน"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
            />
          </div>
          <div class="flex gap-3">
            <button
              @click="doTruncate"
              :disabled="truncateConfirmText !== 'ยืนยัน' || isTruncating"
              class="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {{ isTruncating ? 'กำลังล้างข้อมูล...' : 'ล้างข้อมูล' }}
            </button>
            <button @click="closeTruncateModal" :disabled="isTruncating" class="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium">
              ยกเลิก
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-gray-500/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
        <div class="p-6">
          <div class="flex items-start gap-4 mb-6">
            <div class="w-11 h-11 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
              <TrashIcon class="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p class="text-gray-900 font-medium">
                ลบสมาชิก <span class="text-red-600 font-bold">"{{ selectedUser?.username }}"</span> ใช่หรือไม่?
              </p>
              <p class="text-sm text-gray-500 mt-1">ข้อมูลทั้งหมดของสมาชิกนี้จะถูกลบออกจากระบบถาวร</p>
            </div>
          </div>
          <div class="flex gap-3">
            <button @click="confirmDelete" class="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium">
              ลบข้อมูล
            </button>
            <button @click="showDeleteModal = false" class="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium">
              ยกเลิก
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  MagnifyingGlassIcon,
  PlusIcon,
  UserGroupIcon,
  UserIcon,
  ShieldCheckIcon,
  CalendarIcon,
  CogIcon,
  PencilIcon,
  TrashIcon,
  ExclamationTriangleIcon
} from '@heroicons/vue/24/outline'
import { apiService } from '@/utils/api'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/httpClient'

const authStore = useAuthStore()

interface User {
  id: string
  username: string
  role: 'admin' | 'staff'
  created_at: string
}

// State
const users = ref<User[]>([])
const searchQuery = ref('')
const selectedRole = ref('')
const showAddModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const selectedUser = ref<User | null>(null)
const isLoading = ref(false)

// Form
const userForm = ref({
  username: '',
  password: '',
  role: '' as 'admin' | 'staff' | ''
})

// Computed
const filteredUsers = computed(() => {
  let filtered = users.value ?? []

  if (searchQuery.value) {
    filtered = filtered.filter(user =>
      user.username.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  if (selectedRole.value) {
    filtered = filtered.filter(user => user.role === selectedRole.value)
  }

  return filtered
})

// Methods
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const loadUsers = async () => {
  isLoading.value = true
  try {
    const res = await apiService.getUsers()
    users.value = res.data ?? []
  } catch (error) {
    console.error('Error loading users:', error)
    users.value = []
  } finally {
    isLoading.value = false
  }
}

const editUser = (user: User) => {
  selectedUser.value = user
  userForm.value = {
    username: user.username,
    password: '',
    role: user.role
  }
  showEditModal.value = true
}

const deleteUser = (user: User) => {
  selectedUser.value = user
  showDeleteModal.value = true
}

const confirmDelete = async () => {
  if (!selectedUser.value) return
  try {
    await apiService.deleteUser(selectedUser.value.id)
    users.value = users.value.filter(u => u.id !== selectedUser.value!.id)
    showDeleteModal.value = false
    selectedUser.value = null
  } catch (error) {
    console.error('Error deleting user:', error)
  }
}

const saveUser = async () => {
  try {
    if (showAddModal.value) {
      const res = await apiService.createUser({
        username: userForm.value.username,
        password: userForm.value.password,
        role: userForm.value.role as 'admin' | 'staff'
      })
      users.value.push(res.data)
    } else if (showEditModal.value && selectedUser.value) {
      const payload: Partial<{ username: string; password: string; role: string }> = {
        username: userForm.value.username,
        role: userForm.value.role
      }
      if (userForm.value.password) {
        payload.password = userForm.value.password
      }
      const res = await apiService.updateUser(selectedUser.value.id, payload)
      const index = users.value.findIndex(u => u.id === selectedUser.value!.id)
      if (index !== -1) users.value[index] = res.data
    }
    closeModal()
  } catch (error) {
    console.error('Error saving user:', error)
  }
}

const closeModal = () => {
  showAddModal.value = false
  showEditModal.value = false
  selectedUser.value = null
  userForm.value = { username: '', password: '', role: '' }
}

const showTruncateModal = ref(false)
const truncateConfirmText = ref('')
const isTruncating = ref(false)

const closeTruncateModal = () => {
  showTruncateModal.value = false
  truncateConfirmText.value = ''
}

const doTruncate = async () => {
  if (truncateConfirmText.value !== 'ยืนยัน') return
  isTruncating.value = true
  try {
    const token = localStorage.getItem('auth_token')
    await api.delete('/admin/truncate-applicants', {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
    closeTruncateModal()
  } catch (error) {
    console.error('truncate error:', error)
    alert('เกิดข้อผิดพลาดในการล้างข้อมูล')
  } finally {
    isTruncating.value = false
  }
}

onMounted(() => {
  loadUsers()
})
</script>