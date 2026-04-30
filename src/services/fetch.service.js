import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import { resolveApiUrl } from '@/config/apiOrigin'
import { DEFAULT_HTTP_ERROR_MESSAGES } from '@/constants/httpErrors'

const ENABLE_SOCIETE_HEADER =
  String(import.meta.env.VITE_ENABLE_SOCIETE_HEADER ?? '1').trim() !== '0'

function toAbsoluteUrl(path) {
  if (/^https?:\/\//i.test(path)) return path
  return resolveApiUrl(path)
}

function extractErrorMessage(data, status) {
  if (data?.message) return String(data.message)
  if (data?.Message) return String(data.Message)
  if (data?.detail) return String(data.detail)
  if (data?.Detail) return String(data.Detail)
  if (data?.title) return String(data.title)
  if (typeof data === 'string' && data.trim()) return data.trim()
  return DEFAULT_HTTP_ERROR_MESSAGES[status] || `Erreur ${status || 0}`
}

const axiosInstance = axios.create({
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json, text/plain;q=0.9, */*;q=0.8',
  },
})

export function useFetchService() {
  /**
   * @param {'get'|'post'|'put'|'patch'|'delete'} method
   * @param {string} url
   * @param {any} [data]
   * @param {import('axios').AxiosRequestConfig & { skipSocieteHeader?: boolean, authToken?: string }} [config]
   */
  async function request(method, url, data, config = {}) {
    const authStore = useAuthStore()
    const headers = {}
    const token = config.authToken || authStore.token || localStorage.getItem('accessToken')
    if (token) headers.Authorization = `Bearer ${token}`

    if (ENABLE_SOCIETE_HEADER && !config.skipSocieteHeader) {
      const sid = authStore.apiSocieteId
      if (sid != null && Number(sid) > 0) {
        headers['X-Societe-Id'] = String(sid)
      }
    }

    try {
      const response = await axiosInstance.request({
        ...config,
        method,
        url: toAbsoluteUrl(url),
        data,
        headers,
      })
      return response.data
    } catch (error) {
      const status = error?.response?.status || 0
      const payload = error?.response?.data ?? null
      const formatted = {
        status,
        message: extractErrorMessage(payload, status),
        data: payload,
        originalError: error,
      }

      if (status === 401) {
        try {
          authStore.logout({ notifyRemote: false })
        } catch {
          localStorage.removeItem('accessToken')
        }
        if (window.location.pathname !== '/signin') {
          window.location.href = '/signin'
        }
      }
      throw formatted
    }
  }

  function get(url, config = {}) {
    return request('get', url, undefined, config)
  }

  function post(url, data = {}, config = {}) {
    return request('post', url, data, config)
  }

  function put(url, data = {}, config = {}) {
    return request('put', url, data, config)
  }

  function patch(url, data = {}, config = {}) {
    return request('patch', url, data, config)
  }

  function del(url, config = {}) {
    return request('delete', url, undefined, config)
  }

  function getInstance() {
    return axiosInstance
  }

  return {
    request,
    get,
    post,
    put,
    patch,
    delete: del,
    getInstance,
  }
}

const fetchService = useFetchService()

export default fetchService
