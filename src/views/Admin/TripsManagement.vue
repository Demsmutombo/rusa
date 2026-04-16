<template>
  <DefaultLayout>
    <div class="space-y-4">
      <!-- Header -->
      <div class="rusa-gradient-header flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-2xl font-bold text-white">
            Gestion des Trajets
          </h1>
          <p class="text-primary-100">
            {{ headerIntro }}
          </p>
        </div>
        <div class="flex items-center gap-3">
          <button
            @click="showAddTripModal = true"
            class="rusa-btn-primary bg-white text-primary-800 hover:bg-primary-50"
          >
            Ajouter un trajet
          </button>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div class="rusa-card p-6">
          <div class="flex items-center">
            <div class="p-3 bg-blue-100 rounded-lg">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Total Trajets</p>
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
              <p class="text-sm font-medium text-gray-600">Actifs</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.active }}</p>
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
              <p class="text-sm font-medium text-gray-600">Aujourd'hui</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.today }}</p>
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
              placeholder="Départ, arrivée, transporteur..."
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
              <option value="active">Actifs</option>
              <option value="completed">Terminés</option>
              <option value="cancelled">Annulés</option>
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

      <!-- Trips Table -->
      <div class="rusa-panel">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-primary-50/80 dark:bg-primary-950/50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trajet
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transporteur
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Heure
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Places
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prix
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
              <tr v-for="trip in filteredTrips" :key="trip.id">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div>
                    <p class="text-sm font-medium text-gray-900">
                      {{ trip.departure }} → {{ trip.arrival }}
                    </p>
                    <p class="text-sm text-gray-500">Distance: {{ trip.distance }}km</p>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                      <span class="text-xs font-medium">{{ trip.carrier.charAt(0) }}</span>
                    </div>
                    <div class="ml-3">
                      <p class="text-sm font-medium text-gray-900">{{ trip.carrier }}</p>
                      <p class="text-sm text-gray-500">{{ trip.vehicle }}</p>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div>
                    <p class="text-sm text-gray-900">{{ trip.date }}</p>
                    <p class="text-sm text-gray-500">{{ trip.time }}</p>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm">
                    <p class="text-gray-900">{{ trip.booked }}/{{ trip.totalPlaces }}</p>
                    <div class="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div
                        class="bg-primary-500 h-2 rounded-full"
                        :style="{ width: (trip.booked / trip.totalPlaces * 100) + '%' }"
                      ></div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <p class="text-sm font-medium text-gray-900">€{{ trip.price }}</p>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-2 py-1 text-xs font-medium rounded-full"
                        :class="getStatusBadgeClass(trip.status)">
                    {{ trip.status }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    @click="viewTripDetails(trip)"
                    class="text-primary-600 hover:text-primary-800 mr-3"
                  >
                    Détails
                  </button>
                  <button
                    v-if="trip.status === 'active'"
                    @click="editTrip(trip)"
                    class="text-yellow-600 hover:text-yellow-900 mr-3"
                  >
                    Modifier
                  </button>
                  <button
                    v-if="trip.status === 'active'"
                    @click="cancelTrip(trip)"
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
import { useAdminModuleGreeting } from '@/composables/useAdminModuleGreeting'

const headerIntro = useAdminModuleGreeting('bienvenue — trajets ci-dessous.')

const trips = ref([
  {
    id: 1,
    departure: 'Paris',
    arrival: 'Lyon',
    carrier: 'Transport Rapide',
    vehicle: 'Bus 50 places',
    date: '2024-01-15',
    time: '08:00',
    totalPlaces: 50,
    booked: 30,
    price: 45,
    distance: 450,
    status: 'active'
  },
  {
    id: 2,
    departure: 'Lyon',
    arrival: 'Marseille',
    carrier: 'Voyage Express',
    vehicle: 'Minibus 20 places',
    date: '2024-01-15',
    time: '14:30',
    totalPlaces: 20,
    booked: 12,
    price: 55,
    distance: 320,
    status: 'active'
  },
  {
    id: 3,
    departure: 'Paris',
    arrival: 'Bordeaux',
    carrier: 'Speed Transport',
    vehicle: 'Car 8 places',
    date: '2024-01-14',
    time: '10:00',
    totalPlaces: 8,
    booked: 6,
    price: 120,
    distance: 580,
    status: 'completed'
  },
  {
    id: 4,
    departure: 'Marseille',
    arrival: 'Nice',
    carrier: 'City Link',
    vehicle: 'Van 12 places',
    date: '2024-01-13',
    time: '09:15',
    totalPlaces: 12,
    booked: 0,
    price: 35,
    distance: 200,
    status: 'cancelled'
  },
  {
    id: 5,
    departure: 'Lille',
    arrival: 'Bruxelles',
    carrier: 'Rapid Move',
    vehicle: 'Bus 40 places',
    date: '2024-01-16',
    time: '07:30',
    totalPlaces: 40,
    booked: 22,
    price: 28,
    distance: 100,
    status: 'active'
  }
])

const searchQuery = ref('')
const statusFilter = ref('')
const dateFilter = ref('')
const showAddTripModal = ref(false)

const stats = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  return {
    total: trips.value.length,
    active: trips.value.filter(t => t.status === 'active').length,
    today: trips.value.filter(t => t.date === today).length,
    revenue: trips.value
      .filter(t => t.status === 'completed')
      .reduce((sum, t) => sum + t.booked * t.price, 0)
  }
})

const filteredTrips = computed(() => {
  return trips.value.filter(trip => {
    const matchesSearch = trip.departure.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                         trip.arrival.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                         trip.carrier.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesStatus = !statusFilter.value || trip.status === statusFilter.value
    const matchesDate = !dateFilter.value || trip.date === dateFilter.value
    return matchesSearch && matchesStatus && matchesDate
  })
})

const getStatusBadgeClass = (status) => {
  const classes = {
    active: 'bg-green-100 text-green-800',
    completed: 'bg-blue-100 text-blue-800',
    cancelled: 'bg-red-100 text-red-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

const resetFilters = () => {
  searchQuery.value = ''
  statusFilter.value = ''
  dateFilter.value = ''
}

const viewTripDetails = (trip) => {
  console.log('Voir détails du trajet:', trip)
}

const editTrip = (trip) => {
  console.log('Modifier le trajet:', trip)
}

const cancelTrip = async (trip) => {
  const ok = await notify.confirm(
    `Êtes-vous sûr de vouloir annuler le trajet ${trip.departure} → ${trip.arrival} ?`,
    'Annuler le trajet'
  )
  if (!ok) return
  const index = trips.value.findIndex(t => t.id === trip.id)
  if (index !== -1) {
    trips.value[index].status = 'cancelled'
  }
  notify.toast.success('Trajet annulé')
}
</script>

