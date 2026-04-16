import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

/** Société pour POST métier (admin = session ; super-admin = société « focus »). */
export function useTenantSocieteId() {
  const authStore = useAuthStore()
  const idSocieteForSave = computed(() => {
    if (authStore.role === 'superadmin') {
      const n = Number(authStore.effectiveSocieteId)
      return Number.isFinite(n) && n > 0 ? n : null
    }
    const n = Number(authStore.societeId)
    return Number.isFinite(n) && n > 0 ? n : null
  })
  return { authStore, idSocieteForSave }
}
