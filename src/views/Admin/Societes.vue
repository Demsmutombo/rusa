<template>
  <DefaultLayout>
    <div class="min-w-0 space-y-3 sm:space-y-4">
      <div
        class="rusa-gradient-header flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:p-6"
      >
        <div class="min-w-0">
          <router-link
            v-if="isSuperAdminSocietesRoute"
            to="/super-admin"
            class="mb-1 inline-block text-xs font-medium text-primary-100 hover:text-white sm:mb-2"
          >
            ← Tableau de bord Super-Admin
          </router-link>
          <h1 class="text-xl font-bold text-white sm:text-2xl">{{ pageTitle }}</h1>
          <p class="mt-0.5 text-sm text-primary-100 sm:text-base">{{ pageSubtitle }}</p>
        </div>
        <button
          type="button"
          @click="openCreate"
          class="rusa-btn-primary w-full shrink-0 bg-white text-primary-800 hover:bg-primary-50 sm:w-auto"
        >
          Nouvelle société
        </button>
      </div>

      <p
        v-if="error"
        class="rounded-xl border border-red-200 bg-red-50 px-3 py-3 text-sm text-red-700 sm:px-4 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300"
      >
        {{ error }}
      </p>

      <AdminListToolbar
        v-if="!loading && societes.length"
        :search="searchQuery"
        :statut="statutFilter"
        :filtered-count="filteredRows.length"
        :total-count="societes.length"
        placeholder="Nom, email, téléphone, type…"
        @update:search="searchQuery = $event"
        @update:statut="statutFilter = $event"
        @clear="clearFilters"
      />
      <div
        v-if="!loading && societes.length && !filteredRows.length"
        class="rounded-xl border border-dashed border-primary-200 bg-primary-50/30 py-10 text-center text-sm text-gray-500 dark:border-primary-800 dark:bg-primary-950/20 dark:text-gray-400"
      >
        Aucun résultat pour cette recherche ou ce filtre de statut.
      </div>

      <!-- Mobile : cartes -->
      <div class="md:hidden space-y-3">
        <div
          v-if="loading"
          class="rusa-card-static p-8 text-center text-sm text-gray-500 dark:text-gray-400"
        >
          Chargement…
        </div>
        <p
          v-else-if="!societes.length"
          class="rounded-xl border border-dashed border-primary-200 bg-primary-50/30 py-10 text-center text-sm text-gray-500 dark:border-primary-800 dark:bg-primary-950/20 dark:text-gray-400"
        >
          Aucune société
        </p>
        <template v-else>
          <div
            v-for="s in filteredRows"
            :key="'m-' + s.idSociete"
            class="rusa-card-static overflow-hidden p-4 dark:border-primary-800 dark:bg-gray-900/40"
          >
            <div class="flex items-start justify-between gap-2">
              <div class="min-w-0">
                <p class="font-semibold text-gray-900 dark:text-white">{{ s.nom }}</p>
                <p
                  v-if="s.nomCompletResponsable"
                  class="mt-0.5 text-xs text-gray-600 dark:text-gray-400"
                >
                  {{ s.nomCompletResponsable }}
                </p>
                <p class="mt-1 line-clamp-2 text-xs text-gray-500 dark:text-gray-400">
                  {{ s.description || '—' }}
                </p>
              </div>
              <span
                class="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase"
                :class="
                  s.statut
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                "
              >
                {{ s.statut ? 'actif' : 'inactif' }}
              </span>
            </div>
            <dl class="mt-3 space-y-2 text-xs sm:text-sm">
              <div class="flex justify-between gap-2 border-t border-primary-100 pt-2 dark:border-primary-800/60">
                <dt class="text-gray-500 dark:text-gray-400">Type</dt>
                <dd class="font-medium text-gray-900 dark:text-white">{{ s.type || '—' }}</dd>
              </div>
              <div
                v-if="s.devise"
                class="flex justify-between gap-2"
              >
                <dt class="text-gray-500 dark:text-gray-400">Devise / slogan</dt>
                <dd class="max-w-[60%] text-right text-gray-900 dark:text-white">{{ s.devise }}</dd>
              </div>
              <div class="rounded-lg bg-primary-50/60 p-2 dark:bg-primary-950/30">
                <dt class="text-[10px] font-medium uppercase text-gray-500 dark:text-gray-400">Contact</dt>
                <dd class="mt-1 space-y-1 break-all text-gray-800 dark:text-gray-200">
                  <div>
                    <span class="text-[10px] uppercase text-gray-500 dark:text-gray-400">Email</span>
                    <a
                      v-if="s.emailContact"
                      :href="'mailto:' + s.emailContact"
                      class="mt-0.5 block text-primary-700 hover:underline dark:text-primary-400"
                    >{{ s.emailContact }}</a>
                    <span
                      v-else
                      class="text-gray-500"
                    >—</span>
                  </div>
                  <div>
                    <span class="text-[10px] uppercase text-gray-500 dark:text-gray-400">Tél.</span>
                    <a
                      v-if="s.telephone"
                      :href="'tel:' + String(s.telephone).replace(/\s/g, '')"
                      class="mt-0.5 block hover:underline"
                    >{{ s.telephone }}</a>
                    <span
                      v-else
                      class="text-gray-500"
                    >—</span>
                  </div>
                </dd>
              </div>
            </dl>
            <div class="mt-3 flex flex-wrap gap-2 border-t border-primary-100 pt-3 dark:border-primary-800/60">
              <button
                type="button"
                class="rusa-btn-ghost flex-1 min-w-[100px] py-2 text-sm dark:border-primary-700 dark:text-primary-200"
                @click="openView(s)"
              >
                Voir
              </button>
              <button
                type="button"
                class="rusa-btn-ghost flex-1 min-w-[100px] py-2 text-sm dark:border-primary-700 dark:text-primary-200"
                @click="openEdit(s)"
              >
                Modifier
              </button>
              <button
                type="button"
                class="rusa-btn-error flex-1 min-w-[100px] py-2 text-sm"
                @click="remove(s)"
              >
                Supprimer
              </button>
            </div>
          </div>
        </template>
      </div>

      <!-- Desktop / tablette : tableau -->
      <div class="rusa-panel hidden md:block dark:border-primary-800 dark:bg-gray-900/30">
        <div class="overflow-x-auto overscroll-x-contain -mx-px">
          <table class="w-full min-w-[720px] text-sm">
            <thead class="bg-primary-50/80 dark:bg-primary-950/50">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                  Société
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                  Contact
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                  Type
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                  Statut
                </th>
                <th class="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-primary-100 dark:divide-primary-800/50">
              <tr v-if="loading">
                <td
                  colspan="5"
                  class="px-4 py-10 text-center text-gray-500 dark:text-gray-400"
                >
                  Chargement…
                </td>
              </tr>
              <tr
                v-for="s in filteredRows"
                v-else
                :key="s.idSociete"
                class="hover:bg-primary-50/50 dark:hover:bg-primary-950/25"
              >
                <td class="max-w-[220px] px-4 py-3">
                  <p class="font-medium text-gray-900 dark:text-white">{{ s.nom }}</p>
                  <p class="mt-0.5 line-clamp-2 text-xs text-gray-500 dark:text-gray-400">
                    {{ s.description || '—' }}
                  </p>
                  <p
                    v-if="s.nomCompletResponsable"
                    class="mt-1 text-xs text-gray-600 dark:text-gray-300"
                  >
                    {{ s.nomCompletResponsable }}
                  </p>
                </td>
                <td class="px-4 py-3 text-gray-600 dark:text-gray-300">
                  <div class="break-all">{{ s.emailContact || '—' }}</div>
                  <div>{{ s.telephone || '—' }}</div>
                </td>
                <td class="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-200">
                  {{ s.type || '—' }}
                </td>
                <td class="px-4 py-3">
                  <span
                    class="inline-flex rounded-full px-2 py-1 text-xs font-medium"
                    :class="
                      s.statut
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                    "
                  >
                    {{ s.statut ? 'actif' : 'inactif' }}
                  </span>
                </td>
                <td class="whitespace-nowrap px-4 py-3 text-right text-sm font-medium">
                  <button
                    type="button"
                    class="text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                    @click="openView(s)"
                  >
                    Voir
                  </button>
                  <button
                    type="button"
                    class="ml-3 text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300"
                    @click="openEdit(s)"
                  >
                    Modifier
                  </button>
                  <button
                    type="button"
                    class="ml-3 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    @click="remove(s)"
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p
          v-if="!loading && societes.length === 0"
          class="border-t border-primary-100 px-4 py-10 text-center text-sm text-gray-500 dark:border-primary-800 dark:text-gray-400"
        >
          Aucune société
        </p>
      </div>

      <!-- Fiche lecture seule (body + z-index au-dessus header / menus) -->
      <Teleport to="body">
        <div
          v-if="showDetailModal"
          class="fixed inset-0 z-[500000] overflow-y-auto bg-gray-600/50"
        >
          <div
            class="flex min-h-full items-center justify-center p-4 py-8 sm:p-6"
            :class="modalAlignClass"
            @click.self="closeDetailModal"
          >
        <div
          class="w-full max-w-3xl rounded-2xl border border-primary-100 bg-white p-6 shadow-xl dark:border-primary-800 dark:bg-gray-900"
          @click.stop
        >
          <div class="flex items-start justify-between gap-2">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              Société
            </h3>
            <button
              type="button"
              class="rounded-lg px-2 py-1 text-sm text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
              aria-label="Fermer"
              @click="closeDetailModal"
            >
              ×
            </button>
          </div>
          <p
            v-if="detailSociete?.nom"
            class="mt-1 text-base font-medium text-primary-700 dark:text-primary-300"
          >
            {{ detailSociete.nom }}
          </p>
          <div
            v-if="detailLoading"
            class="mt-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400"
          >
            Chargement de la fiche…
          </div>
          <dl
            v-else-if="detailSociete"
            class="mt-4 space-y-3 text-sm"
          >
            <div class="flex justify-between gap-3 border-b border-primary-100 pb-2 dark:border-primary-800/60">
              <dt class="text-gray-500 dark:text-gray-400">N°</dt>
              <dd class="font-mono text-gray-900 dark:text-white">{{ detailSociete.idSociete }}</dd>
            </div>
            <div class="flex justify-between gap-3 border-b border-primary-100 pb-2 dark:border-primary-800/60">
              <dt class="text-gray-500 dark:text-gray-400">Statut</dt>
              <dd>
                <span
                  class="inline-flex rounded-full px-2 py-0.5 text-xs font-medium"
                  :class="
                    detailSociete.statut !== false
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                  "
                >
                  {{ detailSociete.statut !== false ? 'actif' : 'inactif' }}
                </span>
              </dd>
            </div>
            <div
              v-if="detailSociete.type"
              class="flex justify-between gap-3 border-b border-primary-100 pb-2 dark:border-primary-800/60"
            >
              <dt class="text-gray-500 dark:text-gray-400">Type</dt>
              <dd class="text-right text-gray-900 dark:text-white">{{ detailSociete.type }}</dd>
            </div>
            <div
              v-if="detailSociete.devise"
              class="flex justify-between gap-3 border-b border-primary-100 pb-2 dark:border-primary-800/60"
            >
              <dt class="text-gray-500 dark:text-gray-400">Devise / slogan</dt>
              <dd class="max-w-[65%] text-right text-gray-900 dark:text-white">{{ detailSociete.devise }}</dd>
            </div>
            <div
              v-if="detailSociete.nomCompletResponsable"
              class="flex justify-between gap-3 border-b border-primary-100 pb-2 dark:border-primary-800/60"
            >
              <dt class="text-gray-500 dark:text-gray-400">Responsable</dt>
              <dd class="text-right text-gray-900 dark:text-white">{{ detailSociete.nomCompletResponsable }}</dd>
            </div>
            <div
              v-if="detailSociete.genreResponsable"
              class="flex justify-between gap-3 border-b border-primary-100 pb-2 dark:border-primary-800/60"
            >
              <dt class="text-gray-500 dark:text-gray-400">Genre (resp.)</dt>
              <dd class="text-right text-gray-900 dark:text-white">{{ detailSociete.genreResponsable }}</dd>
            </div>
            <div class="flex justify-between gap-3 border-b border-primary-100 pb-2 dark:border-primary-800/60">
              <dt class="text-gray-500 dark:text-gray-400">Email</dt>
              <dd class="break-all text-right">
                <a
                  v-if="detailSociete.emailContact"
                  :href="'mailto:' + detailSociete.emailContact"
                  class="text-primary-600 hover:underline dark:text-primary-400"
                >{{ detailSociete.emailContact }}</a>
                <span
                  v-else
                  class="text-gray-500"
                >—</span>
              </dd>
            </div>
            <div class="flex justify-between gap-3 border-b border-primary-100 pb-2 dark:border-primary-800/60">
              <dt class="text-gray-500 dark:text-gray-400">Téléphone</dt>
              <dd class="text-right text-gray-900 dark:text-white">
                <a
                  v-if="detailSociete.telephone"
                  :href="'tel:' + String(detailSociete.telephone).replace(/\s/g, '')"
                  class="hover:underline"
                >{{ detailSociete.telephone }}</a>
                <span v-else>—</span>
              </dd>
            </div>
            <div class="flex justify-between gap-3 border-b border-primary-100 pb-2 dark:border-primary-800/60">
              <dt class="text-gray-500 dark:text-gray-400">Site web</dt>
              <dd class="break-all text-right">
                <a
                  v-if="detailSociete.siteWeb"
                  :href="externalHref(detailSociete.siteWeb)"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-primary-600 hover:underline dark:text-primary-400"
                >{{ detailSociete.siteWeb }}</a>
                <span
                  v-else
                  class="text-gray-500"
                >—</span>
              </dd>
            </div>
            <div
              v-if="detailSociete.description"
              class="border-b border-primary-100 pb-2 dark:border-primary-800/60"
            >
              <dt class="text-gray-500 dark:text-gray-400">Description</dt>
              <dd class="mt-1 whitespace-pre-wrap text-gray-900 dark:text-gray-200">{{ detailSociete.description }}</dd>
            </div>
            <div
              v-if="detailSociete.adresseResidence"
              class="border-b border-primary-100 pb-2 dark:border-primary-800/60"
            >
              <dt class="text-gray-500 dark:text-gray-400">Adresse</dt>
              <dd class="mt-1 text-gray-900 dark:text-white">{{ detailSociete.adresseResidence }}</dd>
            </div>
            <div
              v-if="detailSociete.logo"
              class="pt-1"
            >
              <dt class="text-gray-500 dark:text-gray-400">Logo</dt>
              <dd class="mt-2">
                <img
                  :src="detailSociete.logo"
                  alt=""
                  class="max-h-24 max-w-full rounded-lg border border-primary-100 object-contain dark:border-primary-800"
                />
              </dd>
            </div>
          </dl>
          <div class="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
            <button
              type="button"
              class="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium dark:border-gray-600 dark:text-gray-200"
              @click="closeDetailModal"
            >
              Fermer
            </button>
            <button
              type="button"
              class="rusa-btn-primary w-full sm:w-auto"
              @click="openEditFromDetail"
            >
              Modifier
            </button>
          </div>
        </div>
          </div>
        </div>
      </Teleport>

      <Teleport to="body">
        <div
          v-if="showModal"
          class="fixed inset-0 z-[500000] overflow-y-auto bg-gray-600/50"
        >
          <div
            class="flex min-h-full items-center justify-center p-4 py-8 sm:p-6"
            :class="modalAlignClass"
            @click.self="closeModal"
          >
        <div
          class="w-full max-w-3xl rounded-2xl border border-primary-100 bg-white p-6 shadow-xl dark:border-primary-800 dark:bg-gray-900"
          @click.stop
        >
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            {{ editing ? 'Modifier la société' : 'Nouvelle société' }}
          </h3>
          <div class="mt-4 space-y-3">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Nom *</label>
              <input
                v-model="form.nom"
                type="text"
                class="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              />
            </div>
            <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Devise</label>
                <input
                  v-model="form.devise"
                  type="text"
                  class="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Type</label>
                <input
                  v-model="form.type"
                  type="text"
                  class="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Téléphone</label>
              <input
                v-model="form.telephone"
                type="text"
                class="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Email contact</label>
              <input
                v-model="form.emailContact"
                type="email"
                class="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Site web</label>
              <input
                v-model="form.siteWeb"
                type="text"
                class="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Responsable (nom complet)</label>
              <input
                v-model="form.nomCompletResponsable"
                type="text"
                class="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
              <textarea
                v-model="form.description"
                rows="2"
                class="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Adresse</label>
              <input
                v-model="form.adresseResidence"
                type="text"
                class="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              />
            </div>
            <label class="flex items-center gap-2">
              <input
                v-model="form.statut"
                type="checkbox"
                class="rounded border-gray-300 dark:border-gray-600"
              />
              <span class="text-sm text-gray-700 dark:text-gray-300">Société active</span>
            </label>
          </div>
          <div class="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
            <button
              type="button"
              class="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium dark:border-gray-600 dark:text-gray-200"
              @click="closeModal"
            >
              Annuler
            </button>
            <button
              type="button"
              :disabled="saving"
              class="rusa-btn-primary w-full disabled:opacity-50 sm:w-auto"
              @click="save"
            >
              {{ saving ? '…' : 'Enregistrer' }}
            </button>
          </div>
        </div>
          </div>
        </div>
      </Teleport>
    </div>
  </DefaultLayout>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import DefaultLayout from '@/components/layout/DefaultLayout.vue'
import AdminListToolbar from '@/components/admin/AdminListToolbar.vue'
import { useAdminListSearch } from '@/composables/useAdminListSearch'
import { useSidebar } from '@/composables/useSidebar'
import { notify } from '@/utils/notify'
import {
  listSocietesArray,
  getSociete,
  createSociete,
  updateSociete,
  deleteSociete,
} from '@/services/societeService'

const route = useRoute()
const authStore = useAuthStore()
const { isExpanded, isHovered } = useSidebar()

/** lg+ : padding-gauche = largeur sidebar + marge (aligné sur DefaultLayout) */
const modalAlignClass = computed(() =>
  isExpanded.value || isHovered.value
    ? 'lg:pl-[calc(290px+1.5rem)]'
    : 'lg:pl-[calc(90px+1.5rem)]'
)

const isSuperAdminSocietesRoute = computed(() => route.name === 'SuperAdminSocietes')
const pageTitle = computed(() =>
  isSuperAdminSocietesRoute.value ? 'Sociétés (Super-Admin)' : 'Agences (Sociétés)'
)
const pageSubtitle = computed(() => {
  const full = String(authStore.user?.nomComplet || authStore.user?.NomComplet || '').trim()
  const first = full ? full.split(/\s+/)[0] : ''
  const greet = first ? `${first}, ` : ''
  const tail = isSuperAdminSocietesRoute.value
    ? 'bienvenue — sociétés et gestion ci-dessous.'
    : 'bienvenue — agences et sociétés ci-dessous.'
  return greet + tail
})

const societes = ref([])
const loading = ref(false)
const error = ref('')
const showModal = ref(false)
const showDetailModal = ref(false)
const detailSociete = ref(null)
const detailLoading = ref(false)
const editing = ref(false)
const saving = ref(false)

const emptyForm = () => ({
  idSociete: 0,
  nom: '',
  devise: '',
  type: '',
  telephone: '',
  emailContact: '',
  siteWeb: '',
  nomCompletResponsable: '',
  genreResponsable: 'M',
  description: '',
  statut: true,
  adresseResidence: '',
})

const form = ref(emptyForm())

function societeRowStatut(s) {
  const v = s?.statut
  return !(v === false || v === 0 || v === '0' || String(v).toLowerCase() === 'false')
}

function societeTextMatch(s, q) {
  const blob = [
    s.nom,
    s.description,
    s.nomCompletResponsable,
    s.type,
    s.devise,
    s.emailContact,
    s.telephone,
    s.siteWeb,
  ]
    .map((x) => String(x ?? '').toLowerCase())
    .join(' ')
  return blob.includes(q)
}

const { searchQuery, statutFilter, filteredRows, clearFilters } = useAdminListSearch(societes, societeTextMatch, {
  rowStatut: societeRowStatut,
})

async function load() {
  loading.value = true
  error.value = ''
  try {
    societes.value = await listSocietesArray()
  } catch (e) {
    error.value = e?.message || 'Erreur chargement sociétés'
    societes.value = []
  } finally {
    loading.value = false
  }
}

function externalHref(url) {
  const u = String(url || '').trim()
  if (!u) return '#'
  if (/^https?:\/\//i.test(u)) return u
  return `https://${u}`
}

function unwrapSocieteDetail(raw, fallbackId) {
  if (!raw || typeof raw !== 'object') return null
  const o = raw.data ?? raw.societe ?? raw.value ?? raw
  if (!o || typeof o !== 'object') return null
  return { ...o, idSociete: o.idSociete ?? o.IdSociete ?? fallbackId }
}

async function openView(s) {
  detailSociete.value = { ...s }
  showDetailModal.value = true
  detailLoading.value = true
  try {
    const raw = await getSociete(s.idSociete)
    const merged = unwrapSocieteDetail(raw, s.idSociete)
    if (merged) {
      detailSociete.value = { ...detailSociete.value, ...merged }
    }
  } catch {
    /* la ligne liste suffit */
  } finally {
    detailLoading.value = false
  }
}

function closeDetailModal() {
  showDetailModal.value = false
  detailSociete.value = null
}

function openEditFromDetail() {
  const s = detailSociete.value
  if (!s) return
  closeDetailModal()
  openEdit(s)
}

function openCreate() {
  editing.value = false
  form.value = emptyForm()
  showModal.value = true
}

function openEdit(s) {
  editing.value = true
  form.value = {
    idSociete: s.idSociete,
    nom: s.nom || '',
    devise: s.devise || '',
    type: s.type || '',
    telephone: s.telephone || '',
    emailContact: s.emailContact || '',
    siteWeb: s.siteWeb || '',
    nomCompletResponsable: s.nomCompletResponsable || '',
    genreResponsable: s.genreResponsable || 'M',
    description: s.description || '',
    statut: s.statut !== false,
    adresseResidence: s.adresseResidence || '',
  }
  showModal.value = true
}

function closeModal() {
  showModal.value = false
}

async function save() {
  if (!form.value.nom?.trim()) {
    await notify.warning('Saisie incomplète', 'Le nom de la société est obligatoire.')
    return
  }
  saving.value = true
  try {
    if (editing.value) {
      await updateSociete(form.value.idSociete, form.value)
    } else {
      await createSociete(form.value)
    }
    const wasEditing = editing.value
    closeModal()
    await load()
    await notify.toast.success(wasEditing ? 'Société modifiée.' : 'Société créée.')
  } catch (e) {
    await notify.error('Enregistrement', e?.message || 'Erreur lors de l’enregistrement.')
  } finally {
    saving.value = false
  }
}

async function remove(s) {
  const ok = await notify.confirm(
    'La société « ' + s.nom + ' » sera supprimée. Cette action est définitive.',
    'Supprimer la société ?'
  )
  if (!ok) return
  try {
    await deleteSociete(s.idSociete)
    await load()
    await notify.toast.success('Société supprimée.')
  } catch (e) {
    await notify.error('Suppression', e?.message || 'Suppression impossible.')
  }
}

onMounted(load)
</script>
