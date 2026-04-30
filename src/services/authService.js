// Service d'authentification — guide : POST /api/Auth/login · legacy : POST /api/Utilisateur/authentifier

import fetchService from './fetch.service'
import { API_ENDPOINTS, API_USE_GUIDE_ROUTES } from './Endpoint.service'

function flattenValidationErrors(errors) {
  if (!errors || typeof errors !== 'object') return []
  const out = []
  for (const val of Object.values(errors)) {
    if (Array.isArray(val)) out.push(...val.filter(Boolean).map(String))
    else if (val != null) out.push(String(val))
  }
  return out
}

/**
 * Liste de permissions (codes string) depuis une réponse login/refresh :
 * racine, `data`, utilisateur (casse API variable).
 * @param {Record<string, unknown>|null|undefined} data
 * @param {Record<string, unknown>|null|undefined} [inner]
 * @param {unknown} [user]
 * @returns {string[]}
 */
export function extractPermissionsFromAuthPayload(data, inner, user) {
  if (!data || typeof data !== 'object') return []
  const inn =
    inner !== undefined && inner !== null
      ? inner
      : data.data && typeof data.data === 'object'
        ? /** @type {Record<string, unknown>} */ (data.data)
        : null
  const usr =
    user !== undefined
      ? user
      : data.utilisateur ??
        data.user ??
        (inn && typeof inn === 'object' ? inn.utilisateur ?? inn.user : null)

  const sources = [
    data.permissions,
    data.Permissions,
    inn && typeof inn === 'object' ? inn.permissions : null,
    inn && typeof inn === 'object' ? inn.Permissions : null,
    usr && typeof usr === 'object' ? /** @type {Record<string, unknown>} */ (usr).permissions : null,
    usr && typeof usr === 'object' ? /** @type {Record<string, unknown>} */ (usr).Permissions : null,
  ]
  for (const raw of sources) {
    if (!Array.isArray(raw)) continue
    return raw.map((p) => (typeof p === 'string' ? p : String(p)))
  }
  return []
}

/**
 * Mappe la réponse « guide » (`data.token`, `data.user`) vers le format attendu par le store (`accessToken`, `utilisateur`…).
 * @param {Record<string, unknown>} data
 */
export function normalizeAuthLoginResponse(data) {
  if (!data || typeof data !== 'object') return data
  if (data.accessToken) {
    const permissions = extractPermissionsFromAuthPayload(data)
    return { ...data, permissions }
  }

  const inner = data.data && typeof data.data === 'object' ? /** @type {Record<string, unknown>} */ (data.data) : null
  if (!inner) return data

  const token = inner.accessToken || inner.token
  if (token == null || String(token).trim() === '') return data

  const user = inner.user || inner.utilisateur
  const mapped = mapGuideUserToUtilisateur(user)

  const permissions = extractPermissionsFromAuthPayload(data, inner, user)

  const roleNom =
    (typeof user?.role === 'string' && user.role) ||
    (typeof inner.role === 'string' && inner.role) ||
    ''

  return {
    ...data,
    success: data.success !== false,
    accessToken: String(token),
    refreshToken: inner.refreshToken ?? data.refreshToken,
    expiresIn: inner.expiresIn ?? data.expiresIn,
    expiresAt: inner.expiresAt ?? data.expiresAt,
    tokenType: inner.tokenType || data.tokenType || 'Bearer',
    utilisateur: mapped,
    nomRole: roleNom,
    permissions,
    message: data.message,
  }
}

/**
 * @param {unknown} user
 */
function mapGuideUserToUtilisateur(user) {
  if (!user || typeof user !== 'object') return null
  const u = /** @type {Record<string, unknown>} */ (user)
  const id = Number(u.id ?? u.idUtilisateur ?? u.IdUtilisateur) || 0
  const nom =
    String(u.nomComplet ?? u.NomComplet ?? '').trim() ||
    [u.nom, u.postnom, u.prenom].filter(Boolean).join(' ').trim() ||
    String(u.username ?? u.Username ?? '').trim() ||
    String(u.email ?? '').trim() ||
    'Utilisateur'
  const email = String(u.email ?? u.Email ?? '').trim()
  const roleStr = String(u.role ?? u.Role ?? '').trim()
  const primaryRole = u.primaryRole ?? u.PrimaryRole ?? (roleStr ? { nom: roleStr, Nom: roleStr } : null)
  const roles =
    Array.isArray(u.roles) && u.roles.length
      ? u.roles
      : roleStr
        ? [{ nom: roleStr, Nom: roleStr, statut: true }]
        : []

  return {
    idUtilisateur: id || undefined,
    nomComplet: nom,
    email,
    defaultUsername: String(u.username ?? u.Username ?? '').trim() || undefined,
    telephone: String(u.telephone ?? u.Telephone ?? '').trim() || undefined,
    statut: u.statut !== false && u.Statut !== false,
    primaryRole,
    roles,
    idRole: u.idRole ?? u.IdRole,
    idSociete: u.idSociete ?? u.IdSociete,
    societeId: u.societeId ?? u.idSociete,
  }
}

/**
 * Profil utilisateur (GET) — Bearer JWT
 * @param {number|string} idUtilisateur
 * @param {string} [accessToken]
 */
export async function fetchUtilisateurById(idUtilisateur, accessToken) {
  try {
    return await fetchService.get(API_ENDPOINTS.UTILISATEUR.byId(idUtilisateur), {
      authToken: accessToken,
    })
  } catch (e) {
    const msg = e?.message || 'Erreur de récupération du profil utilisateur'
    throw new Error(typeof msg === 'string' ? msg : JSON.stringify(msg))
  }
}

/**
 * Connexion — corps aligné sur OpenAPI (emailOuTelephone, motDePasse, device…).
 * Réponse 200 : success, accessToken, refreshToken, utilisateur, nomRole, primaryRole, roles, permissions, agent, client…
 */
export async function login(email, password) {
  const trimmed = String(email || '').trim()
  const requestBody = API_USE_GUIDE_ROUTES
    ? {
        email: trimmed,
        password,
      }
    : {
        emailOuTelephone: trimmed,
        motDePasse: password,
        fcmToken: 'web',
        deviceType: 'web',
        deviceModel: 'browser',
        osVersion:
          typeof navigator !== 'undefined'
            ? String(navigator.userAgent || '').slice(0, 50)
            : '',
      }

  let data
  try {
    data = await fetchService.post(API_ENDPOINTS.AUTH.LOGIN, requestBody, {
      skipSocieteHeader: true,
    })
  } catch (e) {
    const errs = flattenValidationErrors(e?.data?.errors || e?.data?.Errors)
    if (errs.length) throw new Error(errs.join(', '))
    throw new Error(e?.message || 'Erreur de connexion')
  }

  data = normalizeAuthLoginResponse(data)

  if (data && data.success === false) {
    const errs = flattenValidationErrors(data?.errors || data?.Errors)
    throw new Error(
      errs.length ? errs.join(', ') : data.message || 'Authentification refusée'
    )
  }

  if (!data?.accessToken) {
    throw new Error('Réponse API sans accessToken')
  }

  return data
}

const WEB_DEVICE_LS_KEY = 'rusa_web_device_id'

/** Identifiant stable pour ce navigateur (corps POST deconnecter / device). */
export function getOrCreateWebDeviceId() {
  if (typeof localStorage === 'undefined') return 'web'
  let id = localStorage.getItem(WEB_DEVICE_LS_KEY)
  if (!id) {
    id =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `web-${Date.now()}`
    localStorage.setItem(WEB_DEVICE_LS_KEY, id)
  }
  return id
}

/**
 * Déconnexion côté API — POST /api/Utilisateur/deconnecter (Bearer).
 * @param {string} accessToken
 * @param {object} [options]
 * @param {boolean} [options.supprimerTousLesDevices] — si true, invalide tous les appareils (défaut : false)
 * @param {string} [options.deviceId]
 * @param {number} [options.idUserDevice]
 * @param {string} [options.fcmToken]
 */
export async function disconnectUser(accessToken, options = {}) {
  if (!accessToken) return null

  const body = API_USE_GUIDE_ROUTES
    ? {}
    : {
        supprimerTousLesDevices: options.supprimerTousLesDevices === true,
        deviceId: options.deviceId ?? getOrCreateWebDeviceId(),
        idUserDevice: Number(options.idUserDevice) || 0,
        fcmToken: options.fcmToken ?? 'web',
      }

  try {
    return await fetchService.post(API_ENDPOINTS.AUTH.LOGOUT, body, {
      authToken: accessToken,
      skipSocieteHeader: true,
    })
  } catch (e) {
    throw new Error(e?.message || 'Erreur deconnexion')
  }
}

/**
 * Rafraîchissement JWT — POST /api/Auth/refresh-token (guide).
 * @param {string} refreshToken
 */
export async function refreshAuthToken(refreshToken) {
  const rt = String(refreshToken || '').trim()
  if (!rt) return Promise.reject(new Error('refreshToken manquant'))

  try {
    const data = await fetchService.post(
      API_ENDPOINTS.AUTH.REFRESH,
      { refreshToken: rt },
      { skipSocieteHeader: true }
    )
    return normalizeAuthLoginResponse(data)
  } catch (e) {
    throw new Error(e?.message || 'Erreur refresh token')
  }
}
