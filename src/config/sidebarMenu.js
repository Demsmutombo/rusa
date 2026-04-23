/**
 * Navigation latérale : structure + filtrage par rôle, permissions (`hasAnyPermission`),
 * et modules (`roleHasModule` + `requiredModule` sur les entrées).
 * Les icônes / chemins / libellés restent alignés sur l’ex-implémentation AppSidebar (pas de changement visuel).
 */

import {
  getDashboardPath,
  userHasAdminModuleAccess,
  roleHasModule,
} from '@/config/roles'
import { PERM } from '@/config/adminModulePermissions'
import {
  LayoutDashboardIcon,
  UserCircleIcon,
  UserGroupIcon,
  PageIcon,
  BoxIcon,
  ListIcon,
  HomeIcon,
  Calendar2Line,
  ErrorIcon,
  BarChartIcon,
  SettingsIcon,
  DocsIcon,
  TableIcon,
  WarningIcon,
} from '@/icons'

export const SIDEBAR_MODULES_VISIBLE = true

export const SIDEBAR_SUPERADMIN_SOCIETES_NAV = true

/**
 * Entrées affichées dans la sidebar **module admin** (rôle admin, super-admin minimal, gérant filtré sur les mêmes clés).
 * Aligné sur les routes `/admin/*` et la gestion métier (sans suppression, statuts via API).
 * @type {string[]}
 */
/** Menu module admin / super-admin minimal : uniquement l’écran déjà géré côté métier. */
export const SIDEBAR_ADMIN_ENABLED_KEYS = [
  'dashboard',
  'agents',
  'clients',
  'destinations',
  'buses',
  'bus-types',
  'voyages',
  'reservations',
  'billets',
]

/** Menu gérant : inchangé côté clés (opérations / admin paths), filtré séparément. */
const SIDEBAR_GERANT_ENABLED_KEYS = [
  'dashboard',
  'trips',
  'voyages',
  'reservations',
  'billets',
  'agents',
  'destinations',
  'buses',
  'bus-types',
  'transporteurs',
]

/** @type {Record<string, string[] | null>} */
export const SIDEBAR_PATHS_WHITELIST = {
  superadmin: null,
  admin: null,
  gerant: null,
  financier: null,
  caissier: null,
  transporteur: null,
  client: null,
}

/**
 * @typedef {object} SidebarMenuContext
 * @property {string | null} role
 * @property {object | null} user
 * @property {(key: string) => string} t
 * @property {(p: string) => boolean} hasPermission
 * @property {(keys: string[]) => boolean} hasAnyPermission
 * @property {(snap: object, catalog: unknown[]) => boolean} userHasAdminModuleAccess
 * @property {(role: string) => string} getDashboardPath
 * @property {unknown[]} roleCatalogActiveRoles
 */

/**
 * @param {unknown[]} items
 * @param {string[] | null | undefined} whitelist
 */
export function filterItemsByWhitelist(items, whitelist) {
  if (!whitelist || whitelist.length === 0) return items
  return items
    .map((item) => {
      if (item.path && whitelist.includes(item.path)) return item
      if (item.subItems) {
        const sub = item.subItems.filter((s) => whitelist.includes(s.path))
        if (sub.length) return { ...item, subItems: sub }
      }
      return null
    })
    .filter(Boolean)
}

/**
 * @param {unknown[]} groups
 * @param {string | null | undefined} role
 */
export function filterMenuGroupsByWhitelist(groups, role) {
  const whitelist = role ? SIDEBAR_PATHS_WHITELIST[role] : null
  if (whitelist == null) return groups
  return groups
    .map((g) => {
      const items = filterItemsByWhitelist(g.items, whitelist)
      if (!items.length) return null
      return { ...g, items }
    })
    .filter(Boolean)
}

/**
 * @param {object} item
 * @param {SidebarMenuContext} ctx
 */
function passesItemGate(item, ctx) {
  /** Rôle `admin` : masquer les entrées dont la liste API (JWT) ne contient aucune des clés requises. */
  if (item.requiredPermissions?.length && ctx.role === 'admin') {
    const ok = item.requiredPermissions.some((k) => ctx.hasPermission(k))
    if (!ok) return false
  }
  if (item.requiredModule) {
    if (!roleHasModule(ctx.role, String(item.requiredModule))) return false
  }
  return true
}

/**
 * @param {unknown[]} items
 * @param {SidebarMenuContext} ctx
 */
function filterItemsByPermissions(items, ctx) {
  return items
    .map((item) => {
      if (!passesItemGate(item, ctx)) return null
      if (item.subItems) {
        const sub = item.subItems.filter((s) => passesItemGate(s, ctx))
        if (!sub.length && !item.path) return null
        return { ...item, subItems: sub }
      }
      return item
    })
    .filter(Boolean)
}

/**
 * @param {unknown[]} groups
 * @param {SidebarMenuContext} ctx
 */
function applyPermissionFilters(groups, ctx) {
  return groups
    .map((g) => {
      const items = filterItemsByPermissions(g.items, ctx)
      if (!items.length) return null
      return { ...g, items }
    })
    .filter(Boolean)
}

/**
 * Entrée « Bus » : liste déroulante avec sections Types de bus / Bus (même base path admin ou super-admin).
 * @param {{ enabled: Set<string>, basePath: string, requiredModule?: string }} opts
 */
function makeBusNavItem(opts) {
  const { enabled, basePath, requiredModule } = opts
  const hasTypes = enabled.has('bus-types')
  const hasBuses = enabled.has('buses')
  if (!hasTypes && !hasBuses) return null

  const typesPath = `${basePath}/bus-types`
  const busesPath = `${basePath}/buses`
  const extra = requiredModule ? { requiredModule } : {}

  const subItems = []
  if (hasTypes) {
    subItems.push({
      name: 'Types de bus',
      path: typesPath,
      requiredPermissions: PERM.busTypes,
    })
  }
  if (hasBuses) {
    subItems.push({
      name: 'Bus',
      path: busesPath,
      requiredPermissions: PERM.buses,
    })
  }

  if (subItems.length === 1) {
    const only = subItems[0]
    const isTypes = only.path.endsWith('/bus-types')
    return {
      key: isTypes ? 'bus-types' : 'buses',
      icon: isTypes ? ListIcon : BoxIcon,
      name: only.name,
      path: only.path,
      requiredPermissions: only.requiredPermissions,
      ...extra,
    }
  }

  return {
    key: 'bus-menu',
    icon: BoxIcon,
    name: 'Bus',
    subItems,
    ...extra,
  }
}

/** @param {SidebarMenuContext} ctx */
function buildSuperAdminMinimal(ctx) {
  const all = [
    { key: 'dashboard', icon: LayoutDashboardIcon, name: ctx.t('dashboard'), path: '/super-admin' },
    { key: 'agents', icon: UserCircleIcon, name: 'Agents', path: '/admin/agents' },
    { key: 'clients', icon: UserGroupIcon, name: 'Clients', path: '/super-admin/clients' },
    { key: 'destinations', icon: PageIcon, name: 'Destinations', path: '/super-admin/destinations' },
  ]
  const enabled = new Set(SIDEBAR_ADMIN_ENABLED_KEYS)
  const busNav = makeBusNavItem({ enabled, basePath: '/super-admin' })
  const voyageRow = {
    key: 'voyages',
    icon: Calendar2Line,
    name: 'Voyages',
    path: '/super-admin/voyages',
  }
  const reservationsRow = {
    key: 'reservations',
    icon: ListIcon,
    name: 'Réservations',
    path: '/admin/reservations',
  }
  const billetsRow = {
    key: 'billets',
    icon: DocsIcon,
    name: 'Billets',
    path: '/admin/billets',
  }
  const items = [
    ...all.filter((row) => enabled.has(row.key)).map(({ key: _k, ...rest }) => rest),
    ...(busNav ? [(({ key: _k, ...rest }) => rest)(busNav)] : []),
    ...(enabled.has('voyages') ? [(({ key: _k, ...rest }) => rest)(voyageRow)] : []),
    ...(enabled.has('reservations') ? [(({ key: _k, ...rest }) => rest)(reservationsRow)] : []),
    ...(enabled.has('billets') ? [(({ key: _k, ...rest }) => rest)(billetsRow)] : []),
  ]
  return [{ title: 'Super-Admin', items }]
}

/** @param {SidebarMenuContext} ctx */
function buildAdminModuleMenu(ctx) {
  const userRole = ctx.role
  const dash = ctx.getDashboardPath(userRole)
  const isSa = userRole === 'superadmin'
  const basePath = isSa ? '/super-admin' : '/admin'
  const title =
    userRole === 'superadmin'
      ? 'Menu Super-Admin'
      : userRole === 'admin'
        ? 'Menu Admin'
        : 'Menu administration'

  const candidates = [
    { key: 'dashboard', icon: LayoutDashboardIcon, name: ctx.t('dashboard'), path: dash },
    {
      key: 'agents',
      icon: UserCircleIcon,
      name: 'Agents',
      path: '/admin/agents',
      requiredPermissions: PERM.agents,
    },
    {
      key: 'clients',
      icon: UserGroupIcon,
      name: 'Clients',
      path: isSa ? '/super-admin/clients' : '/admin/clients',
      requiredPermissions: PERM.clients,
    },
    {
      key: 'destinations',
      icon: PageIcon,
      name: 'Destinations',
      path: isSa ? `${basePath}/destinations` : '/admin/destinations',
      requiredPermissions: PERM.destinations,
    },
  ]

  const enabled = new Set(SIDEBAR_ADMIN_ENABLED_KEYS)
  const busNav = makeBusNavItem({ enabled, basePath })
  if (busNav) candidates.push(busNav)

  candidates.push({
    key: 'voyages',
    icon: Calendar2Line,
    name: 'Voyages',
    path: isSa ? `${basePath}/voyages` : '/admin/voyages',
    requiredPermissions: PERM.voyages,
  })

  candidates.push({
    key: 'reservations',
    icon: ListIcon,
    name: 'Réservations',
    path: '/admin/reservations',
    requiredPermissions: PERM.reservations,
  })

  candidates.push({
    key: 'billets',
    icon: DocsIcon,
    name: 'Billets',
    path: '/admin/billets',
    requiredPermissions: PERM.billets,
  })

  const items = candidates
    .filter((row) => {
      if (row.subItems?.length) return enabled.has('bus-types') || enabled.has('buses')
      return enabled.has(row.key)
    })
    .map(({ key: _k, ...rest }) => rest)

  return [{ title, items }]
}

/** @param {SidebarMenuContext} ctx */
function buildGerantMenu(ctx) {
  const candidates = [
    { key: 'dashboard', icon: LayoutDashboardIcon, name: 'Dashboard', path: '/gerant' },
    {
      key: 'trips',
      icon: HomeIcon,
      name: 'Trajets',
      path: '/admin/trips',
      requiredModule: 'operations',
      requiredPermissions: PERM.trips,
    },
    {
      key: 'voyages',
      icon: Calendar2Line,
      name: 'Voyages',
      path: '/admin/voyages',
      requiredModule: 'operations',
      requiredPermissions: PERM.voyages,
    },
    {
      key: 'reservations',
      icon: Calendar2Line,
      name: 'Réservations',
      path: '/admin/reservations',
      requiredModule: 'operations',
      requiredPermissions: PERM.reservations,
    },
    {
      key: 'billets',
      icon: DocsIcon,
      name: 'Billets',
      path: '/admin/billets',
      requiredModule: 'operations',
      requiredPermissions: PERM.billets,
    },
    {
      key: 'agents',
      icon: UserCircleIcon,
      name: 'Agents',
      path: '/admin/agents',
      requiredModule: 'operations',
      requiredPermissions: PERM.agents,
    },
    {
      key: 'destinations',
      icon: PageIcon,
      name: 'Destinations',
      path: '/admin/destinations',
      requiredModule: 'operations',
      requiredPermissions: PERM.destinations,
    },
    {
      key: 'transporteurs',
      icon: UserCircleIcon,
      name: 'Transporteurs',
      path: '/admin/transporteurs',
      requiredModule: 'operations',
      requiredPermissions: PERM.transporteurs,
    },
  ]
  const enabled = new Set(SIDEBAR_GERANT_ENABLED_KEYS)
  const busNav = makeBusNavItem({
    enabled,
    basePath: '/admin',
    requiredModule: 'operations',
  })
  if (busNav) {
    const voyIdx = candidates.findIndex((r) => r.key === 'voyages')
    if (voyIdx === -1) candidates.push(busNav)
    else candidates.splice(voyIdx, 0, busNav)
  }

  const items = candidates
    .filter((row) => {
      if (row.subItems?.length) return enabled.has('bus-types') || enabled.has('buses')
      return enabled.has(row.key)
    })
    .map(({ key: _k, ...rest }) => rest)
  return [{ title: 'Menu Manager Général', items }]
}

/** @param {SidebarMenuContext} ctx */
function buildFinancierMenu(ctx) {
  return [
    {
      title: 'Menu Financier',
      items: [
        { icon: LayoutDashboardIcon, name: 'Dashboard', path: '/financier' },
        {
          icon: ErrorIcon,
          name: 'Paiements',
          path: '/admin/payments',
          requiredModule: 'payments',
          requiredPermissions: PERM.paiements,
        },
      ],
    },
  ]
}

/** @param {SidebarMenuContext} ctx */
function buildCaissierMenu(ctx) {
  return [
    {
      title: 'Menu Caissier',
      items: [
        { icon: LayoutDashboardIcon, name: 'Dashboard', path: '/caissier' },
        {
          icon: ErrorIcon,
          name: 'Paiements',
          path: '/admin/payments',
          requiredModule: 'payments',
          requiredPermissions: PERM.paiements,
        },
      ],
    },
  ]
}

/** @param {SidebarMenuContext} ctx */
function buildTransporteurMenu(ctx) {
  return [
    {
      title: 'Menu Transporteur',
      items: [
        { icon: LayoutDashboardIcon, name: 'Dashboard', path: '/transport' },
        { icon: HomeIcon, name: 'Trajets', path: '/transport/trips' },
        { icon: BoxIcon, name: 'Véhicules', path: '/transport/vehicles' },
        { icon: Calendar2Line, name: 'Réservations', path: '/transport/reservations' },
        { icon: ErrorIcon, name: 'Paiements', path: '/transport/payments' },
        { icon: BarChartIcon, name: 'Statistiques', path: '/transport/statistics' },
        { icon: SettingsIcon, name: 'Paramètres', path: '/transport/settings' },
      ],
    },
  ]
}

/** @param {SidebarMenuContext} ctx */
function buildClientMenu(ctx) {
  return [
    {
      title: 'Menu Client',
      items: [
        { icon: LayoutDashboardIcon, name: 'Dashboard', path: '/client' },
        { icon: HomeIcon, name: 'Recherche de trajets', path: '/client/search' },
        { icon: Calendar2Line, name: 'Mes réservations', path: '/client/reservations' },
        { icon: ErrorIcon, name: 'Paiements', path: '/client/payments' },
        { icon: UserCircleIcon, name: 'Profil', path: '/client/profile' },
        { icon: SettingsIcon, name: 'Paramètres', path: '/client/settings' },
      ],
    },
  ]
}

/** @param {SidebarMenuContext} ctx */
function buildFallbackTemplateMenu(ctx) {
  return [
    {
      title: 'Menu',
      items: [
        {
          icon: LayoutDashboardIcon,
          name: 'Dashboard',
          subItems: [{ name: 'Ecommerce', path: '/', pro: true, new: true }],
        },
        { icon: Calendar2Line, name: 'Calendar', path: '/calendar' },
        { icon: UserCircleIcon, name: 'User Profile', path: '/profile' },
        {
          name: 'Forms',
          icon: DocsIcon,
          subItems: [{ name: 'Form Elements', path: '/form-elements', pro: true, new: true }],
        },
        {
          name: 'Tables',
          icon: TableIcon,
          subItems: [{ name: 'Basic Tables', path: '/basic-tables', pro: true, new: true }],
        },
        {
          name: 'Pages',
          icon: PageIcon,
          subItems: [
            { name: 'Black Page', path: '/blank', pro: true, new: true },
            { name: '404 Page', path: '/error-404', pro: true, new: true },
          ],
        },
      ],
    },
    {
      title: 'Others',
      items: [
        {
          icon: BarChartIcon,
          name: 'Charts',
          subItems: [
            { name: 'Line Chart', path: '/line-chart', pro: true, new: true },
            { name: 'Bar Chart', path: '/bar-chart', pro: true, new: true },
          ],
        },
        {
          icon: WarningIcon,
          name: 'Ui Elements',
          subItems: [
            { name: 'Alerts', path: '/alerts', pro: true, new: true },
            { name: 'Avatars', path: '/avatars', pro: true, new: true },
            { name: 'Badge', path: '/badge', pro: true, new: true },
            { name: 'Buttons', path: '/buttons', pro: true, new: true },
            { name: 'Images', path: '/images', pro: true, new: true },
            { name: 'Videos', path: '/videos', pro: true, new: true },
          ],
        },
        {
          icon: UserCircleIcon,
          name: 'Authentication',
          subItems: [
            { name: 'Signin', path: '/signin', pro: true, new: true },
            { name: 'Signup', path: '/signup', pro: true, new: true },
          ],
        },
      ],
    },
  ]
}

/**
 * Construit les groupes de menu pour la sidebar (même forme que l’historique AppSidebar).
 * @param {SidebarMenuContext} rawCtx
 */
export function buildSidebarMenuGroups(rawCtx) {
  const ctx = {
    ...rawCtx,
    getDashboardPath: rawCtx.getDashboardPath ?? getDashboardPath,
    userHasAdminModuleAccess:
      rawCtx.userHasAdminModuleAccess ?? userHasAdminModuleAccess,
  }

  const userRole = ctx.role

  if (
    SIDEBAR_SUPERADMIN_SOCIETES_NAV &&
    userRole === 'superadmin' &&
    !SIDEBAR_MODULES_VISIBLE
  ) {
    return filterMenuGroupsByWhitelist(buildSuperAdminMinimal(ctx), userRole)
  }

  if (!SIDEBAR_MODULES_VISIBLE) {
    return []
  }

  let groups

  if (
    ctx.userHasAdminModuleAccess(
      { role: userRole, user: ctx.user },
      ctx.roleCatalogActiveRoles || []
    )
  ) {
    groups = buildAdminModuleMenu(ctx)
  } else if (userRole === 'gerant') {
    groups = buildGerantMenu(ctx)
  } else if (userRole === 'financier') {
    groups = buildFinancierMenu(ctx)
  } else if (userRole === 'caissier') {
    groups = buildCaissierMenu(ctx)
  } else if (userRole === 'transporteur') {
    groups = buildTransporteurMenu(ctx)
  } else if (userRole === 'client') {
    groups = buildClientMenu(ctx)
  } else {
    groups = buildFallbackTemplateMenu(ctx)
  }

  groups = applyPermissionFilters(groups, ctx)
  return filterMenuGroupsByWhitelist(groups, userRole)
}
