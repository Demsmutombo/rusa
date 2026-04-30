// Service pour les requêtes API avec token Authorization

import { useFetchService } from './fetch.service'

const fetchService = useFetchService()

/**
 * @typedef {{ skipSocieteHeader?: boolean, authToken?: string }} ApiRequestMeta
 * Métadonnées optionnelles pour `apiRequest` / `apiGet` (3ᵉ argument).
 */

/** @param {string} url @param {RequestInit} [options] @param {ApiRequestMeta} [meta] */
export const apiRequest = async (url, options = {}, meta = {}) => {
  const method = String(options.method || 'GET').toLowerCase()
  const { body, ...rest } = options
  const config = {
    ...rest,
    skipSocieteHeader: meta?.skipSocieteHeader === true,
    authToken: meta?.authToken,
  }

  if (method === 'get') return fetchService.get(url, config)
  if (method === 'delete') return fetchService.delete(url, config)

  const payload =
    typeof body === 'string' && body.trim()
      ? (() => {
          try {
            return JSON.parse(body)
          } catch {
            return body
          }
        })()
      : body

  if (method === 'post') return fetchService.post(url, payload, config)
  if (method === 'put') return fetchService.put(url, payload, config)
  if (method === 'patch') return fetchService.patch(url, payload, config)

  throw new Error(`Méthode HTTP non supportée: ${String(options.method || '').toUpperCase()}`)
}

// Méthodes HTTP pratiques
/** @param {string} url @param {RequestInit} [options] @param {ApiRequestMeta} [meta] */
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
