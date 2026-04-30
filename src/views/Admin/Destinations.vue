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
          <h1 class="text-xl font-bold leading-tight text-white sm:text-2xl">Destinations</h1>
          <p class="mt-1 text-sm text-primary-100 sm:text-base">
            {{ headerIntro }}
          </p>
        </div>
        <button
          type="button"
          class="shrink-0 rounded-lg bg-white/15 px-4 py-2.5 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white/25"
          @click="openCreate"
        >
          Nouvelle destination
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
          Aucune destination.
        </div>
        <template v-else>
          <AdminListToolbar
            v-if="rows.length"
            :search="searchQuery"
            :statut="statutFilter"
            :filtered-count="filteredRows.length"
            :total-count="rows.length"
            placeholder="Ville, société, montant…"
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
            <table class="w-full min-w-[560px] text-left text-sm">
              <thead class="border-b border-gray-200 bg-gray-50 dark:border-primary-800/60 dark:bg-primary-900/50">
                <tr>
                  <th class="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-primary-300/70">
                    Trajet
                  </th>
                  <th class="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-primary-300/70">
                    Montant
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
                  :key="r.idDestination ?? r.IdDestination"
                  class="hover:bg-gray-50/80 dark:hover:bg-primary-900/35"
                >
                  <td class="max-w-[220px] px-4 py-3 font-medium text-gray-900 dark:text-white">
                    <span class="line-clamp-2">
                      {{ r.villeDepart ?? r.VilleDepart }} → {{ r.villeArrivee ?? r.VilleArrivee }}
                    </span>
                  </td>
                  <td class="whitespace-nowrap px-4 py-3 tabular-nums text-gray-800 dark:text-gray-200">
                    {{ formatMontant(r.montant ?? r.Montant) }}
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
                      :disabled="togglingId === (r.idDestination ?? r.IdDestination)"
                      :class="
                        rowStatut(r)
                          ? 'text-amber-600 hover:text-amber-700 dark:text-amber-400'
                          : 'text-emerald-600 hover:text-emerald-700 dark:text-emerald-400'
                      "
                      class="transition disabled:opacity-50"
                      @click="toggleStatut(r)"
                    >
                      {{ rowStatut(r) ? 'Désactivé' : 'Réactiver' }}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="divide-y divide-gray-200 dark:divide-primary-800/50 md:hidden">
            <article
              v-for="r in filteredRows"
              :key="`m-${r.idDestination ?? r.IdDestination}`"
              class="space-y-3 p-4"
            >
              <div class="flex flex-wrap items-start justify-between gap-2">
                <p class="min-w-0 text-base font-semibold text-gray-900 dark:text-white">
                  {{ r.villeDepart ?? r.VilleDepart }} → {{ r.villeArrivee ?? r.VilleArrivee }}
                </p>
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
                <div class="flex justify-between gap-3">
                  <dt class="text-gray-500 dark:text-primary-400/80">Montant</dt>
                  <dd class="tabular-nums text-gray-800 dark:text-gray-200">
                    {{ formatMontant(r.montant ?? r.Montant) }}
                  </dd>
                </div>
                <div class="flex justify-between gap-3">
                  <dt class="text-gray-500 dark:text-primary-400/80">Société</dt>
                  <dd class="text-right text-gray-800 dark:text-gray-200">{{ r.nomSociete ?? r.NomSociete ?? '—' }}</dd>
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
                  :disabled="togglingId === (r.idDestination ?? r.IdDestination)"
                  class="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium transition disabled:opacity-50 dark:border-primary-700 dark:bg-primary-900/40"
                  :class="
                    rowStatut(r)
                      ? 'text-amber-800 dark:text-amber-300'
                      : 'text-emerald-800 dark:text-emerald-300'
                  "
                  @click="toggleStatut(r)"
                >
                  {{ rowStatut(r) ? 'Désactivé' : 'Réactiver' }}
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
            class="my-auto w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-primary-800/60 dark:bg-primary-950"
          >
            <h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              {{
                viewOnly
                  ? 'Détails de la destination'
                  : editing
                    ? 'Modifier la destination'
                    : 'Nouvelle destination'
              }}
            </h3>
            <div class="space-y-3">
              <div v-if="viewOnly && viewContext" class="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-sm dark:border-primary-800/60 dark:bg-primary-900/40">
                <p class="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-primary-400/80">Société</p>
                <p class="font-medium text-gray-900 dark:text-white">{{ viewContext.nomSociete ?? viewContext.NomSociete ?? '—' }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-primary-200/90">Ville départ *</label>
                <input
                  v-model="form.villeDepart"
                  type="text"
                  :readonly="viewOnly"
                  :class="[
                    'mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 dark:border-primary-700 dark:bg-primary-900/80 dark:text-gray-100',
                    viewOnly
                      ? 'cursor-default bg-gray-50 dark:bg-primary-900/50'
                      : 'bg-white',
                  ]"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-primary-200/90">Ville arrivée *</label>
                <input
                  v-model="form.villeArrivee"
                  type="text"
                  :readonly="viewOnly"
                  :class="[
                    'mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 dark:border-primary-700 dark:bg-primary-900/80 dark:text-gray-100',
                    viewOnly
                      ? 'cursor-default bg-gray-50 dark:bg-primary-900/50'
                      : 'bg-white',
                  ]"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-primary-200/90">Montant *</label>
                <input
                  v-model.number="form.montant"
                  type="number"
                  min="0"
                  step="0.01"
                  :readonly="viewOnly"
                  :class="[
                    'mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 dark:border-primary-700 dark:bg-primary-900/80 dark:text-gray-100',
                    viewOnly
                      ? 'cursor-default bg-gray-50 dark:bg-primary-900/50'
                      : 'bg-white',
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
              <label v-else-if="editing" class="flex items-center gap-2">
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
import { useRoute } from 'vue-router'
import DefaultLayout from '@/components/layout/DefaultLayout.vue'
import AdminListToolbar from '@/components/admin/AdminListToolbar.vue'
import { useAdminListSearch } from '@/composables/useAdminListSearch'
import { useTenantSocieteId } from '@/composables/useTenantSocieteId'
import { useAdminModuleGreeting } from '@/composables/useAdminModuleGreeting'
import {
  listDestinationsArray,
  createDestination,
  updateDestination,
  toggleDestinationStatut,
} from '@/services/destinationService'
import { notify } from '@/utils/notify'
import {
  mergeDestinationsWithInactiveCache,
  rememberInactiveDestination,
  forgetInactiveDestination,
} from '@/utils/destinationInactiveCache'

const route = useRoute()
const { idSocieteForSave } = useTenantSocieteId()
const headerIntro = useAdminModuleGreeting('bienvenue — trajets, tarifs et statut ci-dessous.')

const isSuperAdminContext = computed(() => route.path.startsWith('/super-admin'))

const rows = ref([])
const loading = ref(false)
const error = ref('')
const showModal = ref(false)
const editing = ref(false)
const viewOnly = ref(false)
const viewContext = ref(null)
const saving = ref(false)
const togglingId = ref(null)

const form = ref({
  idDestination: 0,
  villeDepart: '',
  villeArrivee: '',
  montant: 0,
  statut: true,
})

function rowStatut(r) {
  const v = r.statut ?? r.Statut
  return !(v === false || v === 0 || v === '0' || String(v).toLowerCase() === 'false')
}

function destinationTextMatch(r, q) {
  const blob = [
    r.villeDepart,
    r.VilleDepart,
    r.villeArrivee,
    r.VilleArrivee,
    r.nomSociete,
    r.NomSociete,
    r.montant,
    r.Montant,
  ]
    .map((x) => String(x ?? '').toLowerCase())
    .join(' ')
  return blob.includes(q)
}

const { searchQuery, statutFilter, filteredRows, clearFilters } = useAdminListSearch(rows, destinationTextMatch, {
  rowStatut,
})

function formatMontant(v) {
  const n = Number(v)
  if (!Number.isFinite(n)) return '—'
  return n.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    const fromApi = await listDestinationsArray()
    rows.value = mergeDestinationsWithInactiveCache(fromApi)
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
    idDestination: r.idDestination ?? r.IdDestination,
    villeDepart: r.villeDepart ?? r.VilleDepart ?? '',
    villeArrivee: r.villeArrivee ?? r.VilleArrivee ?? '',
    montant: Number(r.montant ?? r.Montant) || 0,
    statut: rowStatut(r),
  }
  showModal.value = true
}

function openCreate() {
  viewOnly.value = false
  viewContext.value = null
  editing.value = false
  form.value = {
    idDestination: 0,
    villeDepart: '',
    villeArrivee: '',
    montant: 0,
    statut: true,
  }
  showModal.value = true
}

function openEdit(r) {
  viewOnly.value = false
  viewContext.value = null
  editing.value = true
  form.value = {
    idDestination: r.idDestination ?? r.IdDestination,
    villeDepart: r.villeDepart ?? r.VilleDepart ?? '',
    villeArrivee: r.villeArrivee ?? r.VilleArrivee ?? '',
    montant: Number(r.montant ?? r.Montant) || 0,
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
  if (!form.value.villeDepart?.trim() || !form.value.villeArrivee?.trim()) {
    await notify.warning('Saisie incomplète', 'Ville départ et ville arrivée sont obligatoires.')
    return
  }
  const m = Number(form.value.montant)
  if (!Number.isFinite(m) || m < 0) {
    await notify.warning('Montant', 'Indiquez un montant valide.')
    return
  }
  if (!editing.value) {
    const sid = idSocieteForSave.value
    if (sid == null) {
      await notify.warning('Société', 'Aucune société active pour créer une destination.')
      return
    }
  }
  saving.value = true
  try {
    if (editing.value) {
      await updateDestination(form.value.idDestination, {
        villeDepart: form.value.villeDepart.trim(),
        villeArrivee: form.value.villeArrivee.trim(),
        montant: m,
        statut: form.value.statut !== false,
      })
    } else {
      await createDestination({
        villeDepart: form.value.villeDepart.trim(),
        villeArrivee: form.value.villeArrivee.trim(),
        montant: m,
        idSociete: idSocieteForSave.value,
      })
    }
    const wasEditing = editing.value
    closeModal()
    await load()
    await notify.toast.success(wasEditing ? 'Destination modifiée.' : 'Destination créée.')
  } catch (e) {
    await notify.error('Enregistrement', e?.message || 'Erreur')
  } finally {
    saving.value = false
  }
}

async function toggleStatut(r) {
  const id = r.idDestination ?? r.IdDestination
  const label = `${r.villeDepart ?? r.VilleDepart} → ${r.villeArrivee ?? r.VilleArrivee}`
  const wasActive = rowStatut(r)
  const verb = wasActive ? 'désactiver' : 'réactiver'
  const ok = await notify.confirm(`Voulez-vous ${verb} la destination « ${label} » ?`, 'Confirmation')
  if (!ok) return
  togglingId.value = id
  try {
    await toggleDestinationStatut(id)
    // Ne pas recharger toute la liste : certains GET n’incluent que les destinations actives.
    const nextActive = !wasActive
    const idNum = Number(id)
    let updatedRow = null
    rows.value = rows.value.map((x) => {
      const xid = Number(x.idDestination ?? x.IdDestination)
      if (xid !== idNum) return x
      updatedRow = { ...x, statut: nextActive, Statut: nextActive }
      return updatedRow
    })
    if (nextActive) {
      forgetInactiveDestination(idNum)
    } else if (updatedRow) {
      rememberInactiveDestination(updatedRow)
    }
    // Si le filtre « Actifs » / « Inactifs » est actif, la ligne disparaîtrait du tableau : repasser sur « Tous ».
    if (!nextActive && statutFilter.value === 'active') statutFilter.value = 'all'
    if (nextActive && statutFilter.value === 'inactive') statutFilter.value = 'all'
    await notify.toast.success(wasActive ? 'Destination désactivée.' : 'Destination réactivée.')
  } catch (e) {
    await notify.error('Statut', e?.message || 'Impossible de modifier le statut.')
  } finally {
    togglingId.value = null
  }
}

onMounted(load)
</script>
