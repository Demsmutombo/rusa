/**
 * API TypeBus — Rusa Travel
 * Pas de DELETE : désactivation via PUT (inversion statut — pas d’URL toggle-statut dans l’OpenAPI fourni).
 */

import { useAuthStore } from '@/stores/auth'
import { scopeEntitiesToUserSociete } from '@/utils/societeIsolation'
import { API_ENDPOINTS } from './Endpoint.service'
import { apiGet, apiPost, apiPut } from './apiService'


export function unwrapTypeBusList(data) {
  if (data == null) return []
  if (Array.isArray(data)) return data
  const arr = data.data ?? data.items ?? data.results ?? data.value ?? []
  return Array.isArray(arr) ? arr : []
}

export async function listTypeBusArray() {
  const auth = useAuthStore()
  const raw = await apiGet(API_ENDPOINTS.TYPE_BUS.BASE)
  let list = unwrapTypeBusList(raw)
  list = scopeEntitiesToUserSociete(list, { role: auth.role, societeId: auth.societeId })
  return list
}

/**
 * @param {{ libelle: string, idSociete: number, statut?: boolean }} body
 */
export function createTypeBus(body) {
  return apiPost(API_ENDPOINTS.TYPE_BUS.BASE, body)
}

/**
 * @param {number|string} id
 * @param {{ idTypeBus: number, libelle: string, idSociete: number, statut: boolean }} body
 */
export function updateTypeBus(id, body) {
  const nid = Number(id)
  if (!Number.isFinite(nid) || nid <= 0) {
    return Promise.reject(new Error('Identifiant type de bus invalide.'))
  }
  return apiPut(API_ENDPOINTS.TYPE_BUS.byId(nid), body)
}

/**
 * @param {Record<string, unknown>} row — ligne liste (idTypeBus, libelle, idSociete, statut)
 */
export async function toggleTypeBusStatut(row) {
  const id = Number(row?.idTypeBus ?? row?.IdTypeBus)
  if (!Number.isFinite(id) || id <= 0) {
    throw new Error('Identifiant type de bus invalide.')
  }
  const current = row.statut !== false && row.statut !== 0
  return updateTypeBus(id, {
    idTypeBus: id,
    libelle: String(row.libelle ?? row.Libelle ?? '').trim(),
    idSociete: Number(row.idSociete ?? row.IdSociete),
    statut: !current,
  })
}
