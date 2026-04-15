import { apiGet } from './apiService'

export function fetchSuperAdminDashboard() {
  return apiGet('/api/SuperAdminDashboard')
}
