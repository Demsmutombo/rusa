// Helper global pour vérifier les permissions
import { useAuthStore } from '@/stores/auth'
import {
  LS_AUTH_PERMISSIONS,
  LS_AUTH_PERMISSIONS_BY_ROLE,
  LS_LEGACY_PERMISSIONS,
} from '@/config/authStorageKeys'

// Fonction globale pour vérifier si l'utilisateur a une permission spécifique
export const hasPermission = (permission) => {
  const authStore = useAuthStore()
  return authStore.hasPermission(permission)
}

// Fonction globale pour vérifier si l'utilisateur a un rôle spécifique
export const hasRole = (role) => {
  const authStore = useAuthStore()
  return authStore.hasRole(role)
}

// Fonction globale pour vérifier si l'utilisateur est authentifié
export const isAuthenticated = () => {
  const authStore = useAuthStore()
  return authStore.isAuthenticated
}

// Fonction globale pour obtenir l'utilisateur actuel
export const getCurrentUser = () => {
  const authStore = useAuthStore()
  return authStore.user
}

// Fonction globale pour obtenir le rôle actuel
export const getCurrentRole = () => {
  const authStore = useAuthStore()
  return authStore.role
}

// Fonction globale pour obtenir les permissions actuelles
export const getCurrentPermissions = () => {
  const authStore = useAuthStore()
  return authStore.permissions
}

/**
 * Liste persistée (session courante), lue depuis le stockage local.
 * @returns {string[]}
 */
export function getStoredPermissionsList() {
  try {
    const raw =
      localStorage.getItem(LS_AUTH_PERMISSIONS) ||
      localStorage.getItem(LS_LEGACY_PERMISSIONS)
    if (!raw) return []
    const p = JSON.parse(raw)
    if (!Array.isArray(p)) return []
    return p.map((x) => String(x))
  } catch {
    return []
  }
}

/**
 * Dernières permissions enregistrées par `idRole` (chaque connexion met à jour l’entrée du rôle courant).
 * @returns {Record<string, { roleSlug: string, permissions: string[], updatedAt: string }>}
 */
export function getStoredPermissionsByRole() {
  try {
    const raw = localStorage.getItem(LS_AUTH_PERMISSIONS_BY_ROLE)
    if (!raw) return {}
    const o = JSON.parse(raw)
    return o && typeof o === 'object' ? o : {}
  } catch {
    return {}
  }
}

/**
 * @param {number | string} idRole
 * @returns {{ roleSlug: string, permissions: string[], updatedAt: string } | null}
 */
export function getStoredPermissionsForRole(idRole) {
  const key = String(idRole)
  const map = getStoredPermissionsByRole()
  const e = map[key]
  return e && typeof e === 'object' ? e : null
}
