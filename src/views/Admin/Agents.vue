<template>
  <DefaultLayout>
    <div class="space-y-6">
      <div class="rusa-gradient-header flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-2xl font-bold text-white">Agents</h1>
          <p class="text-primary-100">{{ headerIntro }}</p>
        </div>
        <button
          type="button"
          @click="openCreate"
          class="rusa-btn-primary shrink-0 bg-white text-primary-800 hover:bg-primary-50"
        >
          Nouvel agent
        </button>
      </div>

      <p
        v-if="error"
        class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/50 dark:text-red-200"
      >
        {{ error }}
      </p>

      <div
        class="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-primary-800/60 dark:bg-primary-950/70 dark:shadow-none sm:flex-row sm:flex-wrap sm:items-end"
      >
        <div class="min-w-0 flex-1 sm:min-w-[11rem] sm:max-w-xs">
          <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-primary-200/90">Nom</label>
          <input
            v-model.trim="filterNom"
            type="search"
            placeholder="Filtrer par nom…"
            autocomplete="off"
            class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-primary-700 dark:bg-primary-900/80 dark:text-gray-100 dark:placeholder:text-primary-500/50 dark:focus:border-primary-400 dark:focus:ring-primary-400"
          />
        </div>
        <div class="min-w-0 flex-1 sm:min-w-[11rem] sm:max-w-xs">
          <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-primary-200/90">E-mail</label>
          <input
            v-model.trim="filterEmail"
            type="search"
            placeholder="Filtrer par e-mail…"
            autocomplete="off"
            class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-primary-700 dark:bg-primary-900/80 dark:text-gray-100 dark:placeholder:text-primary-500/50 dark:focus:border-primary-400 dark:focus:ring-primary-400"
          />
        </div>
        <div class="min-w-0 flex-1 sm:min-w-[11rem] sm:max-w-xs">
          <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-primary-200/90">Téléphone</label>
          <input
            v-model.trim="filterTelephone"
            type="search"
            placeholder="Filtrer par numéro…"
            autocomplete="off"
            class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-primary-700 dark:bg-primary-900/80 dark:text-gray-100 dark:placeholder:text-primary-500/50 dark:focus:border-primary-400 dark:focus:ring-primary-400"
          />
        </div>
        <button
          v-if="filterNom || filterEmail || filterTelephone"
          type="button"
          class="shrink-0 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100 dark:border-primary-700 dark:bg-primary-900/60 dark:text-primary-200 dark:hover:bg-primary-800/80"
          @click="clearAgentFilters"
        >
          Réinitialiser
        </button>
      </div>

      <div
        class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-primary-800/60 dark:bg-primary-950/70 dark:shadow-none"
      >
        <div class="overflow-x-auto">
          <table class="w-full text-left">
            <thead class="border-b border-gray-200 bg-gray-50 dark:border-primary-800/60 dark:bg-primary-900/50">
              <tr>
                <th
                  class="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-primary-300/70"
                >
                  Photo
                </th>
                <th
                  class="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-primary-300/70"
                >
                  Agent
                </th>
                <th
                  class="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-primary-300/70"
                >
                  Rôle / fonction
                </th>
                <th
                  class="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-primary-300/70"
                >
                  Société
                </th>
                <th
                  class="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-primary-300/70"
                >
                  Statut
                </th>
                <th
                  class="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-primary-300/70"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-primary-800/50">
              <tr v-if="loading">
                <td colspan="6" class="px-6 py-10 text-center text-gray-500 dark:text-primary-400/80">
                  Chargement…
                </td>
              </tr>
              <tr v-else-if="!filteredAgents.length">
                <td colspan="6" class="px-6 py-10 text-center text-gray-500 dark:text-primary-400/80">
                  {{
                    agents.length
                      ? 'Aucun agent ne correspond aux filtres (nom, e-mail ou téléphone).'
                      : 'Aucun agent pour le moment.'
                  }}
                </td>
              </tr>
              <template v-else>
                <tr
                  v-for="a in filteredAgents"
                  :key="a.idAgent"
                  class="transition-colors hover:bg-gray-50/80 dark:hover:bg-primary-900/35"
                >
                <td class="px-4 py-4 align-middle">
                  <div
                    v-if="!agentPhotoSrc(a) || photoBrokenById[a.idAgent]"
                    class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-gray-100 text-xs font-semibold text-gray-600 dark:border-primary-700 dark:bg-primary-900/60 dark:text-primary-200"
                    :title="a.nomComplet || ''"
                  >
                    {{ agentInitials(a.nomComplet) }}
                  </div>
                  <img
                    v-else
                    :src="agentPhotoSrc(a)"
                    alt=""
                    class="h-11 w-11 shrink-0 rounded-full border border-primary-800/30 object-cover dark:border-primary-700/50"
                    @error="onAgentPhotoError(a.idAgent)"
                  />
                </td>
                <td class="px-6 py-4">
                  <p class="font-medium text-gray-900 dark:text-white">{{ a.nomComplet }}</p>
                  <p class="text-xs text-gray-500 dark:text-primary-300/60">
                    {{ a.emailAgent }} · {{ a.telephoneAgent || '—' }}
                  </p>
                </td>
                <td class="px-6 py-4 text-sm">
                  <div class="font-medium text-primary-700 dark:text-primary-400">{{ a.roleAgent || '—' }}</div>
                  <div class="text-gray-500 dark:text-primary-300/55">{{ a.fonction || '' }}</div>
                </td>
                <td class="px-6 py-4 text-sm text-gray-800 dark:text-gray-200">
                  {{ societeLabel(a.idSociete) }}
                </td>
                <td class="px-6 py-4">
                  <span
                    class="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium"
                    :class="
                      a.statut
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300'
                        : 'bg-gray-100 text-gray-700 dark:bg-primary-800/60 dark:text-primary-200'
                    "
                  >
                    {{ a.statut ? 'actif' : 'inactif' }}
                  </span>
                </td>
                <td class="whitespace-nowrap px-6 py-4 text-sm font-medium">
                  <button
                    type="button"
                    class="mr-3 text-primary-600 transition hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
                    @click="openView(a)"
                  >
                    Voir
                  </button>
                  <button
                    type="button"
                    class="mr-3 text-primary-600 transition hover:text-primary-500 disabled:opacity-50 dark:text-primary-400 dark:hover:text-primary-300"
                    :disabled="togglingId === a.idAgent"
                    @click="openEdit(a)"
                  >
                    Modifier
                  </button>
                  <button
                    type="button"
                    :disabled="togglingId === a.idAgent"
                    :class="
                      a.statut
                        ? 'text-amber-600 hover:text-amber-700 dark:text-amber-400/90 dark:hover:text-amber-300'
                        : 'text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300'
                    "
                    class="transition disabled:opacity-50"
                    @click="toggleAgentStatutRow(a)"
                  >
                    {{ a.statut ? 'Désactivé' : 'Réactiver' }}
                  </button>
                </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Fiche agent : rendu sous <body> pour passer au-dessus header / sidebar (z-99999) -->
      <Teleport to="body">
        <div
          v-if="showViewModal"
          class="fixed inset-0 z-[200000] flex min-h-0 items-center justify-center overflow-y-auto bg-gray-900/55 p-4 backdrop-blur-sm dark:bg-black/75"
          role="dialog"
          aria-modal="true"
          aria-labelledby="view-agent-title"
          @click.self="closeViewModal"
        >
        <div
          class="my-auto flex max-h-[min(88vh,620px)] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-2xl ring-1 ring-black/5 dark:border-primary-800/55 dark:bg-primary-950 dark:ring-white/5"
        >
          <header
            class="flex shrink-0 items-center justify-between border-b border-gray-100 bg-gray-50/90 px-5 py-3.5 dark:border-primary-800/50 dark:bg-primary-900/35"
          >
            <div>
              <p class="text-[10px] font-bold uppercase tracking-[0.22em] text-primary-600 dark:text-primary-400/90">
                Consultation
              </p>
              <p class="mt-0.5 text-xs text-gray-500 dark:text-primary-400/55">Aperçu du profil</p>
            </div>
          </header>

          <div class="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-5 sm:px-8">
            <p
              v-if="viewError"
              class="rounded-xl border border-red-200/80 bg-red-50/90 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200"
            >
              {{ viewError }}
            </p>
            <div
              v-else-if="viewLoading"
              class="flex min-h-[120px] items-center justify-center text-sm text-gray-500 dark:text-primary-300/70"
            >
              Chargement…
            </div>
            <div v-else-if="viewAgent" class="mx-auto max-w-md">
              <div class="flex flex-col items-center text-center">
                <div
                  class="relative flex h-[5.5rem] w-[5.5rem] shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-gray-100 to-white shadow-md ring-2 ring-gray-200/90 dark:from-primary-900/70 dark:to-primary-950 dark:ring-primary-600/25"
                >
                  <div
                    v-if="!viewPhotoSrc || viewPhotoBroken"
                    class="text-2xl font-bold tracking-tight text-gray-400 dark:text-primary-300/80"
                  >
                    {{ agentInitials(viewAgent.nomComplet) }}
                  </div>
                  <img
                    v-else
                    :src="viewPhotoSrc"
                    :alt="viewAgent.nomComplet || 'Photo'"
                    class="h-full w-full object-cover"
                    @error="viewPhotoBroken = true"
                  />
                </div>

                <h3
                  id="view-agent-title"
                  class="mt-5 max-w-full text-2xl font-bold leading-tight tracking-tight text-gray-900 dark:text-white"
                >
                  {{ viewAgent.nomComplet || '—' }}
                </h3>
                <p
                  v-if="viewRoleAgentLabel"
                  class="mt-1.5 text-sm font-semibold text-primary-600 dark:text-primary-400"
                >
                  {{ viewRoleAgentLabel }}
                </p>

                <div class="mt-4 w-full max-w-xs space-y-1.5 border-t border-gray-100 pt-4 dark:border-primary-800/40">
                  <p class="break-all text-sm text-gray-600 dark:text-primary-200/85">
                    {{ viewAgent.emailAgent || '—' }}
                  </p>
                  <p
                    v-if="viewAgent.telephoneAgent || viewAgent.TelephoneAgent"
                    class="text-sm text-gray-500 tabular-nums dark:text-primary-300/70"
                  >
                    {{ viewAgent.telephoneAgent || viewAgent.TelephoneAgent }}
                  </p>
                </div>

                <span
                  class="mt-5 inline-flex rounded-full px-3.5 py-1 text-xs font-semibold tracking-wide shadow-sm"
                  :class="
                    viewStatutIsActive(viewAgent)
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300'
                      : 'bg-gray-200 text-gray-700 dark:bg-primary-800/60 dark:text-primary-200'
                  "
                >
                  {{ viewStatutLabel(viewAgent) }}
                </span>
              </div>

              <div
                class="my-6 h-px w-full bg-gradient-to-r from-transparent via-gray-200 to-transparent dark:via-primary-700/30"
                aria-hidden="true"
              />

              <p
                class="mb-2 text-left text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 dark:text-primary-500/65"
              >
                Profil détaillé
              </p>
              <dl class="divide-y divide-gray-100 dark:divide-primary-800/40">
                <div
                  v-for="row in viewDetailRows"
                  :key="row.label"
                  class="flex flex-col gap-0.5 py-2.5 sm:flex-row sm:items-baseline sm:gap-5 sm:py-2"
                >
                  <dt
                    class="w-full shrink-0 text-left text-[10px] font-bold uppercase tracking-wide text-gray-500 dark:text-primary-400/70 sm:w-36 sm:pt-0.5"
                  >
                    {{ row.label }}
                  </dt>
                  <dd
                    class="min-w-0 flex-1 text-left text-sm leading-relaxed text-gray-900 dark:text-gray-100"
                  >
                    {{ row.value }}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          <footer
            v-if="!viewLoading"
            class="flex shrink-0 items-stretch justify-center gap-3 border-t border-gray-200 bg-gray-50/95 px-5 py-3.5 dark:border-primary-800/50 dark:bg-primary-900/45"
          >
            <button
              type="button"
              class="flex-1 rounded-xl border border-gray-200 bg-white py-2.5 text-sm font-semibold text-gray-800 shadow-sm transition hover:bg-gray-50 dark:border-primary-700 dark:bg-primary-950/80 dark:text-primary-100 dark:hover:bg-primary-900 sm:flex-none sm:min-w-[8rem]"
              @click="closeViewModal"
            >
              Fermer
            </button>
            <button
              v-if="viewAgent && !viewError"
              type="button"
              class="flex-1 rounded-xl bg-primary-600 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-primary-500 sm:flex-none sm:min-w-[8rem]"
              @click="editFromView"
            >
              Modifier
            </button>
          </footer>
        </div>
        </div>
      </Teleport>

      <Teleport to="body">
        <div
          v-if="showModal"
          class="fixed inset-0 z-[200000] flex min-h-0 items-center justify-center overflow-y-auto bg-gray-900/55 p-4 backdrop-blur-sm dark:bg-black/75"
        >
        <div
          class="my-auto max-h-[min(90vh,720px)] w-full max-w-lg overflow-y-auto rounded-xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-primary-800/60 dark:bg-primary-950 dark:shadow-2xl dark:shadow-black/40"
        >
          <h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            {{ editing ? 'Modifier l’agent' : 'Nouvel agent' }}
          </h3>
          <div class="space-y-3">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-primary-200/90">Photo</label>
              <div class="mt-1 flex flex-wrap items-center gap-3">
                <div
                  class="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-gray-100 text-sm font-semibold text-gray-600 dark:border-primary-700 dark:bg-primary-900/60 dark:text-primary-200"
                >
                  <img
                    v-if="formPhotoDisplaySrc"
                    :src="formPhotoDisplaySrc"
                    alt=""
                    class="h-full w-full object-cover"
                  />
                  <span v-else>{{ agentInitials(form.nomComplet) }}</span>
                </div>
                <div class="min-w-0 flex-1">
                  <input
                    ref="photoInputRef"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    class="block w-full max-w-full text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-primary-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-primary-700 hover:file:bg-primary-100 dark:text-primary-300 dark:file:bg-primary-900/80 dark:file:text-primary-200 dark:hover:file:bg-primary-800/80"
                    @change="onFormPhotoSelected"
                  />
                  <p class="mt-1 text-xs text-gray-500 dark:text-primary-400/70">
                    JPEG, PNG, WebP ou GIF — max. 5 Mo (redimensionné pour l’envoi).
                  </p>
                  <button
                    v-if="pendingPhotoDataUrl"
                    type="button"
                    class="mt-1 text-xs font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400"
                    @click="clearFormPhoto"
                  >
                    Retirer la photo
                  </button>
                </div>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-primary-200/90">Nom complet *</label>
              <input
                v-model="form.nomComplet"
                type="text"
                class="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-primary-700 dark:bg-primary-900/80 dark:text-gray-100 dark:focus:border-primary-400 dark:focus:ring-primary-400"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-primary-200/90">Email *</label>
              <input
                v-model="form.emailAgent"
                type="email"
                class="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-primary-700 dark:bg-primary-900/80 dark:text-gray-100 dark:focus:border-primary-400 dark:focus:ring-primary-400"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-primary-200/90">Téléphone</label>
              <input
                v-model="form.telephoneAgent"
                type="text"
                class="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-primary-700 dark:bg-primary-900/80 dark:text-gray-100 dark:focus:border-primary-400 dark:focus:ring-primary-400"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-primary-200/90">Rôle agent *</label>
              <select
                v-model="form.roleAgent"
                class="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-primary-700 dark:bg-primary-900/80 dark:text-gray-100 dark:focus:border-primary-400 dark:focus:ring-primary-400"
              >
                <option value="">— Choisir un rôle —</option>
                <option v-for="r in agentRoleSelectOptions" :key="r.idRole" :value="r.nom">
                  {{ r.nom }}
                </option>
              </select>
              <p v-if="!agentRoleSelectOptions.length" class="mt-1 text-xs text-amber-700 dark:text-amber-400/90">
                Catalogue des rôles indisponible. Rechargez la page ou vérifiez la connexion à l’API.
              </p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-primary-200/90">Fonction</label>
              <input
                v-model="form.fonction"
                type="text"
                class="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-primary-700 dark:bg-primary-900/80 dark:text-gray-100 dark:focus:border-primary-400 dark:focus:ring-primary-400"
              />
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-primary-200/90">Genre</label>
                <select
                  v-model="form.genre"
                  class="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-primary-700 dark:bg-primary-900/80 dark:text-gray-100 dark:focus:border-primary-400 dark:focus:ring-primary-400"
                >
                  <option value="M">M</option>
                  <option value="F">F</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-primary-200/90">Date naissance</label>
                <input
                  v-model="form.dateNaissance"
                  type="date"
                  class="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-primary-700 dark:bg-primary-900/80 dark:text-gray-100 dark:focus:border-primary-400 dark:focus:ring-primary-400"
                />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-primary-200/90">Adresse</label>
              <input
                v-model="form.adresseResidence"
                type="text"
                class="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-primary-700 dark:bg-primary-900/80 dark:text-gray-100 dark:focus:border-primary-400 dark:focus:ring-primary-400"
              />
            </div>
            <label v-if="!editing" class="flex items-center gap-2">
              <input
                v-model="form.statut"
                type="checkbox"
                class="size-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:border-primary-600 dark:bg-primary-900 dark:focus:ring-primary-500"
              />
              <span class="text-sm text-gray-700 dark:text-primary-200/90">Actif</span>
            </label>
          </div>
          <div class="mt-6 flex justify-end gap-3">
            <button
              type="button"
              class="rounded-lg border border-gray-200 bg-gray-100 px-4 py-2 text-gray-800 transition hover:bg-gray-200 dark:border-primary-700 dark:bg-primary-900/60 dark:text-primary-100 dark:hover:bg-primary-800/80"
              @click="closeModal"
            >
              Annuler
            </button>
            <button
              type="button"
              :disabled="saving"
              class="rounded-lg bg-primary-600 px-4 py-2 text-white transition hover:bg-primary-500 disabled:opacity-50"
              @click="save"
            >
              {{ saving ? '…' : 'Enregistrer' }}
            </button>
          </div>
        </div>
        </div>
      </Teleport>
    </div>
  </DefaultLayout>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import DefaultLayout from '@/components/layout/DefaultLayout.vue'
import { useAuthStore } from '@/stores/auth'
import { useRoleCatalogStore } from '@/stores/roleCatalog'
import { notify } from '@/utils/notify'
import { useAdminModuleGreeting } from '@/composables/useAdminModuleGreeting'
import { listSocietesArray } from '@/services/societeService'
import {
  listAgentsArray,
  createAgent,
  updateAgent,
  toggleAgentStatut,
  pickAgentPhotoUrl,
  resolveAgentPhotoUrl,
  fetchAgentDetail,
  matchCatalogRoleNom,
} from '@/services/agentService'

const authStore = useAuthStore()
const headerIntro = useAdminModuleGreeting('bienvenue — agents et société ci-dessous.')
const roleCatalog = useRoleCatalogStore()
const agents = ref([])
const societeOptions = ref([])
const filterNom = ref('')
const filterEmail = ref('')
const filterTelephone = ref('')
const loading = ref(false)
const error = ref('')
const showModal = ref(false)
const showViewModal = ref(false)
const viewAgent = ref(null)
const viewLoading = ref(false)
const viewError = ref('')
const viewPhotoBroken = ref(false)
const editing = ref(false)
const saving = ref(false)
/** @type {import('vue').Ref<number | null>} */
const togglingId = ref(null)
/** @type {import('vue').Ref<Record<number, boolean>>} */
const photoBrokenById = ref({})

/** @type {import('vue').Ref<HTMLInputElement | null>} */
const photoInputRef = ref(null)
/** Aperçu / envoi : data URL JPEG compressé (création ou remplacement). */
const pendingPhotoDataUrl = ref(null)

/**
 * Société pour POST /api/Agent : session courante, ou société « focus » super-admin.
 */
const idSocieteForSave = computed(() => {
  if (authStore.role === 'superadmin') {
    const n = Number(authStore.effectiveSocieteId)
    return Number.isFinite(n) && n > 0 ? n : null
  }
  const n = Number(authStore.societeId)
  return Number.isFinite(n) && n > 0 ? n : null
})

/** Super-Admin : jamais proposé à la création d’agent dans l’espace admin. */
function isSuperAdminCatalogRole(row) {
  const id = Number(row?.idRole)
  if (Number.isFinite(id) && id === 1) return true
  const n = String(row?.nom ?? row?.Nom ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '')
  return n === 'super-admin' || n === 'superadmin' || n === 'superadministrateur'
}

/** Rôles actifs (GET /api/Role), triés pour le menu déroulant agent. */
const agentRoleSelectOptions = computed(() => {
  const list = Array.isArray(roleCatalog.activeRoles) ? [...roleCatalog.activeRoles] : []
  let rows = list
    .filter((r) => r && String(r.nom ?? r.Nom ?? '').trim())
    .map((r) => ({
      idRole: r.idRole ?? r.IdRole,
      nom: String(r.nom ?? r.Nom ?? '').trim(),
    }))
  if (!editing.value) {
    rows = rows.filter((r) => !isSuperAdminCatalogRole(r))
  }
  return rows.sort((a, b) => a.nom.localeCompare(b.nom, 'fr', { sensitivity: 'base' }))
})

const formPhotoDisplaySrc = computed(() => {
  if (pendingPhotoDataUrl.value) return pendingPhotoDataUrl.value
  const raw = form.value.photoUrl
  if (raw && String(raw).trim()) {
    return resolveAgentPhotoUrl(String(raw).trim()) || String(raw).trim()
  }
  return null
})

const MAX_AGENT_PHOTO_BYTES = 5 * 1024 * 1024

/**
 * @param {File} file
 * @param {number} maxEdge
 * @param {number} quality
 * @returns {Promise<string>}
 */
function compressImageToJpegDataUrl(file, maxEdge = 960, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      let w = img.naturalWidth || img.width
      let h = img.naturalHeight || img.height
      if (!w || !h) {
        reject(new Error('Image invalide.'))
        return
      }
      const scale = Math.min(1, maxEdge / Math.max(w, h))
      w = Math.max(1, Math.round(w * scale))
      h = Math.max(1, Math.round(h * scale))
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Canvas indisponible.'))
        return
      }
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, w, h)
      ctx.drawImage(img, 0, 0, w, h)
      try {
        resolve(canvas.toDataURL('image/jpeg', quality))
      } catch (e) {
        reject(e)
      }
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Impossible de lire l’image.'))
    }
    img.src = url
  })
}

/**
 * @param {Event} e
 */
async function onFormPhotoSelected(e) {
  const input = /** @type {HTMLInputElement} */ (e.target)
  const file = input.files?.[0]
  if (!file) return
  if (file.size > MAX_AGENT_PHOTO_BYTES) {
    await notify.warning('Photo trop volumineuse', 'Le fichier dépasse la taille maximale autorisée (5 Mo).')
    input.value = ''
    return
  }
  try {
    pendingPhotoDataUrl.value = await compressImageToJpegDataUrl(file)
  } catch (err) {
    await notify.error('Image', err?.message || 'Traitement de l’image impossible.')
    pendingPhotoDataUrl.value = null
  } finally {
    input.value = ''
  }
}

function clearFormPhoto() {
  pendingPhotoDataUrl.value = null
  if (photoInputRef.value) photoInputRef.value.value = ''
}

const viewPhotoSrc = computed(() =>
  viewAgent.value ? resolveAgentPhotoUrl(pickAgentPhotoUrl(viewAgent.value)) : null
)

watch(viewPhotoSrc, () => {
  viewPhotoBroken.value = false
})

function formatViewDate(raw) {
  if (raw == null || raw === '') return '—'
  const s = String(raw)
  if (s.includes('T')) {
    const d = s.slice(0, 10)
    const t = s.slice(11, 19)
    return `${d} ${t}`.trim()
  }
  return s.length > 10 ? s.slice(0, 10) : s
}

function viewStatutLabel(a) {
  const v = a.statut ?? a.Statut
  if (v === false || v === 0 || v === '0' || String(v).toLowerCase() === 'false') {
    return 'Inactif'
  }
  return 'Actif'
}

function viewStatutIsActive(a) {
  const v = a.statut ?? a.Statut
  return !(v === false || v === 0 || v === '0' || String(v).toLowerCase() === 'false')
}

const viewRoleAgentLabel = computed(() => {
  const a = viewAgent.value
  if (!a) return ''
  const r = String(a.roleAgent ?? a.RoleAgent ?? '').trim()
  return r || ''
})

/** Champs complémentaires (nom, rôle, email, tél., statut, photo en en-tête — pas de société). */
const viewDetailRows = computed(() => {
  const a = viewAgent.value
  if (!a || typeof a !== 'object') return []
  return [
    { label: 'Matricule', value: a.matricule || a.Matricule || '—' },
    { label: 'Genre', value: a.genre || a.Genre || '—' },
    { label: 'Date de naissance', value: formatViewDate(a.dateNaissance ?? a.DateNaissance) },
    { label: 'État civil', value: a.etatCivil ?? a.EtatCivil ?? '—' },
    { label: 'Fonction', value: a.fonction || a.Fonction || '—' },
    { label: 'Adresse', value: a.adresseResidence || a.AdresseResidence || '—' },
  ]
})

function agentPhotoSrc(row) {
  return resolveAgentPhotoUrl(pickAgentPhotoUrl(row))
}

function agentInitials(name) {
  const s = String(name || '').trim()
  if (!s) return '?'
  const parts = s.split(/\s+/).filter(Boolean)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }
  return s.slice(0, 2).toUpperCase()
}

function onAgentPhotoError(idAgent) {
  const id = Number(idAgent)
  if (!Number.isFinite(id)) return
  photoBrokenById.value = { ...photoBrokenById.value, [id]: true }
}

const emptyForm = () => ({
  idAgent: 0,
  idSociete: '',
  nomComplet: '',
  emailAgent: '',
  telephoneAgent: '',
  roleAgent: '',
  fonction: '',
  genre: 'M',
  dateNaissance: '1990-01-01',
  adresseResidence: '',
  statut: true,
  photoUrl: '',
})

const form = ref(emptyForm())

/** Espaces / tirets ignorés pour le filtre téléphone. */
function normalizePhoneForMatch(s) {
  return String(s ?? '')
    .replace(/[\s.\-()]/g, '')
    .toLowerCase()
}

function pickAgentNom(a) {
  return String(a?.nomComplet ?? a?.NomComplet ?? '').trim()
}

function pickAgentEmail(a) {
  return String(a?.emailAgent ?? a?.EmailAgent ?? '').trim()
}

function pickAgentTelephone(a) {
  return String(a?.telephoneAgent ?? a?.TelephoneAgent ?? '').trim()
}

const filteredAgents = computed(() => {
  const list = agents.value
  const nq = filterNom.value.trim().toLowerCase()
  const eq = filterEmail.value.trim().toLowerCase()
  const tq = normalizePhoneForMatch(filterTelephone.value)
  if (!nq && !eq && !tq) return list
  return list.filter((a) => {
    if (nq && !pickAgentNom(a).toLowerCase().includes(nq)) return false
    if (eq && !pickAgentEmail(a).toLowerCase().includes(eq)) return false
    if (tq) {
      const tel = normalizePhoneForMatch(pickAgentTelephone(a))
      if (!tel.includes(tq)) return false
    }
    return true
  })
})

function clearAgentFilters() {
  filterNom.value = ''
  filterEmail.value = ''
  filterTelephone.value = ''
}

function societeLabel(idSociete) {
  const s = societeOptions.value.find((x) => Number(x.idSociete) === Number(idSociete))
  return s?.nom || (idSociete ? '#' + idSociete : '—')
}

async function loadSocietes() {
  try {
    societeOptions.value = await listSocietesArray()
  } catch {
    societeOptions.value = []
  }
}

async function loadAgents() {
  loading.value = true
  error.value = ''
  photoBrokenById.value = {}
  try {
    agents.value = await listAgentsArray()
  } catch (e) {
    error.value = e?.message || 'Erreur chargement agents'
    agents.value = []
  } finally {
    loading.value = false
  }
}

async function ensureRoleCatalog() {
  roleCatalog.hydrateFromStorage()
  if (!roleCatalog.roles.length && authStore.token) {
    await roleCatalog.syncFromApi(authStore.token)
  }
}

async function loadAll() {
  await Promise.all([loadSocietes(), loadAgents(), ensureRoleCatalog()])
}

async function openCreate() {
  editing.value = false
  clearFormPhoto()
  await ensureRoleCatalog()
  form.value = emptyForm()
  const sid = idSocieteForSave.value
  if (sid != null) form.value.idSociete = String(sid)
  showModal.value = true
}

async function openEdit(a) {
  editing.value = true
  clearFormPhoto()
  await ensureRoleCatalog()
  const rawDob = a.dateNaissance ?? a.DateNaissance
  const d = rawDob ? String(rawDob).slice(0, 10) : '1990-01-01'
  const idSoc = a.idSociete ?? a.IdSociete
  const statutRaw = a.statut ?? a.Statut
  const existingPhoto = pickAgentPhotoUrl(a) || ''
  const rawRole = a.roleAgent ?? a.RoleAgent ?? ''
  const catalog = roleCatalog.roles?.length ? roleCatalog.roles : agentRoleSelectOptions.value
  form.value = {
    idAgent: a.idAgent ?? a.IdAgent,
    idSociete: String(idSoc != null && idSoc !== '' ? idSoc : ''),
    nomComplet: a.nomComplet ?? a.NomComplet ?? '',
    emailAgent: a.emailAgent ?? a.EmailAgent ?? '',
    telephoneAgent: a.telephoneAgent ?? a.TelephoneAgent ?? '',
    roleAgent: matchCatalogRoleNom(rawRole, catalog),
    fonction: a.fonction ?? a.Fonction ?? '',
    genre: a.genre === 'F' || a.Genre === 'F' ? 'F' : 'M',
    dateNaissance: d,
    adresseResidence: a.adresseResidence ?? a.AdresseResidence ?? '',
    statut: statutRaw !== false && statutRaw !== 0,
    photoUrl: existingPhoto,
  }
  showModal.value = true
}

/** Ferme la fiche et ouvre le formulaire de modification avec les données chargées. */
function editFromView() {
  const v = viewAgent.value
  if (!v) return
  const snapshot = { ...v }
  closeViewModal()
  nextTick(() => openEdit(snapshot))
}

function closeModal() {
  showModal.value = false
  clearFormPhoto()
}

function closeViewModal() {
  showViewModal.value = false
  viewAgent.value = null
  viewError.value = ''
  viewPhotoBroken.value = false
}

async function openView(a) {
  showViewModal.value = true
  viewAgent.value = null
  viewLoading.value = true
  viewError.value = ''
  viewPhotoBroken.value = false
  try {
    if (!societeOptions.value.length) {
      await loadSocietes()
    }
    const d = await fetchAgentDetail(a.idAgent)
    if (d == null || d.idAgent == null) {
      viewError.value = 'Agent introuvable.'
      return
    }
    viewAgent.value = d
  } catch (e) {
    viewError.value = e?.message || 'Impossible de charger l’agent.'
  } finally {
    viewLoading.value = false
  }
}

async function save() {
  if (!form.value.nomComplet?.trim() || !form.value.emailAgent?.trim()) {
    await notify.warning('Saisie incomplète', 'Le nom complet et l’e-mail sont obligatoires.')
    return
  }
  if (!String(form.value.roleAgent || '').trim()) {
    await notify.warning('Rôle requis', 'Choisissez un rôle agent dans la liste.')
    return
  }
  if (!editing.value) {
    const sid = idSocieteForSave.value
    if (sid == null || sid <= 0) {
      await notify.warning(
        'Société requise',
        'Aucune société active pour cet espace. Reconnectez-vous ou, en super-admin, choisissez une société dans le sélecteur de contexte.'
      )
      return
    }
  }
  saving.value = true
  try {
    const photoPayload = pendingPhotoDataUrl.value || String(form.value.photoUrl || '').trim()
    if (editing.value) {
      await updateAgent(form.value.idAgent, {
        idAgent: form.value.idAgent,
        nomComplet: form.value.nomComplet,
        genre: form.value.genre,
        dateNaissance: form.value.dateNaissance,
        emailAgent: form.value.emailAgent,
        telephoneAgent: form.value.telephoneAgent,
        roleAgent: form.value.roleAgent,
        fonction: form.value.fonction,
        adresseResidence: form.value.adresseResidence,
        photoUrl: photoPayload,
      })
    } else {
      const sid = idSocieteForSave.value
      await createAgent({
        ...form.value,
        idSociete: sid,
        photoUrl: photoPayload,
        matricule: '',
      })
    }
    const wasEditing = editing.value
    closeModal()
    await loadAgents()
    await notify.toast.success(wasEditing ? 'Agent modifié.' : 'Agent créé.')
  } catch (e) {
    await notify.error('Enregistrement', e?.message || 'Erreur lors de l’enregistrement.')
  } finally {
    saving.value = false
  }
}

async function toggleAgentStatutRow(a) {
  const verb = a.statut ? 'désactiver' : 'réactiver'
  const ok = await notify.confirm(
    `Voulez-vous ${verb} l’agent « ${a.nomComplet} » ?`,
    `Confirmer : ${verb}`
  )
  if (!ok) return
  togglingId.value = a.idAgent
  try {
    await toggleAgentStatut(a.idAgent)
    await loadAgents()
    await notify.toast.success(a.statut ? 'Agent désactivé.' : 'Agent réactivé.')
  } catch (e) {
    await notify.error('Statut', e?.message || 'Impossible de modifier le statut.')
  } finally {
    togglingId.value = null
  }
}

onMounted(loadAll)
</script>
