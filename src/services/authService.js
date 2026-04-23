// Service d'authentification — POST /api/Utilisateur/authentifier

import { resolveApiUrl } from '@/config/apiOrigin'
import { messageIfHtmlInsteadOfJson } from '@/utils/nonApiResponseMessage'

async function readJsonBody(response) {
  const text = await response.text()
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    const htmlMsg = messageIfHtmlInsteadOfJson(text)
    if (htmlMsg) throw new Error(htmlMsg)
    const hint = text.trim().slice(0, 240)
    throw new Error(hint || `Réponse non JSON (HTTP ${response.status})`)
  }
}

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
 * Profil utilisateur (GET) — Bearer JWT
 * @param {number|string} idUtilisateur
 * @param {string} [accessToken]
 */
export async function fetchUtilisateurById(idUtilisateur, accessToken) {
  const headers = {
    Accept: 'application/json',
  }
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`
  }
  const response = await fetch(resolveApiUrl(`/api/Utilisateur/${idUtilisateur}`), {
    method: 'GET',
    headers,
  })
  const data = await readJsonBody(response)
  if (!response.ok) {
    const msg =
      data?.message ||
      data?.Message ||
      data?.detail ||
      data?.title ||
      `Erreur HTTP ${response.status}`
    throw new Error(typeof msg === 'string' ? msg : JSON.stringify(msg))
  }
  return data
}

/**
 * Connexion — corps aligné sur OpenAPI (emailOuTelephone, motDePasse, device…).
 * Réponse 200 : success, accessToken, refreshToken, utilisateur, nomRole, primaryRole, roles, permissions, agent, client…
 */
export async function login(email, password) {
  const requestBody = {
    emailOuTelephone: String(email || '').trim(),
    motDePasse: password,
    fcmToken: 'web',
    deviceType: 'web',
    deviceModel: 'browser',
    osVersion:
      typeof navigator !== 'undefined'
        ? String(navigator.userAgent || '').slice(0, 50)
        : '',
  }

  const response = await fetch(resolveApiUrl('/api/Utilisateur/authentifier'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json, text/plain;q=0.9',
    },
    body: JSON.stringify(requestBody),
  })

  let data
  try {
    data = await readJsonBody(response)
  } catch (e) {
    if (!response.ok) {
      throw new Error(`Erreur HTTP ${response.status}`)
    }
    throw e
  }

  if (!response.ok) {
    const errs = flattenValidationErrors(data?.errors || data?.Errors)
    if (errs.length) {
      throw new Error(errs.join(', '))
    }
    const msg =
      data?.message ||
      data?.Message ||
      data?.detail ||
      data?.Detail ||
      data?.title ||
      `Erreur HTTP ${response.status}`
    throw new Error(typeof msg === 'string' ? msg : 'Erreur de connexion')
  }

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

  const body = {
    supprimerTousLesDevices: options.supprimerTousLesDevices === true,
    deviceId: options.deviceId ?? getOrCreateWebDeviceId(),
    idUserDevice: Number(options.idUserDevice) || 0,
    fcmToken: options.fcmToken ?? 'web',
  }

  const response = await fetch(resolveApiUrl('/api/Utilisateur/deconnecter'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'text/plain, application/json;q=0.9, */*;q=0.8',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(body),
  })

  const text = await response.text()
  let data = null
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = null
    }
  }

  if (!response.ok) {
    const msg =
      data?.message ||
      data?.Message ||
      data?.detail ||
      data?.title ||
      `Erreur HTTP ${response.status} (déconnexion)`
    throw new Error(typeof msg === 'string' ? msg : JSON.stringify(msg))
  }

  return data
}
