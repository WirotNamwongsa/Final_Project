const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:13001/api'

interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

class ApiService {
    private getToken() {
    return localStorage.getItem('auth_token')
  }
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`
    const token = this.getToken()
    
    console.log(`API Request: ${endpoint}`, { token: token ? 'exists' : 'missing' })

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
      ...options,
    }

    

    try {
      const response = await fetch(url, config)

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('isAuthenticated')
          localStorage.removeItem('auth_token')
          localStorage.removeItem('auth_role')
          window.location.href = '/login'
        }
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }
 async getBlob(url: string): Promise<string> {
    const token = this.getToken()
    const response = await fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    if (!response.ok) throw new Error(`Failed to fetch image: ${response.status}`)
    return URL.createObjectURL(await response.blob())
  }

  // Generic HTTP methods
  async get<T>(endpoint: string, options: { params?: Record<string, any> } = {}): Promise<ApiResponse<T>> {
    const url = new URL(endpoint, API_BASE_URL)
    if (options.params) {
      Object.entries(options.params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value))
        }
      })
    }
    return this.request<T>(url.pathname + url.search)
  }

  async post<T>(endpoint: string, data?: any, options: RequestInit = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? (data instanceof FormData ? data : JSON.stringify(data)) : undefined,
      ...options,
    })
  }

  // ── Users API ──────────────────────────────────────────
  async getUsers() {
    return this.request<any[]>('/admin/users')
  }

  async createUser(data: {
    username: string
    password: string
    role: 'admin' | 'staff'
  }) {
    return this.request<any>('/admin/users', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateUser(id: string, data: Partial<{
    username: string
    password: string
    role: string
  }>) {
    return this.request<any>(`/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteUser(id: string) {
    return this.request<void>(`/admin/users/${id}`, {
      method: 'DELETE',
    })
  }

  // ── Admission Plan API ─────────────────────────────────
  async getAdmissionPlans() {
    return this.request<any[]>('/admin/admission-plan')
  }

  async createAdmissionPlan(data: {
    ap_years: string
    div_id: number
    cur_id: number
    plan_num: number
  }) {
    return this.request<any>('/admin/admission-plan', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateAdmissionPlan(id: number, data: {
    ap_years: string
    div_id: number
    cur_id: number
    plan_num: number
  }) {
    return this.request<any>(`/admin/admission-plan/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteAdmissionPlan(id: number) {
    return this.request<void>(`/admin/admission-plan/${id}`, {
      method: 'DELETE',
    })
  }

  // ── Expense Detail API ─────────────────────────────────
  async getExpenseDetails() {
    return this.request<any[]>('/admin/expense-detail')
  }

  async createExpenseDetail(data: {
    exp_name: string
    exp_detail: string
    exp_img?: string
    cur_id: number
    exp_cost: number
    payment_type?: string
  }) {
    return this.request<any>('/admin/expense-detail', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateExpenseDetail(id: number, data: {
    exp_name: string
    exp_detail: string
    exp_img?: string
    cur_id: number
    exp_cost: number
    payment_type?: string
  }) {
    return this.request<any>(`/admin/expense-detail/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteExpenseDetail(id: number) {
    return this.request<void>(`/admin/expense-detail/${id}`, {
      method: 'DELETE',
    })
  }

  // ── Curriculum API ─────────────────────────────────────
  async getCurriculums() {
    return this.request<any[]>('/admin/curriculums')
  }

  async createCurriculum(data: {
    cur_name: string
    cur_shortname: string
  }) {
    return this.request<any>('/admin/curriculums', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateCurriculum(id: number, data: {
    cur_name: string
    cur_shortname: string
  }) {
    return this.request<any>(`/admin/curriculums/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteCurriculum(id: number) {
    return this.request<void>(`/admin/curriculums/${id}`, {
      method: 'DELETE',
    })
  }

  async getCurriculumChildren(id: number) {
    return this.request<{
      divisions: { div_id: number; div_name: string }[]
      plans: { ap_id: number; ap_years: string; plan_num: number }[]
    }>(`/admin/curriculums/${id}/children`)
  }

  // ── Division API ───────────────────────────────────────
  async getDivisions() {
    return this.request<any[]>('/admin/divisions')
  }

  async createDivision(data: {
    div_name: string
    cur_id: number
  }) {
    return this.request<any>('/admin/divisions', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateDivision(id: number, data: {
    div_name: string
    cur_id: number
  }) {
    return this.request<any>(`/admin/divisions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteDivision(id: number) {
    return this.request<void>(`/admin/divisions/${id}`, {
      method: 'DELETE',
    })
  }

  async getDivisionChildren(id: number) {
    return this.request<{
      plans: { ap_id: number; ap_years: string; plan_num: number }[]
    }>(`/admin/divisions/${id}/children`)
  }

  // ── Enrollment (Onsite) API ────────────────────────────
  async getEnrollmentSummary() {
    return this.request<any[]>('/enrollments/summary')
  }

  async getOnsiteEnrollments() {
    return this.request<any[]>('/enrollments/onsite')
  }

  async upsertOnsiteEnrollment(data: {
    ap_id: number
    count: number
    note?: string
    recorded_by?: string
  }) {
    return this.request<any>('/enrollments/onsite', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }
  // ── Applicants API ─────────────────────────────────────
  async getApplicants() {
    return this.request<any[]>('/admin/applicants')
  }

  async getApplicantDocuments(appId: string) {
    return this.request<any>(`/admin/applicants/${appId}/documents`)
  }

  // เพิ่มใน ApiService class
  async getStats() {
    return this.request<any>('/applications/stats')
  }
}



export const apiService = new ApiService()