import { apiGet } from './apiService'
import { API_ENDPOINTS } from './Endpoint.service'

/**
 * Catalogue des rôles (GET /api/Role) — Bearer requis côté API.
 * @param {string} accessToken
 * @returns {Promise<Array<{ idRole: number, nom: string, description?: string, niveau?: number, statut?: boolean }>>}
 */
export async function fetchRoleList(accessToken) {
  const data = await apiGet(API_ENDPOINTS.ROLE.BASE, {}, { authToken: accessToken })
  return Array.isArray(data) ? data : []
}
