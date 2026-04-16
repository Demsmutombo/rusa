<template>
  <div class="admin-dashboard min-w-0 w-full space-y-5 sm:space-y-6">
    <!-- 1. En-tête -->
    <header
      class="admin-dash-enter rusa-gradient-header relative overflow-hidden rounded-2xl p-4 shadow-lg sm:p-6"
      :style="staggerStyle(0)"
    >
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

    <!-- 2. Accès rapides -->
    <section
      class="admin-dash-enter"
      :style="staggerStyle(1)"
      aria-labelledby="admin-dash-quick-title"
    >
      <h2
        id="admin-dash-quick-title"
        class="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white"
      >
        <span class="h-1.5 w-1.5 shrink-0 rounded-full bg-primary-500" aria-hidden="true" />
        Accès rapides
      </h2>
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <RouterLink
          v-for="(item, i) in quickLinks"
          :key="item.to"
          :to="item.to"
          class="admin-dash-enter group flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:border-primary-300 hover:shadow-md dark:border-primary-800/70 dark:bg-primary-950/60 dark:hover:border-primary-600"
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
import { computed, ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import {
  UserCircleIcon,
  MapPinIcon,
  TruckIcon,
  QueueListIcon,
  CalendarDaysIcon,
} from '@heroicons/vue/24/outline'
import { useAuthStore } from '@/stores/auth'
import { listAgentsArray } from '@/services/agentService'
import { listDestinationsArray } from '@/services/destinationService'
import { listTypeBusArray } from '@/services/typeBusService'
import { listBusArray } from '@/services/busService'
import { listReservationsArray } from '@/services/reservationService'

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
const counts = ref({ agents: 0, destinations: 0, busTypes: 0, buses: 0, reservations: 0 })
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

const quickLinks = computed(() => [
  { to: '/admin/agents', label: 'Agents', hint: hintAgents, icon: UserCircleIcon },
  { to: '/admin/destinations', label: 'Destinations', hint: hintDestinations, icon: MapPinIcon },
  { to: '/admin/bus-types', label: 'Types de bus', hint: hintBusTypes, icon: QueueListIcon },
  { to: '/admin/buses', label: 'Bus', hint: hintBuses, icon: TruckIcon },
  { to: '/admin/reservations', label: 'Réservations', hint: hintReservations, icon: CalendarDaysIcon },
])

onMounted(async () => {
  try {
    const [agents, destinations, busTypes, buses, reservations] = await Promise.all([
      listAgentsArray().catch(() => []),
      listDestinationsArray().catch(() => []),
      listTypeBusArray().catch(() => []),
      listBusArray().catch(() => []),
      listReservationsArray().catch(() => []),
    ])
    counts.value = {
      agents: Array.isArray(agents) ? agents.length : 0,
      destinations: Array.isArray(destinations) ? destinations.length : 0,
      busTypes: Array.isArray(busTypes) ? busTypes.length : 0,
      buses: Array.isArray(buses) ? buses.length : 0,
      reservations: Array.isArray(reservations) ? reservations.length : 0,
    }
  } catch {
    counts.value = { agents: 0, destinations: 0, busTypes: 0, buses: 0, reservations: 0 }
  } finally {
    countsReady.value = true
  }
})
</script>

<style scoped>
@keyframes admin-dash-in {
  from {
    opacity: 0;
    transform: translateY(14px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.admin-dash-enter {
  opacity: 0;
  animation: admin-dash-in 0.52s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}
</style>
