<template>
  <DefaultLayout>
    <div class="space-y-4">
      <div class="rusa-gradient-header">
        <h1 class="text-2xl font-bold text-white">
          Paramètres
        </h1>
        <p class="text-primary-100">
          Configurez vos préférences
        </p>
      </div>

      <p
        v-if="error"
        class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200"
      >
        {{ error }}
      </p>

      <form class="rusa-card p-6 space-y-4 max-w-xl" @submit.prevent="changePassword">
        <h2 class="text-base font-semibold text-gray-900 dark:text-white">Changer le mot de passe</h2>
        <div>
          <label class="block text-sm font-medium mb-1">Mot de passe actuel</label>
          <input v-model="form.currentPassword" type="password" class="w-full rounded-xl border border-primary-100 px-3 py-2" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Nouveau mot de passe</label>
          <input v-model="form.newPassword" type="password" class="w-full rounded-xl border border-primary-100 px-3 py-2" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Confirmer le nouveau mot de passe</label>
          <input v-model="form.confirmPassword" type="password" class="w-full rounded-xl border border-primary-100 px-3 py-2" />
        </div>
        <div class="flex justify-end">
          <button class="rusa-btn-primary" :disabled="saving">
            {{ saving ? 'Envoi...' : 'Mettre à jour le mot de passe' }}
          </button>
        </div>
      </form>
    </div>
  </DefaultLayout>
</template>

<script setup>
import DefaultLayout from '@/components/layout/DefaultLayout.vue'
import { ref } from 'vue'
import { changeUtilisateurMotDePasse } from '@/services/utilisateurService'
import { notify } from '@/utils/notify'

const saving = ref(false)
const error = ref('')
const form = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

async function changePassword() {
  error.value = ''
  if (!form.value.currentPassword || !form.value.newPassword || !form.value.confirmPassword) {
    error.value = 'Tous les champs sont obligatoires.'
    return
  }
  if (form.value.newPassword !== form.value.confirmPassword) {
    error.value = 'La confirmation ne correspond pas au nouveau mot de passe.'
    return
  }
  saving.value = true
  try {
    await changeUtilisateurMotDePasse({
      ancienMotDePasse: form.value.currentPassword,
      nouveauMotDePasse: form.value.newPassword,
      confirmerMotDePasse: form.value.confirmPassword,
      currentPassword: form.value.currentPassword,
      newPassword: form.value.newPassword,
      confirmPassword: form.value.confirmPassword,
    })
    notify.toast.success('Mot de passe modifié avec succès.')
    form.value.currentPassword = ''
    form.value.newPassword = ''
    form.value.confirmPassword = ''
  } catch (e) {
    error.value = e?.message || 'Impossible de modifier le mot de passe.'
  } finally {
    saving.value = false
  }
}
</script>

