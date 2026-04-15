<template>
  <DefaultLayout>
    <div class="space-y-4">
      <!-- Header -->
      <div class="rusa-gradient-header">
        <h1 class="text-2xl font-bold text-white">
          Recherche de Trajets
        </h1>
        <p class="text-primary-100">
          Trouvez le trajet parfait pour votre voyage
        </p>
      </div>

      <!-- Search Form -->
      <div class="rusa-card p-6">
        <form class="space-y-4" @submit.prevent="searchTrips">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Ville de départ</label>
              <div class="relative">
                <input
                  v-model="searchForm.departure"
                  type="text"
                  placeholder="Ex"
                  class="w-full px-3 py-2 pl-10 border border-primary-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
                <svg class="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-1.414.0L8.343 15.243a1.998 1.998 0 01-1.414-1.414L2.343 8.929a1.998 1.998 0 011.414-1.414L7.586 3.414A1.998 1.998 0 019 2l4.657 4.657a1.998 1.998 0 002.829 0l4.656-4.657z" />
                </svg>
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Ville d'arrivée</label>
              <div class="relative">
                <input
                  v-model="searchForm.arrival"
                  type="text"
                  placeholder="Ex"
                  class="w-full px-3 py-2 pl-10 border border-primary-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
                <svg class="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-1.414.0L8.343 15.243a1.998 1.998 0 01-1.414-1.414L2.343 8.929a1.998 1.998 0 011.414-1.414L7.586 3.414A1.998 1.998 0 019 2l4.657 4.657a1.998 1.998 0 002.829 0l4.656-4.657z" />
                </svg>
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Date de voyage</label>
              <input
                v-model="searchForm.date"
                type="date"
                class="w-full px-3 py-2 border border-primary-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Nombre de passagers</label>
              <select
                v-model.number="searchForm.passengers"
                class="w-full px-3 py-2 border border-primary-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option :value="1">1 passager</option>
                <option :value="2">2 passagers</option>
                <option :value="3">3 passagers</option>
                <option :value="4">4 passagers</option>
                <option :value="5">5 passagers</option>
                <option :value="6">6 passagers</option>
                <option :value="7">7 passagers</option>
                <option :value="8">8 passagers</option>
              </select>
            </div>
          </div>
          
          <div class="flex items-center space-x-4">
            <button
              type="submit"
              :disabled="isSearching"
              class="rusa-btn-primary !px-6 !py-3 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <svg v-if="isSearching" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12h0v5.291z"></path>
              </svg>
              {{ isSearching ? 'Recherche en cours...' : 'Rechercher' }}
            </button>
            
            <button
              type="button"
              class="rusa-btn-ghost !px-6 !py-3"
              @click="resetSearch"
            >
              Réinitialiser
            </button>
          </div>
        </form>
      </div>

      <!-- Search Results -->
      <div v-if="searchResults.length > 0 || hasSearched" class="space-y-4">
        <div class="rusa-gradient-header !p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 class="text-xl font-semibold text-white">
            Résultats de recherche
            <span v-if="searchResults.length > 0" class="text-sm text-primary-100">
              ({{ searchResults.length }} trajet(s) trouvé(s))
            </span>
          </h2>
          <div class="flex items-center space-x-4">
            <select
              v-model="sortBy"
              class="px-3 py-2 border border-primary-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="price">Prix croissant</option>
              <option value="price-desc">Prix décroissant</option>
              <option value="time">Heure de départ</option>
              <option value="duration">Durée</option>
            </select>
          </div>
        </div>

        <div v-if="searchResults.length === 0 && hasSearched" class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">Aucun trajet trouvé</h3>
          <p class="mt-1 text-sm text-gray-500">
            Essayez de modifier vos critères de recherche
          </p>
        </div>

        <div v-else class="space-y-4">
          <div
            v-for="trip in sortedResults"
            :key="trip.id"
            class="rusa-panel"
          >
            <div class="p-6">
              <div class="flex items-center justify-between">
                <div class="flex-1">
                  <div class="flex items-center space-x-4 mb-4">
                    <div>
                      <p class="text-lg font-semibold text-gray-900">{{ trip.departure }}</p>
                      <p class="text-sm text-gray-500">{{ trip.departureTime }}</p>
                    </div>
                    <div class="flex-1 flex items-center justify-center">
                      <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4-4m4 4l-4 4m2-5a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p class="text-lg font-semibold text-gray-900">{{ trip.arrival }}</p>
                      <p class="text-sm text-gray-500">{{ trip.arrivalTime }}</p>
                    </div>
                  </div>
                  
                  <div class="flex items-center space-x-6 text-sm text-gray-600">
                    <div class="flex items-center">
                      <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {{ trip.duration }}
                    </div>
                    <div class="flex items-center">
                      <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      {{ trip.availablePlaces }} places
                    </div>
                  </div>
                </div>
                
                <div class="text-right">
                  <div class="mb-4">
                    <p class="text-2xl font-bold text-gray-900">€{{ trip.price }}</p>
                    <p class="text-sm text-gray-500">par passager</p>
                  </div>
                  <div class="space-y-2">
                    <div class="flex items-center text-sm text-gray-600">
                      <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      {{ trip.carrier }}
                    </div>
                    <div class="flex items-center text-sm text-gray-600">
                      <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0zM12.5 12a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
                      </svg>
                      {{ trip.vehicleType }}
                    </div>
                  </div>
                  <button
                    class="rusa-btn-accent w-full disabled:cursor-not-allowed disabled:opacity-50"
                    :disabled="trip.availablePlaces < searchForm.passengers"
                    @click="selectTrip(trip)"
                  >
                    {{ trip.availablePlaces < searchForm.passengers ? 'Places insuffisantes' : 'Réserver' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal
        v-model="showBookingModal"
        title="Confirmer votre réservation"
        size="md"
        backdrop-class="bg-primary-950/40 backdrop-blur-sm"
      >
            <div v-if="selectedTrip" class="space-y-4">
              <div class="rounded-xl border border-primary-100 bg-primary-50/50 p-4 dark:border-primary-800 dark:bg-primary-900/30">
                <h4 class="font-medium text-gray-900 mb-2">Détails du trajet</h4>
                <div class="space-y-2 text-sm">
                  <div class="flex justify-between">
                    <span class="text-gray-600">Trajet:</span>
                    <span class="font-medium">{{ selectedTrip.departure }} → {{ selectedTrip.arrival }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Date:</span>
                    <span class="font-medium">{{ selectedTrip.date }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Heure:</span>
                    <span class="font-medium">{{ selectedTrip.departureTime }} - {{ selectedTrip.arrivalTime }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Transporteur:</span>
                    <span class="font-medium">{{ selectedTrip.carrier }}</span>
                  </div>
                </div>
              </div>
              
              <div class="rounded-xl border border-primary-100 bg-primary-50 p-4 dark:border-primary-800">
                <h4 class="font-medium text-gray-900 mb-2">Informations de réservation</h4>
                <div class="space-y-2 text-sm">
                  <div class="flex justify-between">
                    <span class="text-gray-600">Passagers:</span>
                    <span class="font-medium">{{ searchForm.passengers }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Prix unitaire:</span>
                    <span class="font-medium">€{{ selectedTrip.price }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Total:</span>
                    <span class="font-bold text-lg">€{{ selectedTrip.price * searchForm.passengers }}</span>
                  </div>
                </div>
              </div>
            </div>
            <template #footer>
            <div class="flex justify-end gap-3">
              <button
                type="button"
                class="rusa-btn-ghost"
                @click="closeBookingModal"
              >
                Annuler
              </button>
              <button
                type="button"
                class="rusa-btn-accent"
                @click="confirmBooking"
              >
                Confirmer la réservation
              </button>
            </div>
            </template>
      </Modal>
    </div>
  </DefaultLayout>
</template>

<script setup>
import { ref, computed } from 'vue'
import DefaultLayout from '@/components/layout/DefaultLayout.vue'
import Modal from '@/components/ui/Modal.vue'
import { notify } from '@/utils/notify'

const searchForm = ref({
  departure: '',
  arrival: '',
  date: '',
  passengers: 1
})

const searchResults = ref([])
const isSearching = ref(false)
const hasSearched = ref(false)
const sortBy = ref('price')
const showBookingModal = ref(false)
const selectedTrip = ref(null)

const allTrips = [
  {
    id: 1,
    departure: 'Paris',
    arrival: 'Lyon',
    departureTime: '08:00',
    arrivalTime: '11:30',
    date: '2024-01-15',
    duration: '3h 30min',
    price: 45,
    carrier: 'Transport Rapide',
    vehicleType: 'Bus',
    availablePlaces: 40
  },
  {
    id: 2,
    departure: 'Paris',
    arrival: 'Lyon',
    departureTime: '10:30',
    arrivalTime: '14:00',
    date: '2024-01-15',
    duration: '3h 30min',
    price: 52,
    carrier: 'Voyage Confort',
    vehicleType: 'Minibus',
    availablePlaces: 12
  },
  {
    id: 3,
    departure: 'Paris',
    arrival: 'Lyon',
    departureTime: '14:00',
    arrivalTime: '17:30',
    date: '2024-01-15',
    duration: '3h 30min',
    price: 65,
    carrier: 'Speed Transport',
    vehicleType: 'Car',
    availablePlaces: 6
  },
  {
    id: 4,
    departure: 'Paris',
    arrival: 'Lyon',
    departureTime: '18:00',
    arrivalTime: '21:30',
    date: '2024-01-15',
    duration: '3h 30min',
    price: 38,
    carrier: 'Eco Travel',
    vehicleType: 'Van',
    availablePlaces: 15
  }
]

const sortedResults = computed(() => {
  const results = [...searchResults.value]
  
  switch (sortBy.value) {
    case 'price':
      return results.sort((a, b) => a.price - b.price)
    case 'price-desc':
      return results.sort((a, b) => b.price - a.price)
    case 'time':
      return results.sort((a, b) => a.departureTime.localeCompare(b.departureTime))
    case 'duration':
      return results.sort((a, b) => a.duration.localeCompare(b.duration))
    default:
      return results
  }
})

const searchTrips = async () => {
  if (!searchForm.value.departure || !searchForm.value.arrival || !searchForm.value.date) {
    return
  }
  
  isSearching.value = true
  
  // Simulate API call
  setTimeout(() => {
    searchResults.value = allTrips.filter(trip => 
      trip.departure.toLowerCase().includes(searchForm.value.departure.toLowerCase()) &&
      trip.arrival.toLowerCase().includes(searchForm.value.arrival.toLowerCase()) &&
      trip.date === searchForm.value.date &&
      trip.availablePlaces >= searchForm.value.passengers
    )
    isSearching.value = false
    hasSearched.value = true
  }, 1500)
}

const resetSearch = () => {
  searchForm.value = {
    departure: '',
    arrival: '',
    date: '',
    passengers: 1
  }
  searchResults.value = []
  hasSearched.value = false
}

const selectTrip = (trip) => {
  selectedTrip.value = trip
  showBookingModal.value = true
}

const closeBookingModal = () => {
  showBookingModal.value = false
  selectedTrip.value = null
}

const confirmBooking = () => {
  if (selectedTrip.value) {
    console.log('Réservation confirmée:', {
      trip: selectedTrip.value,
      passengers: searchForm.value.passengers,
      totalPrice: selectedTrip.value.price * searchForm.value.passengers
    })
    
    // Here you would typically make an API call to create the booking
    
    closeBookingModal()
    resetSearch()
    
    notify.toast.success('Réservation confirmée avec succès !')
  }
}
</script>

