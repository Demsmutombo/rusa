<template>
  <DefaultLayout>
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Agents</h1>
          <p class="text-gray-600 dark:text-gray-400">Employés rattachés à une société</p>
        </div>
        <button
          type="button"
          @click="openCreate"
          class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Nouvel agent
        </button>
      </div>

      <div class="bg-white rounded-lg shadow p-4 flex flex-wrap gap-4 items-end">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Filtrer par société</label>
          <select v-model="filterSociete" class="border rounded-md px-3 py-2 min-w-[200px]">
            <option value="">Toutes</option>
            <option v-for="s in societeOptions" :key="s.idSociete" :value="String(s.idSociete)">
              {{ s.nom }}
            </option>
          </select>
        </div>
      </div>

      <p v-if="error" class="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
        {{ error }}
      </p>

      <div class="bg-white rounded-lg shadow overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Agent</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rôle / fonction</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Société</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-if="loading">
                <td colspan="5" class="px-6 py-8 text-center text-gray-500">Chargement…</td>
              </tr>
              <tr v-for="a in filteredAgents" v-else :key="a.idAgent">
                <td class="px-6 py-4">
                  <p class="font-medium text-gray-900">{{ a.nomComplet }}</p>
                  <p class="text-xs text-gray-500">{{ a.emailAgent }} · {{ a.telephoneAgent || '—' }}</p>
                </td>
                <td class="px-6 py-4 text-sm">
                  <div>{{ a.roleAgent || '—' }}</div>
                  <div class="text-gray-500">{{ a.fonction || '' }}</div>
                </td>
                <td class="px-6 py-4 text-sm">{{ societeLabel(a.idSociete) }}</td>
                <td class="px-6 py-4">
                  <span
                    class="px-2 py-1 text-xs font-medium rounded-full"
                    :class="a.statut ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'"
                  >
                    {{ a.statut ? 'actif' : 'inactif' }}
                  </span>
                </td>
                <td class="px-6 py-4 text-sm font-medium whitespace-nowrap">
                  <button type="button" class="text-indigo-600 hover:text-indigo-900 mr-3" @click="openEdit(a)">
                    Modifier
                  </button>
                  <button type="button" class="text-red-600 hover:text-red-900" @click="remove(a)">
                    Supprimer
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div
        v-if="showModal"
        class="fixed inset-0 bg-gray-600 bg-opacity-50 z-50 flex items-start justify-center pt-12 px-4"
      >
        <div class="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">
            {{ editing ? 'Modifier l’agent' : 'Nouvel agent' }}
          </h3>
          <div class="space-y-3">
            <div v-if="!editing">
              <label class="block text-sm font-medium text-gray-700">Société *</label>
              <select v-model="form.idSociete" class="mt-1 w-full border rounded-md px-3 py-2">
                <option value="">— Choisir —</option>
                <option v-for="s in societeOptions" :key="s.idSociete" :value="String(s.idSociete)">
                  {{ s.nom }}
                </option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Nom complet *</label>
              <input v-model="form.nomComplet" type="text" class="mt-1 w-full border rounded-md px-3 py-2" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Email *</label>
              <input v-model="form.emailAgent" type="email" class="mt-1 w-full border rounded-md px-3 py-2" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Téléphone</label>
              <input v-model="form.telephoneAgent" type="text" class="mt-1 w-full border rounded-md px-3 py-2" />
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-sm font-medium text-gray-700">Rôle agent</label>
                <input v-model="form.roleAgent" type="text" placeholder="caissier, admin…" class="mt-1 w-full border rounded-md px-3 py-2" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Fonction</label>
                <input v-model="form.fonction" type="text" class="mt-1 w-full border rounded-md px-3 py-2" />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Matricule</label>
              <input v-model="form.matricule" type="text" class="mt-1 w-full border rounded-md px-3 py-2" />
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-sm font-medium text-gray-700">Genre</label>
                <select v-model="form.genre" class="mt-1 w-full border rounded-md px-3 py-2">
                  <option value="M">M</option>
                  <option value="F">F</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Date naissance</label>
                <input v-model="form.dateNaissance" type="date" class="mt-1 w-full border rounded-md px-3 py-2" />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Adresse</label>
              <input v-model="form.adresseResidence" type="text" class="mt-1 w-full border rounded-md px-3 py-2" />
            </div>
            <label v-if="!editing" class="flex items-center gap-2">
              <input v-model="form.statut" type="checkbox" />
              <span class="text-sm text-gray-700">Actif</span>
            </label>
          </div>
          <div class="mt-6 flex justify-end gap-3">
            <button type="button" class="px-4 py-2 bg-gray-100 rounded-md" @click="closeModal">Annuler</button>
            <button
              type="button"
              :disabled="saving"
              class="px-4 py-2 bg-indigo-600 text-white rounded-md disabled:opacity-50"
              @click="save"
            >
              {{ saving ? '…' : 'Enregistrer' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </DefaultLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import DefaultLayout from '@/components/layout/DefaultLayout.vue'
import { listSocietesArray } from '@/services/societeService'
import { listAgentsArray, createAgent, updateAgent, deleteAgent } from '@/services/agentService'

const agents = ref([])
const societeOptions = ref([])
const filterSociete = ref('')
const loading = ref(false)
const error = ref('')
const showModal = ref(false)
const editing = ref(false)
const saving = ref(false)

const emptyForm = () => ({
  idAgent: 0,
  idSociete: '',
  nomComplet: '',
  emailAgent: '',
  telephoneAgent: '',
  roleAgent: '',
  fonction: '',
  matricule: '',
  genre: 'M',
  dateNaissance: '1990-01-01',
  adresseResidence: '',
  statut: true,
})

const form = ref(emptyForm())

const filteredAgents = computed(() => {
  if (!filterSociete.value) return agents.value
  const id = Number(filterSociete.value)
  return agents.value.filter((a) => Number(a.idSociete) === id)
})

function societeLabel(idSociete) {
  const s = societeOptions.value.find((x) => Number(x.idSociete) === Number(idSociete))
  return s?.nom || (idSociete ? '#' + idSociete : '—')
}

async function loadSocietes() {
  try {
    societeOptions.value = await listSocietesArray()
  } catch {
    societeOptions.value = []
  }
}

async function loadAgents() {
  loading.value = true
  error.value = ''
  try {
    agents.value = await listAgentsArray()
  } catch (e) {
    error.value = e?.message || 'Erreur chargement agents'
    agents.value = []
  } finally {
    loading.value = false
  }
}

async function loadAll() {
  await Promise.all([loadSocietes(), loadAgents()])
}

function openCreate() {
  editing.value = false
  form.value = emptyForm()
  showModal.value = true
}

function openEdit(a) {
  editing.value = true
  const d = a.dateNaissance ? String(a.dateNaissance).slice(0, 10) : '1990-01-01'
  form.value = {
    idAgent: a.idAgent,
    idSociete: String(a.idSociete || ''),
    nomComplet: a.nomComplet || '',
    emailAgent: a.emailAgent || '',
    telephoneAgent: a.telephoneAgent || '',
    roleAgent: a.roleAgent || '',
    fonction: a.fonction || '',
    matricule: a.matricule || '',
    genre: a.genre === 'F' ? 'F' : 'M',
    dateNaissance: d,
    adresseResidence: a.adresseResidence || '',
    statut: a.statut !== false,
  }
  showModal.value = true
}

function closeModal() {
  showModal.value = false
}

async function save() {
  if (!form.value.nomComplet?.trim() || !form.value.emailAgent?.trim()) {
    alert('Nom et email sont obligatoires')
    return
  }
  if (!editing.value) {
    const sid = Number(form.value.idSociete)
    if (!Number.isFinite(sid) || sid <= 0) {
      alert('Choisissez une société')
      return
    }
  }
  saving.value = true
  try {
    if (editing.value) {
      await updateAgent(form.value.idAgent, {
        idAgent: form.value.idAgent,
        nomComplet: form.value.nomComplet,
        genre: form.value.genre,
        dateNaissance: form.value.dateNaissance,
        emailAgent: form.value.emailAgent,
        telephoneAgent: form.value.telephoneAgent,
        roleAgent: form.value.roleAgent,
        fonction: form.value.fonction,
        adresseResidence: form.value.adresseResidence,
      })
    } else {
      await createAgent({
        ...form.value,
        idSociete: Number(form.value.idSociete),
      })
    }
    closeModal()
    await loadAgents()
  } catch (e) {
    alert(e?.message || 'Erreur enregistrement')
  } finally {
    saving.value = false
  }
}

async function remove(a) {
  if (!confirm('Supprimer l’agent « ' + a.nomComplet + ' » ?')) return
  try {
    await deleteAgent(a.idAgent)
    await loadAgents()
  } catch (e) {
    alert(e?.message || 'Suppression impossible')
  }
}

onMounted(loadAll)
</script>
