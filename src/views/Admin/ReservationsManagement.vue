<template>
  <DefaultLayout>
    <div class="space-y-4">
      <!-- Header -->
      <div class="rusa-gradient-header flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-2xl font-bold text-white">
            Gestion des Réservations
          </h1>
          <p class="text-primary-100">
            {{ headerIntro }}
          </p>
        </div>
        <div class="flex items-center gap-3">
          <button
            type="button"
            class="shrink-0 rounded-lg bg-white/15 px-4 py-2.5 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white/25"
          >
            Exporter les réservations
          </button>
        </div>
      </div>

      <!-- Stats Cards (palette alignée Bus / Destinations — thème primary) -->
      <div class="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div class="rusa-card p-5">
          <div class="flex items-center">
            <div
              class="rounded-lg bg-primary-100/90 p-3 text-primary-700 dark:bg-primary-900/55 dark:text-primary-300"
            >
              <svg class="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div class="ml-4 min-w-0">
              <p class="text-sm font-medium text-gray-600 dark:text-primary-300/80">Total Réservations</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.total }}</p>
            </div>
          </div>
        </div>

        <div class="rusa-card p-5">
          <div class="flex items-center">
            <div
              class="rounded-lg bg-primary-100/90 p-3 text-primary-700 dark:bg-primary-900/55 dark:text-primary-300"
            >
              <svg class="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="ml-4 min-w-0">
              <p class="text-sm font-medium text-gray-600 dark:text-primary-300/80">Confirmées</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.confirmed }}</p>
            </div>
          </div>
        </div>

        <div class="rusa-card p-5">
          <div class="flex items-center">
            <div
              class="rounded-lg bg-primary-100/90 p-3 text-primary-700 dark:bg-primary-900/55 dark:text-primary-300"
            >
              <svg class="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="ml-4 min-w-0">
              <p class="text-sm font-medium text-gray-600 dark:text-primary-300/80">En attente</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.pending }}</p>
            </div>
          </div>
        </div>

        <div class="rusa-card p-5">
          <div class="flex items-center">
            <div
              class="rounded-lg bg-primary-100/90 p-3 text-primary-700 dark:bg-primary-900/55 dark:text-primary-300"
            >
              <svg class="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="ml-4 min-w-0">
              <p class="text-sm font-medium text-gray-600 dark:text-primary-300/80">Revenus</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">€{{ stats.revenue.toLocaleString('fr-FR') }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters (même gabarit que Bus / AdminListToolbar) -->
      <div
        class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-primary-800/60 dark:bg-primary-950/70 dark:shadow-none md:p-5"
      >
        <div class="grid grid-cols-1 gap-4 md:grid-cols-4 md:items-end">
          <div>
            <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-primary-200/90">Rechercher</label>
            <input
              v-model="searchQuery"
              type="search"
              autocomplete="off"
              placeholder="Client, trajet, transporteur…"
              class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-primary-700 dark:bg-primary-900/80 dark:text-gray-100 dark:placeholder:text-primary-500/50 dark:focus:border-primary-400 dark:focus:ring-primary-400"
            />
          </div>
          <div>
            <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-primary-200/90">Statut</label>
            <select
              v-model="statusFilter"
              class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm font-medium text-gray-800 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/25 dark:border-primary-700 dark:bg-primary-900/70 dark:text-primary-100 dark:focus:border-primary-400"
            >
              <option value="">Tous les statuts</option>
              <option value="confirmed">Confirmées</option>
              <option value="pending">En attente</option>
              <option value="cancelled">Annulées</option>
              <option value="completed">Terminées</option>
            </select>
          </div>
          <div>
            <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-primary-200/90">Date</label>
            <input
              v-model="dateFilter"
              type="date"
              class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-primary-700 dark:bg-primary-900/80 dark:text-gray-100 dark:[color-scheme:dark] dark:focus:border-primary-400 dark:focus:ring-primary-400"
            />
          </div>
          <div class="flex items-end">
            <button
              type="button"
              class="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 dark:border-primary-700 dark:bg-primary-900/50 dark:text-primary-200 dark:hover:bg-primary-800/60"
              @click="resetFilters"
            >
              Réinitialiser
            </button>
          </div>
        </div>
      </div>

      <!-- Reservations Table -->
      <div class="rusa-panel">
        <p
          v-if="error"
          class="border-b border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200"
        >
          {{ error }}
        </p>
        <p
          v-if="loading"
          class="px-4 py-10 text-center text-sm text-gray-500 dark:text-primary-400/80"
        >
          Chargement des réservations…
        </p>
        <div v-else class="overflow-x-auto">
          <table class="w-full min-w-[720px] text-left text-sm">
            <thead class="border-b border-gray-200 bg-gray-50 dark:border-primary-800/60 dark:bg-primary-900/50">
              <tr>
                <th class="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-primary-300/70">
                  Réservation
                </th>
                <th class="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-primary-300/70">
                  Client
                </th>
                <th class="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-primary-300/70">
                  Trajet
                </th>
                <th class="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-primary-300/70">
                  Date & Heure
                </th>
                <th class="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-primary-300/70">
                  Places
                </th>
                <th class="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-primary-300/70">
                  Total
                </th>
                <th class="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-primary-300/70">
                  Statut
                </th>
                <th class="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-primary-300/70">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-primary-800/50">
              <tr
                v-for="reservation in filteredReservations"
                :key="reservation.id"
                class="bg-white hover:bg-gray-50/80 dark:bg-primary-950/40 dark:hover:bg-primary-900/35"
              >
                <td class="whitespace-nowrap px-4 py-3">
                  <p class="font-medium text-gray-900 dark:text-gray-100">#{{ reservation.id }}</p>
                  <p class="text-gray-500 dark:text-primary-400/85">{{ reservation.createdAt }}</p>
                </td>
                <td class="whitespace-nowrap px-4 py-3">
                  <div class="flex items-center">
                    <div
                      class="flex size-8 shrink-0 items-center justify-center rounded-full bg-gray-200 text-gray-700 dark:bg-primary-800 dark:text-primary-100"
                    >
                      <span class="text-xs font-medium">{{ clientInitial(reservation.clientName) }}</span>
                    </div>
                    <div class="ml-3 min-w-0">
                      <p class="font-medium text-gray-900 dark:text-gray-100">{{ reservation.clientName }}</p>
                      <p class="truncate text-gray-500 dark:text-primary-400/85">{{ reservation.clientEmail }}</p>
                    </div>
                  </div>
                </td>
                <td class="whitespace-nowrap px-4 py-3">
                  <div>
                    <p class="font-medium text-gray-900 dark:text-gray-100">
                      {{ reservation.departure }} → {{ reservation.arrival }}
                    </p>
                    <p class="text-gray-500 dark:text-primary-400/85">{{ reservation.carrier }}</p>
                  </div>
                </td>
                <td class="whitespace-nowrap px-4 py-3">
                  <div>
                    <p class="text-gray-900 dark:text-gray-100">{{ reservation.date }}</p>
                    <p class="text-gray-500 dark:text-primary-400/85">{{ reservation.time }}</p>
                  </div>
                </td>
                <td class="whitespace-nowrap px-4 py-3 text-gray-900 dark:text-gray-100">
                  {{ reservation.places }} place(s)
                </td>
                <td class="whitespace-nowrap px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
                  €{{ Number(reservation.totalPrice || 0).toLocaleString('fr-FR') }}
                </td>
                <td class="whitespace-nowrap px-4 py-3">
                  <span class="rounded-full px-2 py-1 text-xs font-medium" :class="getStatusBadgeClass(reservation.status)">
                    {{ statusLabel(reservation.status) }}
                  </span>
                </td>
                <td class="whitespace-nowrap px-4 py-3 text-sm font-medium">
                  <button
                    type="button"
                    class="mr-3 text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-200"
                    @click="viewReservationDetails(reservation)"
                  >
                    Détails
                  </button>
                  <button
                    v-if="reservation.status === 'pending'"
                    type="button"
                    class="mr-3 text-emerald-600 hover:text-emerald-800 dark:text-emerald-400/90 dark:hover:text-emerald-300"
                    @click="confirmReservation(reservation)"
                  >
                    Confirmer
                  </button>
                  <button
                    v-if="reservation.status === 'confirmed'"
                    type="button"
                    class="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    @click="cancelReservation(reservation)"
                  >
                    Annuler
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
          <p
            v-if="!filteredReservations.length"
            class="px-4 py-10 text-center text-sm text-gray-500 dark:text-primary-400/80"
          >
            Aucune réservation à afficher.
          </p>
        </div>
      </div>
    </div>
  </DefaultLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import DefaultLayout from '@/components/layout/DefaultLayout.vue'
import { notify } from '@/utils/notify'
import { useAdminModuleGreeting } from '@/composables/useAdminModuleGreeting'
import {
  listReservationsArray,
  mapReservationFromApi,
  reservationRawToPutBody,
  updateReservation,
  mapUiStatutToApi,
} from '@/services/reservationService'

const headerIntro = useAdminModuleGreeting('bienvenue — réservations ci-dessous.')

const reservations = ref([])
const loading = ref(false)
const error = ref('')

function clientInitial(name) {
  const s = String(name || '').trim()
  if (!s || s === '—') return '?'
  return s.charAt(0).toUpperCase()
}

async function loadReservations() {
  loading.value = true
  error.value = ''
  try {
    const rows = await listReservationsArray()
    reservations.value = rows.map((r) => mapReservationFromApi(r))
  } catch (e) {
    error.value = e?.message || 'Impossible de charger les réservations.'
    reservations.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadReservations()
})

const searchQuery = ref('')
const statusFilter = ref('')
const dateFilter = ref('')

const stats = computed(() => {
  return {
    total: reservations.value.length,
    confirmed: reservations.value.filter(r => r.status === 'confirmed').length,
    pending: reservations.value.filter(r => r.status === 'pending').length,
    revenue: reservations.value
      .filter(r => r.status === 'completed')
      .reduce((sum, r) => sum + r.totalPrice, 0)
  }
})

const filteredReservations = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  return reservations.value.filter((reservation) => {
    const hay = [
      reservation.clientName,
      reservation.clientEmail,
      reservation.departure,
      reservation.arrival,
      reservation.carrier,
      String(reservation.id),
    ]
      .map((x) => String(x || '').toLowerCase())
      .join(' ')
    const matchesSearch = !q || hay.includes(q)
    const matchesStatus = !statusFilter.value || reservation.status === statusFilter.value
    const matchesDate = !dateFilter.value || reservation.date === dateFilter.value
    return matchesSearch && matchesStatus && matchesDate
  })
})

const getStatusBadgeClass = (status) => {
  const classes = {
    confirmed:
      'bg-emerald-100 text-emerald-900 dark:bg-emerald-950/55 dark:text-emerald-200',
    pending:
      'bg-primary-100 text-primary-900 dark:bg-primary-900/50 dark:text-primary-200',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-200',
    completed:
      'bg-sky-100 text-sky-900 dark:bg-sky-950/50 dark:text-sky-200',
  }
  return (
    classes[status] ||
    'bg-gray-100 text-gray-800 dark:bg-primary-900/40 dark:text-primary-200'
  )
}

const STATUS_LABELS = {
  confirmed: 'Confirmée',
  pending: 'En attente',
  cancelled: 'Annulée',
  completed: 'Terminée',
}

function statusLabel(status) {
  return STATUS_LABELS[status] || status
}

const resetFilters = () => {
  searchQuery.value = ''
  statusFilter.value = ''
  dateFilter.value = ''
}

const viewReservationDetails = (reservation) => {
  const lines = [
    `Client : ${reservation.clientName}`,
    `Contact : ${reservation.clientEmail}`,
    `Trajet : ${reservation.departure} → ${reservation.arrival}`,
    `Départ : ${reservation.date} à ${reservation.time}`,
    `Montant : €${Number(reservation.totalPrice || 0).toLocaleString('fr-FR')}`,
    `Statut (API) : ${reservation.apiStatutReservation || '—'}`,
  ]
  notify.info(`Réservation #${reservation.id}`, lines.join('\n'))
}

const confirmReservation = async (reservation) => {
  try {
    const body = reservationRawToPutBody(reservation.raw, {
      statutReservation: mapUiStatutToApi('confirmed'),
    })
    await updateReservation(reservation.id, body)
    notify.toast.success('Réservation confirmée')
    await loadReservations()
  } catch (e) {
    await notify.error('Confirmation impossible', e?.message || 'Erreur inconnue')
  }
}

const cancelReservation = async (reservation) => {
  const ok = await notify.confirm(
    `Êtes-vous sûr de vouloir annuler la réservation #${reservation.id} ?`,
    'Annuler la réservation'
  )
  if (!ok) return
  try {
    const body = reservationRawToPutBody(reservation.raw, {
      statutReservation: mapUiStatutToApi('cancelled'),
    })
    await updateReservation(reservation.id, body)
    notify.toast.success('Réservation annulée')
    await loadReservations()
  } catch (e) {
    await notify.error('Annulation impossible', e?.message || 'Erreur inconnue')
  }
}
</script>

