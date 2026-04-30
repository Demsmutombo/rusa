<template>
  <DefaultLayout>
    <div class="space-y-4">
      <div class="rusa-gradient-header">
        <h1 class="text-2xl font-bold text-white">
          Mon Profil
        </h1>
        <p class="text-primary-100">
          Gérez vos informations personnelles
        </p>
      </div>

      <p
        v-if="error"
        class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200"
      >
        {{ error }}
      </p>

      <div v-if="loading" class="rusa-card p-6 text-sm text-gray-600 dark:text-primary-300/85">
        Chargement du profil...
      </div>

      <form v-else class="rusa-card p-6 space-y-4" @submit.prevent="saveProfile">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium mb-1">Nom complet</label>
            <input v-model="form.nomComplet" type="text" class="w-full rounded-xl border border-primary-100 px-3 py-2" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Email</label>
            <input v-model="form.email" type="email" class="w-full rounded-xl border border-primary-100 px-3 py-2" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Téléphone</label>
            <input v-model="form.telephone" type="text" class="w-full rounded-xl border border-primary-100 px-3 py-2" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Genre</label>
            <select v-model="form.genre" class="w-full rounded-xl border border-primary-100 px-3 py-2">
              <option value="M">M</option>
              <option value="F">F</option>
            </select>
          </div>
        </div>

        <div v-if="clientInfo" class="rounded-xl border border-primary-100 bg-primary-50/50 p-4 text-sm">
          <p><strong>Client:</strong> {{ clientInfo.nomClient || '—' }}</p>
          <p><strong>Adresse:</strong> {{ clientInfo.adresseClient || '—' }}</p>
          <p><strong>Email client:</strong> {{ clientInfo.emailClient || '—' }}</p>
        </div>

        <div class="flex justify-end">
          <button class="rusa-btn-primary" :disabled="saving">
            {{ saving ? 'Enregistrement...' : 'Mettre à jour le profil' }}
          </button>
        </div>
      </form>
    </div>
  </DefaultLayout>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import DefaultLayout from '@/components/layout/DefaultLayout.vue'
import { useAuthStore } from '@/stores/auth'
import { getUtilisateur, updateUtilisateur } from '@/services/utilisateurService'
import { getClient } from '@/services/clientService'
import { notify } from '@/utils/notify'

const auth = useAuthStore()
const loading = ref(true)
const saving = ref(false)
const error = ref('')
const clientInfo = ref(null)
const form = ref({
  idUtilisateur: null,
  nomComplet: '',
  email: '',
  telephone: '',
  photoUrl: '',
  lieuNaissance: '',
  dateNaissance: '',
  genre: 'M',
})

async function load() {
  loading.value = true
  error.value = ''
  try {
    const user = auth.user || {}
    const idUtilisateur = Number(user.idUtilisateur ?? user.IdUtilisateur)
    const idClient = Number(user.idClient ?? user.IdClient ?? auth.client?.idClient)

    if (idUtilisateur > 0) {
      const u = await getUtilisateur(idUtilisateur)
      form.value = {
        idUtilisateur,
        nomComplet: u.nomComplet ?? '',
        email: u.email ?? '',
        telephone: u.telephone ?? '',
        photoUrl: u.photoUrl ?? '',
        lieuNaissance: u.lieuNaissance ?? '',
        dateNaissance: u.dateNaissance ? String(u.dateNaissance).slice(0, 10) : '',
        genre: u.genre ?? 'M',
      }
    }
    if (idClient > 0) {
      clientInfo.value = await getClient(idClient)
    }
  } catch (e) {
    error.value = e?.message || 'Impossible de charger le profil.'
  } finally {
    loading.value = false
  }
}

async function saveProfile() {
  saving.value = true
  try {
    const id = Number(form.value.idUtilisateur)
    if (!Number.isFinite(id) || id <= 0) throw new Error('Utilisateur introuvable.')
    await updateUtilisateur(id, form.value)
    notify.toast.success('Profil mis à jour.')
  } catch (e) {
    notify.toast.error(e?.message || 'Echec de la mise à jour du profil.')
  } finally {
    saving.value = false
  }
}

onMounted(load)
</script>
