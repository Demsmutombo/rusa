import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useRoleCatalogStore } from '@/stores/roleCatalog'
import { getDashboardPath, verifyNavigationAccess } from '@/config/roles'
import { PERM } from '@/config/adminModulePermissions'

const roleDashboard = () => import('../views/Dashboard/RoleDashboard.vue')

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, from, savedPosition) {
    return savedPosition || { left: 0, top: 0 }
  },
  routes: [
    {
      path: '/splash',
      name: 'Splash',
      component: () => import('../views/Splash.vue'),
      meta: {
        title: 'Rusa Travel',
        public: true
      },
    },
    {
      path: '/',
      name: 'Home',
      component: () => import('../views/Home.vue'),
      meta: {
        title: 'Rusa Travel - Plateforme de Réservation de Transport',
        public: true
      },
    },
    {
      path: '/unauthorized',
      name: 'Unauthorized',
      component: () => import('../views/Unauthorized.vue'),
      meta: {
        title: 'Accès Refusé - Rusa Travel',
        public: true
      },
    },
    {
      path: '/signin',
      name: 'Signin',
      component: () => import('../views/Auth/Signin.vue'),
      meta: {
        title: 'Connexion - Rusa Travel',
        public: true
      },
    },
    {
      path: '/signup',
      name: 'Signup',
      component: () => import('../views/Auth/Signup.vue'),
      meta: {
        title: 'Inscription - Rusa Travel',
        public: true
      },
    },
    {
      path: '/super-admin',
      name: 'SuperAdminDashboard',
      component: roleDashboard,
      meta: {
        title: 'Super-Admin - Rusa Travel',
        requiresAuth: true,
        roles: ['superadmin'],
      },
    },
    {
      path: '/super-admin/societes',
      name: 'SuperAdminSocietes',
      component: () => import('../views/Admin/Societes.vue'),
      meta: {
        title: 'Sociétés - Super-Admin - Rusa Travel',
        requiresAuth: true,
        adminModule: true,
        roles: ['superadmin'],
        permissions: PERM.societes,
      },
    },
    {
      path: '/super-admin/agents',
      redirect: '/admin/agents',
    },
    {
      path: '/super-admin/destinations',
      name: 'SuperAdminDestinations',
      component: () => import('../views/Admin/Destinations.vue'),
      meta: {
        title: 'Destinations - Super-Admin - Rusa Travel',
        requiresAuth: true,
        adminModule: true,
        roles: ['superadmin'],
        permissions: PERM.destinations,
      },
    },
    {
      path: '/super-admin/buses',
      name: 'SuperAdminBuses',
      component: () => import('../views/Admin/Buses.vue'),
      meta: {
        title: 'Bus - Super-Admin - Rusa Travel',
        requiresAuth: true,
        adminModule: true,
        roles: ['superadmin'],
        permissions: PERM.buses,
      },
    },
    {
      path: '/super-admin/bus-types',
      name: 'SuperAdminBusTypes',
      component: () => import('../views/Admin/BusTypes.vue'),
      meta: {
        title: 'Types de bus - Super-Admin - Rusa Travel',
        requiresAuth: true,
        adminModule: true,
        roles: ['superadmin'],
        permissions: PERM.busTypes,
      },
    },
    {
      path: '/super-admin/voyages',
      name: 'SuperAdminVoyages',
      component: () => import('../views/Admin/Voyages.vue'),
      meta: {
        title: 'Voyages - Super-Admin - Rusa Travel',
        requiresAuth: true,
        adminModule: true,
        roles: ['superadmin'],
        permissions: PERM.voyages,
      },
    },
    {
      path: '/super-admin/clients',
      name: 'SuperAdminClients',
      component: () => import('../views/Admin/Clients.vue'),
      meta: {
        title: 'Clients - Super-Admin - Rusa Travel',
        requiresAuth: true,
        adminModule: true,
        roles: ['superadmin'],
        permissions: PERM.clients,
      },
    },
    {
      path: '/admin',
      name: 'AdminDashboard',
      component: roleDashboard,
      meta: {
        title: 'Dashboard Admin - Rusa Travel',
        requiresAuth: true,
        roles: ['admin'],
      },
    },
    {
      path: '/gerant',
      component: () => import('../views/Dashboard/GerantLayout.vue'),
      meta: {
        requiresAuth: true,
        roles: ['gerant'],
      },
      children: [
        {
          path: '',
          name: 'GerantDashboard',
          component: () => import('../views/Dashboard/GerantDashboardView.vue'),
          meta: {
            title: 'Dashboard Manager Général - Rusa Travel',
            gerantSection: null,
          },
        },
        {
          path: 'indicateurs/societe',
          name: 'GerantIndicateursSociete',
          component: () => import('../views/Dashboard/GerantDashboardView.vue'),
          meta: {
            title: 'Société & finances — Gérant - Rusa Travel',
            gerantSection: 'societe-finances',
          },
        },
        {
          path: 'indicateurs/clients',
          name: 'GerantIndicateursClients',
          component: () => import('../views/Dashboard/GerantDashboardView.vue'),
          meta: {
            title: 'Clients — Gérant - Rusa Travel',
            gerantSection: 'clients',
          },
        },
        {
          path: 'indicateurs/top-ca',
          name: 'GerantIndicateursTopCa',
          component: () => import('../views/Dashboard/GerantDashboardView.vue'),
          meta: {
            title: 'Top 5 CA — Gérant - Rusa Travel',
            gerantSection: 'top-ca',
          },
        },
        {
          path: 'indicateurs/top-arrieres',
          name: 'GerantIndicateursTopArrieres',
          component: () => import('../views/Dashboard/GerantDashboardView.vue'),
          meta: {
            title: 'Top 5 arriérés — Gérant - Rusa Travel',
            gerantSection: 'top-arrieres',
          },
        },
        {
          path: 'indicateurs/alertes',
          name: 'GerantIndicateursAlertes',
          component: () => import('../views/Dashboard/GerantDashboardView.vue'),
          meta: {
            title: 'Alertes société — Gérant - Rusa Travel',
            gerantSection: 'alertes',
          },
        },
        {
          path: 'indicateurs/tendances',
          name: 'GerantIndicateursTendances',
          component: () => import('../views/Dashboard/GerantDashboardView.vue'),
          meta: {
            title: 'Tendances — Gérant - Rusa Travel',
            gerantSection: 'tendances',
          },
        },
        {
          path: 'indicateurs/paiements',
          name: 'GerantIndicateursPaiements',
          component: () => import('../views/Dashboard/GerantDashboardView.vue'),
          meta: {
            title: 'Statistiques paiements — Gérant - Rusa Travel',
            gerantSection: 'paiements-stats',
          },
        },
      ],
    },
    {
      path: '/financier',
      name: 'FinancierDashboard',
      component: roleDashboard,
      meta: {
        title: 'Dashboard Financier - Rusa Travel',
        requiresAuth: true,
        roles: ['financier'],
      },
    },
    {
      path: '/caissier',
      name: 'CaissierDashboard',
      component: roleDashboard,
      meta: {
        title: 'Dashboard Caissier - Rusa Travel',
        requiresAuth: true,
        roles: ['caissier'],
      },
    },
    {
      path: '/transport',
      name: 'TransportDashboard',
      component: roleDashboard,
      meta: {
        title: 'Dashboard Transporteur - Rusa Travel',
        requiresAuth: true,
        roles: ['transporteur'],
      },
    },
    {
      path: '/client',
      name: 'ClientDashboard',
      component: roleDashboard,
      meta: {
        title: 'Dashboard Client - Rusa Travel',
        requiresAuth: true,
        roles: ['client'],
      },
    },
    {
      path: '/admin/users',
      name: 'AdminUsers',
      component: () => import('../views/Admin/Users.vue'),
      meta: {
        title: 'Gestion des Utilisateurs - Rusa Travel',
        requiresAuth: true,
        adminModule: true,
        permissions: PERM.utilisateurs,
      },
    },
    {
      path: '/admin/societes',
      name: 'AdminSocietes',
      component: () => import('../views/Admin/Societes.vue'),
      meta: {
        title: 'Sociétés (agences) - Rusa Travel',
        requiresAuth: true,
        adminModule: true,
        permissions: PERM.societes,
      },
    },
    {
      path: '/admin/agents',
      name: 'AdminAgents',
      component: () => import('../views/Admin/Agents.vue'),
      meta: {
        title: 'Agents - Rusa Travel',
        requiresAuth: true,
        adminModule: true,
        permissions: PERM.agents,
      },
    },
    {
      path: '/admin/destinations',
      name: 'AdminDestinations',
      component: () => import('../views/Admin/Destinations.vue'),
      meta: {
        title: 'Destinations - Rusa Travel',
        requiresAuth: true,
        adminModule: true,
        permissions: PERM.destinations,
      },
    },
    {
      path: '/admin/buses',
      name: 'AdminBuses',
      component: () => import('../views/Admin/Buses.vue'),
      meta: {
        title: 'Bus - Rusa Travel',
        requiresAuth: true,
        adminModule: true,
        permissions: PERM.buses,
      },
    },
    {
      path: '/admin/bus-types',
      name: 'AdminBusTypes',
      component: () => import('../views/Admin/BusTypes.vue'),
      meta: {
        title: 'Types de bus - Rusa Travel',
        requiresAuth: true,
        adminModule: true,
        permissions: PERM.busTypes,
      },
    },
    {
      path: '/admin/voyages',
      name: 'AdminVoyages',
      component: () => import('../views/Admin/Voyages.vue'),
      meta: {
        title: 'Voyages - Rusa Travel',
        requiresAuth: true,
        adminModule: true,
        permissions: PERM.voyages,
      },
    },
    {
      path: '/admin/transporteurs',
      name: 'AdminTransporteurs',
      component: () => import('../views/Admin/Transporteurs.vue'),
      meta: {
        title: 'Gestion des Transporteurs - Rusa Travel',
        requiresAuth: true,
        adminModule: true,
        permissions: PERM.transporteurs,
      },
    },
    {
      path: '/admin/trips',
      name: 'AdminTrips',
      component: () => import('../views/Admin/TripsManagement.vue'),
      meta: {
        title: 'Gestion des Trajets - Rusa Travel',
        requiresAuth: true,
        adminModule: true,
        permissions: PERM.trips,
      },
    },
    {
      path: '/admin/reservations',
      name: 'AdminReservations',
      component: () => import('../views/Admin/ReservationsManagement.vue'),
      meta: {
        title: 'Gestion des Réservations - Rusa Travel',
        requiresAuth: true,
        adminModule: true,
        permissions: PERM.reservations,
      },
    },
    {
      path: '/admin/billets',
      name: 'AdminBillets',
      component: () => import('../views/Admin/Billets.vue'),
      meta: {
        title: 'Billets - Rusa Travel',
        requiresAuth: true,
        adminModule: true,
        permissions: PERM.billets,
      },
    },
    {
      path: '/admin/clients',
      name: 'AdminClients',
      component: () => import('../views/Admin/Clients.vue'),
      meta: {
        title: 'Clients - Rusa Travel',
        requiresAuth: true,
        adminModule: true,
        permissions: PERM.clients,
      },
    },
    {
      path: '/admin/payments',
      name: 'AdminPayments',
      component: () => import('../views/Admin/PaymentsManagement.vue'),
      meta: {
        title: 'Gestion des Paiements - Rusa Travel',
        requiresAuth: true,
        adminModule: true,
        permissions: PERM.paiements,
      },
    },
    {
      path: '/admin/settings',
      name: 'AdminSettings',
      component: () => import('../views/Admin/Settings.vue'),
      meta: {
        title: 'Paramètres Admin - Rusa Travel',
        requiresAuth: true,
        adminModule: true,
        permissions: PERM.settings,
      },
    },
    {
      path: '/transport/trips',
      name: 'TransportTrips',
      component: () => import('../views/Transport/Trips.vue'),
      meta: {
        title: 'Gestion des Trajets - Rusa Travel',
        requiresAuth: true,
        roles: ['transporteur']
      },
    },
    {
      path: '/transport/vehicles',
      name: 'TransportVehicles',
      component: () => import('../views/Transport/Vehicles.vue'),
      meta: {
        title: 'Gestion des Véhicules - Rusa Travel',
        requiresAuth: true,
        roles: ['transporteur']
      },
    },
    {
      path: '/transport/reservations',
      name: 'TransportReservations',
      component: () => import('../views/Transport/Reservations.vue'),
      meta: {
        title: 'Réservations Transporteur - Rusa Travel',
        requiresAuth: true,
        roles: ['transporteur']
      },
    },
    {
      path: '/transport/payments',
      name: 'TransportPayments',
      component: () => import('../views/Transport/Payments.vue'),
      meta: {
        title: 'Paiements Transporteur - Rusa Travel',
        requiresAuth: true,
        roles: ['transporteur']
      },
    },
    {
      path: '/transport/statistics',
      name: 'TransportStatistics',
      component: () => import('../views/Transport/Statistics.vue'),
      meta: {
        title: 'Statistiques Transporteur - Rusa Travel',
        requiresAuth: true,
        roles: ['transporteur']
      },
    },
    {
      path: '/transport/settings',
      name: 'TransportSettings',
      component: () => import('../views/Transport/Settings.vue'),
      meta: {
        title: 'Paramètres Transporteur - Rusa Travel',
        requiresAuth: true,
        roles: ['transporteur']
      },
    },
    {
      path: '/client/search',
      name: 'ClientSearch',
      component: () => import('../views/Client/TripSearch.vue'),
      meta: {
        title: 'Recherche de Trajets - Rusa Travel',
        requiresAuth: true,
        roles: ['client'],
        permissions: PERM.voyages,
      },
    },
    {
      path: '/client/reservations',
      name: 'ClientReservations',
      component: () => import('../views/Client/Reservations.vue'),
      meta: {
        title: 'Mes Réservations - Rusa Travel',
        requiresAuth: true,
        roles: ['client'],
        permissions: PERM.reservations,
      },
    },
    {
      path: '/client/payments',
      name: 'ClientPayments',
      component: () => import('../views/Client/Payments.vue'),
      meta: {
        title: 'Paiements Client - Rusa Travel',
        requiresAuth: true,
        roles: ['client'],
        permissions: PERM.paiements,
      },
    },
    {
      path: '/client/billets',
      name: 'ClientBillets',
      component: () => import('../views/Client/Billets.vue'),
      meta: {
        title: 'Mes Billets - Rusa Travel',
        requiresAuth: true,
        roles: ['client'],
        permissions: PERM.billets,
      },
    },
    {
      path: '/client/profile',
      name: 'ClientProfile',
      component: () => import('../views/Client/Profile.vue'),
      meta: {
        title: 'Mon Profil - Rusa Travel',
        requiresAuth: true,
        roles: ['client'],
        permissions: [...PERM.clients, ...PERM.utilisateurs],
      },
    },
    {
      path: '/client/settings',
      name: 'ClientSettings',
      component: () => import('../views/Client/Settings.vue'),
      meta: {
        title: 'Paramètres Client - Rusa Travel',
        requiresAuth: true,
        roles: ['client'],
        permissions: [...PERM.settings, ...PERM.clients],
      },
    },
    {
      path: '/error-404',
      name: '404 Error',
      component: () => import('../views/Errors/FourZeroFour.vue'),
      meta: {
        title: '404 Error',
        public: true
      },
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/error-404'
    }
  ],
})

export default router

router.beforeEach(async (to, from, next) => {
  document.title = to.meta.title || 'Rusa Travel'
  
  const authStore = useAuthStore()
  
  console.log('Navigation vers:', to.path, 'avec rôle:', authStore.role)
  
  // Check if route is public
  if (to.meta.public) {
    next()
    return
  }
  
  // Check if authentication is required
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    console.log('Route protégée, redirection vers /signin')
    next('/signin')
    return

  }
  
  const roleCatalog = useRoleCatalogStore()
  if (
    String(authStore.role || '').toLowerCase() === 'gerant' &&
    to.path === '/admin'
  ) {
    next('/gerant')
    return
  }

  const nav = verifyNavigationAccess(
    to,
    {
      isAuthenticated: authStore.isAuthenticated,
      role: authStore.role,
      societeId: authStore.societeId,
      user: authStore.user,
      hasAnyPermission: (keys) => authStore.hasAnyPermission(keys),
    },
    roleCatalog.activeRoles
  )
  if (!nav.allowed) {
    if (nav.reason === 'unauthenticated') {
      next('/signin')
      return
    }
    console.log(
      'Accès refusé:',
      nav.reason,
      '(rôle / société / permissions / module), redirection vers /unauthorized'
    )
    next('/unauthorized')
    return
  }
  
  // If user is authenticated and tries to access auth pages, redirect to dashboard
  if (authStore.isAuthenticated && (to.path === '/signin' || to.path === '/signup')) {
    const redirectPath = getDashboardPath(authStore.role || 'client')
    console.log('Utilisateur authentifié sur page de connexion, redirection vers:', redirectPath)
    next(redirectPath)
    return
  }
  
  next()
})
