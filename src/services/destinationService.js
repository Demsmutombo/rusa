/**
 * API Destination — Rusa Travel (admin / super-admin)
 * Pas de DELETE : désactivation via PUT …/toggle-statut
 */

import { useAuthStore } from '@/stores/auth'
import { scopeEntitiesToUserSociete } from '@/utils/societeIsolation'
import { apiGet, apiPost, apiPut } from './apiService'

const JSON_ACCEPT = {
  headers: {
    Accept: 'text/plain, application/json;q=0.9, */*;q=0.8',
  },
}

export function unwrapDestinationList(data) {
  if (data == null) return []
  if (Array.isArray(data)) return data
  const arr = data.data ?? data.items ?? data.results ?? data.value ?? []
  return Array.isArray(arr) ? arr : []
}

export async function listDestinationsArray() {
  const auth = useAuthStore()
  const sid =
    auth.role === 'superadmin'
      ? Number(auth.effectiveSocieteId)
      : Number(auth.societeId)
  const path =
    Number.isFinite(sid) && sid > 0
      ? `/api/Destination/societe/${sid}`
      : '/api/Destination'
  const raw = await apiGet(path, JSON_ACCEPT)
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
  return apiPost('/api/Destination', body, JSON_ACCEPT)
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
  return apiPut(`/api/Destination/${nid}`, body, JSON_ACCEPT)
}

export function toggleDestinationStatut(id) {
  const nid = Number(id)
  if (!Number.isFinite(nid) || nid <= 0) {
    return Promise.reject(new Error('Identifiant destination invalide.'))
  }
  return apiPut(`/api/Destination/${nid}/toggle-statut`, {}, JSON_ACCEPT)
}
