/**
 * Contrat JWT « permissions » aligné sur l’API RusaTravel (rôle Gerant et équivalents).
 * Référence unique pour routes, sidebar et garde-fous UI.
 */

/** @typedef {'Create'|'Read'|'ReadAll'|'Update'|'Delete'} RusaPermissionVerb */

/**
 * @typedef {(
 *   'Agent.Create' | 'Agent.Delete' | 'Agent.Read' | 'Agent.ReadAll' | 'Agent.Update'
 *   | 'Billet.Create' | 'Billet.Delete' | 'Billet.Read' | 'Billet.ReadAll' | 'Billet.Update'
 *   | 'Bus.Create' | 'Bus.Delete' | 'Bus.Read' | 'Bus.ReadAll' | 'Bus.Update'
 *   | 'CategorieClient.Create' | 'CategorieClient.Delete' | 'CategorieClient.Read' | 'CategorieClient.ReadAll' | 'CategorieClient.Update'
 *   | 'Client.Create' | 'Client.Delete' | 'Client.Read' | 'Client.ReadAll' | 'Client.Update'
 *   | 'CommunicationCampaign.Create' | 'CommunicationCampaign.Delete' | 'CommunicationCampaign.Read' | 'CommunicationCampaign.ReadAll' | 'CommunicationCampaign.Update'
 *   | 'Destination.Create' | 'Destination.Delete' | 'Destination.Read' | 'Destination.ReadAll' | 'Destination.Update'
 *   | 'Facture.Create' | 'Facture.Delete' | 'Facture.Read' | 'Facture.ReadAll' | 'Facture.Update'
 *   | 'Paiement.Create' | 'Paiement.Delete' | 'Paiement.Read' | 'Paiement.ReadAll' | 'Paiement.Update'
 *   | 'PlainteClient.Create' | 'PlainteClient.Delete' | 'PlainteClient.Read' | 'PlainteClient.ReadAll' | 'PlainteClient.Update'
 *   | 'Reservation.Create' | 'Reservation.Delete' | 'Reservation.Read' | 'Reservation.ReadAll' | 'Reservation.Update'
 *   | 'Societe.Read' | 'Societe.ReadAll' | 'Societe.Update'
 *   | 'TypeBuse.Create' | 'TypeBuse.Delete' | 'TypeBuse.Read' | 'TypeBuse.ReadAll' | 'TypeBuse.Update'
 *   | 'Utilisateur.ChangePassword' | 'Utilisateur.Create' | 'Utilisateur.Delete' | 'Utilisateur.Read' | 'Utilisateur.ReadAll' | 'Utilisateur.Update'
 *   | 'Voyage.Create' | 'Voyage.Delete' | 'Voyage.Read' | 'Voyage.ReadAll' | 'Voyage.Update'
 * )} RusaGerantPermissionClaim
 */

/** Liste exhaustive des claims Gerant (ordre API / documentation). */
export const RUSA_GERANT_PERMISSION_CLAIMS = Object.freeze([
    'Agent.Create',
    'Agent.Delete',
    'Agent.Read',
    'Agent.ReadAll',
    'Agent.Update',
    'Billet.Create',
    'Billet.Delete',
    'Billet.Read',
    'Billet.ReadAll',
    'Billet.Update',
    'Bus.Create',
    'Bus.Delete',
    'Bus.Read',
    'Bus.ReadAll',
    'Bus.Update',
    'CategorieClient.Create',
    'CategorieClient.Delete',
    'CategorieClient.Read',
    'CategorieClient.ReadAll',
    'CategorieClient.Update',
    'Client.Create',
    'Client.Delete',
    'Client.Read',
    'Client.ReadAll',
    'Client.Update',
    'CommunicationCampaign.Create',
    'CommunicationCampaign.Delete',
    'CommunicationCampaign.Read',
    'CommunicationCampaign.ReadAll',
    'CommunicationCampaign.Update',
    'Destination.Create',
    'Destination.Delete',
    'Destination.Read',
    'Destination.ReadAll',
    'Destination.Update',
    'Facture.Create',
    'Facture.Delete',
    'Facture.Read',
    'Facture.ReadAll',
    'Facture.Update',
    'Paiement.Create',
    'Paiement.Delete',
    'Paiement.Read',
    'Paiement.ReadAll',
    'Paiement.Update',
    'PlainteClient.Create',
    'PlainteClient.Delete',
    'PlainteClient.Read',
    'PlainteClient.ReadAll',
    'PlainteClient.Update',
    'Reservation.Create',
    'Reservation.Delete',
    'Reservation.Read',
    'Reservation.ReadAll',
    'Reservation.Update',
    'Societe.Read',
    'Societe.ReadAll',
    'Societe.Update',
    'TypeBuse.Create',
    'TypeBuse.Delete',
    'TypeBuse.Read',
    'TypeBuse.ReadAll',
    'TypeBuse.Update',
    'Utilisateur.ChangePassword',
    'Utilisateur.Create',
    'Utilisateur.Delete',
    'Utilisateur.Read',
    'Utilisateur.ReadAll',
    'Utilisateur.Update',
    'Voyage.Create',
    'Voyage.Delete',
    'Voyage.Read',
    'Voyage.ReadAll',
    'Voyage.Update',
])

/**
 * Ressource API (préfixe avant `.Read`, etc.).
 * @typedef {(
 *   'Agent' | 'Billet' | 'Bus' | 'CategorieClient' | 'Client' | 'CommunicationCampaign' | 'Destination'
 *   | 'Facture' | 'Paiement' | 'PlainteClient' | 'Reservation' | 'Societe' | 'TypeBuse' | 'Utilisateur' | 'Voyage'
 * )} RusaApiResource
 */

/** Ressources couvertes par le menu opérations gérant (chemins `/admin/*` + `/gerant/*`). */
export const RUSA_GERANT_MENU_RESOURCES = Object.freeze([
    'Agent',
    'Billet',
    'Bus',
    'TypeBuse',
    'CategorieClient',
    'Client',
    'CommunicationCampaign',
    'Destination',
    'Facture',
    'PlainteClient',
    'Paiement',
    'Reservation',
    'Societe',
    'Utilisateur',
    'Voyage',
])
