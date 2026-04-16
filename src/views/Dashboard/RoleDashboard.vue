<template>
  <DefaultLayout>
    <SuperAdminDashboardView v-if="isSuperAdmin" />
    <AdminDashboardView v-else-if="isAdmin" />
    <div
      v-else
      class="flex min-h-[40vh] flex-1 flex-col items-center justify-center px-4 text-center text-sm text-gray-500 dark:text-primary-400/80"
    >
      <p class="max-w-md text-gray-700 dark:text-primary-200/90">
        {{ staffIntro }}
      </p>
    </div>
  </DefaultLayout>
</template>

<script setup>
import { computed } from 'vue'
import DefaultLayout from '@/components/layout/DefaultLayout.vue'
import SuperAdminDashboardView from './SuperAdminDashboardView.vue'
import AdminDashboardView from './AdminDashboardView.vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const isSuperAdmin = computed(() => authStore.role === 'superadmin')
const isAdmin = computed(() => authStore.role === 'admin')

function firstNameFromUser(u) {
  const full = String(u?.nomComplet || u?.NomComplet || '').trim()
  if (!full) return ''
  return full.split(/\s+/)[0] || full
}

const staffIntro = computed(() => {
  const first = firstNameFromUser(authStore.user)
  const greet = first ? `${first}, ` : ''
  return `${greet}bienvenue — vos modules sont accessibles dans le menu.`
})
</script>
