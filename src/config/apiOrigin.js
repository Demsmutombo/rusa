/**
 * Origine de l’API (schéma + hôte, sans slash final).
 *
 * - Définir `VITE_API_ORIGIN` au build ou dans `.env` pour pointer vers votre backend.
 * - Si vide : URLs relatives `/api/...` (même origine que le front, ou proxy Vite en dev — voir vite.config.js).
 * - Sur Vercel : par défaut origine vide → `/api/...` passe par le proxy défini dans `vercel.json` (évite CORS).
 *   Pour appeler l’API en direct (CORS déjà configuré côté backend), définir `VITE_DISABLE_VERCEL_API_PROXY=1`
 *   et `VITE_API_ORIGIN` vers l’URL du backend.
 *
 * Axios peut utiliser `VITE_API_URL` à la place de `getApiOrigin()` si besoin.
 */

export function getApiOrigin() {
  const explicit = String(import.meta.env.VITE_API_ORIGIN || '').replace(/\/$/, '')
  const disableVercelProxy =
    String(import.meta.env.VITE_DISABLE_VERCEL_API_PROXY || '').trim() === '1'
  if (import.meta.env.VERCEL && !disableVercelProxy) {
    return ''
  }
  return explicit
}

/** Préfixe les chemins /api/... avec l’origine si elle est définie. */
export function resolveApiUrl(path) {
  const origin = getApiOrigin()
  const p = path.startsWith('/') ? path : `/${path}`
  if (!origin) return p
  return `${origin}${p}`
}
