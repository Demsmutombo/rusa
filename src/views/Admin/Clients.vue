<template>
  <DefaultLayout>
    <div class="space-y-4">
      <div class="rusa-gradient-header flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div class="min-w-0 pr-2">
          <router-link
            v-if="isSuperAdminContext"
            to="/super-admin"
            class="mb-1 inline-block text-xs font-medium text-primary-100 hover:text-white sm:mb-2"
          >
            ← Tableau de bord Super-Admin
          </router-link>
          <router-link
            v-else
            to="/admin"
            class="mb-1 inline-block text-xs font-medium text-primary-100 hover:text-white sm:mb-2"
          >
            ← Tableau de bord Admin
          </router-link>
          <h1 class="text-xl font-bold leading-tight text-white sm:text-2xl">Clients</h1>
          <p class="mt-1 text-sm text-primary-100 sm:text-base">
            {{ headerIntro }}
          </p>
        </div>
        <button
          type="button"
          class="shrink-0 rounded-lg bg-white/15 px-4 py-2.5 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white/25"
          @click="openCreate"
        >
          Nouveau client
        </button>
      </div>

      <p
        v-if="error"
        class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/50 dark:text-red-200"
      >
        {{ error }}
      </p>

      <div
        class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-primary-800/60 dark:bg-primary-950/70 dark:shadow-none"
      >
        <div
          v-if="loading"
          class="px-4 py-10 text-center text-sm text-gray-500 dark:text-primary-400/80"
        >
          Chargement…
        </div>
        <div
          v-else-if="emptyList && noClientsAtAll"
          class="px-4 py-10 text-center text-sm text-gray-500 dark:text-primary-400/80"
        >
          Aucun client pour cette société.
        </div>
        <div
          v-else-if="emptyList"
          class="px-4 py-10 text-center text-sm text-gray-500 dark:text-primary-400/80"
        >
          Aucun résultat pour cette recherche ou ce filtre.
        </div>
        <template v-else>
          <AdminListToolbar
            v-if="showClientsToolbar"
            :search="searchQuery"
            :statut="statutFilter"
            :filtered-count="tableRows.length"
            :total-count="toolbarTotalCount"
            placeholder="Nom, email, téléphone, ville…"
            @update:search="onSearchInput"
            @update:statut="onStatutChange"
            @clear="clearFilters"
          />
          <div
            v-if="usePagedList && totalPagesDisplay > 1"
            class="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 px-4 py-2.5 text-sm dark:border-primary-800/50"
          >
            <button
              type="button"
              class="rounded-lg border border-gray-200 bg-white px-3 py-1.5 font-medium text-gray-800 disabled:opacity-40 dark:border-primary-700 dark:bg-primary-900/60 dark:text-primary-100"
              :disabled="!canGoPrevPage"
              @click="goPrevPage"
            >
              Précédent
            </button>
            <span class="tabular-nums text-gray-600 dark:text-primary-300/90">
              Page {{ pageNumber }} / {{ totalPagesDisplay }}
              <span class="text-xs text-gray-500 dark:text-primary-400/75">({{ totalCount }} au total)</span>
            </span>
            <button
              type="button"
              class="rounded-lg border border-gray-200 bg-white px-3 py-1.5 font-medium text-gray-800 disabled:opacity-40 dark:border-primary-700 dark:bg-primary-900/60 dark:text-primary-100"
              :disabled="!canGoNextPage"
              @click="goNextPage"
            >
              Suivant
            </button>
          </div>
          <template v-if="tableRows.length">
            <div class="hidden overflow-x-auto md:block">
              <table class="w-full min-w-[720px] text-left text-sm">
                <thead class="border-b border-gray-200 bg-gray-50 dark:border-primary-800/60 dark:bg-primary-900/50">
                  <tr>
                    <th class="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-primary-300/70">
                      Client
                    </th>
                    <th class="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-primary-300/70">
                      Contact
                    </th>
                    <th class="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-primary-300/70">
                      Genre
                    </th>
                    <th class="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-primary-300/70">
                      Statut
                    </th>
                    <th class="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-primary-300/70">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200 dark:divide-primary-800/50">
                <tr
                  v-for="r in tableRows"
                  :key="clientId(r)"
                  class="hover:bg-gray-50/80 dark:hover:bg-primary-900/35"
                >
                    <td class="max-w-[200px] px-4 py-3">
                      <p class="font-medium text-gray-900 dark:text-white">
                        {{ r.nomClient ?? r.NomClient ?? '—' }}
                      </p>
                    </td>
                    <td class="max-w-[220px] px-4 py-3 text-gray-700 dark:text-primary-200/90">
                      <p class="line-clamp-1 text-xs">{{ r.emailClient ?? r.EmailClient ?? '—' }}</p>
                      <p class="tabular-nums text-xs">{{ r.telephone ?? r.Telephone ?? '—' }}</p>
                    </td>
                    <td class="max-w-[180px] px-4 py-3 text-xs text-gray-600 dark:text-primary-300/80">
                      {{ genreLabel(r) }}
                    </td>
                    <td class="px-4 py-3">
                      <div class="flex flex-col gap-1">
                        <span
                          class="inline-flex w-fit rounded-full px-2 py-0.5 text-xs font-medium"
                          :class="
                            rowStatut(r)
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300'
                              : 'bg-gray-100 text-gray-700 dark:bg-primary-800/60 dark:text-primary-200'
                          "
                        >
                          {{ rowStatut(r) ? 'actif' : 'inactif' }}
                        </span>
                        <span
                          v-if="isActifRow(r) !== rowStatut(r)"
                          class="inline-flex w-fit rounded-full px-2 py-0.5 text-[10px] font-medium uppercase text-gray-500 dark:text-primary-400/80"
                        >
                          compte {{ isActifRow(r) ? 'oui' : 'non' }}
                        </span>
                      </div>
                    </td>
                    <td class="whitespace-nowrap px-4 py-3 font-medium">
                      <button
                        type="button"
                        class="mr-3 text-gray-600 hover:text-gray-800 dark:text-primary-300 dark:hover:text-primary-200"
                        @click="openView(r)"
                      >
                        Voir
                      </button>
                      <button
                        type="button"
                        class="mr-3 text-primary-600 hover:text-primary-500 dark:text-primary-400"
                        @click="openEdit(r)"
                      >
                        Modifier
                      </button>
                      <button
                        type="button"
                        :disabled="togglingId === clientId(r)"
                        :class="
                          rowStatut(r)
                            ? 'text-amber-600 hover:text-amber-700 dark:text-amber-400'
                            : 'text-emerald-600 hover:text-emerald-700 dark:text-emerald-400'
                        "
                        class="transition disabled:opacity-50"
                        @click="toggleStatut(r)"
                      >
                        {{ rowStatut(r) ? 'Désactivé' : 'Réactiver' }}
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="divide-y divide-gray-200 dark:divide-primary-800/50 md:hidden">
            <article
              v-for="r in tableRows"
              :key="`m-${clientId(r)}`"
              class="space-y-3 p-4"
            >
                <div class="flex flex-wrap items-start justify-between gap-2">
                  <p class="min-w-0 text-base font-semibold text-gray-900 dark:text-white">
                    {{ r.nomClient ?? r.NomClient ?? '—' }}
                  </p>
                  <span
                    class="inline-flex shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium"
                    :class="
                      rowStatut(r)
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300'
                        : 'bg-gray-100 text-gray-700 dark:bg-primary-800/60 dark:text-primary-200'
                    "
                  >
                    {{ rowStatut(r) ? 'actif' : 'inactif' }}
                  </span>
                </div>
                <dl class="grid gap-2 text-sm">
                  <div class="flex justify-between gap-3">
                    <dt class="text-gray-500 dark:text-primary-400/80">Email</dt>
                    <dd class="text-right text-gray-800 dark:text-gray-200">{{ r.emailClient ?? r.EmailClient ?? '—' }}</dd>
                  </div>
                  <div class="flex justify-between gap-3">
                    <dt class="text-gray-500 dark:text-primary-400/80">Téléphone</dt>
                    <dd class="tabular-nums text-gray-800 dark:text-gray-200">{{ r.telephone ?? r.Telephone ?? '—' }}</dd>
                  </div>
                  <div class="flex justify-between gap-3">
                    <dt class="text-gray-500 dark:text-primary-400/80">Genre</dt>
                    <dd class="text-right text-xs text-gray-700 dark:text-primary-200/90">{{ genreLabel(r) }}</dd>
                  </div>
                </dl>
                <div class="flex flex-wrap gap-2 border-t border-gray-100 pt-3 dark:border-primary-800/50">
                  <button
                    type="button"
                    class="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-800 dark:border-primary-700 dark:bg-primary-900/40 dark:text-primary-200"
                    @click="openView(r)"
                  >
                    Voir
                  </button>
                  <button
                    type="button"
                    class="rounded-lg border border-primary-200 bg-primary-50 px-3 py-2 text-sm font-medium text-primary-800 dark:border-primary-700 dark:bg-primary-900/50 dark:text-primary-200"
                    @click="openEdit(r)"
                  >
                    Modifier
                  </button>
                  <button
                    type="button"
                    :disabled="togglingId === clientId(r)"
                    class="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium transition disabled:opacity-50 dark:border-primary-700 dark:bg-primary-900/40"
                    :class="
                      rowStatut(r)
                        ? 'text-amber-800 dark:text-amber-300'
                        : 'text-emerald-800 dark:text-emerald-300'
                    "
                    @click="toggleStatut(r)"
                  >
                    {{ rowStatut(r) ? 'Désactivé' : 'Réactiver' }}
                  </button>
                </div>
              </article>
            </div>
          </template>
        </template>
      </div>

      <Teleport to="body">
        <div
          v-if="showModal"
          class="fixed inset-0 z-[200000] flex min-h-0 items-center justify-center overflow-y-auto bg-gray-900/55 p-4 backdrop-blur-sm dark:bg-black/75"
          @click.self="closeModal"
        >
          <!-- Fiche consultation : même gabarit que la modale « Voir » agent -->
          <div
            v-if="viewOnly"
            class="my-auto flex max-h-[min(88vh,680px)] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-2xl ring-1 ring-black/5 dark:border-primary-800/55 dark:bg-primary-950 dark:ring-white/5"
            role="dialog"
            aria-modal="true"
            aria-labelledby="view-client-title"
            @click.stop
          >
            <header
              class="flex shrink-0 items-center justify-between border-b border-gray-100 bg-gray-50/90 px-5 py-3.5 dark:border-primary-800/50 dark:bg-primary-900/35"
            >
              <div>
                <p class="text-[10px] font-bold uppercase tracking-[0.22em] text-primary-600 dark:text-primary-400/90">
                  Consultation
                </p>
                <p class="mt-0.5 text-xs text-gray-500 dark:text-primary-400/55">Fiche client</p>
              </div>
            </header>

            <div class="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-5 sm:px-8">
              <div
                v-if="detailLoading"
                class="flex min-h-[120px] items-center justify-center text-sm text-gray-500 dark:text-primary-300/70"
              >
                Chargement du dossier…
              </div>
              <div v-else class="mx-auto max-w-md">
                <div class="flex flex-col items-center text-center">
                  <div
                    class="relative flex h-[5.5rem] w-[5.5rem] shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-gray-100 to-white shadow-md ring-2 ring-gray-200/90 dark:from-primary-900/70 dark:to-primary-950 dark:ring-primary-600/25"
                  >
                    <span class="text-2xl font-bold tracking-tight text-gray-400 dark:text-primary-300/80">
                      {{ clientInitials(form.nomClient) }}
                    </span>
                  </div>

                  <h3
                    id="view-client-title"
                    class="mt-5 max-w-full text-2xl font-bold leading-tight tracking-tight text-gray-900 dark:text-white"
                  >
                    {{ form.nomClient || '—' }}
                  </h3>
                  <p
                    v-if="form.genreClient"
                    class="mt-1.5 text-sm font-semibold text-primary-600 dark:text-primary-400"
                  >
                    {{ form.genreClient }}
                  </p>

                  <div class="mt-4 w-full max-w-xs space-y-1.5 border-t border-gray-100 pt-4 dark:border-primary-800/40">
                    <p class="break-all text-sm text-gray-600 dark:text-primary-200/85">
                      {{ form.emailClient || '—' }}
                    </p>
                    <p
                      v-if="form.telephone"
                      class="text-sm text-gray-500 tabular-nums dark:text-primary-300/70"
                    >
                      {{ form.telephone }}
                    </p>
                  </div>

                  <div class="mt-5 flex flex-wrap items-center justify-center gap-2">
                    <span
                      class="inline-flex rounded-full px-3.5 py-1 text-xs font-semibold tracking-wide shadow-sm"
                      :class="
                        form.statut
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300'
                          : 'bg-gray-200 text-gray-700 dark:bg-primary-800/60 dark:text-primary-200'
                      "
                    >
                      Métier : {{ form.statut ? 'actif' : 'inactif' }}
                    </span>
                    <span
                      class="inline-flex rounded-full px-3.5 py-1 text-xs font-semibold tracking-wide shadow-sm"
                      :class="
                        form.isActif
                          ? 'bg-sky-100 text-sky-800 dark:bg-sky-500/20 dark:text-sky-300'
                          : 'bg-gray-200 text-gray-700 dark:bg-primary-800/60 dark:text-primary-200'
                      "
                    >
                      Compte : {{ form.isActif ? 'actif' : 'inactif' }}
                    </span>
                  </div>
                </div>

                <div
                  class="my-6 h-px w-full bg-gradient-to-r from-transparent via-gray-200 to-transparent dark:via-primary-700/30"
                  aria-hidden="true"
                />

                <div
                  v-if="viewContext"
                  class="mb-6 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2.5 text-left text-sm dark:border-primary-800/60 dark:bg-primary-900/40"
                >
                  <p class="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-primary-400/80">Société</p>
                  <p class="mt-1 font-medium text-gray-900 dark:text-white">
                    {{ societeDisplayName(viewContext) }}
                  </p>
                  <p v-if="Number(form.idClient) > 0" class="mt-2 text-xs tabular-nums text-gray-500 dark:text-primary-400/75">
                    Réf. client n°&nbsp;{{ form.idClient }}
                  </p>
                  <p v-if="idSocieteNumeric(viewContext) != null" class="mt-1 text-xs tabular-nums text-gray-500 dark:text-primary-400/75">
                    Identifiant société : {{ idSocieteNumeric(viewContext) }}
                  </p>
                  <p
                    v-if="formatDateTimeFr(viewContext?.dateCreation ?? viewContext?.DateCreation)"
                    class="mt-1 text-xs text-gray-500 dark:text-primary-400/75"
                  >
                    Création : {{ formatDateTimeFr(viewContext?.dateCreation ?? viewContext?.DateCreation) }}
                  </p>
                </div>

                <p
                  class="mb-2 text-left text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 dark:text-primary-500/65"
                >
                  Détails
                </p>
                <dl class="divide-y divide-gray-100 dark:divide-primary-800/40">
                  <div
                    v-for="row in viewClientDetailRows"
                    :key="row.label"
                    class="flex flex-col gap-0.5 py-2.5 sm:flex-row sm:items-baseline sm:gap-5 sm:py-2"
                  >
                    <dt
                      class="w-full shrink-0 text-left text-[10px] font-bold uppercase tracking-wide text-gray-500 dark:text-primary-400/70 sm:w-36 sm:pt-0.5"
                    >
                      {{ row.label }}
                    </dt>
                    <dd
                      class="min-w-0 flex-1 text-left text-sm leading-relaxed break-words text-gray-900 whitespace-pre-wrap dark:text-gray-100"
                    >
                      {{ row.value }}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            <footer
              v-if="!detailLoading"
              class="flex shrink-0 items-stretch justify-center gap-3 border-t border-gray-200 bg-gray-50/95 px-5 py-3.5 dark:border-primary-800/50 dark:bg-primary-900/45"
            >
              <button
                type="button"
                class="flex-1 rounded-xl border border-gray-200 bg-white py-2.5 text-sm font-semibold text-gray-800 shadow-sm transition hover:bg-gray-50 dark:border-primary-700 dark:bg-primary-950/80 dark:text-primary-100 dark:hover:bg-primary-900 sm:flex-none sm:min-w-[8rem]"
                @click="closeModal"
              >
                Fermer
              </button>
              <button
                v-if="form.idClient"
                type="button"
                class="flex-1 rounded-xl bg-primary-600 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-primary-500 sm:flex-none sm:min-w-[8rem]"
                @click="openEditFromView"
              >
                Modifier
              </button>
            </footer>
          </div>

          <div
            v-else
            class="my-auto max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-primary-800/60 dark:bg-primary-950"
            @click.stop
          >
            <h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              {{ editing ? 'Modifier le client' : 'Nouveau client' }}
            </h3>

            <div v-if="detailLoading" class="py-8 text-center text-sm text-gray-500 dark:text-primary-400/80">
              Chargement du dossier…
            </div>
            <div v-else class="space-y-3">
              <div v-if="editing && viewContext" class="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-sm dark:border-primary-800/60 dark:bg-primary-900/40">
                <p class="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-primary-400/80">Société</p>
                <p class="font-medium text-gray-900 dark:text-white">
                  {{ societeDisplayName(viewContext) }}
                </p>
                <p v-if="form.idClient" class="mt-2 text-xs tabular-nums text-gray-500 dark:text-primary-400/75">
                  Réf. client n°&nbsp;{{ form.idClient }}
                </p>
                <p v-if="idSocieteNumeric(viewContext) != null" class="mt-1 text-xs tabular-nums text-gray-500 dark:text-primary-400/75">
                  Identifiant société : {{ idSocieteNumeric(viewContext) }}
                </p>
                <p v-if="formatDateTimeFr(viewContext?.dateCreation ?? viewContext?.DateCreation)" class="mt-1 text-xs text-gray-500 dark:text-primary-400/75">
                  Création : {{ formatDateTimeFr(viewContext?.dateCreation ?? viewContext?.DateCreation) }}
                </p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-primary-200/90">Nom *</label>
                <input v-model="form.nomClient" type="text" :class="inputClass(false)" />
              </div>
              <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-primary-200/90">Email *</label>
                  <input
                    v-model="form.emailClient"
                    type="email"
                    autocomplete="email"
                    :class="inputClass(false)"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-primary-200/90">Téléphone *</label>
                  <input v-model="form.telephone" type="tel" :class="inputClass(false)" />
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-primary-200/90">Genre</label>
                <select v-model="form.genreClient" :class="inputClass(false)">
                  <option value="">—</option>
                  <option value="Masculin">Masculin</option>
                  <option value="Féminin">Féminin</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>
              <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-primary-200/90">Province</label>
                  <input v-model="form.province" type="text" :class="inputClass(false)" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-primary-200/90">Ville</label>
                  <input v-model="form.ville" type="text" :class="inputClass(false)" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-primary-200/90">Commune</label>
                  <input v-model="form.commune" type="text" :class="inputClass(false)" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-primary-200/90">Avenue</label>
                  <input v-model="form.avenue" type="text" :class="inputClass(false)" />
                </div>
                <div class="sm:col-span-2">
                  <label class="block text-sm font-medium text-gray-700 dark:text-primary-200/90">Numéro</label>
                  <input v-model="form.numero" type="text" :class="inputClass(false)" />
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-primary-200/90">Adresse (texte libre)</label>
                <textarea
                  v-model="form.adresseClient"
                  rows="3"
                  :class="inputClass(false)"
                  placeholder="Optionnel"
                />
              </div>

              <label class="flex items-center gap-2">
                <input v-model="form.statut" type="checkbox" class="size-4 rounded border-gray-300 text-primary-600" />
                <span class="text-sm text-gray-700 dark:text-primary-200/90">Statut actif (métier)</span>
              </label>
              <label class="flex items-center gap-2">
                <input v-model="form.isActif" type="checkbox" class="size-4 rounded border-gray-300 text-primary-600" />
                <span class="text-sm text-gray-700 dark:text-primary-200/90">Compte actif</span>
              </label>
            </div>

            <div v-if="!detailLoading" class="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                class="w-full rounded-lg border border-gray-200 bg-gray-100 px-4 py-2.5 text-gray-800 dark:border-primary-700 dark:bg-primary-900/60 dark:text-primary-100 sm:w-auto"
                @click="closeModal"
              >
                Annuler
              </button>
              <button
                type="button"
                :disabled="saving || detailLoading"
                class="w-full rounded-lg bg-primary-600 px-4 py-2.5 text-white hover:bg-primary-500 disabled:opacity-50 sm:w-auto"
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
import { ref, computed, onMounted, watch, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import DefaultLayout from '@/components/layout/DefaultLayout.vue'
import AdminListToolbar from '@/components/admin/AdminListToolbar.vue'
import { useTenantSocieteId } from '@/composables/useTenantSocieteId'
import { useAdminModuleGreeting } from '@/composables/useAdminModuleGreeting'
import {
  listClientsArray,
  listClientsBySocietePaged,
  getClient,
  createClient,
  updateClient,
  toggleClientStatut,
  setClientStatut,
} from '@/services/clientService'
import { notify } from '@/utils/notify'

const route = useRoute()
const { idSocieteForSave } = useTenantSocieteId()
const headerIntro = useAdminModuleGreeting('bienvenue — fiches clients, usages et statuts.')

const isSuperAdminContext = computed(() => route.path.startsWith('/super-admin'))

const usePagedList = computed(() => {
  const n = Number(idSocieteForSave.value)
  return Number.isFinite(n) && n > 0
})

const rows = ref([])
const totalCount = ref(0)
const pageNumber = ref(1)
const pageSize = ref(20)
const totalPages = ref(0)
const hasNextPage = ref(false)
const hasPreviousPage = ref(false)
const searchQuery = ref('')
const statutFilter = ref('all')
const appliedSearch = ref('')
let searchDebounceTimer = null

const loading = ref(false)
const error = ref('')
const showModal = ref(false)
const editing = ref(false)
const viewOnly = ref(false)
const viewContext = ref(null)
const saving = ref(false)
const togglingId = ref(null)
const detailLoading = ref(false)

const form = ref({
  idClient: 0,
  nomClient: '',
  adresseClient: '',
  telephone: '',
  emailClient: '',
  genreClient: '',
  statut: true,
  isActif: true,
  province: '',
  ville: '',
  commune: '',
  avenue: '',
  numero: '',
})

function inputClass(readonly) {
  return [
    'mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 dark:border-primary-700 dark:bg-primary-900/80 dark:text-gray-100',
    readonly ? 'cursor-default bg-gray-50 dark:bg-primary-900/50' : 'bg-white',
  ]
}

function clientId(r) {
  return r.idClient ?? r.IdClient
}

function rowStatut(r) {
  const v = r.statut ?? r.Statut
  return !(v === false || v === 0 || v === '0' || String(v).toLowerCase() === 'false')
}

function isActifRow(r) {
  const v = r.isActif ?? r.IsActif
  if (v === undefined || v === null) return true
  return !(v === false || v === 0 || v === '0' || String(v).toLowerCase() === 'false')
}

function usagesList(row) {
  const u = row?.usages ?? row?.Usages
  return Array.isArray(u) ? u : []
}

function usageLabel(u) {
  return String(u?.libelleUsage ?? u?.LibelleUsage ?? u?.descriptionUsage ?? u?.DescriptionUsage ?? 'Usage').trim() || '—'
}

function usagesSummaryLine(r) {
  const list = usagesList(r)
  if (!list.length) return '—'
  const parts = list.slice(0, 2).map((u) => usageLabel(u))
  const more = list.length > 2 ? ` +${list.length - 2}` : ''
  return `${parts.join(', ')}${more}`
}

function genreLabel(r) {
  const g = String(r?.genreClient ?? r?.GenreClient ?? '').trim()
  return g || '—'
}

/** Initiales pour l’avatar de la fiche consultation (même principe que les agents). */
function clientInitials(name) {
  const parts = String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
  if (!parts.length) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function formatDateCreation(row) {
  const s = String(row?.dateCreation ?? row?.DateCreation ?? '')
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (!m) return ''
  return `${m[3]}/${m[2]}/${m[1]}`
}

/** Date/heure lisible (fiches client / société). */
function formatDateTimeFr(raw) {
  const s = String(raw ?? '').trim()
  if (!s) return ''
  const d = new Date(s)
  if (!Number.isNaN(d.getTime())) {
    return d.toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })
  }
  return formatDateCreation({ dateCreation: s })
}

function idSocieteNumeric(row) {
  if (!row || typeof row !== 'object') return null
  const sid = row.idSociete ?? row.IdSociete
  const n = Number(sid)
  return Number.isFinite(n) && n > 0 ? n : null
}

/** Libellé société : nom API, ou n°, ou explicite si `idSociete` est null (liste globale). */
function societeDisplayName(row) {
  if (!row || typeof row !== 'object') return '—'
  const nom = String(row.nomSociete ?? row.NomSociete ?? '').trim()
  if (nom) return nom
  const sid = row.idSociete ?? row.IdSociete
  const n = Number(sid)
  if (Number.isFinite(n) && n > 0) return `Société #${n}`
  return 'Non rattaché à une société'
}

function clientTextMatch(r, q) {
  const a = extractClientAddressFields(r)
  const blob = [
    r.nomClient,
    r.NomClient,
    r.genreClient,
    r.GenreClient,
    r.emailClient,
    r.EmailClient,
    r.telephone,
    r.Telephone,
    r.ville,
    r.Ville,
    r.province,
    r.Province,
    r.commune,
    r.Commune,
    r.avenue,
    r.Avenue,
    r.numero,
    r.Numero,
    a.province,
    a.ville,
    a.commune,
    a.avenue,
    a.numero,
    r.adresseClient,
    r.AdresseClient,
    usagesSummaryLine(r),
  ]
    .map((x) => String(x ?? '').toLowerCase())
    .join(' ')
  return blob.includes(q)
}

const hasActiveFilters = computed(() => {
  if (String(searchQuery.value || '').trim()) return true
  if (statutFilter.value !== 'all') return true
  return false
})

/** Liste hors pagination : filtre texte + compte actif (aligné sur les query API). */
const filteredRows = computed(() => {
  if (usePagedList.value) return rows.value
  const list = Array.isArray(rows.value) ? [...rows.value] : []
  const needle = String(searchQuery.value || '').trim().toLowerCase()
  let out = needle ? list.filter((r) => clientTextMatch(r, needle)) : list
  if (statutFilter.value !== 'all') {
    const wantActive = statutFilter.value === 'active'
    out = out.filter((r) => isActifRow(r) === wantActive)
  }
  return out
})

const tableRows = computed(() => (usePagedList.value ? rows.value : filteredRows.value))

const toolbarTotalCount = computed(() => (usePagedList.value ? totalCount.value : rows.value.length))

const totalPagesDisplay = computed(() => {
  const tp = totalPages.value
  if (tp > 0) return tp
  const tc = totalCount.value
  const ps = pageSize.value || 20
  if (tc <= 0) return 1
  return Math.max(1, Math.ceil(tc / ps))
})

const canGoPrevPage = computed(
  () => usePagedList.value && (hasPreviousPage.value || pageNumber.value > 1),
)
const canGoNextPage = computed(
  () => usePagedList.value && (hasNextPage.value || pageNumber.value < totalPagesDisplay.value),
)

const noClientsAtAll = computed(() => {
  if (loading.value || error.value) return false
  if (usePagedList.value) return totalCount.value === 0 && !hasActiveFilters.value
  return rows.value.length === 0 && !hasActiveFilters.value
})

const emptyList = computed(() => {
  if (loading.value || error.value) return false
  if (usePagedList.value) return totalCount.value === 0
  return tableRows.value.length === 0
})

const showClientsToolbar = computed(() => {
  if (usePagedList.value) return totalCount.value > 0 || hasActiveFilters.value
  return rows.value.length > 0 || hasActiveFilters.value
})

/** Lignes dt/dd de la fiche « Voir » (design type agent). */
const viewClientDetailRows = computed(() => {
  if (!viewOnly.value) return []
  const f = form.value
  /** @type {{ label: string, value: string }[]} */
  const rows = []
  rows.push({ label: 'Genre', value: f.genreClient || '—' })
  const ac = String(f.adresseClient || '').trim()
  if (ac) rows.push({ label: 'Adresse (texte)', value: ac })
  return rows
})

function onSearchInput(v) {
  searchQuery.value = v
  if (searchDebounceTimer) clearTimeout(searchDebounceTimer)
  searchDebounceTimer = setTimeout(() => {
    const t = String(v || '').trim()
    appliedSearch.value = t
    pageNumber.value = 1
    load()
  }, 400)
}

function onStatutChange(v) {
  statutFilter.value = v
  pageNumber.value = 1
  load()
}

function clearFilters() {
  searchQuery.value = ''
  appliedSearch.value = ''
  if (searchDebounceTimer) clearTimeout(searchDebounceTimer)
  searchDebounceTimer = null
  statutFilter.value = 'all'
  pageNumber.value = 1
  load()
}

function goPrevPage() {
  if (!canGoPrevPage.value) return
  pageNumber.value = Math.max(1, pageNumber.value - 1)
  load()
}

function goNextPage() {
  if (!canGoNextPage.value) return
  pageNumber.value = pageNumber.value + 1
  load()
}

/**
 * Adresse structurée : champs racine, objet `adresse` / `Adresse` / DTO, ou JSON dans `adresseClient`.
 * @param {Record<string, unknown>} src
 */
function extractClientAddressFields(src) {
  const x = src && typeof src === 'object' ? src : {}
  const n =
    (x.adresse && typeof x.adresse === 'object' && x.adresse) ||
    (x.Adresse && typeof x.Adresse === 'object' && x.Adresse) ||
    (x.adresseDto && typeof x.adresseDto === 'object' && x.adresseDto) ||
    (x.AdresseDto && typeof x.AdresseDto === 'object' && x.AdresseDto) ||
    (x.adresseNavigation && typeof x.adresseNavigation === 'object' && x.adresseNavigation) ||
    (x.AdresseNavigation && typeof x.AdresseNavigation === 'object' && x.AdresseNavigation) ||
    null

  let j = /** @type {Record<string, unknown>} */ ({})
  const ac = String(x.adresseClient ?? x.AdresseClient ?? '').trim()
  if (ac.startsWith('{')) {
    try {
      const parsed = JSON.parse(ac)
      if (parsed && typeof parsed === 'object') j = /** @type {Record<string, unknown>} */ (parsed)
    } catch {
      j = {}
    }
  }

  function first(...candidates) {
    for (const v of candidates) {
      if (v === undefined || v === null) continue
      const s = String(v).trim()
      if (s) return s
    }
    return ''
  }

  return {
    province: first(x.province, x.Province, n?.province, n?.Province, j.province, j.Province),
    ville: first(x.ville, x.Ville, n?.ville, n?.Ville, j.ville, j.Ville),
    commune: first(x.commune, x.Commune, n?.commune, n?.Commune, j.commune, j.Commune),
    avenue: first(
      x.avenue,
      x.Avenue,
      n?.avenue,
      n?.Avenue,
      n?.rue,
      n?.Rue,
      n?.nomRue,
      n?.NomRue,
      j.avenue,
      j.Avenue,
      j.rue,
      j.Rue,
    ),
    numero: first(x.numero, x.Numero, n?.numero, n?.Numero, j.numero, j.Numero),
  }
}

function mapRowToForm(o) {
  const x = o && typeof o === 'object' ? o : {}
  const addr = extractClientAddressFields(x)
  return {
    idClient: Number(x.idClient ?? x.IdClient) || 0,
    nomClient: String(x.nomClient ?? x.NomClient ?? '').trim(),
    adresseClient: String(x.adresseClient ?? x.AdresseClient ?? '').trim(),
    telephone: String(x.telephone ?? x.Telephone ?? '').trim(),
    emailClient: String(x.emailClient ?? x.EmailClient ?? '').trim(),
    genreClient: String(x.genreClient ?? x.GenreClient ?? '').trim(),
    statut: rowStatut(x),
    isActif: isActifRow(x),
    province: addr.province,
    ville: addr.ville,
    commune: addr.commune,
    avenue: addr.avenue,
    numero: addr.numero,
  }
}

function buildPayloadFromForm() {
  const payload = {
    nomClient: form.value.nomClient.trim(),
    adresseClient: form.value.adresseClient.trim(),
    telephone: form.value.telephone.trim(),
    telephoneClient: form.value.telephone.trim(),
    emailClient: form.value.emailClient.trim(),
    genreClient: form.value.genreClient.trim(),
    statut: form.value.statut !== false,
    isActif: form.value.isActif !== false,
    province: form.value.province.trim(),
    ville: form.value.ville.trim(),
    commune: form.value.commune.trim(),
    avenue: form.value.avenue.trim(),
    numero: form.value.numero.trim(),
  }
  for (const k of Object.keys(payload)) {
    if (typeof payload[k] === 'string' && payload[k].trim() === '') {
      delete payload[k]
    }
  }
  return payload
}

function collectValidationMessages(err) {
  const d = err?.data && typeof err.data === 'object' ? err.data : null
  if (!d) return []
  const errors = d.errors && typeof d.errors === 'object' ? d.errors : null
  if (!errors) return []
  const out = []
  for (const [field, msgs] of Object.entries(errors)) {
    if (Array.isArray(msgs) && msgs.length) {
      out.push(`${field}: ${msgs.map((m) => String(m)).join(', ')}`)
    }
  }
  return out
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    if (usePagedList.value) {
      const sid = Number(idSocieteForSave.value)
      const res = await listClientsBySocietePaged(sid, {
        pageNumber: pageNumber.value,
        pageSize: pageSize.value,
        searchTerm: appliedSearch.value,
        statutFilter: statutFilter.value,
      })
      rows.value = Array.isArray(res.items) ? res.items : []
      totalCount.value = res.totalCount
      if (Number.isFinite(res.pageNumber) && res.pageNumber > 0) pageNumber.value = res.pageNumber
      if (Number.isFinite(res.pageSize) && res.pageSize > 0) pageSize.value = res.pageSize
      totalPages.value = res.totalPages
      hasNextPage.value = res.hasNextPage
      hasPreviousPage.value = res.hasPreviousPage
    } else {
      rows.value = await listClientsArray()
      totalCount.value = rows.value.length
      totalPages.value = 1
      hasNextPage.value = false
      hasPreviousPage.value = false
    }
  } catch (e) {
    error.value = e?.message || 'Erreur chargement'
    rows.value = []
    totalCount.value = 0
    totalPages.value = 0
    hasNextPage.value = false
    hasPreviousPage.value = false
  } finally {
    loading.value = false
  }
}

async function openView(r) {
  viewOnly.value = true
  editing.value = false
  viewContext.value = null
  detailLoading.value = true
  showModal.value = true
  const id = clientId(r)
  try {
    const d = await getClient(id)
    viewContext.value = d && typeof d === 'object' ? d : r
    form.value = mapRowToForm(viewContext.value)
  } catch {
    viewContext.value = r
    form.value = mapRowToForm(r)
  } finally {
    detailLoading.value = false
  }
}

function openCreate() {
  viewOnly.value = false
  viewContext.value = null
  editing.value = false
  detailLoading.value = false
  form.value = {
    idClient: 0,
    nomClient: '',
    adresseClient: '',
    telephone: '',
    emailClient: '',
    genreClient: '',
    statut: true,
    isActif: true,
    province: '',
    ville: '',
    commune: '',
    avenue: '',
    numero: '',
  }
  showModal.value = true
}

async function openEdit(r) {
  viewOnly.value = false
  viewContext.value = null
  editing.value = true
  detailLoading.value = true
  showModal.value = true
  const id = clientId(r)
  try {
    const d = await getClient(id)
    const obj = d && typeof d === 'object' ? d : r
    viewContext.value = obj
    form.value = mapRowToForm(obj)
  } catch {
    viewContext.value = r
    form.value = mapRowToForm(r)
  } finally {
    detailLoading.value = false
  }
}

function closeModal() {
  showModal.value = false
  viewOnly.value = false
  viewContext.value = null
  detailLoading.value = false
}

/** Depuis la fiche consultation : passer au formulaire de modification sans recharger. */
function openEditFromView() {
  viewOnly.value = false
  editing.value = true
}

function isValidEmail(s) {
  const t = String(s || '').trim()
  if (!t) return false
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t)
}

async function save() {
  if (!form.value.nomClient?.trim()) {
    await notify.warning('Saisie incomplète', 'Le nom du client est obligatoire.')
    return
  }
  if (!isValidEmail(form.value.emailClient)) {
    await notify.warning('Email', 'Indiquez une adresse email valide.')
    return
  }
  if (!form.value.telephone?.trim()) {
    await notify.warning('Saisie incomplète', 'Le téléphone est obligatoire.')
    return
  }
  if (!editing.value) {
    if (idSocieteForSave.value == null) {
      await notify.warning('Société', 'Aucune société active (super-admin : choisissez une société).')
      return
    }
  }
  saving.value = true
  try {
    const body = buildPayloadFromForm()
    const sid = idSocieteForSave.value
    if (sid != null && Number.isFinite(Number(sid)) && Number(sid) > 0) {
      body.idSociete = Number(sid)
    }
    if (editing.value) {
      await updateClient(form.value.idClient, body)
    } else {
      await createClient(body)
    }
    const wasEditing = editing.value
    closeModal()
    if (!wasEditing) pageNumber.value = 1
    await load()
    await notify.toast.success(wasEditing ? 'Client modifié.' : 'Client créé.')
  } catch (e) {
    const detail = String(e?.data?.detail || e?.data?.title || '').trim()
    const validations = collectValidationMessages(e)
    if (import.meta.env.DEV) {
      console.error('[POST/PUT Client] erreur API', e?.data || e)
    }
    const extra = validations.length ? ` — ${validations.join(' | ')}` : detail ? ` — ${detail}` : ''
    await notify.error('Enregistrement', `${e?.message || 'Erreur'}${extra}`)
  } finally {
    saving.value = false
  }
}

async function toggleStatut(r) {
  const id = clientId(r)
  const label = String(r.nomClient ?? r.NomClient ?? id)
  const wasActive = rowStatut(r)
  const verb = wasActive ? 'désactiver' : 'réactiver'
  const ok = await notify.confirm(`Voulez-vous ${verb} le client « ${label} » ?`, 'Confirmation')
  if (!ok) return
  togglingId.value = id
  try {
    await setClientStatut(id, !wasActive)
    await load()
    await notify.toast.success(wasActive ? 'Client désactivé.' : 'Client réactivé.')
  } catch (e) {
    await notify.error('Statut', e?.message || 'Impossible de modifier le statut.')
  } finally {
    togglingId.value = null
  }
}

watch(
  () => idSocieteForSave.value,
  (nv, ov) => {
    if (nv === ov) return
    searchQuery.value = ''
    appliedSearch.value = ''
    if (searchDebounceTimer) clearTimeout(searchDebounceTimer)
    searchDebounceTimer = null
    statutFilter.value = 'all'
    pageNumber.value = 1
    load()
  },
)

onMounted(load)

onUnmounted(() => {
  if (searchDebounceTimer) clearTimeout(searchDebounceTimer)
})
</script>
