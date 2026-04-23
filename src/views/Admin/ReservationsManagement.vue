<template>
  <DefaultLayout>
    <div class="space-y-4">
      <!-- Header -->
      <div class="rusa-gradient-header flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-2xl font-bold text-white">
            Gestion des Réservations
          </h1>
          <p class="text-primary-100">
            {{ headerIntro }}
          </p>
        </div>
        <div class="flex flex-wrap items-center gap-3">
          <button
            type="button"
            class="shrink-0 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-primary-700 shadow-sm transition hover:bg-primary-50 dark:bg-primary-100 dark:text-primary-900 dark:hover:bg-white"
            @click="openCreateReservation"
          >
            Nouvelle réservation
          </button>
          <button
            type="button"
            class="shrink-0 rounded-lg bg-white/15 px-4 py-2.5 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white/25"
          >
            Exporter les réservations
          </button>
        </div>
      </div>

      <!-- Stats Cards (palette alignée Bus / Destinations — thème primary) -->
      <div class="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div class="rusa-card p-5">
          <div class="flex items-center">
            <div
              class="rounded-lg bg-primary-100/90 p-3 text-primary-700 dark:bg-primary-900/55 dark:text-primary-300"
            >
              <svg class="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div class="ml-4 min-w-0">
              <p class="text-sm font-medium text-gray-600 dark:text-primary-300/80">Total Réservations</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.total }}</p>
            </div>
          </div>
        </div>

        <div class="rusa-card p-5">
          <div class="flex items-center">
            <div
              class="rounded-lg bg-primary-100/90 p-3 text-primary-700 dark:bg-primary-900/55 dark:text-primary-300"
            >
              <svg class="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="ml-4 min-w-0">
              <p class="text-sm font-medium text-gray-600 dark:text-primary-300/80">Confirmées</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.confirmed }}</p>
            </div>
          </div>
        </div>

        <div class="rusa-card p-5">
          <div class="flex items-center">
            <div
              class="rounded-lg bg-primary-100/90 p-3 text-primary-700 dark:bg-primary-900/55 dark:text-primary-300"
            >
              <svg class="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="ml-4 min-w-0">
              <p class="text-sm font-medium text-gray-600 dark:text-primary-300/80">En attente</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.pending }}</p>
            </div>
          </div>
        </div>

        <div class="rusa-card p-5">
          <div class="flex items-center">
            <div
              class="rounded-lg bg-primary-100/90 p-3 text-primary-700 dark:bg-primary-900/55 dark:text-primary-300"
            >
              <svg class="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="ml-4 min-w-0">
              <p class="text-sm font-medium text-gray-600 dark:text-primary-300/80">Revenus</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ formatMoneyFc(stats.revenue) }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters (même gabarit que Bus / AdminListToolbar) -->
      <div
        class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-primary-800/60 dark:bg-primary-950/70 dark:shadow-none md:p-5"
      >
        <div class="grid grid-cols-1 gap-4 md:grid-cols-4 md:items-end">
          <div>
            <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-primary-200/90">Rechercher</label>
            <input
              v-model="searchQuery"
              type="search"
              autocomplete="off"
              placeholder="Client, trajet, transporteur…"
              class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-primary-700 dark:bg-primary-900/80 dark:text-gray-100 dark:placeholder:text-primary-500/50 dark:focus:border-primary-400 dark:focus:ring-primary-400"
            />
          </div>
          <div>
            <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-primary-200/90">Statut</label>
            <select
              v-model="statusFilter"
              class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm font-medium text-gray-800 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/25 dark:border-primary-700 dark:bg-primary-900/70 dark:text-primary-100 dark:focus:border-primary-400"
            >
              <option value="">Tous les statuts</option>
              <option value="confirmed">Confirmées</option>
              <option value="pending">En attente</option>
              <option value="cancelled">Annulées</option>
              <option value="completed">Terminées</option>
            </select>
          </div>
          <div>
            <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-primary-200/90">Date</label>
            <input
              v-model="dateFilter"
              type="date"
              class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-primary-700 dark:bg-primary-900/80 dark:text-gray-100 dark:[color-scheme:dark] dark:focus:border-primary-400 dark:focus:ring-primary-400"
            />
          </div>
          <div class="flex items-end">
            <button
              type="button"
              class="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 dark:border-primary-700 dark:bg-primary-900/50 dark:text-primary-200 dark:hover:bg-primary-800/60"
              @click="resetFilters"
            >
              Réinitialiser
            </button>
          </div>
        </div>
      </div>

      <!-- Reservations Table -->
      <div class="rusa-panel">
        <p
          v-if="error"
          class="border-b border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200"
        >
          {{ error }}
        </p>
        <p
          v-if="loading"
          class="px-4 py-10 text-center text-sm text-gray-500 dark:text-primary-400/80"
        >
          Chargement des réservations…
        </p>
        <div v-else class="overflow-x-auto">
          <table class="w-full min-w-[720px] text-left text-sm">
            <thead class="border-b border-gray-200 bg-gray-50 dark:border-primary-800/60 dark:bg-primary-900/50">
              <tr>
                <th class="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-primary-300/70">
                  Création
                </th>
                <th class="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-primary-300/70">
                  Client
                </th>
                <th class="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-primary-300/70">
                  Trajet
                </th>
                <th class="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-primary-300/70">
                  Date & Heure
                </th>
                <th class="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-primary-300/70">
                  Places
                </th>
                <th class="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-primary-300/70">
                  Total
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
                v-for="reservation in filteredReservations"
                :key="reservation.id"
                class="bg-white hover:bg-gray-50/80 dark:bg-primary-950/40 dark:hover:bg-primary-900/35"
              >
                <td class="whitespace-nowrap px-4 py-3">
                  <p class="font-medium text-gray-900 dark:text-gray-100">{{ reservation.createdAt }}</p>
                </td>
                <td class="whitespace-nowrap px-4 py-3">
                  <div class="flex items-center">
                    <div
                      class="flex size-8 shrink-0 items-center justify-center rounded-full bg-gray-200 text-gray-700 dark:bg-primary-800 dark:text-primary-100"
                    >
                      <span class="text-xs font-medium">{{ clientInitial(reservation.clientName) }}</span>
                    </div>
                    <div class="ml-3 min-w-0">
                      <p class="font-medium text-gray-900 dark:text-gray-100">{{ reservation.clientName }}</p>
                      <p class="truncate text-gray-500 dark:text-primary-400/85">{{ reservation.clientEmail }}</p>
                    </div>
                  </div>
                </td>
                <td class="whitespace-nowrap px-4 py-3">
                  <div>
                    <p class="font-medium text-gray-900 dark:text-gray-100">
                      {{ reservation.departure }} → {{ reservation.arrival }}
                    </p>
                    <p class="text-gray-500 dark:text-primary-400/85">{{ reservation.carrier }}</p>
                  </div>
                </td>
                <td class="whitespace-nowrap px-4 py-3">
                  <div>
                    <p class="text-gray-900 dark:text-gray-100">{{ reservation.date }}</p>
                    <p class="text-gray-500 dark:text-primary-400/85">{{ reservation.time }}</p>
                  </div>
                </td>
                <td class="whitespace-nowrap px-4 py-3 text-gray-900 dark:text-gray-100">
                  {{ reservation.places }} place(s)
                </td>
                <td class="whitespace-nowrap px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
                  {{ formatMoneyFc(reservation.totalPrice) }}
                </td>
                <td class="whitespace-nowrap px-4 py-3">
                  <span class="rounded-full px-2 py-1 text-xs font-medium" :class="getStatusBadgeClass(reservation.status)">
                    {{ statusLabel(reservation.status) }}
                  </span>
                </td>
                <td class="whitespace-nowrap px-4 py-3 text-sm font-medium">
                  <button
                    type="button"
                    class="mr-3 text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-200"
                    @click="viewReservationDetails(reservation)"
                  >
                    Détails
                  </button>
                  <button
                    v-if="reservation.status === 'pending'"
                    type="button"
                    class="mr-3 text-emerald-600 hover:text-emerald-800 dark:text-emerald-400/90 dark:hover:text-emerald-300"
                    @click="confirmReservation(reservation)"
                  >
                    Confirmer
                  </button>
                  <button
                    v-if="reservation.status === 'pending' || reservation.status === 'confirmed'"
                    type="button"
                    class="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    @click="cancelReservation(reservation)"
                  >
                    Annuler
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
          <p
            v-if="!filteredReservations.length"
            class="px-4 py-10 text-center text-sm text-gray-500 dark:text-primary-400/80"
          >
            Aucune réservation à afficher.
          </p>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <div
        v-if="showCreateModal"
        class="fixed inset-0 z-[200000] flex items-center justify-center overflow-y-auto bg-gray-900/55 p-4 backdrop-blur-sm dark:bg-black/75"
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-reservation-title"
        @click.self="closeCreateReservation"
      >
        <div
          class="my-auto w-full max-w-lg rounded-xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-primary-800/60 dark:bg-primary-950"
          @click.stop
        >
          <h2
            id="create-reservation-title"
            class="text-lg font-semibold text-gray-900 dark:text-white"
          >
            Nouvelle réservation
          </h2>

          <div v-if="createRefsLoading" class="mt-6 py-8 text-center text-sm text-gray-500 dark:text-primary-400/80">
            Chargement des listes…
          </div>
          <div v-else class="mt-5 space-y-4">
            <div class="relative">
              <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-primary-200/90">Client *</label>
              <input
                v-model="clientFilterQuery"
                type="search"
                autocomplete="off"
                placeholder="Rechercher par nom ou e-mail…"
                class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-primary-700 dark:bg-primary-900/80 dark:text-gray-100 dark:placeholder:text-primary-500/50 dark:focus:border-primary-400"
                @focus="clientPickerOpen = true"
                @blur="onClientPickerBlur"
              />
              <p v-if="selectedClientDisplay" class="mt-2 text-sm font-medium text-gray-800 dark:text-primary-100">
                Client : {{ selectedClientDisplay }}
              </p>
              <div
                v-show="clientPickerOpen"
                class="absolute z-10 mt-1 max-h-52 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:border-primary-700 dark:bg-primary-900"
              >
                <button
                  v-for="c in filteredClientChoices"
                  :key="clientRowId(c)"
                  type="button"
                  class="flex w-full flex-col items-start gap-0.5 px-3 py-2 text-left text-sm text-gray-900 hover:bg-gray-50 dark:text-primary-100 dark:hover:bg-primary-800/60"
                  @mousedown.prevent="selectClientForReservation(c)"
                >
                  <span class="font-medium">{{ clientDisplayName(c) }}</span>
                  <span v-if="clientSecondaryLine(c)" class="text-xs text-gray-500 dark:text-primary-400/80">{{ clientSecondaryLine(c) }}</span>
                </button>
                <p
                  v-if="!filteredClientChoices.length"
                  class="px-3 py-2.5 text-sm text-gray-500 dark:text-primary-400/80"
                >
                  Aucun client ne correspond.
                </p>
              </div>
            </div>
            <div>
              <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-primary-200/90">Voyage *</label>
              <select
                v-model="createForm.idVoyage"
                class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-primary-700 dark:bg-primary-900/80 dark:text-gray-100 dark:focus:border-primary-400"
              >
                <option value="">— Choisir —</option>
                <option v-for="v in voyageChoices" :key="voyageRowId(v)" :value="String(voyageRowId(v))">
                  {{ voyageOptionLabel(v) }}
                </option>
              </select>
            </div>
            <div>
              <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-primary-200/90">Nombre de places *</label>
              <input
                v-model.number="createForm.nombrePlaces"
                type="number"
                min="1"
                max="100"
                step="1"
                class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-900 shadow-sm tabular-nums focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-primary-700 dark:bg-primary-900/80 dark:text-gray-100 dark:[color-scheme:dark]"
              />
            </div>
            <div>
              <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-primary-200/90">Date de réservation *</label>
              <input
                v-model="createForm.dateReservation"
                type="date"
                class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-primary-700 dark:bg-primary-900/80 dark:text-gray-100 dark:[color-scheme:dark]"
              />
            </div>
            <div>
              <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-primary-200/90">Statut (libellé API)</label>
              <select
                v-model="createForm.statutReservation"
                class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-primary-700 dark:bg-primary-900/80 dark:text-gray-100 dark:focus:border-primary-400"
              >
                <option v-for="o in RESERVATION_STATUT_SELECT_OPTIONS" :key="o.value" :value="o.value">
                  {{ o.label }}
                </option>
              </select>
            </div>
            <label class="flex items-center gap-2">
              <input v-model="createForm.statut" type="checkbox" class="size-4 rounded border-gray-300 text-primary-600" />
              <span class="text-sm text-gray-700 dark:text-primary-200/90">Actif (champ statut)</span>
            </label>
          </div>

          <div class="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              class="w-full rounded-lg border border-gray-200 bg-gray-100 px-4 py-2.5 text-sm font-semibold text-gray-800 dark:border-primary-700 dark:bg-primary-900/60 dark:text-primary-100 sm:w-auto"
              :disabled="createSaving"
              @click="closeCreateReservation"
            >
              Annuler
            </button>
            <button
              type="button"
              class="w-full rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 disabled:opacity-50 sm:w-auto"
              :disabled="createSaving || createRefsLoading"
              @click="submitCreateReservation"
            >
              {{ createSaving ? 'Enregistrement…' : 'Créer' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <Teleport to="body">
      <div
        v-if="showDetailModal && detailReservation"
        class="fixed inset-0 z-[200000] flex min-h-0 items-center justify-center overflow-y-auto bg-gray-900/55 p-4 backdrop-blur-sm dark:bg-black/75"
        role="dialog"
        aria-modal="true"
        aria-labelledby="detail-reservation-title"
        @click.self="closeDetailModal"
      >
        <div
          class="my-auto flex max-h-[min(90vh,640px)] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-2xl ring-1 ring-black/5 dark:border-primary-800/55 dark:bg-primary-950 dark:ring-white/5"
          @click.stop
        >
          <header
            class="shrink-0 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white px-5 py-4 dark:border-primary-800/50 dark:from-primary-900/40 dark:to-primary-950"
          >
            <p class="text-[10px] font-bold uppercase tracking-[0.2em] text-primary-600 dark:text-primary-400/90">
              Consultation
            </p>
            <h2 id="detail-reservation-title" class="mt-1 text-xl font-bold tracking-tight text-gray-900 dark:text-white">
              Détails de la réservation
            </h2>
            <p class="mt-1 text-sm text-gray-500 dark:text-primary-400/75">
              Enregistrée le {{ detailReservation.createdAt }}
            </p>
          </header>

          <div class="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5">
            <div class="flex flex-col items-center text-center">
              <div
                class="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-100 to-primary-50 text-lg font-bold text-primary-700 shadow-inner ring-2 ring-primary-200/80 dark:from-primary-900/80 dark:to-primary-950 dark:text-primary-200 dark:ring-primary-600/30"
              >
                {{ clientInitial(detailReservation.clientName) }}
              </div>
              <p class="mt-3 text-lg font-semibold text-gray-900 dark:text-white">
                {{ detailReservation.clientName }}
              </p>
              <p class="mt-0.5 break-all text-sm text-gray-500 dark:text-primary-400/80">
                {{ detailReservation.clientEmail }}
              </p>
            </div>

            <div
              class="mt-6 rounded-xl border border-gray-100 bg-gray-50/80 dark:border-primary-800/50 dark:bg-primary-900/35"
            >
              <dl class="divide-y divide-gray-100 dark:divide-primary-800/40">
                <div class="flex flex-col gap-0.5 px-4 py-3 sm:flex-row sm:items-baseline sm:gap-4">
                  <dt class="shrink-0 text-[10px] font-bold uppercase tracking-wide text-gray-500 dark:text-primary-400/70 sm:w-28">
                    Trajet
                  </dt>
                  <dd class="min-w-0 text-sm font-medium text-gray-900 dark:text-primary-50">
                    <span class="text-primary-700 dark:text-primary-300">{{ detailReservation.departure }}</span>
                    <span class="mx-1.5 text-gray-400 dark:text-primary-500/60">→</span>
                    <span class="text-primary-700 dark:text-primary-300">{{ detailReservation.arrival }}</span>
                  </dd>
                </div>
                <div class="flex flex-col gap-0.5 px-4 py-3 sm:flex-row sm:items-baseline sm:gap-4">
                  <dt class="shrink-0 text-[10px] font-bold uppercase tracking-wide text-gray-500 dark:text-primary-400/70 sm:w-28">
                    Transport
                  </dt>
                  <dd class="min-w-0 text-sm text-gray-800 dark:text-primary-100/90">
                    {{ detailReservation.carrier }}
                  </dd>
                </div>
                <div class="flex flex-col gap-0.5 px-4 py-3 sm:flex-row sm:items-baseline sm:gap-4">
                  <dt class="shrink-0 text-[10px] font-bold uppercase tracking-wide text-gray-500 dark:text-primary-400/70 sm:w-28">
                    Départ
                  </dt>
                  <dd class="min-w-0 text-sm text-gray-900 dark:text-primary-50">
                    <span class="font-medium tabular-nums">{{ detailReservation.date }}</span>
                    <span class="text-gray-400 dark:text-primary-500/60"> · </span>
                    <span class="tabular-nums text-gray-600 dark:text-primary-300/85">{{ detailReservation.time }}</span>
                  </dd>
                </div>
                <div class="flex flex-col gap-0.5 px-4 py-3 sm:flex-row sm:items-baseline sm:gap-4">
                  <dt class="shrink-0 text-[10px] font-bold uppercase tracking-wide text-gray-500 dark:text-primary-400/70 sm:w-28">
                    Places
                  </dt>
                  <dd class="text-sm font-medium tabular-nums text-gray-900 dark:text-primary-50">
                    {{ detailReservation.places }} place{{ Number(detailReservation.places) === 1 ? '' : 's' }}
                  </dd>
                </div>
                <div class="flex flex-col gap-0.5 px-4 py-3 sm:flex-row sm:items-baseline sm:gap-4">
                  <dt class="shrink-0 text-[10px] font-bold uppercase tracking-wide text-gray-500 dark:text-primary-400/70 sm:w-28">
                    Montant
                  </dt>
                  <dd class="text-base font-semibold tabular-nums text-gray-900 dark:text-white">
                    {{ formatMoneyFc(detailReservation.totalPrice) }}
                  </dd>
                </div>
                <div class="flex flex-col gap-1.5 px-4 py-3 sm:flex-row sm:items-center sm:gap-4">
                  <dt class="shrink-0 text-[10px] font-bold uppercase tracking-wide text-gray-500 dark:text-primary-400/70 sm:w-28">
                    Statut
                  </dt>
                  <dd class="flex flex-wrap items-center gap-2">
                    <span
                      class="inline-flex rounded-full px-3 py-1 text-xs font-semibold tracking-wide"
                      :class="getStatusBadgeClass(detailReservation.status)"
                    >
                      {{ statusLabel(detailReservation.status) }}
                    </span>
                    <span
                      v-if="detailReservation.apiStatutReservation"
                      class="rounded-md bg-white/90 px-2 py-0.5 font-mono text-[11px] text-gray-600 ring-1 ring-gray-200/80 dark:bg-primary-950/80 dark:text-primary-300/90 dark:ring-primary-700/60"
                    >
                      {{ detailReservation.apiStatutReservation }}
                    </span>
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          <footer
            class="shrink-0 border-t border-gray-100 bg-gray-50/95 px-5 py-3.5 dark:border-primary-800/50 dark:bg-primary-900/45"
          >
            <button
              type="button"
              class="w-full rounded-xl bg-primary-600 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-500 dark:hover:bg-primary-500"
              @click="closeDetailModal"
            >
              Fermer
            </button>
          </footer>
        </div>
      </div>
    </Teleport>
  </DefaultLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import DefaultLayout from '@/components/layout/DefaultLayout.vue'
import { notify } from '@/utils/notify'
import { useAdminModuleGreeting } from '@/composables/useAdminModuleGreeting'
import { useTenantSocieteId } from '@/composables/useTenantSocieteId'
import { useAuthStore } from '@/stores/auth'
import { listClientsArray } from '@/services/clientService'
import { listVoyagesArray, ticksToHHmm } from '@/services/voyageService'
import {
  RESERVATION_STATUT_RESERVATION,
  RESERVATION_STATUT_SELECT_OPTIONS,
  listReservationsArray,
  mapReservationFromApi,
  reservationRawToPutBody,
  updateReservation,
  mapUiStatutToApi,
  createReservation,
  buildReservationCreateBody,
} from '@/services/reservationService'

const headerIntro = useAdminModuleGreeting('bienvenue — réservations ci-dessous.')

const authStore = useAuthStore()
const { idSocieteForSave } = useTenantSocieteId()

const showCreateModal = ref(false)
const showDetailModal = ref(false)
const detailReservation = ref(null)
const createRefsLoading = ref(false)
const createSaving = ref(false)
const clientChoices = ref([])
const voyageChoices = ref([])

const clientFilterQuery = ref('')
const clientPickerOpen = ref(false)

/** Franc congolais (CDF) — affichage par défaut sur cette page. */
function formatMoneyFc(value) {
  const n = Number(value) || 0
  return `${n.toLocaleString('fr-CD', { maximumFractionDigits: 0 })} FC`
}

function todayIsoDate() {
  const t = new Date()
  const y = t.getFullYear()
  const mo = String(t.getMonth() + 1).padStart(2, '0')
  const da = String(t.getDate()).padStart(2, '0')
  return `${y}-${mo}-${da}`
}

const createForm = ref({
  idClient: '',
  idVoyage: '',
  nombrePlaces: 1,
  dateReservation: todayIsoDate(),
  statutReservation: RESERVATION_STATUT_RESERVATION.pending,
  statut: true,
})

function clientRowId(c) {
  const n = Number(c?.idClient ?? c?.IdClient)
  return Number.isFinite(n) && n > 0 ? n : 0
}

/** Nom affiché (sans id) — préfère le nom client, sinon l’e-mail. */
function clientDisplayName(c) {
  const nom = String(c?.nomClient ?? c?.NomClient ?? '').trim()
  if (nom) return nom
  const em = String(c?.emailClient ?? c?.EmailClient ?? '').trim()
  return em || '—'
}

function clientSecondaryLine(c) {
  const nom = String(c?.nomClient ?? c?.NomClient ?? '').trim()
  const em = String(c?.emailClient ?? c?.EmailClient ?? '').trim()
  if (nom && em) return em
  return ''
}

const filteredClientChoices = computed(() => {
  const q = clientFilterQuery.value.trim().toLowerCase()
  const list = clientChoices.value
  if (!q) return list
  return list.filter((c) => {
    const blob = [
      clientDisplayName(c),
      String(c?.nomClient ?? c?.NomClient ?? ''),
      String(c?.emailClient ?? c?.EmailClient ?? ''),
    ]
      .join(' ')
      .toLowerCase()
    return blob.includes(q)
  })
})

const selectedClientDisplay = computed(() => {
  const id = Number(String(createForm.value.idClient || '').trim())
  if (!Number.isFinite(id) || id <= 0) return ''
  const c = clientChoices.value.find((x) => clientRowId(x) === id)
  return c ? clientDisplayName(c) : ''
})

function onClientPickerBlur() {
  window.setTimeout(() => {
    clientPickerOpen.value = false
  }, 200)
}

function selectClientForReservation(c) {
  const id = clientRowId(c)
  if (!id) return
  createForm.value.idClient = String(id)
  clientFilterQuery.value = clientDisplayName(c)
  clientPickerOpen.value = false
}

function voyageRowId(v) {
  const n = Number(v?.idVoyage ?? v?.IdVoyage ?? v?.id ?? v?.Id)
  return Number.isFinite(n) && n > 0 ? n : 0
}

/** Libellé voyage sans id (date, heure, prix en FC). */
function voyageOptionLabel(v) {
  const d = String(v.dateDepart ?? v.DateDepart ?? '').slice(0, 10)
  const time = ticksToHHmm(v.heureDepart ?? v.HeureDepart) || '—'
  const p = Number(v.prix ?? v.Prix) || 0
  return `${d} · ${time} — ${formatMoneyFc(p)}`
}

function sortVoyagesForPicker(list) {
  return [...list].sort((a, b) => {
    const da = String(a.dateDepart ?? a.DateDepart ?? '')
    const db = String(b.dateDepart ?? b.DateDepart ?? '')
    if (da !== db) return db.localeCompare(da)
    return voyageRowId(b) - voyageRowId(a)
  })
}

function resetCreateForm() {
  clientFilterQuery.value = ''
  clientPickerOpen.value = false
  createForm.value = {
    idClient: '',
    idVoyage: '',
    nombrePlaces: 1,
    dateReservation: todayIsoDate(),
    statutReservation: RESERVATION_STATUT_RESERVATION.pending,
    statut: true,
  }
}

function closeCreateReservation() {
  if (createSaving.value) return
  showCreateModal.value = false
}

async function openCreateReservation() {
  resetCreateForm()
  showCreateModal.value = true
  createRefsLoading.value = true
  clientChoices.value = []
  voyageChoices.value = []
  try {
    const [clients, voyages] = await Promise.all([listClientsArray(), listVoyagesArray()])
    clientChoices.value = Array.isArray(clients) ? clients.filter((c) => clientRowId(c) > 0) : []
    voyageChoices.value = Array.isArray(voyages) ? sortVoyagesForPicker(voyages.filter((v) => voyageRowId(v) > 0)) : []
  } catch (e) {
    await notify.error('Chargement impossible', e?.message || 'Erreur listes client / voyage.')
    showCreateModal.value = false
  } finally {
    createRefsLoading.value = false
  }
}

async function submitCreateReservation() {
  const idClient = Number(String(createForm.value.idClient || '').trim())
  const idVoyage = Number(String(createForm.value.idVoyage || '').trim())
  if (!idClient || !idVoyage) {
    await notify.warning('Saisie incomplète', 'Choisissez un client et un voyage.')
    return
  }
  const np = Number(createForm.value.nombrePlaces)
  if (!Number.isFinite(np) || np < 1 || np > 100) {
    await notify.warning('Nombre de places', 'Indiquez un nombre entre 1 et 100.')
    return
  }
  if (authStore.role === 'superadmin' && idSocieteForSave.value == null) {
    await notify.warning('Société', 'Sélectionnez une société active (contexte super-admin) pour renseigner idSociete.')
    return
  }
  const body = buildReservationCreateBody({
    idClient,
    idVoyage,
    nombrePlaces: np,
    dateReservation: createForm.value.dateReservation,
    statutReservation: createForm.value.statutReservation,
    statut: createForm.value.statut,
  })
  if (!body.idSociete) {
    await notify.warning('Société', 'idSociete est requis : vérifiez la société de session ou le contexte super-admin.')
    return
  }
  if (import.meta.env.DEV) {
    console.info('[POST /api/Reservation] corps envoyé', body)
  }
  createSaving.value = true
  try {
    await createReservation(body)
    notify.toast.success('Réservation créée')
    showCreateModal.value = false
    await loadReservations()
  } catch (e) {
    if (import.meta.env.DEV && e?.responseBody) {
      console.error('[POST /api/Reservation] corps d’erreur API', e.responseBody)
    }
    const detail = e?.message || 'Erreur API.'
    const hint500 =
      e?.status === 500
        ? ' Erreur côté serveur (500) : en dev, voir la console (corps d’erreur + payload) ; en prod, logs API / onglet Réseau → Réponse.'
        : ''
    await notify.error('Création impossible', `${detail}${hint500}`)
  } finally {
    createSaving.value = false
  }
}

const reservations = ref([])
const loading = ref(false)
const error = ref('')

function clientInitial(name) {
  const s = String(name || '').trim()
  if (!s || s === '—') return '?'
  return s.charAt(0).toUpperCase()
}

async function loadReservations() {
  loading.value = true
  error.value = ''
  try {
    const rows = await listReservationsArray()
    reservations.value = rows.map((r) => mapReservationFromApi(r))
  } catch (e) {
    error.value = e?.message || 'Impossible de charger les réservations.'
    reservations.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadReservations()
})

const searchQuery = ref('')
const statusFilter = ref('')
const dateFilter = ref('')

const stats = computed(() => {
  return {
    total: reservations.value.length,
    confirmed: reservations.value.filter(r => r.status === 'confirmed').length,
    pending: reservations.value.filter(r => r.status === 'pending').length,
    revenue: reservations.value
      .filter(r => r.status === 'completed')
      .reduce((sum, r) => sum + r.totalPrice, 0)
  }
})

const filteredReservations = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  return reservations.value.filter((reservation) => {
    const hay = [
      reservation.clientName,
      reservation.clientEmail,
      reservation.departure,
      reservation.arrival,
      reservation.carrier,
      String(reservation.id),
    ]
      .map((x) => String(x || '').toLowerCase())
      .join(' ')
    const matchesSearch = !q || hay.includes(q)
    const matchesStatus = !statusFilter.value || reservation.status === statusFilter.value
    const matchesDate = !dateFilter.value || reservation.date === dateFilter.value
    return matchesSearch && matchesStatus && matchesDate
  })
})

const getStatusBadgeClass = (status) => {
  const classes = {
    confirmed:
      'bg-emerald-100 text-emerald-900 dark:bg-emerald-950/55 dark:text-emerald-200',
    pending:
      'bg-primary-100 text-primary-900 dark:bg-primary-900/50 dark:text-primary-200',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-200',
    completed:
      'bg-sky-100 text-sky-900 dark:bg-sky-950/50 dark:text-sky-200',
  }
  return (
    classes[status] ||
    'bg-gray-100 text-gray-800 dark:bg-primary-900/40 dark:text-primary-200'
  )
}

const STATUS_LABELS = {
  confirmed: 'Confirmée',
  pending: 'En attente',
  cancelled: 'Annulée',
  completed: 'Terminée',
}

function statusLabel(status) {
  return STATUS_LABELS[status] || status
}

const resetFilters = () => {
  searchQuery.value = ''
  statusFilter.value = ''
  dateFilter.value = ''
}

function viewReservationDetails(reservation) {
  detailReservation.value = reservation
  showDetailModal.value = true
}

function closeDetailModal() {
  showDetailModal.value = false
  detailReservation.value = null
}

const confirmReservation = async (reservation) => {
  try {
    const body = reservationRawToPutBody(reservation.raw, {
      statutReservation: mapUiStatutToApi('confirmed'),
    })
    await updateReservation(reservation.id, body)
    notify.toast.success('Réservation confirmée')
    await loadReservations()
  } catch (e) {
    await notify.error('Confirmation impossible', e?.message || 'Erreur inconnue')
  }
}

const cancelReservation = async (reservation) => {
  const ok = await notify.confirm(
    `Êtes-vous sûr de vouloir annuler la réservation #${reservation.id} ?`,
    'Annuler la réservation'
  )
  if (!ok) return
  try {
    const body = reservationRawToPutBody(reservation.raw, {
      statutReservation: mapUiStatutToApi('cancelled'),
    })
    await updateReservation(reservation.id, body)
    notify.toast.success('Réservation annulée')
    await loadReservations()
  } catch (e) {
    await notify.error('Annulation impossible', e?.message || 'Erreur inconnue')
  }
}
</script>

