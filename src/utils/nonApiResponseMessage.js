/**
 * Détecte une réponse HTML (ex. index.html du SPA) quand on attendait du JSON API.
 */
export function messageIfHtmlInsteadOfJson(bodyText) {
  const s = String(bodyText || '').trimStart()
  const head = s.slice(0, 300).toLowerCase()
  if (head.includes('<!doctype') || head.includes('<html')) {
    return (
      'Le serveur a renvoyé une page web au lieu du JSON de l’API. ' +
      'En production : créez un fichier .env.production à la racine du projet avec ' +
      'VITE_API_ORIGIN=https://api.rusatravel.cd (origine seule, sans /api final), ' +
      'puis relancez npm run build et redéployez le dossier dist. ' +
      'Autre possibilité : configurer Apache ou nginx pour que les requêtes /api soient transmises au backend.'
    )
  }
  return null
}
