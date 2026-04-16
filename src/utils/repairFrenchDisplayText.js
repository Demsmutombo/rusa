/**
 * Normalise une chaîne pour l’affichage (trim).
 * Si l’API a renvoyé de l’UTF-8 lu comme Latin-1 (mojibake), tente une réparation.
 *
 * @param {unknown} value
 * @returns {string}
 */
export function repairFrenchDisplayText(value) {
  if (value == null || value === '') return ''
  const s = String(value).trim()
  if (!s) return ''

  // Pas de motif typique de mojibake UTF-8 / Latin-1 → rien à corriger
  if (!/Ã.|Â.|Ä.|Å./.test(s)) return s

  try {
    const bytes = new Uint8Array(s.length)
    for (let i = 0; i < s.length; i++) bytes[i] = s.charCodeAt(i) & 0xff
    const fixed = new TextDecoder('utf-8', { fatal: false }).decode(bytes)
    const t = fixed.trim()
    if (t.length > 0) return t
  } catch {
    /* garder l’original */
  }
  return s
}
