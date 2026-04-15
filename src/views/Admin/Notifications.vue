<template>
  <DefaultLayout>
    <div class="space-y-4">
      <!-- Header -->
      <div class="rusa-gradient-header flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 class="text-2xl font-bold text-white">
            Notifications
          </h1>
          <p class="text-primary-100">
            Gérez les notifications de la plateforme
          </p>
        </div>
        <div class="flex flex-wrap items-center gap-3">
          <button
            type="button"
            @click="markAllAsRead"
            class="rusa-btn-primary bg-white text-primary-800 hover:bg-primary-50"
          >
            Tout marquer comme lu
          </button>
          <button type="button" class="rusa-btn-ghost border-white/40 bg-white/10 text-white hover:bg-white/20">
            Paramètres
          </button>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div class="rusa-card p-6">
          <div class="flex items-center">
            <div class="p-3 bg-blue-100 rounded-lg">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v2.341C7.67 8.165 6 8.739 6 10v3.159c0 .538.214 1.055.595 1.405L5 17m5 0v3a2 2 0 002 2h6a2 2 0 002-2v-3m-6 0h6" />
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Total</p>
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
              <p class="text-sm font-medium text-gray-600">Lues</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.read }}</p>
            </div>
          </div>
        </div>

        <div class="rusa-card p-6">
          <div class="flex items-center">
            <div class="p-3 bg-yellow-100 rounded-lg">
              <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v2.341C7.67 8.165 6 8.739 6 10v3.159c0 .538.214 1.055.595 1.405L5 17m5 0v3a2 2 0 002 2h6a2 2 0 002-2v-3m-6 0h6" />
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Non lues</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.unread }}</p>
            </div>
          </div>
        </div>

        <div class="rusa-card p-6">
          <div class="flex items-center">
            <div class="p-3 bg-purple-100 rounded-lg">
              <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Aujourd'hui</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.today }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="rusa-card">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              v-model="typeFilter"
              class="w-full px-3 py-2 border border-primary-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Tous les types</option>
              <option value="system">Système</option>
              <option value="user">Utilisateur</option>
              <option value="booking">Réservation</option>
              <option value="payment">Paiement</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Statut</label>
            <select
              v-model="statusFilter"
              class="w-full px-3 py-2 border border-primary-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Tous les statuts</option>
              <option value="read">Lues</option>
              <option value="unread">Non lues</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Priorité</label>
            <select
              v-model="priorityFilter"
              class="w-full px-3 py-2 border border-primary-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Toutes les priorités</option>
              <option value="high">Haute</option>
              <option value="medium">Moyenne</option>
              <option value="low">Basse</option>
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

      <!-- Notifications List -->
      <div class="rusa-panel">
        <div class="divide-y divide-primary-100 dark:divide-primary-800/50">
          <div
            v-for="notification in filteredNotifications"
            :key="notification.id"
            class="p-6 hover:bg-gray-50 transition-colors"
            :class="{ 'bg-blue-50': !notification.read }"
          >
            <div class="flex items-start justify-between">
              <div class="flex items-start space-x-4 flex-1">
                <div
                  class="w-10 h-10 rounded-full flex items-center justify-center"
                  :class="getNotificationIconClass(notification.type)"
                >
                  <component
                    :is="getNotificationIcon(notification.type)"
                    class="w-5 h-5 text-white"
                  />
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center space-x-2 mb-1">
                    <h3 class="text-sm font-medium text-gray-900">
                      {{ notification.title }}
                    </h3>
                    <span
                      class="px-2 py-1 text-xs font-medium rounded-full"
                      :class="getPriorityBadgeClass(notification.priority)"
                    >
                      {{ notification.priority }}
                    </span>
                    <span
                      v-if="!notification.read"
                      class="w-2 h-2 bg-primary-500 rounded-full"
                    ></span>
                  </div>
                  <p class="text-sm text-gray-600 mb-2">
                    {{ notification.message }}
                  </p>
                  <div class="flex items-center space-x-4 text-xs text-gray-500">
                    <span>{{ notification.type }}</span>
                    <span>•</span>
                    <span>{{ notification.createdAt }}</span>
                    <span v-if="notification.user">•</span>
                    <span v-if="notification.user">{{ notification.user }}</span>
                  </div>
                </div>
              </div>
              <div class="flex items-center space-x-2 ml-4">
                <button
                  v-if="!notification.read"
                  @click="markAsRead(notification)"
                  class="text-blue-600 hover:text-blue-900 text-sm"
                >
                  Marquer comme lu
                </button>
                <button
                  @click="deleteNotification(notification)"
                  class="text-red-600 hover:text-red-900 text-sm"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="filteredNotifications.length === 0" class="text-center py-12">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707 0H4a1 1 0 01-1-1V6a1 1 0 011-1h1.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707 0H18a1 1 0 011 1v6z" />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">Aucune notification</h3>
        <p class="mt-1 text-sm text-gray-500">
          Aucune notification ne correspond à vos critères
        </p>
      </div>
    </div>
  </DefaultLayout>
</template>

<script setup>
import { ref, computed } from 'vue'
import DefaultLayout from '@/components/layout/DefaultLayout.vue'

const notifications = ref([
  {
    id: 1,
    title: 'Nouvelle inscription transporteur',
    message: 'Marie Martin a demandé à devenir transporteur sur la plateforme',
    type: 'user',
    priority: 'medium',
    read: false,
    createdAt: '2024-01-15 14:30',
    user: 'marie.martin@email.com'
  },
  {
    id: 2,
    title: 'Réservation annulée',
    message: 'Le client Jean Dupont a annulé sa réservation #1001',
    type: 'booking',
    priority: 'medium',
    read: true,
    createdAt: '2024-01-15 13:15',
    user: 'Jean Dupont'
  },
  {
    id: 3,
    title: 'Paiement échoué',
    message: 'Le paiement de la réservation #1003 a échoué',
    type: 'payment',
    priority: 'high',
    read: false,
    createdAt: '2024-01-15 12:00',
    user: 'Pierre Bernard'
  },
  {
    id: 4,
    title: 'Maintenance système',
    message: 'Une maintenance est prévue pour demain à 02:00',
    type: 'system',
    priority: 'high',
    read: true,
    createdAt: '2024-01-14 18:00'
  },
  {
    id: 5,
    title: 'Nouveau trajet ajouté',
    message: 'Le transporteur Speed Transport a ajouté un nouveau trajet Paris → Bordeaux',
    type: 'booking',
    priority: 'low',
    read: false,
    createdAt: '2024-01-14 16:30',
    user: 'Speed Transport'
  },
  {
    id: 6,
    title: 'Mise à jour des termes',
    message: 'Les termes et conditions ont été mis à jour',
    type: 'system',
    priority: 'medium',
    read: true,
    createdAt: '2024-01-14 10:00'
  }
])

const typeFilter = ref('')
const statusFilter = ref('')
const priorityFilter = ref('')

const stats = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  return {
    total: notifications.value.length,
    read: notifications.value.filter(n => n.read).length,
    unread: notifications.value.filter(n => !n.read).length,
    today: notifications.value.filter(n => n.createdAt.startsWith(today)).length
  }
})

const filteredNotifications = computed(() => {
  return notifications.value.filter(notification => {
    const matchesType = !typeFilter.value || notification.type === typeFilter.value
    const matchesStatus = !statusFilter.value || 
      (statusFilter.value === 'read' && notification.read) ||
      (statusFilter.value === 'unread' && !notification.read)
    const matchesPriority = !priorityFilter.value || notification.priority === priorityFilter.value
    return matchesType && matchesStatus && matchesPriority
  })
})

const getNotificationIcon = (type) => {
  const icons = {
    system: 'svg',
    user: 'svg', 
    booking: 'svg',
    payment: 'svg'
  }
  return icons[type] || 'svg'
}

const getNotificationIconClass = (type) => {
  const classes = {
    system: 'bg-gray-500',
    user: 'bg-blue-500',
    booking: 'bg-green-500',
    payment: 'bg-yellow-500'
  }
  return classes[type] || 'bg-gray-500'
}

const getPriorityBadgeClass = (priority) => {
  const classes = {
    high: 'bg-red-100 text-red-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-green-100 text-green-800'
  }
  return classes[priority] || 'bg-gray-100 text-gray-800'
}

const resetFilters = () => {
  typeFilter.value = ''
  statusFilter.value = ''
  priorityFilter.value = ''
}

const markAsRead = (notification) => {
  const index = notifications.value.findIndex(n => n.id === notification.id)
  if (index !== -1) {
    notifications.value[index].read = true
  }
}

const markAllAsRead = () => {
  notifications.value.forEach(notification => {
    notification.read = true
  })
}

const deleteNotification = (notification) => {
  if (confirm('Êtes-vous sûr de vouloir supprimer cette notification ?')) {
    const index = notifications.value.findIndex(n => n.id === notification.id)
    if (index !== -1) {
      notifications.value.splice(index, 1)
    }
  }
}
</script>

