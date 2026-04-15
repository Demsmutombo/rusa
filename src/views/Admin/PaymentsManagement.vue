<template>
  <DefaultLayout>
    <div class="space-y-4">
      <!-- Header -->
      <div class="rusa-gradient-header flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-2xl font-bold text-white">
            Gestion des Paiements
          </h1>
          <p class="text-primary-100">
            Suivez et gérez tous les paiements de la plateforme
          </p>
        </div>
        <div class="flex items-center gap-3">
          <button type="button" class="rusa-btn-primary bg-white text-primary-800 hover:bg-primary-50">
            Exporter les paiements
          </button>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div class="rusa-card p-6">
          <div class="flex items-center">
            <div class="p-3 bg-blue-100 rounded-lg">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Total Paiements</p>
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
              <p class="text-sm font-medium text-gray-600">Complétés</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.completed }}</p>
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
            <div class="p-3 bg-purple-100 rounded-lg">
              <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Revenus totaux</p>
              <p class="text-2xl font-bold text-gray-900">€{{ stats.totalRevenue.toLocaleString() }}</p>
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
              placeholder="Client, réservation..."
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
              <option value="completed">Complétés</option>
              <option value="pending">En attente</option>
              <option value="failed">Échoués</option>
              <option value="refunded">Remboursés</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Méthode</label>
            <select
              v-model="methodFilter"
              class="w-full px-3 py-2 border border-primary-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Toutes les méthodes</option>
              <option value="card">Carte bancaire</option>
              <option value="paypal">PayPal</option>
              <option value="transfer">Virement bancaire</option>
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

      <!-- Payments Table -->
      <div class="rusa-panel">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-primary-50/80 dark:bg-primary-950/50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Paiement
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Réservation
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Montant
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Méthode
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-primary-100 dark:divide-primary-800/50">
              <tr v-for="payment in filteredPayments" :key="payment.id">
                <td class="px-6 py-4 whitespace-nowrap">
                  <p class="text-sm font-medium text-gray-900">#{{ payment.id }}</p>
                  <p class="text-xs text-gray-500">{{ payment.transactionId }}</p>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                      <span class="text-xs font-medium">{{ payment.clientName.charAt(0) }}</span>
                    </div>
                    <div class="ml-3">
                      <p class="text-sm font-medium text-gray-900">{{ payment.clientName }}</p>
                      <p class="text-sm text-gray-500">{{ payment.clientEmail }}</p>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div>
                    <p class="text-sm font-medium text-gray-900">#{{ payment.reservationId }}</p>
                    <p class="text-sm text-gray-500">{{ payment.tripRoute }}</p>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <p class="text-sm font-medium text-gray-900">€{{ payment.amount }}</p>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <component :is="getMethodIcon(payment.method)" class="w-5 h-5 text-gray-600 mr-2" />
                    <span class="text-sm text-gray-900">{{ getMethodName(payment.method) }}</span>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div>
                    <p class="text-sm text-gray-900">{{ payment.date }}</p>
                    <p class="text-sm text-gray-500">{{ payment.time }}</p>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-2 py-1 text-xs font-medium rounded-full"
                        :class="getStatusBadgeClass(payment.status)">
                    {{ payment.status }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    @click="viewPaymentDetails(payment)"
                    class="text-primary-600 hover:text-primary-800 mr-3"
                  >
                    Détails
                  </button>
                  <button
                    v-if="payment.status === 'failed'"
                    @click="retryPayment(payment)"
                    class="text-yellow-600 hover:text-yellow-900 mr-3"
                  >
                    Réessayer
                  </button>
                  <button
                    v-if="payment.status === 'completed' && canRefund(payment)"
                    @click="refundPayment(payment)"
                    class="text-red-600 hover:text-red-900"
                  >
                    Rembourser
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

const payments = ref([
  {
    id: 1,
    transactionId: 'txn_123456789',
    clientName: 'Jean Dupont',
    clientEmail: 'jean.dupont@email.com',
    reservationId: 1001,
    tripRoute: 'Paris → Lyon',
    amount: 90,
    method: 'card',
    date: '2024-01-15',
    time: '14:30',
    status: 'completed'
  },
  {
    id: 2,
    transactionId: 'txn_234567890',
    clientName: 'Marie Martin',
    clientEmail: 'marie.martin@email.com',
    reservationId: 1002,
    tripRoute: 'Lyon → Marseille',
    amount: 55,
    method: 'paypal',
    date: '2024-01-16',
    time: '09:15',
    status: 'pending'
  },
  {
    id: 3,
    transactionId: 'txn_345678901',
    clientName: 'Pierre Bernard',
    clientEmail: 'pierre.bernard@email.com',
    reservationId: 1003,
    tripRoute: 'Paris → Bordeaux',
    amount: 360,
    method: 'transfer',
    date: '2024-01-14',
    time: '11:20',
    status: 'completed'
  },
  {
    id: 4,
    transactionId: 'txn_456789012',
    clientName: 'Sophie Petit',
    clientEmail: 'sophie.petit@email.com',
    reservationId: 1004,
    tripRoute: 'Marseille → Nice',
    amount: 70,
    method: 'card',
    date: '2024-01-13',
    time: '16:45',
    status: 'failed'
  },
  {
    id: 5,
    transactionId: 'txn_567890123',
    clientName: 'Luc',
    clientEmail: 'lucas.moreau@email.com',
    reservationId: 1005,
    tripRoute: 'Lille → Bruxelles',
    amount: 112,
    method: 'paypal',
    date: '2024-01-12',
    time: '10:30',
    status: 'refunded'
  }
])

const searchQuery = ref('')
const statusFilter = ref('')
const methodFilter = ref('')

const stats = computed(() => {
  return {
    total: payments.value.length,
    completed: payments.value.filter(p => p.status === 'completed').length,
    pending: payments.value.filter(p => p.status === 'pending').length,
    totalRevenue: payments.value
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0)
  }
})

const filteredPayments = computed(() => {
  return payments.value.filter(payment => {
    const matchesSearch = payment.clientName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                         payment.clientEmail.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                         payment.transactionId.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                         payment.tripRoute.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesStatus = !statusFilter.value || payment.status === statusFilter.value
    const matchesMethod = !methodFilter.value || payment.method === methodFilter.value
    return matchesSearch && matchesStatus && matchesMethod
  })
})

const getStatusBadgeClass = (status) => {
  const classes = {
    completed: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    failed: 'bg-red-100 text-red-800',
    refunded: 'bg-gray-100 text-gray-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

const getMethodName = (method) => {
  const names = {
    card: 'Carte bancaire',
    paypal: 'PayPal',
    transfer: 'Virement bancaire'
  }
  return names[method] || method
}

const getMethodIcon = (method) => {
  // Simple SVG icons for payment methods
  const icons = {
    card: 'svg',
    paypal: 'svg',
    transfer: 'svg'
  }
  return icons[method]
}

const canRefund = (payment) => {
  // Simple logic refund if completed and less than 7 days old
  const paymentDate = new Date(payment.date)
  const today = new Date()
  const daysDiff = Math.floor((today.getTime() - paymentDate.getTime()) / (1000 * 60 * 60 * 24))
  return daysDiff <= 7
}

const resetFilters = () => {
  searchQuery.value = ''
  statusFilter.value = ''
  methodFilter.value = ''
}

const viewPaymentDetails = (payment) => {
  console.log('Voir détails du paiement:', payment)
}

const retryPayment = (payment) => {
  console.log('Réessayer le paiement:', payment)
}

const refundPayment = async (payment) => {
  const ok = await notify.confirm(
    `Êtes-vous sûr de vouloir rembourser €${payment.amount} ?`,
    'Rembourser le paiement'
  )
  if (!ok) return
  const index = payments.value.findIndex(p => p.id === payment.id)
  if (index !== -1) {
    payments.value[index].status = 'refunded'
  }
  notify.toast.success('Remboursement enregistré')
}
</script>

