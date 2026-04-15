<template>
  <DefaultLayout>
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
            Trajets Disponibles
          </h1>
          <p class="text-gray-600 dark:text-gray-400">
            Consultez tous les trajets disponibles
          </p>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <p>Page des trajets en construction...</p>
      </div>
    </div>
  </DefaultLayout>
</template>

<script setup >
import DefaultLayout from '@/components/layout/DefaultLayout.vue'
</script>

