/**
 * API PlainteClient — Rusa Travel.
 */

import { apiGet, apiPost, apiPut } from './apiService'
import { API_ENDPOINTS } from './Endpoint.service'

/** @param {unknown} data */
export function unwrapPlainteClientList(data) {
  if (data == null) return []
  if (Array.isArray(data)) return data
  const arr = data.data ?? data.Data ?? data.items ?? data.Items ?? data.results ?? data.value ?? []
  return Array.isArray(arr) ? arr : []
}

/** @returns {Promise<unknown[]>} */
export function fetchPlainteClientList() {
  return apiGet(API_ENDPOINTS.PLAINTE_CLIENT.BASE).then(unwrapPlainteClientList)
}

/** @param {number|string} id */
export function getPlainteClient(id) {
  return apiGet(API_ENDPOINTS.PLAINTE_CLIENT.byId(id))
}

/** @param {Record<string, unknown>} body */
export function createPlainteClient(body) {
  return apiPost(API_ENDPOINTS.PLAINTE_CLIENT.BASE, body)
}

/** @param {number|string} id @param {Record<string, unknown>} body */
export function updatePlainteClient(id, body) {
  return apiPut(API_ENDPOINTS.PLAINTE_CLIENT.byId(id), body)
}

/**
 * Désactivation logique (pas DELETE): PUT /api/PlainteClient/{id} avec `statut:false`.
 * @param {number|string} id
 * @param {Record<string, unknown> | null} [rawHint]
 */
export async function deactivatePlainteClient(id, rawHint = null) {
  const nid = Number(id)
  if (!Number.isFinite(nid) || nid <= 0) {
    throw new Error('Identifiant plainte invalide.')
  }
  let current = rawHint && typeof rawHint === 'object' ? { ...rawHint } : {}
  try {
    const fetched = await getPlainteClient(nid)
    const detail =
      fetched && typeof fetched === 'object'
        ? fetched.data && typeof fetched.data === 'object'
          ? fetched.data
          : fetched
        : null
    if (detail && typeof detail === 'object') current = { ...current, ...detail }
  } catch {
    /* fallback rawHint */
  }
  return updatePlainteClient(nid, { ...current, idPlainte: nid, statut: false })
}
