/**
 * API ClientDashboard — Rusa Travel
 * GET {BASE} (+ sous-routes). BASE défaut : /api/ClientDashboard
 * Surcharge : VITE_CLIENT_DASHBOARD_BASE (sans slash final).
 */

import { apiGet } from './apiService'
import { API_ENDPOINTS } from './Endpoint.service'
import { useAuthStore } from '@/stores/auth'
import { sessionHintsFromJwt } from '@/utils/jwtClaims'
import {
  listReservationsByClient,
  listReservationsByUserAndClient,
} from './reservationService'
import { listPaiements, listPaiementsByClient } from './paiementService'


const BASE = API_ENDPOINTS.DASHBOARD.CLIENT_BASE
const CLIENT_STAT = API_ENDPOINTS.DASHBOARD.CLIENT_STATISTIQUES || `${BASE}/statistiques`
const CLIENT_RESA = API_ENDPOINTS.DASHBOARD.CLIENT_RESERVATIONS_RECENTES || `${BASE}/reservations-recentes`
const CLIENT_PAY = API_ENDPOINTS.DASHBOARD.CLIENT_PAIEMENTS_RECENTS || `${BASE}/paiements-recents`
const CLIENT_VOY = API_ENDPOINTS.DASHBOARD.CLIENT_VOYAGES || `${BASE}/voyages-client`
const CLIENT_ALERT = API_ENDPOINTS.DASHBOARD.CLIENT_ALERTES || `${BASE}/alertes-client`
const CLIENT_RESUME = API_ENDPOINTS.DASHBOARD.CLIENT_RESUME || `${BASE}/resume-client`

/** Espace client : pas d’en-tête société (évite des 500 côté API si le client n’a pas de société active). */
const DASH_META = { skipSocieteHeader: true }

function isRecoverableDashStatus(status) {
  return status === 500 || status === 502 || status === 503 || status === 404
}

function num(v) {
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

function pickVal(obj, ...keys) {
  for (const k of keys) {
    if (obj?.[k] !== undefined && obj?.[k] !== null) return obj[k]
  }
  return undefined
}

/** @param {unknown} raw */
function pickStatsFromSegment(raw) {
  const u = unwrapClientDashboardPayload(raw)
  if (!u || typeof u !== 'object') return {}
  const swagger = u.statistiques ?? u.Statistiques
  if (swagger && typeof swagger === 'object') return swagger
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

function normalizeStats(rawStats) {
  const s = rawStats && typeof rawStats === 'object' ? rawStats : {}
  const totalRes = num(pickVal(s, 'nombreTotalReservations', 'NombreTotalReservations', 'nombreReservations', 'NombreReservations'))
  const totalPaye = num(pickVal(s, 'montantTotalPaiements', 'MontantTotalPaiements', 'montantTotalPaye', 'MontantTotalPaye'))
  const totalDu = num(pickVal(s, 'montantReservationsNonPayees', 'MontantReservationsNonPayees', 'montantTotalDu', 'MontantTotalDu'))
  const totalVoy = num(pickVal(s, 'nombreVoyages', 'NombreVoyages', 'nombreVoyagesEffectues', 'NombreVoyagesEffectues'))
  const totalResAmount = num(pickVal(s, 'montantTotalReservations', 'MontantTotalReservations'))
  const moyenne =
    num(pickVal(s, 'montantMoyenParReservation', 'MontantMoyenParReservation')) ??
    (totalResAmount != null && totalRes && totalRes > 0 ? totalResAmount / totalRes : null)
  return {
    nombreTotalReservations: totalRes,
    nombreReservationsActives: num(pickVal(s, 'nombreReservationsActives', 'NombreReservationsActives')),
    nombreReservationsPayees: num(pickVal(s, 'nombreReservationsPayees', 'NombreReservationsPayees')),
    montantTotalPaiements: totalPaye,
    montantReservationsNonPayees: totalDu,
    tauxPaiement: num(pickVal(s, 'tauxPaiement', 'TauxPaiement')),
    nombreVoyages: totalVoy,
    montantMoyenParReservation: moyenne,
  }
}

function normalizeReservations(rows) {
  return unwrapList(rows).map((r) => ({
    idReservation: pickVal(r, 'idReservation', 'IdReservation'),
    referenceReservation: pickVal(r, 'referenceReservation', 'ReferenceReservation', 'reference', 'Reference'),
    dateReservation: pickVal(r, 'dateReservation', 'DateReservation'),
    statutReservation: pickVal(r, 'statutReservation', 'StatutReservation', 'statut', 'Statut'),
    voyageInfo: pickVal(r, 'voyageInfo', 'VoyageInfo'),
    dateVoyage: pickVal(r, 'dateVoyage', 'DateVoyage'),
    prix: num(pickVal(r, 'prix', 'Prix', 'montantTotal', 'MontantTotal')),
    statutPaiement: pickVal(r, 'statutPaiement', 'StatutPaiement'),
    montantPaye: num(pickVal(r, 'montantPaye', 'MontantPaye')),
    destination: pickVal(r, 'destination', 'Destination'),
  }))
}

function normalizePaiements(rows) {
  return unwrapList(rows).map((r) => ({
    idPaiement: pickVal(r, 'idPaiement', 'IdPaiement'),
    referencePaiement: pickVal(r, 'referencePaiement', 'ReferencePaiement', 'reference', 'Reference'),
    datePaiement: pickVal(r, 'datePaiement', 'DatePaiement'),
    montantPaye: num(pickVal(r, 'montantPaye', 'MontantPaye')),
    methodePaiement: pickVal(r, 'methodePaiement', 'MethodePaiement'),
    referenceReservation: pickVal(r, 'referenceReservation', 'ReferenceReservation'),
    statut: pickVal(r, 'statut', 'Statut'),
    voyageInfo: pickVal(r, 'voyageInfo', 'VoyageInfo'),
    dateVoyage: pickVal(r, 'dateVoyage', 'DateVoyage'),
    destination: pickVal(r, 'destination', 'Destination'),
  }))
}

function normalizeVoyages(rows) {
  return unwrapList(rows).map((r) => ({
    idVoyage: pickVal(r, 'idVoyage', 'IdVoyage'),
    referenceVoyage: pickVal(r, 'referenceVoyage', 'ReferenceVoyage', 'reference', 'Reference'),
    dateDepart: pickVal(r, 'dateDepart', 'DateDepart'),
    destination:
      pickVal(r, 'destination', 'Destination') ??
      [pickVal(r, 'villeDepart', 'VilleDepart'), pickVal(r, 'villeArrivee', 'VilleArrivee')].filter(Boolean).join(' - '),
    prix: num(pickVal(r, 'prix', 'Prix')),
    statutVoyage: pickVal(r, 'statutVoyage', 'StatutVoyage'),
    busInfo: pickVal(r, 'busInfo', 'BusInfo', 'typeBus', 'TypeBus'),
  }))
}

function normalizeAlertes(rows) {
  return unwrapList(rows).map((a) => ({
    idAlerte: pickVal(a, 'idAlerte', 'IdAlerte'),
    typeAlerte: pickVal(a, 'typeAlerte', 'TypeAlerte'),
    description: pickVal(a, 'description', 'Description'),
    niveauCriticite: pickVal(a, 'niveauCriticite', 'NiveauCriticite'),
    dateAlerte: pickVal(a, 'dateAlerte', 'DateAlerte'),
    referenceReservation: pickVal(a, 'referenceReservation', 'ReferenceReservation'),
    montantConcerne: num(pickVal(a, 'montantConcerne', 'MontantConcerne')),
    actionSuggeree: pickVal(a, 'actionSuggeree', 'ActionSuggeree'),
  }))
}

function normalizeResume(rawResume, stats, reservations, paiements, voyages) {
  const r = rawResume && typeof rawResume === 'object' ? rawResume : {}
  return {
    totalReservations:
      num(pickVal(r, 'totalReservations', 'TotalReservations')) ?? num(stats?.nombreTotalReservations) ?? reservations.length,
    totalPaiements: num(pickVal(r, 'totalPaiements', 'TotalPaiements')) ?? num(stats?.montantTotalPaiements),
    totalVoyages: num(pickVal(r, 'totalVoyages', 'TotalVoyages')) ?? num(stats?.nombreVoyages) ?? voyages.length,
    derniereReservation:
      pickVal(r, 'derniereReservation', 'DerniereReservation') ?? reservations[0]?.dateReservation ?? null,
    dernierPaiement: pickVal(r, 'dernierPaiement', 'DernierPaiement') ?? paiements[0]?.datePaiement ?? null,
    prochainVoyage: pickVal(r, 'prochainVoyage', 'ProchainVoyage') ?? voyages[0]?.dateDepart ?? null,
    ...r,
  }
}

function normalizeClientDashboard(raw, source = 'client-dashboard') {
  const u = unwrapClientDashboardPayload(raw)
  const statsRaw = pickStatsFromSegment(u)
  const stats = normalizeStats(statsRaw)
  const reservations = normalizeReservations(pickListSegment(u, 'reservationsRecentes', 'ReservationsRecentes'))
  const paiements = normalizePaiements(pickListSegment(u, 'paiementsRecents', 'PaiementsRecents'))
  const voyages = normalizeVoyages(pickListSegment(u, 'voyagesClient', 'VoyagesClient'))
  const alertes = normalizeAlertes(pickListSegment(u, 'alertesClient', 'AlertesClient'))
  const resumeRaw = pickResumeFromSegment(u)
  const resume = normalizeResume(resumeRaw, stats, reservations, paiements, voyages)
  return {
    clientStatistiques: stats,
    reservationsRecentes: reservations,
    paiementsRecents: paiements,
    voyagesClient: voyages,
    alertesClient: alertes,
    resumeClient: resume,
    dateGeneration: pickVal(u, 'dateGeneration', 'DateGeneration') ?? new Date().toISOString(),
    _source: source,
  }
}

function isDashboardEffectivelyEmpty(dash) {
  if (!dash || typeof dash !== 'object') return true
  const stats = dash.clientStatistiques || {}
  const numbers = [
    stats.nombreTotalReservations,
    stats.nombreReservationsPayees,
    stats.montantTotalPaiements,
    stats.montantReservationsNonPayees,
    stats.nombreVoyages,
  ].map((v) => Number(v))
  const hasStatValue = numbers.some((n) => Number.isFinite(n) && n > 0)
  const hasRows =
    Array.isArray(dash.reservationsRecentes) && dash.reservationsRecentes.length > 0 ||
    Array.isArray(dash.paiementsRecents) && dash.paiementsRecents.length > 0 ||
    Array.isArray(dash.voyagesClient) && dash.voyagesClient.length > 0 ||
    Array.isArray(dash.alertesClient) && dash.alertesClient.length > 0
  return !hasStatValue && !hasRows
}

function resolveClientSessionIds() {
  const auth = useAuthStore()
  const user = auth.user || {}
  const hints = auth.token ? sessionHintsFromJwt(auth.token) : null
  const idClient = Number(
    user.idClient ??
      user.IdClient ??
      user.client?.idClient ??
      user.client?.IdClient ??
      auth.client?.idClient ??
      auth.client?.IdClient ??
      hints?.idClient,
  )
  const idUtilisateur = Number(user.idUtilisateur ?? user.IdUtilisateur ?? user.id ?? hints?.idUtilisateur)
  return {
    idClient: Number.isFinite(idClient) && idClient > 0 ? idClient : 0,
    idUtilisateur: Number.isFinite(idUtilisateur) && idUtilisateur > 0 ? idUtilisateur : 0,
  }
}

function sortByDateDesc(rows, keyA, keyB) {
  return [...rows].sort((a, b) => {
    const ta = new Date(a?.[keyA] ?? a?.[keyB] ?? 0).getTime()
    const tb = new Date(b?.[keyA] ?? b?.[keyB] ?? 0).getTime()
    return (Number.isFinite(tb) ? tb : 0) - (Number.isFinite(ta) ? ta : 0)
  })
}

function pickPaiementClientId(p) {
  const reservation = p?.reservation ?? p?.Reservation ?? {}
  const client = p?.client ?? p?.Client ?? {}
  return Number(
    p?.idClient ??
      p?.IdClient ??
      reservation?.idClient ??
      reservation?.IdClient ??
      client?.idClient ??
      client?.IdClient,
  )
}

function pickPaiementReservationId(p) {
  const reservation = p?.reservation ?? p?.Reservation ?? {}
  return Number(
    p?.idReservation ??
      p?.IdReservation ??
      reservation?.idReservation ??
      reservation?.IdReservation,
  )
}

function isReservationPaid(r) {
  const statutPaiement = String(r?.statutPaiement ?? r?.StatutPaiement ?? '').toLowerCase()
  const statutReservation = String(r?.statutReservation ?? r?.StatutReservation ?? '').toLowerCase()
  const montantPaye = Number(r?.montantPaye ?? r?.MontantPaye)
  const prix = Number(r?.prix ?? r?.Prix ?? r?.montantTotal ?? r?.MontantTotal)
  if (statutPaiement.includes('pay') || statutPaiement.includes('complet')) return true
  if (statutReservation.includes('pay')) return true
  if (Number.isFinite(montantPaye) && Number.isFinite(prix) && prix > 0 && montantPaye >= prix) return true
  return false
}

function toClientVoyagesFromReservations(reservations) {
  const byVoyage = new Map()
  for (const r of reservations) {
    const idVoyage = pickVal(r, 'idVoyage', 'IdVoyage')
    const key = String(idVoyage ?? pickVal(r, 'voyageInfo', 'VoyageInfo') ?? Math.random())
    if (!byVoyage.has(key)) {
      byVoyage.set(key, {
        idVoyage: idVoyage ?? null,
        referenceVoyage: pickVal(r, 'referenceVoyage', 'ReferenceVoyage'),
        dateDepart: pickVal(r, 'dateVoyage', 'DateVoyage'),
        destination:
          pickVal(r, 'destination', 'Destination') ??
          pickVal(r, 'voyageInfo', 'VoyageInfo') ??
          [pickVal(r, 'villeDepart', 'VilleDepart'), pickVal(r, 'villeArrivee', 'VilleArrivee')]
            .filter(Boolean)
            .join(' - '),
        prix: num(pickVal(r, 'prix', 'Prix', 'montantTotal', 'MontantTotal')),
        statutVoyage: pickVal(r, 'statutReservation', 'StatutReservation'),
        busInfo: pickVal(r, 'busInfo', 'BusInfo', 'numeroBus', 'NumeroBus'),
      })
    }
  }
  return Array.from(byVoyage.values())
}

async function getClientDashboardFromDomainFallback() {
  const { idClient, idUtilisateur } = resolveClientSessionIds()
  if (!idClient) throw new Error('idClient manquant pour charger les données client.')

  let reservationsRaw = []
  if (idUtilisateur > 0) {
    reservationsRaw = await listReservationsByUserAndClient(idUtilisateur, idClient)
  }
  if (!reservationsRaw.length) {
    reservationsRaw = await listReservationsByClient(idClient)
  }

  let paiementsRaw = []
  try {
    paiementsRaw = await listPaiementsByClient(idClient)
  } catch {
    paiementsRaw = []
  }
  if (!paiementsRaw.length) {
    const allPaiements = await listPaiements()
    const reservationIds = new Set(
      unwrapList(reservationsRaw)
        .map((r) => Number(r.idReservation ?? r.IdReservation))
        .filter((n) => Number.isFinite(n) && n > 0),
    )
    paiementsRaw = unwrapList(allPaiements).filter((p) => {
      const pidClient = pickPaiementClientId(p)
      const pidReservation = pickPaiementReservationId(p)
      return (
        (Number.isFinite(pidClient) && pidClient === idClient) ||
        (Number.isFinite(pidReservation) && reservationIds.has(pidReservation))
      )
    })
  }

  const reservations = normalizeReservations(sortByDateDesc(unwrapList(reservationsRaw), 'dateReservation', 'DateReservation')).slice(0, 12)
  const paiements = normalizePaiements(sortByDateDesc(unwrapList(paiementsRaw), 'datePaiement', 'DatePaiement')).slice(0, 12)
  const voyages = normalizeVoyages(toClientVoyagesFromReservations(unwrapList(reservationsRaw))).slice(0, 12)

  const totalReservations = unwrapList(reservationsRaw).length
  const totalPaidReservations = unwrapList(reservationsRaw).filter(isReservationPaid).length
  const montantTotalPaiements = unwrapList(paiementsRaw).reduce((acc, p) => acc + (num(p.montantPaye ?? p.MontantPaye) ?? 0), 0)
  const montantNonPaye = unwrapList(reservationsRaw).reduce((acc, r) => {
    const prix = num(r.prix ?? r.Prix ?? r.montantTotal ?? r.MontantTotal) ?? 0
    const paye = num(r.montantPaye ?? r.MontantPaye) ?? 0
    return acc + Math.max(0, prix - paye)
  }, 0)
  const tauxPaiement = totalReservations > 0 ? (totalPaidReservations / totalReservations) * 100 : 0

  const stats = normalizeStats({
    nombreTotalReservations: totalReservations,
    nombreReservationsPayees: totalPaidReservations,
    montantTotalPaiements,
    montantReservationsNonPayees: montantNonPaye,
    tauxPaiement,
    nombreVoyages: voyages.length,
  })

  const resume = normalizeResume(
    {
      totalReservations,
      totalPaiements: montantTotalPaiements,
      totalVoyages: voyages.length,
      derniereReservation: reservations[0]?.dateReservation,
      dernierPaiement: paiements[0]?.datePaiement,
      prochainVoyage: voyages[0]?.dateDepart,
    },
    stats,
    reservations,
    paiements,
    voyages,
  )

  return {
    clientStatistiques: stats,
    reservationsRecentes: reservations,
    paiementsRecents: paiements,
    voyagesClient: voyages,
    alertesClient: [],
    resumeClient: resume,
    dateGeneration: new Date().toISOString(),
    _source: 'client-domain-fallback',
  }
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
    apiGet(CLIENT_STAT, {}, DASH_META),
    apiGet(CLIENT_RESA, {}, DASH_META),
    apiGet(CLIENT_PAY, {}, DASH_META),
    apiGet(CLIENT_VOY, {}, DASH_META),
    apiGet(CLIENT_ALERT, {}, DASH_META),
    apiGet(CLIENT_RESUME, {}, DASH_META),
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

  return normalizeClientDashboard({
    clientStatistiques: pickStatsFromSegment(statsRaw),
    reservationsRecentes: pickListSegment(resaRaw, 'reservationsRecentes', 'ReservationsRecentes'),
    paiementsRecents: pickListSegment(payRaw, 'paiementsRecents', 'PaiementsRecents'),
    voyagesClient: pickListSegment(voyRaw, 'voyagesClient', 'VoyagesClient'),
    alertesClient: pickListSegment(alertRaw, 'alertesClient', 'AlertesClient'),
    resumeClient: pickResumeFromSegment(resumeRaw),
    dateGeneration: new Date().toISOString(),
  }, 'client-aggregate')
}

/**
 * @returns {Promise<Record<string, unknown>>}
 */
export async function getClientDashboard() {
  let firstError = null
  try {
    const raw = await apiGet(BASE, {}, DASH_META)
    const normalized = normalizeClientDashboard(raw, 'client-dashboard')
    if (!isDashboardEffectivelyEmpty(normalized)) return normalized
  } catch (e) {
    firstError = e
    const st = /** @type {{ status?: number }} */ (e)?.status
    if (!isRecoverableDashStatus(st)) throw e
  }

  try {
    const aggregated = await getClientDashboardAggregated()
    if (!isDashboardEffectivelyEmpty(aggregated)) return aggregated
  } catch (e) {
    if (!firstError) firstError = e
  }

  try {
    return await getClientDashboardFromDomainFallback()
  } catch {
    if (firstError) throw firstError
    throw new Error('ClientDashboard indisponible')
  }
}

export function getClientDashboardStatistiques() {
  return apiGet(CLIENT_STAT, {}, DASH_META).then((raw) => normalizeStats(pickStatsFromSegment(raw)))
}

export function getClientDashboardReservationsRecentes() {
  return apiGet(CLIENT_RESA, {}, DASH_META).then((raw) => normalizeReservations(raw))
}

export function getClientDashboardPaiementsRecents() {
  return apiGet(CLIENT_PAY, {}, DASH_META).then((raw) => normalizePaiements(raw))
}

export function getClientDashboardVoyagesClient() {
  return apiGet(CLIENT_VOY, {}, DASH_META).then((raw) => normalizeVoyages(raw))
}

export function getClientDashboardAlertesClient() {
  return apiGet(CLIENT_ALERT, {}, DASH_META).then((raw) => normalizeAlertes(raw))
}

export function getClientDashboardResumeClient() {
  return apiGet(CLIENT_RESUME, {}, DASH_META).then((raw) => normalizeResume(raw, {}, [], [], []))
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
