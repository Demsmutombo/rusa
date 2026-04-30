/**
 * API GerantDashboard — Rusa Travel
 * Contrat principal : GET /api/GerantDashboard (payload unifié).
 * Repli : GET /Dashboard/{idSociete}, puis sous-routes kebab-case + rétrocompat /statistiques, /alertes.
 */

import { apiGet } from './apiService'
import { API_ENDPOINTS } from './Endpoint.service'

const DASH_BY_SOC = API_ENDPOINTS.DASHBOARD.bySociete
const BASE = API_ENDPOINTS.DASHBOARD.GERANT
const GERANT_BY_SOC = API_ENDPOINTS.DASHBOARD.GERANT_BY_SOCIETE
const STAT = API_ENDPOINTS.DASHBOARD.GERANT_STATISTIQUES
const ALERT = API_ENDPOINTS.DASHBOARD.GERANT_ALERTES
const SOC_STATS = API_ENDPOINTS.DASHBOARD.GERANT_SOCIETE_STATS
const CLI_STATS = API_ENDPOINTS.DASHBOARD.GERANT_CLIENTS_STATS
const TOP_CA = API_ENDPOINTS.DASHBOARD.GERANT_TOP_CA
const TOP_ARR = API_ENDPOINTS.DASHBOARD.GERANT_TOP_ARRIERES
const ALERT_SOC = API_ENDPOINTS.DASHBOARD.GERANT_ALERTES_SOCIETE
const TEND = API_ENDPOINTS.DASHBOARD.GERANT_TENDANCES
const PAY_STATS = API_ENDPOINTS.DASHBOARD.GERANT_PAIEMENTS_STATS
const STAT_LEGACY = API_ENDPOINTS.DASHBOARD.GERANT_STATISTIQUES_LEGACY
const ALERT_LEGACY = API_ENDPOINTS.DASHBOARD.GERANT_ALERTES_LEGACY
const STATS_GENERALES = API_ENDPOINTS.STATISTIQUES.GENERALES
const STATS_FINANCIERES = API_ENDPOINTS.STATISTIQUES.FINANCIERES
const STATS_OPERATIONNELLES = API_ENDPOINTS.STATISTIQUES.OPERATIONNELLES
const STATS_PERFORMANCE = API_ENDPOINTS.STATISTIQUES.PERFORMANCE
const STATS_CONSOLIDEES = API_ENDPOINTS.STATISTIQUES.CONSOLIDEES

/**
 * null: inconnu, true: sous-routes kebab disponibles, false: non disponibles (404).
 * Évite de spammer la console avec des 404 à chaque chargement dashboard.
 * @type {null | boolean}
 */
let HAS_GERANT_KNOWN_SUBROUTES = null

/** Erreurs GET principal pour lesquelles on tente les sous-routes (agrégat partiel). */
function isRecoverableMainDashFailure(status) {
  if (status == null || status === 0) return true
  return status === 500 || status === 502 || status === 503 || status === 404 || status === 403
}

/**
 * Réponse GET /api/GerantDashboard (contrat unifié : societeStatistiques, clientsStatistiques, …).
 * @param {unknown} data
 */
function isGerantDashboardPayload(data) {
  if (data == null || typeof data !== 'object' || Array.isArray(data)) return false
  const soc = data.societeStatistiques ?? data.SocieteStatistiques
  const cli = data.clientsStatistiques ?? data.ClientsStatistiques
  if (soc != null && typeof soc === 'object' && !Array.isArray(soc)) return true
  if (cli != null && typeof cli === 'object' && !Array.isArray(cli)) return true
  if (Array.isArray(data.alertesSociete) || Array.isArray(data.AlertesSociete)) return true
  const tend = data.tendances ?? data.Tendances
  if (tend != null && typeof tend === 'object' && !Array.isArray(tend)) return true
  const pay = data.paiementsStatistiques ?? data.PaiementsStatistiques
  if (pay != null && typeof pay === 'object' && !Array.isArray(pay)) return true
  return false
}

/**
 * Détecte un payload "techniquement valide" mais inutilisable (zéros / listes vides partout).
 * @param {Record<string, unknown>} data
 */
function isGerantDashboardEffectivelyEmpty(data) {
  const soc = data.societeStatistiques ?? data.SocieteStatistiques ?? {}
  const cli = data.clientsStatistiques ?? data.ClientsStatistiques ?? {}
  const pay = data.paiementsStatistiques ?? data.PaiementsStatistiques ?? {}
  const tend = data.tendances ?? data.Tendances ?? {}
  const alerts = unwrapList(data.alertesSociete ?? data.AlertesSociete)

  const numericVals = [
    soc.totalClients,
    soc.TotalClients,
    soc.clientsActifs,
    soc.ClientsActifs,
    soc.revenusTransportMois,
    soc.RevenusTransportMois,
    soc.chiffreAffairesMois,
    soc.ChiffreAffairesMois,
    soc.tauxRecouvrement,
    soc.TauxRecouvrement,
    cli.totalClients,
    cli.TotalClients,
    cli.clientsActifs,
    cli.ClientsActifs,
    cli.nouveauxClientsMois,
    cli.NouveauxClientsMois,
    pay.paiementsMois,
    pay.PaiementsMois,
    pay.nombrePaiementsMois,
    pay.NombrePaiementsMois,
  ]
  const hasPositiveMetric = numericVals.some((v) => {
    const parsed = Number(v)
    return Number.isFinite(parsed) && parsed > 0
  })

  const hasTrendRows =
    unwrapList(tend.evolutionChiffreAffaires ?? tend.EvolutionChiffreAffaires).length > 0 ||
    unwrapList(tend.evolutionTauxRecouvrement ?? tend.EvolutionTauxRecouvrement).length > 0 ||
    unwrapList(tend.evolutionNombreClients ?? tend.EvolutionNombreClients).length > 0 ||
    unwrapList(tend.evolutionMontantArrieres ?? tend.EvolutionMontantArrieres).length > 0

  if (alerts.length > 0) return false
  if (hasTrendRows) return false
  return !hasPositiveMetric
}

/** @param {unknown} raw */
export function unwrapList(data) {
  if (data == null) return []
  if (Array.isArray(data)) return data
  if (typeof data !== 'object') return []
  const arr = data.data ?? data.items ?? data.results ?? data.value ?? []
  return Array.isArray(arr) ? arr : []
}

/**
 * @param {unknown} raw
 * @param {number} [depth]
 */
export function unwrapGerantDashboardPayload(raw, depth = 0) {
  if (raw == null || depth > 6) return {}
  if (typeof raw !== 'object' || Array.isArray(raw)) return {}

  const inner =
    raw.data != null && typeof raw.data === 'object' && !Array.isArray(raw.data)
      ? raw.data
      : raw.result != null && typeof raw.result === 'object' && !Array.isArray(raw.result)
        ? raw.result
        : raw

  if (inner !== raw && inner != null && typeof inner === 'object' && !Array.isArray(inner)) {
    return unwrapGerantDashboardPayload(inner, depth + 1)
  }
  return inner
}

/** @param {unknown} raw */
function pickSocieteBlock(raw) {
  const u = unwrapGerantDashboardPayload(raw)
  if (!u || typeof u !== 'object') return {}
  if (u.societeStatistiques && typeof u.societeStatistiques === 'object') return u.societeStatistiques
  if (u.SocieteStatistiques && typeof u.SocieteStatistiques === 'object') return u.SocieteStatistiques
  return u
}

function n(v) {
  const x = Number(v)
  return Number.isFinite(x) ? x : null
}

function pickNum(...values) {
  for (const v of values) {
    const parsed = n(v)
    if (parsed != null) return parsed
  }
  return null
}

function toRows(list, valueKey, variationKey = null) {
  return unwrapList(list).map((row) => ({
    mois: row.mois ?? row.Mois ?? '',
    valeur: n(row?.[valueKey]) ?? n(row?.[String(valueKey).replace(/^./, (c) => c.toUpperCase())]) ?? 0,
    variation:
      variationKey == null
        ? 0
        : n(row?.[variationKey]) ?? n(row?.[String(variationKey).replace(/^./, (c) => c.toUpperCase())]) ?? 0,
  }))
}

function mapConsolideesToGerantPayload(cons) {
  const gener = cons?.generales ?? cons?.Generales ?? {}
  const fin = cons?.financieres ?? cons?.Financieres ?? {}
  const op = cons?.operationnelles ?? cons?.Operationnelles ?? {}
  const perf = cons?.performance ?? cons?.Performance ?? {}
  const clientAct = op?.clientActivite ?? op?.ClientActivite ?? {}
  const evoFin = unwrapList(fin?.evolutionMensuelle ?? fin?.EvolutionMensuelle)
  const lastEvo = evoFin.length ? evoFin[evoFin.length - 1] : {}

  return {
    societeStatistiques: {
      totalClients: pickNum(gener.totalClients, gener.TotalClients, clientAct.totalClients, clientAct.TotalClients),
      clientsActifs: pickNum(
        clientAct.nombreClientsActifs,
        clientAct.NombreClientsActifs,
        clientAct.nombreActifs,
        clientAct.NombreActifs,
      ),
      // CA strictement dynamique depuis l'API Statistiques.
      revenusTransportMois: pickNum(
        fin.chiffreAffaires,
        fin.ChiffreAffaires,
        fin.montantPaye,
        fin.MontantPaye,
        gener.totalPaiements,
        gener.TotalPaiements,
      ),
      montantTotalArrieres: pickNum(gener.totalArrieres, gener.TotalArrieres, fin.montantArrieres, fin.MontantArrieres),
      tauxRecouvrement: pickNum(gener.tauxRecouvrement, gener.TauxRecouvrement, perf.tauxRecouvrementGlobal, perf.TauxRecouvrementGlobal),
      totalReservationsMois: pickNum(lastEvo.nombreFactures, lastEvo.NombreFactures),
      totalReservationsPayeesMois: pickNum(lastEvo.nombrePaiements, lastEvo.NombrePaiements),
      dateGeneration:
        gener.dateGeneration ?? fin.dateGeneration ?? op.dateGeneration ?? perf.dateGeneration ?? cons?.dateGeneration,
    },
    clientsStatistiques: {
      totalClients: pickNum(gener.totalClients, gener.TotalClients, clientAct.totalClients, clientAct.TotalClients),
      clientsActifs: pickNum(clientAct.nombreClientsActifs, clientAct.NombreClientsActifs),
      nouveauxClientsMois: null,
      clientsAvecArrieres: null,
      pourcentageClientsAvecArrieres: null,
      repartitionParCategorie: unwrapList(op?.repartitionClientsParCategorie ?? op?.RepartitionClientsParCategorie).map(
        (r) => ({
          categorie: r.nomCategorie ?? r.NomCategorie ?? '—',
          nombreClients: n(r.nombreClients) ?? 0,
          pourcentage: n(r.pourcentage) ?? 0,
        }),
      ),
    },
    top5ClientsCA: [],
    top5ClientsArrieres: [],
    alertesSociete: [],
    tendances: {
      evolutionChiffreAffaires: toRows(fin?.evolutionMensuelle ?? fin?.EvolutionMensuelle, 'montantFactures'),
      evolutionTauxRecouvrement: toRows(perf?.performanceMensuelle ?? perf?.PerformanceMensuelle, 'tauxRecouvrement'),
      evolutionNombreClients: [],
      evolutionMontantArrieres: toRows(fin?.evolutionMensuelle ?? fin?.EvolutionMensuelle, 'montantArrieres'),
    },
    paiementsStatistiques: {
      paiementsMois: pickNum(gener.totalPaiements, gener.TotalPaiements, fin.montantPaye, fin.MontantPaye),
      nombrePaiementsMois: pickNum(gener.totalPaiementsCount, gener.TotalPaiementsCount),
      moyennePaiementsJournaliers: null,
    },
    dateGeneration:
      cons?.dateGeneration ?? gener?.dateGeneration ?? fin?.dateGeneration ?? op?.dateGeneration ?? perf?.dateGeneration,
  }
}

async function getStatistiquesConsolidees(idSociete) {
  if (!Number.isFinite(Number(idSociete)) || Number(idSociete) <= 0) return null
  try {
    const raw = await apiGet(STATS_CONSOLIDEES(idSociete))
    const cons = unwrapGerantDashboardPayload(raw)
    if (cons && typeof cons === 'object' && !Array.isArray(cons)) {
      return {
        ...mapConsolideesToGerantPayload(cons),
        _source: 'statistiques-consolidees',
        _partialFromSubroutes: true,
      }
    }
  } catch {
    // fallback multi-endpoints
  }
  const settled = await Promise.allSettled([
    apiGet(STATS_GENERALES(idSociete)),
    apiGet(STATS_FINANCIERES(idSociete)),
    apiGet(STATS_OPERATIONNELLES(idSociete)),
    apiGet(STATS_PERFORMANCE(idSociete)),
  ])
  if (!settled.some((s) => s.status === 'fulfilled')) return null
  const [gR, fR, oR, pR] = settled
  const cons = {
    generales: gR.status === 'fulfilled' ? unwrapGerantDashboardPayload(gR.value) : {},
    financieres: fR.status === 'fulfilled' ? unwrapGerantDashboardPayload(fR.value) : {},
    operationnelles: oR.status === 'fulfilled' ? unwrapGerantDashboardPayload(oR.value) : {},
    performance: pR.status === 'fulfilled' ? unwrapGerantDashboardPayload(pR.value) : {},
  }
  return {
    ...mapConsolideesToGerantPayload(cons),
    _source: 'statistiques-fragmented',
    _partialFromSubroutes: true,
  }
}

/** @returns {Promise<Record<string, unknown>>} */
async function getGerantDashboardAggregated(idSociete) {
  const fromLegacy = async () => {
    const statsConsolidees = await getStatistiquesConsolidees(idSociete)
    if (statsConsolidees) return statsConsolidees
    const legacySettled = await Promise.allSettled([apiGet(STAT_LEGACY), apiGet(ALERT_LEGACY)])
    if (!legacySettled.some((s) => s.status === 'fulfilled')) {
      const fallbackSettled = await Promise.allSettled([apiGet(STAT), apiGet(ALERT)])
      if (!fallbackSettled.some((s) => s.status === 'fulfilled')) {
        const rej =
          legacySettled.find((s) => s.status === 'rejected') ?? fallbackSettled.find((s) => s.status === 'rejected')
        throw rej?.reason ?? new Error('GerantDashboard indisponible')
      }
      const [statsR, alertR] = fallbackSettled
      const statsRaw = statsR.status === 'fulfilled' ? statsR.value : null
      const alertRaw = alertR.status === 'fulfilled' ? alertR.value : null
      return {
        societeStatistiques: statsRaw != null ? pickSocieteBlock(statsRaw) : {},
        clientsStatistiques: {},
        top5ClientsCA: [],
        top5ClientsArrieres: [],
        alertesSociete: alertRaw != null ? unwrapList(alertRaw) : [],
        tendances: {},
        paiementsStatistiques: {},
        dateGeneration: new Date().toISOString(),
        _partialFromSubroutes: true,
      }
    }
    const [legacyStatsR, legacyAlertR] = legacySettled
    const statsRaw = legacyStatsR.status === 'fulfilled' ? legacyStatsR.value : null
    const alertRaw = legacyAlertR.status === 'fulfilled' ? legacyAlertR.value : null
    return {
      societeStatistiques: statsRaw != null ? pickSocieteBlock(statsRaw) : {},
      clientsStatistiques: {},
      top5ClientsCA: [],
      top5ClientsArrieres: [],
      alertesSociete: alertRaw != null ? unwrapList(alertRaw) : [],
      tendances: {},
      paiementsStatistiques: {},
      dateGeneration: new Date().toISOString(),
      _partialFromSubroutes: true,
      _legacyStatistiquesAlertes: true,
    }
  }

  if (HAS_GERANT_KNOWN_SUBROUTES === false) {
    return fromLegacy()
  }

  // Probe unique pour détecter l'absence des sous-routes modernes.
  if (HAS_GERANT_KNOWN_SUBROUTES == null) {
    try {
      await apiGet(SOC_STATS)
      HAS_GERANT_KNOWN_SUBROUTES = true
    } catch (e) {
      const st = /** @type {{ status?: number }} */ (e)?.status
      if (st === 404) {
        HAS_GERANT_KNOWN_SUBROUTES = false
        return fromLegacy()
      }
      HAS_GERANT_KNOWN_SUBROUTES = true
    }
  }

  const settled = await Promise.allSettled([
    apiGet(SOC_STATS),
    apiGet(CLI_STATS),
    apiGet(TOP_CA),
    apiGet(TOP_ARR),
    apiGet(ALERT_SOC),
    apiGet(TEND),
    apiGet(PAY_STATS),
  ])
  const [socR, cliR, topCaR, topArrR, alertSocR, tendR, payR] = settled
  if (!settled.some((s) => s.status === 'fulfilled')) {
    const all404 = settled
      .filter((s) => s.status === 'rejected')
      .every((s) => (/** @type {{ reason?: { status?: number } }} */ (s)).reason?.status === 404)
    if (all404) HAS_GERANT_KNOWN_SUBROUTES = false
    return fromLegacy()
  }

  const socRaw = socR.status === 'fulfilled' ? socR.value : null
  const cliRaw = cliR.status === 'fulfilled' ? cliR.value : null
  const topCaRaw = topCaR.status === 'fulfilled' ? topCaR.value : null
  const topArrRaw = topArrR.status === 'fulfilled' ? topArrR.value : null
  const alertSocRaw = alertSocR.status === 'fulfilled' ? alertSocR.value : null
  const tendRaw = tendR.status === 'fulfilled' ? tendR.value : null
  const payRaw = payR.status === 'fulfilled' ? payR.value : null

  return {
    societeStatistiques: socRaw != null ? pickSocieteBlock(socRaw) : {},
    clientsStatistiques: cliRaw != null ? unwrapGerantDashboardPayload(cliRaw) : {},
    top5ClientsCA: topCaRaw != null ? unwrapList(topCaRaw) : [],
    top5ClientsArrieres: topArrRaw != null ? unwrapList(topArrRaw) : [],
    alertesSociete: alertSocRaw != null ? unwrapList(alertSocRaw) : [],
    tendances: tendRaw != null ? unwrapGerantDashboardPayload(tendRaw) : {},
    paiementsStatistiques: payRaw != null ? unwrapGerantDashboardPayload(payRaw) : {},
    dateGeneration: new Date().toISOString(),
    _partialFromSubroutes: true,
  }
}

/**
 * GET /api/GerantDashboard (contrat principal unifié) ; en échec récupérable → GET /Dashboard/{idSociete} puis agrégats sous-routes.
 * @param {number | string | null | undefined} idSociete
 * @returns {Promise<Record<string, unknown>>}
 */
export async function fetchGerantDashboard(idSociete) {
  const idn = idSociete != null ? Number(idSociete) : NaN
  const hasSoc = Number.isFinite(idn) && idn > 0

  /** @type {unknown} */
  let lastGerantOrDashError = null

  try {
    const raw = await apiGet(BASE)
    const data = unwrapGerantDashboardPayload(raw)
    if (data && typeof data === 'object' && !Array.isArray(data) && isGerantDashboardPayload(data)) {
      if (hasSoc && isGerantDashboardEffectivelyEmpty(data)) {
        const statsConsolidees = await getStatistiquesConsolidees(idn)
        if (statsConsolidees) {
          return {
            ...statsConsolidees,
            _source: 'statistiques-consolidees',
            _gerantDashboardPrimaryFailed: false,
          }
        }
      }
      return { ...data, _source: 'gerant-dashboard' }
    }
  } catch (e) {
    lastGerantOrDashError = e
    const st = /** @type {{ status?: number }} */ (e)?.status
    if (!isRecoverableMainDashFailure(st)) throw e
  }

  // Priorité au contrat GerantDashboard moderne via endpoints spécifiques,
  // avant de retomber sur le dashboard société legacy.
  try {
    const agg = await getGerantDashboardAggregated(hasSoc ? idn : undefined)
    if (agg && typeof agg === 'object') {
      return {
        ...agg,
        _source: 'gerant-aggregate',
        _gerantDashboardPrimaryFailed: true,
      }
    }
  } catch {
    /* continuer vers fallback legacy */
  }

  if (hasSoc) {
    try {
      const raw = await apiGet(GERANT_BY_SOC(idn))
      const data = unwrapGerantDashboardPayload(raw)
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        return {
          ...data,
          _source: 'societe-dashboard',
          idSociete: idn,
          _fallbackAfterGerantDashboard: true,
        }
      }
    } catch (e) {
      try {
        const raw = await apiGet(DASH_BY_SOC(idn))
        const data = unwrapGerantDashboardPayload(raw)
        if (data && typeof data === 'object' && !Array.isArray(data)) {
          return {
            ...data,
            _source: 'societe-dashboard',
            idSociete: idn,
            _fallbackAfterGerantDashboard: true,
          }
        }
      } catch (e2) {
        lastGerantOrDashError = e2
        const st = /** @type {{ status?: number }} */ (e2)?.status
        if (!isRecoverableMainDashFailure(st)) throw e2
      }
    }
  }

  try {
    const agg = await getGerantDashboardAggregated(hasSoc ? idn : undefined)
    return {
      ...agg,
      _source: 'gerant-aggregate',
      _dashboardSocieteFallback: hasSoc,
      _gerantDashboardPrimaryFailed: true,
    }
  } catch {
    throw lastGerantOrDashError ?? new Error('GerantDashboard indisponible')
  }
}

/** @returns {Promise<Record<string, unknown>>} */
export function fetchGerantSocieteStatistiques() {
  return apiGet(STAT).then(unwrapGerantDashboardPayload)
}

/** @returns {Promise<Record<string, unknown>>} */
export function fetchGerantClientsStatistiques() {
  return apiGet(CLI_STATS).then(unwrapGerantDashboardPayload)
}
