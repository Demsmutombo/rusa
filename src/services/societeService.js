/**
 * API Société (agence de transport) — Rusa Travel
 * Base : /api/Societe
 */

import { useAuthStore } from '@/stores/auth'
import { scopeEntitiesToUserSociete } from '@/utils/societeIsolation'
import { apiGet, apiPost, apiPut, apiDelete } from './apiService'

/** Aligné Swagger (souvent text/plain + corps JSON). */
const JSON_ACCEPT = {
  headers: {
    Accept: 'application/json, text/plain;q=0.9, */*;q=0.8',
  },
}

/** Réponse GET collection : tableau brut ou enveloppe { data, items, … } */
export function unwrapSocieteList(data) {
  if (data == null) return []
  if (Array.isArray(data)) return data
  const arr =
    data.data ?? data.items ?? data.results ?? data.societes ?? data.value ?? []
  return Array.isArray(arr) ? arr : []
}

/**
 * Corps POST /api/Societe (création agence)
 */
export function normalizeSocieteCreate(input) {
  const t = (v) => (v == null || v === '' ? null : String(v).trim())
  return {
    nom: String(input.nom || '').trim(),
    devise: t(input.devise),
    type: t(input.type),
    logo: t(input.logo),
    telephone: t(input.telephone),
    emailContact: t(input.emailContact),
    siteWeb: t(input.siteWeb),
    nomCompletResponsable: t(input.nomCompletResponsable),
    genreResponsable: t(input.genreResponsable),
    description: t(input.description),
    statut: input.statut !== false,
    adresseResidence: t(input.adresseResidence),
  }
}

/**
 * Corps PUT /api/Societe/{id} (sans forcer statut si non fourni)
 */
export function normalizeSocieteUpdate(input) {
  const sid = Number(input.idSociete)
  const base = normalizeSocieteCreate(input)
  const body = {
    idSociete: Number.isFinite(sid) ? sid : 0,
    nom: base.nom,
    devise: base.devise,
    type: base.type,
    logo: base.logo,
    telephone: base.telephone,
    emailContact: base.emailContact,
    siteWeb: base.siteWeb,
    nomCompletResponsable: base.nomCompletResponsable,
    genreResponsable: base.genreResponsable,
    description: base.description,
    adresseResidence: base.adresseResidence,
  }
  if (input.statut !== undefined) body.statut = input.statut
  return body
}

export function listSocietes() {
  return apiGet('/api/Societe', JSON_ACCEPT)
}

/** Liste toujours sous forme de tableau */
export async function listSocietesArray() {
  const raw = await listSocietes()
  let list = unwrapSocieteList(raw)
  try {
    const auth = useAuthStore()
    list = scopeEntitiesToUserSociete(list, {
      role: auth.role,
      societeId: auth.societeId,
    })
  } catch {
    /* Pinia non prêt */
  }
  return list
}

/**
 * Fusionne la fiche `GET /api/Societe` avec les stats `societes[]` du dashboard Super-Admin.
 * @param {Array<object>} apiList
 * @param {Array<object> | undefined} dashboardRows
 * @returns {Array<object>}
 */
export function mergeSocietesWithDashboardStats(apiList, dashboardRows) {
  const dashById = new Map(
    (dashboardRows || []).map((s) => [Number(s.idSociete), s])
  )
  const seen = new Set()
  const rows = []
  for (const api of apiList || []) {
    const id = Number(api?.idSociete)
    if (!Number.isFinite(id)) continue
    seen.add(id)
    rows.push(mergeSocieteDashboardRow(api, dashById.get(id)))
  }
  for (const d of dashboardRows || []) {
    const id = Number(d?.idSociete)
    if (!Number.isFinite(id) || seen.has(id)) continue
    seen.add(id)
    rows.push(mergeSocieteDashboardRow(null, d))
  }
  return rows
}

function mergeSocieteDashboardRow(api, dash) {
  const a = api || {}
  const s = dash || {}
  const id = Number(a.idSociete ?? s.idSociete)
  return {
    idSociete: id,
    nom: a.nom || s.nom || '—',
    type: a.type || s.type || '—',
    devise: a.devise ?? s.devise ?? '',
    statut:
      a.statut !== undefined && a.statut !== null ? Boolean(a.statut) : s.statut !== false,
    telephone: a.telephone ?? '',
    emailContact: a.emailContact ?? '',
    siteWeb: a.siteWeb ?? '',
    nomCompletResponsable: a.nomCompletResponsable ?? '',
    description: a.description ?? '',
    logo: a.logo ?? null,
    genreResponsable: a.genreResponsable ?? '',
    adresseResidence: a.adresseResidence ?? null,
    nombreClientsActifs: s.nombreClientsActifs,
    chiffreAffairesMois: s.chiffreAffairesMois,
    montantArrieres: s.montantArrieres,
    tauxRecouvrement: s.tauxRecouvrement,
    nombreUtilisateurs: s.nombreUtilisateurs,
    derniereActivite: s.derniereActivite ?? null,
    scorePerformance: s.scorePerformance,
  }
}

export function getSociete(id) {
  return apiGet(`/api/Societe/${id}`, JSON_ACCEPT)
}

export function createSociete(body) {
  return apiPost('/api/Societe', normalizeSocieteCreate(body))
}

export function updateSociete(id, body) {
  return apiPut(`/api/Societe/${id}`, normalizeSocieteUpdate(body))
}

export function deleteSociete(id) {
  return apiDelete(`/api/Societe/${id}`)
}

/** Objet unique pour imports style guide projet */
export const societeService = {
  getAll: listSocietes,
  getAllArray: listSocietesArray,
  unwrapList: unwrapSocieteList,
  mergeWithDashboard: mergeSocietesWithDashboardStats,
  getById: getSociete,
  create: createSociete,
  update: updateSociete,
  delete: deleteSociete,
}
