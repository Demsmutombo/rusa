<template>
  <div class="mx-auto mb-10 w-full max-w-60 rounded-2xl border border-white/10 bg-white/5 px-4 py-5 text-center backdrop-blur-sm">
    <a
      :href="documentationLink"
      target="_blank"
      rel="nofollow"
      class="text-theme-sm flex items-center justify-center rounded-xl bg-primary-500 p-3 font-medium text-white transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:bg-primary-600"
    >
      Documentation {{ userRoleText }}
    </a>
  </div>
</template>

<script setup >
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const documentationLink = computed(() => {
  const r = authStore.role
  switch (r) {
    case 'superadmin':
    case 'admin':
      return '/docs/admin'
    case 'gerant':
    case 'financier':
    case 'caissier':
      return '/docs/staff'
    case 'transporteur':
      return '/docs/transport'
    case 'client':
      return '/docs/client'
    default:
      return '/docs'
  }
})

const userRoleText = computed(() => {
  const r = authStore.role
  switch (r) {
    case 'superadmin':
      return 'Super-Admin'
    case 'admin':
      return 'Admin'
    case 'gerant':
      return 'Gérant'
    case 'financier':
      return 'Financier'
    case 'caissier':
      return 'Caissier'
    case 'transporteur':
      return 'Transporteur'
    case 'client':
      return 'Client'
    default:
      return ''
  }
})
</script>

