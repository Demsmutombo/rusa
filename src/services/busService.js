/**
 * API Bus — Rusa Travel
 * Pas de DELETE : désactivation via PUT /api/Bus/{id} (corps complet).
 * L’endpoint dédié …/toggle-statut peut renvoyer 500 côté serveur ; on aligne sur TypeBus (PUT complet).
 */

import { useAuthStore } from '@/stores/auth'
import { scopeEntitiesToUserSociete } from '@/utils/societeIsolation'
import { apiGet, apiPost, apiPut } from './apiService'
import { API_ENDPOINTS, API_USE_GUIDE_ROUTES } from './Endpoint.service'
import { resolveApiUrl } from '@/config/apiOrigin'


export function unwrapBusList(data) {
  if (data == null) return []
  if (Array.isArray(data)) return data
  if (Array.isArray(data.data)) return data.data
  const nested = data.data && typeof data.data === 'object' ? data.data : null
  if (nested && Array.isArray(nested.data)) return nested.data
  const arr = data.items ?? data.results ?? data.value ?? []
  return Array.isArray(arr) ? arr : []
}

export async function listBusArray() {
  const auth = useAuthStore()
  const sid =
    auth.role === 'superadmin'
      ? Number(auth.effectiveSocieteId)
      : Number(auth.societeId)
  const path = API_USE_GUIDE_ROUTES
    ? API_ENDPOINTS.BUS.LIST
    : Number.isFinite(sid) && sid > 0
      ? API_ENDPOINTS.BUS.bySociete(sid)
      : API_ENDPOINTS.BUS.BASE
  const raw = await apiGet(path)
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
  return apiPost(API_ENDPOINTS.BUS.CREATE, body)
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
  return apiPut(API_ENDPOINTS.BUS.byId(nid), body)
}

function rowStatutActif(row) {
  if (!row || typeof row !== 'object') return true
  const v = row.statut ?? row.Statut
  return !(v === false || v === 0 || v === '0' || String(v).toLowerCase() === 'false')
}

/**
 * Bascule actif/inactif en réutilisant PUT /api/Bus/{id} (même contrat que la fiche « Modifier »).
 * @param {Record<string, unknown>} row — ligne liste (idBus, marques, idTypeBus, etc.)
 */
export function toggleBusStatut(row) {
  const id = Number(row?.idBus ?? row?.IdBus)
  if (!Number.isFinite(id) || id <= 0) {
    return Promise.reject(new Error('Identifiant bus invalide.'))
  }
  const next = !rowStatutActif(row)
  return updateBus(id, {
    idBus: id,
    marques: String(row.marques ?? row.Marques ?? '').trim(),
    numeroBus: Number(row.numeroBus ?? row.NumeroBus) || 0,
    idTypeBus: Number(row.idTypeBus ?? row.IdTypeBus) || 0,
    nombreSiege: Number(row.nombreSiege ?? row.NombreSiege) || 0,
    idSociete: Number(row.idSociete ?? row.IdSociete) || 0,
    numeroDePlaque: String(row.numeroDePlaque ?? row.NumeroDePlaque ?? '').trim(),
    photo: pickBusPhotoRaw(row) || '',
    statut: next,
  })
}
