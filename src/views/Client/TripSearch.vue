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

      <div
        v-if="generatedBillet"
        class="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm dark:border-emerald-800/60 dark:bg-emerald-950/30"
      >
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p class="font-semibold text-emerald-900 dark:text-emerald-200">Billet généré avec succès</p>
            <p class="mt-1 text-emerald-800/90 dark:text-emerald-300/90">
              Réservation #{{ generatedBillet.idReservation || '—' }}
              <span v-if="generatedBillet.transactionId"> · Transaction {{ generatedBillet.transactionId }}</span>
            </p>
            <p v-if="generatedBillet.qrCode" class="mt-1 text-xs text-emerald-700 dark:text-emerald-300/80">
              QR: {{ generatedBillet.qrCode }}
            </p>
          </div>
          <div class="flex gap-2">
            <button
              v-if="generatedBillet.urlBillet"
              type="button"
              class="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700"
              @click="openGeneratedBillet"
            >
              Ouvrir le billet
            </button>
            <button
              type="button"
              class="rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-emerald-800 ring-1 ring-emerald-300 hover:bg-emerald-100 dark:bg-emerald-900/40 dark:text-emerald-200 dark:ring-emerald-700"
              @click="generatedBillet = null"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>

      <!-- Search Form -->
      <div class="rusa-card p-6">
        <form class="space-y-4" @submit.prevent="searchTrips">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Ville de départ</label>
              <select
                v-model="searchForm.departure"
                class="w-full rounded-xl border border-primary-100 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-primary-950 dark:text-primary-100"
              >
                <option value="">Toutes les villes</option>
                <option v-for="v in departureOptions" :key="`dep-${v}`" :value="v">{{ v }}</option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Ville d'arrivée</label>
              <select
                v-model="searchForm.arrival"
                class="w-full rounded-xl border border-primary-100 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-primary-950 dark:text-primary-100"
              >
                <option value="">Toutes les villes</option>
                <option v-for="v in arrivalOptionsFiltered" :key="`arr-${v}`" :value="v">{{ v }}</option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Date de voyage</label>
              <input
                v-model="searchForm.date"
                type="date"
                class="w-full rounded-xl border border-primary-100 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-primary-950 dark:text-primary-100"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Nombre de passagers</label>
              <select
                v-model.number="searchForm.passengers"
                class="w-full rounded-xl border border-primary-100 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-primary-950 dark:text-primary-100"
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
            <button
              type="button"
              class="rusa-btn-ghost !px-6 !py-3 disabled:cursor-not-allowed disabled:opacity-50"
              :disabled="isSearching"
              @click="showAllTrips"
            >
              {{ isSearching ? 'Chargement...' : 'Voir tous les trajets' }}
            </button>
          </div>
        </form>
        <p class="mt-2 text-xs text-gray-500 dark:text-primary-300/80">
          Astuce: vous pouvez rechercher seulement par départ/arrivée sans choisir de date.
        </p>
      </div>

      <!-- Search Results -->
      <div v-if="searchResults.length > 0 || hasSearched || allTrips.length" class="space-y-4">
        <div class="rusa-gradient-header !p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 class="text-xl font-semibold text-white">
            {{ hasSearched ? 'Résultats de recherche' : 'Trajets disponibles' }}
            <span v-if="displayTrips.length > 0" class="text-sm text-primary-100">
              ({{ displayTrips.length }} trajet(s) trouvé(s))
            </span>
          </h2>
          <div class="flex items-center space-x-4">
            <select
              v-model="sortBy"
              class="rounded-xl border border-white/50 bg-white/95 px-3 py-2 text-sm font-medium text-primary-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-white"
            >
              <option value="price">Prix croissant</option>
              <option value="price-desc">Prix décroissant</option>
              <option value="time">Heure de départ</option>
              <option value="duration">Durée</option>
            </select>
          </div>
        </div>

        <div v-if="displayTrips.length === 0 && hasSearched" class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">Aucun trajet trouvé</h3>
          <p class="mt-1 text-sm text-gray-500">
            Essayez de modifier vos critères de recherche
          </p>
        </div>

        <div v-else class="rusa-panel overflow-hidden">
          <ul class="divide-y divide-gray-200 dark:divide-primary-800/50">
            <li
              v-for="trip in sortedResults"
              :key="trip.id"
              class="px-4 py-3"
            >
              <details class="group">
                <summary class="flex cursor-pointer list-none items-center justify-between gap-3">
                  <div>
                    <p class="text-sm font-semibold text-gray-900 dark:text-white">
                      {{ trip.departure }} → {{ trip.arrival }}
                    </p>
                    <p class="text-xs text-gray-500 dark:text-primary-300/80">
                      {{ trip.date }} · {{ trip.departureTime }} · {{ formatMoney(trip.price) }}
                    </p>
                  </div>
                  <span class="text-xs font-medium text-gray-600 dark:text-primary-300/85">
                    {{ trip.availablePlaces }} place(s)
                  </span>
                </summary>

                <div class="mt-3 rounded-xl border border-primary-100 bg-primary-50/40 p-3 dark:border-primary-800/50 dark:bg-primary-900/20">
                  <div class="grid grid-cols-1 gap-2 text-xs text-gray-700 dark:text-primary-200 sm:grid-cols-2">
                    <p><strong>Transporteur:</strong> {{ trip.carrier }}</p>
                    <p><strong>Type:</strong> {{ trip.vehicleType }}</p>
                    <p><strong>Départ:</strong> {{ trip.departure }}</p>
                    <p><strong>Arrivée:</strong> {{ trip.arrival }}</p>
                  </div>
                  <div class="mt-3 flex justify-end">
                    <button
                      class="rusa-btn-accent disabled:cursor-not-allowed disabled:opacity-50"
                      :disabled="trip.availablePlaces < searchForm.passengers"
                      @click="selectTrip(trip)"
                    >
                      {{ trip.availablePlaces < searchForm.passengers ? 'Places insuffisantes' : 'Réserver' }}
                    </button>
                  </div>
                </div>
              </details>
            </li>
          </ul>
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
                    <span class="font-medium">{{ formatMoney(selectedTrip.price) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Total:</span>
                    <span class="font-bold text-lg">{{ formatMoney(selectedTrip.price * searchForm.passengers) }}</span>
                  </div>
                </div>
              </div>

              <div class="rounded-xl border border-primary-100 bg-white p-4 dark:border-primary-800 dark:bg-primary-950/20">
                <h4 class="font-medium text-gray-900 mb-2 dark:text-white">Paiement</h4>
                <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label class="mb-1 block text-xs font-medium text-gray-600 dark:text-primary-300/85">
                      Méthode de paiement
                    </label>
                    <select
                      v-model="bookingForm.methodePaiement"
                      class="w-full rounded-xl border border-primary-100 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-primary-950 dark:text-primary-100"
                    >
                      <option value="Mobile Money">Mobile Money</option>
                      <option value="Cash">Cash</option>
                      <option value="Virement">Virement</option>
                      <option value="Carte bancaire">Carte bancaire</option>
                    </select>
                  </div>
                  <div>
                    <label class="mb-1 block text-xs font-medium text-gray-600 dark:text-primary-300/85">
                      Référence transaction
                    </label>
                    <input
                      v-model="bookingForm.referenceTransaction"
                      type="text"
                      placeholder="Ex: TRX-2026-0001"
                      class="w-full rounded-xl border border-primary-100 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-primary-950 dark:text-primary-100"
                    />
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
                class="rusa-btn-accent disabled:cursor-not-allowed disabled:opacity-50"
                :disabled="isSubmittingBooking"
                @click="confirmBooking"
              >
                {{ isSubmittingBooking ? 'Paiement en cours...' : 'Confirmer et payer' }}
              </button>
            </div>
            </template>
      </Modal>
    </div>
  </DefaultLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import DefaultLayout from '@/components/layout/DefaultLayout.vue'
import Modal from '@/components/ui/Modal.vue'
import { notify } from '@/utils/notify'
import { listVoyagesArray, ticksToHHmm } from '@/services/voyageService'
import {
  createReservationWithPaiement,
  unwrapReservationWithPaiementResponse,
} from '@/services/reservationService'
import { useAuthStore } from '@/stores/auth'

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
const allTrips = ref([])
const isSubmittingBooking = ref(false)
const auth = useAuthStore()
const bookingForm = ref({
  methodePaiement: 'Mobile Money',
  referenceTransaction: '',
})
const generatedBillet = ref(null)

const departureOptions = computed(() => [...new Set(allTrips.value.map((t) => t.departure).filter(Boolean))].sort())
const arrivalOptions = computed(() => [...new Set(allTrips.value.map((t) => t.arrival).filter(Boolean))].sort())
const arrivalOptionsFiltered = computed(() => {
  if (!searchForm.value.departure) return arrivalOptions.value
  const dep = searchForm.value.departure
  return [...new Set(allTrips.value.filter((t) => t.departure === dep).map((t) => t.arrival).filter(Boolean))].sort()
})
const displayTrips = computed(() => (hasSearched.value ? searchResults.value : allTrips.value))

const sortedResults = computed(() => {
  const results = [...displayTrips.value]
  
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
  isSearching.value = true
  try {
    const dep = searchForm.value.departure.trim().toLowerCase()
    const arr = searchForm.value.arrival.trim().toLowerCase()
    const date = searchForm.value.date ? String(searchForm.value.date) : ''
    searchResults.value = allTrips.value.filter((trip) =>
      (!dep || trip.departure.toLowerCase().includes(dep)) &&
      (!arr || trip.arrival.toLowerCase().includes(arr)) &&
      (!date || String(trip.date) === date) &&
      trip.availablePlaces >= searchForm.value.passengers,
    )
    hasSearched.value = true
  } finally {
    isSearching.value = false
  }
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

const showAllTrips = async () => {
  isSearching.value = true
  await bootstrapTrips()
  searchForm.value = {
    departure: '',
    arrival: '',
    date: '',
    passengers: 1
  }
  hasSearched.value = false
  searchResults.value = []
  isSearching.value = false
  notify.toast.success('Liste complète des trajets affichée.')
}

const selectTrip = (trip) => {
  selectedTrip.value = trip
  bookingForm.value.methodePaiement = 'Mobile Money'
  bookingForm.value.referenceTransaction = ''
  showBookingModal.value = true
}

const closeBookingModal = () => {
  showBookingModal.value = false
  selectedTrip.value = null
}

const confirmBooking = async () => {
  if (!selectedTrip.value) return

  const user = auth.user || {}
  const idClient = Number(user.idClient ?? user.IdClient ?? auth.client?.idClient)
  const idUtilisateur = Number(user.idUtilisateur ?? user.IdUtilisateur ?? user.id)
  const idSociete = Number(user.idSociete ?? user.IdSociete ?? auth.societeId)
  const idVoyage = Number(
    selectedTrip.value._raw?.id ??
      selectedTrip.value._raw?.Id ??
      selectedTrip.value._raw?.idVoyage ??
      selectedTrip.value._raw?.IdVoyage,
  )
  const nombreDePlace = Number(searchForm.value.passengers) || 1
  const montant = Number(selectedTrip.value.price) * nombreDePlace

  if (!Number.isFinite(idClient) || idClient <= 0) {
    notify.toast.error('idClient manquant. Reconnectez-vous puis reessayez.')
    return
  }
  if (!Number.isFinite(idUtilisateur) || idUtilisateur <= 0) {
    notify.toast.error('idUtilisateur manquant. Reconnectez-vous puis reessayez.')
    return
  }
  if (!Number.isFinite(idSociete) || idSociete <= 0) {
    notify.toast.error('idSociete manquant. Reconnectez-vous puis reessayez.')
    return
  }
  if (!Number.isFinite(idVoyage) || idVoyage <= 0) {
    notify.toast.error('Le voyage selectionne est invalide.')
    return
  }
  if (!bookingForm.value.methodePaiement) {
    notify.toast.error('Selectionnez la methode de paiement.')
    return
  }

  isSubmittingBooking.value = true
  try {
    const payload = {
      reservation: {
        idVoyage,
        idClient,
        nombreDePlace,
        idUtilisateur,
        idSociete,
      },
      paiement: {
        montantAPaye: montant,
        montantPaye: montant,
        methodePaiement: bookingForm.value.methodePaiement,
        referenceTransaction: bookingForm.value.referenceTransaction || `TRX-${Date.now()}`,
        idUtilisateur,
        idSociete,
      },
    }

    const raw = await createReservationWithPaiement(payload)
    const response = unwrapReservationWithPaiementResponse(raw)
    const billet = response?.billet && typeof response.billet === 'object' ? response.billet : null
    generatedBillet.value = billet
      ? {
          idReservation: Number(
            billet.idReservation ??
              billet.IdReservation ??
              response?.reservation?.idReservation ??
              response?.reservation?.IdReservation,
          ) || 0,
          qrCode: String(billet.qrCode ?? billet.QrCode ?? ''),
          urlBillet: String(billet.urlBillet ?? billet.UrlBillet ?? ''),
          transactionId: String(response?.transactionId ?? ''),
        }
      : null
    closeBookingModal()
    resetSearch()
    await bootstrapTrips()
    notify.toast.success(
      response?.message ||
        (generatedBillet.value
          ? 'Reservation, paiement et billet générés avec succès.'
          : 'Reservation + paiement effectues avec succes.'),
    )
  } catch (e) {
    notify.toast.error(e?.message || 'Echec de la reservation avec paiement.')
  } finally {
    isSubmittingBooking.value = false
  }
}

function openGeneratedBillet() {
  const url = String(generatedBillet.value?.urlBillet || '').trim()
  if (!url) {
    notify.toast.error('Lien du billet indisponible.')
    return
  }
  window.open(url, '_blank', 'noopener,noreferrer')
}

function mapVoyageToTrip(v) {
  const date = String(v.dateDepart ?? v.DateDepart ?? '').slice(0, 10)
  const dep = String(v.villeDepart ?? v.VilleDepart ?? '—')
  const arr = String(v.villeArrivee ?? v.VilleArrivee ?? '—')
  const totalPlaces = Number(v.nombrePlacesTotal ?? v.NombrePlacesTotal ?? 0)
  const reserved = Number(v.nombrePlacesReservees ?? v.NombrePlacesReservees ?? 0)
  const explicitAvailable = Number(v.nombrePlacesDisponibles ?? v.NombrePlacesDisponibles)
  let availablePlaces = Number.isFinite(explicitAvailable)
    ? explicitAvailable
    : Number.isFinite(totalPlaces - reserved) && totalPlaces > 0
      ? totalPlaces - reserved
      : 30
  availablePlaces = Math.max(0, Math.floor(availablePlaces))
  return {
    id: Number(v.id ?? v.Id ?? v.idVoyage ?? v.IdVoyage) || Math.random(),
    departure: dep,
    arrival: arr,
    departureTime: ticksToHHmm(v.heureDepart ?? v.HeureDepart) || '—',
    arrivalTime: '—',
    date,
    duration: '—',
    price: Number(v.prix ?? v.Prix ?? 0),
    carrier: String(v.nomSociete ?? v.NomSociete ?? 'RusaTravel'),
    vehicleType: String(v.libelleTypeBus ?? v.LibelleTypeBus ?? v.typeBus ?? v.TypeBus ?? 'Bus'),
    availablePlaces,
    _raw: v,
  }
}

async function bootstrapTrips() {
  try {
    const voyages = await listVoyagesArray()
    allTrips.value = voyages
      .filter((v) => v.statut !== false && v.Statut !== false)
      .map(mapVoyageToTrip)
  } catch (e) {
    notify.toast.error(e?.message || 'Impossible de charger les trajets.')
  }
}

onMounted(bootstrapTrips)

function formatMoney(value) {
  const v = Number(value)
  if (!Number.isFinite(v)) return '—'
  return `${v.toLocaleString('fr-CD', { maximumFractionDigits: 2 })} FC`
}
</script>

