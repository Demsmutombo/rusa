<template>
  <div class="admin-dashboard min-w-0 w-full space-y-5 sm:space-y-6">
    <!-- 1. En-tête -->
    <header class="admin-dash-enter dashboard-hero" :style="staggerStyle(0)">
      <div
        class="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/10 sm:h-36 sm:w-36"
        aria-hidden="true"
      />
      <div class="relative min-w-0">
        <p class="text-[10px] font-semibold uppercase tracking-widest text-primary-200/90 sm:text-xs">
          Administrateur
        </p>
        <h1 class="mt-1 text-xl font-bold leading-tight text-white sm:text-2xl">Tableau de bord</h1>
        <p class="mt-2 max-w-2xl text-sm leading-relaxed text-primary-100/95">
          {{ dashboardIntro }}
        </p>
        <p v-if="subtitleLine" class="mt-2 text-xs font-medium text-primary-200/90">{{ subtitleLine }}</p>
      </div>
    </header>

    <section
      class="admin-dash-enter space-y-4"
      :style="staggerStyle(1)"
      aria-labelledby="admin-modern-title"
    >
      <h2 id="admin-modern-title" class="sr-only">Vue synthétique administrateur</h2>
      <div class="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <article
          v-for="(card, idx) in quickSummaryCards"
          :key="card.key"
          class="dashboard-kpi-card"
          :class="idx === 0 ? 'dashboard-kpi-card-accent' : ''"
        >
          <p class="text-xs font-medium" :class="idx === 0 ? 'text-white/85' : 'text-gray-500 dark:text-primary-400/85'">
            {{ card.label }}
          </p>
          <p class="mt-1 text-lg font-bold tabular-nums" :class="idx === 0 ? 'text-white' : 'text-gray-900 dark:text-white'">
            {{ card.display }}
          </p>
        </article>
      </div>
      <div class="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <article class="dashboard-panel-soft lg:col-span-9">
          <div class="mb-3 flex items-center justify-between gap-3">
            <h3 class="text-sm font-semibold text-gray-900 dark:text-white">Activation des modules</h3>
            <span class="text-xs text-gray-500 dark:text-primary-300/80">{{ moduleBars.length }} points</span>
          </div>
          <div class="grid min-h-[150px] grid-cols-6 items-end gap-2 rounded-lg border border-primary-100/70 bg-white/70 p-3 dark:border-primary-800/50 dark:bg-primary-950/40">
            <div v-for="bar in moduleBars" :key="bar.key" class="flex flex-col items-center gap-1">
              <div class="w-full rounded-md bg-gradient-to-t from-[var(--color-700)] to-[var(--color-400)]" :style="{ height: `${bar.height}%`, minHeight: '8px' }" />
              <span class="text-[10px] font-semibold text-gray-600 dark:text-primary-300/85">{{ bar.label }}</span>
            </div>
          </div>
        </article>
        <article class="dashboard-panel-soft lg:col-span-3">
          <h3 class="mb-3 text-sm font-semibold text-gray-900 dark:text-white">Couverture accès</h3>
          <div class="mx-auto grid h-28 w-28 place-items-center rounded-full" :style="accessCoverageStyle">
            <div class="grid h-20 w-20 place-items-center rounded-full bg-white text-sm font-bold text-gray-900 dark:bg-primary-950 dark:text-white">
              {{ accessCoverageLabel }}
            </div>
          </div>
          <ul class="mt-3 space-y-1 border-t border-primary-100/80 pt-2 text-xs text-gray-600 dark:border-primary-800/60 dark:text-primary-300/85">
            <li>Modules visibles: {{ quickLinks.length }}</li>
            <li>Modules attendus: {{ quickLinksAll.length }}</li>
            <li>Droits JWT: {{ authStore.permissions?.length || 0 }}</li>
          </ul>
        </article>
      </div>
    </section>

    <!-- 2. Accès rapides -->
    <section
      class="admin-dash-enter"
      :style="staggerStyle(2)"
      aria-labelledby="admin-dash-quick-title"
    >
      <h2
        id="admin-dash-quick-title"
        class="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white"
      >
        <span class="h-1.5 w-1.5 shrink-0 rounded-full bg-primary-500" aria-hidden="true" />
        Accès rapides
      </h2>
      <p
        v-if="countsReady && !quickLinks.length"
        class="rounded-xl border border-amber-200/80 bg-amber-50/90 px-4 py-3 text-sm text-amber-950 dark:border-amber-900/40 dark:bg-amber-950/35 dark:text-amber-100"
      >
        Aucun raccourci : le compte n’a pas les permissions attendues (ex. Agent.Read). Après connexion, vérifiez
        que l’API renvoie la liste des permissions ou contactez l’administrateur technique.
      </p>
      <div v-else-if="quickLinks.length" class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <RouterLink
          v-for="(item, i) in quickLinks"
          :key="item.to"
          :to="item.to"
          class="admin-dash-enter dashboard-kpi-card group flex items-start gap-3"
          :style="staggerStyle(2 + i)"
        >
          <span
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-700 dark:bg-primary-900/80 dark:text-primary-300"
            aria-hidden="true"
          >
            <component :is="item.icon" class="size-5 shrink-0" />
          </span>
          <span class="min-w-0">
            <span class="block font-medium text-gray-900 group-hover:text-primary-700 dark:text-white dark:group-hover:text-primary-300">
              {{ item.label }}
            </span>
            <span class="mt-0.5 block text-xs text-gray-500 dark:text-primary-400/75">{{ item.hint(counts, countsReady) }}</span>
          </span>
        </RouterLink>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import {
  UserCircleIcon,
  MapPinIcon,
  TruckIcon,
  QueueListIcon,
  CalendarDaysIcon,
  BanknotesIcon,
} from '@heroicons/vue/24/outline'
import { useAuthStore } from '@/stores/auth'
import { PERM } from '@/config/adminModulePermissions'

const authStore = useAuthStore()

const DELAY_MS = 95

function staggerStyle(step) {
  return { animationDelay: `${step * DELAY_MS}ms` }
}

/** Prénom pour une formule d’accueil sobre (ex. « Israel » depuis « Israel Mutombo »). */
function firstNameFromUser(u) {
  const full = String(u?.nomComplet || u?.NomComplet || '').trim()
  if (!full) return ''
  return full.split(/\s+/)[0] || full
}

const dashboardIntro = computed(() => {
  const first = firstNameFromUser(authStore.user)
  const greet = first ? `${first}, ` : ''
  return `${greet}bienvenue — vue d’ensemble et raccourcis vers vos modules.`
})

/** Contexte société uniquement (le prénom est dans le paragraphe principal). */
const subtitleLine = computed(() => {
  const u = authStore.user
  if (typeof u?.societe === 'string' && u.societe.trim()) return u.societe.trim()
  if (u?.societe?.nom) return String(u.societe.nom).trim()
  return ''
})

/** Compteurs alignés sur les mêmes APIs que les écrans liste. */
const counts = ref({ agents: 0, destinations: 0, busTypes: 0, buses: 0, reservations: 0, paiements: 0 })
const countsReady = ref(false)

function hintAgents(c, ready) {
  if (!ready) return 'Employés de la société'
  const n = c.agents
  if (n === 0) return 'Aucun employé dans la société'
  if (n === 1) return '1 employé dans la société'
  return `${n} employés dans la société`
}

function hintDestinations(c, ready) {
  if (!ready) return 'Trajets et tarifs (statut sans suppression)'
  const n = c.destinations
  if (n === 0) return 'Aucune destination · trajets et tarifs (statut sans suppression)'
  if (n === 1) return '1 destination · trajets et tarifs (statut sans suppression)'
  return `${n} destinations · trajets et tarifs (statut sans suppression)`
}

function hintBusTypes(c, ready) {
  if (!ready) return 'Catégories de véhicules'
  const n = c.busTypes
  if (n === 0) return 'Aucune catégorie de véhicule'
  if (n === 1) return '1 catégorie de véhicule'
  return `${n} catégories de véhicules`
}

function hintBuses(c, ready) {
  if (!ready) return 'Parc véhicules'
  const n = c.buses
  if (n === 0) return 'Aucun bus dans le parc'
  if (n === 1) return '1 bus dans le parc'
  return `${n} bus dans le parc`
}

function hintReservations(c, ready) {
  if (!ready) return 'Liste et statuts (API)'
  const n = c.reservations
  if (n === 0) return 'Aucune réservation pour la société'
  if (n === 1) return '1 réservation enregistrée'
  return `${n} réservations enregistrées`
}

function hintPaiements(c, ready) {
  if (!ready) return 'Encaissements et suivi'
  const n = c.paiements
  if (n === 0) return 'Aucun paiement listé'
  if (n === 1) return '1 paiement'
  return `${n} paiements`
}

const quickLinksAll = [
  { to: '/admin/agents', label: 'Agents', hint: hintAgents, icon: UserCircleIcon, keys: PERM.agents },
  {
    to: '/admin/destinations',
    label: 'Destinations',
    hint: hintDestinations,
    icon: MapPinIcon,
    keys: PERM.destinations,
  },
  {
    to: '/admin/bus-types',
    label: 'Types de bus',
    hint: hintBusTypes,
    icon: QueueListIcon,
    keys: PERM.busTypes,
  },
  { to: '/admin/buses', label: 'Bus', hint: hintBuses, icon: TruckIcon, keys: PERM.buses },
  {
    to: '/admin/reservations',
    label: 'Réservations',
    hint: hintReservations,
    icon: CalendarDaysIcon,
    keys: PERM.reservations,
  },
  {
    to: '/admin/payments',
    label: 'Paiements',
    hint: hintPaiements,
    icon: BanknotesIcon,
    keys: PERM.paiements,
  },
]

const quickLinks = computed(() => {
  return quickLinksAll
    .filter((item) => authStore.hasAnyPermission(item.keys))
    .map(({ keys: _keys, ...rest }) => rest)
})

const quickSummaryCards = computed(() => {
  const total = quickLinksAll.length
  const enabled = quickLinks.value.length
  const denied = Math.max(0, total - enabled)
  const claims = Number(authStore.permissions?.length || 0)
  return [
    { key: 'enabled', label: 'Modules actifs', display: String(enabled) },
    { key: 'denied', label: 'Modules masqués', display: String(denied) },
    { key: 'claims', label: 'Claims JWT', display: String(claims) },
    { key: 'ready', label: 'Compteurs', display: countsReady.value ? 'OK' : 'N/A' },
  ]
})

const accessCoveragePercent = computed(() => {
  const total = quickLinksAll.length || 1
  return Math.max(0, Math.min(100, Math.round((quickLinks.value.length / total) * 100)))
})

const accessCoverageLabel = computed(() => `${accessCoveragePercent.value} %`)

const accessCoverageStyle = computed(() => ({
  background: `conic-gradient(var(--color-600) 0% ${accessCoveragePercent.value}%, var(--color-100) ${accessCoveragePercent.value}% 100%)`,
}))

const moduleBars = computed(() => {
  const activePaths = new Set(quickLinks.value.map((x) => x.to))
  const source = quickLinksAll.slice(0, 6)
  return source.map((item) => {
    const active = activePaths.has(item.to)
    return {
      key: item.to,
      label: item.label.slice(0, 3).toUpperCase(),
      height: active ? 92 : 24,
    }
  })
})

// Dashboard admin en mode "liens rapides" uniquement : pas d'appels API au montage.
</script>

<style scoped>
@keyframes admin-dash-in {
  from {
    transform: translateY(10px);
  }
  to {
    transform: translateY(0);
  }
}

.admin-dash-enter {
  animation: admin-dash-in 0.45s cubic-bezier(0.22, 1, 0.36, 1) both;
}

@media (prefers-reduced-motion: reduce) {
  .admin-dash-enter {
    animation: none;
  }
}
</style>
