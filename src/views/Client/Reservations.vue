<template>
  <DefaultLayout>
    <div class="space-y-4">
      <div class="rusa-gradient-header">
        <h1 class="text-2xl font-bold text-white">
          Mes Réservations
        </h1>
        <p class="text-primary-100">
          Gérez vos réservations de trajets
        </p>
      </div>

      <p
        v-if="error"
        class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200"
      >
        {{ error }}
      </p>

      <div v-if="loading" class="rusa-card p-6 text-sm text-gray-600 dark:text-primary-300/85">
        Chargement des réservations...
      </div>

      <div v-else-if="rows.length" class="space-y-3">
        <div class="rusa-card p-3">
          <div class="flex flex-wrap items-center gap-2">
            <button
              type="button"
              class="rounded-lg px-3 py-1.5 text-sm font-medium"
              :class="filterMode === 'effectuees' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700'"
              @click="filterMode = 'effectuees'"
            >
              Réservations effectuées ({{ rowsEffectuees.length }})
            </button>
            <button
              type="button"
              class="rounded-lg px-3 py-1.5 text-sm font-medium"
              :class="filterMode === 'toutes' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700'"
              @click="filterMode = 'toutes'"
            >
              Toutes ({{ rows.length }})
            </button>
          </div>
        </div>

        <div v-if="displayRows.length" class="rusa-panel overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 text-sm dark:divide-primary-800/50">
            <thead class="bg-gray-50 dark:bg-primary-900/30">
              <tr>
                <th class="px-4 py-2 text-left">Référence</th>
                <th class="px-4 py-2 text-left">Trajet</th>
                <th class="px-4 py-2 text-left">Date voyage</th>
                <th class="px-4 py-2 text-right">Prix</th>
                <th class="px-4 py-2 text-left">Statut</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-primary-800/40">
              <tr v-for="r in displayRows" :key="r.idReservation">
                <td class="px-4 py-2 font-medium text-gray-900 dark:text-white">{{ r.reference }}</td>
                <td class="px-4 py-2 text-gray-700 dark:text-primary-200">{{ r.voyage }}</td>
                <td class="px-4 py-2 text-gray-700 dark:text-primary-200">{{ r.dateVoyage }}</td>
                <td class="px-4 py-2 text-right tabular-nums text-gray-900 dark:text-white">{{ r.prix }}</td>
                <td class="px-4 py-2 text-gray-700 dark:text-primary-200">{{ r.statut }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        </div>
        <div v-else class="rusa-card p-6 text-sm text-gray-600 dark:text-primary-300/85">
          Aucune réservation effectuée pour ce compte client.
        </div>
      </div>

      <div v-else class="rusa-card p-6 text-sm text-gray-600 dark:text-primary-300/85">
        Aucune réservation trouvée pour ce compte client.
      </div>
    </div>
  </DefaultLayout>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import DefaultLayout from '@/components/layout/DefaultLayout.vue'
import { useAuthStore } from '@/stores/auth'
import {
  listReservationsArray,
  listReservationsByClient,
  listReservationsByUserAndClient,
} from '@/services/reservationService'

const auth = useAuthStore()
const loading = ref(true)
const error = ref('')
const rows = ref([])
const filterMode = ref('effectuees')

function formatDate(v) {
  const d = new Date(v)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })
}

function formatMoney(v) {
  const n = Number(v)
  if (!Number.isFinite(n)) return '—'
  return `${n.toLocaleString('fr-CD', { maximumFractionDigits: 2 })} FC`
}

function mapRow(r) {
  return {
    idReservation: Number(r.idReservation ?? r.IdReservation) || Math.random(),
    reference: String(r.referenceReservation ?? r.ReferenceReservation ?? r.reference ?? r.Reference ?? '—'),
    voyage: String(r.villeDepart ?? r.VilleDepart ?? '—') + ' - ' + String(r.villeArrivee ?? r.VilleArrivee ?? '—'),
    dateVoyage: formatDate(r.dateVoyage ?? r.DateVoyage),
    prix: formatMoney(r.prixVoyage ?? r.PrixVoyage),
    statut: String(r.statutReservation ?? r.StatutReservation ?? '—'),
  }
}

function isStatutEffectue(statut) {
  const s = String(statut || '').toLowerCase()
  return (
    s.includes('confirm') ||
    s.includes('effectu') ||
    s.includes('termine') ||
    s.includes('pay')
  )
}

const rowsEffectuees = computed(() => rows.value.filter((r) => isStatutEffectue(r.statut)))
const displayRows = computed(() => (filterMode.value === 'effectuees' ? rowsEffectuees.value : rows.value))

async function load() {
  loading.value = true
  error.value = ''
  try {
    const user = auth.user || {}
    const idClient = Number(user.idClient ?? user.IdClient ?? auth.client?.idClient)
    const idUtilisateur = Number(user.idUtilisateur ?? user.IdUtilisateur)
    let list = []
    if (idClient > 0 && idUtilisateur > 0) {
      list = await listReservationsByUserAndClient(idUtilisateur, idClient)
    }
    if (!list.length && idClient > 0) {
      list = await listReservationsByClient(idClient)
    }
    if (!list.length) {
      const fallback = await listReservationsArray()
      list = idClient > 0 ? fallback.filter((x) => Number(x.idClient ?? x.IdClient) === idClient) : fallback
    }
    rows.value = list.map(mapRow)
  } catch (e) {
    error.value = e?.message || 'Impossible de charger les réservations.'
    rows.value = []
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

