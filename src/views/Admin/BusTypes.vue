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
          <h1 class="text-xl font-bold leading-tight text-white sm:text-2xl">Types de bus</h1>
          <p class="mt-1 text-sm text-primary-100 sm:text-base">
            {{ headerIntro }}
          </p>
        </div>
        <button
          type="button"
          class="shrink-0 rounded-lg bg-white/15 px-4 py-2.5 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white/25"
          @click="openCreate"
        >
          Nouveau type
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
          Aucun type de bus.
        </div>
        <template v-else>
          <AdminListToolbar
            v-if="rows.length"
            :search="searchQuery"
            :statut="statutFilter"
            :filtered-count="filteredRows.length"
            :total-count="rows.length"
            placeholder="Libellé, société…"
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
            <table class="w-full min-w-[480px] text-left text-sm">
              <thead class="border-b border-gray-200 bg-gray-50 dark:border-primary-800/60 dark:bg-primary-900/50">
                <tr>
                  <th class="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-primary-300/70">
                    Libellé
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
                  :key="r.idTypeBus ?? r.IdTypeBus"
                  class="hover:bg-gray-50/80 dark:hover:bg-primary-900/35"
                >
                  <td class="px-4 py-3 font-medium text-gray-900 dark:text-white">
                    {{ r.libelle ?? r.Libelle ?? '—' }}
                  </td>
                  <td class="px-4 py-3 text-gray-700 dark:text-primary-200/90">
                    {{ societeLabelForRow(r) }}
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
                      class="mr-3 text-primary-600 hover:text-primary-500 dark:text-primary-400"
                      @click="openEdit(r)"
                    >
                      Modifier
                    </button>
                    <button
                      type="button"
                      :disabled="togglingId === (r.idTypeBus ?? r.IdTypeBus)"
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
              :key="`m-${r.idTypeBus ?? r.IdTypeBus}`"
              class="space-y-3 p-4"
            >
              <div class="flex flex-wrap items-start justify-between gap-2">
                <p class="text-base font-semibold text-gray-900 dark:text-white">
                  {{ r.libelle ?? r.Libelle ?? '—' }}
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
              <p class="text-sm text-gray-600 dark:text-primary-300/90">{{ societeLabelForRow(r) }}</p>
              <div class="flex flex-wrap gap-2 border-t border-gray-100 pt-3 dark:border-primary-800/50">
                <button
                  type="button"
                  class="rounded-lg border border-primary-200 bg-primary-50 px-3 py-2 text-sm font-medium text-primary-800 dark:border-primary-700 dark:bg-primary-900/50 dark:text-primary-200"
                  @click="openEdit(r)"
                >
                  Modifier
                </button>
                <button
                  type="button"
                  :disabled="togglingId === (r.idTypeBus ?? r.IdTypeBus)"
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
              {{ editing ? 'Modifier le type' : 'Nouveau type de bus' }}
            </h3>
            <div class="space-y-3">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-primary-200/90">Libellé *</label>
                <input
                  v-model="form.libelle"
                  type="text"
                  class="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-primary-700 dark:bg-primary-900/80 dark:text-gray-100"
                />
              </div>
              <label class="flex items-center gap-2">
                <input v-model="form.statut" type="checkbox" class="size-4 rounded border-gray-300 text-primary-600" />
                <span class="text-sm text-gray-700 dark:text-primary-200/90">Actif</span>
              </label>
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
                :disabled="saving"
                class="rounded-lg bg-primary-600 px-4 py-2 text-white hover:bg-primary-500 disabled:opacity-50"
                @click="save"
              >
                {{ saving ? '…' : 'Enregistrer' }}
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
import { useRoute } from 'vue-router'
import DefaultLayout from '@/components/layout/DefaultLayout.vue'
import AdminListToolbar from '@/components/admin/AdminListToolbar.vue'
import { useAdminListSearch } from '@/composables/useAdminListSearch'
import { useTenantSocieteId } from '@/composables/useTenantSocieteId'
import { useAdminModuleGreeting } from '@/composables/useAdminModuleGreeting'
import { listTypeBusArray, createTypeBus, updateTypeBus, toggleTypeBusStatut } from '@/services/typeBusService'
import { listSocietesArray } from '@/services/societeService'
import { notify } from '@/utils/notify'

const route = useRoute()
const { idSocieteForSave } = useTenantSocieteId()
const headerIntro = useAdminModuleGreeting('bienvenue — types de bus et statut ci-dessous.')
const isSuperAdminContext = computed(() => route.path.startsWith('/super-admin'))

const rows = ref([])
const societes = ref([])
const loading = ref(false)
const error = ref('')
const showModal = ref(false)
const editing = ref(false)
const saving = ref(false)
const togglingId = ref(null)

const form = ref({
  idTypeBus: 0,
  libelle: '',
  idSociete: 0,
  statut: true,
})

function rowStatut(r) {
  const v = r.statut ?? r.Statut
  return !(v === false || v === 0 || v === '0' || String(v).toLowerCase() === 'false')
}

function societeLabelForRow(r) {
  const fromApi =
    r.nomSociete ??
    r.NomSociete ??
    r.societeNom ??
    r.SocieteNom ??
    r.nomSocieteNavigation ??
    r.NomSocieteNavigation
  if (fromApi != null && String(fromApi).trim()) return String(fromApi).trim()
  const nested = r.societe ?? r.Societe
  if (nested && typeof nested === 'object') {
    const n = nested.nom ?? nested.Nom
    if (n != null && String(n).trim()) return String(n).trim()
  }
  const id = Number(r.idSociete ?? r.IdSociete)
  if (!Number.isFinite(id) || id <= 0) return '—'
  const s = societes.value.find((x) => Number(x.idSociete ?? x.IdSociete) === id)
  if (s) {
    const nom = String(s.nom ?? s.Nom ?? '').trim()
    return nom || `Société #${id}`
  }
  return `Société #${id}`
}

function typeBusTextMatch(r, q) {
  const blob = [r.libelle, r.Libelle, societeLabelForRow(r)]
    .map((x) => String(x ?? '').toLowerCase())
    .join(' ')
  return blob.includes(q)
}

const { searchQuery, statutFilter, filteredRows, clearFilters } = useAdminListSearch(rows, typeBusTextMatch, {
  rowStatut,
})

async function load() {
  loading.value = true
  error.value = ''
  try {
    const [types, soc] = await Promise.all([listTypeBusArray(), listSocietesArray().catch(() => [])])
    rows.value = types
    societes.value = Array.isArray(soc) ? soc : []
  } catch (e) {
    error.value = e?.message || 'Erreur chargement'
    rows.value = []
    societes.value = []
  } finally {
    loading.value = false
  }
}

function openCreate() {
  editing.value = false
  form.value = { idTypeBus: 0, libelle: '', idSociete: 0, statut: true }
  showModal.value = true
}

function openEdit(r) {
  editing.value = true
  form.value = {
    idTypeBus: r.idTypeBus ?? r.IdTypeBus,
    libelle: r.libelle ?? r.Libelle ?? '',
    idSociete: Number(r.idSociete ?? r.IdSociete) || 0,
    statut: rowStatut(r),
  }
  showModal.value = true
}

function closeModal() {
  showModal.value = false
}

async function save() {
  if (!form.value.libelle?.trim()) {
    await notify.warning('Saisie incomplète', 'Le libellé est obligatoire.')
    return
  }
  if (!editing.value) {
    const sid = idSocieteForSave.value
    if (sid == null) {
      await notify.warning('Société', 'Aucune société active.')
      return
    }
  }
  saving.value = true
  try {
    if (editing.value) {
      await updateTypeBus(form.value.idTypeBus, {
        idTypeBus: form.value.idTypeBus,
        libelle: form.value.libelle.trim(),
        idSociete: form.value.idSociete,
        statut: form.value.statut !== false,
      })
    } else {
      await createTypeBus({
        libelle: form.value.libelle.trim(),
        idSociete: idSocieteForSave.value,
        statut: form.value.statut !== false,
      })
    }
    const wasEditing = editing.value
    closeModal()
    await load()
    await notify.toast.success(wasEditing ? 'Type modifié.' : 'Type créé.')
  } catch (e) {
    await notify.error('Enregistrement', e?.message || 'Erreur')
  } finally {
    saving.value = false
  }
}

async function toggleStatut(r) {
  const id = r.idTypeBus ?? r.IdTypeBus
  const label = r.libelle ?? r.Libelle ?? `#${id}`
  const wasActive = rowStatut(r)
  const verb = wasActive ? 'désactiver' : 'réactiver'
  const ok = await notify.confirm(`Voulez-vous ${verb} le type « ${label} » ?`, 'Confirmation')
  if (!ok) return
  togglingId.value = id
  try {
    await toggleTypeBusStatut(r)
    await load()
    await notify.toast.success(wasActive ? 'Type désactivé.' : 'Type réactivé.')
  } catch (e) {
    await notify.error('Statut', e?.message || 'Impossible de modifier le statut.')
  } finally {
    togglingId.value = null
  }
}

onMounted(load)
</script>
