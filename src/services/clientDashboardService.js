/**
 * API ClientDashboard — Rusa Travel
 * GET {BASE} (+ sous-routes). BASE défaut : /api/ClientDashboard
 * Surcharge : VITE_CLIENT_DASHBOARD_BASE (sans slash final).
 */

import { apiGet } from './apiService'

const JSON_ACCEPT = {
  headers: {
    Accept: 'text/plain, application/json;q=0.9, */*;q=0.8',
  },
}

const BASE = (() => {
  const v = String(import.meta.env.VITE_CLIENT_DASHBOARD_BASE || '/api/ClientDashboard')
    .trim()
    .replace(/\/$/, '')
  return v || '/api/ClientDashboard'
})()

/** Espace client : pas d’en-tête société (évite des 500 côté API si le client n’a pas de société active). */
const DASH_META = { skipSocieteHeader: true }

function isRecoverableDashStatus(status) {
  return status === 500 || status === 502 || status === 503 || status === 404
}

/** @param {unknown} raw */
function pickStatsFromSegment(raw) {
  const u = unwrapClientDashboardPayload(raw)
  if (!u || typeof u !== 'object') return {}
  const nested = u.clientStatistiques ?? u.ClientStatistiques
  if (nested && typeof nested === 'object') return nested
  if (
    u.nombreTotalReservations != null ||
    u.NombreTotalReservations != null ||
    u.montantTotalPaiements != null ||
    u.MontantTotalPaiements != null
  ) {
    return u
  }
  return {}
}

/** @param {unknown} raw */
function pickResumeFromSegment(raw) {
  const u = unwrapClientDashboardPayload(raw)
  if (!u || typeof u !== 'object') return null
  return u.resumeClient ?? u.ResumeClient ?? (u.totalReservations != null || u.TotalReservations != null ? u : null)
}

/**
 * @param {unknown} raw
 * @param {string} camel
 * @param {string} pascal
 */
function pickListSegment(raw, camel, pascal) {
  const u = unwrapClientDashboardPayload(raw)
  if (Array.isArray(u)) return u
  if (u && typeof u === 'object') {
    const direct = u[camel] ?? u[pascal]
    if (Array.isArray(direct)) return direct
  }
  return unwrapList(raw)
}

/**
 * Si GET agrégé échoue (ex. 500), reconstruit le même JSON qu’un seul appel via les sous-routes.
 * @returns {Promise<Record<string, unknown>>}
 */
async function getClientDashboardAggregated() {
  const settled = await Promise.allSettled([
    apiGet(`${BASE}/statistiques`, JSON_ACCEPT, DASH_META),
    apiGet(`${BASE}/reservations-recentes`, JSON_ACCEPT, DASH_META),
    apiGet(`${BASE}/paiements-recents`, JSON_ACCEPT, DASH_META),
    apiGet(`${BASE}/voyages-client`, JSON_ACCEPT, DASH_META),
    apiGet(`${BASE}/alertes-client`, JSON_ACCEPT, DASH_META),
    apiGet(`${BASE}/resume-client`, JSON_ACCEPT, DASH_META),
  ])

  const anyOk = settled.some((s) => s.status === 'fulfilled')
  if (!anyOk) {
    const rej = settled.find((s) => s.status === 'rejected')
    throw rej?.reason ?? new Error('ClientDashboard indisponible')
  }

  const statsRaw = settled[0].status === 'fulfilled' ? settled[0].value : null
  const resaRaw = settled[1].status === 'fulfilled' ? settled[1].value : null
  const payRaw = settled[2].status === 'fulfilled' ? settled[2].value : null
  const voyRaw = settled[3].status === 'fulfilled' ? settled[3].value : null
  const alertRaw = settled[4].status === 'fulfilled' ? settled[4].value : null
  const resumeRaw = settled[5].status === 'fulfilled' ? settled[5].value : null

  return {
    clientStatistiques: pickStatsFromSegment(statsRaw),
    reservationsRecentes: pickListSegment(resaRaw, 'reservationsRecentes', 'ReservationsRecentes'),
    paiementsRecents: pickListSegment(payRaw, 'paiementsRecents', 'PaiementsRecents'),
    voyagesClient: pickListSegment(voyRaw, 'voyagesClient', 'VoyagesClient'),
    alertesClient: pickListSegment(alertRaw, 'alertesClient', 'AlertesClient'),
    resumeClient: pickResumeFromSegment(resumeRaw),
    dateGeneration: new Date().toISOString(),
  }
}

/**
 * @returns {Promise<Record<string, unknown>>}
 */
export async function getClientDashboard() {
  try {
    return await apiGet(BASE, JSON_ACCEPT, DASH_META)
  } catch (e) {
    const st = /** @type {{ status?: number }} */ (e)?.status
    if (!isRecoverableDashStatus(st)) throw e
    try {
      return await getClientDashboardAggregated()
    } catch {
      throw e
    }
  }
}

export function getClientDashboardStatistiques() {
  return apiGet(`${BASE}/statistiques`, JSON_ACCEPT, DASH_META)
}

export function getClientDashboardReservationsRecentes() {
  return apiGet(`${BASE}/reservations-recentes`, JSON_ACCEPT, DASH_META)
}

export function getClientDashboardPaiementsRecents() {
  return apiGet(`${BASE}/paiements-recents`, JSON_ACCEPT, DASH_META)
}

export function getClientDashboardVoyagesClient() {
  return apiGet(`${BASE}/voyages-client`, JSON_ACCEPT, DASH_META)
}

export function getClientDashboardAlertesClient() {
  return apiGet(`${BASE}/alertes-client`, JSON_ACCEPT, DASH_META)
}

export function getClientDashboardResumeClient() {
  return apiGet(`${BASE}/resume-client`, JSON_ACCEPT, DASH_META)
}

/** Liste ou enveloppe API. */
export function unwrapList(data) {
  if (data == null) return []
  if (Array.isArray(data)) return data
  if (typeof data !== 'object') return []
  const arr = data.data ?? data.items ?? data.results ?? data.value ?? []
  return Array.isArray(arr) ? arr : []
}

/**
 * Normalise la réponse GET principal (racine, { data }, { result }, chaînes enveloppes).
 * @param {unknown} raw
 * @param {number} [depth]
 */
export function unwrapClientDashboardPayload(raw, depth = 0) {
  if (raw == null || depth > 6) return {}
  if (typeof raw !== 'object' || Array.isArray(raw)) return {}

  const inner =
    raw.data != null && typeof raw.data === 'object' && !Array.isArray(raw.data)
      ? raw.data
      : raw.result != null && typeof raw.result === 'object' && !Array.isArray(raw.result)
        ? raw.result
        : raw

  if (inner !== raw && inner != null && typeof inner === 'object' && !Array.isArray(inner)) {
    return unwrapClientDashboardPayload(inner, depth + 1)
  }
  return inner
}
