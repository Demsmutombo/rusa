<template>
  <DefaultLayout>
    <div class="space-y-4">
      <div class="rusa-gradient-header flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div class="min-w-0 pr-2">
          <router-link
            v-if="isSuperAdminContext"
            to="/super-admin"
            class="mb-1 inline-block text-xs font-medium text-primary-100 hover:text-white sm:mb-2"
          >
            ← Tableau de bord Super-Admin
          </router-link>
          <router-link
            v-else
            to="/admin"
            class="mb-1 inline-block text-xs font-medium text-primary-100 hover:text-white sm:mb-2"
          >
            ← Tableau de bord Admin
          </router-link>
          <h1 class="text-xl font-bold leading-tight text-white sm:text-2xl">Voyages</h1>
          <p class="mt-1 text-sm text-primary-100 sm:text-base">
            {{ headerIntro }}
          </p>
        </div>
        <button
          type="button"
          class="shrink-0 rounded-lg bg-white/15 px-4 py-2.5 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white/25"
          @click="openCreate"
        >
          Nouveau voyage
        </button>
      </div>

      <p
        v-if="error"
        class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/50 dark:text-red-200"
      >
        {{ error }}
      </p>

      <div
        class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-primary-800/60 dark:bg-primary-950/70 dark:shadow-none"
      >
        <div
          v-if="loading"
          class="px-4 py-10 text-center text-sm text-gray-500 dark:text-primary-400/80"
        >
          Chargement…
        </div>
        <div
          v-else-if="!rows.length"
          class="px-4 py-10 text-center text-sm text-gray-500 dark:text-primary-400/80"
        >
          Aucun voyage.
        </div>
        <template v-else>
          <AdminListToolbar
            v-if="rows.length"
            :search="searchQuery"
            :statut="statutFilter"
            :filtered-count="filteredRows.length"
            :total-count="rows.length"
            placeholder="Date, trajet, bus, prix, société…"
            @update:search="searchQuery = $event"
            @update:statut="statutFilter = $event"
            @clear="clearFilters"
          />
          <div
            v-if="rows.length && !filteredRows.length"
            class="px-4 py-12 text-center text-sm text-gray-500 dark:text-primary-400/80"
          >
            Aucun résultat pour cette recherche ou ce filtre de statut.
          </div>
          <template v-else-if="filteredRows.length">
          <div class="hidden overflow-x-auto md:block">
            <table class="w-full min-w-[720px] text-left text-sm">
              <thead class="border-b border-gray-200 bg-gray-50 dark:border-primary-800/60 dark:bg-primary-900/50">
                <tr>
                  <th class="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-primary-300/70">
                    Date
                  </th>
                  <th class="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-primary-300/70">
                    Heure
                  </th>
                  <th class="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-primary-300/70">
                    Trajet
                  </th>
                  <th class="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-primary-300/70">
                    Bus
                  </th>
                  <th class="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-primary-300/70">
                    Prix
                  </th>
                  <th class="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-primary-300/70">
                    Société
                  </th>
                  <th class="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-primary-300/70">
                    Statut
                  </th>
                  <th class="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-primary-300/70">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 dark:divide-primary-800/50">
                <tr
                  v-for="r in filteredRows"
                  :key="voyageId(r)"
                  class="hover:bg-gray-50/80 dark:hover:bg-primary-900/35"
                >
                  <td class="whitespace-nowrap px-4 py-3 text-gray-800 dark:text-gray-200">
                    {{ formatDateDepartCell(r.dateDepart ?? r.DateDepart) }}
                  </td>
                  <td class="whitespace-nowrap px-4 py-3 tabular-nums text-gray-800 dark:text-gray-200">
                    {{ ticksToHHmm(r.heureDepart ?? r.HeureDepart) }}
                  </td>
                  <td class="max-w-[200px] px-4 py-3 font-medium text-gray-900 dark:text-white">
                    <span class="line-clamp-2">{{ trajetLabel(r) }}</span>
                  </td>
                  <td class="max-w-[180px] px-4 py-3 text-gray-700 dark:text-primary-200/90">
                    <span class="line-clamp-2">{{ busLabel(r) }}</span>
                  </td>
                  <td class="whitespace-nowrap px-4 py-3 tabular-nums text-gray-800 dark:text-gray-200">
                    {{ formatPrix(r.prix ?? r.Prix) }}
                  </td>
                  <td class="max-w-[160px] px-4 py-3 text-gray-700 dark:text-primary-200/90">
                    <span class="line-clamp-2">{{ r.nomSociete ?? r.NomSociete ?? '—' }}</span>
                  </td>
                  <td class="px-4 py-3">
                    <span
                      class="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium"
                      :class="
                        rowStatut(r)
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300'
                          : 'bg-gray-100 text-gray-700 dark:bg-primary-800/60 dark:text-primary-200'
                      "
                    >
                      {{ rowStatut(r) ? 'actif' : 'inactif' }}
                    </span>
                  </td>
                  <td class="whitespace-nowrap px-4 py-3 font-medium">
                    <button
                      type="button"
                      class="mr-3 text-gray-600 hover:text-gray-800 dark:text-primary-300 dark:hover:text-primary-200"
                      @click="openView(r)"
                    >
                      Voir
                    </button>
                    <button
                      type="button"
                      class="mr-3 text-primary-600 hover:text-primary-500 dark:text-primary-400"
                      @click="openEdit(r)"
                    >
                      Modifier
                    </button>
                    <button
                      type="button"
                      :disabled="togglingId === voyageId(r)"
                      :class="
                        rowStatut(r)
                          ? 'text-amber-600 hover:text-amber-700 dark:text-amber-400'
                          : 'text-emerald-600 hover:text-emerald-700 dark:text-emerald-400'
                      "
                      class="transition disabled:opacity-50"
                      @click="toggleStatut(r)"
                    >
                      {{ rowStatut(r) ? 'Désactiver' : 'Réactiver' }}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="divide-y divide-gray-200 dark:divide-primary-800/50 md:hidden">
            <article
              v-for="r in filteredRows"
              :key="`m-${voyageId(r)}`"
              class="space-y-3 p-4"
            >
              <div class="flex flex-wrap items-start justify-between gap-2">
                <div class="min-w-0">
                  <p class="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-primary-400/80">
                    Départ
                  </p>
                  <p class="text-base font-semibold text-gray-900 dark:text-white">
                    {{ formatDateDepartCell(r.dateDepart ?? r.DateDepart) }}
                    <span class="font-normal text-gray-600 dark:text-primary-300">·</span>
                    <span class="tabular-nums">{{ ticksToHHmm(r.heureDepart ?? r.HeureDepart) }}</span>
                  </p>
                </div>
                <span
                  class="inline-flex shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium"
                  :class="
                    rowStatut(r)
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300'
                      : 'bg-gray-100 text-gray-700 dark:bg-primary-800/60 dark:text-primary-200'
                  "
                >
                  {{ rowStatut(r) ? 'actif' : 'inactif' }}
                </span>
              </div>
              <dl class="grid gap-2 text-sm">
                <div class="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
                  <dt class="text-gray-500 dark:text-primary-400/80">Trajet</dt>
                  <dd class="font-medium text-gray-900 dark:text-white">{{ trajetLabel(r) }}</dd>
                </div>
                <div class="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
                  <dt class="text-gray-500 dark:text-primary-400/80">Bus</dt>
                  <dd class="text-gray-800 dark:text-gray-200">{{ busLabel(r) }}</dd>
                </div>
                <div class="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
                  <dt class="text-gray-500 dark:text-primary-400/80">Prix</dt>
                  <dd class="tabular-nums text-gray-800 dark:text-gray-200">{{ formatPrix(r.prix ?? r.Prix) }}</dd>
                </div>
                <div class="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
                  <dt class="text-gray-500 dark:text-primary-400/80">Société</dt>
                  <dd class="text-gray-800 dark:text-gray-200">{{ r.nomSociete ?? r.NomSociete ?? '—' }}</dd>
                </div>
              </dl>
              <div class="flex flex-wrap gap-2 border-t border-gray-100 pt-3 dark:border-primary-800/50">
                <button
                  type="button"
                  class="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-800 dark:border-primary-700 dark:bg-primary-900/40 dark:text-primary-200"
                  @click="openView(r)"
                >
                  Voir
                </button>
                <button
                  type="button"
                  class="rounded-lg border border-primary-200 bg-primary-50 px-3 py-2 text-sm font-medium text-primary-800 dark:border-primary-700 dark:bg-primary-900/50 dark:text-primary-200"
                  @click="openEdit(r)"
                >
                  Modifier
                </button>
                <button
                  type="button"
                  :disabled="togglingId === voyageId(r)"
                  class="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium transition disabled:opacity-50 dark:border-primary-700 dark:bg-primary-900/40"
                  :class="
                    rowStatut(r)
                      ? 'text-amber-800 dark:text-amber-300'
                      : 'text-emerald-800 dark:text-emerald-300'
                  "
                  @click="toggleStatut(r)"
                >
                  {{ rowStatut(r) ? 'Désactiver' : 'Réactiver' }}
                </button>
              </div>
            </article>
          </div>
          </template>
        </template>
      </div>

      <Teleport to="body">
        <div
          v-if="showModal"
          class="fixed inset-0 z-[200000] flex items-center justify-center overflow-y-auto bg-gray-900/55 p-4 backdrop-blur-sm dark:bg-black/75"
          @click.self="closeModal"
        >
          <div
            class="my-auto w-full max-w-lg rounded-xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-primary-800/60 dark:bg-primary-950"
          >
            <h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              {{
                viewOnly
                  ? 'Détails du voyage'
                  : editing
                    ? 'Modifier le voyage'
                    : 'Nouveau voyage'
              }}
            </h3>
            <div class="space-y-3">
              <div v-if="viewOnly && viewContext" class="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-sm dark:border-primary-800/60 dark:bg-primary-900/40">
                <p class="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-primary-400/80">Société</p>
                <p class="font-medium text-gray-900 dark:text-white">{{ viewContext.nomSociete ?? viewContext.NomSociete ?? '—' }}</p>
              </div>
              <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-primary-200/90">Date de départ *</label>
                  <input
                    v-model="form.dateDepart"
                    type="date"
                    :readonly="viewOnly"
                    :class="inputClass(viewOnly)"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-primary-200/90">Heure de départ *</label>
                  <input
                    v-model="form.heureDepart"
                    type="time"
                    :readonly="viewOnly"
                    :class="inputClass(viewOnly)"
                  />
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-primary-200/90">Destination *</label>
                <select
                  v-if="!viewOnly"
                  v-model.number="form.idDestination"
                  :class="inputClass(false)"
                >
                  <option :value="0" disabled>Choisir…</option>
                  <option v-for="d in destinationSelectOptions" :key="destId(d)" :value="destId(d)">
                    {{ destLabel(d) }}
                  </option>
                </select>
                <p v-else class="mt-1 text-sm text-gray-800 dark:text-gray-200">{{ trajetLabel(viewContext) }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-primary-200/90">Bus *</label>
                <select v-if="!viewOnly" v-model.number="form.idBus" :class="inputClass(false)">
                  <option :value="0" disabled>Choisir…</option>
                  <option v-for="b in busSelectOptions" :key="busId(b)" :value="busId(b)">
                    {{ busOptionLabel(b) }}
                  </option>
                </select>
                <div v-else class="mt-1 space-y-1.5 rounded-lg border border-gray-100 bg-gray-50/80 px-3 py-2.5 text-sm dark:border-primary-800/60 dark:bg-primary-900/40">
                  <p v-if="marqueBusLiee(viewContext)" class="text-gray-800 dark:text-gray-200">
                    <span class="font-medium text-gray-600 dark:text-primary-300/90">Marque :</span>
                    {{ marqueBusLiee(viewContext) }}
                  </p>
                  <p class="text-gray-800 dark:text-gray-200">
                    <span class="font-medium text-gray-600 dark:text-primary-300/90">Type :</span>
                    {{ viewContext.libelleTypeBus ?? viewContext.LibelleTypeBus ?? '—' }}
                  </p>
                  <p class="tabular-nums text-gray-800 dark:text-gray-200">
                    <span class="font-medium text-gray-600 dark:text-primary-300/90">N° de bus :</span>
                    {{ numeroBusDisplay(viewContext) }}
                  </p>
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-primary-200/90">Prix *</label>
                <input
                  v-model.number="form.prix"
                  type="number"
                  min="0"
                  step="1"
                  :readonly="viewOnly"
                  :class="inputClass(viewOnly)"
                />
              </div>
              <div v-if="viewOnly" class="flex items-center gap-2">
                <span class="text-sm font-medium text-gray-700 dark:text-primary-200/90">Statut</span>
                <span
                  class="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium"
                  :class="
                    form.statut
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300'
                      : 'bg-gray-100 text-gray-700 dark:bg-primary-800/60 dark:text-primary-200'
                  "
                >
                  {{ form.statut ? 'actif' : 'inactif' }}
                </span>
              </div>
              <label v-else-if="editing" class="flex items-center gap-2">
                <input v-model="form.statut" type="checkbox" class="size-4 rounded border-gray-300 text-primary-600" />
                <span class="text-sm text-gray-700 dark:text-primary-200/90">Actif</span>
              </label>
            </div>
            <div class="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <template v-if="viewOnly">
                <button
                  type="button"
                  class="w-full rounded-lg bg-primary-600 px-4 py-2.5 text-white hover:bg-primary-500 sm:w-auto"
                  @click="closeModal"
                >
                  Fermer
                </button>
              </template>
              <template v-else>
                <button
                  type="button"
                  class="w-full rounded-lg border border-gray-200 bg-gray-100 px-4 py-2.5 text-gray-800 dark:border-primary-700 dark:bg-primary-900/60 dark:text-primary-100 sm:w-auto"
                  @click="closeModal"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  :disabled="saving"
                  class="w-full rounded-lg bg-primary-600 px-4 py-2.5 text-white hover:bg-primary-500 disabled:opacity-50 sm:w-auto"
                  @click="save"
                >
                  {{ saving ? '…' : 'Enregistrer' }}
                </button>
              </template>
            </div>
          </div>
        </div>
      </Teleport>
    </div>
  </DefaultLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import DefaultLayout from '@/components/layout/DefaultLayout.vue'
import AdminListToolbar from '@/components/admin/AdminListToolbar.vue'
import { useAdminListSearch } from '@/composables/useAdminListSearch'
import { useTenantSocieteId } from '@/composables/useTenantSocieteId'
import { useAdminModuleGreeting } from '@/composables/useAdminModuleGreeting'
import { listDestinationsArray } from '@/services/destinationService'
import { listBusArray } from '@/services/busService'
import {
  listVoyagesArray,
  createVoyage,
  updateVoyage,
  ticksToHHmm,
  extractTicks,
  formHeureToApiHeureDepart,
  heureDepartToApiString,
} from '@/services/voyageService'
import { notify } from '@/utils/notify'

const route = useRoute()
const { idSocieteForSave } = useTenantSocieteId()
const headerIntro = useAdminModuleGreeting('bienvenue — départs, bus et prix ci-dessous.')

const isSuperAdminContext = computed(() => route.path.startsWith('/super-admin'))

const rows = ref([])
const buses = ref([])
const destinations = ref([])
const loading = ref(false)
const error = ref('')
const showModal = ref(false)
const editing = ref(false)
const viewOnly = ref(false)
const viewContext = ref(null)
const saving = ref(false)
const togglingId = ref(null)

/** Actif pour bus / destination (liste API). */
function refEntityActif(x) {
  if (!x || typeof x !== 'object') return false
  const v = x.statut ?? x.Statut
  return !(v === false || v === 0 || v === '0' || String(v).toLowerCase() === 'false')
}

/** Formulaire : uniquement entités actives, sauf la ligne déjà choisie (édition d’un voyage existant). */
const busSelectOptions = computed(() => {
  const list = Array.isArray(buses.value) ? buses.value : []
  const sel = Number(form.value.idBus) || 0
  return list.filter((b) => refEntityActif(b) || Number(busId(b)) === sel)
})

const destinationSelectOptions = computed(() => {
  const list = Array.isArray(destinations.value) ? destinations.value : []
  const sel = Number(form.value.idDestination) || 0
  return list.filter((d) => refEntityActif(d) || Number(destId(d)) === sel)
})

const form = ref({
  id: 0,
  idSociete: 0,
  dateDepart: '',
  heureDepart: '06:00',
  prix: 0,
  idBus: 0,
  idDestination: 0,
  statut: true,
})

function inputClass(readonly) {
  return [
    'mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 dark:border-primary-700 dark:bg-primary-900/80 dark:text-gray-100',
    readonly
      ? 'cursor-default bg-gray-50 dark:bg-primary-900/50'
      : 'bg-white',
  ]
}

function voyageId(r) {
  return r.id ?? r.Id
}

function rowStatut(r) {
  const v = r.statut ?? r.Statut
  return !(v === false || v === 0 || v === '0' || String(v).toLowerCase() === 'false')
}

function busId(b) {
  return b.idBus ?? b.IdBus
}

function busOptionLabel(b) {
  const num = b.numeroBus ?? b.NumeroBus
  const hasNum = !(num == null || num === '' || (typeof num === 'string' && String(num).trim() === ''))
  const numSuffix = hasNum ? ` — N° ${num}` : ''
  const name = String(b.marques ?? b.Marques ?? '').trim()
  const typ = String(b.libelleTypeBus ?? b.LibelleTypeBus ?? '').trim()
  if (name) {
    return typ ? `${name} — ${typ}${numSuffix}` : `${name}${numSuffix}`
  }
  if (hasNum) {
    return typ ? `${typ} — N° ${num}` : `N° ${num}`
  }
  return typ || '—'
}

/** Marque du bus (parc chargé) quand l’API voyage ne la renvoie pas. */
function marqueBusLiee(r) {
  const id = Number(r?.idBus ?? r?.IdBus)
  if (!Number.isFinite(id) || id <= 0) return null
  const b = buses.value.find((x) => Number(busId(x)) === id)
  if (!b) return null
  const m = String(b.marques ?? b.Marques ?? '').trim()
  return m || null
}

/** Libellé bus : marque (si connue), type, numéro métier « N° » (pas l’id technique idBus). */
function busLabel(r) {
  if (!r) return '—'
  const marque = marqueBusLiee(r)
  const typ = r.libelleTypeBus ?? r.LibelleTypeBus
  const typStr = typ != null && String(typ).trim() !== '' ? String(typ).trim() : null
  const num = r.numeroBus ?? r.NumeroBus
  const hasNum = !(num == null || num === '' || (typeof num === 'string' && String(num).trim() === ''))
  const numStr = hasNum ? `N° ${num}` : null
  const parts = []
  if (marque) parts.push(marque)
  if (typStr) parts.push(typStr)
  if (numStr) parts.push(numStr)
  if (parts.length) return parts.join(' · ')
  return '—'
}

function numeroBusDisplay(r) {
  if (!r) return '—'
  const num = r.numeroBus ?? r.NumeroBus
  if (num == null || num === '' || (typeof num === 'string' && String(num).trim() === '')) return '—'
  return String(num)
}

function destId(d) {
  return d.idDestination ?? d.IdDestination
}

function destLabel(d) {
  const a = d.villeDepart ?? d.VilleDepart ?? ''
  const b = d.villeArrivee ?? d.VilleArrivee ?? ''
  return `${a} → ${b}`.trim() || `Destination #${destId(d)}`
}

function trajetLabel(r) {
  if (!r) return '—'
  const vd = r.villeDepart ?? r.VilleDepart
  const va = r.villeArrivee ?? r.VilleArrivee
  if (vd || va) return `${vd ?? '—'} → ${va ?? '—'}`
  return '—'
}

function formatPrix(v) {
  const n = Number(v)
  if (!Number.isFinite(n)) return '—'
  return n.toLocaleString('fr-FR', { maximumFractionDigits: 0 })
}

/** Affiche la partie calendaire YYYY-MM-DD renvoyée par l’API (évite les décalages fuseau sur minuit UTC). */
function formatDateDepartCell(dateDepart) {
  const s = String(dateDepart || '')
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (!m) return '—'
  return `${m[3]}/${m[2]}/${m[1]}`
}

function voyageTextMatch(r, q) {
  const dateStr = formatDateDepartCell(r.dateDepart ?? r.DateDepart).toLowerCase()
  const rawDate = String(r.dateDepart ?? r.DateDepart ?? '').toLowerCase()
  const heure = ticksToHHmm(r.heureDepart ?? r.HeureDepart).toLowerCase()
  const blob = [
    dateStr,
    rawDate,
    heure,
    trajetLabel(r),
    busLabel(r),
    formatPrix(r.prix ?? r.Prix),
    r.nomSociete,
    r.NomSociete,
    r.villeDepart,
    r.VilleDepart,
    r.villeArrivee,
    r.VilleArrivee,
  ]
    .map((x) => String(x ?? '').toLowerCase())
    .join(' ')
  return blob.includes(q)
}

const { searchQuery, statutFilter, filteredRows, clearFilters } = useAdminListSearch(rows, voyageTextMatch, {
  rowStatut,
})

function dateDepartFromApiToInput(dateDepart) {
  const s = String(dateDepart || '')
  const m = s.match(/^(\d{4}-\d{2}-\d{2})/)
  return m ? m[1] : ''
}

function dateInputToIsoMidnightUtc(dateStr) {
  const m = String(dateStr || '').match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!m) return null
  const y = Number(m[1])
  const mo = Number(m[2])
  const d = Number(m[3])
  if (!Number.isFinite(y) || !Number.isFinite(mo) || !Number.isFinite(d)) return null
  return new Date(Date.UTC(y, mo - 1, d, 0, 0, 0, 0)).toISOString()
}

async function loadRefs() {
  const [b, dest] = await Promise.all([listBusArray(), listDestinationsArray()])
  buses.value = Array.isArray(b) ? b : []
  destinations.value = Array.isArray(dest) ? dest : []
}

function sortVoyages(list) {
  return [...list].sort((a, b) => {
    const da = String(a.dateDepart ?? a.DateDepart ?? '')
    const db = String(b.dateDepart ?? b.DateDepart ?? '')
    if (da !== db) return db.localeCompare(da)
    return extractTicks(b.heureDepart ?? b.HeureDepart) - extractTicks(a.heureDepart ?? a.HeureDepart)
  })
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    await loadRefs()
    const list = await listVoyagesArray()
    rows.value = sortVoyages(list)
  } catch (e) {
    error.value = e?.message || 'Erreur chargement'
    rows.value = []
  } finally {
    loading.value = false
  }
}

function openView(r) {
  viewOnly.value = true
  viewContext.value = r
  editing.value = false
  form.value = {
    id: voyageId(r),
    idSociete: Number(r.idSociete ?? r.IdSociete) || 0,
    dateDepart: dateDepartFromApiToInput(r.dateDepart ?? r.DateDepart),
    heureDepart: ticksToHHmm(r.heureDepart ?? r.HeureDepart),
    prix: Number(r.prix ?? r.Prix) || 0,
    idBus: r.idBus ?? r.IdBus ?? 0,
    idDestination: r.idDestination ?? r.IdDestination ?? 0,
    statut: rowStatut(r),
  }
  showModal.value = true
}

function openCreate() {
  viewOnly.value = false
  viewContext.value = null
  editing.value = false
  const t = new Date()
  const y = t.getFullYear()
  const mo = String(t.getMonth() + 1).padStart(2, '0')
  const da = String(t.getDate()).padStart(2, '0')
  form.value = {
    id: 0,
    idSociete: 0,
    dateDepart: `${y}-${mo}-${da}`,
    heureDepart: '06:00',
    prix: 0,
    idBus: 0,
    idDestination: 0,
    statut: true,
  }
  showModal.value = true
}

function openEdit(r) {
  viewOnly.value = false
  viewContext.value = null
  editing.value = true
  form.value = {
    id: voyageId(r),
    idSociete: Number(r.idSociete ?? r.IdSociete) || 0,
    dateDepart: dateDepartFromApiToInput(r.dateDepart ?? r.DateDepart),
    heureDepart: ticksToHHmm(r.heureDepart ?? r.HeureDepart),
    prix: Number(r.prix ?? r.Prix) || 0,
    idBus: r.idBus ?? r.IdBus ?? 0,
    idDestination: r.idDestination ?? r.IdDestination ?? 0,
    statut: rowStatut(r),
  }
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  viewOnly.value = false
  viewContext.value = null
}

function buildPayloadFromForm() {
  const iso = dateInputToIsoMidnightUtc(form.value.dateDepart)
  if (!iso) return null
  const prix = Number(form.value.prix)
  if (!Number.isFinite(prix) || prix < 0) return null
  const idBus = Number(form.value.idBus)
  const idDestination = Number(form.value.idDestination)
  if (!Number.isFinite(idBus) || idBus <= 0 || !Number.isFinite(idDestination) || idDestination <= 0) return null
  return {
    dateDepart: iso,
    heureDepart: formHeureToApiHeureDepart(form.value.heureDepart),
    prix,
    idBus,
    idDestination,
    statut: form.value.statut !== false,
  }
}

async function save() {
  if (viewOnly.value) return
  const base = buildPayloadFromForm()
  if (!base) {
    await notify.warning('Saisie incomplète', 'Date, heure, destination, bus et prix valides sont obligatoires.')
    return
  }
  if (!editing.value) {
    const sid = idSocieteForSave.value
    if (sid == null) {
      await notify.warning('Société', 'Aucune société active pour créer un voyage.')
      return
    }
  }
  saving.value = true
  try {
    if (editing.value) {
      const sidPut =
        Number(form.value.idSociete) > 0
          ? Number(form.value.idSociete)
          : idSocieteForSave.value
      if (sidPut == null || !Number.isFinite(sidPut) || sidPut <= 0) {
        await notify.warning('Société', 'Société du voyage introuvable.')
        return
      }
      await updateVoyage(form.value.id, {
        id: form.value.id,
        ...base,
        idSociete: sidPut,
      })
    } else {
      await createVoyage({
        ...base,
        idSociete: idSocieteForSave.value,
      })
    }
    const wasEditing = editing.value
    closeModal()
    await load()
    await notify.toast.success(wasEditing ? 'Voyage modifié.' : 'Voyage créé.')
  } catch (e) {
    await notify.error('Enregistrement', e?.message || 'Erreur')
  } finally {
    saving.value = false
  }
}

async function toggleStatut(r) {
  const id = voyageId(r)
  const label = `${formatDateDepartCell(r.dateDepart ?? r.DateDepart)} ${ticksToHHmm(r.heureDepart ?? r.HeureDepart)}`
  const wasActive = rowStatut(r)
  const verb = wasActive ? 'désactiver' : 'réactiver'
  const ok = await notify.confirm(`Voulez-vous ${verb} le voyage du ${label} ?`, 'Confirmation')
  if (!ok) return
  const sid = Number(r.idSociete ?? r.IdSociete)
  if (!Number.isFinite(sid) || sid <= 0) {
    await notify.error('Statut', 'Société du voyage introuvable.')
    return
  }
  togglingId.value = id
  try {
    const iso =
      dateInputToIsoMidnightUtc(dateDepartFromApiToInput(r.dateDepart ?? r.DateDepart)) ||
      String(r.dateDepart ?? r.DateDepart ?? '')
    await updateVoyage(id, {
      id,
      dateDepart: iso,
      heureDepart: heureDepartToApiString(r.heureDepart ?? r.HeureDepart),
      prix: Number(r.prix ?? r.Prix) || 0,
      idBus: Number(r.idBus ?? r.IdBus) || 0,
      idDestination: Number(r.idDestination ?? r.IdDestination) || 0,
      idSociete: sid,
      statut: !wasActive,
    })
    await load()
    await notify.toast.success(wasActive ? 'Voyage désactivé.' : 'Voyage réactivé.')
  } catch (e) {
    await notify.error('Statut', e?.message || 'Impossible de modifier le statut.')
  } finally {
    togglingId.value = null
  }
}

onMounted(load)
</script>
