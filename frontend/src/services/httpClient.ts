import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:13001/api',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const wasAuthenticated = localStorage.getItem('isAuthenticated') === 'true'
      localStorage.removeItem('isAuthenticated')
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_role')
      // redirect ไป login เฉพาะเมื่อเคย login อยู่แล้ว (session หมดอายุ)
      // ถ้าไม่เคย login จะไม่ redirect เพื่อให้หน้าสาธารณะใช้ได้ปกติ
      if (wasAuthenticated) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api