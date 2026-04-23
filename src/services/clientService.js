/**
 * API Client — Rusa Travel (admin / super-admin)
 * Liste par société, détail, création, mise à jour, bascule statut.
 */

import { useAuthStore } from '@/stores/auth'
import { scopeEntitiesToUserSociete } from '@/utils/societeIsolation'
import { apiGet, apiPost, apiPut } from './apiService'

const JSON_ACCEPT = {
  headers: {
    Accept: 'text/plain, application/json;q=0.9, */*;q=0.8',
  },
}

export function unwrapClientList(data) {
  if (data == null) return []
  if (Array.isArray(data)) return data
  const arr = data.data ?? data.items ?? data.results ?? data.value ?? []
  return Array.isArray(arr) ? arr : []
}

/**
 * Réponse paginée `GET …/societe/{id}/paged`.
 * @param {unknown} data
 * @returns {{
 *   items: unknown[]
 *   totalCount: number
 *   pageNumber: number
 *   pageSize: number
 *   totalPages: number
 *   hasNextPage: boolean
 *   hasPreviousPage: boolean
 * }}
 */
export function unwrapClientPagedResponse(data) {
  if (data == null) {
    return {
      items: [],
      totalCount: 0,
      pageNumber: 1,
      pageSize: 20,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false,
    }
  }
  if (Array.isArray(data)) {
    return {
      items: data,
      totalCount: data.length,
      pageNumber: 1,
      pageSize: data.length || 20,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
    }
  }
  const d = /** @type {Record<string, unknown>} */ (data)
  const items = unwrapClientList(d.data ?? d.Data)
  const totalCount = Number(d.totalCount ?? d.TotalCount ?? items.length)
  const pageNumber = Number(d.pageNumber ?? d.PageNumber ?? 1)
  const pageSize = Number(d.pageSize ?? d.PageSize ?? 20)
  let totalPages = Number(d.totalPages ?? d.TotalPages ?? 0)
  const tc = Number.isFinite(totalCount) ? totalCount : items.length
  const ps = Number.isFinite(pageSize) && pageSize > 0 ? pageSize : 20
  if ((!Number.isFinite(totalPages) || totalPages <= 0) && tc > 0 && ps > 0) {
    totalPages = Math.max(1, Math.ceil(tc / ps))
  }
  if (!Number.isFinite(totalPages) || totalPages < 0) totalPages = 0
  const hasNextPage = Boolean(d.hasNextPage ?? d.HasNextPage ?? false)
  const hasPreviousPage = Boolean(d.hasPreviousPage ?? d.HasPreviousPage ?? false)
  return {
    items,
    totalCount: tc,
    pageNumber: Number.isFinite(pageNumber) && pageNumber > 0 ? pageNumber : 1,
    pageSize: ps,
    totalPages,
    hasNextPage,
    hasPreviousPage,
  }
}

/**
 * @param {number|string} idSociete
 * @param {{
 *   pageNumber?: number
 *   pageSize?: number
 *   searchTerm?: string
 *   statutFilter?: 'all' | 'active' | 'inactive'
 *   sortBy?: string
 *   sortDescending?: boolean
 * }} [opts]
 */
export async function listClientsBySocietePaged(idSociete, opts = {}) {
  const sid = Number(idSociete)
  if (!Number.isFinite(sid) || sid <= 0) {
    return unwrapClientPagedResponse(null)
  }
  const pageNumber = Math.max(1, Number(opts.pageNumber) || 1)
  const pageSize = Math.min(100, Math.max(5, Number(opts.pageSize) || 20))
  const params = new URLSearchParams()
  params.set('PageNumber', String(pageNumber))
  params.set('PageSize', String(pageSize))
  const st = String(opts.searchTerm || '').trim()
  if (st) params.set('SearchTerm', st)
  if (opts.sortBy) params.set('SortBy', String(opts.sortBy))
  params.set('SortDescending', opts.sortDescending === true ? 'true' : 'false')

  const sf = opts.statutFilter || 'all'
  if (sf === 'active') {
    params.set('IncludeInactive', 'false')
  } else if (sf === 'inactive') {
    params.set('IncludeInactive', 'true')
    params.set('HasIsActifFilter', 'true')
    params.set('ActifFilterValue', 'false')
  } else {
    params.set('IncludeInactive', 'true')
  }

  const path = `/api/Client/societe/${sid}/paged?${params.toString()}`
  const raw = await apiGet(path, JSON_ACCEPT)
  return unwrapClientPagedResponse(raw)
}

/**
 * @param {number|string} idSociete
 * @param {{ searchTerm?: string, includeInactive?: boolean }} [opts]
 */
export async function listClientsBySocieteRecherche(idSociete, opts = {}) {
  const sid = Number(idSociete)
  if (!Number.isFinite(sid) || sid <= 0) return []
  const params = new URLSearchParams()
  const st = String(opts.searchTerm || '').trim()
  if (st) params.set('SearchTerm', st)
  params.set('IncludeInactive', opts.includeInactive === false ? 'false' : 'true')
  const q = params.toString()
  const path = `/api/Client/societe/${sid}/recherche${q ? `?${q}` : ''}`
  const raw = await apiGet(path, JSON_ACCEPT)
  return unwrapClientList(raw)
}

/**
 * Clients de la société courante (admin) ou société « focus » (super-admin).
 */
export async function listClientsArray() {
  const auth = useAuthStore()
  const sid =
    auth.role === 'superadmin'
      ? Number(auth.effectiveSocieteId)
      : Number(auth.societeId)
  const societeScoped = Number.isFinite(sid) && sid > 0
  const path = societeScoped ? `/api/Client/societe/${sid}` : '/api/Client'
  const raw = await apiGet(path, JSON_ACCEPT)
  let list = unwrapClientList(raw)
  /**
   * Si l’URL est déjà `/api/Client/societe/{id}`, le backend a filtré : ne pas refiltrer côté app
   * (sinon on exclut à tort les lignes dont `idSociete` est encore `null` dans le JSON).
   */
  if (auth.role !== 'superadmin' && !societeScoped) {
    list = scopeEntitiesToUserSociete(list, { role: auth.role, societeId: auth.societeId })
  }
  return list
}

/**
 * @param {number|string} id
 */
export function getClient(id) {
  const nid = Number(id)
  if (!Number.isFinite(nid) || nid <= 0) {
    return Promise.reject(new Error('Identifiant client invalide.'))
  }
  return apiGet(`/api/Client/${nid}`, JSON_ACCEPT)
}

/**
 * @param {{
 *   nomClient: string
 *   adresseClient?: string
 *   telephone?: string
 *   emailClient?: string
 *   genreClient?: string
 *   statut?: boolean
 *   isActif?: boolean
 *   idSociete?: number
 *   province?: string
 *   ville?: string
 *   commune?: string
 *   avenue?: string
 *   numero?: string
 * }} body
 */
export function createClient(body) {
  return apiPost('/api/Client', body, JSON_ACCEPT)
}

/**
 * @param {number|string} id
 * @param {Record<string, unknown>} body
 */
export function updateClient(id, body) {
  const nid = Number(id)
  if (!Number.isFinite(nid) || nid <= 0) {
    return Promise.reject(new Error('Identifiant client invalide.'))
  }
  return apiPut(`/api/Client/${nid}`, body, JSON_ACCEPT)
}

export function toggleClientStatut(id) {
  const nid = Number(id)
  if (!Number.isFinite(nid) || nid <= 0) {
    return Promise.reject(new Error('Identifiant client invalide.'))
  }
  return apiPut(`/api/Client/toggle-statut/${nid}`, {}, JSON_ACCEPT)
}
