/**
 * API Destination — Rusa Travel (admin / super-admin)
 * Pas de DELETE : désactivation via PUT …/toggle-statut
 */

import { useAuthStore } from '@/stores/auth'
import { scopeEntitiesToUserSociete } from '@/utils/societeIsolation'
import { API_ENDPOINTS, API_USE_GUIDE_ROUTES } from './Endpoint.service'
import { apiGet, apiPost, apiPut } from './apiService'


export function unwrapDestinationList(data) {
  if (data == null) return []
  if (Array.isArray(data)) return data
  if (Array.isArray(data.data)) return data.data
  const nested = data.data && typeof data.data === 'object' ? data.data : null
  if (nested && Array.isArray(nested.data)) return nested.data
  const arr = data.items ?? data.results ?? data.value ?? []
  return Array.isArray(arr) ? arr : []
}

export async function listDestinationsArray() {
  const auth = useAuthStore()
  const sid =
    auth.role === 'superadmin'
      ? Number(auth.effectiveSocieteId)
      : Number(auth.societeId)
  const path = API_USE_GUIDE_ROUTES
    ? API_ENDPOINTS.DESTINATION.LIST
    : Number.isFinite(sid) && sid > 0
      ? API_ENDPOINTS.DESTINATION.bySociete(sid)
      : API_ENDPOINTS.DESTINATION.BASE
  const raw = await apiGet(path)
  let list = unwrapDestinationList(raw)
  if (auth.role !== 'superadmin') {
    list = scopeEntitiesToUserSociete(list, { role: auth.role, societeId: auth.societeId })
  }
  return list
}

/**
 * @param {{ villeDepart: string, villeArrivee: string, montant: number, idSociete: number }} body
 */
export function createDestination(body) {
  return apiPost(API_ENDPOINTS.DESTINATION.CREATE, body)
}

/**
 * @param {number|string} id
 * @param {{ villeDepart: string, villeArrivee: string, montant: number, statut: boolean }} body
 */
export function updateDestination(id, body) {
  const nid = Number(id)
  if (!Number.isFinite(nid) || nid <= 0) {
    return Promise.reject(new Error('Identifiant destination invalide.'))
  }
  return apiPut(API_ENDPOINTS.DESTINATION.byId(nid), body)
}

export function toggleDestinationStatut(id) {
  const nid = Number(id)
  if (!Number.isFinite(nid) || nid <= 0) {
    return Promise.reject(new Error('Identifiant destination invalide.'))
  }
  return apiPut(API_ENDPOINTS.DESTINATION.toggleStatut(nid), {})
}
