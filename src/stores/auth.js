import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  login,
  disconnectUser,
  extractPermissionsFromAuthPayload,
} from '@/services/authService'
import { resolveAgentForUser, pickAgentPhotoUrl } from '@/services/agentService'
import {
  normalizeAppRole,
  pickIdRoleFromAuthPayload,
  pickIdRoleFromUser,
  resolveAppRoleSlug,
  getRoleDefinitionBySlug,
  roleGrantsPermissionCode,
} from '@/config/roles'
import { useRoleCatalogStore } from '@/stores/roleCatalog'
import { idAgentFromToken, sessionHintsFromJwt } from '@/utils/jwtClaims'
import {
  LS_AUTH_PERMISSIONS,
  LS_AUTH_PERMISSIONS_BY_ROLE,
  LS_LEGACY_PERMISSIONS,
} from '@/config/authStorageKeys'

export { normalizeAppRole, resolveAppRoleSlug } from '@/config/roles'

const LS_SA_TENANT_SOCIETE = 'rusa_sa_active_societe'
const LS_AUTH_ROLE_ID = 'rusa_auth_role_id'
const LS_AUTH_ROLE_NAME = 'rusa_auth_role_name'
const LS_AUTH_SOCIETE_ID = 'rusa_auth_societe_id'
const DISABLE_AUTH_BOOTSTRAP_API =
  String(import.meta.env.VITE_DISABLE_AUTH_BOOTSTRAP_API ?? '1').trim() === '1'

/** Extrait le libellé de rôle principal depuis la réponse POST authentifier (ou un objet utilisateur). */
function extractPrimaryRoleNom(data) {
  if (data?.nomRole) return data.nomRole
  if (data?.primaryRole?.nom) return data.primaryRole.nom
  const u = data?.utilisateur ?? data
  if (u?.primaryRole?.nom) return u.primaryRole.nom
  if (Array.isArray(u?.roles) && u.roles.length) {
    const r = u.roles.find((x) => x?.statut !== false) || u.roles[0]
    if (r?.nom) return r.nom
  }
  if (Array.isArray(data?.roles) && data.roles.length) {
    const r = data.roles.find((x) => x?.statut !== false) || data.roles[0]
    if (r?.nom) return r.nom
  }
  return ''
}

/**
 * Expose `societeId` / `roleId` alignés sur `idSociete` / `idRole` (contrat métier multi-société).
 * @param {Record<string, unknown>} u
 * @param {Record<string, unknown> | null | undefined} dataRoot
 */
function syncTenantFieldsOnUser(u, dataRoot) {
  const o = { ...u }
  const dr = dataRoot && typeof dataRoot === 'object' ? dataRoot : {}
  const sid =
    o.societeId ??
    o.idSociete ??
    o.IdSociete ??
    dr.societeId ??
    dr.idSociete ??
    dr.IdSociete
  if (sid != null && sid !== '') {
    const n = Number(sid)
    if (Number.isFinite(n) && n > 0) {
      o.societeId = n
      if (o.idSociete == null) o.idSociete = n
    }
  }
  const rid =
    o.roleId ?? o.idRole ?? o.IdRole ?? dr.roleId ?? dr.idRole ?? dr.IdRole
  if (rid != null && rid !== '') {
    const n = Number(rid)
    if (Number.isFinite(n) && n > 0) {
      o.roleId = n
      if (o.idRole == null) o.idRole = n
    }
  }
  return o
}

/** Fusionne le bloc utilisateur avec primaryRole / roles présents à la racine de la réponse API. */
function enrichUtilisateurFromAuthPayload(data) {
  const u = data?.utilisateur ? { ...data.utilisateur } : null
  if (!u) return null
  if (!u.primaryRole && data.primaryRole) u.primaryRole = data.primaryRole
  if ((!u.roles || !u.roles.length) && Array.isArray(data.roles) && data.roles.length) {
    u.roles = data.roles
  }
  if (u.idRole == null && data.idRole != null) u.idRole = data.idRole
  if (u.idRole == null && data.roleId != null) u.idRole = data.roleId
  if (u.idAgent == null && data.idAgent != null) u.idAgent = data.idAgent
  if (u.idSociete == null && data.idSociete != null) u.idSociete = data.idSociete
  if (u.idSociete == null && data.IdSociete != null) u.idSociete = data.IdSociete
  if (u.idSociete == null && data.societeId != null) u.idSociete = data.societeId
  return syncTenantFieldsOnUser(u, data)
}

function normalizePermissionsList(raw) {
  if (!raw) return []
  if (!Array.isArray(raw)) return []
  const out = []
  for (const p of raw) {
    if (typeof p === 'string') out.push(p)
    else if (p && typeof p === 'object') {
      const c = p.code ?? p.Code ?? p.nom ?? p.permission ?? p.name
      if (c != null) out.push(String(c))
    }
  }
  return out
}

/**
 * Persiste la liste de permissions (session + clés `rusa_*` + entrée par `idRole` pour comparaisons multi-rôles).
 * @param {unknown} perms
 * @param {{ idRole?: number | string | null, roleSlug?: string | null }} [opts]
 */
function writePermissionsLocal(perms, opts = {}) {
  const list = normalizePermissionsList(perms)
  const { idRole = null, roleSlug = '' } = opts
  try {
    localStorage.setItem(LS_LEGACY_PERMISSIONS, JSON.stringify(list))
    localStorage.setItem(LS_AUTH_PERMISSIONS, JSON.stringify(list))
  } catch {
    /* ignore */
  }
  const n = idRole != null && idRole !== '' ? Number(idRole) : NaN
  if (!Number.isFinite(n) || n <= 0) return
  try {
    let map = {}
    const raw = localStorage.getItem(LS_AUTH_PERMISSIONS_BY_ROLE)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed && typeof parsed === 'object') map = parsed
    }
    map[String(n)] = {
      roleSlug: String(roleSlug || ''),
      permissions: list,
      updatedAt: new Date().toISOString(),
    }
    localStorage.setItem(LS_AUTH_PERMISSIONS_BY_ROLE, JSON.stringify(map))
  } catch {
    /* ignore */
  }
}

function applyRoleFromUserPayload(userPayload) {
  const idr = pickIdRoleFromUser(userPayload)
  const nom = extractPrimaryRoleNom({ utilisateur: userPayload })
  return resolveAppRoleSlug({ idRole: idr, nom })
}

export const useAuthStore = defineStore('auth', () => {
  // STATE
  const user = ref(null)
  const token = ref(localStorage.getItem('accessToken'))
  const role = ref(localStorage.getItem('role'))
  const permissions = ref([])
  const client = ref(null)
  const agent = ref(null)
  const isLoading = ref(false)
  /** Contexte société pour Super-Admin (API multi-tenant) ; ignoré pour les autres rôles. */
  const superAdminTenantSocieteId = ref(null)

  /** Champs de session explicites (persistés) — alignés JWT / profil. */
  const sessionRoleId = ref(null)
  const sessionRoleName = ref('')
  const sessionSocieteId = ref(null)

  function persistAuthSessionFields() {
    try {
      if (sessionRoleId.value != null && Number(sessionRoleId.value) > 0) {
        localStorage.setItem(LS_AUTH_ROLE_ID, String(sessionRoleId.value))
      } else {
        localStorage.removeItem(LS_AUTH_ROLE_ID)
      }
      if (String(sessionRoleName.value || '').trim()) {
        localStorage.setItem(LS_AUTH_ROLE_NAME, String(sessionRoleName.value).trim())
      } else {
        localStorage.removeItem(LS_AUTH_ROLE_NAME)
      }
      if (sessionSocieteId.value != null && Number(sessionSocieteId.value) > 0) {
        localStorage.setItem(LS_AUTH_SOCIETE_ID, String(sessionSocieteId.value))
      } else {
        localStorage.removeItem(LS_AUTH_SOCIETE_ID)
      }
    } catch {
      /* ignore */
    }
  }

  function hydrateAuthSessionFields() {
    try {
      const rid = localStorage.getItem(LS_AUTH_ROLE_ID)
      if (rid != null && rid !== '') {
        const n = Number(rid)
        if (Number.isFinite(n) && n > 0) sessionRoleId.value = n
      }
    } catch {
      sessionRoleId.value = null
    }
    try {
      const rn = localStorage.getItem(LS_AUTH_ROLE_NAME)
      sessionRoleName.value = rn != null ? String(rn) : ''
    } catch {
      sessionRoleName.value = ''
    }
    try {
      const sid = localStorage.getItem(LS_AUTH_SOCIETE_ID)
      if (sid != null && sid !== '') {
        const n = Number(sid)
        if (Number.isFinite(n) && n > 0) sessionSocieteId.value = n
      }
    } catch {
      sessionSocieteId.value = null
    }
  }

  function clearAuthSessionFields() {
    sessionRoleId.value = null
    sessionRoleName.value = ''
    sessionSocieteId.value = null
    try {
      localStorage.removeItem(LS_AUTH_ROLE_ID)
      localStorage.removeItem(LS_AUTH_ROLE_NAME)
      localStorage.removeItem(LS_AUTH_SOCIETE_ID)
    } catch {
      /* ignore */
    }
  }

  /**
   * @param {Record<string, unknown> | null} utilisateur
   * @param {string | null} roleSlug
   * @param {number | null} idRoleResolved
   * @param {string} rawRoleNom
   */
  function syncSessionFromResolvedUser(utilisateur, roleSlug, idRoleResolved, rawRoleNom) {
    const idr =
      idRoleResolved ??
      (utilisateur ? pickIdRoleFromUser(utilisateur) : null) ??
      null
    if (idr != null && Number(idr) > 0) {
      sessionRoleId.value = Number(idr)
    } else {
      sessionRoleId.value = null
    }

    const nameFromApi = String(rawRoleNom || '').trim()
    const nameFromUser = utilisateur ? extractPrimaryRoleNom({ utilisateur }) : ''
    const defNom = roleSlug ? getRoleDefinitionBySlug(roleSlug)?.nom : ''
    sessionRoleName.value = nameFromApi || nameFromUser || defNom || ''

    if (utilisateur) {
      const sid = utilisateur.societeId ?? utilisateur.idSociete ?? utilisateur.IdSociete
      const n = Number(sid)
      sessionSocieteId.value = Number.isFinite(n) && n > 0 ? n : null
    } else {
      sessionSocieteId.value = null
    }

    persistAuthSessionFields()
  }

  // GETTERS
  const isAuthenticated = computed(() => !!token.value)

  /**
   * Société « logique » (UI / contexte) : pour le super-admin, filtre optionnel persisté en local.
   * Ne pas utiliser pour les en-têtes HTTP — voir `apiSocieteId`.
   */
  const effectiveSocieteId = computed(() => {
    if (role.value === 'superadmin') {
      const n = Number(superAdminTenantSocieteId.value)
      return Number.isFinite(n) && n > 0 ? n : null
    }
    const u = user.value
    if (!u) return null
    const sid = u.societeId ?? u.idSociete ?? u.IdSociete
    const n = Number(sid)
    return Number.isFinite(n) && n > 0 ? n : null
  })

  /**
   * societeId à envoyer sur les requêtes API : toujours absent pour Super-Admin (accès global),
   * sinon `societeId` / `idSociete` de l’utilisateur.
   */
  const apiSocieteId = computed(() => {
    if (role.value === 'superadmin') return null
    const u = user.value
    if (!u) return null
    const sid = u.societeId ?? u.idSociete ?? u.IdSociete
    const n = Number(sid)
    return Number.isFinite(n) && n > 0 ? n : null
  })

  const roleId = computed(() => {
    if (sessionRoleId.value != null) {
      const sn = Number(sessionRoleId.value)
      if (Number.isFinite(sn) && sn > 0) return sn
    }
    const u = user.value
    if (!u) return null
    const rid = u.roleId ?? u.idRole ?? u.IdRole
    const n = Number(rid)
    return Number.isFinite(n) && n > 0 ? n : null
  })

  const societeId = computed(() => {
    if (sessionSocieteId.value != null) {
      const sn = Number(sessionSocieteId.value)
      if (Number.isFinite(sn) && sn > 0) return sn
    }
    const u = user.value
    if (!u) return null
    const sid = u.societeId ?? u.idSociete ?? u.IdSociete
    const n = Number(sid)
    return Number.isFinite(n) && n > 0 ? n : null
  })

  const roleName = computed(() => {
    const s = String(sessionRoleName.value || '').trim()
    if (s) return s
    if (user.value) {
      const fromUser = extractPrimaryRoleNom({ utilisateur: user.value })
      if (fromUser) return fromUser
    }
    const def = getRoleDefinitionBySlug(role.value)
    return def?.nom || ''
  })

  // ACTIONS
  const loginAction = async (email, password) => {
    try {
      isLoading.value = true
      console.log('Début de la connexion dans le store...')
      
      const data = await login(email, password)
      console.log('Données reçues dans le store:', data)

      if (data.success === false) {
        throw new Error(data.message || 'Erreur de connexion')
      }

      // Stocker le token (JWT)
      token.value = data.accessToken
      localStorage.setItem('accessToken', data.accessToken)
      if (data.tokenType) {
        localStorage.setItem('tokenType', data.tokenType)
      }
      if (data.expiresIn != null) {
        localStorage.setItem('expiresIn', String(data.expiresIn))
      }

      // Utilisateur enrichi (primaryRole / roles souvent à la racine de la réponse Swagger)
      let utilisateur = enrichUtilisateurFromAuthPayload(data)
      if (utilisateur && utilisateur.idAgent == null) {
        const aid = idAgentFromToken(data.accessToken)
        if (aid != null) utilisateur = { ...utilisateur, idAgent: aid }
      }
      const jwtHints = sessionHintsFromJwt(data.accessToken)
      if (utilisateur && jwtHints) {
        if (utilisateur.idSociete == null && jwtHints.idSociete != null) {
          utilisateur = { ...utilisateur, idSociete: jwtHints.idSociete }
        }
        if (utilisateur.idRole == null && jwtHints.idRole != null) {
          utilisateur = { ...utilisateur, idRole: jwtHints.idRole }
        }
      }
      if (utilisateur) utilisateur = syncTenantFieldsOnUser(utilisateur, data)
      user.value = utilisateur
      localStorage.setItem('user', JSON.stringify(utilisateur))

      const idRoleResolved =
        pickIdRoleFromUser(utilisateur) ??
        pickIdRoleFromAuthPayload(data) ??
        (jwtHints?.idRole != null ? Number(jwtHints.idRole) : null)
      const rawRoleNom = extractPrimaryRoleNom(data)
      role.value = resolveAppRoleSlug({ idRole: idRoleResolved, nom: rawRoleNom })
      localStorage.setItem('role', role.value)

      syncSessionFromResolvedUser(utilisateur, role.value, idRoleResolved, rawRoleNom)

      console.log('Rôle API:', rawRoleNom, 'idRole:', idRoleResolved, '→ app:', role.value)

      if (role.value === 'superadmin') {
        try {
          const raw = localStorage.getItem(LS_SA_TENANT_SOCIETE)
          const n = raw != null ? Number(raw) : NaN
          if (Number.isFinite(n) && n > 0) superAdminTenantSocieteId.value = n
        } catch {
          superAdminTenantSocieteId.value = null
        }
      } else {
        superAdminTenantSocieteId.value = null
      }

      const perms = normalizePermissionsList(extractPermissionsFromAuthPayload(data))
      permissions.value = perms
      writePermissionsLocal(perms, {
        idRole: idRoleResolved,
        roleSlug: role.value,
      })

      const roleCatalog = useRoleCatalogStore()
      if (!DISABLE_AUTH_BOOTSTRAP_API) {
        await roleCatalog.syncFromApi(data.accessToken)
      }

      if (data.client) {
        client.value = data.client
        localStorage.setItem('client', JSON.stringify(data.client))
      } else {
        client.value = null
        localStorage.removeItem('client')
      }

      if (data.agent) {
        agent.value = data.agent
        const raw = JSON.stringify(data.agent)
        localStorage.setItem('agent', raw)
        localStorage.setItem('agentData', raw)
      } else {
        agent.value = null
        localStorage.removeItem('agent')
        localStorage.removeItem('agentData')
      }

      if (user.value && agent.value) {
        const fromAgent = pickAgentPhotoUrl(agent.value)
        if (fromAgent && !pickAgentPhotoUrl(user.value)) {
          const u = { ...user.value, photoUrl: fromAgent }
          user.value = u
          localStorage.setItem('user', JSON.stringify(u))
        }
      }

      if (data.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken)
      } else {
        localStorage.removeItem('refreshToken')
      }
      if (data.expiresAt) {
        localStorage.setItem('expiresAt', data.expiresAt)
      } else {
        localStorage.removeItem('expiresAt')
      }

      if (!DISABLE_AUTH_BOOTSTRAP_API) {
        await refreshUserProfile().catch(() => null)
      }

      return data
    } catch (error) {
      console.error('Erreur dans loginAction:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  // Méthode pour définir l'authentification (utile pour l'initialisation)
  const setAuth = (authData) => {
    token.value = authData.accessToken
    let utilisateur =
      enrichUtilisateurFromAuthPayload(authData) ?? authData.utilisateur
    if (utilisateur) utilisateur = syncTenantFieldsOnUser(utilisateur, authData)
    user.value = utilisateur
    const idr =
      pickIdRoleFromUser(utilisateur) ?? pickIdRoleFromAuthPayload(authData)
    const r =
      authData.role ??
      resolveAppRoleSlug({ idRole: idr, nom: extractPrimaryRoleNom(authData) })
    role.value = r
    const perms = normalizePermissionsList(extractPermissionsFromAuthPayload(authData))
    permissions.value = perms

    syncSessionFromResolvedUser(
      utilisateur,
      r,
      idr,
      extractPrimaryRoleNom(authData)
    )

    localStorage.setItem('accessToken', authData.accessToken)
    localStorage.setItem('user', JSON.stringify(utilisateur))
    localStorage.setItem('role', r)
    writePermissionsLocal(perms, { idRole: idr, roleSlug: r })
  }

  /** Nettoyage local uniquement (token expiré, 401, etc.). */
  function clearLocalAuthState() {
    user.value = null
    token.value = null
    role.value = null
    permissions.value = []
    client.value = null
    agent.value = null

    try {
      useRoleCatalogStore().reset()
    } catch {
      /* pinia non prêt */
    }

    localStorage.removeItem('accessToken')
    localStorage.removeItem('user')
    localStorage.removeItem('role')
    localStorage.removeItem(LS_LEGACY_PERMISSIONS)
    localStorage.removeItem(LS_AUTH_PERMISSIONS)
    localStorage.removeItem(LS_AUTH_PERMISSIONS_BY_ROLE)
    localStorage.removeItem('client')
    localStorage.removeItem('agent')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('expiresAt')
    localStorage.removeItem('tokenType')
    localStorage.removeItem('expiresIn')
    localStorage.removeItem('agentData')
    localStorage.removeItem(LS_SA_TENANT_SOCIETE)
    superAdminTenantSocieteId.value = null
    clearAuthSessionFields()
  }

  /**
   * Déconnexion : POST /api/Utilisateur/deconnecter si demandé, puis nettoyage local.
   * @param {object} [options]
   * @param {boolean} [options.notifyRemote=true] — false si token déjà invalide (401)
   * @param {boolean} [options.supprimerTousLesDevices] — passer true pour déconnecter tous les appareils
   */
  const logout = async (options = {}) => {
    const notifyRemote = options.notifyRemote !== false
    const accessToken = token.value

    if (!notifyRemote) {
      clearLocalAuthState()
      return
    }

    if (accessToken) {
      try {
        await disconnectUser(accessToken, {
          supprimerTousLesDevices: options.supprimerTousLesDevices === true,
          deviceId: options.deviceId,
          idUserDevice: options.idUserDevice,
          fcmToken: options.fcmToken,
        })
      } catch {
        /* API indisponible ou refus : on déconnecte quand même localement */
      }
    }

    clearLocalAuthState()
  }

  const hasPermission = (permission) => {
    if (permission == null || permission === '') return false
    const key = String(permission)
    if (permissions.value.includes(key)) return true
    /**
     * Administrateur sans liste de claims JWT : l’API peut n’envoyer que le rôle.
     * On autorise les lectures module (suffixes .Read / .ReadAll) pour éviter menu / pages vides.
     */
    if (
      String(role.value || '').toLowerCase() === 'admin' &&
      Array.isArray(permissions.value) &&
      permissions.value.length === 0 &&
      (/\.(Read|ReadAll)$/i.test(key) || key === 'Utilisateur.ChangePassword')
    ) {
      return true
    }
    /**
     * Super-Admin : si le JWT expose une liste `permissions` explicite, ne pas élargir via la matrice
     * rôle (`*` dans ROLE_REGISTRY) — le tableau de bord et la sidebar respectent alors l’API.
     * JWT vide : retomber sur la matrice (accès complet plateforme).
     */
    if (
      String(role.value || '').toLowerCase() === 'superadmin' &&
      Array.isArray(permissions.value) &&
      permissions.value.length > 0
    ) {
      return false
    }
    return roleGrantsPermissionCode(role.value, key)
  }

  /**
   * OR logique : au moins une clé satisfaite.
   * Délègue à `hasPermission` (JWT + localStorage + matrice rôle ex. Super-Admin `*`).
   */
  const hasAnyPermission = (keys) => {
    if (!Array.isArray(keys) || keys.length === 0) return true
    return keys.some((k) => hasPermission(k))
  }

  const hasRole = (requiredRole) => {
    return role.value === requiredRole
  }

  // Initialiser le store depuis localStorage au démarrage (F5 : session conservée tant que le JWT est présent)
  const initializeAuth = () => {
    hydrateAuthSessionFields()

    const storedToken = localStorage.getItem('accessToken')
    const storedUser = localStorage.getItem('user')
    const storedRole = localStorage.getItem('role')
    const permRaw =
      localStorage.getItem(LS_LEGACY_PERMISSIONS) ||
      localStorage.getItem(LS_AUTH_PERMISSIONS)
    const storedClient = localStorage.getItem('client')
    const storedAgent = localStorage.getItem('agent')

    if (storedToken) {
      token.value = storedToken
    }

    const hints = storedToken ? sessionHintsFromJwt(storedToken) : null

    if (storedUser) {
      try {
        user.value = JSON.parse(storedUser)
      } catch {
        user.value = null
      }
    }

    if (token.value && !user.value && hints) {
      user.value = syncTenantFieldsOnUser(
        {
          email: hints.email,
          nomComplet: hints.name,
          idUtilisateur: hints.idUtilisateur,
          idAgent: hints.idAgent,
          idRole: hints.idRole,
          idSociete: hints.idSociete,
        },
        {}
      )
      localStorage.setItem('user', JSON.stringify(user.value))
    }

    if (user.value && user.value.idAgent == null && storedToken) {
      const aid = idAgentFromToken(storedToken)
      if (aid != null) {
        user.value = { ...user.value, idAgent: aid }
        localStorage.setItem('user', JSON.stringify(user.value))
      }
    }

    if (user.value) {
      user.value = syncTenantFieldsOnUser(user.value, {})
      try {
        localStorage.setItem('user', JSON.stringify(user.value))
      } catch {
        /* ignore */
      }
    }

    if (user.value) {
      const hasRoleOnUser =
        user.value?.primaryRole?.nom ||
        (Array.isArray(user.value?.roles) && user.value.roles.length > 0) ||
        pickIdRoleFromUser(user.value) != null
      if (hasRoleOnUser) {
        const idr = pickIdRoleFromUser(user.value) ?? (hints?.idRole != null ? Number(hints.idRole) : null)
        role.value = resolveAppRoleSlug({
          idRole: idr,
          nom: extractPrimaryRoleNom({ utilisateur: user.value }),
        })
        localStorage.setItem('role', role.value)
      } else if (storedRole) {
        role.value = storedRole
      } else if (hints?.roleNom || hints?.idRole != null) {
        role.value = resolveAppRoleSlug({
          idRole: hints?.idRole != null ? Number(hints.idRole) : null,
          nom: hints?.roleNom || '',
        })
        localStorage.setItem('role', role.value)
      }
    } else if (storedRole) {
      role.value = storedRole
    } else if (hints?.roleNom || hints?.idRole != null) {
      role.value = resolveAppRoleSlug({
        idRole: hints?.idRole != null ? Number(hints.idRole) : null,
        nom: hints?.roleNom || '',
      })
      localStorage.setItem('role', role.value)
    }

    if (permRaw) {
      try {
        permissions.value = JSON.parse(permRaw)
      } catch {
        permissions.value = []
      }
    }
    if (storedClient) {
      try {
        client.value = JSON.parse(storedClient)
      } catch {
        client.value = null
      }
    }
    if (storedAgent) {
      try {
        agent.value = JSON.parse(storedAgent)
      } catch {
        agent.value = null
      }
    } else {
      const legacyAgent = localStorage.getItem('agentData')
      if (legacyAgent) {
        try {
          agent.value = JSON.parse(legacyAgent)
        } catch {
          /* ignore */
        }
      }
    }

    if (user.value && agent.value) {
      const fromUser = pickAgentPhotoUrl(user.value)
      const fromAgent = pickAgentPhotoUrl(agent.value)
      if (fromAgent && !fromUser) {
        user.value = { ...user.value, photoUrl: fromAgent }
        try {
          localStorage.setItem('user', JSON.stringify(user.value))
        } catch {
          /* ignore */
        }
      }
    }

    try {
      const roleCatalog = useRoleCatalogStore()
      roleCatalog.hydrateFromStorage()
      if (token.value && !DISABLE_AUTH_BOOTSTRAP_API) {
        roleCatalog.syncFromApi(token.value).catch(() => null)
      }
    } catch {
      /* ignore */
    }

    if (role.value === 'superadmin') {
      try {
        const raw = localStorage.getItem(LS_SA_TENANT_SOCIETE)
        const n = raw != null ? Number(raw) : NaN
        if (Number.isFinite(n) && n > 0) superAdminTenantSocieteId.value = n
      } catch {
        superAdminTenantSocieteId.value = null
      }
    } else {
      superAdminTenantSocieteId.value = null
    }

    if (user.value && role.value) {
      syncSessionFromResolvedUser(
        user.value,
        role.value,
        pickIdRoleFromUser(user.value),
        extractPrimaryRoleNom({ utilisateur: user.value })
      )
    }

    if (permissions.value.length) {
      const idr =
        sessionRoleId.value ??
        (user.value ? pickIdRoleFromUser(user.value) : null) ??
        (hints?.idRole != null ? Number(hints.idRole) : null)
      writePermissionsLocal(permissions.value, {
        idRole: idr,
        roleSlug: role.value,
      })
    }

    console.log('Auth initialisée:', { 
      token: !!token.value, 
      role: role.value, 
      permissions: permissions.value.length 
    })
  }

  /**
   * Super-Admin : société « focus » côté client (filtres UI). Les requêtes API restent sans societeId.
   * @param {number | string | null | undefined} idSociete — null / 0 pour effacer.
   */
  function setSuperAdminTenantSocieteId(idSociete) {
    const n = idSociete == null || idSociete === '' ? NaN : Number(idSociete)
    if (!Number.isFinite(n) || n <= 0) {
      superAdminTenantSocieteId.value = null
      localStorage.removeItem(LS_SA_TENANT_SOCIETE)
      return
    }
    superAdminTenantSocieteId.value = n
    try {
      localStorage.setItem(LS_SA_TENANT_SOCIETE, String(n))
    } catch {
      /* ignore */
    }
  }

  /**
   * Recharge le profil agent depuis GET /api/Agent ou /api/Agent/{idAgent} (Bearer),
   * puis fusionne nom / email / téléphone / photo dans `user` pour l’affichage.
   */
  const refreshUserProfile = async () => {
    if (!token.value) return null
    try {
      const idHint =
        user.value?.idAgent ??
        agent.value?.idAgent ??
        idAgentFromToken(token.value)
      const profile = await resolveAgentForUser(
        idHint,
        user.value?.email ?? user.value?.emailAgent
      )
      if (!profile?.idAgent) return null

      agent.value = profile
      const rawAgent = JSON.stringify(profile)
      localStorage.setItem('agent', rawAgent)
      localStorage.setItem('agentData', rawAgent)

      if (user.value) {
        const merged = {
          ...user.value,
          nomComplet: profile.nomComplet ?? user.value.nomComplet,
          email: profile.emailAgent || user.value.email,
          telephone: profile.telephoneAgent || user.value.telephone,
          photoUrl: pickAgentPhotoUrl(profile) ?? pickAgentPhotoUrl(user.value) ?? '',
          idAgent: profile.idAgent,
        }
        if (profile.roleAgent) {
          const idr = pickIdRoleFromUser(merged)
          role.value = resolveAppRoleSlug({
            idRole: idr,
            nom: String(profile.roleAgent),
          })
          localStorage.setItem('role', role.value)
        }
        const synced = syncTenantFieldsOnUser(merged, {})
        user.value = synced
        localStorage.setItem('user', JSON.stringify(synced))
        syncSessionFromResolvedUser(
          synced,
          role.value,
          pickIdRoleFromUser(synced),
          extractPrimaryRoleNom({ utilisateur: synced })
        )
      }

      return profile
    } catch {
      return null
    }
  }

  return {
    // State
    user,
    token,
    role,
    /** @deprecated alias de `role` (même ref) — compat. anciens composants */
    userRole: role,
    permissions,
    client,
    agent,
    isLoading,
    
    // Getters
    isAuthenticated,
    effectiveSocieteId,
    apiSocieteId,
    societeId,
    roleId,
    roleName,
    
    // Actions
    login: loginAction,
    logout,
    initializeAuth,
    refreshUserProfile,
    hasPermission,
    hasAnyPermission,
    hasRole,
    setSuperAdminTenantSocieteId,
  }
})
