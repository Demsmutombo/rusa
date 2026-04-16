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
        <p class="mt-2 max-w-2xl text-sm text-primary-100/95">
          Vue d’ensemble de votre société. Les blocs ci-dessous s’affichent progressivement pour faciliter la
          lecture.
        </p>
        <p v-if="subtitleLine" class="mt-2 text-xs text-primary-200/90">{{ subtitleLine }}</p>
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
            <span class="mt-0.5 block text-xs text-gray-500 dark:text-primary-400/75">{{ item.hint }}</span>
          </span>
        </RouterLink>
      </div>
    </section>

    <!-- 3. Rappel -->
    <section
      class="admin-dash-enter rusa-card-static rounded-xl border border-gray-200/90 p-4 sm:p-5 dark:border-primary-800/60 dark:bg-primary-950/40"
      :style="staggerStyle(2 + quickLinks.length)"
    >
      <h2 class="text-sm font-semibold text-gray-900 dark:text-white">À savoir</h2>
      <ul class="mt-2 list-inside list-disc space-y-1.5 text-sm text-gray-600 dark:text-primary-300/80">
        <li>
          Destinations, types de bus et bus se gèrent depuis le menu ou les accès rapides (création / modification,
          statut actif ou inactif, pas de suppression).
        </li>
        <li>Les agents se gèrent depuis le menu ou les accès rapides.</li>
        <li>Les indicateurs détaillés (graphiques, exports) pourront être enrichis plus tard.</li>
      </ul>
    </section>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import {
  UserCircleIcon,
  MapPinIcon,
  TruckIcon,
  QueueListIcon,
} from '@heroicons/vue/24/outline'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const DELAY_MS = 95

function staggerStyle(step) {
  return { animationDelay: `${step * DELAY_MS}ms` }
}

const subtitleLine = computed(() => {
  const parts = []
  const u = authStore.user
  const name = u?.nomComplet || u?.NomComplet
  if (name) parts.push(String(name).trim())
  if (typeof u?.societe === 'string' && u.societe.trim()) parts.push(u.societe.trim())
  else if (u?.societe?.nom) parts.push(String(u.societe.nom))
  return parts.length ? parts.join(' · ') : ''
})

const quickLinks = [
  { to: '/admin/agents', label: 'Agents', hint: 'Employés de la société', icon: UserCircleIcon },
  { to: '/admin/destinations', label: 'Destinations', hint: 'Trajets et tarifs (statut sans suppression)', icon: MapPinIcon },
  { to: '/admin/bus-types', label: 'Types de bus', hint: 'Catégories de véhicules', icon: QueueListIcon },
  { to: '/admin/buses', label: 'Bus', hint: 'Parc véhicules', icon: TruckIcon },
]
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
