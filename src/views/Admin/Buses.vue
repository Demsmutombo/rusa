<template>
  <DefaultLayout>
    <div class="space-y-6">
      <div class="rusa-gradient-header flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-2xl font-bold text-white">Bus</h1>
          <p class="text-primary-100">{{ headerIntro }}</p>
        </div>
        <button
          type="button"
          class="rusa-btn-primary shrink-0 bg-white text-primary-800 hover:bg-primary-50"
          @click="openCreate"
        >
          Nouveau bus
        </button>
      </div>

      <p
        v-if="error"
        class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/50 dark:text-red-200"
      >
        {{ error }}
      </p>

      <div
        class="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-primary-800/60 dark:bg-primary-950/70 dark:shadow-none sm:flex-row sm:flex-wrap sm:items-end"
      >
        <div class="min-w-0 flex-1 sm:min-w-[12rem] sm:max-w-md">
          <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-primary-200/90">Recherche</label>
          <input
            v-model.trim="searchQuery"
            type="search"
            placeholder="Marque, n°, plaque, type…"
            autocomplete="off"
            class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-primary-700 dark:bg-primary-900/80 dark:text-gray-100 dark:placeholder:text-primary-500/50 dark:focus:border-primary-400 dark:focus:ring-primary-400"
          />
        </div>
        <div class="min-w-0 sm:w-44">
          <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-primary-200/90">Statut</label>
          <select
            v-model="statutFilter"
            class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-primary-700 dark:bg-primary-900/80 dark:text-gray-100 dark:focus:border-primary-400 dark:focus:ring-primary-400"
          >
            <option value="all">Tous</option>
            <option value="active">Actifs</option>
            <option value="inactive">Inactifs</option>
          </select>
        </div>
        <button
          v-if="hasActiveFilters"
          type="button"
          class="shrink-0 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100 dark:border-primary-700 dark:bg-primary-900/60 dark:text-primary-200 dark:hover:bg-primary-800/80"
          @click="clearFilters"
        >
          Réinitialiser
        </button>
      </div>

      <div
        class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-primary-800/60 dark:bg-primary-950/70 dark:shadow-none"
      >
        <div class="overflow-x-auto">
          <table class="w-full min-w-[720px] text-left text-sm">
            <thead class="border-b border-gray-200 bg-gray-50 dark:border-primary-800/60 dark:bg-primary-900/50">
              <tr>
                <th
                  class="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-primary-300/70"
                >
                  N° bus
                </th>
                <th
                  class="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-primary-300/70"
                >
                  Bus
                </th>
                <th
                  class="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-primary-300/70"
                >
                  Type
                </th>
                <th
                  class="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-primary-300/70"
                >
                  Plaque
                </th>
                <th
                  class="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-primary-300/70"
                >
                  Statut
                </th>
                <th
                  class="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-primary-300/70"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-primary-800/50">
              <tr v-if="loading">
                <td colspan="6" class="px-6 py-10 text-center text-gray-500 dark:text-primary-400/80">
                  Chargement…
                </td>
              </tr>
              <tr v-else-if="!rows.length">
                <td colspan="6" class="px-6 py-10 text-center text-gray-500 dark:text-primary-400/80">
                  Aucun bus pour le moment.
                </td>
              </tr>
              <tr v-else-if="!filteredRows.length">
                <td colspan="6" class="px-6 py-10 text-center text-gray-500 dark:text-primary-400/80">
                  Aucun bus ne correspond à la recherche ou au filtre de statut.
                </td>
              </tr>
              <template v-else>
                <tr
                  v-for="r in filteredRows"
                  :key="r.idBus ?? r.IdBus"
                  class="transition-colors hover:bg-gray-50/80 dark:hover:bg-primary-900/35"
                >
                  <td class="whitespace-nowrap px-4 py-4 align-middle tabular-nums text-gray-800 dark:text-gray-200">
                    {{ r.numeroBus ?? r.NumeroBus ?? '—' }}
                  </td>
                  <td class="px-6 py-4">
                    <p class="font-medium text-gray-900 dark:text-white">
                      {{ r.marques ?? r.Marques ?? '—' }}
                    </p>
                    <p class="text-xs text-gray-500 dark:text-primary-300/60">
                      {{ r.nombreSiege ?? r.NombreSiege ?? '—' }} places
                    </p>
                  </td>
                  <td class="px-6 py-4 text-sm">
                    <div class="font-medium text-primary-700 dark:text-primary-400">{{ busRowTypeLabel(r) }}</div>
                  </td>
                  <td class="px-6 py-4 font-mono text-sm text-gray-800 dark:text-gray-200">
                    {{ r.numeroDePlaque ?? r.NumeroDePlaque ?? '—' }}
                  </td>
                  <td class="px-6 py-4">
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
                  <td class="whitespace-nowrap px-6 py-4 text-sm font-medium">
                    <button
                      type="button"
                      class="mr-3 text-primary-600 transition hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
                      @click="openView(r)"
                    >
                      Voir
                    </button>
                    <button
                      type="button"
                      class="mr-3 text-primary-600 transition hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
                      @click="openEdit(r)"
                    >
                      Modifier
                    </button>
                    <button
                      type="button"
                      :disabled="togglingId === (r.idBus ?? r.IdBus)"
                      :class="
                        rowStatut(r)
                          ? 'text-amber-600 hover:text-amber-700 dark:text-amber-400/90 dark:hover:text-amber-300'
                          : 'text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300'
                      "
                      class="transition disabled:opacity-50"
                      @click="toggleStatut(r)"
                    >
                      {{ rowStatut(r) ? 'Supprimer' : 'Réactiver' }}
                    </button>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </div>

      <Teleport to="body">
        <div
          v-if="showModal"
          class="fixed inset-0 z-[200000] flex items-center justify-center overflow-y-auto bg-gray-900/55 p-4 backdrop-blur-sm dark:bg-black/75"
          @click.self="closeModal"
        >
          <div
            class="my-auto max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-primary-800/60 dark:bg-primary-950"
          >
            <h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              {{ viewOnly ? 'Détails du bus' : editing ? 'Modifier le bus' : 'Nouveau bus' }}
            </h3>
            <div class="space-y-3">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-primary-200/90">Marque *</label>
                <input
                  v-model="form.marques"
                  type="text"
                  :readonly="viewOnly"
                  :class="[
                    'mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 dark:border-primary-700 dark:bg-primary-900/80 dark:text-gray-100',
                    viewOnly ? 'cursor-default bg-gray-50 dark:bg-primary-900/50' : 'bg-white',
                  ]"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-primary-200/90">N° de bus *</label>
                <input
                  v-model.number="form.numeroBus"
                  type="number"
                  min="1"
                  step="1"
                  :readonly="viewOnly"
                  :class="[
                    'mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 tabular-nums text-gray-900 dark:border-primary-700 dark:bg-primary-900/80 dark:text-gray-100',
                    viewOnly ? 'cursor-default bg-gray-50 dark:bg-primary-900/50' : 'bg-white',
                  ]"
                />
                <p v-if="!viewOnly" class="mt-1 text-xs text-gray-500 dark:text-primary-400/75">
                  Identifiant métier du bus (distinct de la plaque d’immatriculation).
                </p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-primary-200/90">Places *</label>
                <input
                  v-model.number="form.nombreSiege"
                  type="number"
                  min="1"
                  :readonly="viewOnly"
                  :class="[
                    'mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 dark:border-primary-700 dark:bg-primary-900/80 dark:text-gray-100',
                    viewOnly ? 'cursor-default bg-gray-50 dark:bg-primary-900/50' : 'bg-white',
                  ]"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-primary-200/90">Type de bus *</label>
                <p
                  v-if="viewOnly && viewContext"
                  class="mt-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-gray-900 dark:border-primary-700 dark:bg-primary-900/50 dark:text-gray-100"
                >
                  {{ busRowTypeLabel(viewContext) }}
                </p>
                <template v-else>
                  <select
                    v-model.number="form.idTypeBus"
                    class="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-primary-700 dark:bg-primary-900/80 dark:text-gray-100"
                    :disabled="!typeOptions.length"
                  >
                    <option :value="0">
                      {{ typeOptions.length ? '— Choisir un type —' : 'Aucun type actif' }}
                    </option>
                    <option v-for="t in typeOptions" :key="t.idTypeBus ?? t.IdTypeBus" :value="t.idTypeBus ?? t.IdTypeBus">
                      {{ t.libelle ?? t.Libelle }}
                    </option>
                  </select>
                  <p v-if="!typeOptions.length" class="mt-1.5 text-xs text-amber-700 dark:text-amber-400/90">
                    Activez un type dans « Types de bus » ou créez-en un pour pouvoir enregistrer un bus.
                  </p>
                </template>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-primary-200/90">N° de plaque *</label>
                <input
                  v-model="form.numeroDePlaque"
                  type="text"
                  :readonly="viewOnly"
                  :class="[
                    'mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-gray-900 dark:border-primary-700 dark:bg-primary-900/80 dark:text-gray-100',
                    viewOnly ? 'cursor-default bg-gray-50 dark:bg-primary-900/50' : 'bg-white',
                  ]"
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
              <label v-else class="flex items-center gap-2">
                <input v-model="form.statut" type="checkbox" class="size-4 rounded border-gray-300 text-primary-600" />
                <span class="text-sm text-gray-700 dark:text-primary-200/90">Actif</span>
              </label>
            </div>
            <div class="mt-6 flex justify-end gap-3">
              <template v-if="viewOnly">
                <button
                  type="button"
                  class="rounded-lg bg-primary-600 px-4 py-2 text-white hover:bg-primary-500"
                  @click="closeModal"
                >
                  Fermer
                </button>
              </template>
              <template v-else>
                <button
                  type="button"
                  class="rounded-lg border border-gray-200 bg-gray-100 px-4 py-2 text-gray-800 dark:border-primary-700 dark:bg-primary-900/60 dark:text-primary-100"
                  @click="closeModal"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  :disabled="saving"
                  class="rounded-lg bg-primary-600 px-4 py-2 text-white hover:bg-primary-500 disabled:opacity-50"
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
import DefaultLayout from '@/components/layout/DefaultLayout.vue'
import { useAdminListSearch } from '@/composables/useAdminListSearch'
import { useTenantSocieteId } from '@/composables/useTenantSocieteId'
import {
  listBusArray,
  createBus,
  updateBus,
  toggleBusStatut,
  pickBusPhotoRaw,
} from '@/services/busService'
import { listTypeBusArray } from '@/services/typeBusService'
import { notify } from '@/utils/notify'
import { useAdminModuleGreeting } from '@/composables/useAdminModuleGreeting'

const { idSocieteForSave } = useTenantSocieteId()
const headerIntro = useAdminModuleGreeting('bienvenue — parc véhicules et statut ci-dessous.')

const rows = ref([])
const types = ref([])
const loading = ref(false)
const error = ref('')
const showModal = ref(false)
const editing = ref(false)
const viewOnly = ref(false)
const viewContext = ref(null)
const saving = ref(false)
const togglingId = ref(null)

const form = ref({
  idBus: 0,
  marques: '',
  numeroBus: 0,
  idTypeBus: 0,
  nombreSiege: 0,
  idSociete: 0,
  numeroDePlaque: '',
  photo: '',
  statut: true,
})

const typeOptions = computed(() => types.value.filter((t) => rowStatut(t)))

function rowStatut(r) {
  const v = r.statut ?? r.Statut
  return !(v === false || v === 0 || v === '0' || String(v).toLowerCase() === 'false')
}

/** Libellé type pour affichage tableau / détail (API + correspondance id → liste TypeBus). */
function busRowTypeLabel(r) {
  if (!r || typeof r !== 'object') return '—'
  const fromRow = [
    r.libelleTypeBus,
    r.LibelleTypeBus,
    r.typeLibelle,
    r.TypeLibelle,
    r.libelleType,
    r.LibelleType,
    r.nomTypeBus,
    r.NomTypeBus,
    r.typeBusLibelle,
    r.TypeBusLibelle,
  ]
  for (const v of fromRow) {
    if (v == null) continue
    const s = String(v).trim()
    if (s) return s
  }
  const tid = Number(r.idTypeBus ?? r.IdTypeBus)
  if (Number.isFinite(tid) && tid > 0) {
    const t = types.value.find((x) => Number(x.idTypeBus ?? x.IdTypeBus) === tid)
    if (t) {
      const lab = String(t.libelle ?? t.Libelle ?? '').trim()
      if (lab) return lab
    }
  }
  return '—'
}

function busTextMatch(r, q) {
  const parts = [
    r.marques,
    r.Marques,
    r.numeroBus,
    r.NumeroBus,
    r.numeroDePlaque,
    r.NumeroDePlaque,
    r.nombreSiege,
    r.NombreSiege,
    busRowTypeLabel(r),
    r.nomSociete,
    r.NomSociete,
  ]
  const blob = parts.map((x) => String(x ?? '').toLowerCase()).join(' ')
  return blob.includes(q)
}

const { searchQuery, statutFilter, filteredRows, hasActiveFilters, clearFilters } = useAdminListSearch(
  rows,
  busTextMatch,
  {
    rowStatut,
  }
)

/** Numéro bus interne pour l’API (plus affiché dans le formulaire). */
function pickNextNumeroBus() {
  let max = 0
  for (const r of rows.value) {
    const n = Number(r.numeroBus ?? r.NumeroBus)
    if (Number.isFinite(n) && n > max) max = n
  }
  return max + 1
}

async function loadTypes() {
  try {
    types.value = await listTypeBusArray()
  } catch {
    types.value = []
  }
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    await loadTypes()
    rows.value = await listBusArray()
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
    idBus: r.idBus ?? r.IdBus,
    marques: r.marques ?? r.Marques ?? '',
    numeroBus: Number(r.numeroBus ?? r.NumeroBus) || 0,
    idTypeBus: Number(r.idTypeBus ?? r.IdTypeBus) || 0,
    nombreSiege: Number(r.nombreSiege ?? r.NombreSiege) || 0,
    idSociete: Number(r.idSociete ?? r.IdSociete) || 0,
    numeroDePlaque: r.numeroDePlaque ?? r.NumeroDePlaque ?? '',
    photo: pickBusPhotoRaw(r),
    statut: rowStatut(r),
  }
  showModal.value = true
}

function openCreate() {
  viewOnly.value = false
  viewContext.value = null
  editing.value = false
  form.value = {
    idBus: 0,
    marques: '',
    numeroBus: pickNextNumeroBus(),
    idTypeBus: Number(typeOptions.value[0]?.idTypeBus ?? typeOptions.value[0]?.IdTypeBus) || 0,
    nombreSiege: 0,
    idSociete: 0,
    numeroDePlaque: '',
    photo: '',
    statut: true,
  }
  showModal.value = true
}

function openEdit(r) {
  viewOnly.value = false
  viewContext.value = null
  editing.value = true
  form.value = {
    idBus: r.idBus ?? r.IdBus,
    marques: r.marques ?? r.Marques ?? '',
    numeroBus: Number(r.numeroBus ?? r.NumeroBus) || 0,
    idTypeBus: Number(r.idTypeBus ?? r.IdTypeBus) || 0,
    nombreSiege: Number(r.nombreSiege ?? r.NombreSiege) || 0,
    idSociete: Number(r.idSociete ?? r.IdSociete) || 0,
    numeroDePlaque: r.numeroDePlaque ?? r.NumeroDePlaque ?? '',
    photo: pickBusPhotoRaw(r),
    statut: rowStatut(r),
  }
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  viewOnly.value = false
  viewContext.value = null
}

async function save() {
  if (!form.value.marques?.trim() || !form.value.numeroDePlaque?.trim()) {
    await notify.warning('Saisie incomplète', 'Marque et numéro de plaque sont obligatoires.')
    return
  }
  if (!Number.isFinite(Number(form.value.idTypeBus)) || Number(form.value.idTypeBus) <= 0) {
    await notify.warning('Type de bus', 'Choisissez un type de bus.')
    return
  }
  let nb = Number(form.value.numeroBus)
  if (!Number.isFinite(nb) || nb < 1) nb = pickNextNumeroBus()
  const ns = Number(form.value.nombreSiege)
  if (!Number.isFinite(ns) || ns < 1) {
    await notify.warning('Données invalides', 'Le nombre de places doit être au moins 1.')
    return
  }
  if (!editing.value) {
    if (idSocieteForSave.value == null) {
      await notify.warning('Société', 'Aucune société active.')
      return
    }
  }
  saving.value = true
  try {
    const photo = String(form.value.photo || '').trim()
    if (editing.value) {
      await updateBus(form.value.idBus, {
        idBus: form.value.idBus,
        marques: form.value.marques.trim(),
        numeroBus: nb,
        idTypeBus: Number(form.value.idTypeBus),
        nombreSiege: ns,
        idSociete: form.value.idSociete || idSocieteForSave.value,
        numeroDePlaque: form.value.numeroDePlaque.trim(),
        photo: photo || '',
        statut: form.value.statut !== false,
      })
    } else {
      await createBus({
        marques: form.value.marques.trim(),
        numeroBus: nb,
        idTypeBus: Number(form.value.idTypeBus),
        nombreSiege: ns,
        idSociete: idSocieteForSave.value,
        numeroDePlaque: form.value.numeroDePlaque.trim(),
        photo: photo || '',
        statut: form.value.statut !== false,
      })
    }
    const wasEditing = editing.value
    closeModal()
    await load()
    await notify.toast.success(wasEditing ? 'Bus modifié.' : 'Bus créé.')
  } catch (e) {
    await notify.error('Enregistrement', e?.message || 'Erreur')
  } finally {
    saving.value = false
  }
}

async function toggleStatut(r) {
  const id = r.idBus ?? r.IdBus
  const label = `${r.marques ?? r.Marques ?? 'Bus'} (${r.numeroDePlaque ?? r.NumeroDePlaque ?? id})`
  const wasActive = rowStatut(r)
  const verb = wasActive ? 'supprimer' : 'réactiver'
  const ok = await notify.confirm(`Voulez-vous ${verb} « ${label} » ?`, 'Confirmation')
  if (!ok) return
  togglingId.value = id
  try {
    await toggleBusStatut(r)
    await load()
    await notify.toast.success(wasActive ? 'Bus désactivé.' : 'Bus réactivé.')
  } catch (e) {
    await notify.error('Statut', e?.message || 'Impossible de modifier le statut.')
  } finally {
    togglingId.value = null
  }
}

onMounted(load)
</script>
