// Service pour les requêtes API avec token Authorization

import { useAuthStore } from '@/stores/auth'
import { resolveApiUrl } from '@/config/apiOrigin'
import { messageIfHtmlInsteadOfJson } from '@/utils/nonApiResponseMessage'

function pickStr(...candidates) {
  for (const c of candidates) {
    if (c == null) continue
    const s = String(c).trim()
    if (s) return s
  }
  return ''
}

/** ASP.NET ProblemDetails + ModelState → message lisible (`detail` avant `title` : le titre est souvent générique). */
function formatApiErrorBody(errJson) {
  if (!errJson || typeof errJson !== 'object') return null
  const errs = errJson.errors || errJson.Errors
  if (errs && typeof errs === 'object') {
    const parts = []
    for (const [key, val] of Object.entries(errs)) {
      const msgs = Array.isArray(val) ? val : [val]
      parts.push(`${key}: ${msgs.filter(Boolean).join(' ')}`)
    }
    if (parts.length) return parts.join(' · ')
  }
  const core = pickStr(
    errJson.detail,
    errJson.Detail,
    errJson.message,
    errJson.Message,
    errJson.title,
    errJson.Title,
  )
  const trace = pickStr(errJson.traceId, errJson.TraceId, errJson.instance, errJson.Instance)
  if (core && trace) return `${core} (réf. ${trace})`
  return core || null
}

/** Erreur HTTP avec code statut (ex. 409 Conflict) pour un traitement côté vues. */
function createHttpError(status, message) {
  const err = new Error(message)
  err.status = status
  err.name = 'HttpError'
  return err
}

/**
 * @typedef {{ skipSocieteHeader?: boolean }} ApiRequestMeta
 * Métadonnées optionnelles pour `apiRequest` / `apiGet` (3ᵉ argument).
 */

// Créer une instance fetch avec le token d'authentification
/** @param {string} url @param {RequestInit & { headers?: Record<string, string> }} [options] @param {ApiRequestMeta} [meta] */
export const apiRequest = async (url, options = {}, meta = {}) => {
  const authStore = useAuthStore()

  const method = String(options.method || 'GET').toUpperCase()
  const hasBody = options.body != null && options.body !== ''

  /** Ne pas envoyer Content-Type sur GET/HEAD sans corps — certains backends réagissent mal. */
  const headers = { ...options.headers }
  if (hasBody || method === 'POST' || method === 'PUT' || method === 'PATCH') {
    if (!headers['Content-Type']) {
      headers['Content-Type'] = 'application/json'
    }
  }

  const bearer = authStore.token || localStorage.getItem('accessToken')
  if (bearer) {
    headers['Authorization'] = `Bearer ${bearer}`
    console.log('Token ajouté aux headers:', String(bearer).substring(0, 20) + '...')
  }

  if (!meta.skipSocieteHeader) {
    const sid = authStore.apiSocieteId
    if (sid != null && Number(sid) > 0) {
      headers['X-Societe-Id'] = String(sid)
    }
  }

  const config = {
    ...options,
    headers
  }

  try {
    const resolved = resolveApiUrl(url)
    console.log('Requête API vers:', resolved, 'avec options:', config)
    const response = await fetch(resolved, config)
    
    if (!response.ok) {
      if (response.status === 401) {
        console.log('Token expiré, déconnexion...')
        authStore.logout({ notifyRemote: false })
        window.location.href = '/signin'
        return
      }

      let detail = `Erreur HTTP: ${response.status}`
      let errJson = null
      try {
        errJson = await response.clone().json()
        detail =
          formatApiErrorBody(errJson) ||
          (errJson && typeof errJson === 'object' && Object.keys(errJson).length
            ? JSON.stringify(errJson).slice(0, 400)
            : detail)
      } catch {
        try {
          const t = await response.text()
          if (t) detail = t.slice(0, 500)
        } catch {
          /* ignore */
        }
      }
      const httpErr = createHttpError(response.status, detail)
      if (errJson && typeof errJson === 'object') {
        httpErr.responseBody = errJson
      }
      throw httpErr
    }

    const text = await response.text()
    let data = null
    if (text) {
      try {
        data = JSON.parse(text)
      } catch {
        const htmlMsg = messageIfHtmlInsteadOfJson(text)
        if (htmlMsg) throw new Error(htmlMsg)
        throw new Error('Réponse non JSON: ' + text.slice(0, 200))
      }
    }
    console.log('Réponse API reçue:', data)
    return data
  } catch (error) {
    console.error('Erreur lors de la requête API:', error)
    throw error
  }
}

// Méthodes HTTP pratiques
/** @param {string} url @param {RequestInit & { headers?: Record<string, string> }} [options] @param {ApiRequestMeta} [meta] */
export const apiGet = (url, options = {}, meta = {}) => {
  return apiRequest(url, { method: 'GET', ...options }, meta)
}

export const apiPost = (url, data, options = {}) => {
  return apiRequest(url, { 
    method: 'POST', 
    body: JSON.stringify(data), 
    ...options 
  })
}

export const apiPut = (url, data, options = {}) => {
  return apiRequest(url, { 
    method: 'PUT', 
    body: JSON.stringify(data), 
    ...options 
  })
}

export const apiDelete = (url, options = {}) => {
  return apiRequest(url, { method: 'DELETE', ...options })
}
