/**
 * API Réservation — Rusa Travel
 * GET /api/Reservation · GET /api/Reservation/{id} · POST /api/Reservation · PUT /api/Reservation/{id}
 * Les réponses peuvent inclure `heureVoyage` au format TimeSpan .NET (objet avec ticks ou chaîne).
 */

import { useAuthStore } from '@/stores/auth'
import { scopeEntitiesToUserSociete } from '@/utils/societeIsolation'
import { apiGet, apiPost, apiPut } from './apiService'
import { ticksToHHmm } from './voyageService'

const JSON_ACCEPT = {
  headers: {
    Accept: 'text/plain, application/json;q=0.9, */*;q=0.8',
  },
}

/** Libellés envoyés à l’API pour `statutReservation` (adapter si le backend impose d’autres chaînes). */
export const RESERVATION_STATUT_RESERVATION = {
  pending: 'En attente',
  confirmed: 'Confirmée',
  cancelled: 'Annulée',
  completed: 'Terminée',
}

export function unwrapReservationList(data) {
  if (data == null) return []
  if (Array.isArray(data)) return data
  const arr = data.data ?? data.items ?? data.results ?? data.value ?? []
  return Array.isArray(arr) ? arr : []
}

/**
 * @returns {Promise<object[]>}
 */
export async function listReservationsArray() {
  const auth = useAuthStore()
  const raw = await apiGet('/api/Reservation', JSON_ACCEPT)
  let list = unwrapReservationList(raw)
  if (auth.role !== 'superadmin') {
    list = scopeEntitiesToUserSociete(list, { role: auth.role, societeId: auth.societeId })
  }
  return list
}

/**
 * @param {number|string} id
 */
export function getReservation(id) {
  const nid = Number(id)
  if (!Number.isFinite(nid) || nid <= 0) {
    return Promise.reject(new Error('Identifiant réservation invalide.'))
  }
  return apiGet(`/api/Reservation/${nid}`, JSON_ACCEPT)
}

/**
 * @param {{
 *   idUtilisateur: number,
 *   idClient: number,
 *   idVoyage: number,
 *   statutReservation?: string,
 *   statut?: boolean,
 *   dateReservation: string,
 *   idSociete: number,
 * }} body
 */
export function createReservation(body) {
  return apiPost('/api/Reservation', body, JSON_ACCEPT)
}

/**
 * @param {number|string} id
 * @param {object} body — corps PUT (souvent le DTO complet incluant idReservation)
 */
export function updateReservation(id, body) {
  const nid = Number(id)
  if (!Number.isFinite(nid) || nid <= 0) {
    return Promise.reject(new Error('Identifiant réservation invalide.'))
  }
  return apiPut(`/api/Reservation/${nid}`, body, JSON_ACCEPT)
}

function stripAccents(s) {
  return String(s || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

/**
 * Statut API (chaîne libre) → slug UI : pending | confirmed | cancelled | completed
 * @param {unknown} statutReservation
 */
export function mapApiStatutToUi(statutReservation) {
  const raw = String(statutReservation ?? '').trim()
  if (!raw) return 'pending'
  const n = stripAccents(raw)
  if (n.includes('annul') || n.includes('cancel')) return 'cancelled'
  if (n.includes('confirm') || n.includes('valide')) return 'confirmed'
  if (n.includes('termin') || n.includes('complet') || n.includes('effectue')) return 'completed'
  if (n.includes('attente') || n.includes('pending') || n.includes('en cours')) return 'pending'
  return 'pending'
}

/**
 * @param {'pending'|'confirmed'|'cancelled'|'completed'} ui
 */
export function mapUiStatutToApi(ui) {
  return RESERVATION_STATUT_RESERVATION[ui] || String(ui)
}

function isoDateOnly(value) {
  if (value == null || value === '') return ''
  const s = String(value).trim()
  if (!s) return ''
  const i = s.indexOf('T')
  return i >= 0 ? s.slice(0, i) : s.slice(0, 10)
}

function formatDisplayDate(value) {
  const d = isoDateOnly(value)
  if (!d) return '—'
  return d
}

/**
 * Construit le corps PUT attendu par l’API à partir d’une ligne renvoyée par GET.
 * @param {Record<string, unknown>} raw
 * @param {Partial<{ statutReservation: string, statut: boolean, dateReservation: string }>} [overrides]
 */
export function reservationRawToPutBody(raw, overrides = {}) {
  const r = raw || {}
  const idReservation = Number(r.idReservation ?? r.IdReservation) || 0
  const idUtilisateur = Number(r.idUtilisateur ?? r.IdUtilisateur) || 0
  const idClient = Number(r.idClient ?? r.IdClient) || 0
  const idVoyage = Number(r.idVoyage ?? r.IdVoyage) || 0
  const idSociete = Number(r.idSociete ?? r.IdSociete) || 0
  const statut =
    overrides.statut !== undefined ? overrides.statut : Boolean(r.statut ?? r.Statut ?? true)
  const statutReservation =
    overrides.statutReservation !== undefined
      ? overrides.statutReservation
      : String(r.statutReservation ?? r.StatutReservation ?? '')
  const baseDate =
    overrides.dateReservation !== undefined
      ? overrides.dateReservation
      : r.dateReservation ?? r.DateReservation ?? r.dateCreation ?? r.DateCreation
  const dateReservation = isoDateOnly(baseDate) || new Date().toISOString().slice(0, 10)

  return {
    idReservation,
    idUtilisateur,
    idClient,
    idVoyage,
    statutReservation,
    statut,
    dateReservation,
    idSociete,
  }
}

/**
 * Ligne API → modèle affichage (table admin + actions PUT).
 * @param {Record<string, unknown>} row
 */
export function mapReservationFromApi(row) {
  const r = row || {}
  const idReservation = Number(r.idReservation ?? r.IdReservation) || 0
  const prenom = String(r.prenomClient ?? r.PrenomClient ?? '').trim()
  const nom = String(r.nomClient ?? r.NomClient ?? '').trim()
  const clientName = [prenom, nom].filter(Boolean).join(' ') || '—'
  const clientEmail = String(r.emailUtilisateur ?? r.EmailUtilisateur ?? '').trim()
  const telephone = String(r.telephoneClient ?? r.TelephoneClient ?? '').trim()
  const statutReservation = String(r.statutReservation ?? r.StatutReservation ?? '')
  const heureVoyage = r.heureVoyage ?? r.HeureVoyage
  const numeroBus = String(r.numeroBus ?? r.NumeroBus ?? '').trim()

  return {
    id: idReservation,
    raw: r,
    clientName,
    clientEmail: clientEmail || telephone || '—',
    departure: String(r.villeDepart ?? r.VilleDepart ?? '—'),
    arrival: String(r.villeArrivee ?? r.VilleArrivee ?? '—'),
    carrier: numeroBus ? `Bus n° ${numeroBus}` : '—',
    date: formatDisplayDate(r.dateVoyage ?? r.DateVoyage),
    time: ticksToHHmm(heureVoyage) || '—',
    places: 1,
    totalPrice: Number(r.prixVoyage ?? r.PrixVoyage) || 0,
    status: mapApiStatutToUi(statutReservation),
    createdAt: formatDisplayDate(r.dateCreation ?? r.DateCreation ?? r.dateReservation ?? r.DateReservation),
    apiStatutReservation: statutReservation,
  }
}
