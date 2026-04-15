/**
 * Lecture des claims JWT (sans vérification de signature — usage client pour idAgent, etc.).
 */

export function decodeJwtPayload(accessToken) {
  if (!accessToken || typeof accessToken !== 'string') return null
  try {
    const parts = accessToken.split('.')
    if (parts.length < 2) return null
    let base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const pad = base64.length % 4
    if (pad) base64 += '='.repeat(4 - pad)
    return JSON.parse(atob(base64))
  } catch {
    return null
  }
}

/** idAgent issu du token (claims ASP.NET souvent `IdAgent`). */
export function idAgentFromToken(accessToken) {
  const p = decodeJwtPayload(accessToken)
  if (!p || typeof p !== 'object') return null
  const v = p.IdAgent ?? p.idAgent ?? p.IDAgent
  if (v == null || v === '') return null
  const n = Number(v)
  return Number.isFinite(n) && n > 0 ? n : null
}

/**
 * Indications de session à partir du JWT (réhydratation après F5 si localStorage partiel).
 * @returns {null | { roleNom: string, email: string, name: string, idUtilisateur: string | number | null, idRole: string | number | null, idSociete: string | number | null, idAgent: number | null }}
 */
export function sessionHintsFromJwt(accessToken) {
  const p = decodeJwtPayload(accessToken)
  if (!p || typeof p !== 'object') return null

  let roleNom = p.primaryRole ?? p.PrimaryRole
  if (roleNom && typeof roleNom === 'object') roleNom = roleNom.nom ?? roleNom.Nom
  if (!roleNom) {
    roleNom =
      p['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ??
      p.role ??
      p.Role
  }
  if (Array.isArray(roleNom)) roleNom = roleNom[0]
  if (roleNom != null && typeof roleNom !== 'string') roleNom = String(roleNom)

  const email =
    p.email ?? p.Email ?? p.unique_name ?? p['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress']
  const name = p.name ?? p.Name ?? p.unique_name
  const idUtilisateur = p.IdUtilisateur ?? p.idUtilisateur ?? p.sub ?? null
  const idRole = p.idRole ?? p.IdRole ?? null
  const idSociete = p.idSociete ?? p.IdSociete ?? null

  return {
    roleNom: roleNom || '',
    email: email != null ? String(email) : '',
    name: name != null ? String(name) : '',
    idUtilisateur,
    idRole,
    idSociete,
    idAgent: idAgentFromToken(accessToken),
  }
}
