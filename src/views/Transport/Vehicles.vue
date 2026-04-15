<template>
  <DefaultLayout>
    <div class="space-y-4">
      <!-- Header -->
      <div class="rusa-gradient-header flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-2xl font-bold text-white">
            Gestion des Véhicules
          </h1>
          <p class="text-primary-100">
            Gérez votre flotte de véhicules
          </p>
        </div>
        <div class="flex items-center gap-3">
          <button
            type="button"
            @click="showAddVehicleModal = true"
            class="rusa-btn-primary bg-white text-primary-800 hover:bg-primary-50"
          >
            Ajouter un véhicule
          </button>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div class="rusa-card p-6">
          <div class="flex items-center">
            <div class="p-3 bg-blue-100 rounded-lg">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0zM12.5 12a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Total Véhicules</p>
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
              <p class="text-sm font-medium text-gray-600">Actifs</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.active }}</p>
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
              <p class="text-sm font-medium text-gray-600">En maintenance</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.maintenance }}</p>
            </div>
          </div>
        </div>

        <div class="rusa-card p-6">
          <div class="flex items-center">
            <div class="p-3 bg-purple-100 rounded-lg">
              <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Capacité totale</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.totalCapacity }}</p>
            </div>
          </div>
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
              placeholder="Marque, modèle, immatriculation..."
              class="w-full px-3 py-2 border border-primary-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              v-model="typeFilter"
              class="w-full px-3 py-2 border border-primary-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tous les types</option>
              <option value="bus">Bus</option>
              <option value="minibus">Minibus</option>
              <option value="car">Voiture</option>
              <option value="van">Fourgonnette</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Statut</label>
            <select
              v-model="statusFilter"
              class="w-full px-3 py-2 border border-primary-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tous les statuts</option>
              <option value="active">Actifs</option>
              <option value="maintenance">En maintenance</option>
              <option value="inactive">Inactifs</option>
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

      <!-- Vehicles Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="vehicle in filteredVehicles"
          :key="vehicle.id"
          class="rusa-panel hover:shadow-lg transition-shadow"
        >
          <div class="relative">
            <img
              :src="vehicle.image"
              :alt="vehicle.brand + ' ' + vehicle.model"
              class="w-full h-48 object-cover"
            />
            <span
              class="absolute top-2 right-2 px-2 py-1 text-xs font-medium rounded-full"
              :class="getStatusBadgeClass(vehicle.status)"
            >
              {{ vehicle.status }}
            </span>
          </div>
          <div class="p-4">
            <div class="flex items-center justify-between mb-2">
              <h3 class="text-lg font-semibold text-gray-900">
                {{ vehicle.brand }} {{ vehicle.model }}
              </h3>
              <span class="text-sm text-gray-500">{{ vehicle.year }}</span>
            </div>
            
            <div class="space-y-2 text-sm">
              <div class="flex items-center text-gray-600">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 20l4-16m2 16l4-16M6 9l14 0M6 15l14 0" />
                </svg>
                {{ vehicle.licensePlate }}
              </div>
              
              <div class="flex items-center text-gray-600">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {{ vehicle.capacity }} places
              </div>
              
              <div class="flex items-center text-gray-600">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {{ vehicle.fuelType }}
              </div>
              
              <div class="flex items-center text-gray-600">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {{ vehicle.type }}
              </div>
            </div>
            
            <div class="mt-4 pt-4 border-t border-gray-200">
              <div class="flex items-center justify-between text-sm text-gray-500">
                <span>Dernière maintenance: {{ vehicle.lastMaintenance }}</span>
              </div>
            </div>
            
            <div class="mt-4 flex justify-between">
              <button
                @click="editVehicle(vehicle)"
                class="px-3 py-2 text-sm bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200"
              >
                Modifier
              </button>
              <button
                v-if="vehicle.status === 'active'"
                @click="toggleMaintenance(vehicle)"
                class="px-3 py-2 text-sm bg-yellow-100 text-yellow-800 rounded-md hover:bg-yellow-200"
              >
                Maintenance
              </button>
              <button
                v-if="vehicle.status === 'maintenance'"
                @click="toggleMaintenance(vehicle)"
                class="px-3 py-2 text-sm bg-green-100 text-green-800 rounded-md hover:bg-green-200"
              >
                Activer
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Add/Edit Vehicle Modal -->
      <div v-if="showAddVehicleModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
          <div class="mt-3">
            <h3 class="text-lg font-medium text-gray-900">
              {{ editingVehicle ? 'Modifier' : 'Ajouter' }} un véhicule
            </h3>
            <div class="mt-4 space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Marque</label>
                <input
                  v-model="vehicleForm.brand"
                  type="text"
                  class="w-full px-3 py-2 border border-primary-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Modèle</label>
                <input
                  v-model="vehicleForm.model"
                  type="text"
                  class="w-full px-3 py-2 border border-primary-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Immatriculation</label>
                <input
                  v-model="vehicleForm.licensePlate"
                  type="text"
                  class="w-full px-3 py-2 border border-primary-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Capacité</label>
                <input
                  v-model.number="vehicleForm.capacity"
                  type="number"
                  class="w-full px-3 py-2 border border-primary-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  v-model="vehicleForm.type"
                  class="w-full px-3 py-2 border border-primary-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Sélectionner un type</option>
                  <option value="bus">Bus</option>
                  <option value="minibus">Minibus</option>
                  <option value="car">Voiture</option>
                  <option value="van">Fourgonnette</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Type de carburant</label>
                <select
                  v-model="vehicleForm.fuelType"
                  class="w-full px-3 py-2 border border-primary-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="essence">Essence</option>
                  <option value="diesel">Diesel</option>
                  <option value="electric">Électrique</option>
                  <option value="hybrid">Hybride</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Année</label>
                <input
                  v-model.number="vehicleForm.year"
                  type="number"
                  class="w-full px-3 py-2 border border-primary-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div class="mt-6 flex justify-end space-x-3">
              <button
                @click="closeVehicleModal"
                class="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                Annuler
              </button>
              <button
                @click="saveVehicle"
                class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {{ editingVehicle ? 'Modifier' : 'Ajouter' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </DefaultLayout>
</template>

<script setup>
import { ref, computed } from 'vue'
import DefaultLayout from '@/components/layout/DefaultLayout.vue'

const vehicles = ref([
  {
    id: 1,
    brand: 'Mercedes-Benz',
    model: 'Sprinter',
    licensePlate: 'AB-123-CD',
    capacity: 15,
    type: 'van',
    fuelType: 'Diesel',
    year: 2022,
    status: 'active',
    image: 'https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=Van',
    lastMaintenance: '2024-01-10'
  },
  {
    id: 2,
    brand: 'Renault',
    model: 'Trafic',
    licensePlate: 'DE-456-EF',
    capacity: 9,
    type: 'van',
    fuelType: 'Diesel',
    year: 2021,
    status: 'active',
    image: 'https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=Van',
    lastMaintenance: '2024-01-05'
  },
  {
    id: 3,
    brand: 'Iveco',
    model: 'Daily',
    licensePlate: 'FG-789-GH',
    capacity: 22,
    type: 'bus',
    fuelType: 'Diesel',
    year: 2020,
    status: 'maintenance',
    image: 'https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=Bus',
    lastMaintenance: '2024-01-15'
  },
  {
    id: 4,
    brand: 'Peugeot',
    model: 'Expert',
    licensePlate: 'HI-012-IJ',
    capacity: 8,
    type: 'van',
    fuelType: 'Diesel',
    year: 2023,
    status: 'active',
    image: 'https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=Van',
    lastMaintenance: '2024-01-08'
  },
  {
    id: 5,
    brand: 'Volkswagen',
    model: 'Transporter',
    licensePlate: 'JK-345-KL',
    capacity: 8,
    type: 'van',
    fuelType: 'Diesel',
    year: 2022,
    status: 'active',
    image: 'https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=Van',
    lastMaintenance: '2024-01-12'
  },
  {
    id: 6,
    brand: 'Mercedes-Benz',
    model: 'Tourismo',
    licensePlate: 'MN-678-OP',
    capacity: 50,
    type: 'bus',
    fuelType: 'Diesel',
    year: 2019,
    status: 'active',
    image: 'https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=Bus',
    lastMaintenance: '2024-01-20'
  }
])

const searchQuery = ref('')
const typeFilter = ref('')
const statusFilter = ref('')
const showAddVehicleModal = ref(false)
const editingVehicle = ref(null)

const vehicleForm = ref({
  brand: '',
  model: '',
  licensePlate: '',
  capacity: 8,
  type: '',
  fuelType: 'diesel',
  year: new Date().getFullYear()
})

const stats = computed(() => {
  return {
    total: vehicles.value.length,
    active: vehicles.value.filter(v => v.status === 'active').length,
    maintenance: vehicles.value.filter(v => v.status === 'maintenance').length,
    totalCapacity: vehicles.value.reduce((sum, v) => sum + v.capacity, 0)
  }
})

const filteredVehicles = computed(() => {
  return vehicles.value.filter(vehicle => {
    const matchesSearch = vehicle.brand.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                         vehicle.model.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                         vehicle.licensePlate.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesType = !typeFilter.value || vehicle.type === typeFilter.value
    const matchesStatus = !statusFilter.value || vehicle.status === statusFilter.value
    return matchesSearch && matchesType && matchesStatus
  })
})

const getStatusBadgeClass = (status) => {
  const classes = {
    active: 'bg-green-100 text-green-800',
    maintenance: 'bg-yellow-100 text-yellow-800',
    inactive: 'bg-red-100 text-red-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

const resetFilters = () => {
  searchQuery.value = ''
  typeFilter.value = ''
  statusFilter.value = ''
}

const editVehicle = (vehicle) => {
  editingVehicle.value = vehicle
  vehicleForm.value = {
    brand: vehicle.brand,
    model: vehicle.model,
    licensePlate: vehicle.licensePlate,
    capacity: vehicle.capacity,
    type: vehicle.type,
    fuelType: vehicle.fuelType,
    year: vehicle.year
  }
  showAddVehicleModal.value = true
}

const saveVehicle = () => {
  const today = new Date().toISOString().split('T')[0]
  if (editingVehicle.value) {
    const index = vehicles.value.findIndex(v => v.id === editingVehicle.value.id)
    if (index !== -1) {
      vehicles.value[index] = {
        ...vehicles.value[index],
        brand: vehicleForm.value.brand,
        model: vehicleForm.value.model,
        licensePlate: vehicleForm.value.licensePlate,
        capacity: Number(vehicleForm.value.capacity),
        type: vehicleForm.value.type,
        fuelType: vehicleForm.value.fuelType,
        year: Number(vehicleForm.value.year),
        status: 'active',
        image: `https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=${vehicleForm.value.type}`,
        lastMaintenance: today
      }
    }
  } else {
    const nextId = Math.max(0, ...vehicles.value.map(v => v.id)) + 1
    const newVehicle = {
      id: nextId,
      brand: vehicleForm.value.brand,
      model: vehicleForm.value.model,
      licensePlate: vehicleForm.value.licensePlate,
      capacity: Number(vehicleForm.value.capacity),
      type: vehicleForm.value.type,
      fuelType: vehicleForm.value.fuelType,
      year: Number(vehicleForm.value.year),
      status: 'active',
      image: `https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=${vehicleForm.value.type}`,
      lastMaintenance: today
    }
    vehicles.value.push(newVehicle)
  }
  closeVehicleModal()
}

const closeVehicleModal = () => {
  showAddVehicleModal.value = false
  editingVehicle.value = null
  vehicleForm.value = {
    brand: '',
    model: '',
    licensePlate: '',
    capacity: 8,
    type: '',
    fuelType: 'diesel',
    year: new Date().getFullYear()
  }
}

const toggleMaintenance = (vehicle) => {
  const index = vehicles.value.findIndex(v => v.id === vehicle.id)
  if (index !== -1) {
    vehicles.value[index].status = vehicle.status === 'active' ? 'maintenance' : 'active'
    if (vehicles.value[index].status === 'active') {
      vehicles.value[index].lastMaintenance = new Date().toISOString().split('T')[0]
    }
  }
}
</script>

