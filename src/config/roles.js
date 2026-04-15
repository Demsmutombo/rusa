/**
 * Rôles API (GET /api/Role) + garde route / permissions.
 * Nouveaux rôles API : slug du `nom` utilisé comme clé app si absent du map (évolutif).
 */

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

/**
 * Clé Pinia / localStorage / garde route.
 * Ex. "Super-Admin" → superadmin, "Gérant" → gerant, "Admin" → admin.
 * Rôle inconnu du map : retourne le slug (ex. "Magasinier" → magasinier) pour routes / dashboard par défaut.
 */
export function normalizeAppRole(apiRoleName) {
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

/** Slugs (clés app) ayant accès natif au module /admin/*. */
const ADMIN_MODULE_BASE_SLUGS = new Set(['superadmin', 'admin'])

/**
 * Slugs supplémentaires (clés app) autorisés sur /admin/* — ex. `gerant,financier`.
 * Variable : VITE_EXTRA_ADMIN_ROLE_SLUGS (séparateur virgule).
 */
export function getExtraAdminModuleSlugs() {
  return String(import.meta.env.VITE_EXTRA_ADMIN_ROLE_SLUGS || '')
    .split(',')
    .map((s) => slugifyRoleName(s.trim()))
    .filter(Boolean)
}

function catalogEntryGrantsAdminModule(entry) {
  if (!entry || entry.statut === false) return false
  const slug = slugifyRoleName(entry.nom)
  if (ADMIN_MODULE_BASE_SLUGS.has(slug) || slug === 'superadministrateur') return true
  return getExtraAdminModuleSlugs().includes(slug)
}

/**
 * Accès au module administration (routes `meta.adminModule`).
 * S’appuie sur la clé app + optionnellement idRole + catalogue GET /api/Role.
 */
export function userHasAdminModuleAccess(authSnapshot, catalogRoles = []) {
  const appRole = authSnapshot.role
  if (!appRole) return false
  if (ADMIN_MODULE_BASE_SLUGS.has(appRole)) return true
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
    return userHasAdminModuleAccess(
      { role: auth.role, user: auth.user },
      catalogRoles
    )
  }

  if (to.meta.roles?.length) {
    if (!auth.role) return false
    if (!to.meta.roles.includes(auth.role)) return false
  }

  return true
}

/** @deprecated Préférer `meta.adminModule` + `userHasAdminModuleAccess`. */
export const ADMIN_MODULE_ROLES = ['superadmin', 'admin']

/** Tableau de bord par défaut après connexion. */
export function getDashboardPath(role) {
  const paths = {
    superadmin: '/super-admin',
    admin: '/admin',
    gerant: '/gerant',
    financier: '/financier',
    caissier: '/caissier',
    client: '/client',
    transporteur: '/transport',
  }
  return paths[role] || '/client'
}

/** Textes d’accueil du composant RoleDashboard. */
export function getRoleHomeCopy(roleKey) {
  const copy = {
    superadmin: {
      title: 'Espace Super-Admin',
      body:
        'Vue d’ensemble et configuration avancée. Les modules du tableau de bord seront affichés progressivement.',
    },
    admin: {
      title: 'Espace administrateur',
      body:
        'Gestion de la plateforme et des équipes. Les modules du tableau de bord seront affichés progressivement.',
    },
    gerant: {
      title: 'Espace gérant',
      body:
        'Pilotage opérationnel et suivi d’activité. Les modules seront affichés progressivement.',
    },
    financier: {
      title: 'Espace financier',
      body:
        'Suivi des flux financiers, rapports et paiements. Les modules seront affichés progressivement.',
    },
    caissier: {
      title: 'Espace caissier',
      body:
        'Encaissements et opérations de caisse. Les modules seront affichés progressivement.',
    },
    client: {
      title: 'Espace client',
      body:
        'Réservations et suivi de vos trajets. Les modules seront affichés progressivement.',
    },
    transporteur: {
      title: 'Espace transporteur',
      body:
        'Trajets, véhicules et réservations. Les modules seront affichés progressivement.',
    },
  }
  return (
    copy[roleKey] || {
      title: `Espace ${APP_ROLE_LABELS[roleKey] || roleKey}`,
      body: 'Bienvenue. Les modules du tableau de bord seront affichés progressivement.',
    }
  )
}

/** Libellés FR pour affichage si l’API ne fournit pas le nom. */
export const APP_ROLE_LABELS = {
  superadmin: 'Super-Admin',
  admin: 'Administrateur',
  gerant: 'Gérant',
  financier: 'Financier',
  caissier: 'Caissier',
  client: 'Client',
  transporteur: 'Transporteur',
}
