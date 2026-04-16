/**
 * API Bus — Rusa Travel
 * Pas de DELETE : désactivation via PUT …/toggle-statut
 */

import { useAuthStore } from '@/stores/auth'
import { scopeEntitiesToUserSociete } from '@/utils/societeIsolation'
import { apiGet, apiPost, apiPut } from './apiService'
import { resolveApiUrl } from '@/config/apiOrigin'

const JSON_ACCEPT = {
  headers: {
    Accept: 'text/plain, application/json;q=0.9, */*;q=0.8',
  },
}

export function unwrapBusList(data) {
  if (data == null) return []
  if (Array.isArray(data)) return data
  const arr = data.data ?? data.items ?? data.results ?? data.value ?? []
  return Array.isArray(arr) ? arr : []
}

export async function listBusArray() {
  const auth = useAuthStore()
  const sid =
    auth.role === 'superadmin'
      ? Number(auth.effectiveSocieteId)
      : Number(auth.societeId)
  const path =
    Number.isFinite(sid) && sid > 0 ? `/api/Bus/societe/${sid}` : '/api/Bus'
  const raw = await apiGet(path, JSON_ACCEPT)
  let list = unwrapBusList(raw)
  if (auth.role !== 'superadmin') {
    list = scopeEntitiesToUserSociete(list, { role: auth.role, societeId: auth.societeId })
  }
  return list
}

/** Clés courantes (camelCase / PascalCase) pour l’URL ou le chemin de photo côté API. */
const BUS_PHOTO_ROW_KEYS = [
  'photo',
  'Photo',
  'photoUrl',
  'PhotoUrl',
  'urlPhoto',
  'UrlPhoto',
  'image',
  'Image',
  'imageUrl',
  'ImageUrl',
  'cheminPhoto',
  'CheminPhoto',
  'photoPath',
  'PhotoPath',
  'filePath',
  'FilePath',
  'fichierPhoto',
  'FichierPhoto',
]

/**
 * Première valeur non vide trouvée sur la ligne bus (pour affichage et édition).
 * @param {Record<string, unknown> | null | undefined} row
 */
export function pickBusPhotoRaw(row) {
  if (!row || typeof row !== 'object') return ''
  for (const k of BUS_PHOTO_ROW_KEYS) {
    const v = row[k]
    if (v == null) continue
    const s = String(v).trim()
    if (s) return s.replace(/\\/g, '/')
  }
  return ''
}

export function resolveBusPhotoUrl(photo) {
  let s = String(photo ?? '').trim()
  if (!s) return null
  s = s.replace(/\\/g, '/')
  if (/^data:/i.test(s)) return s
  if (/^https?:\/\//i.test(s)) return s
  const path = s.startsWith('/') ? s : `/${s}`
  return resolveApiUrl(path)
}

/**
 * URL absolue ou chemin utilisable en `src` pour la photo du bus.
 * @param {Record<string, unknown> | null | undefined} row
 */
export function resolveBusPhotoFromRow(row) {
  return resolveBusPhotoUrl(pickBusPhotoRaw(row))
}

/**
 * @param {{ marques: string, numeroBus: number, idTypeBus: number, nombreSiege: number, idSociete: number, numeroDePlaque: string, photo?: string, statut?: boolean }} body
 */
export function createBus(body) {
  return apiPost('/api/Bus', body, JSON_ACCEPT)
}

/**
 * @param {number|string} id
 * @param {Record<string, unknown>} body — schéma PUT /api/Bus/{id}
 */
export function updateBus(id, body) {
  const nid = Number(id)
  if (!Number.isFinite(nid) || nid <= 0) {
    return Promise.reject(new Error('Identifiant bus invalide.'))
  }
  return apiPut(`/api/Bus/${nid}`, body, JSON_ACCEPT)
}

export function toggleBusStatut(id) {
  const nid = Number(id)
  if (!Number.isFinite(nid) || nid <= 0) {
    return Promise.reject(new Error('Identifiant bus invalide.'))
  }
  return apiPut(`/api/Bus/${nid}/toggle-statut`, {}, JSON_ACCEPT)
}
