/**
 * Cache local des destinations passées en « inactif » : certains GET n’en renvoient plus,
 * ce qui empêchait de les réactiver après un rechargement ou en revenant sur la page.
 */

const CACHE_KEY = 'rusaTravel.destinationInactiveRows.v1'

function destinationId(d) {
  return Number(d?.idDestination ?? d?.IdDestination ?? 0)
}

export function loadInactiveDestinationCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    const arr = raw ? JSON.parse(raw) : []
    return Array.isArray(arr) ? arr : []
  } catch {
    return []
  }
}

function saveInactiveDestinationCache(rows) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(rows))
  } catch {
    /* quota / mode privé */
  }
}

/**
 * Fusionne la liste API avec les destinations inactives mémorisées (absentes du GET).
 * Retire du cache toute entrée dont l’id est déjà renvoyé par l’API (évite doublons si le backend évolue).
 * @param {unknown[]} apiList
 */
export function mergeDestinationsWithInactiveCache(apiList) {
  const api = Array.isArray(apiList) ? [...apiList] : []
  const apiIds = new Set(api.map((x) => destinationId(x)))
  const cache = loadInactiveDestinationCache().filter((c) => {
    const id = destinationId(c)
    return id > 0 && !apiIds.has(id)
  })
  saveInactiveDestinationCache(cache)
  for (const c of cache) {
    api.push({
      ...c,
      statut: false,
      Statut: false,
    })
  }
  return api
}

/** Après désactivation réussie : mémoriser la ligne pour les prochains chargements. */
export function rememberInactiveDestination(row) {
  const id = destinationId(row)
  if (!id) return
  const cache = loadInactiveDestinationCache().filter((x) => destinationId(x) !== id)
  cache.push({
    ...row,
    statut: false,
    Statut: false,
  })
  saveInactiveDestinationCache(cache)
}

/** Après réactivation : retirer du cache (la ligne doit revenir via l’API). */
export function forgetInactiveDestination(id) {
  const idn = Number(id)
  if (!Number.isFinite(idn) || idn <= 0) return
  const cache = loadInactiveDestinationCache().filter((x) => destinationId(x) !== idn)
  saveInactiveDestinationCache(cache)
}
