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
          <h1 class="text-xl font-bold leading-tight text-white sm:text-2xl">Bus</h1>
          <p class="mt-1 text-sm text-primary-100 sm:text-base">
            Parc véhicules. Pas de suppression : le statut actif / inactif est basculé via l’API (toggle-statut).
          </p>
        </div>
        <button
          type="button"
          class="shrink-0 rounded-lg bg-white/15 px-4 py-2.5 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white/25"
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
        class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-primary-800/60 dark:bg-primary-950/70 dark:shadow-none"
      >
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead class="border-b border-gray-200 bg-gray-50 dark:border-primary-800/60 dark:bg-primary-900/50">
              <tr>
                <th class="w-24 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-primary-300/70">
                  Photo
                </th>
                <th class="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-primary-300/70">
                  Bus
                </th>
                <th class="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-primary-300/70">
                  Type
                </th>
                <th class="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-primary-300/70">
                  Plaque
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
              <tr v-if="loading">
                <td colspan="6" class="px-4 py-10 text-center text-gray-500 dark:text-primary-400/80">Chargement…</td>
              </tr>
              <tr v-else-if="!rows.length">
                <td colspan="6" class="px-4 py-10 text-center text-gray-500 dark:text-primary-400/80">Aucun bus.</td>
              </tr>
              <template v-else>
                <tr
                  v-for="r in rows"
                  :key="r.idBus ?? r.IdBus"
                  class="hover:bg-gray-50/80 dark:hover:bg-primary-900/35"
                >
                  <td class="px-4 py-3 align-middle">
                    <div
                      v-if="!busPhotoSrc(r) || photoBroken[busPhotoBrokenKey(r)]"
                      class="flex size-16 shrink-0 items-center justify-center rounded-full border-2 border-gray-200 bg-gray-100 text-xs font-semibold text-gray-600 dark:border-primary-600 dark:bg-primary-900/60"
                    >
                      {{ (r.marques ?? r.Marques ?? '?').slice(0, 2).toUpperCase() }}
                    </div>
                    <img
                      v-else
                      :src="busPhotoSrc(r)"
                      alt=""
                      class="size-16 shrink-0 rounded-full border-2 border-gray-200 object-cover object-center dark:border-primary-600"
                      loading="lazy"
                      @error="onPhotoError(busPhotoBrokenKey(r))"
                    />
                  </td>
                  <td class="px-4 py-3">
                    <p class="font-medium text-gray-900 dark:text-white">{{ r.marques ?? r.Marques ?? '—' }}</p>
                    <p class="text-xs text-gray-500 dark:text-primary-400/70">
                      {{ r.nombreSiege ?? r.NombreSiege ?? '—' }} places
                    </p>
                  </td>
                  <td class="px-4 py-3 text-gray-800 dark:text-gray-200">
                    {{ busRowTypeLabel(r) }}
                  </td>
                  <td class="px-4 py-3 font-mono text-xs text-gray-700 dark:text-primary-200/90">
                    {{ r.numeroDePlaque ?? r.NumeroDePlaque ?? '—' }}
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
                      :disabled="togglingId === (r.idBus ?? r.IdBus)"
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
              <template v-if="viewOnly && viewContext">
                <div class="flex flex-col items-center gap-3">
                  <div
                    v-if="busPhotoSrc(viewContext) && !photoBroken[busPhotoBrokenKey(viewContext)]"
                    class="shrink-0 overflow-hidden rounded-full border-2 border-gray-200 shadow-sm dark:border-primary-600"
                  >
                    <img
                      :src="busPhotoSrc(viewContext)"
                      alt=""
                      class="size-40 object-cover object-center"
                      loading="lazy"
                      @error="onPhotoError(busPhotoBrokenKey(viewContext))"
                    />
                  </div>
                  <div
                    v-else-if="busPhotoSrc(viewContext) && photoBroken[busPhotoBrokenKey(viewContext)]"
                    class="flex size-40 shrink-0 items-center justify-center rounded-full border-2 border-amber-300 bg-amber-50 text-center text-xs text-amber-900 dark:border-amber-700 dark:bg-amber-950/50 dark:text-amber-200"
                  >
                    Aperçu indisponible
                  </div>
                  <div
                    v-else
                    class="flex size-40 shrink-0 items-center justify-center rounded-full border-2 border-gray-200 bg-gray-100 text-lg font-bold text-gray-600 dark:border-primary-600 dark:bg-primary-900/60 dark:text-primary-200"
                  >
                    {{ (viewContext.marques ?? viewContext.Marques ?? '?').slice(0, 2).toUpperCase() }}
                  </div>
                </div>
              </template>
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
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-primary-200/90">Photo</label>
                <p v-if="!viewOnly" class="mt-0.5 text-xs text-gray-500 dark:text-primary-400/75">
                  Collez une URL / chemin, ou importez une image (fichier converti pour l’envoi au serveur).
                </p>
                <div v-if="!viewOnly" class="mt-2 flex flex-wrap items-center gap-2">
                  <input
                    ref="busPhotoFileRef"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    class="sr-only"
                    tabindex="-1"
                    @change="onBusPhotoFile"
                  />
                  <button
                    type="button"
                    class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-800 shadow-sm hover:bg-gray-50 dark:border-primary-600 dark:bg-primary-900/60 dark:text-primary-100 dark:hover:bg-primary-800/60"
                    @click="busPhotoFileRef?.click()"
                  >
                    Importer une image…
                  </button>
                </div>
                <label class="mt-2 block text-xs font-medium text-gray-600 dark:text-primary-300/80">URL ou chemin (optionnel)</label>
                <input
                  v-model="form.photo"
                  type="text"
                  placeholder="https://… ou /chemin/vers/image.jpg"
                  :readonly="viewOnly"
                  :class="[
                    'mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 dark:border-primary-700 dark:bg-primary-900/80 dark:text-gray-100',
                    viewOnly ? 'cursor-default bg-gray-50 dark:bg-primary-900/50' : 'bg-white',
                  ]"
                />
                <div
                  v-if="formPhotoDisplayUrl && !formPhotoPreviewBroken"
                  class="mt-3 flex justify-center"
                >
                  <div
                    class="overflow-hidden rounded-full border-2 border-gray-200 bg-gray-50 shadow-sm dark:border-primary-600 dark:bg-primary-900/40"
                    :class="viewOnly ? 'size-36' : 'size-40'"
                  >
                    <img
                      :src="formPhotoDisplayUrl"
                      alt="Aperçu de la photo"
                      class="size-full object-cover object-center"
                      loading="lazy"
                      @error="formPhotoPreviewBroken = true"
                    />
                  </div>
                </div>
                <p v-else-if="String(form.photo || '').trim() && formPhotoPreviewBroken" class="mt-2 text-xs text-amber-700 dark:text-amber-400/90">
                  Impossible de charger cette image (URL ou chemin invalide).
                </p>
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
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import DefaultLayout from '@/components/layout/DefaultLayout.vue'
import { useTenantSocieteId } from '@/composables/useTenantSocieteId'
import {
  listBusArray,
  createBus,
  updateBus,
  toggleBusStatut,
  resolveBusPhotoUrl,
  resolveBusPhotoFromRow,
  pickBusPhotoRaw,
} from '@/services/busService'
import { listTypeBusArray } from '@/services/typeBusService'
import { notify } from '@/utils/notify'

const route = useRoute()
const { idSocieteForSave } = useTenantSocieteId()
const isSuperAdminContext = computed(() => route.path.startsWith('/super-admin'))

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
const photoBroken = ref({})
const formPhotoPreviewBroken = ref(false)
const busPhotoFileRef = ref(null)

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

const formPhotoDisplayUrl = computed(() =>
  resolveBusPhotoUrl(String(form.value.photo || '').trim())
)

watch(
  () => form.value.photo,
  () => {
    formPhotoPreviewBroken.value = false
  }
)

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

function busPhotoBrokenKey(r) {
  if (!r) return ''
  const id = r.idBus ?? r.IdBus
  const n = Number(id)
  return Number.isFinite(n) && n > 0 ? n : String(id ?? '')
}

function busPhotoSrc(r) {
  return resolveBusPhotoFromRow(r)
}

function onPhotoError(key) {
  const k = typeof key === 'number' && Number.isFinite(key) ? key : String(key ?? '')
  if (k === '' || k === 'NaN') return
  photoBroken.value = { ...photoBroken.value, [k]: true }
}

/** Numéro bus interne pour l’API (plus affiché dans le formulaire). */
function pickNextNumeroBus() {
  let max = 0
  for (const r of rows.value) {
    const n = Number(r.numeroBus ?? r.NumeroBus)
    if (Number.isFinite(n) && n > max) max = n
  }
  return max + 1
}

async function onBusPhotoFile(ev) {
  const input = ev.target
  if (!(input instanceof HTMLInputElement)) return
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  if (!file.type.startsWith('image/')) {
    await notify.warning('Fichier', 'Choisissez une image (JPEG, PNG, WebP ou GIF).')
    return
  }
  const maxBytes = 2 * 1024 * 1024
  if (file.size > maxBytes) {
    await notify.warning('Fichier trop volumineux', 'Limite : 2 Mo par image.')
    return
  }
  const reader = new FileReader()
  reader.onload = () => {
    const data = String(reader.result || '')
    if (data) {
      form.value.photo = data
      formPhotoPreviewBroken.value = false
    }
  }
  reader.onerror = async () => {
    await notify.error('Lecture fichier', 'Impossible de lire le fichier.')
  }
  reader.readAsDataURL(file)
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
  photoBroken.value = {}
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
  formPhotoPreviewBroken.value = false
  showModal.value = true
}

function openCreate() {
  viewOnly.value = false
  viewContext.value = null
  editing.value = false
  formPhotoPreviewBroken.value = false
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
  formPhotoPreviewBroken.value = false
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  viewOnly.value = false
  viewContext.value = null
  formPhotoPreviewBroken.value = false
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
  const verb = wasActive ? 'désactiver' : 'réactiver'
  const ok = await notify.confirm(`Voulez-vous ${verb} « ${label} » ?`, 'Confirmation')
  if (!ok) return
  togglingId.value = id
  try {
    await toggleBusStatut(id)
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
