/**
 * Point d’entrée central : rôles, permissions, règles d’accès (SaaS multi-sociétés).
 * Réexporte la config métier + helpers de navigation.
 */

export {
  ROLES,
  ROLE_REGISTRY,
  resolveAppRoleSlug,
  normalizeAppRole,
  pickIdRoleFromUser,
  pickIdRoleFromAuthPayload,
  getRoleDefinitionBySlug,
  getRoleDefinitionById,
  getDashboardPath,
  roleHasModule,
  roleGrantsPermissionCode,
  verifyNavigationAccess,
  canAccessPrivateRoute,
  userHasAdminModuleAccess,
  requiresSocieteForPath,
  APP_ROLE_LABELS,
  getRoleHomeCopy,
} from '@/config/roles'

export {
  shouldEnforceBusinessAccess,
  isPathAllowedForBusinessRole,
  getBusinessScopeLabel,
} from '@/config/accessPolicy'

export {
  buildSidebarMenuGroups,
  filterMenuGroupsByWhitelist,
  SIDEBAR_MODULES_VISIBLE,
  SIDEBAR_PATHS_WHITELIST,
  SIDEBAR_SUPERADMIN_SOCIETES_NAV,
} from '@/config/sidebarMenu'

export {
  scopeEntitiesToUserSociete,
  assertRowBelongsToUserSociete,
} from '@/utils/societeIsolation'
