import axios from 'axios'
import { getApiOrigin } from '@/config/apiOrigin'
import { useAuthStore } from '@/stores/auth'

const API_BASE_URL = import.meta.env.VITE_API_URL || getApiOrigin()

class ApiClient {
  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.setupInterceptors()
  }

  setupInterceptors() {
    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const accessToken = localStorage.getItem('accessToken')
        if (accessToken) {
          config.headers.Authorization = `Bearer ${accessToken}`
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Response interceptor to handle errors
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          try {
            const authStore = useAuthStore()
            authStore.logout({ notifyRemote: false })
          } catch {
            localStorage.removeItem('accessToken')
          }
          window.location.href = '/signin'
        }
        return Promise.reject(error)
      }
    )
  }

  get(url, config) {
    return this.client.get(url, config)
  }

  post(url, data, config) {
    return this.client.post(url, data, config)
  }

  put(url, data, config) {
    return this.client.put(url, data, config)
  }

  delete(url, config) {
    return this.client.delete(url, config)
  }
}

export const apiClient = new ApiClient()
