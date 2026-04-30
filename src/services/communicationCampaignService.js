/**
 * API CommunicationCampaign — Rusa Travel.
 * Suppression logique via mise a jour du statut (pas DELETE).
 */
import { apiGet, apiPost, apiPut } from './apiService'
import { API_ENDPOINTS } from './Endpoint.service'

/** @param {unknown} data */
export function unwrapCommunicationCampaignList(data) {
  if (data == null) return []
  if (Array.isArray(data)) return data
  const arr = data.data ?? data.Data ?? data.items ?? data.Items ?? data.results ?? data.value ?? []
  return Array.isArray(arr) ? arr : []
}

export function listCommunicationCampaigns() {
  return apiGet(API_ENDPOINTS.COMMUNICATION_CAMPAIGN.BASE).then(unwrapCommunicationCampaignList)
}

/** @param {number|string} id */
export function getCommunicationCampaign(id) {
  return apiGet(API_ENDPOINTS.COMMUNICATION_CAMPAIGN.byId(id))
}

/** @param {Record<string, unknown>} body */
export function createCommunicationCampaign(body) {
  return apiPost(API_ENDPOINTS.COMMUNICATION_CAMPAIGN.BASE, body)
}

/** @param {number|string} id @param {Record<string, unknown>} body */
export function updateCommunicationCampaign(id, body) {
  return apiPut(API_ENDPOINTS.COMMUNICATION_CAMPAIGN.byId(id), body)
}

/**
 * Désactivation logique (pas DELETE): PUT /api/CommunicationCampaign/{id} avec `statut:false`.
 * @param {number|string} id
 * @param {Record<string, unknown> | null} [rawHint]
 */
export async function deactivateCommunicationCampaign(id, rawHint = null) {
  const nid = Number(id)
  if (!Number.isFinite(nid) || nid <= 0) {
    throw new Error('Identifiant campagne invalide.')
  }
  let current = rawHint && typeof rawHint === 'object' ? { ...rawHint } : {}
  try {
    const fetched = await getCommunicationCampaign(nid)
    const detail =
      fetched && typeof fetched === 'object'
        ? fetched.data && typeof fetched.data === 'object'
          ? fetched.data
          : fetched
        : null
    if (detail && typeof detail === 'object') current = { ...current, ...detail }
  } catch {
    /* fallback rawHint */
  }
  return updateCommunicationCampaign(nid, { ...current, idCampagne: nid, statut: false })
}

