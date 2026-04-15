<template>
  <div class="fixed bottom-6 right-6 z-50">
    <div class="group relative">
      <!-- Bouton flottant avec logo -->
      <button
        class="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
        @click="toggleInfo"
      >
        <img 
          src="/images/logo/logo.png" 
          alt="Rusa Travel" 
          class="w-8 h-8 object-contain"
        />
      </button>
      
      <!-- Popup d'information -->
      <div
        v-if="showInfo"
        class="absolute bottom-16 right-0 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 min-w-[200px] border border-gray-200 dark:border-gray-700"
      >
        <div class="flex items-center space-x-3 mb-3">
          <img 
            src="/images/logo/logo.png" 
            alt="Rusa Travel" 
            class="w-10 h-10 object-contain"
          />
          <div>
            <h4 class="font-semibold text-gray-900 dark:text-white">Rusa Travel</h4>
            <p class="text-xs text-gray-500 dark:text-gray-400">Plateforme de Transport</p>
          </div>
        </div>
        <div class="text-xs text-gray-600 dark:text-gray-400 space-y-1">
          <p>🚗 Transport fiable RDC</p>
          <p>📱 Réservation simple</p>
          <p>🔐 Paiements sécurisés</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup >
import { ref } from 'vue'

const showInfo = ref(false)

const toggleInfo = () => {
  showInfo.value = !showInfo.value
}

// Fermer le popup quand on clique ailleurs
document.addEventListener('click', (e) => {
  const target = e.target 
  if (!target.closest('.group')) {
    showInfo.value = false
  }
})
</script>

<style scoped>
/* Animation du popup */
.group > div {
  animation 0.3s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity;
    transform(10px);
  }
  to {
    opacity;
    transform(0);
  }
}
</style>

