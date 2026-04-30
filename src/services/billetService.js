/**
 * API Billet — Rusa Travel
 * GET /api/Billet · POST /api/Billet
 * GET /api/Billet/reservation/{idReservation} · GET /api/Billet/qrcode/{qrCode}
 * `heureVoyage` : TimeSpan .NET (ticks ou chaîne), comme pour les voyages.
 */

import { useAuthStore } from '@/stores/auth'
import { scopeEntitiesToUserSociete } from '@/utils/societeIsolation'
import { API_ENDPOINTS } from './Endpoint.service'
import { apiGet, apiPost } from './apiService'
import { ticksToHHmm } from './voyageService'


export function unwrapBilletList(data) {
  if (data == null) return []
  if (Array.isArray(data)) return data
  if (Array.isArray(data.data)) return data.data
  const nested = data.data && typeof data.data === 'object' ? data.data : null
  if (nested && Array.isArray(nested.data)) return nested.data
  const arr = data.items ?? data.results ?? data.value ?? []
  return Array.isArray(arr) ? arr : []
}

function formatDateOnly(value) {
  if (value == null || value === '') return '—'
  const s = String(value).trim()
  if (!s) return '—'
  const i = s.indexOf('T')
  return i >= 0 ? s.slice(0, 10) : s.slice(0, 10)
}

/**
 * @returns {Promise<object[]>}
 */
export async function listBilletsArray() {
  const auth = useAuthStore()
  let raw
  try {
    raw = await apiGet(API_ENDPOINTS.BILLET.LIST)
  } catch (e) {
    const status = Number(e?.status) || 0
    const canRetry =
      (status === 404 || status === 405) &&
      API_ENDPOINTS.BILLET.LIST !== API_ENDPOINTS.BILLET.BASE
    if (!canRetry) throw e
    raw = await apiGet(API_ENDPOINTS.BILLET.BASE)
  }
  let list = unwrapBilletList(raw)
  if (auth.role !== 'superadmin') {
    list = scopeEntitiesToUserSociete(list, { role: auth.role, societeId: auth.societeId })
  }
  return list
}

/**
 * @param {number|string} idReservation
 * @returns {Promise<object[]>}
 */
export function listBilletsByReservationId(idReservation) {
  const nid = Number(idReservation)
  if (!Number.isFinite(nid) || nid <= 0) {
    return Promise.reject(new Error('Identifiant réservation invalide.'))
  }
  return apiGet(API_ENDPOINTS.BILLET.byReservation(nid)).then(unwrapBilletList)
}

/**
 * @param {string} qrCode — valeur brute ; encodée pour l’URL
 * @returns {Promise<object[]>}
 */
export function listBilletsByQrCode(qrCode) {
  const q = String(qrCode ?? '').trim()
  if (!q) return Promise.reject(new Error('Code QR invalide.'))
  return apiGet(API_ENDPOINTS.BILLET.byQrCode(encodeURIComponent(q))).then(unwrapBilletList)
}

/**
 * POST /api/Billet — le contrat exige les quatre champs ; côté UI on ne saisit en général que
 * `idReservation` puis on complète `qrCode` (ex. UUID) et `dateGeneration` (date du jour `YYYY-MM-DD`) automatiquement.
 * @param {{
 *   idReservation: number,
 *   qrCode: string,
 *   dateGeneration: string,
 *   idSociete: number,
 * }} body
 */
export function createBillet(body) {
  return apiPost(API_ENDPOINTS.BILLET.CREATE, body)
}

/**
 * @param {Record<string, unknown>} row
 */
export function mapBilletFromApi(row) {
  const r = row || {}
  const heureVoyage = r.heureVoyage ?? r.HeureVoyage
  const id = Number(r.id ?? r.Id) || 0
  const idReservation = Number(r.idReservation ?? r.IdReservation) || 0
  const vd = String(r.villeDepart ?? r.VilleDepart ?? '—')
  const va = String(r.villeArrivee ?? r.VilleArrivee ?? '—')
  return {
    id,
    raw: r,
    idReservation,
    qrCode: String(r.qrCode ?? r.QrCode ?? ''),
    nomClient: String(r.nomClient ?? r.NomClient ?? '—'),
    clientContact: String(
      r.emailUtilisateur ?? r.EmailUtilisateur ?? r.telephoneClient ?? r.TelephoneClient ?? ''
    ).trim() || '—',
    trajet: `${vd} → ${va}`,
    dateVoyage: formatDateOnly(r.dateVoyage ?? r.DateVoyage),
    heure: ticksToHHmm(heureVoyage) || '—',
    prix: Number(r.prixVoyage ?? r.PrixVoyage) || 0,
    numeroBus: String(r.numeroBus ?? r.NumeroBus ?? '').trim(),
    statutReservation: String(r.statutReservation ?? r.StatutReservation ?? ''),
    dateGeneration: formatDateOnly(r.dateGeneration ?? r.DateGeneration),
    urlBillet: String(r.urlBillet ?? r.UrlBillet ?? '').trim(),
  }
}
