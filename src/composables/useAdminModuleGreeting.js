import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

/**
 * Sous-titre d’en-tête espace admin : « {Prénom}, … » + phrase courte (même principe que le tableau de bord admin).
 * @param {string} line — phrase après le prénom (ex. « bienvenue — … ci-dessous. »)
 */
export function useAdminModuleGreeting(line) {
  const authStore = useAuthStore()
  return computed(() => {
    const full = String(authStore.user?.nomComplet || authStore.user?.NomComplet || '').trim()
    const first = full ? full.split(/\s+/)[0] : ''
    const greet = first ? `${first}, ` : ''
    return `${greet}${line}`
  })
}
