<template>
  <div class="min-h-screen bg-white flex items-center justify-center">
    <div class="relative">
      <img
        src="/images/logo/auth-logo.png"
        alt="Rusa Travel"
        class="w-64 h-64 object-contain animate-fade-in"
      />
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { getDashboardPath } from '@/config/roles'

const router = useRouter()
const authStore = useAuthStore()
let redirectTimeoutId = null

onMounted(() => {
  if (authStore.isAuthenticated) {
    router.replace(getDashboardPath(authStore.role || 'client'))
    return
  }
  redirectTimeoutId = window.setTimeout(() => {
    router.replace({ name: 'Home' })
  }, 3000)
})

onUnmounted(() => {
  if (redirectTimeoutId != null) {
    clearTimeout(redirectTimeoutId)
  }
})
</script>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.animate-fade-in {
  animation: fadeIn 1s ease-out forwards;
  opacity: 1;
}
</style>
