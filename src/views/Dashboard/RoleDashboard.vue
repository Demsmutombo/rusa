<template>
  <DefaultLayout>
    <SuperAdminDashboardView v-if="isSuperAdmin" />
    <AdminDashboardView v-else-if="isAdmin" />
    <div
      v-else
      class="flex min-h-[40vh] flex-1 flex-col items-center justify-center px-4 text-center text-sm text-gray-500 dark:text-primary-400/80"
    >
      <p class="max-w-md">
        Tableau de bord pour votre profil&nbsp;: contenu à venir. Utilisez le menu latéral pour accéder aux modules.
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
</script>
