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
import {
  LayoutDashboardIcon,
  UserCircleIcon,
  PageIcon,
  BoxIcon,
  ListIcon,
  HomeIcon,
  Calendar2Line,
  ErrorIcon,
  BarChartIcon,
  SettingsIcon,
  GridIcon,
  ChatIcon,
  DocsIcon,
  TableIcon,
  WarningIcon,
} from '@/icons'

export const SIDEBAR_MODULES_VISIBLE = true

export const SIDEBAR_SUPERADMIN_SOCIETES_NAV = true

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
  if (item.requiredPermissions?.length) {
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

/** @param {SidebarMenuContext} ctx */
function buildSuperAdminMinimal(ctx) {
  return [
    {
      title: 'Super-Admin',
      items: [
        { icon: LayoutDashboardIcon, name: ctx.t('dashboard'), path: '/super-admin' },
        { icon: UserCircleIcon, name: 'Agents', path: '/super-admin/agents' },
        { icon: PageIcon, name: 'Destinations', path: '/super-admin/destinations' },
        { icon: BoxIcon, name: 'Bus', path: '/super-admin/buses' },
        { icon: ListIcon, name: 'Types de bus', path: '/super-admin/bus-types' },
      ],
    },
  ]
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

  const items = [
    { icon: LayoutDashboardIcon, name: ctx.t('dashboard'), path: dash },
    {
      icon: UserCircleIcon,
      name: 'Agents',
      path: isSa ? `${basePath}/agents` : '/admin/agents',
    },
    {
      icon: PageIcon,
      name: 'Destinations',
      path: isSa ? `${basePath}/destinations` : '/admin/destinations',
    },
    { icon: BoxIcon, name: 'Bus', path: isSa ? `${basePath}/buses` : '/admin/buses' },
    {
      icon: ListIcon,
      name: 'Types de bus',
      path: isSa ? `${basePath}/bus-types` : '/admin/bus-types',
    },
  ]

  if (!isSa && userRole === 'admin') {
    items.push(
      { icon: UserCircleIcon, name: 'Utilisateurs', path: '/admin/users', requiredPermissions: ['admin.users'] },
      { icon: GridIcon, name: 'Sociétés', path: '/admin/societes', requiredPermissions: ['admin.societes'] },
      { icon: UserCircleIcon, name: 'Transporteurs', path: '/admin/transporteurs', requiredPermissions: ['admin.transporteurs'] },
      { icon: HomeIcon, name: 'Trajets', path: '/admin/trips', requiredPermissions: ['admin.trips'] },
      { icon: Calendar2Line, name: 'Réservations', path: '/admin/reservations', requiredPermissions: ['admin.reservations'] },
      { icon: ErrorIcon, name: 'Paiements', path: '/admin/payments', requiredPermissions: ['admin.payments'] },
      { icon: ChatIcon, name: 'Notifications', path: '/admin/notifications', requiredPermissions: ['admin.notifications'] },
      { icon: SettingsIcon, name: 'Paramètres', path: '/admin/settings', requiredPermissions: ['admin.settings'] }
    )
  }

  return [{ title, items }]
}

/** @param {SidebarMenuContext} ctx */
function buildGerantMenu(ctx) {
  return [
    {
      title: 'Menu Manager Général',
      items: [
        { icon: LayoutDashboardIcon, name: 'Dashboard', path: '/gerant' },
        { icon: HomeIcon, name: 'Trajets', path: '/admin/trips', requiredModule: 'operations' },
        { icon: Calendar2Line, name: 'Réservations', path: '/admin/reservations', requiredModule: 'operations' },
        { icon: UserCircleIcon, name: 'Agents', path: '/admin/agents', requiredModule: 'operations' },
        { icon: PageIcon, name: 'Destinations', path: '/admin/destinations', requiredModule: 'operations' },
        { icon: BoxIcon, name: 'Bus', path: '/admin/buses', requiredModule: 'operations' },
        { icon: ListIcon, name: 'Types de bus', path: '/admin/bus-types', requiredModule: 'operations' },
        { icon: UserCircleIcon, name: 'Transporteurs', path: '/admin/transporteurs', requiredModule: 'operations' },
      ],
    },
  ]
}

/** @param {SidebarMenuContext} ctx */
function buildFinancierMenu(ctx) {
  return [
    {
      title: 'Menu Financier',
      items: [
        { icon: LayoutDashboardIcon, name: 'Dashboard', path: '/financier' },
        { icon: ErrorIcon, name: 'Paiements', path: '/admin/payments', requiredModule: 'payments' },
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
        { icon: ErrorIcon, name: 'Paiements', path: '/admin/payments', requiredModule: 'payments' },
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
