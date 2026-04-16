/**
 * API Agent (employé d’une société) — Rusa Travel
 * Base : /api/Agent — lié à idSociete ; compte login via /api/Utilisateur séparément
 */

import { resolveApiUrl } from '@/config/apiOrigin'
import { slugifyRoleName } from '@/config/roles'
import { useAuthStore } from '@/stores/auth'
import { assertRowBelongsToUserSociete, scopeEntitiesToUserSociete } from '@/utils/societeIsolation'
import { apiGet, apiPost, apiPut } from './apiService'

const JSON_ACCEPT = {
  headers: {
    Accept: 'text/plain, application/json;q=0.9, */*;q=0.8',
  },
}

/** URL absolue pour afficher `photoUrl` (chemins relatifs préfixés avec l’origine API). */
export function resolveAgentPhotoUrl(photoUrl) {
  const s = String(photoUrl ?? '').trim()
  if (!s) return null
  if (/^data:/i.test(s)) return s
  if (/^https?:\/\//i.test(s)) return s
  const path = s.startsWith('/') ? s : `/${s}`
  return resolveApiUrl(path)
}

/** Photo sur une ligne agent / détail (camelCase ou PascalCase API). */
export function pickAgentPhotoUrl(row) {
  if (!row || typeof row !== 'object') return null
  const v =
    row.photoUrl ??
    row.PhotoUrl ??
    row.photoURL ??
    row.urlPhoto ??
    row.UrlPhoto ??
    row.photo ??
    row.Photo
  if (v == null || v === '') return null
  return String(v).trim() || null
}

export function unwrapAgentList(data) {
  if (data == null) return []
  if (Array.isArray(data)) return data
  if (typeof data === 'object' && data.idAgent != null) return [data]
  const arr =
    data.data ?? data.items ?? data.results ?? data.agents ?? data.value ?? []
  return Array.isArray(arr) ? arr : []
}

/**
 * Profil agent connecté : GET /api/Agent/{id} si possible, sinon GET /api/Agent (liste)
 * puis correspondance par idAgent ou email (ne pas prendre un agent au hasard).
 *
 * @param {number|string|null|undefined} idAgentHint — ex. claim IdAgent du JWT
 * @param {string|null|undefined} emailHint — ex. email utilisateur pour secours
 */
export async function resolveAgentForUser(idAgentHint, emailHint) {
  const id = Number(idAgentHint)
  if (Number.isFinite(id) && id > 0) {
    try {
      const one = await getAgent(id)
      if (one && one.idAgent != null) {
        try {
          const auth = useAuthStore()
          if (
            !assertRowBelongsToUserSociete(one, {
              role: auth.role,
              societeId: auth.societeId,
            })
          ) {
            return null
          }
        } catch {
          /* Pinia non prêt */
        }
        return one
      }
    } catch {
      /* API peut n’exposer que GET /api/Agent (collection) */
    }
  }
  const raw = await listAgents()
  const list = unwrapAgentList(raw)
  if (Number.isFinite(id) && id > 0 && list.length) {
    const found = list.find((a) => Number(a.idAgent) === id)
    if (found) return found
  }
  const em = String(emailHint || '')
    .trim()
    .toLowerCase()
  if (em && list.length) {
    const byEmail = list.find(
      (a) => String(a.emailAgent || '').trim().toLowerCase() === em
    )
    if (byEmail) return byEmail
  }
  return null
}

/**
 * Noms `nom` exacts renvoyés par GET /api/Role (ex. dev-rusatravel).
 * Les libellés UI (Administrateur, Manager Général…) sont convertis avant POST/PUT Agent.
 */
const ROLE_AGENT_API_BY_SLUG = {
  administrateur: 'Admin',
  admin: 'Admin',
  superadmin: 'Super-Admin',
  superadministrateur: 'Super-Admin',
  client: 'Client',
  caissier: 'Caissier',
  financier: 'Financier',
  gerant: 'Gerant',
  managergeneral: 'Gerant',
}

export function normalizeRoleAgentForApi(value) {
  const t = (v) => (v == null || v === '' ? null : String(v).trim())
  const s = t(value)
  if (!s) return null
  const slug = slugifyRoleName(s)
  if (ROLE_AGENT_API_BY_SLUG[slug]) return ROLE_AGENT_API_BY_SLUG[slug]
  return s
}

function pickRoleCatalogNom(entry) {
  if (!entry) return ''
  return String(entry.nom ?? entry.Nom ?? '').trim()
}

/**
 * Retourne le `nom` exact présent dans GET /api/Role pour lier correctement un <select>.
 * Gère camelCase / PascalCase, casse, slug (ex. gerant ↔ Gerant) et anciens libellés via normalizeRoleAgentForApi.
 */
export function matchCatalogRoleNom(inputNom, catalog) {
  const rows = Array.isArray(catalog) ? catalog : []
  const noms = [...new Set(rows.map(pickRoleCatalogNom).filter(Boolean))]

  const findNom = (candidate) => {
    const v = String(candidate ?? '').trim()
    if (!v) return null
    let hit = noms.find((n) => n === v)
    if (hit) return hit
    const vl = v.toLowerCase()
    hit = noms.find((n) => n.toLowerCase() === vl)
    if (hit) return hit
    const slug = slugifyRoleName(v)
    hit = noms.find((n) => slugifyRoleName(n) === slug)
    return hit ?? null
  }

  const s = String(inputNom ?? '').trim()
  if (!s) return ''
  if (!noms.length) return normalizeRoleAgentForApi(s) || s

  let found = findNom(s)
  if (found) return found

  const mapped = normalizeRoleAgentForApi(s)
  if (mapped) {
    found = findNom(mapped)
    if (found) return found
  }

  return s
}

/** Chaîne optionnelle Swagger (champ texte vide → ""). */
function optionalAgentString(v) {
  if (v == null) return ''
  return String(v).trim()
}

/**
 * dateNaissance POST : ISO 8601 comme dans Swagger (ex. 2026-04-14T00:16:21.004Z).
 * Accepte une saisie `<input type="date">` (YYYY-MM-DD).
 */
export function toAgentDateNaissanceIso(raw) {
  if (raw == null || raw === '') return new Date().toISOString()
  const s = String(raw).trim()
  if (s.includes('T')) {
    const d = new Date(s)
    return Number.isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString()
  }
  const day = s.slice(0, 10)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return new Date().toISOString()
  return `${day}T00:00:00.000Z`
}

/**
 * POST /api/Agent — corps aligné sur le schéma OpenAPI (tous les champs, idAgent: 0, idSociete numérique).
 */
export function normalizeAgentCreate(input) {
  const idSoc = Number(input.idSociete)
  const idSociete = Number.isFinite(idSoc) && idSoc > 0 ? Math.trunc(idSoc) : 0
  const roleNorm = normalizeRoleAgentForApi(input.roleAgent)
  return {
    idAgent: 0,
    matricule: optionalAgentString(input.matricule),
    nomComplet: String(input.nomComplet || '').trim(),
    genre: input.genre === 'F' || input.genre === 'M' ? input.genre : 'M',
    dateNaissance: toAgentDateNaissanceIso(input.dateNaissance),
    telephoneAgent: optionalAgentString(input.telephoneAgent),
    emailAgent: String(input.emailAgent || '').trim(),
    statut: input.statut !== false,
    etatCivil: optionalAgentString(input.etatCivil),
    serialNumber: optionalAgentString(input.serialNumber),
    fonction: optionalAgentString(input.fonction),
    roleAgent: roleNorm == null ? '' : roleNorm,
    photoUrl: optionalAgentString(input.photoUrl),
    idSociete,
    adresseResidence: optionalAgentString(input.adresseResidence),
    zone: optionalAgentString(input.zone),
  }
}

/**
 * PUT /api/Agent/{id} — sous-ensemble Swagger (pas idSociete / matricule dans l’exemple)
 */
export function normalizeAgentUpdate(input) {
  const aid = Number(input.idAgent)
  const t = (v) => (v == null || v === '' ? null : String(v).trim())
  const body = {
    idAgent: Number.isFinite(aid) ? aid : 0,
    nomComplet: String(input.nomComplet || '').trim(),
    genre: input.genre === 'F' || input.genre === 'M' ? input.genre : 'M',
    dateNaissance: input.dateNaissance
      ? String(input.dateNaissance).slice(0, 10)
      : '1990-01-01',
    emailAgent: String(input.emailAgent || '').trim(),
    telephoneAgent: t(input.telephoneAgent),
    photoUrl: t(input.photoUrl),
    etatCivil: t(input.etatCivil),
    serialNumber: t(input.serialNumber),
    fonction: t(input.fonction),
    roleAgent: normalizeRoleAgentForApi(input.roleAgent),
    adresseResidence: t(input.adresseResidence),
    zone: t(input.zone),
  }
  if (input.statut !== undefined) body.statut = input.statut !== false
  return body
}

/** Suffixe query pour GET /api/Agent (ex. `tous=true` si le backend liste aussi les inactifs). */
function agentCollectionPath() {
  const extra = String(import.meta.env.VITE_API_AGENT_LIST_QUERY || '').trim()
  if (!extra) return '/api/Agent'
  const qs = extra.startsWith('?') ? extra.slice(1) : extra
  return `/api/Agent?${qs}`
}

export function listAgents() {
  return apiGet(agentCollectionPath(), JSON_ACCEPT)
}

export async function listAgentsArray() {
  const raw = await listAgents()
  let list = unwrapAgentList(raw)
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

export function getAgent(id) {
  return apiGet(`/api/Agent/${id}`, JSON_ACCEPT)
}

/** GET /api/Agent/{id} → objet agent normalisé ou `null`. */
export async function fetchAgentDetail(id) {
  const nid = Number(id)
  if (!Number.isFinite(nid) || nid <= 0) return null
  const raw = await getAgent(nid)
  return unwrapAgentDetailResponse(raw, nid)
}

export function unwrapAgentDetailResponse(raw, fallbackId) {
  if (!raw || typeof raw !== 'object') return null
  const o = raw.data ?? raw.value ?? raw
  if (!o || typeof o !== 'object') return null
  return { ...o, idAgent: o.idAgent ?? o.IdAgent ?? fallbackId }
}

/**
 * Bascule actif/inactif : PUT /api/Agent/toggle-statut/{id} (pas de DELETE).
 */
export function toggleAgentStatut(id) {
  const nid = Number(id)
  if (!Number.isFinite(nid) || nid <= 0) {
    return Promise.reject(new Error('Identifiant agent invalide.'))
  }
  return apiPut(`/api/Agent/toggle-statut/${nid}`, {}, JSON_ACCEPT)
}

/**
 * Met le statut souhaité en réutilisant l’API toggle (un seul appel si l’état courant diffère).
 * @param {number|string} id
 * @param {boolean} actif
 * @param {object | null} [listRow] — ligne liste pour éviter un GET si `statut` est connu
 */
export async function setAgentStatut(id, actif, listRow = null) {
  const nid = Number(id)
  if (!Number.isFinite(nid) || nid <= 0) {
    throw new Error('Identifiant agent invalide.')
  }
  const want = Boolean(actif)
  let current
  if (listRow && typeof listRow === 'object' && 'statut' in listRow) {
    current = listRow.statut !== false
  } else {
    const raw = await getAgent(nid)
    const d = unwrapAgentDetailResponse(raw, nid)
    current = d ? d.statut !== false : true
  }
  if (want === current) {
    return getAgent(nid)
  }
  return toggleAgentStatut(nid)
}

export function createAgent(body) {
  return apiPost('/api/Agent', normalizeAgentCreate(body))
}

export function updateAgent(id, body) {
  return apiPut(`/api/Agent/${id}`, normalizeAgentUpdate(body))
}

/** Filtre côté client par société (si le GET ne supporte pas de query) */
export async function listAgentsBySociete(idSociete) {
  const sid = Number(idSociete)
  const all = await listAgentsArray()
  if (!Number.isFinite(sid)) return all
  return all.filter((a) => Number(a.idSociete) === sid)
}

export const agentService = {
  getAll: listAgents,
  getAllArray: listAgentsArray,
  unwrapList: unwrapAgentList,
  resolveForUser: resolveAgentForUser,
  getById: getAgent,
  fetchDetail: fetchAgentDetail,
  resolvePhotoUrl: resolveAgentPhotoUrl,
  pickPhotoUrl: pickAgentPhotoUrl,
  create: createAgent,
  update: updateAgent,
  setStatut: setAgentStatut,
  toggleStatut: toggleAgentStatut,
  listBySociete: listAgentsBySociete,
}
