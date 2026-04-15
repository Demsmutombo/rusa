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
            Supervisez toutes les réservations de la plateforme
          </p>
        </div>
        <div class="flex items-center gap-3">
          <button type="button" class="rusa-btn-primary bg-white text-primary-800 hover:bg-primary-50">
            Exporter les réservations
          </button>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div class="rusa-card p-6">
          <div class="flex items-center">
            <div class="p-3 bg-blue-100 rounded-lg">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Total Réservations</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.total }}</p>
            </div>
          </div>
        </div>

        <div class="rusa-card p-6">
          <div class="flex items-center">
            <div class="p-3 bg-green-100 rounded-lg">
              <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Confirmées</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.confirmed }}</p>
            </div>
          </div>
        </div>

        <div class="rusa-card p-6">
          <div class="flex items-center">
            <div class="p-3 bg-yellow-100 rounded-lg">
              <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">En attente</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.pending }}</p>
            </div>
          </div>
        </div>

        <div class="rusa-card p-6">
          <div class="flex items-center">
            <div class="p-3 bg-purple-100 rounded-lg">
              <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Revenus</p>
              <p class="text-2xl font-bold text-gray-900">€{{ stats.revenue.toLocaleString() }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="rusa-card">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Rechercher</label>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Client, trajet, transporteur..."
              class="w-full px-3 py-2 border border-primary-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Statut</label>
            <select
              v-model="statusFilter"
              class="w-full px-3 py-2 border border-primary-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Tous les statuts</option>
              <option value="confirmed">Confirmées</option>
              <option value="pending">En attente</option>
              <option value="cancelled">Annulées</option>
              <option value="completed">Terminées</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              v-model="dateFilter"
              type="date"
              class="w-full px-3 py-2 border border-primary-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div class="flex items-end">
            <button
              @click="resetFilters"
              class="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            >
              Réinitialiser
            </button>
          </div>
        </div>
      </div>

      <!-- Reservations Table -->
      <div class="rusa-panel">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-primary-50/80 dark:bg-primary-950/50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Réservation
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trajet
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Heure
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Places
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-primary-100 dark:divide-primary-800/50">
              <tr v-for="reservation in filteredReservations" :key="reservation.id">
                <td class="px-6 py-4 whitespace-nowrap">
                  <p class="text-sm font-medium text-gray-900">#{{ reservation.id }}</p>
                  <p class="text-sm text-gray-500">{{ reservation.createdAt }}</p>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                      <span class="text-xs font-medium">{{ reservation.clientName.charAt(0) }}</span>
                    </div>
                    <div class="ml-3">
                      <p class="text-sm font-medium text-gray-900">{{ reservation.clientName }}</p>
                      <p class="text-sm text-gray-500">{{ reservation.clientEmail }}</p>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div>
                    <p class="text-sm font-medium text-gray-900">
                      {{ reservation.departure }} → {{ reservation.arrival }}
                    </p>
                    <p class="text-sm text-gray-500">{{ reservation.carrier }}</p>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div>
                    <p class="text-sm text-gray-900">{{ reservation.date }}</p>
                    <p class="text-sm text-gray-500">{{ reservation.time }}</p>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <p class="text-sm text-gray-900">{{ reservation.places }} place(s)</p>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <p class="text-sm font-medium text-gray-900">€{{ reservation.totalPrice }}</p>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-2 py-1 text-xs font-medium rounded-full"
                        :class="getStatusBadgeClass(reservation.status)">
                    {{ reservation.status }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    @click="viewReservationDetails(reservation)"
                    class="text-primary-600 hover:text-primary-800 mr-3"
                  >
                    Détails
                  </button>
                  <button
                    v-if="reservation.status === 'pending'"
                    @click="confirmReservation(reservation)"
                    class="text-green-600 hover:text-green-900 mr-3"
                  >
                    Confirmer
                  </button>
                  <button
                    v-if="reservation.status === 'confirmed'"
                    @click="cancelReservation(reservation)"
                    class="text-red-600 hover:text-red-900"
                  >
                    Annuler
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </DefaultLayout>
</template>

<script setup>
import { ref, computed } from 'vue'
import DefaultLayout from '@/components/layout/DefaultLayout.vue'
import { notify } from '@/utils/notify'

const reservations = ref([
  {
    id: 1,
    clientName: 'Jean Dupont',
    clientEmail: 'jean.dupont@email.com',
    departure: 'Paris',
    arrival: 'Lyon',
    carrier: 'Transport Rapide',
    date: '2024-01-15',
    time: '08:00',
    places: 2,
    totalPrice: 90,
    status: 'confirmed',
    createdAt: '2024-01-10'
  },
  {
    id: 2,
    clientName: 'Marie Martin',
    clientEmail: 'marie.martin@email.com',
    departure: 'Lyon',
    arrival: 'Marseille',
    carrier: 'Voyage Express',
    date: '2024-01-16',
    time: '14:30',
    places: 1,
    totalPrice: 55,
    status: 'pending',
    createdAt: '2024-01-11'
  },
  {
    id: 3,
    clientName: 'Pierre Bernard',
    clientEmail: 'pierre.bernard@email.com',
    departure: 'Paris',
    arrival: 'Bordeaux',
    carrier: 'Speed Transport',
    date: '2024-01-14',
    time: '10:00',
    places: 3,
    totalPrice: 360,
    status: 'completed',
    createdAt: '2024-01-08'
  },
  {
    id: 4,
    clientName: 'Sophie Petit',
    clientEmail: 'sophie.petit@email.com',
    departure: 'Marseille',
    arrival: 'Nice',
    carrier: 'City Link',
    date: '2024-01-13',
    time: '09:15',
    places: 2,
    totalPrice: 70,
    status: 'cancelled',
    createdAt: '2024-01-09'
  },
  {
    id: 5,
    clientName: 'Luc',
    clientEmail: 'lucas.moreau@email.com',
    departure: 'Lille',
    arrival: 'Bruxelles',
    carrier: 'Rapid Move',
    date: '2024-01-17',
    time: '07:30',
    places: 4,
    totalPrice: 112,
    status: 'confirmed',
    createdAt: '2024-01-12'
  }
])

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
  return reservations.value.filter(reservation => {
    const matchesSearch = reservation.clientName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                         reservation.clientEmail.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                         reservation.departure.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                         reservation.arrival.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                         reservation.carrier.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesStatus = !statusFilter.value || reservation.status === statusFilter.value
    const matchesDate = !dateFilter.value || reservation.date === dateFilter.value
    return matchesSearch && matchesStatus && matchesDate
  })
})

const getStatusBadgeClass = (status) => {
  const classes = {
    confirmed: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    cancelled: 'bg-red-100 text-red-800',
    completed: 'bg-blue-100 text-blue-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

const resetFilters = () => {
  searchQuery.value = ''
  statusFilter.value = ''
  dateFilter.value = ''
}

const viewReservationDetails = (reservation) => {
  console.log('Voir détails de la réservation:', reservation)
}

const confirmReservation = (reservation) => {
  const index = reservations.value.findIndex(r => r.id === reservation.id)
  if (index !== -1) {
    reservations.value[index].status = 'confirmed'
  }
}

const cancelReservation = async (reservation) => {
  const ok = await notify.confirm(
    `Êtes-vous sûr de vouloir annuler la réservation #${reservation.id} ?`,
    'Annuler la réservation'
  )
  if (!ok) return
  const index = reservations.value.findIndex(r => r.id === reservation.id)
  if (index !== -1) {
    reservations.value[index].status = 'cancelled'
  }
  notify.toast.success('Réservation annulée')
}
</script>

