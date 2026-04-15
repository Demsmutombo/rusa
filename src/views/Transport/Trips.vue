<template>
  <DefaultLayout>
    <div class="space-y-4">
      <div class="rusa-gradient-header flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-2xl font-bold text-white">
            Gestion des Trajets
          </h1>
          <p class="text-primary-100">
            Gérez vos trajets et réservations
          </p>
        </div>
        <div class="flex items-center gap-3">
          <button type="button" class="rusa-btn-primary bg-white text-primary-800 hover:bg-primary-50">
            Nouveau trajet
          </button>
        </div>
      </div>

      <div class="rusa-card p-6">
        <p>Page de gestion des trajets pour transporteur en construction...</p>
      </div>
    </div>
  </DefaultLayout>
</template>

<script setup >
import DefaultLayout from '@/components/layout/DefaultLayout.vue'
</script>

