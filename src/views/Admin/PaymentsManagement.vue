<template>
  <DefaultLayout>
    <div class="space-y-4">
      <div class="rusa-gradient-header flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-2xl font-bold text-white">Gestion des Paiements</h1>
          <p class="text-primary-100">{{ headerIntro }}</p>
        </div>
        <div class="flex flex-wrap items-center gap-3">
          <button
            type="button"
            class="rusa-btn-primary shrink-0 bg-white text-primary-800 hover:bg-primary-50"
            :disabled="!idSocieteForSave || loading"
            @click="openCreateModal"
          >
            Nouveau paiement
          </button>
          <button
            type="button"
            class="shrink-0 rounded-lg bg-white/15 px-4 py-2.5 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white/25 disabled:opacity-50"
            :disabled="loading || !filteredPayments.length"
            @click="exportCsv"
          >
            Exporter (CSV)
          </button>
        </div>
      </div>

      <p
        v-if="societeWarning"
        class="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/40 dark:text-amber-100"
      >
        {{ societeWarning }}
      </p>

      <p
        v-if="error"
        class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200"
      >
        {{ error }}
      </p>

      <div class="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div class="rusa-card p-5">
          <p class="text-sm font-medium text-gray-600 dark:text-primary-300/80">Total (API)</p>
          <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ totalCount }}</p>
          <p class="mt-1 text-xs text-gray-500 dark:text-primary-400/80">Enregistrements côté serveur</p>
        </div>
        <div class="rusa-card p-5">
          <p class="text-sm font-medium text-gray-600 dark:text-primary-300/80">Validés (page)</p>
          <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ statsPage.completed }}</p>
        </div>
        <div class="rusa-card p-5">
          <p class="text-sm font-medium text-gray-600 dark:text-primary-300/80">Non validés (page)</p>
          <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ statsPage.pending }}</p>
        </div>
        <div class="rusa-card p-5">
          <p class="text-sm font-medium text-gray-600 dark:text-primary-300/80">Montant payé (page)</p>
          <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ formatMoneyFc(statsPage.revenue) }}</p>
        </div>
      </div>

      <div class="rusa-card">
        <div class="grid grid-cols-1 gap-4 md:grid-cols-5 md:items-end">
          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-primary-200/90">Recherche</label>
            <input
              v-model="searchQuery"
              type="search"
              autocomplete="off"
              placeholder="Référence, client, réservation…"
              class="w-full rounded-xl border border-primary-100 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-primary-800 dark:bg-primary-950/50 dark:text-white"
            />
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-primary-200/90">Filtre statut (page)</label>
            <select
              v-model="statusFilter"
              class="w-full rounded-xl border border-primary-100 px-3 py-2 text-gray-900 dark:border-primary-800 dark:bg-primary-950/50 dark:text-white"
            >
              <option value="">Tous</option>
              <option value="completed">Validés</option>
              <option value="pending">Non validés</option>
            </select>
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-primary-200/90">Méthode contient (page)</label>
            <input
              v-model="methodFilter"
              type="text"
              placeholder="ex. Mobile Money"
              class="w-full rounded-xl border border-primary-100 px-3 py-2 text-gray-900 dark:border-primary-800 dark:bg-primary-950/50 dark:text-white"
            />
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-primary-200/90">État billet (page)</label>
            <select
              v-model="ticketFilter"
              class="w-full rounded-xl border border-primary-100 px-3 py-2 text-gray-900 dark:border-primary-800 dark:bg-primary-950/50 dark:text-white"
            >
              <option value="">Tous</option>
              <option value="complete">Complet</option>
              <option value="partial">Partiel</option>
              <option value="no-ticket">Sans billet</option>
            </select>
          </div>
          <div class="flex items-end gap-2">
            <button
              type="button"
              class="w-full rounded-xl bg-gray-100 px-4 py-2 text-gray-800 hover:bg-gray-200 dark:bg-primary-900/60 dark:text-primary-100 dark:hover:bg-primary-800/80"
              @click="resetFilters"
            >
              Réinitialiser
            </button>
          </div>
        </div>
      </div>

      <div class="rusa-panel overflow-hidden">
        <div v-if="loading" class="p-8 text-center text-sm text-gray-500 dark:text-primary-400/80">
          Chargement des paiements…
        </div>
        <div v-else class="overflow-x-auto">
          <table class="w-full min-w-[720px]">
            <thead class="bg-primary-50/80 dark:bg-primary-950/50">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-primary-400/90">Client</th>
                <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-primary-400/90">Montants</th>
                <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-primary-400/90">Méthode</th>
                <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-primary-400/90">Date</th>
                <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-primary-400/90">Statut</th>
                <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-primary-400/90">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-primary-100 dark:divide-primary-800/50">
              <tr v-for="payment in filteredPayments" :key="payment.id">
                <td class="px-4 py-3">
                  <div class="flex items-center gap-2">
                    <div
                      class="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-semibold text-primary-800 dark:bg-primary-900 dark:text-primary-200"
                    >
                      {{ clientInitial(payment.clientName) }}
                    </div>
                    <div class="min-w-0">
                      <p class="truncate text-sm font-medium text-gray-900 dark:text-white">{{ payment.clientName }}</p>
                      <p v-if="payment.clientEmail" class="truncate text-xs text-gray-500 dark:text-primary-400/85">
                        {{ payment.clientEmail }}
                      </p>
                      <p class="truncate text-xs text-gray-500 dark:text-primary-400/85">
                        {{ payment.transactionId }}
                      </p>
                    </div>
                  </div>
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm">
                  <p class="font-medium text-gray-900 dark:text-white">{{ formatMoneyFc(payment.amount) }}</p>
                  <p v-if="payment.montantAPaye" class="text-xs text-gray-500 dark:text-primary-400/80">
                    dû {{ formatMoneyFc(payment.montantAPaye) }}
                  </p>
                  <p class="text-xs text-gray-500 dark:text-primary-400/80">
                    reste {{ formatMoneyFc(payment.resteAPaye) }}
                  </p>
                </td>
                <td class="px-4 py-3 text-sm text-gray-900 dark:text-primary-100">{{ payment.method }}</td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-primary-100">
                  <span>{{ payment.date }}</span>
                  <span v-if="payment.time" class="block text-xs text-gray-500 dark:text-primary-400/85">{{ payment.time }}</span>
                </td>
                <td class="px-4 py-3 whitespace-nowrap">
                  <span
                    class="inline-flex rounded-full px-2 py-0.5 text-xs font-medium"
                    :class="getStatusBadgeClass(payment.status)"
                  >
                    {{ statusLabel(payment) }}
                  </span>
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm">
                  <button
                    type="button"
                    class="mr-3 font-medium text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300"
                    @click="openEditModal(payment)"
                  >
                    Modifier
                  </button>
                  <button
                    type="button"
                    class="font-medium text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300"
                    @click="viewPaymentDetails(payment)"
                  >
                    Détails
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
          <p
            v-if="!loading && !filteredPayments.length"
            class="px-4 py-10 text-center text-sm text-gray-500 dark:text-primary-400/80"
          >
            Aucun paiement à afficher.
          </p>
        </div>

        <div
          v-if="totalPages > 1"
          class="flex flex-wrap items-center justify-between gap-3 border-t border-primary-100 px-4 py-3 dark:border-primary-800/50"
        >
          <p class="text-xs text-gray-600 dark:text-primary-400/85">
            Page {{ pageNumber }} / {{ totalPages }} — {{ pageSize }} par page
          </p>
          <div class="flex gap-2">
            <button
              type="button"
              class="rounded-lg border border-gray-200 px-3 py-1.5 text-sm disabled:opacity-40 dark:border-primary-700"
              :disabled="pageNumber <= 1 || loading"
              @click="goPage(pageNumber - 1)"
            >
              Précédent
            </button>
            <button
              type="button"
              class="rounded-lg border border-gray-200 px-3 py-1.5 text-sm disabled:opacity-40 dark:border-primary-700"
              :disabled="pageNumber >= totalPages || loading"
              @click="goPage(pageNumber + 1)"
            >
              Suivant
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Création -->
    <Teleport to="body">
      <div
        v-if="showCreateModal"
        class="fixed inset-0 z-[500001] flex items-center justify-center bg-black/50 p-4"
        role="dialog"
        aria-modal="true"
        @click.self="closeCreateModal"
      >
        <div
          class="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl dark:border dark:border-primary-800 dark:bg-primary-950"
        >
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
            {{ isEditMode ? 'Modifier paiement' : 'Nouveau paiement' }}
          </h2>
          <form class="mt-4 space-y-3" @submit.prevent="submitCreate">
            <div>
              <label class="mb-1 block text-xs font-medium text-gray-600 dark:text-primary-300/90">Montant à payer</label>
              <input v-model.number="createForm.montantAPaye" type="number" min="0" step="0.01" class="w-full rounded-lg border px-3 py-2 dark:border-primary-700 dark:bg-primary-900/40 dark:text-white" />
              <p class="mt-0.5 text-[11px] text-gray-500 dark:text-primary-400/75">Rempli automatiquement à partir du n° de réservation (reste dû).</p>
            </div>
            <div>
              <label class="mb-1 block text-xs font-medium text-gray-600 dark:text-primary-300/90">Montant payé</label>
              <input v-model.number="createForm.montantPaye" type="number" min="0" step="0.01" class="w-full rounded-lg border px-3 py-2 dark:border-primary-700 dark:bg-primary-900/40 dark:text-white" />
              <p class="mt-0.5 text-[11px] text-gray-500 dark:text-primary-400/75">Par défaut = reste dû (paiement complet → billet automatique côté serveur).</p>
            </div>
            <div>
              <label class="mb-1 block text-xs font-medium text-gray-600 dark:text-primary-300/90">Méthode</label>
              <input v-model="createForm.methodePaiement" type="text" required class="w-full rounded-lg border px-3 py-2 dark:border-primary-700 dark:bg-primary-900/40 dark:text-white" />
            </div>
            <div>
              <label class="mb-1 block text-xs font-medium text-gray-600 dark:text-primary-300/90">Réf. transaction</label>
              <input v-model="createForm.referenceTransaction" type="text" class="w-full rounded-lg border px-3 py-2 dark:border-primary-700 dark:bg-primary-900/40 dark:text-white" />
            </div>
            <div class="flex items-center gap-2">
              <input id="pai-stat" v-model="createForm.statut" type="checkbox" class="rounded border-gray-300" />
              <label for="pai-stat" class="text-sm text-gray-700 dark:text-primary-200/90">Validé (statut)</label>
            </div>
            <div>
              <label class="mb-1 block text-xs font-medium text-gray-600 dark:text-primary-300/90">Id utilisateur</label>
              <input v-model.number="createForm.idUtilisateur" type="number" min="0" step="1" class="w-full rounded-lg border px-3 py-2 dark:border-primary-700 dark:bg-primary-900/40 dark:text-white" />
              <p class="mt-0.5 text-[11px] text-gray-500 dark:text-primary-400/75">
                Prérempli avec votre compte ({{ sessionUserId || '—' }}). Laissez 0 pour utiliser la session.
              </p>
            </div>
            <div>
              <label class="mb-1 block text-xs font-medium text-gray-600 dark:text-primary-300/90">Id réservation</label>
              <input
                v-model="createForm.idReservation"
                type="text"
                inputmode="numeric"
                autocomplete="off"
                placeholder="ex. 12"
                class="w-full rounded-lg border px-3 py-2 dark:border-primary-700 dark:bg-primary-900/40 dark:text-white"
              />
              <p v-if="createResaLoading" class="mt-1 text-xs text-primary-600 dark:text-primary-400">Chargement de la réservation…</p>
              <p v-else-if="createResaErr" class="mt-1 text-xs text-red-600 dark:text-red-300">{{ createResaErr }}</p>
              <p v-else-if="createResaHint" class="mt-1 text-xs text-gray-600 dark:text-primary-300/85">{{ createResaHint }}</p>
            </div>
            <p class="text-xs text-gray-500 dark:text-primary-400/80">Société : {{ idSocieteForSave || '—' }}</p>
            <div class="flex justify-end gap-2 pt-2">
              <button type="button" class="rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 dark:text-primary-300 dark:hover:bg-primary-900/50" @click="closeCreateModal">Annuler</button>
              <button type="submit" class="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-500 disabled:opacity-50" :disabled="createSaving">
                {{ createSaving ? 'Enregistrement…' : isEditMode ? 'Mettre à jour' : 'Enregistrer' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Détail -->
    <Teleport to="body">
      <div
        v-if="showDetailModal"
        class="fixed inset-0 z-[500001] flex items-center justify-center bg-black/50 p-4"
        role="dialog"
        aria-modal="true"
        @click.self="closeDetailModal"
      >
        <div class="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl dark:border dark:border-primary-800 dark:bg-primary-950">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Détail paiement</h2>
          <p v-if="detailLoading" class="mt-4 text-sm text-gray-600 dark:text-primary-300/90">Chargement…</p>
          <template v-else>
            <p class="mt-1 text-sm text-gray-500 dark:text-primary-400/85">Paiement #{{ detailId }}</p>
            <div class="mt-4 space-y-3">
              <div class="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-primary-800/55 dark:bg-primary-900/35">
                <div class="flex items-center justify-between gap-3">
                  <p class="text-sm font-medium text-gray-600 dark:text-primary-300/85">Statut</p>
                  <span
                    class="inline-flex rounded-full px-2.5 py-1 text-xs font-semibold"
                    :class="getStatusBadgeClass(detailView.status)"
                  >
                    {{ statusLabel(detailView) }}
                  </span>
                </div>
                <div class="mt-3 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p class="text-xs text-gray-500 dark:text-primary-400/80">Montant payé</p>
                    <p class="font-semibold text-gray-900 dark:text-white">{{ formatMoneyFc(detailView.montantPaye) }}</p>
                  </div>
                  <div>
                    <p class="text-xs text-gray-500 dark:text-primary-400/80">Montant à payer</p>
                    <p class="font-semibold text-gray-900 dark:text-white">{{ formatMoneyFc(detailView.montantAPaye) }}</p>
                  </div>
                  <div class="col-span-2">
                    <p class="text-xs text-gray-500 dark:text-primary-400/80">Reste à payer</p>
                    <p class="font-semibold text-gray-900 dark:text-white">{{ formatMoneyFc(detailView.resteAPaye) }}</p>
                  </div>
                </div>
              </div>

              <div class="rounded-xl border border-gray-200 bg-white p-4 dark:border-primary-800/55 dark:bg-primary-950/50">
                <dl class="space-y-2 text-sm">
                  <div class="flex justify-between gap-3">
                    <dt class="text-gray-500 dark:text-primary-400/80">Client</dt>
                    <dd class="font-medium text-gray-900 dark:text-white">{{ detailView.clientName || '—' }}</dd>
                  </div>
                  <div class="flex justify-between gap-3">
                    <dt class="text-gray-500 dark:text-primary-400/80">Méthode</dt>
                    <dd class="font-medium text-gray-900 dark:text-white">{{ detailView.methodePaiement || '—' }}</dd>
                  </div>
                  <div class="flex justify-between gap-3">
                    <dt class="text-gray-500 dark:text-primary-400/80">Transaction</dt>
                    <dd class="font-medium text-gray-900 dark:text-white">{{ detailView.referenceTransaction || '—' }}</dd>
                  </div>
                  <div class="flex justify-between gap-3">
                    <dt class="text-gray-500 dark:text-primary-400/80">Utilisateur</dt>
                    <dd class="font-medium text-gray-900 dark:text-white">#{{ detailView.idUtilisateur || '—' }}</dd>
                  </div>
                  <div class="flex justify-between gap-3">
                    <dt class="text-gray-500 dark:text-primary-400/80">Date billet</dt>
                    <dd class="font-medium text-gray-900 dark:text-white">{{ detailView.dateEmissionBillet || '—' }}</dd>
                  </div>
                  <div class="flex justify-between gap-3">
                    <dt class="text-gray-500 dark:text-primary-400/80">Créé le</dt>
                    <dd class="font-medium text-gray-900 dark:text-white">{{ detailView.dateCreation || '—' }}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </template>
          <button
            type="button"
            class="mt-4 w-full rounded-lg bg-primary-600 py-2 text-sm font-semibold text-white hover:bg-primary-500"
            @click="closeDetailModal"
          >
            Fermer
          </button>
        </div>
      </div>
    </Teleport>
  </DefaultLayout>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Swal from 'sweetalert2'
import DefaultLayout from '@/components/layout/DefaultLayout.vue'
import { notify } from '@/utils/notify'
import { useAdminModuleGreeting } from '@/composables/useAdminModuleGreeting'
import { useTenantSocieteId } from '@/composables/useTenantSocieteId'
import { useAuthStore } from '@/stores/auth'
import {
  listPaiementsSocietePaged,
  unwrapPaiementPaged,
  mapPaiementRow,
  createPaiement,
  updatePaiement,
  buildPaiementBody,
  paiementRawToPutBody,
  getPaiement,
  unwrapPaiementCreateResponse,
  pickBilletEmisFromPaiementResponse,
  pickQrCodeFromBillet,
  hasEmittedBilletInPaiementResponse,
  listPaiementsByReservation,
} from '@/services/paiementService'
import { getReservation } from '@/services/reservationService'

const router = useRouter()
const route = useRoute()
const headerIntro = useAdminModuleGreeting('bienvenue — paiements et suivi ci-dessous.')
const authStore = useAuthStore()
const { idSocieteForSave } = useTenantSocieteId()

const payments = ref([])
const loading = ref(false)
const error = ref('')
const totalCount = ref(0)
const pageNumber = ref(1)
const pageSize = ref(20)

const searchQuery = ref('')
const statusFilter = ref('')
const methodFilter = ref('')
const ticketFilter = ref('')

const sessionUserId = computed(() => {
  const u = authStore.user
  if (!u || typeof u !== 'object') return null
  const n = Number(u.idUtilisateur ?? u.IdUtilisateur)
  return Number.isFinite(n) && n > 0 ? n : null
})

const societeWarning = computed(() => {
  if (authStore.role === 'superadmin' && idSocieteForSave.value == null) {
    return 'Sélectionnez une société active (contexte super-admin) pour charger les paiements paginés.'
  }
  if (!idSocieteForSave.value) {
    return 'Aucune société associée à la session : impossible de charger /api/Paiement/societe/.../paged.'
  }
  return ''
})

function formatMoneyFc(value) {
  const n = Number(value) || 0
  return `${n.toLocaleString('fr-CD', { maximumFractionDigits: 2 })} FC`
}

function clientInitial(name) {
  const s = String(name || '').trim()
  if (!s || s === '—') return '?'
  return s.charAt(0).toUpperCase()
}

const statsPage = computed(() => {
  const list = payments.value
  return {
    completed: list.filter((p) => p.statutBool).length,
    pending: list.filter((p) => !p.statutBool).length,
    revenue: list.filter((p) => p.statutBool).reduce((s, p) => s + (Number(p.amount) || 0), 0),
  }
})

const totalPages = computed(() => {
  const t = Number(totalCount.value) || 0
  const ps = Number(pageSize.value) || 20
  return Math.max(1, Math.ceil(t / ps))
})

const filteredPayments = computed(() => {
  const q = methodFilter.value.trim().toLowerCase()
  return payments.value.filter((payment) => {
    const matchesStatus =
      !statusFilter.value ||
      (statusFilter.value === 'completed' && payment.status === 'completed') ||
      (statusFilter.value === 'pending' && payment.status !== 'completed')
    const matchesMethod = !q || String(payment.method || '').toLowerCase().includes(q)
    const matchesTicket =
      !ticketFilter.value ||
      (ticketFilter.value === 'complete' && payment.estComplet) ||
      (ticketFilter.value === 'partial' && payment.estPartiel) ||
      (ticketFilter.value === 'no-ticket' && Number(payment.idBilletEmis) <= 0)
    return matchesStatus && matchesMethod && matchesTicket
  })
})

function getStatusBadgeClass(status) {
  if (status === 'completed') return 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200'
  if (status === 'failed') return 'bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-200'
  return 'bg-amber-100 text-amber-900 dark:bg-amber-950/50 dark:text-amber-200'
}

function statusLabel(payment) {
  if (payment.estComplet) return 'Complet'
  if (payment.estPartiel) return 'Partiel'
  if (payment.status === 'completed') return 'Validé'
  if (payment.status === 'failed') return 'Échoué'
  return 'Non validé'
}

function resetFilters() {
  searchQuery.value = ''
  statusFilter.value = ''
  methodFilter.value = ''
  ticketFilter.value = ''
  pageNumber.value = 1
  loadPayments()
}

function goPage(n) {
  const next = Math.min(Math.max(1, n), totalPages.value)
  pageNumber.value = next
  loadPayments()
}

let searchDebounce = null
watch(searchQuery, () => {
  clearTimeout(searchDebounce)
  searchDebounce = setTimeout(() => {
    pageNumber.value = 1
    loadPayments()
  }, 400)
})

async function loadPayments() {
  const sid = idSocieteForSave.value
  if (sid == null || Number(sid) <= 0) {
    payments.value = []
    totalCount.value = 0
    return
  }
  loading.value = true
  error.value = ''
  try {
    const raw = await listPaiementsSocietePaged(sid, {
      pageNumber: pageNumber.value,
      pageSize: pageSize.value,
      searchTerm: searchQuery.value.trim(),
      sortBy: 'IdPaiement',
      sortDescending: true,
    })
    const { items, totalCount: tc } = unwrapPaiementPaged(raw)
    const mapped = items.map((r) => mapPaiementRow(r))
    const missingClientRows = mapped.filter(
      (p) =>
        (!p.clientName || p.clientName === 'Client inconnu' || p.clientName === '—') &&
        Number(p.reservationId) > 0,
    )
    if (missingClientRows.length) {
      const reservationIds = [
        ...new Set(
          missingClientRows
            .map((p) => Number(p.reservationId))
            .filter((n) => Number.isFinite(n) && n > 0),
        ),
      ]
      const pairs = await Promise.all(
        reservationIds.map(async (id) => {
          try {
            const rawResa = await getReservation(id)
            const d = unwrapReservationDetail(rawResa)
            return [id, clientFromReservationDetail(d)]
          } catch {
            return [id, { name: '', contact: '' }]
          }
        }),
      )
      const byReservation = new Map(pairs)
      for (const p of mapped) {
        if (p.clientName && p.clientName !== 'Client inconnu' && p.clientName !== '—') continue
        const detail = byReservation.get(Number(p.reservationId))
        if (detail?.name) p.clientName = detail.name
        if (!p.clientEmail && detail?.contact) p.clientEmail = detail.contact
      }
    }
    payments.value = mapped
    totalCount.value = tc
  } catch (e) {
    error.value = e?.message || 'Impossible de charger les paiements.'
    payments.value = []
    totalCount.value = 0
  } finally {
    loading.value = false
  }
}

watch(idSocieteForSave, () => {
  pageNumber.value = 1
  loadPayments()
})

onMounted(() => {
  loadPayments()
})

function exportCsv() {
  const rows = filteredPayments.value
  if (!rows.length) return
  const headers = ['id', 'transaction', 'client', 'email', 'reservation', 'montantPaye', 'montantAPaye', 'resteAPaye', 'methode', 'idBilletEmis', 'dateEmissionBillet', 'date', 'statut']
  const lines = [headers.join(';')]
  for (const p of rows) {
    lines.push(
      [
        p.id,
        p.transactionId,
        p.clientName,
        p.clientEmail,
        p.reservationId,
        p.amount,
        p.montantAPaye,
        p.resteAPaye,
        p.method,
        p.idBilletEmis,
        p.dateEmissionBillet || '',
        `${p.date} ${p.time}`,
        statusLabel(p),
      ]
        .map((c) => `"${String(c).replace(/"/g, '""')}"`)
        .join(';'),
    )
  }
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `paiements-page-${pageNumber.value}.csv`
  a.click()
  URL.revokeObjectURL(url)
  notify.toast.success('Export CSV généré')
}

const showCreateModal = ref(false)
const editPaiementId = ref(0)
const createSaving = ref(false)
const createResaLoading = ref(false)
const createResaHint = ref('')
const createResaErr = ref('')
const createForm = ref({
  montantAPaye: 0,
  montantPaye: 0,
  methodePaiement: '',
  referenceTransaction: '',
  statut: true,
  idUtilisateur: 0,
  idReservation: '',
})
const isEditMode = computed(() => Number(editPaiementId.value) > 0)

function resetCreateResaUi() {
  createResaLoading.value = false
  createResaHint.value = ''
  createResaErr.value = ''
}

/** Détail réservation (GET) : corps plat ou { data }. */
function unwrapReservationDetail(raw) {
  if (!raw || typeof raw !== 'object') return null
  const r = /** @type {Record<string, unknown>} */ (raw)
  const d = r.data ?? r.Data
  if (d && typeof d === 'object' && !Array.isArray(d)) return /** @type {Record<string, unknown>} */ (d)
  return r
}

function clientFromReservationDetail(d) {
  if (!d || typeof d !== 'object') return { name: '', contact: '' }
  const nom = String(d.nomClient ?? d.NomClient ?? '').trim()
  const prenom = String(d.prenomClient ?? d.PrenomClient ?? '').trim()
  const name = [prenom, nom].filter(Boolean).join(' ').trim() || nom || prenom
  const contact = String(
    d.emailClient ??
      d.EmailClient ??
      d.emailUtilisateur ??
      d.EmailUtilisateur ??
      d.telephoneClient ??
      d.TelephoneClient ??
      '',
  ).trim()
  return { name, contact }
}

/** Montant total dû pour la ligne réservation (FC). */
function montantDuFromReservationRow(d) {
  if (!d || typeof d !== 'object') return 0
  const direct =
    Number(d.montantTotal ?? d.MontantTotal ?? d.prixTotal ?? d.PrixTotal ?? d.prixVoyage ?? d.PrixVoyage ?? 0) || 0
  if (direct > 0) return Math.round(direct * 100) / 100
  const v = d.voyage ?? d.Voyage
  const prixV = v && typeof v === 'object' ? Number(v.prix ?? v.Prix ?? 0) || 0 : 0
  const pl = Math.max(1, Math.floor(Number(d.nombrePlaces ?? d.NombrePlaces ?? d.nombreDePlace ?? d.NombreDePlace ?? 1)))
  if (prixV > 0) return Math.round(prixV * pl * 100) / 100
  return 0
}

let createResaDebounce = null

async function hydrateFromReservation(rawId) {
  resetCreateResaUi()
  const id = Number(String(rawId ?? '').trim())
  if (!Number.isFinite(id) || id <= 0) return

  createResaLoading.value = true
  try {
    const raw = await getReservation(id)
    const d = unwrapReservationDetail(raw)
    if (!d) {
      createResaErr.value = 'Réponse réservation vide.'
      return
    }
    const totalDu = montantDuFromReservationRow(d)
    let deja = 0
    try {
      const rows = await listPaiementsByReservation(id)
      for (const pr of rows) {
        const p = pr && typeof pr === 'object' ? /** @type {Record<string, unknown>} */ (pr) : {}
        deja += Number(p.montantPaye ?? p.MontantPaye ?? 0)
      }
    } catch {
      /* liste paiements optionnelle */
    }
    deja = Math.round(deja * 100) / 100
    const reste = Math.max(0, Math.round((totalDu - deja) * 100) / 100)

    if (totalDu <= 0) {
      createResaErr.value =
        'Montant du voyage introuvable sur cette réservation. Saisissez les montants manuellement ou vérifiez l’API.'
      return
    }

    createForm.value.montantAPaye = reste
    createForm.value.montantPaye = reste
    createResaHint.value = `Réservation #${id} : total ${formatMoneyFc(totalDu)}, déjà payé ${formatMoneyFc(deja)}, reste dû ${formatMoneyFc(reste)}.`
  } catch (e) {
    createResaErr.value = e?.message || 'Impossible de charger cette réservation.'
  } finally {
    createResaLoading.value = false
  }
}

function openCreateModal() {
  if (!idSocieteForSave.value) {
    notify.warning('Société', 'Choisissez une société avant de créer un paiement.')
    return
  }
  resetCreateResaUi()
  const uid = sessionUserId.value
  createForm.value = {
    montantAPaye: 0,
    montantPaye: 0,
    methodePaiement: 'Mobile Money',
    referenceTransaction: '',
    statut: true,
    idUtilisateur: uid ?? 0,
    idReservation: '',
  }
  editPaiementId.value = 0
  showCreateModal.value = true
  void nextTick(async () => {
    const q = route.query?.idReservation ?? route.query?.idreservation
    if (q != null && String(q).trim() !== '') {
      createForm.value.idReservation = String(q).trim()
      await hydrateFromReservation(createForm.value.idReservation)
    }
  })
}

function closeCreateModal() {
  if (createSaving.value) return
  showCreateModal.value = false
  editPaiementId.value = 0
  resetCreateResaUi()
}

watch(
  () => createForm.value.idReservation,
  (v) => {
    clearTimeout(createResaDebounce)
    createResaDebounce = setTimeout(() => {
      if (!showCreateModal.value) return
      if (isEditMode.value) return
      void hydrateFromReservation(v)
    }, 450)
  }
)

function openEditModal(payment) {
  const id = Number(payment?.id) || 0
  if (!id) return
  const raw = payment?.raw && typeof payment.raw === 'object' ? payment.raw : {}
  const base = paiementRawToPutBody(raw)
  createForm.value = {
    montantAPaye: Number(base.montantAPaye) || 0,
    montantPaye: Number(base.montantPaye) || 0,
    methodePaiement: String(base.methodePaiement || ''),
    referenceTransaction: String(base.referenceTransaction || ''),
    statut: Boolean(base.statut),
    idUtilisateur: Number(base.idUtilisateur) || 0,
    idReservation: String(Number(base.idReservation) || ''),
  }
  resetCreateResaUi()
  editPaiementId.value = id
  showCreateModal.value = true
}

async function submitCreate() {
  const sid = idSocieteForSave.value
  if (!sid) return
  const uidForm = Number(createForm.value.idUtilisateur)
  const uidSession = Number(sessionUserId.value ?? 0)
  const idUtilisateur = Number.isFinite(uidForm) && uidForm > 0 ? uidForm : uidSession
  const idReservation = Number(String(createForm.value.idReservation ?? '').trim()) || 0

  if (Number(createForm.value.montantAPaye) <= 0 || Number(createForm.value.montantPaye) <= 0) {
    await notify.warning('Montants', 'Indiquez un montant à payer et un montant payé supérieurs à 0.')
    return
  }

  if (!Number.isFinite(idUtilisateur) || idUtilisateur <= 0) {
    await notify.warning(
      'Utilisateur',
      'Aucun id utilisateur (session). Saisissez un id utilisateur ou reconnectez-vous.',
    )
    return
  }

  const body = buildPaiementBody({
    montantAPaye: createForm.value.montantAPaye,
    montantPaye: createForm.value.montantPaye,
    methodePaiement: createForm.value.methodePaiement,
    referenceTransaction: createForm.value.referenceTransaction,
    statut: createForm.value.statut,
    idUtilisateur,
    idReservation,
    idSociete: sid,
  })
  createSaving.value = true
  try {
    const raw = isEditMode.value
      ? await updatePaiement(editPaiementId.value, body)
      : await createPaiement(body)
    notify.toast.success(isEditMode.value ? 'Paiement mis à jour' : 'Paiement enregistré')
    showCreateModal.value = false
    editPaiementId.value = 0
    await loadPayments()

    if (!isEditMode.value && hasEmittedBilletInPaiementResponse(raw)) {
      const billet = pickBilletEmisFromPaiementResponse(raw)
      const qr = pickQrCodeFromBillet(billet)
      const r = await Swal.fire({
        icon: 'success',
        title: 'Billet généré automatiquement',
        text: qr
          ? `Le paiement est complet. Code QR du billet :\n${qr}`
          : 'Le serveur a émis un billet lié à ce paiement.',
        confirmButtonText: 'Voir les billets',
        showCancelButton: true,
        cancelButtonText: 'Fermer',
        confirmButtonColor: '#465fff',
        cancelButtonColor: '#6b7280',
      })
      if (r.isConfirmed) {
        router.push({ name: 'AdminBillets' })
      }
    } else {
      const p = unwrapPaiementCreateResponse(raw)
      if (p) {
        const paye = Number(p.montantPaye ?? p.MontantPaye ?? 0)
        const du = Number(p.montantAPaye ?? p.MontantAPaye ?? 0)
        if (du > 0 && paye + 1e-6 < du) {
          await notify.info(
            'Paiement partiel',
            'Aucun billet pour l’instant : le billet n’est émis qu’une fois le montant dû entièrement payé (workflow serveur).',
          )
        }
      }
    }
  } catch (e) {
    await notify.error('Création impossible', e?.message || 'Erreur API')
  } finally {
    createSaving.value = false
  }
}

const showDetailModal = ref(false)
const detailLoading = ref(false)
const detailRaw = ref(null)
const detailClientName = ref('')
const detailId = computed(() => Number(detailRaw.value?.idPaiement ?? detailRaw.value?.IdPaiement) || 0)
function formatDateTimeFr(value) {
  const s = String(value || '').trim()
  if (!s) return ''
  const d = new Date(s)
  if (Number.isNaN(d.getTime())) return s
  return d.toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })
}

const detailView = computed(() => {
  const d = detailRaw.value && typeof detailRaw.value === 'object' ? detailRaw.value : {}
  const montantPaye = Number(d.montantPaye ?? d.MontantPaye) || 0
  const montantAPaye = Number(d.montantAPaye ?? d.MontantAPaye) || 0
  const resteAPaye = Number(d.resteAPaye ?? d.ResteAPaye ?? d.resteAPayeCalcule ?? d.ResteAPayeCalcule) || 0
  const statutBool =
    d.statut === true ||
    d.Statut === true ||
    String(d.statut ?? d.Statut ?? '').toLowerCase() === 'true'
  const estComplet = Boolean(d.estComplet ?? d.EstComplet ?? false)
  const estPartiel = Boolean(d.estPartiel ?? d.EstPartiel ?? false)
  let status = 'pending'
  if (statutBool) status = 'completed'
  if (estComplet) status = 'completed'
  return {
    clientName: detailClientName.value,
    montantPaye,
    montantAPaye,
    resteAPaye,
    methodePaiement: String(d.methodePaiement ?? d.MethodePaiement ?? '').trim(),
    referenceTransaction: String(d.referenceTransaction ?? d.ReferenceTransaction ?? '').trim(),
    idReservation: Number(d.idReservation ?? d.IdReservation) || 0,
    idUtilisateur: Number(d.idUtilisateur ?? d.IdUtilisateur) || 0,
    idBilletEmis: Number(d.idBilletEmis ?? d.IdBilletEmis) || 0,
    dateEmissionBillet: formatDateTimeFr(d.dateEmissionBillet ?? d.DateEmissionBillet),
    dateCreation: formatDateTimeFr(d.dateCreation ?? d.DateCreation),
    status,
    estComplet,
    estPartiel,
  }
})

async function viewPaymentDetails(payment) {
  showDetailModal.value = true
  detailRaw.value = null
  detailClientName.value = String(payment?.clientName || '').trim()
  detailLoading.value = true
  try {
    detailRaw.value = await getPaiement(payment.id)
  } catch (e) {
    await notify.error('Détails', e?.message || 'Impossible de charger ce paiement.')
    showDetailModal.value = false
  } finally {
    detailLoading.value = false
  }
}

function closeDetailModal() {
  showDetailModal.value = false
  detailRaw.value = null
  detailClientName.value = ''
  detailLoading.value = false
}
</script>
