import { resolveApiUrl } from '@/config/apiOrigin'

async function readBody(response) {
  const text = await response.text()
  if (!text) return []
  try {
    return JSON.parse(text)
  } catch {
    return []
  }
}

/**
 * Catalogue des rôles (GET /api/Role) — Bearer requis côté API.
 * @param {string} accessToken
 * @returns {Promise<Array<{ idRole: number, nom: string, description?: string, niveau?: number, statut?: boolean }>>}
 */
export async function fetchRoleList(accessToken) {
  const headers = {
    // Aligné Swagger (souvent text/plain) + JSON pour les implémentations qui négocient le type
    Accept: 'text/plain, application/json;q=0.9, */*;q=0.8',
  }
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`
  }
  const response = await fetch(resolveApiUrl('/api/Role'), {
    method: 'GET',
    headers,
  })
  const data = await readBody(response)
  if (!response.ok) {
    const msg =
      (data && (data.message || data.Message)) ||
      `Erreur HTTP ${response.status} (GET /api/Role)`
    throw new Error(typeof msg === 'string' ? msg : JSON.stringify(msg))
  }
  return Array.isArray(data) ? data : []
}
