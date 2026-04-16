<template>
  <DefaultLayout>
    <div class="space-y-4">
      <div class="rusa-gradient-header flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-2xl font-bold text-white">Billets</h1>
          <p class="text-primary-100">{{ headerIntro }}</p>
        </div>
        <button
          type="button"
          class="rusa-btn-primary shrink-0 bg-white text-primary-800 hover:bg-primary-50"
          @click="openCreate"
        >
          Émettre un billet
        </button>
      </div>

      <div class="rusa-card p-5">
        <div class="flex items-center gap-4">
          <div
            class="rounded-lg bg-primary-100/90 p-3 text-primary-700 dark:bg-primary-900/55 dark:text-primary-300"
          >
            <svg class="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <div>
            <p class="text-sm font-medium text-gray-600 dark:text-primary-300/80">Total billets</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ rows.length }}</p>
          </div>
        </div>
      </div>

      <div
        class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-primary-800/60 dark:bg-primary-950/70 dark:shadow-none md:p-5"
      >
        <div class="grid grid-cols-1 gap-4 md:grid-cols-3 md:items-end">
          <div>
            <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-primary-200/90">Rechercher</label>
            <input
              v-model="searchQuery"
              type="search"
              autocomplete="off"
              placeholder="Client, trajet, code QR, n° réservation…"
              class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-primary-700 dark:bg-primary-900/80 dark:text-gray-100 dark:placeholder:text-primary-500/50 dark:focus:border-primary-400 dark:focus:ring-primary-400"
            />
          </div>
          <div>
            <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-primary-200/90">Réservation #</label>
            <input
              v-model.trim="reservationFilter"
              type="text"
              inputmode="numeric"
              placeholder="Toutes"
              class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-primary-700 dark:bg-primary-900/80 dark:text-gray-100 dark:focus:border-primary-400 dark:focus:ring-primary-400"
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
          Chargement des billets…
        </p>
        <div v-else class="overflow-x-auto">
          <table class="w-full min-w-[900px] text-left text-sm">
            <thead class="border-b border-gray-200 bg-gray-50 dark:border-primary-800/60 dark:bg-primary-900/50">
              <tr>
                <th class="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-primary-300/70">
                  Billet
                </th>
                <th class="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-primary-300/70">
                  Réservation
                </th>
                <th class="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-primary-300/70">
                  Client
                </th>
                <th class="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-primary-300/70">
                  Trajet / départ
                </th>
                <th class="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-primary-300/70">
                  QR
                </th>
                <th class="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-primary-300/70">
                  Statut résa.
                </th>
                <th class="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-primary-300/70">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-primary-800/50">
              <tr
                v-for="b in filteredRows"
                :key="b.id"
                class="bg-white hover:bg-gray-50/80 dark:bg-primary-950/40 dark:hover:bg-primary-900/35"
              >
                <td class="whitespace-nowrap px-4 py-3">
                  <p class="font-medium text-gray-900 dark:text-gray-100">#{{ b.id }}</p>
                  <p class="text-gray-500 dark:text-primary-400/85">Gén. {{ b.dateGeneration }}</p>
                </td>
                <td class="whitespace-nowrap px-4 py-3 text-gray-900 dark:text-gray-100">
                  #{{ b.idReservation }}
                </td>
                <td class="min-w-0 px-4 py-3">
                  <p class="font-medium text-gray-900 dark:text-gray-100">{{ b.nomClient }}</p>
                  <p class="truncate text-gray-500 dark:text-primary-400/85">{{ b.clientContact }}</p>
                </td>
                <td class="min-w-0 px-4 py-3">
                  <p class="font-medium text-gray-900 dark:text-gray-100">{{ b.trajet }}</p>
                  <p class="text-gray-500 dark:text-primary-400/85">
                    {{ b.dateVoyage }} · {{ b.heure }}
                    <span v-if="b.numeroBus"> · Bus {{ b.numeroBus }}</span>
                  </p>
                  <p v-if="b.prix > 0" class="text-xs text-gray-500 dark:text-primary-400/80">
                    €{{ b.prix.toLocaleString('fr-FR') }}
                  </p>
                </td>
                <td class="max-w-[200px] px-4 py-3">
                  <code
                    class="block truncate rounded bg-gray-100 px-2 py-1 text-xs text-gray-800 dark:bg-primary-900/60 dark:text-primary-100"
                    :title="b.qrCode"
                  >
                    {{ truncateQr(b.qrCode) }}
                  </code>
                </td>
                <td class="whitespace-nowrap px-4 py-3">
                  <span class="rounded-full px-2 py-1 text-xs font-medium" :class="badgeClass(b.statutReservation)">
                    {{ statutLabel(b.statutReservation) }}
                  </span>
                </td>
                <td class="whitespace-nowrap px-4 py-3">
                  <button
                    type="button"
                    class="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-200"
                    @click="copyQr(b.qrCode)"
                  >
                    Copier QR
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
          <p
            v-if="!filteredRows.length"
            class="px-4 py-10 text-center text-sm text-gray-500 dark:text-primary-400/80"
          >
            Aucun billet à afficher.
          </p>
        </div>
      </div>

      <Teleport to="body">
        <div
          v-if="showModal"
          class="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="billet-modal-title"
          @click.self="closeModal"
        >
          <div
            class="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-gray-200 bg-white p-5 shadow-xl dark:border-primary-700 dark:bg-primary-950"
          >
            <h2 id="billet-modal-title" class="text-lg font-semibold text-gray-900 dark:text-white">
              Émission de billet
            </h2>
            <p class="mt-2 text-sm leading-relaxed text-gray-600 dark:text-primary-300/85">
              Associez ce billet à une réservation confirmée ou en cours de traitement. Le code QR et la date
              d’émission sont attribués automatiquement lors de la validation, conformément aux règles de traçabilité
              du système.
            </p>
            <div class="mt-5 space-y-4">
              <div>
                <label class="mb-1.5 block text-sm font-medium text-gray-800 dark:text-primary-100/90">
                  Réservation concernée
                </label>
                <p v-if="reservationsLoading" class="text-sm text-gray-500 dark:text-primary-400/80">
                  Chargement des dossiers réservation…
                </p>
                <select
                  v-else-if="reservationChoices.length"
                  v-model="reservationIdSelection"
                  class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 dark:border-primary-700 dark:bg-primary-900/80 dark:text-gray-100"
                >
                  <option value="" disabled>Choisir une réservation dans la liste</option>
                  <option v-for="o in reservationChoices" :key="o.id" :value="String(o.id)">
                    {{ o.label }}
                  </option>
                </select>
                <template v-else>
                  <input
                    v-model="reservationIdSelection"
                    type="text"
                    inputmode="numeric"
                    autocomplete="off"
                    placeholder="Numéro de réservation"
                    class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-900 placeholder:text-gray-400 dark:border-primary-700 dark:bg-primary-900/80 dark:text-gray-100 dark:placeholder:text-primary-500/45"
                  />
                  <p class="mt-2 text-xs leading-relaxed text-gray-500 dark:text-primary-400/80">
                    Aucun dossier n’a pu être chargé dans la liste. Saisissez le numéro de réservation figurant sur le
                    dossier client ou communiqué par le service réservations.
                  </p>
                </template>
              </div>
              <p v-if="!idSocieteForSave" class="text-sm leading-relaxed text-amber-800 dark:text-amber-200/90">
                L’émission nécessite un contexte société valide. En accès multi-sociétés, sélectionnez d’abord la
                société concernée ; dans le cas contraire, vérifiez le rattachement de votre compte ou contactez
                l’administrateur applicatif.
              </p>
            </div>
            <div class="mt-6 flex justify-end gap-3">
              <button
                type="button"
                class="rounded-lg border border-gray-200 bg-gray-100 px-4 py-2 text-gray-800 dark:border-primary-700 dark:bg-primary-900/60 dark:text-primary-100"
                @click="closeModal"
              >
                Annuler
              </button>
              <button
                type="button"
                :disabled="saving || !canSubmit"
                class="rounded-lg bg-primary-600 px-4 py-2 text-white hover:bg-primary-500 disabled:opacity-50"
                @click="submitCreate"
              >
                {{ saving ? 'Enregistrement…' : 'Valider l’émission' }}
              </button>
            </div>
          </div>
        </div>
      </Teleport>
    </div>
  </DefaultLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import DefaultLayout from '@/components/layout/DefaultLayout.vue'
import { useAdminModuleGreeting } from '@/composables/useAdminModuleGreeting'
import { useTenantSocieteId } from '@/composables/useTenantSocieteId'
import { listBilletsArray, mapBilletFromApi, createBillet } from '@/services/billetService'
import {
  listReservationsArray,
  mapReservationFromApi,
  mapApiStatutToUi,
} from '@/services/reservationService'
import { notify } from '@/utils/notify'

const headerIntro = useAdminModuleGreeting('bienvenue — suivi des billets et contrôle des émissions.')
const { idSocieteForSave } = useTenantSocieteId()

const rows = ref([])
const loading = ref(false)
const error = ref('')
const searchQuery = ref('')
const reservationFilter = ref('')

const showModal = ref(false)
const saving = ref(false)
/** Identifiant réservation choisi (chaîne vide = non sélectionné ; évite l’affichage « 0 » dans le select). */
const reservationIdSelection = ref('')
const reservationChoices = ref([])
const reservationsLoading = ref(false)

const filteredRows = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  const resF = reservationFilter.value.trim()
  const resNum = resF ? Number(resF) : NaN
  const hasResFilter = resF && Number.isFinite(resNum) && resNum > 0

  return rows.value.filter((b) => {
    if (hasResFilter && b.idReservation !== resNum) return false
    if (!q) return true
    const hay = [
      b.nomClient,
      b.clientContact,
      b.trajet,
      b.qrCode,
      String(b.id),
      String(b.idReservation),
      b.statutReservation,
    ]
      .join(' ')
      .toLowerCase()
    return hay.includes(q)
  })
})

function truncateQr(s) {
  const t = String(s || '')
  if (t.length <= 28) return t || '—'
  return `${t.slice(0, 14)}…${t.slice(-8)}`
}

function statutLabel(statutReservation) {
  const ui = mapApiStatutToUi(statutReservation)
  const labels = {
    confirmed: 'Confirmée',
    pending: 'En attente',
    cancelled: 'Annulée',
    completed: 'Terminée',
  }
  return labels[ui] || String(statutReservation || '—').slice(0, 24) || '—'
}

function badgeClass(statutReservation) {
  const ui = mapApiStatutToUi(statutReservation)
  const map = {
    confirmed: 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950/55 dark:text-emerald-200',
    pending: 'bg-primary-100 text-primary-900 dark:bg-primary-900/50 dark:text-primary-200',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-200',
    completed: 'bg-sky-100 text-sky-900 dark:bg-sky-950/50 dark:text-sky-200',
  }
  return map[ui] || 'bg-gray-100 text-gray-800 dark:bg-primary-900/40 dark:text-primary-200'
}

function resetFilters() {
  searchQuery.value = ''
  reservationFilter.value = ''
}

async function loadRows() {
  loading.value = true
  error.value = ''
  try {
    const list = await listBilletsArray()
    rows.value = list.map((r) => mapBilletFromApi(r))
  } catch (e) {
    error.value = e?.message || 'Impossible de charger les billets.'
    rows.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadRows()
})

async function loadReservationChoices() {
  reservationsLoading.value = true
  reservationChoices.value = []
  try {
    const list = await listReservationsArray()
    reservationChoices.value = list.map((r) => {
      const m = mapReservationFromApi(r)
      return {
        id: m.id,
        label: `#${m.id} — ${m.clientName} — ${m.departure} → ${m.arrival} (${m.date})`,
      }
    })
  } catch {
    reservationChoices.value = []
  } finally {
    reservationsLoading.value = false
  }
}

function openCreate() {
  reservationIdSelection.value = ''
  showModal.value = true
  loadReservationChoices()
}

function closeModal() {
  showModal.value = false
}

function generateQrLocal() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `bil-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
}

const canSubmit = computed(() => {
  const idRes = Number(String(reservationIdSelection.value).trim())
  const sid = idSocieteForSave.value
  return Number.isFinite(idRes) && idRes > 0 && sid != null && Number(sid) > 0
})

async function submitCreate() {
  if (!canSubmit.value) return
  saving.value = true
  try {
    const idReservation = Number(String(reservationIdSelection.value).trim())
    await createBillet({
      idReservation,
      qrCode: generateQrLocal(),
      dateGeneration: new Date().toISOString().slice(0, 10),
      idSociete: Number(idSocieteForSave.value),
    })
    notify.toast.success('Émission enregistrée')
    closeModal()
    await loadRows()
  } catch (e) {
    await notify.error('Émission impossible', e?.message || 'Une erreur est survenue. Veuillez réessayer.')
  } finally {
    saving.value = false
  }
}

async function copyQr(text) {
  const t = String(text || '')
  if (!t) return
  try {
    await navigator.clipboard.writeText(t)
    notify.toast.success('Code copié')
  } catch {
    await notify.error('Copie impossible', 'Presse-papiers non disponible.')
  }
}
</script>
