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
          <table class="w-full min-w-[640px] text-left text-sm">
            <thead class="border-b border-gray-200 bg-gray-50 dark:border-primary-800/60 dark:bg-primary-900/50">
              <tr>
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
                    {{ b.prix.toLocaleString('fr-CD', { maximumFractionDigits: 0 }) }} FC
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
                  <div class="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      class="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-200"
                      @click="viewBillet(b)"
                    >
                      Voir billet
                    </button>
                    <button
                      type="button"
                      class="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-200"
                      @click="downloadBillet(b)"
                    >
                      Télécharger
                    </button>
                  </div>
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
          v-if="showDetailModal && detailBillet"
          class="fixed inset-0 z-[200000] flex items-center justify-center bg-black/50 p-3 sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="billet-detail-title"
          @click.self="closeDetailModal"
        >
          <div
            class="flex max-h-[calc(100dvh-1.5rem)] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-primary-800/40 bg-primary-950 shadow-2xl ring-1 ring-primary-600/20"
          >
            <header
              class="relative flex shrink-0 items-center justify-between gap-2 bg-gradient-to-r from-primary-800 via-primary-700 to-primary-800 px-3 py-2.5 text-white sm:px-4 sm:py-3"
            >
              <button
                type="button"
                class="inline-flex size-9 shrink-0 items-center justify-center rounded-full text-white/90 transition hover:bg-white/15"
                aria-label="Fermer"
                @click="closeDetailModal"
              >
                <svg class="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h2 id="billet-detail-title" class="min-w-0 flex-1 text-center text-base font-bold tracking-tight">
                Détails du billet
              </h2>
              <span
                class="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-400/95 text-primary-950 ring-2 ring-white/35"
                aria-hidden="true"
                title="Billet"
              >
                <svg class="size-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                  />
                </svg>
              </span>
            </header>

            <div
              class="flex min-h-0 flex-1 flex-col overflow-hidden bg-gradient-to-b from-primary-950 via-primary-900 to-primary-950 px-2 pb-1.5 pt-1.5 sm:px-2.5 sm:pb-2 sm:pt-2"
            >
              <div
                class="flex min-h-0 w-full max-w-full flex-1 flex-col overflow-y-auto overscroll-y-contain rounded-2xl border border-primary-800/50 bg-white p-2.5 pb-4 shadow-lg dark:border-primary-700/50 dark:bg-primary-900/85 sm:p-3 sm:pb-5"
              >
                <div class="flex shrink-0 items-start justify-between gap-2">
                  <div class="min-w-0 flex-1 pr-1">
                    <p
                      class="text-[1rem] font-extrabold leading-[1.2] tracking-tight text-gray-900 dark:text-white sm:text-lg"
                    >
                      {{ billetRouteTitle(detailBillet.trajet) }}
                    </p>
                    <p class="mt-0.5 text-[10px] font-medium capitalize leading-snug text-gray-500 dark:text-primary-200/85 sm:text-[11px]">
                      {{ billetTravelDateLong(detailBillet) }}
                    </p>
                  </div>
                  <button
                    type="button"
                    class="shrink-0 rounded-full bg-primary-100 p-1.5 text-primary-700 ring-1 ring-primary-200/80 transition hover:bg-primary-200 dark:bg-primary-600/45 dark:text-primary-100 dark:ring-primary-500/40 dark:hover:bg-primary-600/65"
                    aria-label="Partager ou copier les infos"
                    @click="shareBilletHint"
                  >
                    <svg class="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                      />
                    </svg>
                  </button>
                </div>

                <div class="my-2 shrink-0 border-t border-dashed border-gray-200/90 dark:border-primary-600/55" />

                <div
                  class="shrink-0 rounded-xl border border-gray-100 bg-gray-50/95 px-2.5 py-2 dark:border-primary-800/55 dark:bg-primary-950/45"
                >
                  <div class="grid grid-cols-2 gap-x-2 gap-y-2 text-sm">
                    <div class="min-w-0">
                      <p class="text-[10px] font-semibold uppercase tracking-wide text-gray-400 dark:text-primary-400/80">
                        Nom du bus
                      </p>
                      <p class="mt-0.5 text-sm font-bold text-gray-900 dark:text-white">{{ billetBusLabel(detailBillet) }}</p>
                    </div>
                    <div class="min-w-0">
                      <p class="text-[10px] font-semibold uppercase tracking-wide text-gray-400 dark:text-primary-400/80">
                        Société
                      </p>
                      <p class="mt-0.5 text-sm font-bold tracking-tight text-gray-900 dark:text-white">
                        {{ societeLabel(detailBillet) }}
                      </p>
                    </div>
                    <div class="col-span-2 min-w-0 border-t border-gray-200/80 pt-1.5 dark:border-primary-800/50">
                      <p class="text-[10px] font-semibold uppercase tracking-wide text-gray-400 dark:text-primary-400/80">Départ</p>
                      <p class="mt-0.5 text-sm font-bold tabular-nums text-gray-900 dark:text-white sm:text-base">
                        {{ detailBillet.heure || '—' }}
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  class="mt-2 flex shrink-0 flex-wrap items-center justify-between gap-2 text-[10px] sm:flex-nowrap sm:text-[11px]"
                >
                  <div class="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1 text-gray-600 dark:text-primary-200/85">
                    <span class="text-gray-400 dark:text-primary-400/90">Émis</span>
                    <span class="font-semibold text-gray-800 dark:text-primary-50">{{ detailBillet.dateGeneration }}</span>
                  </div>
                  <span
                    class="inline-flex shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                    :class="badgeClass(detailBillet.statutReservation)"
                  >
                    {{ statutLabel(detailBillet.statutReservation) }}
                  </span>
                </div>

                <div
                  class="mt-1.5 shrink-0 rounded-lg border border-gray-100 bg-white px-2 py-1.5 dark:border-primary-800/45 dark:bg-primary-900/35"
                >
                  <p class="text-[10px] font-semibold uppercase tracking-wide text-gray-400 dark:text-primary-400/80">Client</p>
                  <p class="mt-0.5 truncate text-sm font-bold text-gray-900 dark:text-white">{{ detailBillet.nomClient }}</p>
                  <p class="truncate text-[11px] text-gray-500 dark:text-primary-300/85">{{ detailBillet.clientContact }}</p>
                </div>

                <div class="my-2 shrink-0 border-t border-dashed border-gray-200/90 dark:border-primary-600/55" />

                <div
                  class="flex shrink-0 items-center justify-between gap-3 rounded-xl bg-primary-50 px-2.5 py-1.5 dark:bg-primary-900/50 dark:ring-1 dark:ring-primary-700/40"
                >
                  <span class="text-xs font-bold text-gray-900 dark:text-white sm:text-sm">Total</span>
                  <span
                    v-if="billetMontantFc(detailBillet)"
                    class="text-base font-extrabold tabular-nums text-primary-600 dark:text-primary-400 sm:text-lg"
                  >
                    {{ billetMontantFc(detailBillet) }}
                  </span>
                  <span v-else class="text-sm font-medium text-gray-400 dark:text-primary-500">—</span>
                </div>

                <div
                  v-if="detailBillet.qrCode"
                  class="mx-auto mt-1.5 box-border shrink-0 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-primary-600/45 dark:bg-white"
                  :style="{
                    width: `${BILLET_QR_PX}px`,
                    height: `${BILLET_QR_PX}px`,
                  }"
                >
                  <img
                    v-if="qrImageDataUrl"
                    :src="qrImageDataUrl"
                    :width="BILLET_QR_PX"
                    :height="BILLET_QR_PX"
                    decoding="async"
                    draggable="false"
                    alt="Code QR du billet"
                    class="block max-h-none max-w-none flex-none select-none"
                    :style="{
                      width: `${BILLET_QR_PX}px`,
                      height: `${BILLET_QR_PX}px`,
                      imageRendering: 'crisp-edges',
                    }"
                  />
                  <div
                    v-else-if="qrGenerating"
                    class="flex h-full w-full flex-col items-center justify-center gap-1.5 px-2 text-center text-[10px] font-medium text-gray-500"
                  >
                    <span
                      class="inline-block size-6 animate-spin rounded-full border-2 border-primary-200 border-t-primary-600"
                      aria-hidden="true"
                    />
                    Préparation du QR…
                  </div>
                  <code
                    v-else
                    class="line-clamp-5 max-h-full w-full overflow-hidden break-all p-2 text-center text-[9px] leading-tight text-gray-600"
                  >
                    {{ detailBillet.qrCode }}
                  </code>
                </div>
                <p
                  class="mx-auto mt-2 max-w-[19rem] shrink-0 px-1 pb-1 text-balance text-center text-[10px] font-medium leading-snug text-primary-700 dark:text-primary-300"
                >
                  À l’embarquement ou au contrôle, présentez ce code QR.
                </p>
              </div>
            </div>

            <footer
              class="flex shrink-0 gap-2 border-t border-primary-800/60 bg-primary-950 px-3 py-2 sm:gap-3 sm:px-4 sm:py-2.5"
              style="padding-bottom: max(0.5rem, env(safe-area-inset-bottom, 0px))"
            >
              <button
                type="button"
                class="flex-1 rounded-xl border-2 border-primary-400/60 py-2 text-sm font-semibold text-primary-100 transition hover:border-primary-300 hover:bg-primary-900/60 sm:py-2.5"
                @click="closeDetailModal"
              >
                Fermer
              </button>
              <button
                v-if="detailBillet.qrCode || detailBillet.urlBillet"
                type="button"
                class="flex-1 rounded-xl bg-primary-500 py-2 text-sm font-bold text-primary-950 shadow-md transition hover:bg-primary-400 sm:py-2.5"
                @click="downloadBillet(detailBillet)"
              >
                Télécharger
              </button>
            </footer>
          </div>
        </div>
      </Teleport>

      <Teleport to="body">
        <div
          v-if="showModal"
          class="fixed inset-0 z-[200000] flex items-end justify-center bg-black/50 p-4 sm:items-center"
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
import { qrCodeToDataUrlWithLogo } from '@/utils/qrCodeWithLogo'
import { downloadBilletUnified } from '@/utils/billetDownload'

const headerIntro = useAdminModuleGreeting('bienvenue — suivi des billets et contrôle des émissions.')
const { idSocieteForSave } = useTenantSocieteId()

const rows = ref([])
const loading = ref(false)
const error = ref('')
const searchQuery = ref('')
const reservationFilter = ref('')

const showModal = ref(false)
const showDetailModal = ref(false)
const detailBillet = ref(null)
/** Taille QR (px) : tient dans la modale sans zone scroll interne. */
/** Taille QR (px) : compact pour laisser place à la note sous le pied visuel. */
const BILLET_QR_PX = 156

const qrImageDataUrl = ref('')
const qrGenerating = ref(false)
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

function titleCaseSegment(part) {
  const p = String(part || '').trim()
  if (!p) return ''
  return p.charAt(0).toLocaleUpperCase('fr-FR') + p.slice(1).toLowerCase()
}

/** Trajet lisible (tirets moyens + casse titre par ville). */
function billetRouteTitle(trajet) {
  const raw = String(trajet || '')
    .replace(/\s*→\s*/g, ' — ')
    .replace(/\s*->\s*/gi, ' — ')
    .trim()
  if (!raw) return '—'
  return raw
    .split(' — ')
    .map(titleCaseSegment)
    .join(' — ')
}

function billetTravelDateLong(b) {
  const d = b?.dateVoyage
  if (!d || d === '—') return '—'
  const parts = String(d).slice(0, 10).split('-')
  const y = Number(parts[0])
  const mo = Number(parts[1])
  const da = Number(parts[2])
  if (!Number.isFinite(y)) return String(d)
  const dt = new Date(y, (mo || 1) - 1, da || 1)
  const s = dt.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : String(d)
}

function billetBusLabel(b) {
  const n = String(b?.numeroBus || '').trim()
  return n ? `Bus ${n}` : '—'
}

function billetIdDisplay(b) {
  const id = Number(b?.id) || 0
  if (!id) return '—'
  return `RS-${String(id).padStart(6, '0')}`
}

function societeLabel(b) {
  return String(b?.nomSociete ?? b?.raw?.nomSociete ?? b?.raw?.NomSociete ?? 'Rusa Travel').trim() || 'Rusa Travel'
}

function billetMontantFc(b) {
  const v = Number(b?.prix) || 0
  if (v <= 0) return null
  return `${v.toLocaleString('fr-CD', { maximumFractionDigits: 0 })} FC`
}

async function viewBillet(b) {
  detailBillet.value = b
  showDetailModal.value = true
  qrImageDataUrl.value = ''
  qrGenerating.value = false
  const q = String(b?.qrCode || '').trim()
  if (!q) return
  qrGenerating.value = true
  try {
    qrImageDataUrl.value = await qrCodeToDataUrlWithLogo(q, {
      width: BILLET_QR_PX,
      margin: 2,
      color: { dark: '#0f172a', light: '#ffffff' },
    })
  } catch {
    qrImageDataUrl.value = ''
  } finally {
    qrGenerating.value = false
  }
}

function closeDetailModal() {
  showDetailModal.value = false
  detailBillet.value = null
  qrImageDataUrl.value = ''
  qrGenerating.value = false
}

function shareBilletHint() {
  notify.toast.info('Utilisez le partage du navigateur ou le bouton « Télécharger ».')
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

function triggerDownloadUrl(url, filename = '') {
  const a = document.createElement('a')
  a.href = url
  if (filename) a.download = filename
  a.target = '_blank'
  a.rel = 'noopener'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

function safeText(v, fallback = '—') {
  const s = String(v ?? '').trim()
  return s || fallback
}

function ticketDateLabel(billet) {
  const raw = String(billet?.dateVoyage || '').trim()
  if (!raw || raw === '—') return '—'
  const d = new Date(raw)
  if (Number.isNaN(d.getTime())) return raw.slice(0, 10)
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}

function fileSafePart(v, fallback = 'billet') {
  const s = String(v || '').trim().toLowerCase()
  if (!s) return fallback
  return s.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || fallback
}

function buildBilletStyledSvg(billet, qrDataUrl) {
  const company = 'RUSA TRAVEL'
  const passenger = safeText(billet?.nomClient, 'Passager')
  const route = safeText(billet?.trajet, 'Trajet')
  const dateVoy = ticketDateLabel(billet)
  const departTime = safeText(billet?.heure, '—')
  const bus = safeText(billetBusLabel(billet), '—')
  const seat = safeText(billet?.idReservation ? `R-${billet.idReservation}` : '', '—')
  const ref = safeText(billetIdDisplay(billet), '—')
  const amount = safeText(billetMontantFc(billet), '—')
  const qrSrc = qrDataUrl || ''

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="430" viewBox="0 0 1200 430">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#f8fafc"/>
      <stop offset="100%" stop-color="#eef2ff"/>
    </linearGradient>
    <style>
      .title { font: 700 34px Arial, sans-serif; fill: #0f172a; letter-spacing: 1px; }
      .sub { font: 600 18px Arial, sans-serif; fill: #334155; letter-spacing: .5px; }
      .label { font: 700 14px Arial, sans-serif; fill: #64748b; letter-spacing: .8px; }
      .value { font: 700 24px Arial, sans-serif; fill: #0f172a; }
      .small { font: 600 16px Arial, sans-serif; fill: #0f172a; }
    </style>
  </defs>
  <rect x="10" y="10" width="1180" height="410" rx="24" fill="url(#bg)" stroke="#cbd5e1" stroke-width="2"/>
  <rect x="20" y="20" width="920" height="390" rx="18" fill="#ffffff" stroke="#e2e8f0"/>
  <rect x="952" y="20" width="228" height="390" rx="18" fill="#f8fafc" stroke="#e2e8f0"/>
  <line x1="940" y1="30" x2="940" y2="400" stroke="#94a3b8" stroke-dasharray="7 7"/>

  <text x="54" y="72" class="title">${company}</text>
  <text x="54" y="102" class="sub">BILLET DE VOYAGE</text>

  <text x="54" y="150" class="label">PASSAGER</text>
  <text x="54" y="180" class="value">${passenger}</text>

  <text x="54" y="222" class="label">TRAJET</text>
  <text x="54" y="252" class="value">${route}</text>

  <text x="54" y="294" class="label">DATE</text>
  <text x="54" y="322" class="small">${dateVoy}</text>

  <text x="270" y="294" class="label">DEPART</text>
  <text x="270" y="322" class="small">${departTime}</text>

  <text x="440" y="294" class="label">BUS</text>
  <text x="440" y="322" class="small">${bus}</text>

  <text x="560" y="294" class="label">SIEGE/REF</text>
  <text x="560" y="322" class="small">${seat}</text>

  <text x="730" y="294" class="label">PRIX</text>
  <text x="730" y="322" class="small">${amount}</text>

  <text x="54" y="372" class="label">REFERENCE BILLET</text>
  <text x="54" y="398" class="small">${ref}</text>

  <text x="972" y="70" class="label">BOARDING PASS</text>
  <rect x="972" y="90" width="188" height="188" rx="8" fill="#fff" stroke="#cbd5e1"/>
  ${qrSrc ? `<image href="${qrSrc}" x="978" y="96" width="176" height="176"/>` : ''}
  <text x="972" y="315" class="label">PASSAGER</text>
  <text x="972" y="338" class="small">${passenger}</text>
  <text x="972" y="366" class="label">REF</text>
  <text x="972" y="390" class="small">${ref}</text>
</svg>`.trim()
}

async function svgToPngDataUrl(svg, width = 1200, height = 430) {
  const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  try {
    const img = await new Promise((resolve, reject) => {
      const i = new Image()
      i.onload = () => resolve(i)
      i.onerror = reject
      i.src = url
    })
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas indisponible')
    ctx.drawImage(img, 0, 0, width, height)
    return canvas.toDataURL('image/png')
  } finally {
    URL.revokeObjectURL(url)
  }
}

async function ensureBilletQrDataUrl(billet) {
  const q = String(billet?.qrCode || '').trim()
  if (!q) return ''
  if (qrImageDataUrl.value && detailBillet.value?.id === billet?.id) return qrImageDataUrl.value
  return qrCodeToDataUrlWithLogo(q, {
    width: 512,
    margin: 2,
    color: { dark: '#0f172a', light: '#ffffff' },
  })
}

async function downloadBillet(billet) {
  const b = billet && typeof billet === 'object' ? billet : null
  if (!b) return
  try {
    await downloadBilletUnified(b, 'billet')
    notify.toast.success('Billet téléchargé')
  } catch (e) {
    await notify.error('Téléchargement impossible', e?.message || 'Impossible de télécharger le billet.')
  }
}
</script>
