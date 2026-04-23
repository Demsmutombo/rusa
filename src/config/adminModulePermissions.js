/**
 * Codes permissions alignés sur l’API (ex. `Agent.Read`, `Agent.ReadAll`).
 * Utilisés pour `meta.permissions` (router), la sidebar et les raccourcis dashboard.
 */

/** @param {string} claimBase */
export function permissionsReadPair(claimBase) {
  return [`${claimBase}.Read`, `${claimBase}.ReadAll`]
}

export const PERM = {
  utilisateurs: permissionsReadPair('Utilisateur'),
  societes: permissionsReadPair('Societe'),
  agents: permissionsReadPair('Agent'),
  destinations: permissionsReadPair('Destination'),
  buses: permissionsReadPair('Bus'),
  busTypes: permissionsReadPair('TypeBuse'),
  voyages: permissionsReadPair('Voyage'),
  /** Transporteurs : non nommé dans l’échantillon API ; lecture bus / voyage comme périmètre opérationnel. */
  transporteurs: [
    ...permissionsReadPair('Bus'),
    ...permissionsReadPair('Voyage'),
  ],
  trips: permissionsReadPair('Voyage'),
  reservations: permissionsReadPair('Reservation'),
  billets: permissionsReadPair('Billet'),
  paiements: permissionsReadPair('Paiement'),
  factures: permissionsReadPair('Facture'),
  clients: permissionsReadPair('Client'),
  categoriesClient: permissionsReadPair('CategorieClient'),
  plaintes: permissionsReadPair('PlainteClient'),
  notifications: permissionsReadPair('CommunicationCampaign'),
  /** Paramètres société / comptes : au moins une de ces portées. */
  settings: [
    ...permissionsReadPair('Societe'),
    ...permissionsReadPair('Utilisateur'),
    'Utilisateur.ChangePassword',
  ],
}
