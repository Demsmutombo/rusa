/**
 * Origine de l’API (schéma + hôte, sans slash final).
 *
 * - Définir `VITE_API_ORIGIN` au build ou dans `.env` pour pointer vers votre backend.
 * - Si vide : URLs relatives `/api/...` (même origine que le front, ou proxy Vite en dev — voir vite.config.js).
 *
 * Axios peut utiliser `VITE_API_URL` à la place de `getApiOrigin()` si besoin.
 */

export function getApiOrigin() {
  return String(import.meta.env.VITE_API_ORIGIN || '').replace(/\/$/, '')
}

/** Préfixe les chemins /api/... avec l’origine si elle est définie. */
export function resolveApiUrl(path) {
  const origin = getApiOrigin()
  const p = path.startsWith('/') ? path : `/${path}`
  if (!origin) return p
  return `${origin}${p}`
}
