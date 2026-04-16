/**
 * Politique d’accès métier multi-sociétés (centralisée).
 * Super-Admin : plateforme globale | Admin : société complète | Gerant : opérations |
 * Transporteur : transport | Caissier : paiements | Client : espace client.
 *
 * Complète `meta.roles` / `meta.adminModule` en restreignant les chemins par rôle.
 */

/** Préfixes de chemins applicatifs soumis à cette politique. */
const APP_PATH_RE = /^\/(super-admin|admin|gerant|financier|caissier|transport|client)(\/|$)/

/**
 * @param {string} path
 */
export function shouldEnforceBusinessAccess(path) {
  const p = String(path || '').split('?')[0]
  return APP_PATH_RE.test(p)
}

/**
 * @param {string} path
 * @param {string} prefix — sans slash final sauf besoin exact
 */
function pathUnderPrefix(path, prefix) {
  const p = String(path || '').split('?')[0]
  if (p === prefix) return true
  if (!prefix.endsWith('/')) return p.startsWith(prefix + '/')
  return p.startsWith(prefix)
}

/** Sous-ensemble « gestion opérationnelle » du module /admin pour le gérant. */
const GERANT_ADMIN_PREFIXES = [
  '/admin/trips',
  '/admin/reservations',
  '/admin/agents',
  '/admin/destinations',
  '/admin/buses',
  '/admin/bus-types',
  '/admin/transporteurs',
]

/**
 * @param {string | null | undefined} roleSlug — clé app (ex. admin, gerant)
 * @param {string} path
 * @returns {boolean}
 */
export function isPathAllowedForBusinessRole(path, roleSlug) {
  const slug = roleSlug || ''
  const p = String(path || '').split('?')[0]

  if (!shouldEnforceBusinessAccess(p)) return true

  /** Accès global plateforme (toutes sociétés, tous espaces applicatifs). */
  if (slug === 'superadmin') return true

  if (pathUnderPrefix(p, '/super-admin')) return false

  if (slug === 'admin') {
    if (pathUnderPrefix(p, '/admin')) return true
    return false
  }

  if (slug === 'gerant') {
    if (pathUnderPrefix(p, '/gerant')) return true
    if (pathUnderPrefix(p, '/admin')) {
      return GERANT_ADMIN_PREFIXES.some((prefix) => pathUnderPrefix(p, prefix))
    }
    return false
  }

  if (slug === 'transporteur') {
    return pathUnderPrefix(p, '/transport')
  }

  if (slug === 'caissier') {
    if (pathUnderPrefix(p, '/caissier')) return true
    if (pathUnderPrefix(p, '/admin/payments')) return true
    return false
  }

  if (slug === 'financier') {
    if (pathUnderPrefix(p, '/financier')) return true
    if (pathUnderPrefix(p, '/admin/payments')) return true
    return false
  }

  if (slug === 'client') {
    return pathUnderPrefix(p, '/client')
  }

  return false
}

/**
 * Libellé fonctionnel du périmètre (documentation / logs).
 * @param {string | null | undefined} roleSlug
 */
export function getBusinessScopeLabel(roleSlug) {
  const map = {
    superadmin: 'global_toutes_societes',
    admin: 'societe_complet',
    gerant: 'operations',
    transporteur: 'transport',
    caissier: 'paiements',
    client: 'client',
    financier: 'paiements_finance',
  }
  return map[roleSlug] || 'inconnu'
}
