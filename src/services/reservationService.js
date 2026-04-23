/**
 * API Réservation — Rusa Travel
 * GET /api/Reservation · GET /api/Reservation/{id} · POST /api/Reservation · PUT /api/Reservation/{id}
 * Les réponses peuvent inclure `heureVoyage` au format TimeSpan .NET (objet avec ticks ou chaîne).
 */

import { useAuthStore } from '@/stores/auth'
import { sessionHintsFromJwt } from '@/utils/jwtClaims'
import { scopeEntitiesToUserSociete } from '@/utils/societeIsolation'
import { apiGet, apiPost, apiPut } from './apiService'
import { ticksToHHmm } from './voyageService'

const JSON_ACCEPT = {
  headers: {
    Accept: 'text/plain, application/json;q=0.9, */*;q=0.8',
  },
}

/**
 * Valeurs autorisées côté API pour `statutReservation` (enum backend).
 * @type {{ pending: string, confirmed: string, cancelled: string, completed: string }}
 */
export const RESERVATION_STATUT_RESERVATION = {
  pending: 'EN_ATTENTE',
  confirmed: 'CONFIRME',
  cancelled: 'ANNULE',
  /** Pas de code « terminé » distinct : aligné sur confirmé pour les PUT issus de l’UI. */
  completed: 'CONFIRME',
}

/** Options affichables (modale création) : `value` = code API. */
export const RESERVATION_STATUT_SELECT_OPTIONS = [
  { value: 'EN_ATTENTE', label: 'En attente' },
  { value: 'CONFIRME', label: 'Confirmée' },
  { value: 'ANNULE', label: 'Annulée' },
]

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
 *   idUtilisateur?: number,
 *   idClient: number,
 *   idVoyage: number,
 *   statutReservation?: string,
 *   statut?: boolean,
 *   dateReservation: string,
 *   idSociete: number,
 *   nombrePlaces?: number,
 * }} body
 */
export function createReservation(body) {
  const payload = { ...(body && typeof body === 'object' ? body : {}) }
  /** `0` provoque souvent une erreur serveur (FK) ; le backend peut remplir depuis le JWT. */
  const uid = Number(payload.idUtilisateur)
  if (!Number.isFinite(uid) || uid <= 0) {
    delete payload.idUtilisateur
  }
  return apiPost('/api/Reservation', payload, JSON_ACCEPT)
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
 * Statut API → slug UI : pending | confirmed | cancelled | completed
 * (codes `EN_ATTENTE` / `CONFIRME` / `ANNULE` + anciens libellés français éventuels)
 * @param {unknown} statutReservation
 */
export function mapApiStatutToUi(statutReservation) {
  const raw = String(statutReservation ?? '').trim()
  if (!raw) return 'pending'
  const key = stripAccents(raw).replace(/\s+/g, '_')
  if (key === 'en_attente') return 'pending'
  if (key === 'confirme') return 'confirmed'
  if (key === 'annule') return 'cancelled'
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

/** Même forme que l’exemple Swagger (DateTime UTC), ex. `2026-04-23T12:00:00.000Z`. */
function dateOnlyToUtcNoonIso(dateOnly) {
  const d = isoDateOnly(dateOnly) || new Date().toISOString().slice(0, 10)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) {
    const t = new Date()
    if (!Number.isNaN(t.getTime())) return t.toISOString()
    return `${new Date().toISOString().slice(0, 10)}T12:00:00.000Z`
  }
  return `${d}T12:00:00.000Z`
}

/**
 * Corps JSON pour POST /api/Reservation (contrat Swagger).
 * Complète `idUtilisateur` et `idSociete` depuis la session si omis (admin = société session ;
 * super-admin = société « focus » `effectiveSocieteId`).
 *
 * @param {{
 *   idClient: number|string,
 *   idVoyage: number|string,
 *   statutReservation?: string,
 *   statut?: boolean,
 *   dateReservation?: string,
 *   idUtilisateur?: number|string,
 *   idSociete?: number|string,
 *   nombrePlaces?: number|string,
 * }} params
 * @returns {{
 *   idReservation: number,
 *   idUtilisateur: number,
 *   idClient: number,
 *   idVoyage: number,
 *   statutReservation: string,
 *   statut: boolean,
 *   dateReservation: string,
 *   idSociete: number,
 *   nombrePlaces: number,
 * }}
 */
export function buildReservationCreateBody(params) {
  const auth = useAuthStore()
  const p = params || {}
  const idClient = Number(p.idClient) || 0
  const idVoyage = Number(p.idVoyage) || 0

  let idUtilisateur = Number(p.idUtilisateur) || 0
  if (!idUtilisateur && auth.user) {
    const u = auth.user
    idUtilisateur = Number(u.idUtilisateur ?? u.IdUtilisateur) || 0
  }
  if (!idUtilisateur && auth.token) {
    const hints = sessionHintsFromJwt(auth.token)
    if (hints?.idUtilisateur != null && hints.idUtilisateur !== '') {
      const n = Number(hints.idUtilisateur)
      if (Number.isFinite(n) && n > 0) idUtilisateur = n
    }
  }

  let idSociete = Number(p.idSociete) || 0
  if (!idSociete) {
    if (auth.role === 'superadmin') {
      const n = Number(auth.effectiveSocieteId)
      idSociete = Number.isFinite(n) && n > 0 ? n : 0
    } else {
      const n = Number(auth.societeId)
      idSociete = Number.isFinite(n) && n > 0 ? n : 0
    }
  }

  const dateReservation = dateOnlyToUtcNoonIso(
    p.dateReservation != null && p.dateReservation !== ''
      ? p.dateReservation
      : new Date().toISOString().slice(0, 10),
  )

  const statutReservationRaw = p.statutReservation != null ? String(p.statutReservation).trim() : ''
  const statutReservation =
    statutReservationRaw || RESERVATION_STATUT_RESERVATION.pending

  const statut = p.statut === undefined ? true : Boolean(p.statut)

  let nombrePlaces = Number(p.nombrePlaces)
  if (!Number.isFinite(nombrePlaces) || nombrePlaces < 1) nombrePlaces = 1
  nombrePlaces = Math.min(100, Math.floor(nombrePlaces))

  /**
   * Sous-ensemble aligné sur le DTO Swagger (création : `idReservation` = 0, `dateReservation` en ISO UTC).
   * Champs uniquement renvoyés par le GET (`dateCreation`, `nomClient`, `heureVoyage`, etc.) : ne pas les envoyer
   * sauf si le contrôleur API l’exige explicitement (sinon risque de 400/500 selon la désérialisation).
   */
  return {
    idReservation: 0,
    idUtilisateur,
    idClient,
    idVoyage,
    statutReservation,
    statut,
    dateReservation,
    idSociete,
    nombrePlaces,
  }
}

function formatDisplayDate(value) {
  const d = isoDateOnly(value)
  if (!d) return '—'
  return d
}

/**
 * Construit le corps PUT attendu par l’API à partir d’une ligne renvoyée par GET.
 * @param {Record<string, unknown>} raw
 * @param {Partial<{ statutReservation: string, statut: boolean, dateReservation: string, nombrePlaces: number }>} [overrides]
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

  let nombrePlaces = Number(
    overrides.nombrePlaces !== undefined
      ? overrides.nombrePlaces
      : r.nombrePlaces ?? r.NombrePlaces ?? r.nbPlaces ?? r.NbPlaces,
  )
  if (!Number.isFinite(nombrePlaces) || nombrePlaces < 1) nombrePlaces = 1
  nombrePlaces = Math.min(100, Math.floor(nombrePlaces))

  return {
    idReservation,
    idUtilisateur,
    idClient,
    idVoyage,
    statutReservation,
    statut,
    dateReservation,
    idSociete,
    nombrePlaces,
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
    places: Math.max(
      1,
      Number(r.nombrePlaces ?? r.NombrePlaces ?? r.nbPlaces ?? r.NbPlaces ?? r.nombreDePlaces ?? r.NombreDePlaces) || 1,
    ),
    totalPrice: Number(r.prixVoyage ?? r.PrixVoyage) || 0,
    status: mapApiStatutToUi(statutReservation),
    createdAt: formatDisplayDate(r.dateCreation ?? r.DateCreation ?? r.dateReservation ?? r.DateReservation),
    apiStatutReservation: statutReservation,
  }
}
