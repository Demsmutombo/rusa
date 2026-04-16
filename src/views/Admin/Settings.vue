<template>
  <DefaultLayout>
    <div class="space-y-4">
      <!-- Header -->
      <div class="rusa-gradient-header flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-2xl font-bold text-white">
            Paramètres Administrateur
          </h1>
          <p class="text-primary-100">
            {{ headerIntro }}
          </p>
        </div>
        <div class="flex items-center gap-3">
          <button
            type="button"
            class="rusa-btn-primary bg-white text-primary-800 hover:bg-primary-50"
            @click="saveSettings"
          >
            Sauvegarder
          </button>
        </div>
      </div>

      <!-- Settings Tabs -->
      <div class="rusa-settings-shell">
        <div class="border-b border-primary-100 dark:border-primary-800/50">
          <nav class="flex space-x-8 px-6" aria-label="Tabs">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              :class="[
                'py-4 px-1 border-b-2 font-medium text-sm',
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              ]"
              @click="activeTab = tab.id"
            >
              {{ tab.name }}
            </button>
          </nav>
        </div>

        <!-- Tab Content -->
        <div class="p-6">
          <!-- General Settings -->
          <div v-if="activeTab === 'general'" class="space-y-4">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Paramètres généraux</h3>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Nom de la plateforme</label>
                <input
                  v-model="settings.general.platformName"
                  type="text"
                  class="w-full px-3 py-2 border border-primary-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Email de contact</label>
                <input
                  v-model="settings.general.contactEmail"
                  type="email"
                  class="w-full px-3 py-2 border border-primary-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Téléphone de contact</label>
                <input
                  v-model="settings.general.contactPhone"
                  type="tel"
                  class="w-full px-3 py-2 border border-primary-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                <textarea
                  v-model="settings.general.address"
                  rows="3"
                  class="w-full px-3 py-2 border border-primary-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                ></textarea>
              </div>
            </div>
          </div>

          <!-- Commission Settings -->
          <div v-if="activeTab === 'commission'" class="space-y-4">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Paramètres de commission</h3>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Commission transporteur (%)</label>
                <input
                  v-model.number="settings.commission.transporterFee"
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  class="w-full px-3 py-2 border border-primary-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Commission client (%)</label>
                <input
                  v-model.number="settings.commission.clientFee"
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  class="w-full px-3 py-2 border border-primary-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Frais de traitement (€)</label>
                <input
                  v-model.number="settings.commission.processingFee"
                  type="number"
                  step="0.01"
                  min="0"
                  class="w-full px-3 py-2 border border-primary-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">TVA (%)</label>
                <input
                  v-model.number="settings.commission.vat"
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  class="w-full px-3 py-2 border border-primary-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>

          <!-- Payment Settings -->
          <div v-if="activeTab === 'payment'" class="space-y-4">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Paramètres de paiement</h3>
            
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <div>
                  <h4 class="text-sm font-medium text-gray-900">Stripe</h4>
                  <p class="text-sm text-gray-500">Accepter les paiements par carte bancaire</p>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input
                    v-model="settings.payment.stripeEnabled"
                    type="checkbox"
                    class="sr-only peer"
                  />
                  <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>
              
              <div class="flex items-center justify-between">
                <div>
                  <h4 class="text-sm font-medium text-gray-900">PayPal</h4>
                  <p class="text-sm text-gray-500">Accepter les paiements PayPal</p>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input
                    v-model="settings.payment.paypalEnabled"
                    type="checkbox"
                    class="sr-only peer"
                  />
                  <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>
              
              <div class="flex items-center justify-between">
                <div>
                  <h4 class="text-sm font-medium text-gray-900">Virement bancaire</h4>
                  <p class="text-sm text-gray-500">Accepter les virements bancaires</p>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input
                    v-model="settings.payment.bankTransferEnabled"
                    type="checkbox"
                    class="sr-only peer"
                  />
                  <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>
            </div>
          </div>

          <!-- Notification Settings -->
          <div v-if="activeTab === 'notifications'" class="space-y-4">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Paramètres de notification</h3>
            
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <div>
                  <h4 class="text-sm font-medium text-gray-900">Email notifications</h4>
                  <p class="text-sm text-gray-500">Envoyer les notifications par email</p>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input
                    v-model="settings.notifications.emailEnabled"
                    type="checkbox"
                    class="sr-only peer"
                  />
                  <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>
              
              <div class="flex items-center justify-between">
                <div>
                  <h4 class="text-sm font-medium text-gray-900">SMS notifications</h4>
                  <p class="text-sm text-gray-500">Envoyer les notifications par SMS</p>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input
                    v-model="settings.notifications.smsEnabled"
                    type="checkbox"
                    class="sr-only peer"
                  />
                  <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>
              
              <div class="flex items-center justify-between">
                <div>
                  <h4 class="text-sm font-medium text-gray-900">Push notifications</h4>
                  <p class="text-sm text-gray-500">Envoyer les notifications push</p>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input
                    v-model="settings.notifications.pushEnabled"
                    type="checkbox"
                    class="sr-only peer"
                  />
                  <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>
            </div>
          </div>

          <!-- Security Settings -->
          <div v-if="activeTab === 'security'" class="space-y-4">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Paramètres de sécurité</h3>
            
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Durée de session (heures)</label>
                <input
                  v-model.number="settings.security.sessionTimeout"
                  type="number"
                  min="1"
                  max="24"
                  class="w-full px-3 py-2 border border-primary-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              
              <div class="flex items-center justify-between">
                <div>
                  <h4 class="text-sm font-medium text-gray-900">Authentification à deux facteurs</h4>
                  <p class="text-sm text-gray-500">Exiger l'authentification à deux facteurs</p>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input
                    v-model="settings.security.twoFactorAuth"
                    type="checkbox"
                    class="sr-only peer"
                  />
                  <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>
              
              <div class="flex items-center justify-between">
                <div>
                  <h4 class="text-sm font-medium text-gray-900">Validation email obligatoire</h4>
                  <p class="text-sm text-gray-500">Exiger la validation de l'email</p>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input
                    v-model="settings.security.emailVerification"
                    type="checkbox"
                    class="sr-only peer"
                  />
                  <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </DefaultLayout>
</template>

<script setup>
import { ref } from 'vue'
import DefaultLayout from '@/components/layout/DefaultLayout.vue'
import { notify } from '@/utils/notify'
import { useAdminModuleGreeting } from '@/composables/useAdminModuleGreeting'

const headerIntro = useAdminModuleGreeting('bienvenue — configuration ci-dessous.')

const activeTab = ref('general')

const tabs = [
  { id: 'general', name: 'Général' },
  { id: 'commission', name: 'Commission' },
  { id: 'payment', name: 'Paiement' },
  { id: 'notifications', name: 'Notifications' },
  { id: 'security', name: 'Sécurité' }
]

const settings = ref({
  general: {
    platformName: 'Rusa Travel',
    contactEmail: 'contact@rusa.travel',
    contactPhone: '+33 1 234 567 890',
    address: '123 Avenue des Champs-Élysées, 75008 Paris, France'
  },
  commission: {
    transporterFee: 10,
    clientFee: 5,
    processingFee: 0.5,
    vat: 20
  },
  payment: {
    stripeEnabled: true,
    paypalEnabled: true,
    bankTransferEnabled: true
  },
  notifications: {
    emailEnabled: true,
    smsEnabled: false,
    pushEnabled: true
  },
  security: {
    sessionTimeout: 30,
    twoFactorAuth: false,
    emailVerification: true
  }
})

const saveSettings = () => {
  console.log('Sauvegarde des paramètres:', settings.value)
  // Here you would typically make an API call to save settings
  
  notify.toast.success('Paramètres sauvegardés')
}
</script>

