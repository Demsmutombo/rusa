/**
 * Filtrage client des listes par société (complément X-Societe-Id / backend).
 * Super-Admin : pas de filtre. Autres rôles : uniquement les lignes de `societeId` courant.
 */

const DEFAULT_KEYS = ['idSociete', 'IdSociete', 'societeId']

function rowSocieteId(row, keys) {
  for (const k of keys) {
    const v = row?.[k]
    if (v != null && v !== '') {
      const n = Number(v)
      if (Number.isFinite(n) && n > 0) return n
    }
  }
  return null
}

/**
 * @param {unknown[]} list
 * @param {{ role: string | null, societeId: number | null }} authLike
 * @param {string[]} [keys]
 * @returns {unknown[]}
 */
export function scopeEntitiesToUserSociete(list, authLike, keys = DEFAULT_KEYS) {
  if (!Array.isArray(list)) return []
  if (authLike?.role === 'superadmin') return list
  const sid = Number(authLike?.societeId)
  if (!Number.isFinite(sid) || sid <= 0) return []
  return list.filter((row) => {
    const rid = rowSocieteId(row, keys)
    return rid != null && rid === sid
  })
}

/**
 * @param {object | null} row
 * @param {{ role: string | null, societeId: number | null }} authLike
 * @param {string[]} [keys]
 */
export function assertRowBelongsToUserSociete(row, authLike, keys = DEFAULT_KEYS) {
  if (!row || authLike?.role === 'superadmin') return true
  const sid = Number(authLike?.societeId)
  if (!Number.isFinite(sid) || sid <= 0) return false
  const rid = rowSocieteId(row, keys)
  return rid != null && rid === sid
}
