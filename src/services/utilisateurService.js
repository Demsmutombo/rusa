/**
 * API Utilisateur — aligné sur le contrat backend (pagination, CRUD, rôles, statut).
 * Base URL relative /api (proxy Vite ou même origine en prod).
 */

import { useAuthStore } from '@/stores/auth'
import { scopeEntitiesToUserSociete } from '@/utils/societeIsolation'
import { apiGet, apiPost, apiPut, apiDelete } from './apiService'

/**
 * Ids rôles côté API — surcharger via .env si besoin.
 * Réf. dev GET /api/Role : Super-Admin=1, Admin=2, Gerant=3, Financier=4, Caissier=5, Client=6
 */
export const ROLE_IDS = {
  admin: Number(import.meta.env.VITE_ID_ROLE_ADMIN) || 2,
  transporteur: (() => {
    const n = Number(import.meta.env.VITE_ID_ROLE_TRANSPORTEUR)
    return Number.isFinite(n) && n > 0 ? n : null
  })(),
  client: Number(import.meta.env.VITE_ID_ROLE_CLIENT) || 6,
}

const NOM_ROLE_BY_FORM_SLUG = {
  admin: 'admin',
  transporteur: 'transporteur',
  client: 'client',
}

export function getIdRoleForFormSlug(slug) {
  const key = NOM_ROLE_BY_FORM_SLUG[slug] || slug
  return ROLE_IDS[key] ?? null
}

/** Libellé app (admin | transporteur | client) à partir de l'id rôle API — utilise ROLE_IDS / .env */
export function slugFromIdRole(idRole) {
  const id = Number(idRole)
  if (!Number.isFinite(id)) return ''
  const match = Object.entries(ROLE_IDS).find(
    ([, rid]) => rid != null && Number(rid) === id
  )
  return match ? match[0] : ''
}

/** Extrait un tableau d'utilisateurs depuis divers formats de réponse paginée. */
/**
 * Filtre une liste utilisateurs déjà extraite (ex. après `unwrapUtilisateurList`).
 * @param {unknown[]} items
 */
export function filterUtilisateursForCurrentSociete(items) {
  try {
    const auth = useAuthStore()
    return scopeEntitiesToUserSociete(items, {
      role: auth.role,
      societeId: auth.societeId,
    })
  } catch {
    return Array.isArray(items) ? items : []
  }
}

export function unwrapUtilisateurList(data) {
  if (!data) return { items: [], totalCount: 0 }
  if (Array.isArray(data)) return { items: data, totalCount: data.length }
  const candidates = [
    data.items,
    data.data,
    data.results,
    data.utilisateurs,
    data.value,
    data.records,
  ].find((x) => Array.isArray(x))
  if (candidates) {
    const total =
      data.totalCount ??
      data.total ??
      data.count ??
      data.totalItems ??
      candidates.length
    return { items: candidates, totalCount: Number(total) || candidates.length }
  }
  return { items: [], totalCount: 0 }
}

/** Rôle affichable : champs texte API, puis primaryRole, puis idRole ↔ ROLE_IDS. */
function extractRoleLabel(u) {
  const asLower = (v) => (v == null ? '' : String(v).trim().toLowerCase())

  const textFields = [
    u.rolePrincipal,
    u.nomRole,
    u.roleName,
    u.libelleRole,
    u.roleLibelle,
    u.role,
  ]
  for (const f of textFields) {
    const s = asLower(f)
    if (s) return s
  }

  if (Array.isArray(u.roles) && u.roles.length) {
    const first = u.roles[0]
    if (typeof first === 'string') {
      const s = asLower(first)
      if (s) return s
    } else if (first && typeof first === 'object') {
      const s = asLower(first.nom ?? first.Nom)
      if (s) return s
      const fromId = slugFromIdRole(first.idRole ?? first.IdRole)
      if (fromId) return fromId
    }
  }

  const pr = u.primaryRole ?? u.PrimaryRole
  const prNom = asLower(pr?.nom ?? pr?.Nom)
  if (prNom) return prNom

  const fromUserIdRole = slugFromIdRole(u.idRole ?? u.IdRole)
  if (fromUserIdRole) return fromUserIdRole

  return ''
}

/** Ligne tableau admin (mapping depuis le modèle API). */
export function mapUtilisateurToRow(u) {
  const roleNom = extractRoleLabel(u)
  const idRoleRaw = u.idRole ?? u.IdRole
  const roleDisplay =
    roleNom ||
    (Number.isFinite(Number(idRoleRaw))
      ? `rôle #${idRoleRaw}`
      : '—')
  let created = '—'
  if (u.dateCreation) {
    created = String(u.dateCreation).slice(0, 10)
  } else if (u.dateNaissance) {
    created = String(u.dateNaissance).slice(0, 10)
  }
  return {
    id: u.idUtilisateur,
    idUtilisateur: u.idUtilisateur,
    name: u.nomComplet || '',
    email: u.email || '',
    phone: u.telephone || '',
    role: roleDisplay,
    status: u.statut === true ? 'actif' : 'inactif',
    createdAt: created,
    _raw: u,
  }
}

/**
 * @param {{ page?: number, pageSize?: number }} params
 */
export function listUtilisateurs(params = {}) {
  const page = params.page ?? 1
  const pageSize = params.pageSize ?? 50
  const q = new URLSearchParams({ page: String(page), pageSize: String(pageSize) })
  return apiGet(`/api/Utilisateur?${q.toString()}`, {
    headers: { Accept: 'application/json' },
  })
}

/**
 * Liste paginée par id de rôle (contrat Swagger : page, pageSize, data[], rolePrincipal…).
 * @param {number|string} roleId
 * @param {{ page?: number, pageSize?: number }} params
 */
export function listUtilisateursByRoleId(roleId, params = {}) {
  const page = params.page ?? 1
  const pageSize = params.pageSize ?? 50
  const q = new URLSearchParams({ page: String(page), pageSize: String(pageSize) })
  return apiGet(`/api/Utilisateur/role/${roleId}?${q.toString()}`, {
    headers: { Accept: 'application/json' },
  })
}

/**
 * @param {string} nomRole ex. transporteur, client, admin
 */
export function listUtilisateursByRoleName(nomRole) {
  const encoded = encodeURIComponent(nomRole)
  return apiGet(`/api/Utilisateur/by-role-name/${encoded}`, {
    headers: { Accept: 'application/json' },
  })
}

export function getUtilisateur(id) {
  return apiGet(`/api/Utilisateur/${id}`, {
    headers: { Accept: 'application/json' },
  })
}

/**
 * Corps POST /api/Utilisateur — évite idSociete=0 et chaînes vides souvent rejetées par l’API.
 */
export function normalizeCreateUtilisateurBody(input) {
  const idRole = Number(input.idRole)
  const body = {
    nomComplet: String(input.nomComplet || '').trim(),
    email: String(input.email || '').trim(),
    motDePasse: input.motDePasse,
    telephone: String(input.telephone || '').trim() || null,
    photoUrl:
      input.photoUrl != null && String(input.photoUrl).trim()
        ? String(input.photoUrl).trim()
        : null,
    lieuNaissance:
      input.lieuNaissance != null && String(input.lieuNaissance).trim()
        ? String(input.lieuNaissance).trim()
        : null,
    dateNaissance: input.dateNaissance || '1990-01-01',
    genre: input.genre === 'F' || input.genre === 'M' ? input.genre : 'M',
    idRole: Number.isFinite(idRole) ? idRole : 0,
    statut: input.statut !== false,
  }
  const sid = Number(input.idSociete)
  if (Number.isFinite(sid) && sid > 0) {
    body.idSociete = sid
  }
  return body
}

/**
 * @param {object} body — nomComplet, email, motDePasse, telephone, photoUrl, lieuNaissance, dateNaissance, genre, idRole, idSociete?, statut
 */
export function createUtilisateur(body) {
  return apiPost('/api/Utilisateur', normalizeCreateUtilisateurBody(body))
}

/**
 * @param {number|string} id
 * @param {object} body — idUtilisateur, nomComplet, email, telephone, photoUrl, lieuNaissance, dateNaissance, genre
 */
export function updateUtilisateur(id, body) {
  return apiPut(`/api/Utilisateur/${id}`, body)
}

function unwrapUtilisateurDetail(raw, fallbackId) {
  if (!raw || typeof raw !== 'object') return null
  const o = raw.data ?? raw.value ?? raw
  if (!o || typeof o !== 'object') return null
  return { ...o, idUtilisateur: o.idUtilisateur ?? o.IdUtilisateur ?? fallbackId }
}

/**
 * Désactivation logique : PUT avec statut false (pas de DELETE).
 * @param {object|null} rawHint — ex. ligne API brute (_raw) pour compléter le corps
 */
export async function deactivateUtilisateur(id, rawHint = null) {
  const nid = Number(id)
  let u = rawHint && typeof rawHint === 'object' ? { ...rawHint } : {}
  try {
    const fetched = await getUtilisateur(nid)
    const detail = unwrapUtilisateurDetail(fetched, nid)
    if (detail) u = { ...u, ...detail }
  } catch {
    /* garde rawHint */
  }
  u.idUtilisateur = nid
  u.statut = false
  return updateUtilisateur(nid, u)
}

export function toggleStatutUtilisateur(id) {
  return apiPut(`/api/Utilisateur/toggle-statut/${id}`, {})
}

export function getUtilisateurRoles(id) {
  return apiGet(`/api/Utilisateur/${id}/roles`, {
    headers: { Accept: 'application/json' },
  })
}

export function addUtilisateurRole(idUtilisateur, roleId) {
  return apiPost(`/api/Utilisateur/${idUtilisateur}/roles/${roleId}`, {})
}

export function removeUtilisateurRole(idUtilisateur, roleId) {
  return apiDelete(`/api/Utilisateur/${idUtilisateur}/roles/${roleId}`)
}

export function setPrimaryUtilisateurRole(idUtilisateur, roleId) {
  return apiPut(`/api/Utilisateur/${idUtilisateur}/roles/${roleId}/primary`, {})
}
