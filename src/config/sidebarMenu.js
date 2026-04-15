/**
 * Affichage des entrées de navigation (sidebar) par rôle.
 * Aucun impact sur le routage, les stores ou les API.
 *
 * - Mettre SIDEBAR_MODULES_VISIBLE à true pour réafficher tout le menu.
 * - Ensuite, optionnel : renseigner SIDEBAR_PATHS_WHITELIST[role] avec une
 *   liste de chemins (ex. ['/admin', '/admin/users']) pour n'afficher que ces liens.
 *   null = pas de filtre (tout le menu du rôle).
 *
 * - SIDEBAR_SUPERADMIN_SOCIETES_NAV : si true et rôle superadmin, affiche au minimum
 *   le groupe « Super-Admin » (Tableau de bord → /super-admin, Sociétés → /super-admin/societes)
 *   même lorsque SIDEBAR_MODULES_VISIBLE est false.
 */

export const SIDEBAR_MODULES_VISIBLE = false

/** Super-Admin : sidebar minimale (aperçu + gestion sociétés) sans sous-menus. */
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
