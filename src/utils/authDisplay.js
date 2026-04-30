/** Libellés profil / rôle (store auth + objet utilisateur API) */

import { APP_ROLE_LABELS } from '@/config/roles'
import { pickAgentPhotoUrl, resolveAgentPhotoUrl } from '@/services/agentService'

export function getDisplayName(user) {
  const name = user?.nomComplet?.trim() || user?.defaultUsername?.trim()
  return name || 'Utilisateur'
}

export function getShortName(user) {
  const full = getDisplayName(user)
  const parts = full.split(/\s+/).filter(Boolean)
  return parts[0] || full
}

export function getDisplayEmail(user) {
  return user?.email?.trim() || ''
}

export function getApiRoleNom(user) {
  if (user?.primaryRole?.nom) return String(user.primaryRole.nom)
  if (Array.isArray(user?.roles) && user.roles.length) {
    const r = user.roles.find((x) => x?.statut !== false) || user.roles[0]
    if (r?.nom) return String(r.nom)
  }
  return ''
}

export function getRoleDisplayLabel(user, appRole) {
  const api = getApiRoleNom(user)
  if (api) return api
  return APP_ROLE_LABELS[appRole] || appRole || '—'
}

/** Placeholder léger (pas de fichier `public/` requis). */
const AVATAR_PLACEHOLDER_SVG =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><rect fill="%23d1d5db" width="64" height="64"/><circle cx="32" cy="22" r="9" fill="%239ca3af"/><path fill="%239ca3af" d="M16 54c0-9 7-16 16-16s16 7 16 16"/></svg>'
  )

/** Photo brute : utilisateur puis fiche agent (session). */
export function pickSessionPhotoRaw(user, agent = null) {
  const fromUser = pickAgentPhotoUrl(user)
  if (fromUser) return fromUser
  if (agent && typeof agent === 'object') {
    const fromAgent = pickAgentPhotoUrl(agent)
    if (fromAgent) return fromAgent
  }
  return null
}

/** URL absolue pour `<img>` (chemins API relatifs → origine backend). */
export function resolveSessionAvatarUrl(user, agent = null) {
  return resolveAgentPhotoUrl(pickSessionPhotoRaw(user, agent))
}

/** Initiales pour avatar sans image (même logique que la liste agents). */
export function profileInitials(user) {
  const name =
    user?.nomComplet?.trim() ||
    user?.defaultUsername?.trim() ||
    user?.email?.trim() ||
    ''
  const s = String(name || '').trim()
  if (!s) return '?'
  const parts = s.split(/\s+/).filter(Boolean)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }
  return s.slice(0, 2).toUpperCase()
}

/**
 * URL d’avatar pour la session (utilisateur + agent Pinia).
 * @param {object | null} user
 * @param {object | null} [agent] — `authStore.agent` si chargé
 * @param {string} [fallback] — SVG neutre si aucune photo
 */
export function getAvatarSrc(user, agent = null, fallback) {
  const resolved = resolveSessionAvatarUrl(user, agent)
  if (resolved) return resolved
  if (fallback != null && String(fallback).trim()) return String(fallback).trim()
  return AVATAR_PLACEHOLDER_SVG
}
