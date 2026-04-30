/**
 * API Paiement — Rusa Travel
 * GET/POST /api/Paiement · GET/PUT /api/Paiement/{id}
 * Filtres : reservation, client, société, société paginé
 */

import { apiGet, apiPost, apiPut } from './apiService'
import { API_ENDPOINTS } from './Endpoint.service'


const LIST = API_ENDPOINTS.PAIEMENT.LIST
const CREATE = API_ENDPOINTS.PAIEMENT.CREATE

/** @param {unknown} data */
export function unwrapPaiementList(data) {
  if (data == null) return []
  if (Array.isArray(data)) return data
  if (typeof data !== 'object') return []
  if (Array.isArray(data.data)) return data.data
  if (Array.isArray(data.Data)) return data.Data
  const nested = data.data && typeof data.data === 'object' ? data.data : null
  if (nested && Array.isArray(nested.data)) return nested.data
  const arr =
    data.items ??
    data.Items ??
    data.results ??
    data.value ??
    []
  return Array.isArray(arr) ? arr : []
}

/**
 * Réponse paginée ASP.NET typique.
 * @param {unknown} raw
 */
export function unwrapPaiementPaged(raw) {
  if (raw == null || typeof raw !== 'object') {
    return { items: [], totalCount: 0, pageNumber: 1, pageSize: 0 }
  }
  const r = /** @type {Record<string, unknown>} */ (raw)
  const nested = r.data ?? r.Data
  const obj = nested && typeof nested === 'object' ? /** @type {Record<string, unknown>} */ (nested) : r
  const items = unwrapPaiementList(obj.items ?? obj.Items ?? obj)
  const totalCount = Number(obj.totalCount ?? obj.TotalCount ?? obj.total ?? items.length) || items.length
  const pageNumber = Number(obj.pageNumber ?? obj.PageNumber ?? 1) || 1
  const pageSize = Number(obj.pageSize ?? obj.PageSize ?? items.length) || items.length
  return { items, totalCount, pageNumber, pageSize }
}

/**
 * Objet métier renvoyé par POST création paiement (`{ success, data: { … } }` ou corps plat).
 * @param {unknown} raw
 * @returns {Record<string, unknown> | null}
 */
export function unwrapPaiementCreateResponse(raw) {
  if (!raw || typeof raw !== 'object') return null
  const r = /** @type {Record<string, unknown>} */ (raw)
  const d = r.data ?? r.Data
  if (d && typeof d === 'object' && !Array.isArray(d)) return /** @type {Record<string, unknown>} */ (d)
  return r
}

/**
 * Billet renvoyé quand le backend applique le workflow « paiement complet → billet » (guide v1.3).
 * @param {unknown} raw — réponse POST création
 */
export function pickBilletEmisFromPaiementResponse(raw) {
  const p = unwrapPaiementCreateResponse(raw)
  if (!p) return null
  return p.billetEmis ?? p.BilletEmis ?? null
}

/**
 * @param {unknown} billet
 */
export function pickQrCodeFromBillet(billet) {
  if (!billet || typeof billet !== 'object') return ''
  const b = /** @type {Record<string, unknown>} */ (billet)
  return String(b.qrCode ?? b.QRCode ?? b.qrcode ?? '').trim()
}

/**
 * @param {unknown} raw
 */
export function hasEmittedBilletInPaiementResponse(raw) {
  const p = unwrapPaiementCreateResponse(raw)
  if (!p) return false
  const id = Number(p.idBilletEmis ?? p.IdBilletEmis)
  if (Number.isFinite(id) && id > 0) return true
  const billet = pickBilletEmisFromPaiementResponse(raw)
  return billet != null && typeof billet === 'object'
}

/**
 * @returns {Promise<unknown[]>}
 */
export function listPaiements() {
  return apiGet(LIST).then(unwrapPaiementList)
}

/**
 * @param {number|string} id
 * @returns {Promise<unknown>}
 */
export function getPaiement(id) {
  return apiGet(API_ENDPOINTS.PAIEMENT.byId(encodeURIComponent(String(id))))
}

/**
 * @param {Record<string, unknown>} body
 * @returns {Promise<unknown>}
 */
export function createPaiement(body) {
  return apiPost(CREATE, body)
}

/**
 * @param {number|string} id
 * @param {Record<string, unknown>} body
 * @returns {Promise<unknown>}
 */
export function updatePaiement(id, body) {
  return apiPut(API_ENDPOINTS.PAIEMENT.byId(encodeURIComponent(String(id))), body)
}

/**
 * @param {number|string} idReservation
 * @returns {Promise<unknown[]>}
 */
export function listPaiementsByReservation(idReservation) {
  return apiGet(API_ENDPOINTS.PAIEMENT.byReservation(encodeURIComponent(String(idReservation)))).then(unwrapPaiementList)
}

/**
 * @param {number|string} idClient
 * @returns {Promise<unknown[]>}
 */
export function listPaiementsByClient(idClient) {
  return apiGet(API_ENDPOINTS.PAIEMENT.byClient(encodeURIComponent(String(idClient)))).then(unwrapPaiementList)
}

/**
 * @param {number|string} idSociete
 * @returns {Promise<unknown[]>}
 */
export function listPaiementsBySociete(idSociete) {
  return apiGet(API_ENDPOINTS.PAIEMENT.bySociete(encodeURIComponent(String(idSociete)))).then(unwrapPaiementList)
}

/**
 * @param {number|string} idSociete
 * @param {{
 *   pageNumber?: number
 *   pageSize?: number
 *   searchTerm?: string
 *   sortBy?: string
 *   sortDescending?: boolean
 * }} [opts]
 * @returns {Promise<unknown>}
 */
export function listPaiementsSocietePaged(idSociete, opts = {}) {
  const pageNumber = Number(opts.pageNumber) > 0 ? Number(opts.pageNumber) : 1
  const pageSize = Number(opts.pageSize) > 0 ? Number(opts.pageSize) : 20
  const searchTerm = String(opts.searchTerm ?? '').trim()
  const sortBy = String(opts.sortBy ?? 'IdPaiement').trim() || 'IdPaiement'
  const sortDescending = opts.sortDescending !== false

  const q = new URLSearchParams()
  q.set('PageNumber', String(pageNumber))
  q.set('PageSize', String(pageSize))
  if (searchTerm) q.set('SearchTerm', searchTerm)
  q.set('SortBy', sortBy)
  q.set('SortDescending', sortDescending ? 'true' : 'false')

  const path = `${API_ENDPOINTS.PAIEMENT.bySocietePaged(encodeURIComponent(String(idSociete)))}?${q.toString()}`
  return apiGet(path)
}

/**
 * Normalise un enregistrement API → ligne UI admin.
 * @param {unknown} raw
 */
export function mapPaiementRow(raw) {
  const p = raw && typeof raw === 'object' ? /** @type {Record<string, unknown>} */ (raw) : {}
  const id = Number(p.idPaiement ?? p.IdPaiement) || 0
  const idReservation = Number(p.idReservation ?? p.IdReservation) || 0
  const idUtilisateur = Number(p.idUtilisateur ?? p.IdUtilisateur) || 0
  const idSociete = Number(p.idSociete ?? p.IdSociete) || 0
  const montantPaye = Number(p.montantPaye ?? p.MontantPaye) || 0
  const montantAPaye = Number(p.montantAPaye ?? p.MontantAPaye) || 0
  const resteAPaye = Number(p.resteAPaye ?? p.ResteAPaye ?? p.resteAPayeCalcule ?? p.ResteAPayeCalcule) || 0
  const methode = String(p.methodePaiement ?? p.MethodePaiement ?? '').trim()
  const refTx = String(p.referenceTransaction ?? p.ReferenceTransaction ?? '').trim()
  const statutRaw = p.statut ?? p.Statut
  const statutBool = typeof statutRaw === 'boolean' ? statutRaw : statutRaw === true || String(statutRaw).toLowerCase() === 'true'
  /** @type {'completed' | 'pending' | 'failed'} */
  let status = 'pending'
  if (statutBool) status = 'completed'
  else if (String(p.statutPaiement ?? p.StatutPaiement ?? '').toLowerCase().includes('échou')) status = 'failed'

  const dateSrc = p.datePaiement ?? p.DatePaiement ?? p.dateCreation ?? p.DateCreation ?? ''
  const d = dateSrc ? new Date(String(dateSrc)) : null
  const dateOk = d && !Number.isNaN(d.getTime())
  const dateStr = dateOk ? d.toLocaleDateString('fr-FR') : '—'
  const timeStr = dateOk ? d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : ''

  const util = p.utilisateur ?? p.Utilisateur ?? p.client ?? p.Client
  let clientName = '—'
  let clientEmail = ''
  if (util && typeof util === 'object') {
    const u = /** @type {Record<string, unknown>} */ (util)
    clientName =
      String(u.nomComplet ?? u.NomComplet ?? u.nomClient ?? u.NomClient ?? u.name ?? '').trim() || clientName
    clientEmail = String(u.email ?? u.Email ?? '').trim()
  }
  if (clientName === '—') {
    const prenom = String(p.prenomClient ?? p.PrenomClient ?? '').trim()
    const nom = String(p.nomClient ?? p.NomClient ?? '').trim()
    const full = [prenom, nom].filter(Boolean).join(' ').trim()
    if (full) clientName = full
  }
  if (!clientEmail) {
    clientEmail = String(
      p.emailClient ??
        p.EmailClient ??
        p.emailUtilisateur ??
        p.EmailUtilisateur ??
        p.telephoneClient ??
        p.TelephoneClient ??
        '',
    ).trim()
  }

  const billetEmis = p.billetEmis ?? p.BilletEmis ?? null
  const idBilletEmis = Number(p.idBilletEmis ?? p.IdBilletEmis) || 0
  const dateEmissionBilletRaw = String(p.dateEmissionBillet ?? p.DateEmissionBillet ?? '').trim()
  const dateEmissionBilletObj = dateEmissionBilletRaw ? new Date(dateEmissionBilletRaw) : null
  const dateEmissionBillet =
    dateEmissionBilletObj && !Number.isNaN(dateEmissionBilletObj.getTime())
      ? dateEmissionBilletObj.toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })
      : dateEmissionBilletRaw
  const estComplet = Boolean(p.estComplet ?? p.EstComplet ?? false)
  const estPartiel = Boolean(p.estPartiel ?? p.EstPartiel ?? false)

  return {
    id,
    raw: p,
    billetEmis,
    idBilletEmis,
    transactionId: refTx || `—`,
    clientName: clientName !== '—' ? clientName : 'Client inconnu',
    clientEmail,
    reservationId: idReservation,
    tripRoute: String(p.libelleTrajet ?? p.LibelleTrajet ?? p.voyageInfo ?? p.VoyageInfo ?? '').trim() || '—',
    amount: montantPaye,
    montantAPaye,
    resteAPaye,
    method: methode || 'autre',
    date: dateStr,
    time: timeStr,
    status,
    statutBool,
    estComplet,
    estPartiel,
    dateEmissionBillet,
    idSociete,
  }
}

/**
 * Corps POST/PUT aligné Swagger.
 * @param {object} input
 */
export function buildPaiementBody(input) {
  const {
    montantAPaye,
    montantPaye,
    methodePaiement,
    referenceTransaction,
    statut,
    idUtilisateur,
    idReservation,
    idSociete,
  } = input
  return {
    montantAPaye: Number(montantAPaye) || 0,
    montantPaye: Number(montantPaye) || 0,
    methodePaiement: String(methodePaiement || '').trim(),
    referenceTransaction: String(referenceTransaction || '').trim(),
    statut: Boolean(statut),
    idUtilisateur: Number(idUtilisateur) || 0,
    idReservation: Number(idReservation) || 0,
    idSociete: Number(idSociete) || 0,
  }
}

export function paiementRawToPutBody(raw, patch = {}) {
  const p = raw && typeof raw === 'object' ? /** @type {Record<string, unknown>} */ (raw) : {}
  const base = buildPaiementBody({
    montantAPaye: p.montantAPaye ?? p.MontantAPaye ?? 0,
    montantPaye: p.montantPaye ?? p.MontantPaye ?? 0,
    methodePaiement: p.methodePaiement ?? p.MethodePaiement ?? '',
    referenceTransaction: p.referenceTransaction ?? p.ReferenceTransaction ?? '',
    statut: p.statut ?? p.Statut ?? false,
    idUtilisateur: p.idUtilisateur ?? p.IdUtilisateur ?? 0,
    idReservation: p.idReservation ?? p.IdReservation ?? 0,
    idSociete: p.idSociete ?? p.IdSociete ?? 0,
  })
  return { ...base, ...patch }
}
