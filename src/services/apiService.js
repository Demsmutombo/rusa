// Service pour les requêtes API avec token Authorization

import { useAuthStore } from '@/stores/auth'
import { resolveApiUrl } from '@/config/apiOrigin'

/** ASP.NET ProblemDetails + ModelState → message lisible */
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
   return (
    errJson.message ||
    errJson.Message ||
    errJson.title ||
    errJson.Title ||
    errJson.detail ||
    errJson.Detail ||
    null
  )
}

/** Erreur HTTP avec code statut (ex. 409 Conflict) pour un traitement côté vues. */
function createHttpError(status, message) {
  const err = new Error(message)
  err.status = status
  err.name = 'HttpError'
  return err
}

// Créer une instance fetch avec le token d'authentification
export const apiRequest = async (url, options = {}) => {
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

  if (authStore.token) {
    headers['Authorization'] = `Bearer ${authStore.token}`
    console.log('Token ajouté aux headers:', authStore.token.substring(0, 20) + '...')
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
      try {
        const errJson = await response.clone().json()
        detail = formatApiErrorBody(errJson) || detail
      } catch {
        try {
          const t = await response.text()
          if (t) detail = t.slice(0, 500)
        } catch {
          /* ignore */
        }
      }
      throw createHttpError(response.status, detail)
    }

    const text = await response.text()
    let data = null
    if (text) {
      try {
        data = JSON.parse(text)
      } catch {
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
export const apiGet = (url, options = {}) => {
  return apiRequest(url, { method: 'GET', ...options })
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
