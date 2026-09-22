import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', () => {
  const isAuthenticated = ref(false)
  const user = ref<any>(null)
  const token = ref<string | null>(null)
  const role = ref<string | null>(null)

  const isSuperAdmin = computed(() => role.value === 'superadmin')

  const login = (userData: any) => {
    isAuthenticated.value = true
    user.value = userData
    token.value = userData.token || null
    role.value = userData.role || null
    localStorage.setItem('isAuthenticated', 'true')
    if (userData.token) localStorage.setItem('auth_token', userData.token)
    if (userData.role) localStorage.setItem('auth_role', userData.role)
  }

  const logout = () => {
    isAuthenticated.value = false
    user.value = null
    token.value = null
    role.value = null
    localStorage.removeItem('isAuthenticated')
    localStorage.removeItem('user')
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_role')
  }

  const checkAuth = () => {
    const auth = localStorage.getItem('isAuthenticated')
    isAuthenticated.value = auth === 'true'
    token.value = localStorage.getItem('auth_token')
    role.value = localStorage.getItem('auth_role')
  }

  checkAuth()

  return {
    isAuthenticated,
    user,
    token,
    role,
    isSuperAdmin,
    login,
    logout,
    checkAuth
  }
})
