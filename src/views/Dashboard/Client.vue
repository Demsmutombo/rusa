<template>
  <DefaultLayout>
    <div class="rusa-card-static max-w-lg p-8">
      <h1 class="text-xl font-semibold text-primary-900 dark:text-white">
        Espace connecté
      </h1>
      <p class="mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
        Vous êtes connecté en tant que client. Les modules du tableau de bord seront
        affichés progressivement.
      </p>
      <p
        v-if="currentUser.email"
        class="mt-4 text-xs text-gray-500 dark:text-gray-500"
      >
        {{ currentUser.email }}
      </p>
    </div>
  </DefaultLayout>
</template>

<script setup>
import { computed } from 'vue'
import DefaultLayout from '@/components/layout/DefaultLayout.vue'

const currentUser = computed(() => {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const clientData = JSON.parse(localStorage.getItem('clientData') || '{}')
  return {
    name: user.nomComplet || clientData.nomComplet || 'Client',
    email: user.email || clientData.email || '',
    role: user.role || 'client',
  }
})
</script>
