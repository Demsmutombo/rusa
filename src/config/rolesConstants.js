/**
 * Référentiel SaaS multi-sociétés — rôles canoniques (alignés API idRole).
 * Source unique pour la matrice des permissions côté app (hors UI).
 */

export const ROLES = [
  { idRole: 1, nom: 'Super-Admin' },
  { idRole: 2, nom: 'Admin' },
  { idRole: 3, nom: 'Gerant' },
  { idRole: 4, nom: 'Transporteur' },
  { idRole: 5, nom: 'Caissier' },
  { idRole: 6, nom: 'Client' },
]

const CANONICAL_ID_TO_SLUG = new Map([
  [1, 'superadmin'],
  [2, 'admin'],
  [3, 'gerant'],
  [4, 'transporteur'],
  [5, 'caissier'],
  [6, 'client'],
])

/** @returns {Set<number>} */
export function canonicalRoleIdSet() {
  return new Set(CANONICAL_ID_TO_SLUG.keys())
}

/**
 * Clé app (slug route / Pinia) à partir d’un idRole canonique 1–6.
 * @param {unknown} idRole
 * @returns {string | null}
 */
export function appSlugFromCanonicalIdRole(idRole) {
  const n = Number(idRole)
  if (!Number.isFinite(n) || n < 1) return null
  return CANONICAL_ID_TO_SLUG.get(n) ?? null
}

/**
 * Fusionne la liste API avec les 6 rôles SaaS (noms canoniques pour 1–6, conserve les rôles API hors plage).
 * @param {Array<{ idRole?: number, nom?: string, statut?: boolean, description?: string, niveau?: number }>} apiList
 */
export function mergeRoleCatalogWithCanonical(apiList) {
  const apiById = new Map(
    (Array.isArray(apiList) ? apiList : [])
      .filter((r) => r && r.idRole != null)
      .map((r) => [Number(r.idRole), r])
  )

  const merged = ROLES.map((c) => {
    const api = apiById.get(c.idRole)
    return {
      idRole: c.idRole,
      nom: c.nom,
      statut: api ? api.statut !== false : true,
      description: api?.description,
      niveau: api?.niveau,
    }
  })

  for (const r of apiList || []) {
    const id = Number(r?.idRole)
    if (!Number.isFinite(id)) continue
    if (CANONICAL_ID_TO_SLUG.has(id)) continue
    merged.push(r)
  }

  return merged
}
