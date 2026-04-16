/**
 * API TypeBus — Rusa Travel
 * Pas de DELETE : désactivation via PUT (inversion statut — pas d’URL toggle-statut dans l’OpenAPI fourni).
 */

import { useAuthStore } from '@/stores/auth'
import { scopeEntitiesToUserSociete } from '@/utils/societeIsolation'
import { apiGet, apiPost, apiPut } from './apiService'

const JSON_ACCEPT = {
  headers: {
    Accept: 'text/plain, application/json;q=0.9, */*;q=0.8',
  },
}

export function unwrapTypeBusList(data) {
  if (data == null) return []
  if (Array.isArray(data)) return data
  const arr = data.data ?? data.items ?? data.results ?? data.value ?? []
  return Array.isArray(arr) ? arr : []
}

export async function listTypeBusArray() {
  const auth = useAuthStore()
  const raw = await apiGet('/api/TypeBus', JSON_ACCEPT)
  let list = unwrapTypeBusList(raw)
  list = scopeEntitiesToUserSociete(list, { role: auth.role, societeId: auth.societeId })
  return list
}

/**
 * @param {{ libelle: string, idSociete: number, statut?: boolean }} body
 */
export function createTypeBus(body) {
  return apiPost('/api/TypeBus', body, JSON_ACCEPT)
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
  return apiPut(`/api/TypeBus/${nid}`, body, JSON_ACCEPT)
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
