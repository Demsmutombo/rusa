<template>
  <DefaultLayout>
    <div class="space-y-4">
      <div class="rusa-gradient-header">
        <h1 class="text-2xl font-bold text-white">
          Paiements
        </h1>
        <p class="text-primary-100">
          Consultez l'historique de vos paiements
        </p>
      </div>

      <p
        v-if="error"
        class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200"
      >
        {{ error }}
      </p>

      <div v-if="loading" class="rusa-card p-6 text-sm text-gray-600 dark:text-primary-300/85">
        Chargement des paiements...
      </div>

      <div v-else-if="rows.length" class="rusa-panel overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 text-sm dark:divide-primary-800/50">
            <thead class="bg-gray-50 dark:bg-primary-900/30">
              <tr>
                <th class="px-4 py-2 text-left">Référence</th>
                <th class="px-4 py-2 text-left">Date</th>
                <th class="px-4 py-2 text-left">Méthode</th>
                <th class="px-4 py-2 text-right">Montant</th>
                <th class="px-4 py-2 text-left">Statut</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-primary-800/40">
              <tr v-for="p in rows" :key="p.idPaiement">
                <td class="px-4 py-2 font-medium text-gray-900 dark:text-white">{{ p.reference }}</td>
                <td class="px-4 py-2 text-gray-700 dark:text-primary-200">{{ p.datePaiement }}</td>
                <td class="px-4 py-2 text-gray-700 dark:text-primary-200">{{ p.methode }}</td>
                <td class="px-4 py-2 text-right tabular-nums text-gray-900 dark:text-white">{{ p.montant }}</td>
                <td class="px-4 py-2 text-gray-700 dark:text-primary-200">{{ p.statut }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-else class="rusa-card p-6 text-sm text-gray-600 dark:text-primary-300/85">
        Aucun paiement trouvé pour ce compte client.
      </div>
    </div>
  </DefaultLayout>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import DefaultLayout from '@/components/layout/DefaultLayout.vue'
import { useAuthStore } from '@/stores/auth'
import { listPaiements, listPaiementsByClient } from '@/services/paiementService'
import {
  listReservationsByClient,
  listReservationsByUserAndClient,
} from '@/services/reservationService'
import { sessionHintsFromJwt } from '@/utils/jwtClaims'

const auth = useAuthStore()
const loading = ref(true)
const error = ref('')
const rows = ref([])

function resolveSessionIds() {
  const user = auth.user || {}
  const hints = auth.token ? sessionHintsFromJwt(auth.token) : null
  const idClient = Number(
    user.idClient ??
      user.IdClient ??
      user.client?.idClient ??
      user.client?.IdClient ??
      auth.client?.idClient ??
      auth.client?.IdClient ??
      hints?.idClient,
  )
  const idUtilisateur = Number(user.idUtilisateur ?? user.IdUtilisateur ?? user.id ?? hints?.idUtilisateur)
  return {
    idClient: Number.isFinite(idClient) && idClient > 0 ? idClient : 0,
    idUtilisateur: Number.isFinite(idUtilisateur) && idUtilisateur > 0 ? idUtilisateur : 0,
  }
}

function pickPaiementClientId(p) {
  const reservation = p?.reservation ?? p?.Reservation ?? {}
  const client = p?.client ?? p?.Client ?? {}
  return Number(
    p?.idClient ??
      p?.IdClient ??
      reservation?.idClient ??
      reservation?.IdClient ??
      client?.idClient ??
      client?.IdClient,
  )
}

function pickPaiementReservationId(p) {
  const reservation = p?.reservation ?? p?.Reservation ?? {}
  return Number(p?.idReservation ?? p?.IdReservation ?? reservation?.idReservation ?? reservation?.IdReservation)
}

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

async function load() {
  loading.value = true
  error.value = ''
  try {
    const { idClient, idUtilisateur } = resolveSessionIds()
    let list = []

    if (idClient > 0) {
      try {
        list = await listPaiementsByClient(idClient)
      } catch {
        list = []
      }
    }

    if (!list.length) {
      const all = await listPaiements()
      if (idClient > 0) {
        let reservationIds = []
        try {
          let reservations = []
          if (idUtilisateur > 0) {
            reservations = await listReservationsByUserAndClient(idUtilisateur, idClient)
          }
          if (!reservations.length) {
            reservations = await listReservationsByClient(idClient)
          }
          reservationIds = reservations
            .map((r) => Number(r.idReservation ?? r.IdReservation))
            .filter((n) => Number.isFinite(n) && n > 0)
        } catch {
          reservationIds = []
        }
        const reservationSet = new Set(reservationIds)
        list = all.filter((x) => {
          const pidClient = pickPaiementClientId(x)
          const pidReservation = pickPaiementReservationId(x)
          return (
            (Number.isFinite(pidClient) && pidClient === idClient) ||
            (Number.isFinite(pidReservation) && reservationSet.has(pidReservation))
          )
        })
      } else {
        list = all
      }
    }

    rows.value = list.map((p) => ({
      idPaiement: Number(p.idPaiement ?? p.IdPaiement) || Math.random(),
      reference: String(p.referencePaiement ?? p.ReferencePaiement ?? p.reference ?? p.Reference ?? '—'),
      datePaiement: formatDate(p.datePaiement ?? p.DatePaiement ?? p.dateCreation ?? p.DateCreation),
      methode: String(p.methodePaiement ?? p.MethodePaiement ?? '—'),
      montant: formatMoney(p.montantPaye ?? p.MontantPaye),
      statut:
        typeof (p.statut ?? p.Statut) === 'boolean'
          ? (p.statut ?? p.Statut)
            ? 'Effectué'
            : 'En attente'
          : String(p.statutPaiement ?? p.StatutPaiement ?? p.statut ?? p.Statut ?? '—'),
    }))
  } catch (e) {
    error.value = e?.message || 'Impossible de charger les paiements.'
    rows.value = []
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

