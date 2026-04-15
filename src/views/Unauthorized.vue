<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center">
    <div class="max-w-md w-full mx-auto p-4">
      <div class="rusa-card p-8 text-center shadow-lg">
        <!-- Icône d'erreur -->
        <div class="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h.013M9 12h6m-6 9v6m0-6V9"></path>
          </svg>
        </div>
        
        <!-- Titre -->
        <h1 class="text-3xl font-bold text-gray-900 mb-4">Accès Refusé</h1>
        
        <!-- Message -->
        <p class="text-gray-600 mb-6">
          Vous n'avez pas les permissions nécessaires pour accéder à cette page.
        </p>
        
        <!-- Boutons d'action -->
        <div class="space-y-3">
          <button
            @click="goBack"
            class="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Retour
          </button>
          
          <button
            @click="goToDashboard"
            class="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Tableau de bord
          </button>
        </div>
        
        <!-- Message d'aide -->
        <p class="text-sm text-gray-500 mt-6">
          Si vous pensez qu'il s'agit d'une erreur, contactez l'administrateur.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { getDashboardPath } from '@/config/roles'

const router = useRouter()
const authStore = useAuthStore()

const goBack = () => {
  router.go(-1)
}

const goToDashboard = () => {
  router.push(getDashboardPath(authStore.role || 'client'))
}
</script>

<style scoped>
/* Animation simple de fade-in */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.bg-white {
  animation: fadeIn 0.5s ease-out;
}
</style>
