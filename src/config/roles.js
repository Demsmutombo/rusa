/**
 * Registre rôles SaaS : idRole → nom, slug, dashboardRoute, allowedModules, permissions.
 * Garde-route, module admin, politique métier (chemins).
 */

import { ROLES, appSlugFromCanonicalIdRole } from '@/config/rolesConstants'
import { isPathAllowedForBusinessRole, shouldEnforceBusinessAccess } from '@/config/accessPolicy'

export { ROLES, appSlugFromCanonicalIdRole, mergeRoleCatalogWithCanonical } from '@/config/rolesConstants'

/**
 * @typedef {object} RoleDefinition
 * @property {number | null} idRole — null pour rôles legacy hors planche canonique
 * @property {string} nom
 * @property {string} slug
 * @property {string} dashboardRoute
 * @property {string[]} allowedModules — codes fonctionnels ; `['*']` = tout
 * @property {string[]} permissions — codes grossiers + JWT ; `['*']` = tout côté rôle
 */

/** @type {RoleDefinition[]} */
export const ROLE_REGISTRY = [
  {
    idRole: 1,
    nom: 'Super-Admin',
    slug: 'superadmin',
    dashboardRoute: '/super-admin',
    allowedModules: ['*'],
    permissions: ['*'],
  },
  {
    idRole: 2,
    nom: 'Administrateur',
    slug: 'admin',
    dashboardRoute: '/admin',
    allowedModules: ['company_admin', 'admin', 'operations', 'payments', 'notifications', 'settings'],
    permissions: ['admin.*', 'company.*'],
  },
  {
    idRole: 3,
    nom: 'Gérant',
    slug: 'gerant',
    dashboardRoute: '/gerant',
    allowedModules: ['operations', 'admin_partial'],
    permissions: ['operations.*', 'gerant.*'],
  },
  {
    idRole: 4,
    nom: 'Transporteur',
    slug: 'transporteur',
    dashboardRoute: '/transport',
    allowedModules: ['transport'],
    permissions: ['transport.*'],
  },
  {
    idRole: 5,
    nom: 'Caissier',
    slug: 'caissier',
    dashboardRoute: '/caissier',
    allowedModules: ['payments', 'admin_payments'],
    permissions: ['payments.*', 'caissier.*'],
  },
  {
    idRole: 6,
    nom: 'Client',
    slug: 'client',
    dashboardRoute: '/client',
    allowedModules: ['client'],
    permissions: ['client.*'],
  },
  {
    idRole: null,
    nom: 'Financier',
    slug: 'financier',
    dashboardRoute: '/financier',
    allowedModules: ['payments', 'finance', 'admin_payments'],
    permissions: ['payments.*', 'finance.*'],
  },
]

const REGISTRY_BY_SLUG = new Map(ROLE_REGISTRY.map((r) => [r.slug, r]))
const REGISTRY_BY_ID = new Map(
  ROLE_REGISTRY.filter((r) => r.idRole != null).map((r) => [Number(r.idRole), r])
)

/** @param {string | null | undefined} slug */
export function getRoleDefinitionBySlug(slug) {
  if (!slug) return null
  return REGISTRY_BY_SLUG.get(String(slug)) ?? null
}

/** @param {unknown} idRole */
export function getRoleDefinitionById(idRole) {
  const n = Number(idRole)
  if (!Number.isFinite(n) || n < 1) return null
  return REGISTRY_BY_ID.get(n) ?? null
}

/**
 * @param {string | null | undefined} slug
 * @param {string | undefined} moduleCode — ex. `to.meta.module`
 */
export function roleHasModule(slug, moduleCode) {
  if (!moduleCode) return true
  const def = getRoleDefinitionBySlug(slug)
  if (!def) return false
  if (def.allowedModules.includes('*')) return true
  return def.allowedModules.includes(moduleCode)
}

/**
 * Permissions « rôle » (grossières) + correspondance simple pour `hasPermission`.
 * @param {string | null | undefined} slug
 * @param {string} code
 */
export function roleGrantsPermissionCode(slug, code) {
  if (!code) return false
  const def = getRoleDefinitionBySlug(slug)
  if (!def) return false
  if (def.permissions.includes('*')) return true
  if (def.permissions.includes(code)) return true
  const c = String(code)
  return def.permissions.some((p) => {
    if (p.endsWith('.*')) return c.startsWith(p.slice(0, -1))
    return p === c
  })
}

/** Normalise le nom de rôle API pour comparaisons. */
export function slugifyRoleName(name) {
  if (!name || typeof name !== 'string') return ''
  return name
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[\s_-]+/g, '')
}

/** @param {unknown} id */
function coerceIdRole(id) {
  if (id == null || id === '') return null
  const n = Number(id)
  return Number.isFinite(n) && n > 0 ? n : null
}

/**
 * Extrait idRole depuis une réponse auth / objet utilisateur.
 * @param {Record<string, unknown> | null | undefined} data
 */
export function pickIdRoleFromAuthPayload(data) {
  if (!data || typeof data !== 'object') return null
  const d = /** @type {Record<string, unknown>} */ (data)
  const direct = coerceIdRole(d.roleId ?? d.idRole ?? d.IdRole)
  if (direct) return direct
  const u = d.utilisateur
  if (u && typeof u === 'object') {
    const uo = /** @type {Record<string, unknown>} */ (u)
    const fromUser = coerceIdRole(uo.roleId ?? uo.idRole ?? uo.IdRole)
    if (fromUser) return fromUser
    const pr = uo.primaryRole
    if (pr && typeof pr === 'object') {
      const fromPr = coerceIdRole(
        /** @type {Record<string, unknown>} */ (pr).idRole ??
          /** @type {Record<string, unknown>} */ (pr).IdRole
      )
      if (fromPr) return fromPr
    }
  }
  const prRoot = d.primaryRole
  if (prRoot && typeof prRoot === 'object') {
    const fromPr = coerceIdRole(
      /** @type {Record<string, unknown>} */ (prRoot).idRole ??
        /** @type {Record<string, unknown>} */ (prRoot).IdRole
    )
    if (fromPr) return fromPr
  }
  const roles = d.roles
  if (Array.isArray(roles) && roles.length) {
    const active = roles.find((x) => x && typeof x === 'object' && x.statut !== false) || roles[0]
    if (active && typeof active === 'object') {
      const fromR = coerceIdRole(active.roleId ?? active.idRole ?? active.IdRole)
      if (fromR) return fromR
    }
  }
  return null
}

/**
 * @param {Record<string, unknown> | null | undefined} user
 */
export function pickIdRoleFromUser(user) {
  if (!user || typeof user !== 'object') return null
  const u = /** @type {Record<string, unknown>} */ (user)
  const fromUser = coerceIdRole(u.roleId ?? u.idRole ?? u.IdRole)
  if (fromUser) return fromUser
  const pr = u.primaryRole
  if (pr && typeof pr === 'object') {
    const fromPr = coerceIdRole(
      /** @type {Record<string, unknown>} */ (pr).idRole ??
        /** @type {Record<string, unknown>} */ (pr).IdRole
    )
    if (fromPr) return fromPr
  }
  if (Array.isArray(u.roles) && u.roles.length) {
    const active =
      u.roles.find((x) => x && typeof x === 'object' && x.statut !== false) || u.roles[0]
    if (active && typeof active === 'object') {
      const fromR = coerceIdRole(active.roleId ?? active.idRole ?? active.IdRole)
      if (fromR) return fromR
    }
  }
  return null
}

/**
 * Résout la clé app (slug) à partir d’un idRole canonique (1–6) et/ou du nom API.
 * @param {{ idRole?: unknown, nom?: string, nomRole?: string }} input
 */
export function resolveAppRoleSlug(input) {
  const idRole = coerceIdRole(input?.idRole)
  if (idRole) {
    const fromCanon = appSlugFromCanonicalIdRole(idRole)
    if (fromCanon) return fromCanon
  }

  const nom = String(input?.nom ?? input?.nomRole ?? '').trim()
  return normalizeAppRoleFromNomOnly(nom)
}

/**
 * @param {string} apiRoleName
 * @param {unknown} [idRoleHint]
 */
export function normalizeAppRole(apiRoleName, idRoleHint) {
  return resolveAppRoleSlug({
    idRole: idRoleHint ?? null,
    nom: typeof apiRoleName === 'string' ? apiRoleName : '',
  })
}

function normalizeAppRoleFromNomOnly(apiRoleName) {
  const key = slugifyRoleName(apiRoleName)
  const map = {
    superadmin: 'superadmin',
    superadministrateur: 'superadmin',
    admin: 'admin',
    administrateur: 'admin',
    gerant: 'gerant',
    gérant: 'gerant',
    financier: 'financier',
    caissier: 'caissier',
    client: 'client',
    transporteur: 'transporteur',
    chauffeur: 'transporteur',
    passager: 'client',
    utilisateur: 'client',
  }
  if (map[key]) return map[key]
  if (key) return key
  return 'client'
}

const ADMIN_MODULE_BASE_SLUGS = new Set(['superadmin', 'admin'])

export function getExtraAdminModuleSlugs() {
  return String(import.meta.env.VITE_EXTRA_ADMIN_ROLE_SLUGS || '')
    .split(',')
    .map((s) => slugifyRoleName(s.trim()))
    .filter(Boolean)
}

function catalogEntryGrantsAdminModule(entry) {
  if (!entry || entry.statut === false) return false
  const id = Number(entry.idRole)
  if (id === 1 || id === 2) return true
  const slug = slugifyRoleName(entry.nom)
  if (ADMIN_MODULE_BASE_SLUGS.has(slug) || slug === 'superadministrateur') return true
  return getExtraAdminModuleSlugs().includes(slug)
}

export function userHasAdminModuleAccess(authSnapshot, catalogRoles = []) {
  const appRole = authSnapshot.role
  if (!appRole) return false
  if (ADMIN_MODULE_BASE_SLUGS.has(appRole)) return true
  if (appRole === 'gerant' || appRole === 'caissier' || appRole === 'financier') return true
  if (getExtraAdminModuleSlugs().includes(appRole)) return true

  const idRole =
    authSnapshot.user?.idRole ??
    authSnapshot.user?.id_role ??
    authSnapshot.user?.IdRole
  if (idRole != null && catalogRoles.length) {
    const entry = catalogRoles.find((r) => String(r.idRole) === String(idRole))
    if (catalogEntryGrantsAdminModule(entry)) return true
  }
  return false
}

/**
 * Société obligatoire pour les espaces société (hors Super-Admin et hors zone hors-app).
 * @param {string} path
 */
export function requiresSocieteForPath(path) {
  const p = String(path || '').split('?')[0]
  if (!shouldEnforceBusinessAccess(p)) return false
  if (p.startsWith('/super-admin')) return false
  return true
}

/**
 * @param {import('vue-router').RouteLocationNormalized} to
 * @param {{
 *   isAuthenticated: boolean
 *   role: string | null
 *   societeId: number | string | null
 *   user: object | null
 *   hasAnyPermission: (keys: string[]) => boolean
 * }} ctx
 * @param {Array<{ idRole?: number, nom?: string, statut?: boolean }>} catalogRoles
 * @returns {{ allowed: boolean, reason?: 'public' | 'unauthenticated' | 'societe' | 'module' | 'policy' }}
 */
export function verifyNavigationAccess(to, ctx, catalogRoles = []) {
  if (to.meta.public) {
    return { allowed: true }
  }

  if (to.meta.requiresAuth && !ctx.isAuthenticated) {
    return { allowed: false, reason: 'unauthenticated' }
  }

  if (to.meta.requiresAuth) {
    if (!ctx.role) {
      return { allowed: false, reason: 'policy' }
    }

    if (ctx.role !== 'superadmin' && requiresSocieteForPath(to.path)) {
      const sid = ctx.societeId
      const n = Number(sid)
      if (!Number.isFinite(n) || n <= 0) {
        return { allowed: false, reason: 'societe' }
      }
    }

    if (to.meta.module && !roleHasModule(ctx.role, String(to.meta.module))) {
      return { allowed: false, reason: 'module' }
    }
  }

  const allowed = canAccessPrivateRoute(
    to,
    {
      role: ctx.role,
      user: ctx.user,
      hasAnyPermission: ctx.hasAnyPermission,
    },
    catalogRoles
  )

  return { allowed, reason: allowed ? undefined : 'policy' }
}

/**
 * @param {import('vue-router').RouteLocationNormalized} to
 * @param {{ role: string | null, user: object | null, hasAnyPermission: (keys: string[]) => boolean }} auth
 * @param {Array<{ idRole?: number, nom?: string, statut?: boolean }>} catalogRoles
 */
export function canAccessPrivateRoute(to, auth, catalogRoles = []) {
  const permissions = to.meta.permissions
  if (Array.isArray(permissions) && permissions.length) {
    if (!auth.hasAnyPermission(permissions)) return false
  }

  if (to.meta.adminModule) {
    if (
      !userHasAdminModuleAccess(
        { role: auth.role, user: auth.user },
        catalogRoles
      )
    ) {
      return false
    }
  }

  if (to.meta.roles?.length) {
    if (!auth.role) return false
    if (!to.meta.roles.includes(auth.role)) return false
  }

  if (shouldEnforceBusinessAccess(to.path)) {
    if (!isPathAllowedForBusinessRole(to.path, auth.role)) return false
  }

  return true
}

/** @deprecated Préférer `meta.adminModule` + `userHasAdminModuleAccess`. */
export const ADMIN_MODULE_ROLES = ['superadmin', 'admin']

/** Tableau de bord par défaut (registre). */
export function getDashboardPath(roleSlug) {
  const def = getRoleDefinitionBySlug(roleSlug)
  if (def?.dashboardRoute) return def.dashboardRoute
  return '/client'
}

/** Libellés FR (registre + fallback). */
export const APP_ROLE_LABELS = ROLE_REGISTRY.reduce((acc, r) => {
  acc[r.slug] = r.nom
  return acc
}, /** @type {Record<string, string>} */ ({}))

/** Textes d’accueil du composant RoleDashboard. */
export function getRoleHomeCopy(roleKey) {
  const def = getRoleDefinitionBySlug(roleKey)
  const title = def ? `Espace ${def.nom}` : `Espace ${APP_ROLE_LABELS[roleKey] || roleKey}`
  const copy = {
    superadmin: {
      title: 'Espace Super-Admin',
      body: 'Pilotage global de la plateforme — modules via le menu.',
    },
    admin: {
      title: 'Espace administrateur',
      body: 'Gestion de votre société — modules via le menu.',
    },
    gerant: {
      title: 'Espace gérant',
      body: 'Pilotage opérationnel — modules via le menu.',
    },
    financier: {
      title: 'Espace financier',
      body: 'Suivi financier et paiements — modules via le menu.',
    },
    caissier: {
      title: 'Espace caissier',
      body: 'Encaissements et caisse — modules via le menu.',
    },
    client: {
      title: 'Espace client',
      body: 'Réservations et trajets — modules via le menu.',
    },
    transporteur: {
      title: 'Espace transporteur',
      body: 'Flotte et trajets — modules via le menu.',
    },
  }
  return (
    copy[roleKey] || {
      title,
      body: 'Bienvenue — modules via le menu.',
    }
  )
}
