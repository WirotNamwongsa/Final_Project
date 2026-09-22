// frontend/src/services/api.ts
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:13001/api'

export const api = {
  // Auth endpoints
  login: async (username: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Login failed')
    }
    
    return response.json()
  },

  // Users endpoints
  getUsers: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/users`)
    if (!response.ok) {
      throw new Error('Failed to fetch users')
    }
    return response.json()
  },

  // Generic GET request
  get: async (endpoint: string) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`)
    if (!response.ok) {
      throw new Error(`Failed to fetch ${endpoint}`)
    }
    return response.json()
  },

  // Generic POST request
  post: async (endpoint: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      throw new Error(`Failed to post to ${endpoint}`)
    }
    
    return response.json()
  },

  // Generic PUT request
  put: async (endpoint: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      throw new Error(`Failed to put to ${endpoint}`)
    }
    
    return response.json()
  },

  // Generic DELETE request
  delete: async (endpoint: string) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
    })
    
    if (!response.ok) {
      throw new Error(`Failed to delete ${endpoint}`)
    }
    
    return response.json()
  }
}

