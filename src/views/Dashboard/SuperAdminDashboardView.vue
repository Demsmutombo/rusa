<template>
  <div class="super-admin-dash min-w-0 w-full space-y-4 sm:space-y-6">
    <!-- En-tête -->
    <div
      class="rusa-gradient-header relative overflow-hidden rounded-2xl p-4 shadow-lg sm:p-6"
    >
      <div
        class="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 sm:h-40 sm:w-40"
        aria-hidden="true"
      />
      <div
        class="pointer-events-none absolute -bottom-6 left-1/3 h-24 w-24 rounded-full bg-black/10"
        aria-hidden="true"
      />
      <div class="relative flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div class="min-w-0">
          <p class="text-[10px] font-semibold uppercase tracking-widest text-primary-200/90 sm:text-xs">
            Super-Admin
          </p>
          <h1 class="mt-1 text-xl font-bold leading-tight text-white sm:text-2xl">
            Tableau de bord
          </h1>
          <p class="mt-1 max-w-xl text-sm text-primary-100/95">
            {{ superAdminIntro }}
          </p>
        </div>
        <p
          v-if="generatedAt"
          class="shrink-0 rounded-lg bg-white/10 px-3 py-1.5 text-[11px] text-primary-100 backdrop-blur-sm sm:text-xs"
        >
          Mis à jour · {{ generatedAt }}
        </p>
      </div>
    </div>

    <p
      v-if="dashboardLoadError"
      class="rounded-xl border border-amber-200 bg-amber-50 px-3 py-3 text-sm text-amber-900 sm:px-4 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200"
    >
      {{ dashboardLoadError }}
    </p>
    <p
      v-if="societesLoadError"
      class="rounded-xl border border-red-200 bg-red-50 px-3 py-3 text-sm text-red-700 sm:px-4 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300"
    >
      {{ societesLoadError }}
    </p>

    <template v-if="loading">
      <div
        class="rusa-card-static flex flex-col items-center justify-center gap-3 p-10 sm:p-12 dark:border-primary-800"
      >
        <span
          class="h-8 w-8 animate-spin rounded-full border-2 border-primary-200 border-t-primary-600 dark:border-primary-800 dark:border-t-primary-400"
          aria-hidden="true"
        />
        <p class="text-sm text-gray-500 dark:text-gray-400">Chargement du tableau de bord…</p>
      </div>
    </template>

    <template v-else-if="initialLoadDone">
      <!-- KPI -->
      <section
        v-if="dashboard"
        aria-label="Indicateurs globaux"
      >
        <h2 class="mb-3 flex items-center gap-2 text-sm font-semibold text-primary-900 dark:text-white">
          <span
            class="h-1.5 w-1.5 rounded-full bg-primary-500"
            aria-hidden="true"
          />
          {{
            SUPER_ADMIN_DASH_FLAGS.kpiFinanceAndClients
              ? 'Indicateurs globaux'
              : 'Sociétés — aperçu'
          }}
        </h2>
        <div
          class="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"
        >
          <div
            v-for="(card, index) in kpiCardsVisible"
            :key="card.key"
            class="group relative min-w-0 overflow-hidden rounded-xl border border-primary-100/80 bg-white p-3 shadow-sm transition-shadow hover:shadow-md sm:rounded-2xl sm:p-4 dark:border-primary-800/80 dark:bg-gray-900/50"
            :class="kpiAccentBorder(index)"
          >
            <div
              class="pointer-events-none absolute inset-y-0 left-0 w-1 bg-gradient-to-b opacity-90"
              :class="kpiAccentBar(index)"
              aria-hidden="true"
            />
            <p
              class="pl-2 text-[10px] font-semibold uppercase leading-tight tracking-wide text-gray-500 sm:text-xs dark:text-gray-400"
            >
              {{ card.label }}
            </p>
            <p
              class="mt-1.5 break-words pl-2 text-base font-bold tabular-nums text-primary-950 sm:text-lg dark:text-white"
            >
              {{ card.format(stats[card.key]) }}
            </p>
          </div>
        </div>
      </section>

      <!-- Graphiques -->
      <section
        v-if="dashboard && SUPER_ADMIN_DASH_FLAGS.trends"
        aria-label="Tendances"
      >
        <h2 class="mb-3 flex items-center gap-2 text-sm font-semibold text-primary-900 dark:text-white">
          <span
            class="h-1.5 w-1.5 rounded-full bg-teal-500"
            aria-hidden="true"
          />
          Tendances
        </h2>
        <div class="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
          <div
            class="rusa-card-static min-w-0 overflow-hidden p-3 sm:p-4 dark:border-primary-800 dark:bg-gray-900/40"
          >
            <h3 class="mb-1 text-xs font-semibold text-primary-900 sm:text-sm dark:text-white">
              Évolution du chiffre d’affaires
            </h3>
            <p class="mb-3 text-[11px] text-gray-500 dark:text-gray-400">
              Série mensuelle (montants)
            </p>
            <div class="min-w-0 w-full overflow-x-auto overscroll-x-contain -mx-1 px-1 sm:mx-0 sm:px-0">
              <div class="min-w-[280px] sm:min-w-0">
                <VueApexCharts
                  v-if="caCategories.length"
                  type="area"
                  :height="chartHeight"
                  width="100%"
                  :options="caChartOptions"
                  :series="caSeries"
                />
                <p
                  v-else
                  class="py-10 text-center text-sm text-gray-500 dark:text-gray-400"
                >
                  Aucune série disponible
                </p>
              </div>
            </div>
          </div>
          <div
            class="rusa-card-static min-w-0 overflow-hidden p-3 sm:p-4 dark:border-primary-800 dark:bg-gray-900/40"
          >
            <h3 class="mb-1 text-xs font-semibold text-primary-900 sm:text-sm dark:text-white">
              Évolution du taux de recouvrement
            </h3>
            <p class="mb-3 text-[11px] text-gray-500 dark:text-gray-400">
              Série mensuelle (%)
            </p>
            <div class="min-w-0 w-full overflow-x-auto overscroll-x-contain -mx-1 px-1 sm:mx-0 sm:px-0">
              <div class="min-w-[280px] sm:min-w-0">
                <VueApexCharts
                  v-if="recCategories.length"
                  type="area"
                  :height="chartHeight"
                  width="100%"
                  :options="recChartOptions"
                  :series="recSeries"
                />
                <p
                  v-else
                  class="py-10 text-center text-sm text-gray-500 dark:text-gray-400"
                >
                  Aucune série disponible
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Sociétés + utilisateurs -->
      <div
        class="grid grid-cols-1 gap-4"
        :class="SUPER_ADMIN_DASH_FLAGS.users ? 'xl:grid-cols-3 xl:gap-6' : ''"
      >
        <div
          class="min-w-0 rusa-panel overflow-hidden dark:border-primary-800 dark:bg-gray-900/30"
          :class="SUPER_ADMIN_DASH_FLAGS.users ? 'xl:col-span-2' : ''"
        >
          <div
            class="border-b border-primary-100 px-3 py-3 sm:px-4 dark:border-primary-800"
          >
            <h2 class="text-sm font-semibold text-primary-900 dark:text-white">Sociétés</h2>
          </div>

          <!-- Mobile : cartes -->
          <div class="md:hidden divide-y divide-primary-100 dark:divide-primary-800/60">
            <div
              v-for="s in societesRows"
              :key="`m-${s.idSociete}`"
              class="p-4"
            >
              <div class="flex items-start justify-between gap-2">
                <div class="min-w-0">
                  <p class="font-semibold text-gray-900 dark:text-white">
                    {{ s.nom || '—' }}
                  </p>
                  <p class="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                    {{ s.type || '—' }}
                    <span v-if="s.devise"> · {{ s.devise }}</span>
                  </p>
                  <p
                    v-if="s.nomCompletResponsable"
                    class="mt-1 text-xs text-gray-600 dark:text-gray-300"
                  >
                    Resp. {{ s.nomCompletResponsable }}
                  </p>
                  <div class="mt-1 space-y-0.5 text-xs text-primary-700 dark:text-primary-300">
                    <a
                      v-if="s.emailContact"
                      :href="'mailto:' + s.emailContact"
                      class="block truncate underline-offset-2 hover:underline"
                    >{{ s.emailContact }}</a>
                    <a
                      v-if="s.telephone"
                      :href="'tel:' + s.telephone.replace(/\s/g, '')"
                      class="block hover:underline"
                    >{{ s.telephone }}</a>
                    <a
                      v-if="s.siteWeb"
                      :href="externalHref(s.siteWeb)"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="block truncate hover:underline"
                    >{{ shortUrl(s.siteWeb) }}</a>
                  </div>
                </div>
                <span
                  class="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium"
                  :class="
                    s.statut
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                  "
                >
                  {{ s.statut ? 'Active' : 'Inactive' }}
                </span>
              </div>
              <dl class="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-xs sm:text-sm">
                <div class="rounded-lg bg-primary-50/50 p-2 dark:bg-primary-950/30">
                  <dt class="text-[10px] font-medium uppercase text-gray-500 dark:text-gray-400">CA (mois)</dt>
                  <dd class="mt-0.5 font-semibold tabular-nums text-gray-900 dark:text-white">
                    {{ formatMoney(s.chiffreAffairesMois) }}
                  </dd>
                </div>
                <div class="rounded-lg bg-primary-50/50 p-2 dark:bg-primary-950/30">
                  <dt class="text-[10px] font-medium uppercase text-gray-500 dark:text-gray-400">Arriérés</dt>
                  <dd class="mt-0.5 font-semibold tabular-nums text-gray-900 dark:text-white">
                    {{ formatMoney(s.montantArrieres) }}
                  </dd>
                </div>
                <div class="rounded-lg bg-primary-50/50 p-2 dark:bg-primary-950/30">
                  <dt class="text-[10px] font-medium uppercase text-gray-500 dark:text-gray-400">Recouv.</dt>
                  <dd class="mt-0.5 font-semibold tabular-nums text-gray-900 dark:text-white">
                    {{ formatPercent(s.tauxRecouvrement) }}
                  </dd>
                </div>
                <div class="rounded-lg bg-primary-50/50 p-2 dark:bg-primary-950/30">
                  <dt class="text-[10px] font-medium uppercase text-gray-500 dark:text-gray-400">Clients / Utilis.</dt>
                  <dd class="mt-0.5 font-semibold tabular-nums text-gray-900 dark:text-white">
                    {{ s.nombreClientsActifs ?? '—' }} · {{ s.nombreUtilisateurs ?? '—' }}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          <!-- Desktop : tableau -->
          <div
            class="hidden md:block overflow-x-auto overscroll-x-contain"
          >
            <table class="w-full min-w-[880px] text-sm">
              <thead class="bg-primary-50/80 dark:bg-primary-950/50">
                <tr>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Société</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                  <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">CA (mois)</th>
                  <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Arriérés</th>
                  <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Recouv.</th>
                  <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Clients</th>
                  <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Utilis.</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-primary-100 dark:divide-primary-800/50">
                <tr
                  v-for="s in societesRows"
                  :key="s.idSociete"
                  class="hover:bg-primary-50/40 dark:hover:bg-primary-950/20"
                >
                  <td class="px-4 py-3">
                    <span class="font-medium text-gray-900 dark:text-white">{{ s.nom || '—' }}</span>
                    <span
                      v-if="s.devise"
                      class="mt-0.5 block text-xs text-gray-500"
                    >{{ s.devise }}</span>
                    <span
                      v-if="s.nomCompletResponsable"
                      class="mt-0.5 block text-xs text-gray-500"
                    >{{ s.nomCompletResponsable }}</span>
                  </td>
                  <td class="px-4 py-3 text-gray-600 dark:text-gray-300">{{ s.type || '—' }}</td>
                  <td class="px-4 py-3 text-xs text-gray-600 dark:text-gray-300">
                    <div v-if="s.emailContact">{{ s.emailContact }}</div>
                    <div v-if="s.telephone">{{ s.telephone }}</div>
                    <a
                      v-if="s.siteWeb"
                      :href="externalHref(s.siteWeb)"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="text-primary-600 hover:underline dark:text-primary-400"
                    >{{ shortUrl(s.siteWeb) }}</a>
                    <span v-if="!s.emailContact && !s.telephone && !s.siteWeb">—</span>
                  </td>
                  <td class="px-4 py-3 text-right tabular-nums">{{ formatMoney(s.chiffreAffairesMois) }}</td>
                  <td class="px-4 py-3 text-right tabular-nums">{{ formatMoney(s.montantArrieres) }}</td>
                  <td class="px-4 py-3 text-right tabular-nums">{{ formatPercent(s.tauxRecouvrement) }}</td>
                  <td class="px-4 py-3 text-right tabular-nums">{{ s.nombreClientsActifs ?? '—' }}</td>
                  <td class="px-4 py-3 text-right tabular-nums">{{ s.nombreUtilisateurs ?? '—' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div
          v-if="dashboard && SUPER_ADMIN_DASH_FLAGS.users"
          class="rusa-card-static min-w-0 p-3 sm:p-4 dark:border-primary-800 dark:bg-gray-900/40"
        >
          <h2 class="text-sm font-semibold text-primary-900 dark:text-white">Utilisateurs</h2>
          <p class="mt-0.5 text-[11px] text-gray-500 dark:text-gray-400">Synthèse des comptes</p>
          <dl class="mt-4 space-y-3 text-sm">
            <div class="flex items-center justify-between gap-2 rounded-xl bg-primary-50/60 px-3 py-2 dark:bg-primary-950/40">
              <dt class="text-gray-600 dark:text-gray-400">Total</dt>
              <dd class="text-lg font-bold tabular-nums text-primary-900 dark:text-white">
                {{ ustats.totalUtilisateurs ?? 0 }}
              </dd>
            </div>
            <div class="flex justify-between gap-2">
              <dt class="text-gray-600 dark:text-gray-400">Actifs (mois)</dt>
              <dd class="font-semibold tabular-nums dark:text-white">{{ ustats.utilisateursActifsMois ?? 0 }}</dd>
            </div>
            <div class="flex justify-between gap-2">
              <dt class="text-gray-600 dark:text-gray-400">Connectés</dt>
              <dd class="font-semibold tabular-nums dark:text-white">{{ ustats.utilisateursConnectes ?? 0 }}</dd>
            </div>
          </dl>
          <p class="mt-5 text-[10px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Répartition par rôle
          </p>
          <ul class="mt-2 space-y-2">
            <li
              v-for="row in ustats.repartitionParRole || []"
              :key="row.role"
              class="flex flex-col gap-1 rounded-lg border border-primary-100/80 px-3 py-2 text-sm sm:flex-row sm:items-center sm:justify-between dark:border-primary-800/60"
            >
              <span class="min-w-0 truncate font-medium text-gray-800 dark:text-gray-200">{{ row.role }}</span>
              <span class="shrink-0 tabular-nums text-gray-900 dark:text-white">
                {{ row.nombreUtilisateurs }}
                <span class="text-gray-500 dark:text-gray-400">({{ formatRolePercent(row.pourcentage) }})</span>
              </span>
            </li>
          </ul>
        </div>
      </div>

      <!-- Top 5 -->
      <div
        v-if="dashboard && SUPER_ADMIN_DASH_FLAGS.top5"
        class="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6"
      >
        <div class="rusa-card-static p-3 sm:p-4 dark:border-primary-800 dark:bg-gray-900/40">
          <h2 class="text-sm font-semibold text-primary-900 dark:text-white">Top 5 — Chiffre d’affaires</h2>
          <ul
            v-if="(dashboard.top5SocietesCA || []).length"
            class="mt-3 space-y-2"
          >
            <li
              v-for="row in dashboard.top5SocietesCA"
              :key="`${row.idSociete}-${row.rang}`"
              class="flex flex-col gap-1 rounded-xl border border-primary-100/60 px-3 py-2.5 text-sm sm:flex-row sm:items-center sm:justify-between dark:border-primary-800/50"
            >
              <span class="min-w-0">
                <span class="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-800 dark:bg-primary-900/60 dark:text-primary-200">
                  {{ row.rang }}
                </span>
                <span class="font-medium text-gray-900 dark:text-white">{{ row.nom }}</span>
              </span>
              <span class="shrink-0 font-semibold tabular-nums text-primary-700 dark:text-primary-300">
                {{ formatMoney(row.valeur) }}
              </span>
            </li>
          </ul>
          <p
            v-else
            class="mt-3 text-sm text-gray-500 dark:text-gray-400"
          >
            Aucune donnée
          </p>
        </div>
        <div class="rusa-card-static p-3 sm:p-4 dark:border-primary-800 dark:bg-gray-900/40">
          <h2 class="text-sm font-semibold text-primary-900 dark:text-white">Top 5 — Recouvrement</h2>
          <ul
            v-if="(dashboard.top5SocietesRecouvrement || []).length"
            class="mt-3 space-y-2"
          >
            <li
              v-for="row in dashboard.top5SocietesRecouvrement"
              :key="`${row.idSociete}-${row.rang}-rec`"
              class="flex flex-col gap-1 rounded-xl border border-primary-100/60 px-3 py-2.5 text-sm sm:flex-row sm:items-center sm:justify-between dark:border-primary-800/50"
            >
              <span class="min-w-0">
                <span class="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-teal-100 text-xs font-bold text-teal-800 dark:bg-teal-900/50 dark:text-teal-200">
                  {{ row.rang }}
                </span>
                <span class="font-medium text-gray-900 dark:text-white">{{ row.nom }}</span>
              </span>
              <span class="shrink-0 font-semibold tabular-nums text-teal-700 dark:text-teal-300">
                {{ formatPercent(row.valeur) }}
              </span>
            </li>
          </ul>
          <p
            v-else
            class="mt-3 text-sm text-gray-500 dark:text-gray-400"
          >
            Aucune donnée
          </p>
        </div>
      </div>

      <!-- Alertes -->
      <section
        v-if="dashboard && SUPER_ADMIN_DASH_FLAGS.alerts"
        aria-label="Alertes critiques"
      >
        <h2 class="mb-3 flex items-center gap-2 text-sm font-semibold text-primary-900 dark:text-white">
          <span
            class="h-1.5 w-1.5 rounded-full bg-amber-500"
            aria-hidden="true"
          />
          Alertes critiques
        </h2>
        <div
          v-if="(dashboard.alertesCritiques || []).length"
          class="space-y-3"
        >
          <div
            v-for="a in dashboard.alertesCritiques"
            :key="`${a.idAlerte}-${a.dateAlerte}`"
            class="rounded-2xl border p-3 sm:p-4"
            :class="alertBoxClass(a.niveauCriticite)"
          >
            <div class="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div class="min-w-0">
                <p class="text-xs font-medium text-gray-600 dark:text-gray-400">
                  <span class="font-semibold text-gray-800 dark:text-gray-200">{{ a.typeAlerte }}</span>
                  <span class="text-gray-400"> · </span>
                  {{ a.nomSociete }}
                  <span
                    v-if="a.niveauCriticite"
                    class="ml-1 rounded-md bg-black/5 px-1.5 py-0.5 text-[10px] uppercase dark:bg-white/10"
                  >{{ a.niveauCriticite }}</span>
                </p>
                <p class="mt-2 text-sm leading-relaxed text-gray-900 dark:text-white">{{ a.description }}</p>
              </div>
              <time
                class="shrink-0 text-[11px] text-gray-500 sm:text-right dark:text-gray-400"
                :datetime="a.dateAlerte"
              >
                {{ formatAlertDate(a.dateAlerte) }}
              </time>
            </div>
            <p
              v-if="a.statut"
              class="mt-3 border-t border-black/5 pt-2 text-xs text-gray-600 dark:border-white/10 dark:text-gray-400"
            >
              Statut : <span class="font-medium">{{ a.statut }}</span>
            </p>
          </div>
        </div>
        <p
          v-else
          class="rounded-2xl border border-dashed border-primary-200 bg-primary-50/30 py-8 text-center text-sm text-gray-500 dark:border-primary-800 dark:bg-primary-950/20 dark:text-gray-400"
        >
          Aucune alerte
        </p>
      </section>
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import VueApexCharts from 'vue3-apexcharts'
import { useAuthStore } from '@/stores/auth'
import { fetchSuperAdminDashboard } from '@/services/superAdminDashboardService'
import {
  listSocietesArray,
  mergeSocietesWithDashboardStats,
} from '@/services/societeService'

/**
 * Affichage progressif : mettre à true pour activer chaque zone du tableau de bord.
 */
const SUPER_ADMIN_DASH_FLAGS = {
  /** Clients, CA, paiements, arriérés, recouvrement global, factures, nb paiements */
  kpiFinanceAndClients: false,
  trends: false,
  users: false,
  top5: false,
  alerts: false,
}

const authStore = useAuthStore()

function firstNameFromUser(u) {
  const full = String(u?.nomComplet || u?.NomComplet || '').trim()
  if (!full) return ''
  return full.split(/\s+/)[0] || full
}

const superAdminIntro = computed(() => {
  const first = firstNameFromUser(authStore.user)
  const greet = first ? `${first}, ` : ''
  return `${greet}bienvenue — pilotage global, sociétés et indicateurs ci-dessous.`
})

const loading = ref(true)
const dashboardLoadError = ref('')
const societesLoadError = ref('')
const initialLoadDone = ref(false)
const dashboard = ref(null)
const societesApiRaw = ref([])

/** Largeur & thème pour graphiques */
const windowWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1024)
const isDarkTheme = ref(false)

function readDark() {
  isDarkTheme.value =
    typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
}

if (typeof document !== 'undefined') readDark()

function onResize() {
  windowWidth.value = typeof window !== 'undefined' ? window.innerWidth : 1024
}

const chartHeight = computed(() => (windowWidth.value < 480 ? 220 : windowWidth.value < 768 ? 248 : 280))

const stats = computed(() => dashboard.value?.globalStatistiques || {})
const ustats = computed(() => dashboard.value?.utilisateursStatistiques || {})

const societesRows = computed(() =>
  mergeSocietesWithDashboardStats(societesApiRaw.value, dashboard.value?.societes)
)

const generatedAt = computed(() => {
  const raw = dashboard.value?.dateGeneration
  if (!raw) return ''
  const d = new Date(raw)
  if (Number.isNaN(d.getTime())) return raw
  return d.toLocaleString('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
})

const KPI_BAR_CLASSES = [
  'from-indigo-500 to-violet-500',
  'from-sky-500 to-blue-500',
  'from-teal-500 to-emerald-500',
  'from-amber-500 to-orange-500',
  'from-rose-500 to-pink-500',
]

function kpiAccentBar(index) {
  return KPI_BAR_CLASSES[index % KPI_BAR_CLASSES.length]
}

function kpiAccentBorder(index) {
  const rings = [
    'ring-1 ring-indigo-500/15 dark:ring-indigo-400/20',
    'ring-1 ring-sky-500/15 dark:ring-sky-400/20',
    'ring-1 ring-teal-500/15 dark:ring-teal-400/20',
    'ring-1 ring-amber-500/15 dark:ring-amber-400/20',
    'ring-1 ring-rose-500/15 dark:ring-rose-400/20',
  ]
  return rings[index % rings.length]
}

function formatMoney(n) {
  return new Intl.NumberFormat('fr-CD', { maximumFractionDigits: 0 }).format(Number(n) || 0)
}

function formatPercent(n) {
  const v = Number(n) || 0
  return `${v.toLocaleString('fr-FR', { maximumFractionDigits: 1 })} %`
}

function formatRolePercent(n) {
  const v = Number(n) || 0
  return `${v.toLocaleString('fr-FR', { maximumFractionDigits: 1 })} %`
}

function formatAlertDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })
}

function externalHref(url) {
  const u = String(url || '').trim()
  if (!u) return '#'
  if (/^https?:\/\//i.test(u)) return u
  return `https://${u}`
}

function shortUrl(url) {
  const u = String(url || '').trim()
  if (!u) return ''
  return u.replace(/^https?:\/\//i, '').replace(/\/$/, '')
}

const globalCards = [
  { key: 'totalSocietes', label: 'Sociétés (total)', format: (v) => String(v ?? 0) },
  { key: 'societesActives', label: 'Sociétés actives', format: (v) => String(v ?? 0) },
  { key: 'totalClients', label: 'Clients (total)', format: (v) => String(v ?? 0) },
  { key: 'clientsActifs', label: 'Clients actifs', format: (v) => String(v ?? 0) },
  { key: 'chiffreAffairesGlobal', label: 'CA global', format: formatMoney },
  { key: 'montantTotalPaiementsGlobal', label: 'Paiements (total)', format: formatMoney },
  { key: 'montantTotalArrieresGlobal', label: 'Arriérés (total)', format: formatMoney },
  { key: 'tauxRecouvrementGlobal', label: 'Taux recouvrement global', format: formatPercent },
  { key: 'totalFactures', label: 'Factures', format: (v) => String(v ?? 0) },
  { key: 'totalPaiements', label: 'Nombre de paiements', format: (v) => String(v ?? 0) },
]

const kpiCardsVisible = computed(() => {
  if (SUPER_ADMIN_DASH_FLAGS.kpiFinanceAndClients) return globalCards
  return globalCards.filter(
    (c) => c.key === 'totalSocietes' || c.key === 'societesActives'
  )
})

const caCategories = computed(() =>
  (dashboard.value?.tendances?.evolutionChiffreAffaires || []).map((p) => p.mois || `${p.annee}`)
)

const caSeries = computed(() => [
  {
    name: "Chiffre d'affaires",
    data: (dashboard.value?.tendances?.evolutionChiffreAffaires || []).map((p) => p.valeur ?? 0),
  },
])

const chartGridColor = computed(() => (isDarkTheme.value ? '#334155' : '#e2e8f0'))
const chartLabelColor = computed(() => (isDarkTheme.value ? '#94a3b8' : '#64748b'))

const caChartOptions = computed(() => {
  const narrow = windowWidth.value < 640
  return {
    chart: {
      fontFamily: 'Outfit, sans-serif',
      toolbar: { show: false },
      zoom: { enabled: false },
      animations: { enabled: windowWidth.value > 400 },
    },
    colors: ['#4f46e5'],
    stroke: { curve: 'smooth', width: 2 },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: isDarkTheme.value ? 0.35 : 0.45,
        opacityTo: 0.05,
      },
    },
    dataLabels: { enabled: false },
    xaxis: {
      categories: caCategories.value,
      labels: {
        rotate: narrow ? -75 : -35,
        rotateAlways: narrow,
        maxHeight: narrow ? 72 : 100,
        hideOverlappingLabels: true,
        style: { fontSize: narrow ? '10px' : '11px', colors: chartLabelColor.value },
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        formatter: (val) => formatMoney(val),
        style: { colors: chartLabelColor.value, fontSize: '11px' },
      },
    },
    tooltip: {
      theme: isDarkTheme.value ? 'dark' : 'light',
      y: { formatter: (val) => formatMoney(val) },
    },
    grid: {
      borderColor: chartGridColor.value,
      strokeDashArray: 4,
      padding: { left: narrow ? 4 : 8, right: 8 },
    },
  }
})

const recCategories = computed(() =>
  (dashboard.value?.tendances?.evolutionTauxRecouvrement || []).map((p) => p.mois || `${p.annee}`)
)

const recSeries = computed(() => [
  {
    name: 'Taux de recouvrement',
    data: (dashboard.value?.tendances?.evolutionTauxRecouvrement || []).map((p) => p.valeur ?? 0),
  },
])

const recChartOptions = computed(() => {
  const narrow = windowWidth.value < 640
  return {
    chart: {
      fontFamily: 'Outfit, sans-serif',
      toolbar: { show: false },
      zoom: { enabled: false },
      animations: { enabled: windowWidth.value > 400 },
    },
    colors: ['#0d9488'],
    stroke: { curve: 'smooth', width: 2 },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: isDarkTheme.value ? 0.3 : 0.4,
        opacityTo: 0.05,
      },
    },
    dataLabels: { enabled: false },
    xaxis: {
      categories: recCategories.value,
      labels: {
        rotate: narrow ? -75 : -35,
        rotateAlways: narrow,
        maxHeight: narrow ? 72 : 100,
        hideOverlappingLabels: true,
        style: { fontSize: narrow ? '10px' : '11px', colors: chartLabelColor.value },
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        formatter: (val) => formatPercent(val),
        style: { colors: chartLabelColor.value, fontSize: '11px' },
      },
    },
    tooltip: {
      theme: isDarkTheme.value ? 'dark' : 'light',
      y: { formatter: (val) => formatPercent(val) },
    },
    grid: {
      borderColor: chartGridColor.value,
      strokeDashArray: 4,
      padding: { left: narrow ? 4 : 8, right: 8 },
    },
  }
})

function alertBoxClass(niveau) {
  const n = String(niveau || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
  if (n.includes('eleve') || n.includes('crit')) {
    return 'border-red-200 bg-red-50/95 dark:border-red-900/60 dark:bg-red-950/35'
  }
  if (n.includes('moyen')) {
    return 'border-amber-200 bg-amber-50/95 dark:border-amber-900/50 dark:bg-amber-950/30'
  }
  return 'border-primary-100 bg-gray-50/90 dark:border-primary-800 dark:bg-gray-900/55'
}

async function load() {
  loading.value = true
  dashboardLoadError.value = ''
  societesLoadError.value = ''
  initialLoadDone.value = false
  dashboard.value = null
  societesApiRaw.value = []
  try {
    const [dashResult, apiResult] = await Promise.allSettled([
      fetchSuperAdminDashboard(),
      listSocietesArray(),
    ])
    if (dashResult.status === 'fulfilled') {
      dashboard.value = dashResult.value
    } else {
      dashboard.value = null
      const err = dashResult.reason
      const st = err && typeof err === 'object' ? err.status : undefined
      // 404 = route backend non déployée : on affiche quand même les sociétés (GET /api/Societe) sans bannière d’erreur.
      if (st !== 404) {
        dashboardLoadError.value =
          err?.message || 'Impossible de charger le tableau de bord.'
      }
    }
    if (apiResult.status === 'fulfilled') {
      societesApiRaw.value = apiResult.value
    } else {
      societesApiRaw.value = []
      societesLoadError.value =
        apiResult.reason?.message || 'Impossible de charger la liste des sociétés (GET /api/Societe).'
    }
  } finally {
    initialLoadDone.value = true
    loading.value = false
  }
}

let darkClassObserver = null

onMounted(() => {
  readDark()
  void load()
  if (typeof window === 'undefined') return
  window.addEventListener('resize', onResize, { passive: true })
  darkClassObserver = new MutationObserver(readDark)
  darkClassObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
  })
})

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('resize', onResize)
  }
  darkClassObserver?.disconnect()
  darkClassObserver = null
})
</script>
