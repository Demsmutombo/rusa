import { apiGet } from './apiService'

export function fetchGerantDashboard() {
  return apiGet('/api/GerantDashboard')
}
