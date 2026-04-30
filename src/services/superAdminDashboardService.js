import { apiGet } from './apiService'
import { API_ENDPOINTS } from './Endpoint.service'

export function fetchSuperAdminDashboard() {
  return apiGet(API_ENDPOINTS.DASHBOARD.SUPER_ADMIN)
}
