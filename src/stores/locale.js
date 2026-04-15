import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useLocaleStore = defineStore('locale', () => {
  const currentLocale = ref('fr')
  
  const availableLocales = [
    { code: 'fr', name: 'Français', flag: '??' },
    { code: 'en', name: 'English', flag: '??' }
  ]
  
  const setLocale = (locale) => {
    currentLocale.value = locale
    localStorage.setItem('locale', locale)
  }
  
  const getLocale = () => {
    const saved = localStorage.getItem('locale')
    if (saved && availableLocales.find(l => l.code === saved)) {
      currentLocale.value = saved
    }
    return currentLocale.value
  }
  
  const t = (key) => {
    const translations = {
      fr: {
        // Navigation
        dashboard: 'Tableau de bord',
        users: 'Utilisateurs',
        transporters: 'Transporteurs',
        trips: 'Trajets',
        reservations: 'Réservations',
        payments: 'Paiements',
        notifications: 'Notifications',
        settings: 'Paramètres',
        profile: 'Profil',
        calendar: 'Calendrier',
        forms: 'Formulaires',
        tables: 'Tableaux',
        pages: 'Pages',
        charts: 'Graphiques',
        ui_elements: 'Éléments UI',
        
        // Actions
        search: 'Rechercher',
        add: 'Ajouter',
        edit: 'Modifier',
        delete: 'Supprimer',
        save: 'Enregistrer',
        cancel: 'Annuler',
        confirm: 'Confirmer',
        back: 'Retour',
        next: 'Suivant',
        previous: 'Précédent',
        
        // Status
        active: 'Actif',
        inactive: 'Inactif',
        pending: 'En attente',
        completed: 'Terminé',
        cancelled: 'Annulé',
        
        // Common
        loading: 'Chargement...',
        error: 'Erreur',
        success: 'Succès',
        warning: 'Avertissement',
        info: 'Information',
        no_data: 'Aucune donnée disponible',
        select_option: 'Sélectionnez une option',
        
        // Authentication
        login: 'Connexion',
        logout: 'Déconnexion',
        signup: 'Inscription',
        email: 'Email',
        password: 'Mot de passe',
        forgot_password: 'Mot de passe oublié?',
        remember_me: 'Se souvenir de moi',
        
        // Profile menu
        edit_profile: 'Modifier le profil',
        account_settings: 'Paramètres du compte',
        support: 'Support',
        sign_out: 'Se déconnecter',
        
        // Dashboard specific
        total_users: 'Total Utilisateurs',
        active_trips: 'Trajets Actifs',
        total_reservations: 'Réservations',
        revenue: 'Revenus',
        recent_users: 'Utilisateurs Récents',
        recent_trips: 'Trajets Récents'
      },
      en: {
        // Navigation
        dashboard: 'Dashboard',
        users: 'Users',
        transporters: 'Transporters',
        trips: 'Trips',
        reservations: 'Reservations',
        payments: 'Payments',
        notifications: 'Notifications',
        settings: 'Settings',
        profile: 'Profile',
        calendar: 'Calendar',
        forms: 'Forms',
        tables: 'Tables',
        pages: 'Pages',
        charts: 'Charts',
        ui_elements: 'UI Elements',
        
        // Actions
        search: 'Search',
        add: 'Add',
        edit: 'Edit',
        delete: 'Delete',
        save: 'Save',
        cancel: 'Cancel',
        confirm: 'Confirm',
        back: 'Back',
        next: 'Next',
        previous: 'Previous',
        
        // Status
        active: 'Active',
        inactive: 'Inactive',
        pending: 'Pending',
        completed: 'Completed',
        cancelled: 'Cancelled',
        
        // Common
        loading: 'Loading...',
        error: 'Error',
        success: 'Success',
        warning: 'Warning',
        info: 'Information',
        no_data: 'No data available',
        select_option: 'Select an option',
        
        // Authentication
        login: 'Login',
        logout: 'Logout',
        signup: 'Signup',
        email: 'Email',
        password: 'Password',
        forgot_password: 'Forgot password?',
        remember_me: 'Remember me',
        
        // Profile menu
        edit_profile: 'Edit profile',
        account_settings: 'Account settings',
        support: 'Support',
        sign_out: 'Sign out',
        
        // Dashboard specific
        total_users: 'Total Users',
        active_trips: 'Active Trips',
        total_reservations: 'Reservations',
        revenue: 'Revenue',
        recent_users: 'Recent Users',
        recent_trips: 'Recent Trips'
      }
    }
    
    return translations[currentLocale.value]?.[key] || key
  }
  
  // Initialize locale from localStorage
  getLocale()
  
  return {
    currentLocale,
    availableLocales,
    setLocale,
    getLocale,
    t
  }
})
