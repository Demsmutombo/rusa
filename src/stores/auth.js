import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login, disconnectUser } from '@/services/authService'
import { resolveAgentForUser } from '@/services/agentService'
import { normalizeAppRole } from '@/config/roles'
import { useRoleCatalogStore } from '@/stores/roleCatalog'
import { idAgentFromToken, sessionHintsFromJwt } from '@/utils/jwtClaims'

export { normalizeAppRole } from '@/config/roles'

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

/** Fusionne le bloc utilisateur avec primaryRole / roles présents à la racine de la réponse API. */
function enrichUtilisateurFromAuthPayload(data) {
  const u = data?.utilisateur ? { ...data.utilisateur } : null
  if (!u) return null
  if (!u.primaryRole && data.primaryRole) u.primaryRole = data.primaryRole
  if ((!u.roles || !u.roles.length) && Array.isArray(data.roles) && data.roles.length) {
    u.roles = data.roles
  }
  if (u.idRole == null && data.idRole != null) u.idRole = data.idRole
  if (u.idAgent == null && data.idAgent != null) u.idAgent = data.idAgent
  return u
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

function applyRoleFromUserPayload(userPayload) {
  const raw = extractPrimaryRoleNom({ utilisateur: userPayload })
  return normalizeAppRole(raw)
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

  // GETTERS
  const isAuthenticated = computed(() => !!token.value)

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
      user.value = utilisateur
      localStorage.setItem('user', JSON.stringify(utilisateur))

      // GESTION DU RÔLE avec priorité
      const rawRoleNom = extractPrimaryRoleNom(data)
      role.value = normalizeAppRole(rawRoleNom)
      localStorage.setItem('role', role.value)

      console.log('Rôle API:', rawRoleNom, '→ app:', role.value)

      const perms = normalizePermissionsList(data.permissions)
      permissions.value = perms
      localStorage.setItem('permissions', JSON.stringify(perms))

      const roleCatalog = useRoleCatalogStore()
      await roleCatalog.syncFromApi(data.accessToken)

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

      await refreshUserProfile().catch(() => null)

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
    const utilisateur =
      enrichUtilisateurFromAuthPayload(authData) ?? authData.utilisateur
    user.value = utilisateur
    const r = authData.role ?? normalizeAppRole(extractPrimaryRoleNom(authData))
    role.value = r
    const perms = normalizePermissionsList(authData.permissions)
    permissions.value = perms

    localStorage.setItem('accessToken', authData.accessToken)
    localStorage.setItem('user', JSON.stringify(utilisateur))
    localStorage.setItem('role', r)
    localStorage.setItem('permissions', JSON.stringify(perms))
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
    localStorage.removeItem('permissions')
    localStorage.removeItem('client')
    localStorage.removeItem('agent')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('expiresAt')
    localStorage.removeItem('tokenType')
    localStorage.removeItem('expiresIn')
    localStorage.removeItem('agentData')
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
    return permissions.value.includes(permission)
  }

  /** Au moins une des permissions listées (codes normalisés depuis l’API). */
  const hasAnyPermission = (keys) => {
    if (!Array.isArray(keys) || keys.length === 0) return true
    return keys.some((k) => permissions.value.includes(k))
  }

  const hasRole = (requiredRole) => {
    return role.value === requiredRole
  }

  // Initialiser le store depuis localStorage au démarrage (F5 : session conservée tant que le JWT est présent)
  const initializeAuth = () => {
    const storedToken = localStorage.getItem('accessToken')
    const storedUser = localStorage.getItem('user')
    const storedRole = localStorage.getItem('role')
    const storedPermissions = localStorage.getItem('permissions')
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
      user.value = {
        email: hints.email,
        nomComplet: hints.name,
        idUtilisateur: hints.idUtilisateur,
        idAgent: hints.idAgent,
        idRole: hints.idRole,
        idSociete: hints.idSociete,
      }
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
      const hasRoleOnUser =
        user.value?.primaryRole?.nom ||
        (Array.isArray(user.value?.roles) && user.value.roles.length > 0)
      if (hasRoleOnUser) {
        role.value = applyRoleFromUserPayload(user.value)
        localStorage.setItem('role', role.value)
      } else if (storedRole) {
        role.value = storedRole
      } else if (hints?.roleNom) {
        role.value = normalizeAppRole(hints.roleNom)
        localStorage.setItem('role', role.value)
      }
    } else if (storedRole) {
      role.value = storedRole
    } else if (hints?.roleNom) {
      role.value = normalizeAppRole(hints.roleNom)
      localStorage.setItem('role', role.value)
    }

    if (storedPermissions) {
      try {
        permissions.value = JSON.parse(storedPermissions)
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

    try {
      const roleCatalog = useRoleCatalogStore()
      roleCatalog.hydrateFromStorage()
      if (token.value) {
        roleCatalog.syncFromApi(token.value).catch(() => null)
      }
    } catch {
      /* ignore */
    }

    console.log('Auth initialisée:', { 
      token: !!token.value, 
      role: role.value, 
      permissions: permissions.value.length 
    })
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
          photoUrl: profile.photoUrl ?? user.value.photoUrl,
          idAgent: profile.idAgent,
        }
        if (profile.roleAgent) {
          role.value = normalizeAppRole(profile.roleAgent)
          localStorage.setItem('role', role.value)
        }
        user.value = merged
        localStorage.setItem('user', JSON.stringify(merged))
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
    
    // Actions
    login: loginAction,
    logout,
    initializeAuth,
    refreshUserProfile,
    hasPermission,
    hasAnyPermission,
    hasRole,
  }
})
