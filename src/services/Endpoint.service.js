const API_BASE = '/api'
const trimSlash = (s) => String(s || '').replace(/\/$/, '')
const endpoint = (path) => `${API_BASE}${path}`
const withId = (basePath) => (id) => `${basePath}/${id}`

/**
 * Routes « Guide d’intégration RusaTravel » (v1.3) : /Resource/create, /Resource/get-all, /Auth/login, etc.
 * Activer avec `VITE_API_GUIDE_ROUTES=1` lorsque le backend expose ces chemins (voir guide projet).
 * Par défaut désactivé : routes style collection Swagger (`/Reservation`, `/Utilisateur/authentifier`, …).
 */
export const API_USE_GUIDE_ROUTES =
  String(import.meta.env.VITE_API_GUIDE_ROUTES ?? '0').trim() === '1'

export const API_CONFIG = {
  BASE_URL: import.meta.env.PROD
    ? trimSlash(import.meta.env.VITE_API_BASE_URL || 'https://dev-rusatravel.asdc-rdc.org/api')
    : API_BASE,
  TIMEOUT: 30000,
}

const G = API_USE_GUIDE_ROUTES

/**
 * Convention:
 * - LIST / CREATE : collections (GET liste, POST création) — alignés guide si G
 * - BASE : alias liste (rétrocompat lecture) ou ressource racine legacy
 * - byId(id): endpoint ressource
 */
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: endpoint(G ? '/Auth/login' : '/Utilisateur/authentifier'),
    LOGOUT: endpoint(G ? '/Auth/logout' : '/Utilisateur/deconnecter'),
    REFRESH: endpoint('/Auth/refresh-token'),
  },
  ROLE: {
    BASE: endpoint('/Role'),
  },
  SOCIETE: {
    BASE: endpoint('/Societe'),
    UPDATE_BASE: endpoint('/Societe'),
    byId: withId(endpoint('/Societe')),
  },
  CLIENT: {
    BASE: endpoint('/Client'),
    CREATE: endpoint(G ? '/Client/create' : '/Client'),
    byId: withId(endpoint('/Client')),
    bySociete: (idSociete) => endpoint(`/Client/societe/${idSociete}`),
    bySocietePaged: (idSociete) => endpoint(`/Client/societe/${idSociete}/paged`),
    bySocieteSearch: (idSociete) => endpoint(`/Client/societe/${idSociete}/recherche`),
    toggleStatut: (id) => endpoint(`/Client/toggle-statut/${id}`),
    setStatut: (id, statut) =>
      `${endpoint(`/Client/set-statut/${id}`)}?Statut=${encodeURIComponent(String(Boolean(statut)))}`,
  },
  AGENT: {
    BASE: endpoint('/Agent'),
    byId: withId(endpoint('/Agent')),
    toggleStatut: (id) => endpoint(`/Agent/toggle-statut/${id}`),
  },
  BUS: {
    LIST: endpoint(G ? '/Bus/get-all' : '/Bus'),
    CREATE: endpoint(G ? '/Bus/create' : '/Bus'),
    BASE: endpoint('/Bus'),
    byId: withId(endpoint('/Bus')),
    bySociete: (idSociete) => endpoint(`/Bus/societe/${idSociete}`),
  },
  TYPE_BUS: {
    BASE: endpoint('/TypeBus'),
    byId: withId(endpoint('/TypeBus')),
  },
  DESTINATION: {
    /** Liste : le guide ne fixe pas d’URL ; collection GET conservée (évite un `/get-all` absent côté API). */
    LIST: endpoint('/Destination'),
    CREATE: endpoint(G ? '/Destination/create' : '/Destination'),
    BASE: endpoint('/Destination'),
    byId: withId(endpoint('/Destination')),
    bySociete: (idSociete) => endpoint(`/Destination/societe/${idSociete}`),
    toggleStatut: (id) => endpoint(`/Destination/${id}/toggle-statut`),
  },
  VOYAGE: {
    LIST: endpoint(G ? '/Voyage/get-all' : '/Voyage'),
    CREATE: endpoint(G ? '/Voyage/create' : '/Voyage'),
    BASE: endpoint('/Voyage'),
    byId: withId(endpoint('/Voyage')),
  },
  RESERVATION: {
    LIST: endpoint(G ? '/Reservation/get-all' : '/Reservation'),
    CREATE: endpoint(G ? '/Reservation/create' : '/Reservation'),
    /** Création conjointe réservation + paiement (+ billet éventuel) */
    CREATE_WITH_PAIEMENT: endpoint('/Reservation/reservation_with_paiement'),
    BASE: endpoint('/Reservation'),
    byId: withId(endpoint('/Reservation')),
    byClient: (idClient) => endpoint(`/Reservation/client/${idClient}`),
    byUserAndClient: (idUtilisateur, idClient) =>
      endpoint(`/Reservation/utilisateur/${idUtilisateur}/client/${idClient}`),
    clientPaged: (idClient) => endpoint(`/Reservation/client/${idClient}/paged`),
    clientCount: (idClient) => endpoint(`/Reservation/client/${idClient}/count`),
  },
  BILLET: {
    LIST: endpoint(G ? '/Billet/get-all' : '/Billet'),
    CREATE: endpoint(G ? '/Billet/create' : '/Billet'),
    BASE: endpoint('/Billet'),
    byReservation: (idReservation) => endpoint(`/Billet/reservation/${idReservation}`),
    byQrCode: (qrCode) => endpoint(`/Billet/qrcode/${qrCode}`),
  },
  FACTURE: {
    BASE: endpoint('/Facture'),
    byId: withId(endpoint('/Facture')),
  },
  CATEGORIE_CLIENT: {
    BASE: endpoint('/CategorieClient'),
    byId: withId(endpoint('/CategorieClient')),
  },
  PLAINTE_CLIENT: {
    BASE: endpoint('/PlainteClient'),
    byId: withId(endpoint('/PlainteClient')),
  },
  COMMUNICATION_CAMPAIGN: {
    BASE: endpoint('/CommunicationCampaign'),
    byId: withId(endpoint('/CommunicationCampaign')),
  },
  PAIEMENT: {
    /** Liste : non décrite dans le guide ; collection GET standard. */
    LIST: endpoint('/Paiement'),
    CREATE: endpoint(G ? '/Paiement/create' : '/Paiement'),
    BASE: endpoint('/Paiement'),
    byId: withId(endpoint('/Paiement')),
    byReservation: (idReservation) => endpoint(`/Paiement/reservation/${idReservation}`),
    byClient: (idClient) => endpoint(`/Paiement/client/${idClient}`),
    bySociete: (idSociete) => endpoint(`/Paiement/societe/${idSociete}`),
    bySocietePaged: (idSociete) => endpoint(`/Paiement/societe/${idSociete}/paged`),
  },
  UTILISATEUR: {
    LIST: endpoint(G ? '/Utilisateur/get-all' : '/Utilisateur'),
    CREATE: endpoint(G ? '/Utilisateur/create' : '/Utilisateur'),
    BASE: endpoint('/Utilisateur'),
    byId: withId(endpoint('/Utilisateur')),
    update: (id) => endpoint(G ? `/Utilisateur/update/${encodeURIComponent(String(id))}` : `/Utilisateur/${encodeURIComponent(String(id))}`),
    byRoleId: (roleId) => endpoint(`/Utilisateur/role/${roleId}`),
    byRoleName: (nomRole) => endpoint(`/Utilisateur/by-role-name/${nomRole}`),
    toggleStatut: (id) => endpoint(`/Utilisateur/toggle-statut/${id}`),
    changePassword: endpoint('/Utilisateur/changer_mot_de_passe'),
    roles: (id) => endpoint(`/Utilisateur/${id}/roles`),
    addRole: (idUtilisateur, roleId) => endpoint(`/Utilisateur/${idUtilisateur}/roles/${roleId}`),
    removeRole: (idUtilisateur, roleId) => endpoint(`/Utilisateur/${idUtilisateur}/roles/${roleId}`),
    setPrimaryRole: (idUtilisateur, roleId) =>
      endpoint(`/Utilisateur/${idUtilisateur}/roles/${roleId}/primary`),
  },
  DASHBOARD: {
    SUPER_ADMIN: endpoint('/SuperAdminDashboard'),
    /** Tableau de bord gérant — contrat doc RusaTravel. */
    GERANT: endpoint('/GerantDashboard'),
    GERANT_BY_SOCIETE: (idSociete) =>
      endpoint(`/GerantDashboard/societe/${encodeURIComponent(String(idSociete))}`),
    GERANT_STATISTIQUES: endpoint('/GerantDashboard/statistiques'),
    GERANT_ALERTES: endpoint('/GerantDashboard/alertes'),
    GERANT_SOCIETE_STATS: endpoint('/GerantDashboard/societe-statistiques'),
    GERANT_CLIENTS_STATS: endpoint('/GerantDashboard/clients-statistiques'),
    GERANT_TOP_CA: endpoint('/GerantDashboard/top5-clients-ca'),
    GERANT_TOP_ARRIERES: endpoint('/GerantDashboard/top5-clients-arrieres'),
    GERANT_ALERTES_SOCIETE: endpoint('/GerantDashboard/alertes-societe'),
    GERANT_TENDANCES: endpoint('/GerantDashboard/tendances'),
    GERANT_PAIEMENTS_STATS: endpoint('/GerantDashboard/paiements-statistiques'),
    /** Alias rétrocompat ancien code. */
    GERANT_STATISTIQUES_LEGACY: endpoint('/GerantDashboard/statistiques'),
    GERANT_ALERTES_LEGACY: endpoint('/GerantDashboard/alertes'),
    /** GET /Dashboard/{idSociete} — indicateurs société (gérant / admin). */
    bySociete: (idSociete) =>
      endpoint(`/Dashboard/${encodeURIComponent(String(idSociete))}`),
    CLIENT_BASE: (() => {
      const v = String(import.meta.env.VITE_CLIENT_DASHBOARD_BASE || endpoint('/ClientDashboard'))
        .trim()
        .replace(/\/$/, '')
      return v || endpoint('/ClientDashboard')
    })(),
    CLIENT_STATISTIQUES: endpoint('/ClientDashboard/statistiques'),
    CLIENT_RESERVATIONS_RECENTES: endpoint('/ClientDashboard/reservations-recentes'),
    CLIENT_PAIEMENTS_RECENTS: endpoint('/ClientDashboard/paiements-recents'),
    CLIENT_VOYAGES: endpoint('/ClientDashboard/voyages-client'),
    CLIENT_ALERTES: endpoint('/ClientDashboard/alertes-client'),
    CLIENT_RESUME: endpoint('/ClientDashboard/resume-client'),
  },
  STATISTIQUES: {
    GENERALES: (idSociete) => endpoint(`/Statistiques/generales/${encodeURIComponent(String(idSociete))}`),
    FINANCIERES: (idSociete) => endpoint(`/Statistiques/financieres/${encodeURIComponent(String(idSociete))}`),
    OPERATIONNELLES: (idSociete) => endpoint(`/Statistiques/operationnelles/${encodeURIComponent(String(idSociete))}`),
    PERFORMANCE: (idSociete) => endpoint(`/Statistiques/performance/${encodeURIComponent(String(idSociete))}`),
    CONSOLIDEES: (idSociete) => endpoint(`/Statistiques/consolidees/${encodeURIComponent(String(idSociete))}`),
  },
}
