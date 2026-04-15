<template>
  <DefaultLayout>
    <SuperAdminDashboardView v-if="isSuperAdmin" />
    <div
      v-else
      class="min-h-0 flex-1"
    />
  </DefaultLayout>
</template>

<script setup>
import { computed } from 'vue'
import DefaultLayout from '@/components/layout/DefaultLayout.vue'
import SuperAdminDashboardView from './SuperAdminDashboardView.vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const isSuperAdmin = computed(() => authStore.role === 'superadmin')
</script>
