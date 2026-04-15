// Helper global pour vérifier les permissions
import { useAuthStore } from '@/stores/auth'

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
