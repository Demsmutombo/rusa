<template>
  <DefaultLayout>
    <router-view :key="route.fullPath" />
  </DefaultLayout>
</template>

<script setup>
import { ref, provide, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import DefaultLayout from '@/components/layout/DefaultLayout.vue'
import { useAuthStore } from '@/stores/auth'
import { fetchGerantDashboard } from '@/services/gerantDashboardService'
import { GERANT_DASHBOARD_INJECT_KEY } from '@/constants/injectionKeys'

const route = useRoute()
const authStore = useAuthStore()

const DASHBOARD_API_DISABLED =
  String(import.meta.env.VITE_DISABLE_DASHBOARD_API ?? '0').trim() === '1'

const payload = ref(/** @type {Record<string, unknown> | null} */ (null))
const loading = ref(true)
const error = ref('')

async function reload() {
  loading.value = true
  error.value = ''
  if (DASHBOARD_API_DISABLED) {
    payload.value = null
    error.value =
      'Chargement désactivé : VITE_DISABLE_DASHBOARD_API=1. Retirez la variable ou mettez-la à 0 pour activer GerantDashboard.'
    loading.value = false
    return
  }
  try {
    payload.value = await fetchGerantDashboard(authStore.societeId)
  } catch (e) {
    const st = /** @type {{ status?: number }} */ (e)?.status
    let msg = e?.message || 'Impossible de charger le tableau de bord gérant.'
    if (st === 403) {
      msg +=
        ' Vérifiez les droits sur GET /GerantDashboard et GET /Dashboard/{idSociete} ; si la société est transmise par en-tête, activez ' +
        'VITE_ENABLE_SOCIETE_HEADER=1 une fois le CORS backend corrigé.'
    }
    error.value = msg
    payload.value = null
  } finally {
    loading.value = false
  }
}

onMounted(reload)
watch(
  () => authStore.societeId,
  () => {
    reload()
  },
)

provide(GERANT_DASHBOARD_INJECT_KEY, {
  payload,
  loading,
  error,
  reload,
})
</script>
