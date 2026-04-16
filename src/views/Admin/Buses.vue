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
            Parc et fiches véhicules.
          </p>
        </div>
      </div>
      <div class="rusa-card p-6 text-gray-600 dark:text-gray-300">
        <p class="text-sm">
          Écran de gestion des bus : branchement API à finaliser (liste, création, modification).
        </p>
      </div>
    </div>
  </DefaultLayout>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import DefaultLayout from '@/components/layout/DefaultLayout.vue'

const route = useRoute()
const isSuperAdminContext = computed(() => route.path.startsWith('/super-admin'))
</script>
