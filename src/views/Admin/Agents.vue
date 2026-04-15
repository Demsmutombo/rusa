<template>
  <DefaultLayout>
    <div class="space-y-4">
      <div class="rusa-gradient-header flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div class="min-w-0 pr-2">
          <router-link
            v-if="isSuperAdminAgentsRoute"
            to="/super-admin"
            class="mb-1 inline-block text-xs font-medium text-primary-100 hover:text-white sm:mb-2"
          >
            ← Tableau de bord Super-Admin
          </router-link>
          <h1 class="text-xl font-bold leading-tight text-white sm:text-2xl">{{ pageTitle }}</h1>
          <p class="mt-1 text-sm text-primary-100 sm:text-base">{{ pageSubtitle }}</p>
        </div>
        <button
          type="button"
          @click="openCreate"
          class="rusa-btn-primary w-full shrink-0 bg-white text-primary-800 hover:bg-primary-50 sm:w-auto"
        >
          Nouvel agent
        </button>
      </div>

      <div class="rusa-card flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
        <div class="w-full sm:w-auto sm:min-w-[200px]">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Filtrer par société</label>
          <select
            v-model="filterSociete"
            class="w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-base sm:min-w-[200px] sm:py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          >
            <option value="">Toutes</option>
            <option v-for="s in societeOptions" :key="s.idSociete" :value="String(s.idSociete)">
              {{ s.nom }}
            </option>
          </select>
        </div>
        <div class="w-full sm:w-auto sm:min-w-[160px]">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Statut</label>
          <select
            v-model="filterStatut"
            class="w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-base sm:min-w-[160px] sm:py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          >
            <option value="">Tous</option>
            <option value="actif">Actifs seulement</option>
            <option value="inactif">Inactifs seulement</option>
          </select>
        </div>
      </div>

      <p v-if="error" class="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
        {{ error }}
      </p>

      <!-- Tableau : md et plus -->
      <div class="rusa-panel hidden md:block">
        <div class="-mx-4 overflow-x-auto sm:mx-0">
          <table class="w-full min-w-[720px]">
            <thead class="bg-primary-50/80 dark:bg-primary-950/50">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase lg:px-6">Agent</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase lg:px-6">Rôle / fonction</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase lg:px-6">Société</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase lg:px-6">Statut</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase lg:px-6">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-primary-100 dark:divide-primary-800/50">
              <tr v-if="loading">
                <td colspan="5" class="px-6 py-8 text-center text-gray-500">Chargement…</td>
              </tr>
              <tr v-for="a in filteredAgents" v-else :key="'desk-' + a.idAgent">
                <td class="px-4 py-4 lg:px-6">
                  <div class="flex items-center gap-3">
                    <div
                      class="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-gray-100 dark:border-gray-600 dark:bg-gray-800"
                    >
                      <img
                        v-if="resolveAgentPhotoSrc(a.photoUrl)"
                        :src="resolveAgentPhotoSrc(a.photoUrl)"
                        :alt="a.nomComplet || 'Photo'"
                        class="h-full w-full object-cover"
                      />
                      <span
                        v-else
                        class="text-[10px] text-gray-400 dark:text-gray-500"
                      >—</span>
                    </div>
                    <div class="min-w-0">
                      <p class="font-medium text-gray-900 dark:text-white">{{ a.nomComplet }}</p>
                      <p class="text-xs text-gray-500 dark:text-gray-400">
                        {{ a.emailAgent }} · {{ a.telephoneAgent || '—' }}
                      </p>
                    </div>
                  </div>
                </td>
                <td class="px-4 py-4 text-sm lg:px-6">
                  <div>{{ roleLabelForSelect(a.roleAgent) || '—' }}</div>
                  <div class="text-gray-500">{{ a.fonction || '' }}</div>
                </td>
                <td class="px-4 py-4 text-sm lg:px-6">{{ societeLabel(a.idSociete) }}</td>
                <td class="px-4 py-4 lg:px-6">
                  <span
                    class="px-2 py-1 text-xs font-medium rounded-full"
                    :class="a.statut !== false ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'"
                  >
                    {{ a.statut !== false ? 'actif' : 'inactif' }}
                  </span>
                </td>
                <td class="px-4 py-4 text-sm font-medium whitespace-nowrap lg:px-6">
                  <button type="button" class="text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white mr-3" @click="openView(a)">
                    Voir
                  </button>
                  <button type="button" class="text-primary-600 hover:text-primary-800 mr-3" @click="openEdit(a)">
                    Modifier
                  </button>
                  <button
                    type="button"
                    :class="
                      a.statut !== false
                        ? 'text-red-600 hover:text-red-900'
                        : 'text-emerald-700 hover:text-emerald-900 dark:text-emerald-400 dark:hover:text-emerald-300'
                    "
                    @click="toggleStatutAgent(a)"
                  >
                    {{ a.statut !== false ? 'Désactiver' : 'Activer' }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Cartes : mobile & tablette étroite -->
      <div class="rusa-panel md:hidden">
        <div v-if="loading" class="py-12 text-center text-gray-500 dark:text-gray-400">Chargement…</div>
        <ul v-else-if="filteredAgents.length" class="space-y-3 p-1 sm:p-2">
          <li
            v-for="a in filteredAgents"
            :key="'mob-' + a.idAgent"
            class="rounded-xl border border-primary-100 bg-white p-4 shadow-sm dark:border-primary-800/40 dark:bg-gray-900/50"
          >
            <div class="flex gap-3">
              <div
                class="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-gray-100 dark:border-gray-600 dark:bg-gray-800"
              >
                <img
                  v-if="resolveAgentPhotoSrc(a.photoUrl)"
                  :src="resolveAgentPhotoSrc(a.photoUrl)"
                  :alt="a.nomComplet || 'Photo'"
                  class="h-full w-full object-cover"
                />
                <span v-else class="text-[10px] text-gray-400">—</span>
              </div>
              <div class="min-w-0 flex-1">
                <div class="flex flex-wrap items-start justify-between gap-2">
                  <p class="font-semibold text-gray-900 dark:text-white">{{ a.nomComplet }}</p>
                  <span
                    class="shrink-0 rounded-full px-2 py-0.5 text-xs font-medium"
                    :class="a.statut !== false ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'"
                  >
                    {{ a.statut !== false ? 'actif' : 'inactif' }}
                  </span>
                </div>
                <p class="mt-1 break-words text-sm text-gray-600 dark:text-gray-300">
                  {{ a.emailAgent }}
                </p>
                <p v-if="a.telephoneAgent" class="text-sm text-gray-500 dark:text-gray-400">
                  {{ a.telephoneAgent }}
                </p>
              </div>
            </div>
            <dl class="mt-3 space-y-1.5 border-t border-gray-100 pt-3 text-sm dark:border-gray-700/80">
              <div class="flex gap-2">
                <dt class="shrink-0 text-gray-500 dark:text-gray-400">Rôle</dt>
                <dd class="min-w-0 font-medium text-gray-900 dark:text-white">{{ roleLabelForSelect(a.roleAgent) || '—' }}</dd>
              </div>
              <div v-if="a.fonction" class="flex gap-2">
                <dt class="shrink-0 text-gray-500 dark:text-gray-400">Fonction</dt>
                <dd class="min-w-0 text-gray-700 dark:text-gray-300">{{ a.fonction }}</dd>
              </div>
              <div class="flex gap-2">
                <dt class="shrink-0 text-gray-500 dark:text-gray-400">Société</dt>
                <dd class="min-w-0 text-gray-800 dark:text-gray-200">{{ societeLabel(a.idSociete) }}</dd>
              </div>
            </dl>
            <div class="mt-4 flex flex-col gap-2 border-t border-gray-100 pt-3 dark:border-gray-700/80">
              <div class="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  class="rounded-lg border border-gray-200 bg-gray-50 py-2.5 text-center text-sm font-medium text-gray-800 active:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:active:bg-gray-700"
                  @click="openView(a)"
                >
                  Voir
                </button>
                <button
                  type="button"
                  class="rounded-lg border border-primary-200 bg-primary-50 py-2.5 text-center text-sm font-medium text-primary-800 active:bg-primary-100 dark:border-primary-800 dark:bg-primary-950/50 dark:text-primary-200 dark:active:bg-primary-900/40"
                  @click="openEdit(a)"
                >
                  Modifier
                </button>
              </div>
              <button
                type="button"
                :class="
                  a.statut !== false
                    ? 'w-full rounded-lg border border-red-200 bg-red-50 py-2.5 text-center text-sm font-medium text-red-800 active:bg-red-100 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200'
                    : 'w-full rounded-lg border border-emerald-200 bg-emerald-50 py-2.5 text-center text-sm font-medium text-emerald-800 active:bg-emerald-100 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-200'
                "
                @click="toggleStatutAgent(a)"
              >
                {{ a.statut !== false ? 'Désactiver' : 'Activer' }}
              </button>
            </div>
          </li>
        </ul>
        <p v-else class="py-12 text-center text-sm text-gray-500 dark:text-gray-400">Aucun agent ne correspond aux filtres.</p>
      </div>

      <Modal
        v-model="showModal"
        :title="editing ? 'Modifier l’agent' : 'Nouvel agent'"
        size="lg"
      >
          <div class="space-y-3">
            <div v-if="!editing">
              <label class="block text-sm font-medium text-gray-700">Société *</label>
              <select v-model="form.idSociete" class="mt-1 w-full border rounded-md px-3 py-2">
                <option value="">— Choisir —</option>
                <option v-for="s in societeOptions" :key="s.idSociete" :value="String(s.idSociete)">
                  {{ s.nom }}
                </option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Nom complet *</label>
              <input v-model="form.nomComplet" type="text" class="mt-1 w-full border rounded-md px-3 py-2" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Email *</label>
              <input v-model="form.emailAgent" type="email" class="mt-1 w-full border rounded-md px-3 py-2" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Téléphone</label>
              <input v-model="form.telephoneAgent" type="text" class="mt-1 w-full border rounded-md px-3 py-2" />
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-sm font-medium text-gray-700">Rôle agent</label>
                <select
                  v-model="form.roleAgent"
                  class="mt-1 w-full border rounded-md px-3 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  :disabled="roleCatalog.isLoading && agentRoleSelectOptions.length === 0"
                >
                  <option value="">— Choisir —</option>
                  <option
                    v-if="form.roleAgent && !isKnownRoleNom(form.roleAgent)"
                    :value="form.roleAgent"
                  >
                    {{ form.roleAgent }} (valeur actuelle)
                  </option>
                  <option v-for="r in agentRoleSelectOptions" :key="r.idRole" :value="r.nom">
                    {{ roleLabelForSelect(r.nom) }}
                  </option>
                </select>
                <p
                  v-if="!agentRoleSelectOptions.length && !roleCatalog.isLoading"
                  class="mt-1 text-xs text-amber-700 dark:text-amber-400"
                >
                  Aucun rôle chargé. Vérifiez l’API ou rechargez la page après connexion.
                </p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Fonction</label>
                <input v-model="form.fonction" type="text" class="mt-1 w-full border rounded-md px-3 py-2" />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Matricule</label>
              <input v-model="form.matricule" type="text" class="mt-1 w-full border rounded-md px-3 py-2" />
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-sm font-medium text-gray-700">Genre</label>
                <select v-model="form.genre" class="mt-1 w-full border rounded-md px-3 py-2">
                  <option value="M">M</option>
                  <option value="F">F</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Date naissance</label>
                <input v-model="form.dateNaissance" type="date" class="mt-1 w-full border rounded-md px-3 py-2" />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Adresse</label>
              <input v-model="form.adresseResidence" type="text" class="mt-1 w-full border rounded-md px-3 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white" />
            </div>
            <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">État civil</label>
                <input v-model="form.etatCivil" type="text" class="mt-1 w-full border rounded-md px-3 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">N° série / IMEI</label>
                <input v-model="form.serialNumber" type="text" class="mt-1 w-full border rounded-md px-3 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Zone</label>
                <input v-model="form.zone" type="text" class="mt-1 w-full border rounded-md px-3 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white" />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Photo (photoUrl)</label>
              <div class="mt-2 flex flex-col gap-3 sm:flex-row sm:items-start">
                <div
                  class="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-gray-50 dark:border-gray-600 dark:bg-gray-800/80"
                >
                  <img
                    v-if="resolveAgentPhotoSrc(form.photoUrl)"
                    :src="resolveAgentPhotoSrc(form.photoUrl)"
                    alt="Aperçu photo"
                    class="h-full w-full object-cover"
                  />
                  <span
                    v-else
                    class="px-2 text-center text-xs text-gray-400 dark:text-gray-500"
                  >Photo</span>
                </div>
                <div class="min-w-0 flex-1 space-y-2">
                  <input
                    ref="agentPhotoFileInput"
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    class="sr-only"
                    @change="onAgentPhotoFileSelect"
                  />
                  <div class="flex flex-wrap gap-2">
                    <button
                      type="button"
                      class="rounded-lg border border-primary-200 bg-white px-3 py-2 text-sm font-medium text-primary-800 hover:bg-primary-50 dark:border-primary-700 dark:bg-gray-800 dark:text-primary-300 dark:hover:bg-primary-950/50"
                      @click="triggerAgentPhotoPick"
                    >
                      Téléverser une image
                    </button>
                    <button
                      v-if="form.photoUrl"
                      type="button"
                      class="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                      @click="clearAgentPhoto"
                    >
                      Retirer la photo
                    </button>
                  </div>
                  <p class="text-xs text-gray-500 dark:text-gray-400">
                    JPG, PNG, GIF ou WebP — max. 1,5&nbsp;Mo. Ou indiquez une URL ci-dessous.
                  </p>
                  <input
                    :value="agentPhotoUrlFieldValue"
                    type="url"
                    placeholder="https://exemple.com/photo.jpg"
                    class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    @input="onAgentPhotoUrlInput"
                  />
                </div>
              </div>
            </div>
            <label v-if="!editing" class="flex items-center gap-2">
              <input v-model="form.statut" type="checkbox" />
              <span class="text-sm text-gray-700">Actif</span>
            </label>
          </div>
          <template #footer>
          <div class="flex justify-end gap-3">
            <button type="button" class="px-4 py-2 bg-gray-100 rounded-md" @click="closeModal">Annuler</button>
            <button
              type="button"
              :disabled="saving"
              class="rusa-btn-primary disabled:opacity-50"
              @click="save"
            >
              {{ saving ? '…' : 'Enregistrer' }}
            </button>
          </div>
          </template>
      </Modal>

      <Modal v-model="showViewModal" title="Fiche agent" size="lg">
        <div v-if="viewAgent" class="space-y-4">
          <p v-if="viewLoading" class="text-sm text-gray-500 dark:text-gray-400">Actualisation des données…</p>
          <div class="flex flex-col gap-4 sm:flex-row sm:items-start">
            <div
              class="mx-auto flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-gray-50 dark:border-gray-600 dark:bg-gray-800/80 sm:mx-0"
            >
              <img
                v-if="resolveAgentPhotoSrc(viewAgent.photoUrl)"
                :src="resolveAgentPhotoSrc(viewAgent.photoUrl)"
                :alt="viewAgent.nomComplet || 'Photo'"
                class="h-full w-full object-cover"
              />
              <span v-else class="text-xs text-gray-400 dark:text-gray-500">Pas de photo</span>
            </div>
            <dl class="grid min-w-0 flex-1 grid-cols-1 gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
              <div class="sm:col-span-2">
                <dt class="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Nom complet</dt>
                <dd class="mt-0.5 font-medium text-gray-900 dark:text-white">{{ viewAgent.nomComplet || '—' }}</dd>
              </div>
              <div>
                <dt class="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Email</dt>
                <dd class="mt-0.5 text-gray-900 dark:text-white">{{ viewAgent.emailAgent || '—' }}</dd>
              </div>
              <div>
                <dt class="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Téléphone</dt>
                <dd class="mt-0.5 text-gray-900 dark:text-white">{{ viewAgent.telephoneAgent || '—' }}</dd>
              </div>
              <div>
                <dt class="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Société</dt>
                <dd class="mt-0.5 text-gray-900 dark:text-white">{{ societeLabel(viewAgent.idSociete ?? viewAgent.IdSociete) }}</dd>
              </div>
              <div>
                <dt class="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Rôle</dt>
                <dd class="mt-0.5 text-gray-900 dark:text-white">{{ roleLabelForSelect(viewAgent.roleAgent) || '—' }}</dd>
              </div>
              <div>
                <dt class="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Fonction</dt>
                <dd class="mt-0.5 text-gray-900 dark:text-white">{{ viewAgent.fonction || '—' }}</dd>
              </div>
              <div>
                <dt class="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Matricule</dt>
                <dd class="mt-0.5 text-gray-900 dark:text-white">{{ viewAgent.matricule || '—' }}</dd>
              </div>
              <div>
                <dt class="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Genre</dt>
                <dd class="mt-0.5 text-gray-900 dark:text-white">{{ viewAgent.genre || '—' }}</dd>
              </div>
              <div>
                <dt class="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Date de naissance</dt>
                <dd class="mt-0.5 text-gray-900 dark:text-white">{{ formatAgentDate(viewAgent.dateNaissance) }}</dd>
              </div>
              <div>
                <dt class="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">État civil</dt>
                <dd class="mt-0.5 text-gray-900 dark:text-white">{{ viewAgent.etatCivil || '—' }}</dd>
              </div>
              <div>
                <dt class="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">N° série / IMEI</dt>
                <dd class="mt-0.5 text-gray-900 dark:text-white">{{ viewAgent.serialNumber || '—' }}</dd>
              </div>
              <div class="sm:col-span-2">
                <dt class="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Adresse</dt>
                <dd class="mt-0.5 text-gray-900 dark:text-white">{{ viewAgent.adresseResidence || '—' }}</dd>
              </div>
              <div>
                <dt class="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Zone</dt>
                <dd class="mt-0.5 text-gray-900 dark:text-white">{{ viewAgent.zone || '—' }}</dd>
              </div>
              <div>
                <dt class="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Statut</dt>
                <dd class="mt-0.5">
                  <span
                    class="inline-flex rounded-full px-2 py-0.5 text-xs font-medium"
                    :class="viewAgent.statut !== false ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'"
                  >
                    {{ viewAgent.statut !== false ? 'Actif' : 'Inactif' }}
                  </span>
                </dd>
              </div>
            </dl>
          </div>
        </div>
        <div v-else class="py-8 text-center text-gray-500">Chargement…</div>
        <template #footer>
          <div class="flex flex-wrap justify-end gap-3">
            <button type="button" class="px-4 py-2 bg-gray-100 rounded-md dark:bg-gray-700 dark:text-white" @click="closeViewModal">
              Fermer
            </button>
            <button
              v-if="viewAgent"
              type="button"
              class="rusa-btn-primary"
              @click="openEditFromView"
            >
              Modifier
            </button>
          </div>
        </template>
      </Modal>
    </div>
  </DefaultLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute } from 'vue-router'
import { getApiOrigin } from '@/config/apiOrigin'
import { APP_ROLE_LABELS, normalizeAppRole } from '@/config/roles'
import DefaultLayout from '@/components/layout/DefaultLayout.vue'
import Modal from '@/components/ui/Modal.vue'
import { listSocietesArray } from '@/services/societeService'
import {
  listAgentsArray,
  getAgent,
  unwrapAgentDetailResponse,
  createAgent,
  updateAgent,
  setAgentStatut,
  matchCatalogRoleNom,
} from '@/services/agentService'
import { useAuthStore } from '@/stores/auth'
import { useRoleCatalogStore } from '@/stores/roleCatalog'
import { repairFrenchDisplayText } from '@/utils/repairFrenchDisplayText'
import { notify } from '@/utils/notify'

const route = useRoute()
const auth = useAuthStore()
const roleCatalog = useRoleCatalogStore()
const { activeRoles } = storeToRefs(roleCatalog)

const isSuperAdminAgentsRoute = computed(() => route.name === 'SuperAdminAgents')
const pageTitle = computed(() =>
  isSuperAdminAgentsRoute.value ? 'Agents (Super-Admin)' : 'Agents'
)
const pageSubtitle = computed(() =>
  isSuperAdminAgentsRoute.value
    ? 'Vue globale des agents (toutes sociétés).'
    : 'Employés rattachés à une société'
)

const agents = ref([])
const societeOptions = ref([])
const filterSociete = ref('')
const filterStatut = ref('')
const loading = ref(false)
const error = ref('')
const showModal = ref(false)
const showViewModal = ref(false)
const viewAgent = ref(null)
const viewLoading = ref(false)
const editing = ref(false)
const saving = ref(false)

const AGENT_PHOTO_MAX_BYTES = Math.floor(1.5 * 1024 * 1024)
const agentPhotoFileInput = ref(null)

const emptyForm = () => ({
  idAgent: 0,
  idSociete: '',
  nomComplet: '',
  emailAgent: '',
  telephoneAgent: '',
  roleAgent: '',
  fonction: '',
  matricule: '',
  genre: 'M',
  dateNaissance: '1990-01-01',
  etatCivil: '',
  serialNumber: '',
  adresseResidence: '',
  zone: '',
  photoUrl: '',
  statut: true,
})

const form = ref(emptyForm())

function roleLabelForSelect(nom) {
  const n = String(nom || '').trim()
  if (!n) return '—'
  const key = normalizeAppRole(n)
  return APP_ROLE_LABELS[key] || n
}

const agentRoleSelectOptions = computed(() => {
  const list = activeRoles.value
    .map((r) => {
      const nom = String(r?.nom ?? r?.Nom ?? '').trim()
      if (!nom) return null
      return {
        idRole: r.idRole ?? r.IdRole ?? nom,
        nom,
      }
    })
    .filter(Boolean)
  return [...list].sort((a, b) =>
    roleLabelForSelect(a.nom).localeCompare(roleLabelForSelect(b.nom), 'fr', {
      sensitivity: 'base',
    })
  )
})

function isKnownRoleNom(nom) {
  const s = String(nom || '').trim()
  if (!s) return true
  const canon = matchCatalogRoleNom(nom, activeRoles.value)
  return agentRoleSelectOptions.value.some((r) => r.nom === canon)
}

const agentPhotoUrlFieldValue = computed(() => {
  const v = form.value.photoUrl || ''
  if (v.startsWith('data:image')) return ''
  return v
})

function resolveAgentPhotoSrc(url) {
  const v = String(url ?? '').trim()
  if (!v) return ''
  if (/^https?:\/\//i.test(v) || v.startsWith('data:') || v.startsWith('blob:')) return v
  if (v.startsWith('/')) {
    const origin = getApiOrigin()
    return origin ? `${origin}${v}` : v
  }
  return v
}

function triggerAgentPhotoPick() {
  agentPhotoFileInput.value?.click()
}

function onAgentPhotoFileSelect(event) {
  const input = event.target
  const file = input?.files?.[0]
  if (!file) return
  if (!file.type.startsWith('image/')) {
    notify.warning('Format non pris en charge', 'Choisissez une image (JPG, PNG, GIF ou WebP).')
    input.value = ''
    return
  }
  if (file.size > AGENT_PHOTO_MAX_BYTES) {
    notify.warning('Fichier trop volumineux', 'Limite : 1,5 Mo. Réduisez la taille ou utilisez une URL.')
    input.value = ''
    return
  }
  const reader = new FileReader()
  reader.onload = () => {
    form.value.photoUrl = String(reader.result || '')
  }
  reader.onerror = () => {
    notify.error('Lecture impossible', 'Le fichier n’a pas pu être lu.')
  }
  reader.readAsDataURL(file)
  input.value = ''
}

function onAgentPhotoUrlInput(e) {
  form.value.photoUrl = e.target.value
}

function clearAgentPhoto() {
  form.value.photoUrl = ''
  if (agentPhotoFileInput.value) agentPhotoFileInput.value.value = ''
}

const filteredAgents = computed(() => {
  let list = agents.value
  if (filterSociete.value) {
    const id = Number(filterSociete.value)
    list = list.filter((a) => Number(a.idSociete) === id)
  }
  if (filterStatut.value === 'actif') {
    list = list.filter((a) => a.statut !== false)
  } else if (filterStatut.value === 'inactif') {
    list = list.filter((a) => a.statut === false)
  }
  return list
})

function societeLabel(idSociete) {
  const s = societeOptions.value.find((x) => Number(x.idSociete) === Number(idSociete))
  return s?.nom || (idSociete != null && idSociete !== '' ? '#' + idSociete : '—')
}

function formatAgentDate(raw) {
  if (raw == null || raw === '') return '—'
  const s = String(raw)
  const day = s.includes('T') ? s.slice(0, 10) : s.slice(0, 10)
  if (/^\d{4}-\d{2}-\d{2}$/.test(day)) {
    try {
      return new Date(day + 'T12:00:00').toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    } catch {
      return day
    }
  }
  return s
}

async function loadSocietes() {
  try {
    societeOptions.value = await listSocietesArray()
  } catch {
    societeOptions.value = []
  }
}

function normalizeAgentRow(row) {
  if (!row || typeof row !== 'object') return row
  const statutRaw = row.statut ?? row.Statut
  const statut = statutRaw !== false && statutRaw !== 'false'
  return {
    ...row,
    idAgent: row.idAgent ?? row.IdAgent,
    idSociete: row.idSociete ?? row.IdSociete,
    nomComplet: repairFrenchDisplayText(row.nomComplet ?? row.NomComplet),
    emailAgent: repairFrenchDisplayText(row.emailAgent ?? row.EmailAgent ?? ''),
    telephoneAgent: repairFrenchDisplayText(row.telephoneAgent ?? row.TelephoneAgent ?? ''),
    roleAgent: repairFrenchDisplayText(row.roleAgent ?? row.RoleAgent ?? ''),
    fonction: repairFrenchDisplayText(row.fonction ?? row.Fonction),
    matricule: repairFrenchDisplayText(row.matricule ?? row.Matricule),
    genre: (() => {
      const g = row.genre ?? row.Genre
      return g === 'F' || g === 'M' ? g : 'M'
    })(),
    dateNaissance: row.dateNaissance ?? row.DateNaissance,
    adresseResidence: repairFrenchDisplayText(row.adresseResidence ?? row.AdresseResidence),
    zone: repairFrenchDisplayText(row.zone ?? row.Zone),
    etatCivil: repairFrenchDisplayText(row.etatCivil ?? row.EtatCivil),
    serialNumber: repairFrenchDisplayText(row.serialNumber ?? row.SerialNumber ?? ''),
    photoUrl: row.photoUrl ?? row.PhotoUrl ?? '',
    statut,
  }
}

async function loadAgents() {
  loading.value = true
  error.value = ''
  try {
    const raw = await listAgentsArray()
    agents.value = raw.map(normalizeAgentRow)
  } catch (e) {
    error.value = e?.message || 'Erreur chargement agents'
    agents.value = []
    notify.error('Chargement impossible', error.value)
  } finally {
    loading.value = false
  }
}

async function loadAll() {
  roleCatalog.hydrateFromStorage()
  const syncRoles = auth.token
    ? roleCatalog.syncFromApi(auth.token).catch(() => null)
    : Promise.resolve()
  await Promise.all([loadSocietes(), loadAgents(), syncRoles])
}

async function openView(a) {
  if (!a?.idAgent) return
  viewAgent.value = normalizeAgentRow({ ...a })
  showViewModal.value = true
  viewLoading.value = true
  const id = Number(a.idAgent)
  try {
    const raw = await getAgent(id)
    const detail = unwrapAgentDetailResponse(raw, id)
    if (detail && typeof detail === 'object') {
      viewAgent.value = normalizeAgentRow({ ...a, ...detail })
    }
  } catch {
    /* conserve les données de la ligne liste */
  } finally {
    viewLoading.value = false
  }
}

function closeViewModal() {
  showViewModal.value = false
  viewAgent.value = null
}

function openEditFromView() {
  const row = viewAgent.value
  if (!row) return
  closeViewModal()
  openEdit(row)
}

function openCreate() {
  editing.value = false
  form.value = emptyForm()
  showModal.value = true
}

function openEdit(a) {
  editing.value = true
  const d = a.dateNaissance ? String(a.dateNaissance).slice(0, 10) : '1990-01-01'
  const rawRole = String(a.roleAgent ?? a.RoleAgent ?? '').trim()
  const roleForSelect = matchCatalogRoleNom(rawRole, activeRoles.value)
  form.value = {
    idAgent: a.idAgent,
    idSociete: String(a.idSociete || ''),
    nomComplet: a.nomComplet || '',
    emailAgent: a.emailAgent || '',
    telephoneAgent: a.telephoneAgent || '',
    roleAgent: roleForSelect,
    fonction: a.fonction || '',
    matricule: a.matricule || '',
    genre: a.genre === 'F' ? 'F' : 'M',
    dateNaissance: d,
    etatCivil: a.etatCivil != null ? String(a.etatCivil) : '',
    serialNumber: a.serialNumber != null ? String(a.serialNumber) : '',
    adresseResidence: a.adresseResidence || '',
    zone: a.zone != null ? String(a.zone) : '',
    photoUrl: a.photoUrl != null ? String(a.photoUrl) : '',
    statut: a.statut !== false,
  }
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  if (agentPhotoFileInput.value) agentPhotoFileInput.value.value = ''
}

async function save() {
  if (!form.value.nomComplet?.trim() || !form.value.emailAgent?.trim()) {
    await notify.warning('Champs requis', 'Nom et email sont obligatoires.')
    return
  }
  if (!editing.value) {
    const sid = Number(form.value.idSociete)
    if (!Number.isFinite(sid) || sid <= 0) {
      await notify.warning('Société', 'Choisissez une société.')
      return
    }
    if (!String(form.value.roleAgent || '').trim()) {
      await notify.warning('Rôle', 'Choisissez un rôle pour l’agent.')
      return
    }
    const em = String(form.value.emailAgent || '')
      .trim()
      .toLowerCase()
    if (
      em &&
      agents.value.some(
        (x) => String(x.emailAgent || '').trim().toLowerCase() === em
      )
    ) {
      await notify.warning(
        'Email déjà utilisé',
        'Cet email est déjà associé à un agent dans la liste affichée. Utilisez une autre adresse ou retrouvez l’agent existant (filtre statut / API).'
      )
      return
    }
  }
  saving.value = true
  try {
    if (editing.value) {
      await updateAgent(form.value.idAgent, {
        idAgent: form.value.idAgent,
        nomComplet: form.value.nomComplet,
        genre: form.value.genre,
        dateNaissance: form.value.dateNaissance,
        emailAgent: form.value.emailAgent,
        telephoneAgent: form.value.telephoneAgent,
        photoUrl: form.value.photoUrl,
        etatCivil: form.value.etatCivil,
        serialNumber: form.value.serialNumber,
        roleAgent: form.value.roleAgent,
        fonction: form.value.fonction,
        adresseResidence: form.value.adresseResidence,
        zone: form.value.zone,
      })
    } else {
      await createAgent({
        ...form.value,
        idSociete: Number(form.value.idSociete),
      })
    }
    closeModal()
    await loadAgents()
    notify.toast.success(editing.value ? 'Agent mis à jour.' : 'Agent créé.')
  } catch (e) {
    const msg = e?.message || 'Erreur inconnue.'
    const status = e?.status
    /** 409 Conflict : email agent déjà présent (unicité côté API). */
    if (status === 409 || /existe déjà|doit être unique|unique dans le système/i.test(msg)) {
      notify.warning('Email déjà utilisé', msg)
    } else {
      notify.error('Enregistrement impossible', msg)
    }
  } finally {
    saving.value = false
  }
}

async function toggleStatutAgent(a) {
  const actif = a.statut !== false
  const ok = await notify.confirm(
    actif
      ? 'Désactiver l’agent « ' +
          (a.nomComplet || '') +
          ' » ? Le statut passera à inactif (aucune suppression en base).'
      : 'Réactiver l’agent « ' + (a.nomComplet || '') + ' » ?',
    actif ? 'Désactivation' : 'Réactivation'
  )
  if (!ok) return
  try {
    await setAgentStatut(a.idAgent, !actif, a)
    await loadAgents()
    notify.toast.success(actif ? 'Agent désactivé.' : 'Agent réactivé.')
  } catch (e) {
    notify.error('Statut impossible à modifier', e?.message || 'Erreur inconnue.')
  }
}

onMounted(loadAll)
</script>
