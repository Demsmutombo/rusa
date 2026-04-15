<template>
  <DefaultLayout>
    <div class="space-y-4">
      <!-- Header -->
      <div class="rusa-gradient-header flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-2xl font-bold text-white">
            Gestion des Transporteurs
          </h1>
          <p class="text-primary-100">
            Validez et gérez les comptes des transporteurs
          </p>
        </div>
        <div class="flex items-center gap-3">
          <button type="button" class="rusa-btn-primary bg-white text-primary-800 hover:bg-primary-50">
            Exporter la liste
          </button>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div class="rusa-card p-6">
          <div class="flex items-center">
            <div class="p-3 bg-blue-100 rounded-lg">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Total Transporteurs</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.total }}</p>
            </div>
          </div>
        </div>

        <div class="rusa-card p-6">
          <div class="flex items-center">
            <div class="p-3 bg-green-100 rounded-lg">
              <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Validés</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.validated }}</p>
            </div>
          </div>
        </div>

        <div class="rusa-card p-6">
          <div class="flex items-center">
            <div class="p-3 bg-yellow-100 rounded-lg">
              <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">En attente</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.pending }}</p>
            </div>
          </div>
        </div>

        <div class="rusa-card p-6">
          <div class="flex items-center">
            <div class="p-3 bg-red-100 rounded-lg">
              <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Suspendus</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.suspended }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="rusa-card">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Rechercher</label>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Nom, email, entreprise..."
              class="w-full px-3 py-2 border border-primary-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Statut</label>
            <select
              v-model="statusFilter"
              class="w-full px-3 py-2 border border-primary-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Tous les statuts</option>
              <option value="validated">Validés</option>
              <option value="pending">En attente</option>
              <option value="suspended">Suspendus</option>
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

      <!-- Transporteurs Table -->
      <div class="rusa-panel">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-primary-50/80 dark:bg-primary-950/50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transporteur
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Entreprise
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Véhicules
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date inscription
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-primary-100 dark:divide-primary-800/50">
              <tr v-for="transporteur in filteredTransporteurs" :key="transporteur.id">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                      <span class="text-sm font-medium">{{ transporteur.name.charAt(0) }}</span>
                    </div>
                    <div class="ml-4">
                      <p class="text-sm font-medium text-gray-900">{{ transporteur.name }}</p>
                      <p class="text-sm text-gray-500">{{ transporteur.email }}</p>
                      <p class="text-xs text-gray-400">{{ transporteur.phone }}</p>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div>
                    <p class="text-sm font-medium text-gray-900">{{ transporteur.company }}</p>
                    <p class="text-sm text-gray-500">{{ transporteur.siret }}</p>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ transporteur.vehicles }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-2 py-1 text-xs font-medium rounded-full"
                        :class="getStatusBadgeClass(transporteur.status)">
                    {{ transporteur.status }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ transporteur.createdAt }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    @click="viewDetails(transporteur)"
                    class="text-primary-600 hover:text-primary-800 mr-3"
                  >
                    Détails
                  </button>
                  <button
                    v-if="transporteur.status === 'pending'"
                    @click="validateTransporteur(transporteur)"
                    class="text-green-600 hover:text-green-900 mr-3"
                  >
                    Valider
                  </button>
                  <button
                    v-if="transporteur.status === 'validated'"
                    @click="suspendTransporteur(transporteur)"
                    class="text-yellow-600 hover:text-yellow-900 mr-3"
                  >
                    Suspendre
                  </button>
                  <button
                    v-if="transporteur.status === 'suspended'"
                    @click="reactivateTransporteur(transporteur)"
                    class="text-green-600 hover:text-green-900 mr-3"
                  >
                    Réactiver
                  </button>
                  <button
                    @click="deleteTransporteur(transporteur)"
                    class="text-red-600 hover:text-red-900"
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </DefaultLayout>
</template>

<script setup>
import { ref, computed } from 'vue'
import DefaultLayout from '@/components/layout/DefaultLayout.vue'
import { notify } from '@/utils/notify'

const transporteurs = ref([
  {
    id: 1,
    name: 'Marie Martin',
    email: 'marie.martin@transport-rapide.fr',
    phone: '+33 6 23 45 67 89',
    company: 'Transport Rapide SARL',
    siret: '123 456 789 00012',
    vehicles: 8,
    status: 'validated',
    createdAt: '2024-01-08'
  },
  {
    id: 2,
    name: 'Pierre Bernard',
    email: 'pierre.bernard@voyage-express.com',
    phone: '+33 6 34 56 78 90',
    company: 'Voyage Express',
    siret: '987 654 321 00098',
    vehicles: 4,
    status: 'pending',
    createdAt: '2024-01-12'
  },
  {
    id: 3,
    name: 'Sophie Petit',
    email: 'sophie.petit@speed-trans.fr',
    phone: '+33 6 45 67 89 01',
    company: 'Speed Transport',
    siret: '456 789 123 00045',
    vehicles: 12,
    status: 'validated',
    createdAt: '2024-01-05'
  },
  {
    id: 4,
    name: 'Jean Durand',
    email: 'jean.durand@rapid-move.fr',
    phone: '+33 6 56 78 90 12',
    company: 'Rapid Move',
    siret: '789 123 456 00078',
    vehicles: 6,
    status: 'suspended',
    createdAt: '2024-01-03'
  },
  {
    id: 5,
    name: 'Luc',
    email: 'lucas.moreau@city-link.fr',
    phone: '+33 6 67 89 01 23',
    company: 'City Link Transport',
    siret: '321 654 987 00032',
    vehicles: 3,
    status: 'pending',
    createdAt: '2024-01-15'
  }
])

const searchQuery = ref('')
const statusFilter = ref('')

const stats = computed(() => {
  return {
    total: transporteurs.value.length,
    validated: transporteurs.value.filter(t => t.status === 'validated').length,
    pending: transporteurs.value.filter(t => t.status === 'pending').length,
    suspended: transporteurs.value.filter(t => t.status === 'suspended').length
  }
})

const filteredTransporteurs = computed(() => {
  return transporteurs.value.filter(transporteur => {
    const matchesSearch = transporteur.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                         transporteur.email.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                         transporteur.company.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesStatus = !statusFilter.value || transporteur.status === statusFilter.value
    return matchesSearch && matchesStatus
  })
})

const getStatusBadgeClass = (status) => {
  const classes = {
    validated: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    suspended: 'bg-red-100 text-red-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

const resetFilters = () => {
  searchQuery.value = ''
  statusFilter.value = ''
}

const viewDetails = (transporteur) => {
  console.log('Voir détails:', transporteur)
}

const validateTransporteur = (transporteur) => {
  const index = transporteurs.value.findIndex(t => t.id === transporteur.id)
  if (index !== -1) {
    transporteurs.value[index].status = 'validated'
  }
}

const suspendTransporteur = async (transporteur) => {
  const ok = await notify.confirm(
    `Êtes-vous sûr de vouloir suspendre ${transporteur.name} ?`,
    'Suspendre le transporteur'
  )
  if (!ok) return
  const index = transporteurs.value.findIndex(t => t.id === transporteur.id)
  if (index !== -1) {
    transporteurs.value[index].status = 'suspended'
  }
  notify.toast.success('Transporteur suspendu')
}

const reactivateTransporteur = (transporteur) => {
  const index = transporteurs.value.findIndex(t => t.id === transporteur.id)
  if (index !== -1) {
    transporteurs.value[index].status = 'validated'
  }
}

const deleteTransporteur = async (transporteur) => {
  const ok = await notify.confirm(
    `Êtes-vous sûr de vouloir supprimer ${transporteur.name} ? Cette action est irréversible.`,
    'Supprimer le transporteur'
  )
  if (!ok) return
  const index = transporteurs.value.findIndex(t => t.id === transporteur.id)
  if (index !== -1) {
    transporteurs.value.splice(index, 1)
  }
  notify.toast.success('Transporteur supprimé')
}
</script>

