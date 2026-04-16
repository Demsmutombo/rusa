<template>
  <DefaultLayout>
    <div class="space-y-4">
      <!-- Header -->
      <div class="rusa-gradient-header flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-2xl font-bold text-white">
            Gestion des Utilisateurs
          </h1>
          <p class="text-primary-100">
            Gérez tous les utilisateurs de la plateforme
          </p>
        </div>
        <div class="flex items-center gap-3">
          <button
            @click="showAddUserModal = true"
            class="rusa-btn-primary bg-white text-primary-800 hover:bg-primary-50"
          >
            Ajouter un utilisateur
          </button>
        </div>
      </div>

      <!-- Filters -->
      <div class="rusa-card">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Rechercher</label>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Nom, email..."
              class="w-full px-3 py-2 border border-primary-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Rôle</label>
            <select
              v-model="roleFilter"
              class="w-full px-3 py-2 border border-primary-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Tous les rôles</option>
              <option value="admin">Admin</option>
              <option value="transporteur">Transporteur</option>
              <option value="client">Client</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Statut</label>
            <select
              v-model="statusFilter"
              class="w-full px-3 py-2 border border-primary-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Tous les statuts</option>
              <option value="actif">Actif</option>
              <option value="inactif">Inactif</option>
            </select>
          </div>
          <div class="flex items-end">
            <button
              @click="resetFilters"
              class="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            >
              Réinitialiser
            </button>
          </div>
        </div>
      </div>

      <p v-if="listError" class="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
        {{ listError }}
      </p>

      <!-- Users Table -->
      <div class="rusa-panel">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-primary-50/80 dark:bg-primary-950/50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Utilisateur
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rôle
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date d'inscription
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-primary-100 dark:divide-primary-800/50">
              <tr v-if="listLoading">
                <td colspan="5" class="px-6 py-8 text-center text-gray-500">
                  Chargement…
                </td>
              </tr>
              <template v-else>
              <tr v-for="user in filteredUsers" :key="user.id">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                      <span class="text-sm font-medium">{{ (user.name || '?').charAt(0) }}</span>
                    </div>
                    <div class="ml-4">
                      <p class="text-sm font-medium text-gray-900">{{ user.name }}</p>
                      <p class="text-sm text-gray-500">{{ user.email }}</p>
                      <p class="text-xs text-gray-400">{{ user.phone }}</p>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-2 py-1 text-xs font-medium rounded-full"
                        :class="getRoleBadgeClass(user.role)">
                    {{ user.role }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-2 py-1 text-xs font-medium rounded-full"
                        :class="getStatusBadgeClass(user.status)">
                    {{ user.status }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ user.createdAt }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    @click="editUser(user)"
                    class="text-primary-600 hover:text-primary-800 mr-3"
                  >
                    Modifier
                  </button>
                  <button
                    v-if="user.status === 'actif'"
                    @click="suspendUser(user)"
                    class="text-yellow-600 hover:text-yellow-900 mr-3"
                  >
                    Suspendre
                  </button>
                  <button
                    v-else
                    @click="activateUser(user)"
                    class="text-green-600 hover:text-green-900 mr-3"
                  >
                    Activer
                  </button>
                  <button
                    @click="deleteUser(user)"
                    class="text-red-600 hover:text-red-900"
                  >
                    Désactiver
                  </button>
                </td>
              </tr>
              </template>
            </tbody>
          </table>
        </div>
        <p v-if="!listLoading" class="text-sm text-gray-500 px-4 py-2 bg-gray-50">
          {{ totalCount }} utilisateur(s) — page {{ page }} ({{ pageSize }} / page)
          <span v-if="roleFilter" class="text-primary-600"> — filtre rôle : {{ roleFilter }}</span>
        </p>
      </div>

      <Modal
        v-model="showAddUserModal"
        :title="(editingUser ? 'Modifier' : 'Ajouter') + ' un utilisateur'"
        size="sm"
      >
            <div class="mt-4 space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
                <input
                  v-model="userForm.name"
                  type="text"
                  class="w-full px-3 py-2 border border-primary-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  v-model="userForm.email"
                  type="email"
                  class="w-full px-3 py-2 border border-primary-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                <input
                  v-model="userForm.phone"
                  type="tel"
                  class="w-full px-3 py-2 border border-primary-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Rôle</label>
                <select
                  v-model="userForm.role"
                  class="w-full px-3 py-2 border border-primary-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Sélectionner un rôle</option>
                  <option value="admin">Admin</option>
                  <option value="transporteur">Transporteur</option>
                  <option value="client">Client</option>
                </select>
              </div>
              <div v-if="!editingUser">
                <label class="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
                <input
                  v-model="userForm.password"
                  type="password"
                  class="w-full px-3 py-2 border border-primary-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
            <template #footer>
            <div class="flex justify-end space-x-3">
              <button
                @click="closeUserModal"
                class="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                Annuler
              </button>
              <button
                @click="saveUser"
                :disabled="saving"
                class="rusa-btn-primary disabled:opacity-50"
              >
                {{ saving ? 'En cours…' : (editingUser ? 'Modifier' : 'Ajouter') }}
              </button>
            </div>
            </template>
      </Modal>
    </div>
  </DefaultLayout>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import DefaultLayout from '@/components/layout/DefaultLayout.vue'
import Modal from '@/components/ui/Modal.vue'
import {
  listUtilisateurs,
  listUtilisateursByRoleId,
  unwrapUtilisateurList,
  filterUtilisateursForCurrentSociete,
  mapUtilisateurToRow,
  createUtilisateur,
  updateUtilisateur,
  deactivateUtilisateur,
  toggleStatutUtilisateur,
  getIdRoleForFormSlug,
  slugFromIdRole,
} from '@/services/utilisateurService'
import { notify } from '@/utils/notify'

const users = ref([])
const listLoading = ref(false)
const listError = ref('')
const page = ref(1)
const pageSize = ref(50)
const totalCount = ref(0)
const saving = ref(false)

const searchQuery = ref('')
const roleFilter = ref('')
const statusFilter = ref('')
const showAddUserModal = ref(false)
const editingUser = ref(null)

const userForm = ref({
  name: '',
  email: '',
  phone: '',
  role: '',
  password: '',
})

async function loadUsers() {
  listLoading.value = true
  listError.value = ''
  try {
    let raw
    if (roleFilter.value) {
      const roleId = getIdRoleForFormSlug(roleFilter.value)
      if (!roleId) {
        throw new Error('Id de rôle inconnu : vérifiez VITE_ID_ROLE_* dans .env')
      }
      raw = await listUtilisateursByRoleId(roleId, {
        page: page.value,
        pageSize: pageSize.value,
      })
    } else {
      raw = await listUtilisateurs({ page: page.value, pageSize: pageSize.value })
    }
    const { items } = unwrapUtilisateurList(raw)
    const scoped = filterUtilisateursForCurrentSociete(items)
    users.value = scoped.map(mapUtilisateurToRow)
    totalCount.value = scoped.length
  } catch (e) {
    listError.value = e?.message || 'Impossible de charger les utilisateurs'
    users.value = []
    totalCount.value = 0
    notify.error('Chargement impossible', listError.value)
  } finally {
    listLoading.value = false
  }
}

watch(roleFilter, () => {
  if (page.value !== 1) page.value = 1
  else loadUsers()
})

watch([page, pageSize], () => {
  loadUsers()
})

onMounted(() => {
  loadUsers()
})

const filteredUsers = computed(() => {
  return users.value.filter((user) => {
    const q = searchQuery.value.toLowerCase()
    const matchesSearch =
      !q ||
      user.name.toLowerCase().includes(q) ||
      user.email.toLowerCase().includes(q)
    const matchesStatus = !statusFilter.value || user.status === statusFilter.value
    return matchesSearch && matchesStatus
  })
})

const getRoleBadgeClass = (role) => {
  const classes = {
    admin: 'bg-purple-100 text-purple-800',
    transporteur: 'bg-blue-100 text-blue-800',
    transport: 'bg-blue-100 text-blue-800',
    client: 'bg-green-100 text-green-800',
  }
  if (String(role).startsWith('rôle #')) return 'bg-amber-100 text-amber-900'
  return classes[role] || 'bg-gray-100 text-gray-800'
}

const getStatusBadgeClass = (status) => {
  const classes = {
    actif: 'bg-green-100 text-green-800',
    inactif: 'bg-gray-100 text-gray-800',
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

const resetFilters = () => {
  searchQuery.value = ''
  roleFilter.value = ''
  statusFilter.value = ''
  page.value = 1
  loadUsers()
}

const editUser = (user) => {
  editingUser.value = user
  const raw = user._raw || {}
  let formRole = user.role
  if (formRole === '—' || String(formRole).startsWith('rôle #')) {
    formRole = slugFromIdRole(raw.idRole ?? raw.IdRole) || ''
  }
  userForm.value = {
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: formRole,
    password: '',
  }
  showAddUserModal.value = true
}

const saveUser = async () => {
  const idRole = getIdRoleForFormSlug(userForm.value.role)
  if (!editingUser.value && (!idRole || !userForm.value.password)) {
    await notify.warning(
      'Champs requis',
      'Rôle et mot de passe sont obligatoires pour un nouvel utilisateur.'
    )
    return
  }
  saving.value = true
  try {
    if (editingUser.value) {
      const raw = editingUser.value._raw || {}
      const dateNaissance = raw.dateNaissance
        ? String(raw.dateNaissance).slice(0, 10)
        : '1990-01-01'
      await updateUtilisateur(editingUser.value.idUtilisateur, {
        idUtilisateur: editingUser.value.idUtilisateur,
        nomComplet: userForm.value.name,
        email: userForm.value.email,
        telephone: userForm.value.phone,
        photoUrl: raw.photoUrl || '',
        lieuNaissance: raw.lieuNaissance || '',
        dateNaissance,
        genre: raw.genre || 'M',
      })
    } else {
      await createUtilisateur({
        nomComplet: userForm.value.name,
        email: userForm.value.email,
        motDePasse: userForm.value.password,
        telephone: userForm.value.phone || '',
        photoUrl: '',
        lieuNaissance: '',
        dateNaissance: '1990-01-01',
        genre: 'M',
        idRole,
        idSociete: 0,
        statut: true,
      })
    }
    closeUserModal()
    await loadUsers()
    notify.toast.success(
      editingUser.value ? 'Utilisateur mis à jour.' : 'Utilisateur créé.'
    )
  } catch (e) {
    notify.error('Enregistrement impossible', e?.message || 'Erreur inconnue.')
  } finally {
    saving.value = false
  }
}

const closeUserModal = () => {
  showAddUserModal.value = false
  editingUser.value = null
  userForm.value = {
    name: '',
    email: '',
    phone: '',
    role: '',
    password: ''
  }
}

const suspendUser = async (user) => {
  try {
    await toggleStatutUtilisateur(user.idUtilisateur)
    await loadUsers()
  } catch (e) {
    notify.error('Statut', e?.message || 'Impossible de modifier le statut.')
  }
}

const activateUser = suspendUser

const deleteUser = async (user) => {
  const ok = await notify.confirm(
    'Désactiver « ' +
      user.name +
      ' » ? Le compte passera en inactif (aucune suppression en base).',
    'Confirmation'
  )
  if (!ok) return
  try {
    await deactivateUtilisateur(user.idUtilisateur, user._raw)
    await loadUsers()
    notify.toast.success('Utilisateur désactivé.')
  } catch (e) {
    notify.error('Désactivation impossible', e?.message || 'Erreur inconnue.')
  }
}
</script>

