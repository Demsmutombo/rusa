<template>
  <div class="client-dashboard min-w-0 w-full space-y-5 sm:space-y-6">
    <header
      class="rusa-gradient-header relative overflow-hidden rounded-2xl p-4 shadow-lg sm:p-6"
    >
      <div class="relative min-w-0">
        <p class="text-[10px] font-semibold uppercase tracking-widest text-primary-200/90 sm:text-xs">Espace client</p>
        <h1 class="mt-1 text-xl font-bold leading-tight text-white sm:text-2xl">Tableau de bord</h1>
        <p class="mt-2 max-w-2xl text-sm leading-relaxed text-primary-100/95">
          Statistiques, réservations, paiements, voyages et alertes issus de votre espace client.
        </p>
      </div>
    </header>

    <p
      v-if="error"
      class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200"
    >
      {{ error }}
    </p>

    <div v-if="loading" class="rusa-card p-8 text-center text-sm text-gray-500 dark:text-primary-400/80">
      Chargement du tableau de bord…
    </div>

    <template v-else-if="!error">
      <!-- Statistiques -->
      <section v-if="hasStats" aria-labelledby="client-dash-stats-title">
        <h2 id="client-dash-stats-title" class="mb-3 text-sm font-semibold text-gray-900 dark:text-white">
          Statistiques
        </h2>
        <div class="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <div
            v-for="card in statCards"
            :key="card.key"
            class="rusa-card p-4"
          >
            <p class="text-xs font-medium text-gray-500 dark:text-primary-400/85">{{ card.label }}</p>
            <p class="mt-1 text-lg font-bold tabular-nums text-gray-900 dark:text-white">{{ card.display }}</p>
          </div>
        </div>
      </section>

      <!-- Synthèse -->
      <section
        v-if="resume"
        class="rusa-card border border-primary-100/80 p-4 dark:border-primary-800/50 dark:bg-primary-950/50"
      >
        <h2 class="mb-3 text-sm font-semibold text-gray-900 dark:text-white">Synthèse</h2>
        <dl class="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
          <div v-if="resume.totalReservations != null">
            <dt class="text-xs text-gray-500 dark:text-primary-400/80">Total réservations</dt>
            <dd class="font-semibold text-gray-900 dark:text-white">{{ resume.totalReservations }}</dd>
          </div>
          <div v-if="resume.totalPaiements != null">
            <dt class="text-xs text-gray-500 dark:text-primary-400/80">Total paiements</dt>
            <dd class="font-semibold text-primary-700 dark:text-primary-300">{{ formatMoney(resume.totalPaiements) }}</dd>
          </div>
          <div v-if="resume.totalVoyages != null">
            <dt class="text-xs text-gray-500 dark:text-primary-400/80">Total voyages</dt>
            <dd class="font-semibold text-gray-900 dark:text-white">{{ resume.totalVoyages }}</dd>
          </div>
          <div v-if="resume.derniereReservation">
            <dt class="text-xs text-gray-500 dark:text-primary-400/80">Dernière réservation</dt>
            <dd class="font-medium text-gray-800 dark:text-primary-100">{{ formatDateTime(resume.derniereReservation) }}</dd>
          </div>
          <div v-if="resume.dernierPaiement">
            <dt class="text-xs text-gray-500 dark:text-primary-400/80">Dernier paiement</dt>
            <dd class="font-medium text-gray-800 dark:text-primary-100">{{ formatDateTime(resume.dernierPaiement) }}</dd>
          </div>
          <div v-if="resume.prochainVoyage">
            <dt class="text-xs text-gray-500 dark:text-primary-400/80">Prochain voyage</dt>
            <dd class="font-medium text-gray-800 dark:text-primary-100">{{ formatDateTime(resume.prochainVoyage) }}</dd>
          </div>
        </dl>
      </section>

      <!-- Alertes -->
      <section v-if="alertes.length" aria-labelledby="client-dash-alerts-title">
        <h2 id="client-dash-alerts-title" class="mb-3 text-sm font-semibold text-gray-900 dark:text-white">Alertes</h2>
        <ul class="space-y-2">
          <li
            v-for="(a, idx) in alertes"
            :key="a.idAlerte ?? a.IdAlerte ?? idx"
            class="rounded-xl border border-amber-200/80 bg-amber-50/90 px-4 py-3 text-sm dark:border-amber-900/40 dark:bg-amber-950/35"
          >
            <div class="flex flex-wrap items-baseline justify-between gap-2">
              <p class="font-semibold text-amber-900 dark:text-amber-200">{{ a.typeAlerte ?? a.TypeAlerte ?? 'Alerte' }}</p>
              <span
                v-if="a.niveauCriticite ?? a.NiveauCriticite"
                class="rounded-full bg-amber-200/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-950 dark:bg-amber-900/50 dark:text-amber-100"
              >
                {{ a.niveauCriticite ?? a.NiveauCriticite }}
              </span>
            </div>
            <p class="mt-1 text-gray-700 dark:text-primary-200/90">{{ a.description ?? a.Description ?? '—' }}</p>
            <p class="mt-1 text-xs text-gray-600 dark:text-primary-300/85">
              <span v-if="a.dateAlerte ?? a.DateAlerte">{{ formatDateTime(a.dateAlerte ?? a.DateAlerte) }}</span>
              <span v-if="a.referenceReservation ?? a.ReferenceReservation">
                · {{ a.referenceReservation ?? a.ReferenceReservation }}
              </span>
              <span v-if="(a.montantConcerne ?? a.MontantConcerne) != null">
                · {{ formatMoney(a.montantConcerne ?? a.MontantConcerne) }}
              </span>
            </p>
            <p v-if="a.actionSuggeree ?? a.ActionSuggeree" class="mt-1 text-xs text-amber-800/90 dark:text-amber-300/90">
              {{ a.actionSuggeree ?? a.ActionSuggeree }}
            </p>
          </li>
        </ul>
      </section>

      <div class="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <!-- Réservations récentes -->
        <section class="rusa-panel overflow-hidden" aria-labelledby="client-dash-resa-title">
          <div class="border-b border-gray-200 bg-gray-50 px-4 py-3 dark:border-primary-800/50 dark:bg-primary-900/40">
            <h2 id="client-dash-resa-title" class="text-sm font-semibold text-gray-900 dark:text-white">
              Réservations récentes
            </h2>
          </div>
          <ul v-if="reservationsRecentes.length" class="divide-y divide-gray-200 dark:divide-primary-800/50">
            <li
              v-for="(r, idx) in reservationsRecentes"
              :key="r.idReservation ?? r.IdReservation ?? idx"
              class="px-4 py-3 text-sm"
            >
              <p class="font-medium text-gray-900 dark:text-white">
                {{ r.referenceReservation ?? r.ReferenceReservation ?? `Réservation #${r.idReservation ?? r.IdReservation ?? ''}` }}
              </p>
              <p class="text-xs text-gray-500 dark:text-primary-400/85">
                {{ r.voyageInfo ?? r.VoyageInfo ?? '—' }}
                <span v-if="r.destination ?? r.Destination"> · {{ r.destination ?? r.Destination }}</span>
              </p>
              <div class="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-600 dark:text-primary-300/85">
                <span>Résa. {{ formatDateTime(r.dateReservation ?? r.DateReservation) }}</span>
                <span>Voyage {{ formatDateTime(r.dateVoyage ?? r.DateVoyage) }}</span>
              </div>
              <div class="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-600 dark:text-primary-300/85">
                <span v-if="r.prix != null || r.Prix != null">Prix {{ formatMoney(r.prix ?? r.Prix) }}</span>
                <span v-if="(r.montantPaye ?? r.MontantPaye) != null">Payé {{ formatMoney(r.montantPaye ?? r.MontantPaye) }}</span>
                <span>{{ r.statutReservation ?? r.StatutReservation ?? '' }}</span>
                <span>{{ r.statutPaiement ?? r.StatutPaiement ?? '' }}</span>
              </div>
            </li>
          </ul>
          <p v-else class="px-4 py-8 text-center text-sm text-gray-500 dark:text-primary-400/80">Aucune réservation récente.</p>
        </section>

        <!-- Paiements récents -->
        <section class="rusa-panel overflow-hidden" aria-labelledby="client-dash-pay-title">
          <div class="border-b border-gray-200 bg-gray-50 px-4 py-3 dark:border-primary-800/50 dark:bg-primary-900/40">
            <h2 id="client-dash-pay-title" class="text-sm font-semibold text-gray-900 dark:text-white">
              Paiements récents
            </h2>
          </div>
          <ul v-if="paiementsRecents.length" class="divide-y divide-gray-200 dark:divide-primary-800/50">
            <li
              v-for="(p, idx) in paiementsRecents"
              :key="p.idPaiement ?? p.IdPaiement ?? idx"
              class="px-4 py-3 text-sm"
            >
              <p class="font-medium text-gray-900 dark:text-white">
                {{ p.referencePaiement ?? p.ReferencePaiement ?? `Paiement #${p.idPaiement ?? p.IdPaiement ?? ''}` }}
              </p>
              <p class="text-xs text-gray-500 dark:text-primary-400/85">
                {{ formatDateTime(p.datePaiement ?? p.DatePaiement) }}
                · {{ p.methodePaiement ?? p.MethodePaiement ?? '—' }}
                <span v-if="p.referenceReservation ?? p.ReferenceReservation">
                  · {{ p.referenceReservation ?? p.ReferenceReservation }}
                </span>
              </p>
              <p class="mt-1 text-sm font-semibold text-primary-700 dark:text-primary-300">
                {{ formatMoney(p.montantPaye ?? p.MontantPaye) }}
                <span v-if="p.statut ?? p.Statut" class="ml-2 text-xs font-normal text-gray-600 dark:text-primary-400/90">
                  ({{ p.statut ?? p.Statut }})
                </span>
              </p>
            </li>
          </ul>
          <p v-else class="px-4 py-8 text-center text-sm text-gray-500 dark:text-primary-400/80">Aucun paiement récent.</p>
        </section>
      </div>

      <!-- Voyages -->
      <section class="rusa-panel overflow-hidden" aria-labelledby="client-dash-voyages-title">
        <div class="border-b border-gray-200 bg-gray-50 px-4 py-3 dark:border-primary-800/50 dark:bg-primary-900/40">
          <h2 id="client-dash-voyages-title" class="text-sm font-semibold text-gray-900 dark:text-white">Voyages</h2>
        </div>
        <ul v-if="voyagesClient.length" class="divide-y divide-gray-200 dark:divide-primary-800/50">
          <li
            v-for="(v, idx) in voyagesClient"
            :key="v.idVoyage ?? v.IdVoyage ?? idx"
            class="px-4 py-3 text-sm"
          >
            <p class="font-medium text-gray-900 dark:text-white">
              {{ v.destination ?? v.Destination ?? '—' }}
            </p>
            <p class="text-xs text-gray-500 dark:text-primary-400/85">
              <template v-if="v.referenceVoyage ?? v.ReferenceVoyage">
                <span class="font-medium text-gray-600 dark:text-primary-300/90">{{ v.referenceVoyage ?? v.ReferenceVoyage }}</span>
                <span> · </span>
              </template>
              {{ formatDateTime(v.dateDepart ?? v.DateDepart) }}
              <span v-if="v.busInfo ?? v.BusInfo"> · {{ v.busInfo ?? v.BusInfo }}</span>
            </p>
            <div class="mt-1 flex flex-wrap gap-x-3 text-xs text-gray-600 dark:text-primary-300/85">
              <span v-if="v.prix != null || v.Prix != null">{{ formatMoney(v.prix ?? v.Prix) }}</span>
              <span>{{ v.statutVoyage ?? v.StatutVoyage ?? '' }}</span>
            </div>
          </li>
        </ul>
        <p v-else class="px-4 py-8 text-center text-sm text-gray-500 dark:text-primary-400/80">Aucun voyage à afficher.</p>
      </section>

      <p
        v-if="dateGeneration"
        class="text-center text-[10px] text-gray-400 dark:text-primary-500/80"
      >
        Données actualisées : {{ formatDateTime(dateGeneration) }}
      </p>
    </template>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import {
  getClientDashboard,
  unwrapClientDashboardPayload,
  unwrapList,
} from '@/services/clientDashboardService'

const payload = ref(/** @type {Record<string, unknown> | null} */ (null))
const loading = ref(true)
const error = ref('')

const p = computed(() => payload.value || {})

function pick(obj, camel, pascal) {
  return obj?.[camel] ?? obj?.[pascal]
}

const stats = computed(() => pick(p.value, 'clientStatistiques', 'ClientStatistiques') || {})

const hasStats = computed(() => Object.keys(stats.value).length > 0)

const statCards = computed(() => {
  const s = stats.value
  const n = (v) => (v != null && v !== '' ? Number(v) : null)
  const cards = [
    { key: 'totalResa', label: 'Réservations (total)', value: n(s.nombreTotalReservations ?? s.NombreTotalReservations) },
    { key: 'actives', label: 'Réservations actives', value: n(s.nombreReservationsActives ?? s.NombreReservationsActives) },
    { key: 'payees', label: 'Réservations payées', value: n(s.nombreReservationsPayees ?? s.NombreReservationsPayees) },
    {
      key: 'montantPaye',
      label: 'Montant total paiements',
      value: n(s.montantTotalPaiements ?? s.MontantTotalPaiements),
      money: true,
    },
    {
      key: 'nonPaye',
      label: 'Montant non payé',
      value: n(s.montantReservationsNonPayees ?? s.MontantReservationsNonPayees),
      money: true,
    },
    { key: 'taux', label: 'Taux de paiement', value: n(s.tauxPaiement ?? s.TauxPaiement), suffix: '%' },
    { key: 'voyages', label: 'Nombre de voyages', value: n(s.nombreVoyages ?? s.NombreVoyages) },
    {
      key: 'moyenne',
      label: 'Montant moyen / réservation',
      value: n(s.montantMoyenParReservation ?? s.MontantMoyenParReservation),
      money: true,
    },
  ]
  return cards
    .filter((c) => c.value != null && !Number.isNaN(c.value))
    .map((c) => ({
      ...c,
      display:
        c.money != null && c.money
          ? formatMoney(c.value)
          : `${c.value.toLocaleString('fr-CD', { maximumFractionDigits: c.suffix ? 1 : 0 })}${c.suffix || ''}`,
    }))
})

const resume = computed(() => pick(p.value, 'resumeClient', 'ResumeClient'))

const reservationsRecentes = computed(() =>
  unwrapList(pick(p.value, 'reservationsRecentes', 'ReservationsRecentes')),
)

const paiementsRecents = computed(() =>
  unwrapList(pick(p.value, 'paiementsRecents', 'PaiementsRecents')),
)

const voyagesClient = computed(() => unwrapList(pick(p.value, 'voyagesClient', 'VoyagesClient')))

const alertes = computed(() => unwrapList(pick(p.value, 'alertesClient', 'AlertesClient')))

const dateGeneration = computed(() => p.value.dateGeneration ?? p.value.DateGeneration ?? '')

function formatMoney(value) {
  const v = Number(value) || 0
  return `${v.toLocaleString('fr-CD', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} FC`
}

function formatDateTime(value) {
  if (value == null || value === '') return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return String(value).slice(0, 16)
  return d.toLocaleString('fr-FR', {
    dateStyle: 'short',
    timeStyle: 'short',
  })
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    const raw = await getClientDashboard()
    payload.value = unwrapClientDashboardPayload(raw)
  } catch (e) {
    let msg = e?.message || 'Impossible de charger le tableau de bord client.'
    if (e?.status === 500) {
      msg +=
        ' Le serveur a renvoyé une erreur interne sur ClientDashboard : corrigez l’API ou utilisez les sous-routes si seul l’agrégat échoue.'
    }
    error.value = msg
    payload.value = null
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  load()
})
</script>
