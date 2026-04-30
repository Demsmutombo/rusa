/**
 * API CategorieClient — Rusa Travel.
 */

import { apiGet } from './apiService'
import { API_ENDPOINTS } from './Endpoint.service'

/** @param {unknown} data */
export function unwrapCategorieClientList(data) {
  if (data == null) return []
  if (Array.isArray(data)) return data
  const arr = data.data ?? data.Data ?? data.items ?? data.Items ?? data.results ?? data.value ?? []
  return Array.isArray(arr) ? arr : []
}

/** @returns {Promise<unknown[]>} */
export function fetchCategorieClientList() {
  return apiGet(API_ENDPOINTS.CATEGORIE_CLIENT.BASE).then(unwrapCategorieClientList)
}
