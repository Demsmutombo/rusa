/** Clé historique — liste JSON des codes permission (session courante). */
export const LS_LEGACY_PERMISSIONS = 'permissions'
/** Copie explicite (même contenu) pour repérage / outils. */
export const LS_AUTH_PERMISSIONS = 'rusa_auth_permissions'
/**
 * Objet JSON : `{ [idRole: string]: { roleSlug, permissions, updatedAt } }`
 * Mis à jour à chaque connexion / hydratation avec un idRole valide — utile pour comparer les périmètres entre rôles.
 */
export const LS_AUTH_PERMISSIONS_BY_ROLE = 'rusa_auth_permissions_by_role'
