/** Libellés profil / rôle (store auth + objet utilisateur API) */

import { APP_ROLE_LABELS } from '@/config/roles'

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

export function getAvatarSrc(user, fallback = '/images/user/owner.jpg') {
  const url = user?.photoUrl
  if (url && String(url).trim()) return String(url).trim()
  return fallback
}
