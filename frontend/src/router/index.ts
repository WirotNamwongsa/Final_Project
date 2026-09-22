import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.exp * 1000 < Date.now()
  } catch {
    return true
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', component: () => import('../views/HomeView.vue') },
    { path: '/register', component: () => import('../views/RegisterView.vue') },
    { path: '/check-status', component: () => import('../views/CheckStatusView.vue') },
    { path: '/enrollment', component: () => import('../views/StatusView.vue') },
    { path: '/enrollment/:idCard', component: () => import('../views/SuccessView.vue') },
    { path: '/login', component: () => import('../views/LoginView.vue') },
    { path: '/guide', component: () => import('../views/GuideView.vue') },
    { path: '/enrollment-cert/:idCard', component: () => import('@/views/EnrollmentCertView.vue')},


    { path: '/admin/dashboard', component: () => import('@/views/AdminDashboard.vue'), meta: { requiresAuth: true } },
    { path: '/admin/users', component: () => import('../views/AdminUsersView.vue'), meta: { requiresAuth: true } },
    { path: '/admin/manage-users', component: () => import('../views/AdminManageUsersView.vue'), meta: { requiresAuth: true } },
    { path: '/admin/settings', component: () => import('../views/AdminSettingsView.vue'), meta: { requiresAuth: true } },
    { path: '/admin/expenses', component: () => import('../views/AdminExpensesView.vue'), meta: { requiresAuth: true } },
    { path: '/admin/onsite-enrollment', component: () => import('../views/OnsiteEnrollmentView.vue'), meta: { requiresAuth: true } },
  ],
})

router.beforeEach((to, _from, next) => {
  if (!to.meta.requiresAuth) return next()

  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true'
  const token = localStorage.getItem('auth_token')

  if (!isAuthenticated || !token || isTokenExpired(token)) {
    useAuthStore().logout()
    return next({ path: '/login', query: { redirect: to.fullPath } })
  }

  next()
})

export default router
