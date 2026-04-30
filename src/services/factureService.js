/**
 * API Facture — Rusa Travel (lecture liste ; création / MAJ selon droits JWT).
 */

import { apiGet } from './apiService'
import { API_ENDPOINTS } from './Endpoint.service'

/** @param {unknown} data */
export function unwrapFactureList(data) {
  if (data == null) return []
  if (Array.isArray(data)) return data
  const arr = data.data ?? data.Data ?? data.items ?? data.Items ?? data.results ?? data.value ?? []
  return Array.isArray(arr) ? arr : []
}

/** @returns {Promise<unknown[]>} */
export function fetchFactureList() {
  return apiGet(API_ENDPOINTS.FACTURE.BASE).then(unwrapFactureList)
}
