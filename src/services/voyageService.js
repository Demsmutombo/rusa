/**
 * API Voyage — Rusa Travel (admin / super-admin)
 * Pas de DELETE dans le contrat : le statut se modifie via PUT.
 * `heureDepart` côté API : TimeSpan .NET — System.Text.Json attend en général une chaîne « c » (ex. "06:30:00"),
 * pas un objet `{ ticks }` (d’où erreur 400). Les réponses peuvent encore exposer ticks ou une chaîne.
 */

import { useAuthStore } from '@/stores/auth'
import { scopeEntitiesToUserSociete } from '@/utils/societeIsolation'
import { API_ENDPOINTS } from './Endpoint.service'
import { apiGet, apiPost, apiPut } from './apiService'


/** 1 tick = 100 ns → 1 s = 10_000_000 ticks */
const TICKS_PER_SECOND = 10_000_000
/** 1 tick = 100 ns → 1 ms = 10_000 ticks */
const TICKS_PER_MS = 10000

/**
 * @param {string} s
 * @returns {number} ticks
 */
function spanStringToTicks(s) {
  const str = String(s || '').trim()
  if (!str) return 0
  const dayMatch = str.match(/^(\d+)\.(\d{1,2}):(\d{2}):(\d{2})$/)
  if (dayMatch) {
    const days = Number(dayMatch[1]) || 0
    const h = Number(dayMatch[2]) || 0
    const m = Number(dayMatch[3]) || 0
    const sec = Number(dayMatch[4]) || 0
    const totalSec = days * 86400 + h * 3600 + m * 60 + sec
    return totalSec * TICKS_PER_SECOND
  }
  const parts = str.split(':').map((x) => Number(String(x).trim()))
  if (parts.length >= 3 && parts.slice(0, 3).every((x) => Number.isFinite(x))) {
    const [h, m, sec] = parts
    return (h * 3600 + m * 60 + sec) * TICKS_PER_SECOND
  }
  if (parts.length === 2 && parts.every((x) => Number.isFinite(x))) {
    return (parts[0] * 3600 + parts[1] * 60) * TICKS_PER_SECOND
  }
  return 0
}

/**
 * @param {unknown} heureDepart
 * @returns {number}
 */
export function extractTicks(heureDepart) {
  if (heureDepart == null) return 0
  if (typeof heureDepart === 'number' && Number.isFinite(heureDepart)) return heureDepart
  if (typeof heureDepart === 'string') return spanStringToTicks(heureDepart)
  const o = /** @type {Record<string, unknown>} */ (heureDepart)
  const t = o.ticks ?? o.Ticks
  const n = Number(t)
  return Number.isFinite(n) ? n : 0
}

/**
 * @param {number} ticks
 * @returns {string} format compatible TimeSpan « c » (.NET), ex. "06:00:00" ou "1.06:00:00"
 */
export function ticksToApiTimeSpanString(ticks) {
  let t = Math.floor(Number(ticks) || 0)
  if (t < 0) t = 0
  const totalSeconds = Math.floor(t / TICKS_PER_SECOND)
  const days = Math.floor(totalSeconds / 86400)
  const rem = totalSeconds % 86400
  const h = Math.floor(rem / 3600)
  const m = Math.floor((rem % 3600) / 60)
  const s = rem % 60
  const hh = String(h).padStart(2, '0')
  const mm = String(m).padStart(2, '0')
  const ss = String(s).padStart(2, '0')
  if (days > 0) return `${days}.${hh}:${mm}:${ss}`
  return `${hh}:${mm}:${ss}`
}

/**
 * Saisie formulaire (type="time" → souvent "HH:mm" ou "HH:mm:ss") → valeur JSON pour l’API.
 * @param {string} hhmm
 * @returns {string}
 */
export function formHeureToApiHeureDepart(hhmm) {
  const parts = String(hhmm ?? '')
    .trim()
    .split(':')
    .map((x) => Number(String(x).trim()))
  const h = Number.isFinite(parts[0]) ? parts[0] : 0
  const m = Number.isFinite(parts[1]) ? parts[1] : 0
  const sec = Number.isFinite(parts[2]) ? parts[2] : 0
  const pad2 = (n) => String(Math.max(0, Math.floor(n))).padStart(2, '0')
  return `${pad2(h)}:${pad2(m)}:${pad2(sec)}`
}

/**
 * Valeur lue (GET) → chaîne à renvoyer en POST/PUT.
 * @param {unknown} value
 * @returns {string}
 */
export function heureDepartToApiString(value) {
  if (typeof value === 'string' && value.trim()) {
    return ticksToApiTimeSpanString(spanStringToTicks(value.trim()))
  }
  return ticksToApiTimeSpanString(extractTicks(value))
}

/**
 * @param {unknown} heureDepart
 * @returns {string} HH:mm (24h)
 */
export function ticksToHHmm(heureDepart) {
  const ticks = extractTicks(heureDepart)
  const ms = ticks / TICKS_PER_MS
  const totalMinutes = Math.floor(ms / 60000)
  const wrap = ((totalMinutes % 1440) + 1440) % 1440
  const h = Math.floor(wrap / 60)
  const m = wrap % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

/**
 * @param {string} hhmm — « HH:mm »
 * @returns {number} ticks
 */
export function hhmmToTicks(hhmm) {
  if (!hhmm || typeof hhmm !== 'string') return 0
  const parts = hhmm.trim().split(':')
  const h = Number(parts[0])
  const mins = Number(parts[1] ?? 0)
  if (!Number.isFinite(h) || !Number.isFinite(mins)) return 0
  const totalMs = (h * 3600 + mins * 60) * 1000
  return Math.round(totalMs * TICKS_PER_MS)
}

export function unwrapVoyageList(data) {
  if (data == null) return []
  if (Array.isArray(data)) return data
  if (Array.isArray(data.data)) return data.data
  const nested = data.data && typeof data.data === 'object' ? data.data : null
  if (nested && Array.isArray(nested.data)) return nested.data
  const arr = data.items ?? data.results ?? data.value ?? []
  return Array.isArray(arr) ? arr : []
}

export async function listVoyagesArray() {
  const auth = useAuthStore()
  const raw = await apiGet(API_ENDPOINTS.VOYAGE.LIST)
  let list = unwrapVoyageList(raw)
  if (auth.role !== 'superadmin') {
    list = scopeEntitiesToUserSociete(list, { role: auth.role, societeId: auth.societeId })
  }
  return list
}

/**
 * @param {number|string} id
 */
export function getVoyage(id) {
  const nid = Number(id)
  if (!Number.isFinite(nid) || nid <= 0) {
    return Promise.reject(new Error('Identifiant voyage invalide.'))
  }
  return apiGet(API_ENDPOINTS.VOYAGE.byId(nid))
}

/**
 * @param {{
 *   dateDepart: string,
 *   heureDepart: string,
 *   prix: number,
 *   idBus: number,
 *   idDestination: number,
 *   idSociete: number,
 *   statut?: boolean
 * }} body
 */
export function createVoyage(body) {
  return apiPost(API_ENDPOINTS.VOYAGE.CREATE, body)
}

/**
 * @param {number|string} id
 * @param {{
 *   id: number,
 *   dateDepart: string,
 *   heureDepart: string,
 *   prix: number,
 *   idBus: number,
 *   idDestination: number,
 *   idSociete: number,
 *   statut: boolean
 * }} body
 */
export function updateVoyage(id, body) {
  const nid = Number(id)
  if (!Number.isFinite(nid) || nid <= 0) {
    return Promise.reject(new Error('Identifiant voyage invalide.'))
  }
  return apiPut(API_ENDPOINTS.VOYAGE.byId(nid), body)
}
