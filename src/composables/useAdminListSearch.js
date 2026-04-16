import { computed, ref } from 'vue'

/**
 * Filtre client (recherche texte + option statut actif/inactif).
 * @template T
 * @param {import('vue').Ref<T[]>} sourceRef
 * @param {(row: T, needle: string) => boolean} matchText — `needle` : chaîne déjà normalisée (trim + lower)
 * @param {{ rowStatut?: (row: T) => boolean }} [options]
 */
export function useAdminListSearch(sourceRef, matchText, options = {}) {
  const searchQuery = ref('')
  const statutFilter = ref('all')

  const filteredRows = computed(() => {
    const list = Array.isArray(sourceRef.value) ? [...sourceRef.value] : []
    const needle = String(searchQuery.value || '').trim().toLowerCase()
    let out = needle ? list.filter((r) => matchText(r, needle)) : list
    if (options.rowStatut && statutFilter.value !== 'all') {
      const wantActive = statutFilter.value === 'active'
      out = out.filter((r) => options.rowStatut(r) === wantActive)
    }
    return out
  })

  const hasActiveFilters = computed(() => {
    if (String(searchQuery.value || '').trim()) return true
    if (statutFilter.value !== 'all') return true
    return false
  })

  function clearFilters() {
    searchQuery.value = ''
    statutFilter.value = 'all'
  }

  return { searchQuery, statutFilter, filteredRows, hasActiveFilters, clearFilters }
}
