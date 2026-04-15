import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { fetchRoleList } from '@/services/roleService'

const LS_KEY = 'rusa_role_catalog_v1'

export const useRoleCatalogStore = defineStore('roleCatalog', () => {
  const roles = ref([])
  const lastError = ref(null)
  const isLoading = ref(false)

  const activeRoles = computed(() =>
    roles.value.filter((r) => r && r.statut !== false)
  )

  function hydrateFromStorage() {
    try {
      const raw = localStorage.getItem(LS_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) roles.value = parsed
      }
    } catch {
      /* ignore */
    }
  }

  function persist() {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(roles.value))
    } catch {
      /* ignore */
    }
  }

  function clearStorage() {
    localStorage.removeItem(LS_KEY)
  }

  /**
   * @param {string | null | undefined} accessToken
   */
  async function syncFromApi(accessToken) {
    if (!accessToken) return
    isLoading.value = true
    lastError.value = null
    try {
      const list = await fetchRoleList(accessToken)
      roles.value = list
      persist()
    } catch (e) {
      lastError.value = e instanceof Error ? e : new Error(String(e))
      if (import.meta.env.DEV && roles.value.length === 0) {
        console.warn(
          '[roleCatalog] GET /api/Role impossible — cache vide. Définissez VITE_DEV_PROXY_TARGET dans .env vers votre API (ex. https://dev-rusatravel.asdc-rdc.org) ou corrigez le backend local.',
          lastError.value.message
        )
      }
    } finally {
      isLoading.value = false
    }
  }

  function reset() {
    roles.value = []
    lastError.value = null
    clearStorage()
  }

  return {
    roles,
    activeRoles,
    lastError,
    isLoading,
    hydrateFromStorage,
    syncFromApi,
    reset,
  }
})
