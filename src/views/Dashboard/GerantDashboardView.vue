<template>
  <div class="gerant-dashboard min-w-0 w-full space-y-5 sm:space-y-6">
    <header
      class="rusa-gradient-header relative overflow-hidden rounded-2xl p-4 shadow-lg sm:p-6"
    >
      <div class="relative min-w-0">
        <p class="text-[10px] font-semibold uppercase tracking-widest text-primary-200/90 sm:text-xs">
          Manager général
        </p>
        <h1 class="mt-1 text-xl font-bold leading-tight text-white sm:text-2xl">{{ gerantPageTitle }}</h1>
        <p class="mt-2 max-w-2xl text-sm leading-relaxed text-primary-100/95">
          {{ dashboardIntro }}
        </p>
        <p v-if="subtitleLine" class="mt-2 text-xs font-medium text-primary-200/90">{{ subtitleLine }}</p>
        <p
          v-if="dataSourceBadge"
          class="mt-2 inline-flex rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white/95"
        >
          {{ dataSourceBadge }}
        </p>
      </div>
    </header>

    <p
      v-if="error"
      class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200"
    >
      {{ error }}
    </p>

    <p
      v-if="!loading && !error && noPermissionForDashboard"
      class="rounded-xl border border-amber-200/80 bg-amber-50/90 px-4 py-3 text-sm text-amber-950 dark:border-amber-900/40 dark:bg-amber-950/35 dark:text-amber-100"
    >
      Aucune section du tableau de bord n’est liée à vos permissions actuelles (lecture Société, Facture, Client,
      Catégorie client, Paiement ou Agent).
    </p>

    <p
      v-else-if="!loading && !error && shouldFetchDashboard && showAllSections && !hasAnyDashboardSection"
      class="rounded-xl border border-amber-200/80 bg-amber-50/90 px-4 py-3 text-sm text-amber-950 dark:border-amber-900/40 dark:bg-amber-950/35 dark:text-amber-100"
    >
      {{ emptyDashboardMessage }}
    </p>

    <p
      v-else-if="!loading && !error && shouldFetchDashboard && isGerantDetailRoute && !showGerantUnifiedBlocks"
      class="rounded-xl border border-amber-200/80 bg-amber-50/90 px-4 py-3 text-sm text-amber-950 dark:border-amber-900/40 dark:bg-amber-950/35 dark:text-amber-100"
    >
      Cet indicateur n’est pas disponible avec vos permissions actuelles ou les données sont vides.
    </p>

    <div v-if="loading" class="rusa-card p-8 text-center text-sm text-gray-500 dark:text-primary-400/80">
      Chargement du tableau de bord…
    </div>

    <section
      v-if="!loading && !error && shouldFetchDashboard && dashboardVisualCards.length"
      class="space-y-4"
      aria-labelledby="gerant-dash-modern-title"
    >
      <h2 id="gerant-dash-modern-title" class="sr-only">Vue synthétique moderne</h2>

      <div class="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <article
          v-for="card in dashboardVisualCards"
          :key="card.key"
          class="modern-kpi-card lg:col-span-3"
          :class="card.tone"
        >
          <p class="modern-kpi-label">{{ card.label }}</p>
          <p class="modern-kpi-value">{{ card.display }}</p>
        </article>
      </div>

      <div v-if="modernMiniCards.length" class="grid grid-cols-2 gap-3 lg:grid-cols-6">
        <article
          v-for="card in modernMiniCards"
          :key="`mini-${card.key}`"
          class="modern-mini-card"
        >
          <p class="modern-mini-label">{{ card.label }}</p>
          <p class="modern-mini-value">{{ card.display }}</p>
        </article>
      </div>
      <p v-else class="rusa-card p-3 text-xs text-gray-600 dark:text-primary-300/90">
        Donnees mini-KPI non fournies par l'API.
      </p>

      <div class="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <article class="modern-panel p-4 lg:col-span-9">
          <div class="mb-3 flex items-center justify-between gap-3">
            <h3 class="text-sm font-semibold text-gray-900 dark:text-white">{{ trendPanelTitle }}</h3>
            <span class="text-xs text-gray-500 dark:text-primary-300/80">{{ trendPanelCaption }}</span>
          </div>
          <div class="modern-bars">
            <div v-for="(row, idx) in dashboardTrendBars" :key="`${row.label}-${idx}`" class="modern-bars-item">
              <div
                class="modern-bars-col"
                :style="{ height: `${row.height}%` }"
                :title="`${row.label} — ${row.display}`"
              />
              <span class="modern-bars-label">{{ row.label }}</span>
            </div>
          </div>
        </article>

        <article class="modern-panel p-4 lg:col-span-3">
          <h3 class="mb-3 text-sm font-semibold text-gray-900 dark:text-white">Taux de recouvrement</h3>
          <div class="modern-donut-wrap">
            <div class="modern-donut" :style="donutStyle">
              <span class="modern-donut-value">{{ formatPercent(dashboardDonutPercent) }}</span>
            </div>
          </div>
          <ul v-if="rightPanelItems.length" class="modern-side-list">
            <li v-for="item in rightPanelItems" :key="item.key">{{ item.label }}: {{ item.value }}</li>
          </ul>
          <p v-else class="mt-2 text-xs text-gray-500 dark:text-primary-300/85">
            Resume lateral non fourni par l'API.
          </p>
          <button type="button" class="modern-cta-btn mt-3 w-full">Mis a jour: {{ dashboardGeneratedAtLabel }}</button>
        </article>
      </div>

      <div class="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <article class="modern-panel p-4 lg:col-span-9">
          <div class="grid grid-cols-1 gap-4 lg:grid-cols-12">
            <div class="lg:col-span-8">
              <div v-if="hasWaveData" class="modern-wave">
                <svg viewBox="0 0 600 120" preserveAspectRatio="none" class="modern-wave-svg">
                  <path
                    :d="wavePathPrimary"
                    class="modern-wave-primary"
                  />
                  <path
                    :d="wavePathSecondary"
                    class="modern-wave-secondary"
                  />
                </svg>
              </div>
              <div v-else class="rusa-card p-3 text-xs text-gray-600 dark:text-primary-300/90">
                Serie visuelle non fournie par l'API.
              </div>
            </div>
            <div class="lg:col-span-4">
              <div class="rusa-card p-3 text-xs text-gray-600 dark:text-primary-300/90">
                Calendrier detaille non fourni par l'API.
              </div>
            </div>
          </div>
        </article>
        <div class="lg:col-span-3"></div>
      </div>
    </section>

    <!-- GET /Dashboard/{idSociete} — repli après échec / contrat GET /GerantDashboard -->
    <template
      v-else-if="
        !error &&
        shouldFetchDashboard &&
        showAllSections &&
        isSocieteDashboard &&
        socDashHasAnySection &&
        !hasGerantUnifiedContract
      "
    >
      <section v-if="socDashOverviewCards.length" aria-labelledby="gerant-dash-socdash-title">
        <h2 id="gerant-dash-socdash-title" class="mb-3 text-sm font-semibold text-gray-900 dark:text-white">
          Vue d’ensemble
        </h2>
        <div class="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <div v-for="card in socDashOverviewCards" :key="card.key" class="rusa-card p-4">
            <p class="text-xs font-medium text-gray-500 dark:text-primary-400/85">{{ card.label }}</p>
            <p class="mt-1 text-lg font-bold tabular-nums text-gray-900 dark:text-white">{{ card.display }}</p>
          </div>
        </div>
      </section>

      <div
        v-if="socDashCollecteVisible || socDashFactureVisible"
        class="grid grid-cols-1 gap-5 lg:grid-cols-2"
      >
        <section v-if="socDashCollecteVisible" class="rusa-panel overflow-hidden" aria-labelledby="gerant-collecte-title">
          <div class="border-b border-gray-200 bg-gray-50 px-4 py-3 dark:border-primary-800/50 dark:bg-primary-900/40">
            <h2 id="gerant-collecte-title" class="text-sm font-semibold text-gray-900 dark:text-white">
              Collecte du mois
            </h2>
            <p v-if="collecteMoisLabel" class="mt-0.5 text-xs text-gray-600 dark:text-primary-300/90">
              {{ collecteMoisLabel }}
            </p>
          </div>
          <dl class="divide-y divide-gray-200 px-4 py-2 text-sm dark:divide-primary-800/40">
            <div
              v-for="row in collecteMoisRows"
              :key="row.key"
              class="flex flex-wrap items-baseline justify-between gap-2 py-2"
            >
              <dt class="text-gray-600 dark:text-primary-300/90">{{ row.label }}</dt>
              <dd class="font-medium tabular-nums text-gray-900 dark:text-white">{{ row.display }}</dd>
            </div>
          </dl>
        </section>

        <section v-if="socDashFactureVisible" class="rusa-panel overflow-hidden" aria-labelledby="gerant-facture-title">
          <div class="border-b border-gray-200 bg-gray-50 px-4 py-3 dark:border-primary-800/50 dark:bg-primary-900/40">
            <h2 id="gerant-facture-title" class="text-sm font-semibold text-gray-900 dark:text-white">
              Facturation du mois
            </h2>
            <p v-if="factureMoisLabel" class="mt-0.5 text-xs text-gray-600 dark:text-primary-300/90">
              {{ factureMoisLabel }}
            </p>
          </div>
          <dl class="divide-y divide-gray-200 px-4 py-2 text-sm dark:divide-primary-800/40">
            <div
              v-for="row in factureMoisRows"
              :key="row.key"
              class="flex flex-wrap items-baseline justify-between gap-2 py-2"
            >
              <dt class="text-gray-600 dark:text-primary-300/90">{{ row.label }}</dt>
              <dd class="font-medium tabular-nums text-gray-900 dark:text-white">{{ row.display }}</dd>
            </div>
          </dl>
        </section>
      </div>

      <section
        v-if="socDashRepartitionVisible && repartitionSocDashRows.length"
        class="rusa-panel overflow-hidden"
        aria-labelledby="gerant-repart-soc-title"
      >
        <div class="border-b border-gray-200 bg-gray-50 px-4 py-3 dark:border-primary-800/50 dark:bg-primary-900/40">
          <h2 id="gerant-repart-soc-title" class="text-sm font-semibold text-gray-900 dark:text-white">
            Répartition clients par catégorie
          </h2>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 text-sm dark:divide-primary-800/50">
            <thead class="bg-gray-50 dark:bg-primary-900/30">
              <tr>
                <th class="px-4 py-2 text-left font-medium text-gray-700 dark:text-primary-200">Catégorie</th>
                <th class="px-4 py-2 text-right font-medium text-gray-700 dark:text-primary-200">Clients</th>
                <th class="px-4 py-2 text-right font-medium text-gray-700 dark:text-primary-200">%</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-primary-800/40">
              <tr v-for="(row, idx) in repartitionSocDashRows" :key="row.idCategorie ?? idx">
                <td class="px-4 py-2 text-gray-900 dark:text-white">{{ row.nomCategorie }}</td>
                <td class="px-4 py-2 text-right tabular-nums text-gray-800 dark:text-primary-100">
                  {{ row.nombreClients }}
                </td>
                <td class="px-4 py-2 text-right tabular-nums text-gray-800 dark:text-primary-100">
                  {{ formatPercent(row.pourcentage) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section
        v-if="socDashTopAgentsVisible && topAgentsSocDash.length"
        class="rusa-panel overflow-hidden"
        aria-labelledby="gerant-top-agents-title"
      >
        <div class="border-b border-gray-200 bg-gray-50 px-4 py-3 dark:border-primary-800/50 dark:bg-primary-900/40">
          <h2 id="gerant-top-agents-title" class="text-sm font-semibold text-gray-900 dark:text-white">
            Top 5 — agents collecteurs
          </h2>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 text-sm dark:divide-primary-800/50">
            <thead class="bg-gray-50 dark:bg-primary-900/30">
              <tr>
                <th class="px-4 py-2 text-left">Matricule</th>
                <th class="px-4 py-2 text-left">Agent</th>
                <th class="px-4 py-2 text-right">Collecte</th>
                <th class="px-4 py-2 text-right">Paiements</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-primary-800/40">
              <tr v-for="r in topAgentsSocDash" :key="r.idAgent">
                <td class="px-4 py-2 tabular-nums text-gray-800 dark:text-primary-100">{{ r.matricule }}</td>
                <td class="px-4 py-2 font-medium text-gray-900 dark:text-white">{{ r.nomComplet }}</td>
                <td class="px-4 py-2 text-right tabular-nums">{{ formatMoney(r.montantCollecte) }}</td>
                <td class="px-4 py-2 text-right tabular-nums">{{ r.nombrePaiements }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <p
        v-if="dateGeneration"
        class="text-center text-[10px] text-gray-400 dark:text-primary-500/80"
      >
        Données actualisées : {{ formatDateTime(dateGeneration) }}
      </p>
    </template>

    <template v-if="!error && shouldFetchDashboard && showGerantUnifiedBlocks">
      <!-- KPI société (cartes filtrées par permission) -->
      <section
        v-if="showBlock('societe-finances') && (societeSectionVisible || isSocieteFinancesDetail)"
        class="gerant-stat-section"
        aria-labelledby="gerant-dash-soc-title"
      >
        <h2 id="gerant-dash-soc-title" class="mb-3 text-sm font-semibold text-gray-900 dark:text-white">
          Société & finances
        </h2>
        <div v-if="societeSectionVisible" class="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div v-for="card in filteredSocieteCards" :key="card.key" class="gerant-stat-card">
            <p class="text-xs font-medium text-gray-500 dark:text-primary-400/85">{{ card.label }}</p>
            <p class="mt-1 text-lg font-bold tabular-nums text-gray-900 dark:text-white">{{ card.display }}</p>
          </div>
        </div>
        <p
          v-else
          class="rusa-card p-4 text-sm text-gray-600 dark:text-primary-300/90"
        >
          Aucun indicateur société / finances à afficher (permissions ou données).
        </p>
      </section>

      <!-- Clients (stats : lecture Client ; répartition : Catégorie client) -->
      <section
        v-if="showBlock('clients') && (clientSectionVisible || isClientsDetail)"
        class="gerant-stat-section"
        aria-labelledby="gerant-dash-cli-title"
      >
        <h2 id="gerant-dash-cli-title" class="mb-3 text-sm font-semibold text-gray-900 dark:text-white">
          Clients
        </h2>
        <p
          v-if="isClientsDetail && !clientSectionVisible"
          class="rusa-card p-4 text-sm text-gray-600 dark:text-primary-300/90"
        >
          Aucune statistique client à afficher (permissions ou données).
        </p>
        <div
          v-else-if="permCli && hasClientsStatKeys && filteredClientStatCards.length"
          class="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4"
        >
          <div v-for="card in filteredClientStatCards" :key="card.key" class="gerant-stat-card">
            <p class="text-xs font-medium text-gray-500 dark:text-primary-400/85">{{ card.label }}</p>
            <p class="mt-1 text-lg font-bold tabular-nums text-gray-900 dark:text-white">{{ card.display }}</p>
          </div>
        </div>
        <div
          v-if="canRepartitionBlock"
          class="modern-panel mt-4 overflow-hidden"
          aria-labelledby="gerant-dash-repart-title"
        >
          <div class="modern-block-head px-4 py-3">
            <h3 id="gerant-dash-repart-title" class="text-sm font-semibold text-gray-900 dark:text-white">
              Répartition par catégorie
            </h3>
          </div>
          <div v-if="repartitionRows.length" class="overflow-x-auto">
            <table class="modern-table min-w-full text-sm">
              <thead>
                <tr>
                  <th class="px-4 py-2 text-left font-medium text-gray-700 dark:text-primary-200">Catégorie</th>
                  <th class="px-4 py-2 text-right font-medium text-gray-700 dark:text-primary-200">Nombre</th>
                  <th class="px-4 py-2 text-right font-medium text-gray-700 dark:text-primary-200">%</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, idx) in repartitionRows" :key="idx">
                  <td class="px-4 py-2 text-gray-900 dark:text-white">{{ row.categorie }}</td>
                  <td class="px-4 py-2 text-right tabular-nums text-gray-800 dark:text-primary-100">
                    {{ row.nombreClients }}
                  </td>
                  <td class="px-4 py-2 text-right tabular-nums text-gray-800 dark:text-primary-100">
                    {{ formatPercent(row.pourcentage) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p v-else class="px-4 py-6 text-center text-xs text-gray-500 dark:text-primary-400/80">
            Aucune répartition par catégorie.
          </p>
        </div>
      </section>

      <div
        v-if="showBlock('top-ca') || showBlock('top-arrieres')"
        class="grid grid-cols-1 gap-5 lg:grid-cols-2"
      >
        <section
          v-if="showBlock('top-ca') && permCli && permFac"
          class="modern-panel overflow-hidden"
          aria-labelledby="gerant-top-ca"
        >
          <div class="modern-block-head px-4 py-3">
            <h2 id="gerant-top-ca" class="text-sm font-semibold text-gray-900 dark:text-white">Top 5 — CA</h2>
          </div>
          <div v-if="topCa.length" class="overflow-x-auto">
            <table class="modern-table min-w-full text-sm">
              <thead>
                <tr>
                  <th class="px-4 py-2 text-left">#</th>
                  <th class="px-4 py-2 text-left">Client</th>
                  <th class="px-4 py-2 text-right">CA</th>
                  <th class="px-4 py-2 text-right">Δ mois</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="r in topCa" :key="`ca-${r.rang}-${r.idClient}`">
                  <td class="px-4 py-2 tabular-nums">{{ r.rang }}</td>
                  <td class="px-4 py-2 font-medium text-gray-900 dark:text-white">{{ r.nomClient }}</td>
                  <td class="px-4 py-2 text-right tabular-nums">{{ formatMoney(r.valeur) }}</td>
                  <td class="px-4 py-2 text-right tabular-nums">{{ formatVariation(r.variationMoisPrecedent) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p v-else class="px-4 py-6 text-center text-xs text-gray-500 dark:text-primary-400/80">
            Aucun client dans le top CA pour cette période.
          </p>
        </section>
        <section
          v-if="showBlock('top-arrieres') && permCli && permFac"
          class="modern-panel overflow-hidden"
          aria-labelledby="gerant-top-arr"
        >
          <div class="modern-block-head px-4 py-3">
            <h2 id="gerant-top-arr" class="text-sm font-semibold text-gray-900 dark:text-white">Top 5 — Arriérés</h2>
          </div>
          <div v-if="topArr.length" class="overflow-x-auto">
            <table class="modern-table min-w-full text-sm">
              <thead>
                <tr>
                  <th class="px-4 py-2 text-left">#</th>
                  <th class="px-4 py-2 text-left">Client</th>
                  <th class="px-4 py-2 text-right">Montant</th>
                  <th class="px-4 py-2 text-right">Δ mois</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="r in topArr" :key="`arr-${r.rang}-${r.idClient}`">
                  <td class="px-4 py-2 tabular-nums">{{ r.rang }}</td>
                  <td class="px-4 py-2 font-medium text-gray-900 dark:text-white">{{ r.nomClient }}</td>
                  <td class="px-4 py-2 text-right tabular-nums">{{ formatMoney(r.valeur) }}</td>
                  <td class="px-4 py-2 text-right tabular-nums">{{ formatVariation(r.variationMoisPrecedent) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p v-else class="px-4 py-6 text-center text-xs text-gray-500 dark:text-primary-400/80">
            Aucun client dans le top arriérés pour cette période.
          </p>
        </section>
      </div>

      <!-- Alertes -->
      <section
        v-if="showBlock('alertes') && canAlertesBlock && (hasAlertesPayload || isAlertesDetail)"
        class="gerant-stat-section"
        aria-labelledby="gerant-dash-alerts-title"
      >
        <h2 id="gerant-dash-alerts-title" class="mb-3 text-sm font-semibold text-gray-900 dark:text-white">
          Alertes société
        </h2>
        <p
          v-if="!alertes.length"
          class="rusa-card p-4 text-sm text-gray-600 dark:text-primary-300/90"
        >
          Aucune alerte pour le moment.
        </p>
        <ul v-else class="space-y-2">
          <li
            v-for="(a, idx) in alertes"
            :key="a.idAlerte ?? idx"
            class="modern-alert-item px-4 py-3 text-sm"
          >
            <div class="flex flex-wrap items-baseline justify-between gap-2">
              <p class="font-semibold text-amber-900 dark:text-amber-200">{{ a.typeAlerte ?? 'Alerte' }}</p>
              <span
                v-if="a.niveauCriticite"
                class="rounded-full bg-amber-200/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-950 dark:bg-amber-900/50 dark:text-amber-100"
              >
                {{ a.niveauCriticite }}
              </span>
            </div>
            <p class="mt-1 text-gray-700 dark:text-primary-200/90">{{ a.description ?? '—' }}</p>
            <p class="mt-1 text-xs text-gray-600 dark:text-primary-300/85">
              <span v-if="a.dateAlerte">{{ formatDateTime(a.dateAlerte) }}</span>
              <span v-if="a.statut"> · {{ a.statut }}</span>
              <span v-if="a.nomClient"> · {{ a.nomClient }}</span>
            </p>
          </li>
        </ul>
      </section>

      <!-- Tendances (séries filtrées par permission) -->
      <section
        v-if="showBlock('tendances') && tendancesSectionVisible"
        class="gerant-stat-section"
        aria-labelledby="gerant-dash-tend-title"
      >
        <h2 id="gerant-dash-tend-title" class="mb-3 text-sm font-semibold text-gray-900 dark:text-white">
          Tendances
        </h2>
        <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div v-for="block in tendanceBlocksFiltered" :key="block.key" class="modern-panel overflow-hidden">
            <div class="modern-block-head px-4 py-2">
              <h3 class="text-xs font-semibold text-gray-900 dark:text-white">{{ block.title }}</h3>
            </div>
            <div v-if="block.rows.length" class="max-h-56 overflow-y-auto">
              <table class="modern-table min-w-full text-xs">
                <thead class="sticky top-0">
                  <tr>
                    <th class="px-3 py-1.5 text-left">Période</th>
                    <th class="px-3 py-1.5 text-right">Valeur</th>
                    <th class="px-3 py-1.5 text-right">Var.</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, i) in block.rows" :key="i">
                    <td class="px-3 py-1.5">{{ row.moisLabel }}</td>
                    <td class="px-3 py-1.5 text-right tabular-nums">{{ block.formatVal(row.valeur) }}</td>
                    <td class="px-3 py-1.5 text-right tabular-nums">{{ formatVariation(row.variation) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p v-else class="px-4 py-6 text-center text-xs text-gray-500 dark:text-primary-400/80">Aucune série.</p>
          </div>
        </div>
      </section>

      <!-- Paiements agrégés -->
      <section
        v-if="showBlock('paiements-stats') && canPaiementsBlock && (hasPaiementKeys || hasPaiementsPayload || isPaiementsStatsDetail)"
        class="gerant-stat-section"
        aria-labelledby="gerant-dash-pay-title"
      >
        <h2 id="gerant-dash-pay-title" class="mb-3 text-sm font-semibold text-gray-900 dark:text-white">
          Paiements
        </h2>
        <p
          v-if="!paiementCards.length"
          class="rusa-card p-4 text-sm text-gray-600 dark:text-primary-300/90"
        >
          Aucune statistique de paiement à afficher (permissions ou données).
        </p>
        <div v-else class="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <div v-for="card in paiementCards" :key="card.key" class="gerant-stat-card">
            <p class="text-xs font-medium text-gray-500 dark:text-primary-400/85">{{ card.label }}</p>
            <p class="mt-1 text-lg font-bold tabular-nums text-gray-900 dark:text-white">{{ card.display }}</p>
          </div>
        </div>
      </section>

      <p
        v-if="partialNoticeVisible"
        class="rounded-xl border border-amber-200/70 bg-amber-50/80 px-4 py-2 text-xs text-amber-950 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-100"
      >
        {{ partialNotice }}
      </p>

      <p
        v-if="dateGeneration"
        class="text-center text-[10px] text-gray-400 dark:text-primary-500/80"
      >
        Données actualisées : {{ formatDateTime(dateGeneration) }}
      </p>
    </template>
  </div>
</template>

<script setup>
import { computed, inject, ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { PERM } from '@/config/adminModulePermissions'
import { fetchGerantDashboard, unwrapList } from '@/services/gerantDashboardService'
import { GERANT_DASHBOARD_INJECT_KEY } from '@/constants/injectionKeys'

/** Absent ou `0` = appels API activés ; `1` = désactive le chargement (ex. API dashboard indisponible). */
const DASHBOARD_API_DISABLED =
  String(import.meta.env.VITE_DISABLE_DASHBOARD_API ?? '0').trim() === '1'

const route = useRoute()
const authStore = useAuthStore()
const injected = inject(GERANT_DASHBOARD_INJECT_KEY, null)

const localPayload = ref(/** @type {Record<string, unknown> | null} */ (null))
const localLoading = ref(true)
const localError = ref('')

const payload = injected?.payload ?? localPayload
const loading = injected?.loading ?? localLoading
const error = injected?.error ?? localError

const gerantSectionKey = computed(() => /** @type {string | null} */ (route.meta?.gerantSection ?? null))
const showAllSections = computed(() => !gerantSectionKey.value)
const isGerantDetailRoute = computed(() => Boolean(gerantSectionKey.value))

const gerantPageTitle = computed(() => {
  /** @type {Record<string, string>} */
  const titles = {
    'societe-finances': 'Société & finances',
    clients: 'Clients',
    'top-ca': 'Top 5 — chiffre d’affaires',
    'top-arrieres': 'Top 5 — arriérés',
    alertes: 'Alertes société',
    tendances: 'Tendances',
    'paiements-stats': 'Statistiques paiements',
  }
  const k = gerantSectionKey.value || ''
  return titles[k] || 'Tableau de bord'
})

function showBlock(sectionKey) {
  if (showAllSections.value) return true
  return gerantSectionKey.value === sectionKey
}

const isSocieteFinancesDetail = computed(() => gerantSectionKey.value === 'societe-finances')
const isClientsDetail = computed(() => gerantSectionKey.value === 'clients')
const isTopCaDetail = computed(() => gerantSectionKey.value === 'top-ca')
const isTopArrieresDetail = computed(() => gerantSectionKey.value === 'top-arrieres')
const isAlertesDetail = computed(() => gerantSectionKey.value === 'alertes')
const isTendancesDetail = computed(() => gerantSectionKey.value === 'tendances')
const isPaiementsStatsDetail = computed(() => gerantSectionKey.value === 'paiements-stats')

function pick(obj, camel, pascal) {
  return obj?.[camel] ?? obj?.[pascal]
}

function num(v) {
  if (v == null || v === '') return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

function readValue(obj, keys) {
  for (const key of keys) {
    if (obj?.[key] !== undefined && obj?.[key] !== null) return obj[key]
  }
  return undefined
}

const subtitleLine = computed(() => {
  const u = authStore.user
  if (typeof u?.societe === 'string' && u.societe.trim()) return u.societe.trim()
  if (u?.societe?.nom) return String(u.societe.nom).trim()
  return ''
})

const isGerantRole = computed(() => String(authStore.role || '').toLowerCase() === 'gerant')

/**
 * Mode affichage complet dashboard gérant :
 * ne masquer aucun bloc du payload API (même valeurs 0 / listes vides).
 */
const permSoc = computed(() => true)
const permFac = computed(() => true)
const permCli = computed(() => true)
const permCat = computed(() => true)
const permPay = computed(() => true)
const permRes = computed(() => true)
const permAgent = computed(() => true)

const shouldFetchDashboard = computed(
  () =>
    permSoc.value ||
    permFac.value ||
    permCli.value ||
    permCat.value ||
    permPay.value ||
    permRes.value ||
    permAgent.value,
)

const noPermissionForDashboard = computed(
  () => !loading.value && !error.value && !DASHBOARD_API_DISABLED && !shouldFetchDashboard.value,
)

const dashboardIntro = computed(() => {
  return 'Affichage complet du payload GerantDashboard (aucun bloc masqué).'
})

const canAlertesBlock = computed(() => permSoc.value || permCli.value)
const canPaiementsBlock = computed(() => permPay.value)
const canRepartitionBlock = computed(() => permCat.value)

const p = computed(() => payload.value || {})
const hasGerantUnifiedContract = computed(() => {
  const x = p.value || {}
  return (
    x.societeStatistiques !== undefined ||
    x.SocieteStatistiques !== undefined ||
    x.clientsStatistiques !== undefined ||
    x.ClientsStatistiques !== undefined ||
    x.tendances !== undefined ||
    x.Tendances !== undefined ||
    x.paiementsStatistiques !== undefined ||
    x.PaiementsStatistiques !== undefined
  )
})

function pickBlock(obj, camel, pascal) {
  const b = obj?.[camel] ?? obj?.[pascal]
  return b != null && typeof b === 'object' && !Array.isArray(b) ? b : {}
}

/** Réponse GET /Dashboard/{idSociete} (contrat principal). */
const isSocieteDashboard = computed(() => {
  const x = p.value
  if (!x || typeof x !== 'object') return false
  if (x._source === 'societe-dashboard') return true
  const c = x.collecteMois ?? x.CollecteMois
  return typeof c === 'object' && c != null && !Array.isArray(c)
})

const collecteMoisBlock = computed(() => pickBlock(p.value, 'collecteMois', 'CollecteMois'))
const factureMoisBlock = computed(() => pickBlock(p.value, 'factureMois', 'FactureMois'))

const collecteMoisLabel = computed(() => {
  const c = collecteMoisBlock.value
  return String(c.moisLabel ?? c.MoisLabel ?? '').trim()
})

const factureMoisLabel = computed(() => {
  const c = factureMoisBlock.value
  return String(c.moisLabel ?? c.MoisLabel ?? '').trim()
})

const collecteMoisRows = computed(() => {
  if (!permPay.value) return []
  const c = collecteMoisBlock.value
  const rows = []
  const push = (key, label, display) => rows.push({ key, label, display })
  const m = num(c.montant ?? c.Montant)
  const mp = num(c.montantMoisPrecedent ?? c.MontantMoisPrecedent)
  const vp = num(c.variationPourcentage ?? c.VariationPourcentage)
  const np = num(c.nombrePaiements ?? c.NombrePaiements)
  const tm = num(c.ticketMoyen ?? c.TicketMoyen)
  const vtm = num(c.variationTicketMoyen ?? c.VariationTicketMoyen)
  push('mo', 'Montant du mois', m != null ? formatMoney(m) : '—')
  push('mp', 'Montant mois précédent', mp != null ? formatMoney(mp) : '—')
  push('vp', 'Variation (%)', formatVariation(vp))
  push('np', 'Nombre de paiements', np != null ? String(Math.round(np)) : '—')
  push('tm', 'Ticket moyen', tm != null ? formatMoney(tm) : '—')
  push('vtm', 'Variation ticket moyen (%)', formatVariation(vtm))
  return rows
})

const factureMoisRows = computed(() => {
  if (!permFac.value) return []
  const f = factureMoisBlock.value
  const rows = []
  const push = (key, label, display) => rows.push({ key, label, display })
  const mtf = num(f.montantTotalFactures ?? f.MontantTotalFactures)
  const mtfp = num(f.montantTotalFacturesMoisPrecedent ?? f.MontantTotalFacturesMoisPrecedent)
  const vp = num(f.variationPourcentage ?? f.VariationPourcentage)
  const nf = num(f.nombreFactures ?? f.NombreFactures)
  const nfp = num(f.nombreFacturesMoisPrecedent ?? f.NombreFacturesMoisPrecedent)
  const fa = num(f.factureMoyenne ?? f.FactureMoyenne)
  const fap = num(f.factureMoyenneMoisPrecedent ?? f.FactureMoyenneMoisPrecedent)
  const vfa = num(f.variationFactureMoyenne ?? f.VariationFactureMoyenne)
  const tr = num(f.tauxRecouvrementEstime ?? f.TauxRecouvrementEstime)
  push('mtf', 'Montant total factures', mtf != null ? formatMoney(mtf) : '—')
  push('mtfp', 'Montant total mois précédent', mtfp != null ? formatMoney(mtfp) : '—')
  push('vp', 'Variation montant (%)', formatVariation(vp))
  push('nf', 'Nombre de factures', nf != null ? String(Math.round(nf)) : '—')
  push('nfp', 'Nombre factures mois précédent', nfp != null ? String(Math.round(nfp)) : '—')
  push('fa', 'Facture moyenne', fa != null ? formatMoney(fa) : '—')
  push('fap', 'Facture moyenne mois préc.', fap != null ? formatMoney(fap) : '—')
  push('vfa', 'Variation facture moyenne (%)', formatVariation(vfa))
  push('tr', 'Taux recouvrement estimé', tr != null ? formatPercent(tr) : '—')
  return rows
})

const repartitionSocDashRows = computed(() => {
  const raw = p.value?.repartitionClientsParCategorie ?? p.value?.RepartitionClientsParCategorie
  return unwrapList(raw).map((row) => ({
    idCategorie: num(row.idCategorie ?? row.IdCategorie) ?? 0,
    nomCategorie: String(row.nomCategorie ?? row.NomCategorie ?? '—'),
    nombreClients: num(row.nombreClients ?? row.NombreClients) ?? 0,
    pourcentage: num(row.pourcentage ?? row.Pourcentage) ?? 0,
  }))
})

const topAgentsSocDash = computed(() => {
  const raw = p.value?.top5AgentsCollecteurs ?? p.value?.Top5AgentsCollecteurs
  return unwrapList(raw).map((row) => ({
    idAgent: num(row.idAgent ?? row.IdAgent) ?? 0,
    matricule: String(row.matricule ?? row.Matricule ?? '—'),
    nomComplet: String(row.nomComplet ?? row.NomComplet ?? '—'),
    montantCollecte: num(row.montantCollecte ?? row.MontantCollecte) ?? 0,
    nombrePaiements: num(row.nombrePaiements ?? row.NombrePaiements) ?? 0,
  }))
})

const socDashOverviewCards = computed(() => {
  const d = p.value
  const cards = []
  if (permAgent.value) {
    const n = num(d.totalAgents ?? d.TotalAgents)
    if (n != null) {
      cards.push({
        key: 'ta',
        label: 'Agents',
        display: n.toLocaleString('fr-CD', { maximumFractionDigits: 0 }),
      })
    }
  }
  if (permCli.value) {
    const n = num(d.totalClientsActifs ?? d.TotalClientsActifs)
    if (n != null) {
      cards.push({
        key: 'tca',
        label: 'Clients actifs',
        display: n.toLocaleString('fr-CD', { maximumFractionDigits: 0 }),
      })
    }
  }
  if (permPay.value) {
    const n = num(d.paiementsDuMois ?? d.PaiementsDuMois)
    if (n != null) {
      cards.push({
        key: 'pdm',
        label: 'Paiements du mois',
        display: n.toLocaleString('fr-CD', { maximumFractionDigits: 0 }),
      })
    }
  }
  if (permFac.value) {
    const n = num(d.totalGeneralArriere ?? d.TotalGeneralArriere)
    if (n != null) {
      cards.push({
        key: 'tga',
        label: 'Arriérés généraux',
        display: formatMoney(n),
      })
    }
  }
  return cards
})

const socDashCollecteVisible = computed(() => permPay.value && isSocieteDashboard.value)
const socDashFactureVisible = computed(() => permFac.value && isSocieteDashboard.value)
const socDashRepartitionVisible = computed(() => permCat.value && isSocieteDashboard.value)
const socDashTopAgentsVisible = computed(
  () => (permPay.value || permAgent.value) && isSocieteDashboard.value,
)

const socDashHasAnySection = computed(() => {
  if (!isSocieteDashboard.value) return false
  if (socDashOverviewCards.value.length > 0) return true
  if (socDashCollecteVisible.value && collecteMoisRows.value.length > 0) return true
  if (socDashFactureVisible.value && factureMoisRows.value.length > 0) return true
  if (socDashRepartitionVisible.value && repartitionSocDashRows.value.length > 0) return true
  if (socDashTopAgentsVisible.value && topAgentsSocDash.value.length > 0) return true
  return false
})

const emptyDashboardMessage = computed(() => {
  if (isSocieteDashboard.value) {
    return 'Aucun bloc du tableau GET /Dashboard/{société} ne correspond à vos permissions (Agents, Clients, Paiements, Factures, Catégories client).'
  }
  return 'Aucune donnée à afficher pour les modules autorisés (réponse API vide ou indicateurs à zéro).'
})

const societeStatistiques = computed(() => pick(p.value, 'societeStatistiques', 'SocieteStatistiques') || {})
const clientsStatistiques = computed(() => pick(p.value, 'clientsStatistiques', 'ClientsStatistiques') || {})
const tendances = computed(() => pick(p.value, 'tendances', 'Tendances') || {})
const paiementsStatistiques = computed(() => pick(p.value, 'paiementsStatistiques', 'PaiementsStatistiques') || {})

const hasClientsStatKeys = computed(() => Object.keys(clientsStatistiques.value).length > 0)
const hasPaiementKeys = computed(() => Object.keys(paiementsStatistiques.value).length > 0)

const dashboardVisualCards = computed(() => {
  const cards = []
  const s = societeStatistiques.value
  const c = clientsStatistiques.value
  const pm = paiementsStatistiques.value
  const cm = collecteMoisBlock.value
  const fm = factureMoisBlock.value

  const revenu =
    num(s.revenusTransportMois ?? s.RevenusTransportMois ?? s.chiffreAffairesMois ?? s.ChiffreAffairesMois) ??
    num(fm.montantTotalFactures ?? fm.MontantTotalFactures) ??
    num(cm.montant ?? cm.Montant)
  if (revenu != null) cards.push({ key: 'rev', label: 'Chiffre affaires', display: formatMoney(revenu), tone: 'is-primary' })

  const clients = num(c.totalClients ?? c.TotalClients ?? s.totalClients ?? s.TotalClients)
  if (clients != null) {
    cards.push({
      key: 'cli',
      label: 'Clients',
      display: clients.toLocaleString('fr-CD', { maximumFractionDigits: 0 }),
      tone: 'is-neutral',
    })
  }

  const likes = num(pm.nombrePaiementsMois ?? pm.NombrePaiementsMois ?? s.totalReservationsMois ?? s.TotalReservationsMois)
  if (likes != null) {
    cards.push({
      key: 'pay',
      label: 'Paiements',
      display: likes.toLocaleString('fr-CD', { maximumFractionDigits: 0 }),
      tone: 'is-neutral',
    })
  }

  const rate = num(
    s.tauxPaiement ?? s.TauxPaiement ?? s.tauxRecouvrement ?? s.TauxRecouvrement ?? fm.tauxRecouvrementEstime ?? fm.TauxRecouvrementEstime,
  )
  if (rate != null) cards.push({ key: 'rate', label: 'Taux', display: formatPercent(rate), tone: 'is-neutral' })

  return cards.slice(0, 4)
})

const modernMiniCards = computed(() => {
  const s = societeStatistiques.value
  const c = clientsStatistiques.value
  const pstats = paiementsStatistiques.value
  const items = []
  const tc = num(readValue(s, ['totalClients', 'TotalClients']))
  if (tc != null) items.push({ key: 'tc', label: 'Total clients', display: String(tc) })
  const ca = num(readValue(c, ['clientsActifs', 'ClientsActifs']))
  if (ca != null) items.push({ key: 'ca', label: 'Clients actifs', display: String(ca) })
  const ncm = num(readValue(c, ['nouveauxClientsMois', 'NouveauxClientsMois']))
  if (ncm != null) items.push({ key: 'ncm', label: 'Nouveaux clients', display: String(ncm) })
  const pm = num(readValue(pstats, ['paiementsMois', 'PaiementsMois']))
  if (pm != null) items.push({ key: 'pm', label: 'Paiements mois', display: formatMoney(pm) })
  const npm = num(readValue(pstats, ['nombrePaiementsMois', 'NombrePaiementsMois']))
  if (npm != null) items.push({ key: 'npm', label: 'Nb paiements mois', display: String(npm) })
  const arr = num(readValue(s, ['montantTotalArrieres', 'MontantTotalArrieres']))
  if (arr != null) items.push({ key: 'arr', label: 'Arrieres', display: formatMoney(arr) })
  return items
})

const dashboardDonutPercent = computed(() => {
  const s = societeStatistiques.value
  const fm = factureMoisBlock.value
  const raw =
    num(s.tauxPaiement ?? s.TauxPaiement ?? s.tauxRecouvrement ?? s.TauxRecouvrement) ??
    num(fm.tauxRecouvrementEstime ?? fm.TauxRecouvrementEstime) ??
    0
  return Math.max(0, Math.min(100, raw))
})

const donutStyle = computed(() => ({
  background: `conic-gradient(var(--color-600) 0% ${dashboardDonutPercent.value}%, var(--color-100) ${dashboardDonutPercent.value}% 100%)`,
}))

const dashboardTrendBars = computed(() => {
  const firstWithRows = tendanceBlocksFiltered.value.find((b) => b.rows.length)
  const rows = firstWithRows?.rows?.slice(-6) ?? []
  const values = rows.map((r) => Math.max(0, Number(r.valeur) || 0))
  const max = Math.max(1, ...values)
  return rows.map((r, idx) => {
    const value = values[idx]
    const labelRaw = String(r.moisLabel || '—').trim()
    return {
      label: labelRaw.slice(0, 3).toUpperCase(),
      display: firstWithRows?.formatVal(r.valeur) ?? String(value),
      height: Math.max(10, Math.round((value / max) * 100)),
    }
  })
})

const trendPanelTitle = computed(() => {
  const firstWithRows = tendanceBlocksFiltered.value.find((b) => b.rows.length)
  return firstWithRows?.title || 'Tendance mensuelle'
})

const trendPanelCaption = computed(() => {
  if (!dashboardTrendBars.value.length) return 'Aucune serie disponible'
  return `${dashboardTrendBars.value.length} points affiches`
})

function normalizeSeriesValues(rows, take = 8) {
  const selected = Array.isArray(rows) ? rows.slice(-take) : []
  const nums = selected.map((r) => Math.max(0, Number(r?.valeur) || 0))
  return nums.length ? nums : []
}

function buildWavePath(values, baseline = 112, spread = 72) {
  const count = values.length
  const max = Math.max(1, ...values)
  const step = count > 1 ? 600 / (count - 1) : 600
  const pts = values.map((v, i) => {
    const x = Number((i * step).toFixed(2))
    const y = Number((baseline - (v / max) * spread).toFixed(2))
    return { x, y }
  })
  if (!pts.length) return 'M0,112 L600,112 L600,120 L0,120 Z'
  let d = `M${pts[0].x},${pts[0].y}`
  for (let i = 1; i < pts.length; i += 1) d += ` L${pts[i].x},${pts[i].y}`
  d += ' L600,120 L0,120 Z'
  return d
}

const wavePathPrimary = computed(() => {
  const caRows = unwrapList(tendances.value.evolutionChiffreAffaires ?? tendances.value.EvolutionChiffreAffaires)
  const values = normalizeSeriesValues(caRows)
  return values.length ? buildWavePath(values, 110, 68) : ''
})

const wavePathSecondary = computed(() => {
  const trRows = unwrapList(
    tendances.value.evolutionTauxRecouvrement ?? tendances.value.EvolutionTauxRecouvrement,
  )
  const values = normalizeSeriesValues(trRows)
  return values.length ? buildWavePath(values, 98, 56) : ''
})

const hasWaveData = computed(() => Boolean(wavePathPrimary.value || wavePathSecondary.value))

const rightPanelItems = computed(() => {
  const s = societeStatistiques.value
  const c = clientsStatistiques.value
  const pstats = paiementsStatistiques.value
  const items = []
  const clientsActifs = num(readValue(c, ['clientsActifs', 'ClientsActifs'])) ?? num(readValue(s, ['clientsActifs', 'ClientsActifs']))
  if (clientsActifs != null) items.push({ key: 'clients', label: 'Clients actifs', value: String(clientsActifs) })
  const payMois = num(readValue(pstats, ['nombrePaiementsMois', 'NombrePaiementsMois']))
  if (payMois != null) items.push({ key: 'paiements', label: 'Paiements mois', value: String(payMois) })
  if (hasAlertesPayload.value) {
    const unread = alertes.value.filter((a) => String(a.statut || '').toLowerCase().includes('non')).length
    items.push({ key: 'alertes', label: 'Alertes non lues', value: String(unread) })
  }
  return items
})

const dashboardGeneratedAtLabel = computed(() => {
  const raw = dateGeneration.value
  if (!raw) return 'n/a'
  const d = new Date(raw)
  if (Number.isNaN(d.getTime())) return String(raw).slice(0, 10)
  return d.toLocaleDateString('fr-FR')
})

const partialNotice = computed(() => {
  if (p.value?._fallbackAfterGerantDashboard) {
    return 'GET /GerantDashboard n’a pas renvoyé le contrat attendu ou a échoué ; affichage via GET /Dashboard/{société} (collecte / facturation mois).'
  }
  if (p.value?._dashboardSocieteFallback || p.value?._gerantDashboardPrimaryFailed) {
    return 'GET /GerantDashboard (et le tableau par société si applicable) n’ont pas répondu ; données reconstituées via les sous-routes (societe-statistiques, clients-statistiques, …).'
  }
  if (!p.value?._partialFromSubroutes) return ''
  if (p.value?._legacyStatistiquesAlertes) {
    return 'Données partielles : le tableau agrégé et les sous-routes « kebab » ont échoué ; affichage minimal via /GerantDashboard/statistiques et /GerantDashboard/alertes (rétrocompat API).'
  }
  return 'Données partielles : le GET /GerantDashboard a échoué ; recomposition via les sous-routes (societe-statistiques, clients-statistiques, …).'
})

const partialNoticeVisible = computed(
  () =>
    !!p.value?._fallbackAfterGerantDashboard ||
    (!!p.value?._partialFromSubroutes &&
      (permSoc.value || permFac.value || permCli.value || permRes.value)) ||
    !!p.value?._dashboardSocieteFallback ||
    !!p.value?._gerantDashboardPrimaryFailed,
)

const societeCards = computed(() => {
  const s = societeStatistiques.value
  const cards = []
  if (s.nomSociete != null && String(s.nomSociete).trim()) {
    cards.push({ key: 'nom', label: 'Société', display: String(s.nomSociete).trim(), skipNum: true })
  }
  const add = (key, label, value, opts = {}) => {
    const n = num(value)
    if (n == null && !opts.force) return
    cards.push({
      key,
      label,
      display:
        opts.money === true && n != null
          ? formatMoney(n)
          : opts.pct === true && n != null
            ? formatPercent(n)
            : n != null
              ? String(n.toLocaleString('fr-CD', { maximumFractionDigits: opts.frac ?? 0 }))
              : '—',
    })
  }
  add('tc', 'Total clients', s.totalClients ?? s.TotalClients)
  add('ca', 'Clients actifs', s.clientsActifs ?? s.ClientsActifs)
  add(
    'rev',
    'Revenus transport (mois)',
    s.revenusTransportMois ??
      s.RevenusTransportMois ??
      s.chiffreAffairesMois ??
      s.ChiffreAffairesMois,
    { money: true },
  )
  add(
    'mnp',
    'Montant réservations non payées',
    s.montantReservationsNonPayees ??
      s.MontantReservationsNonPayees ??
      s.montantTotalArrieres ??
      s.MontantTotalArrieres,
    { money: true },
  )
  add(
    'tp',
    'Taux de recouvrement',
    s.tauxPaiement ?? s.TauxPaiement ?? s.tauxRecouvrement ?? s.TauxRecouvrement,
    { pct: true },
  )
  add('var', 'Variation CA / mois préc.', s.variationCAMoisPrecedent ?? s.VariationCAMoisPrecedent, {
    pct: true,
  })
  add(
    'trm',
    'Réservations (mois)',
    s.totalReservationsMois ?? s.TotalReservationsMois ?? s.totalFacturesMois ?? s.TotalFacturesMois,
  )
  add(
    'rpm',
    'Réservations payées (mois)',
    s.reservationsPayeesMois ??
      s.ReservationsPayeesMois ??
      s.facturesPayeesMois ??
      s.FacturesPayeesMois,
  )
  return cards
})

/** Cartes KPI société : chaque indicateur selon Société / Client / Facture. */
function societeCardKeyAllowed(key) {
  switch (key) {
    case 'nom':
      return permSoc.value
    case 'tc':
    case 'ca':
      return permSoc.value || permCli.value
    case 'rev':
    case 'mnp':
    case 'tp':
    case 'var':
      return permFac.value
    case 'trm':
    case 'rpm':
      return permRes.value
    default:
      return true
  }
}

const filteredSocieteCards = computed(() => societeCards.value.filter((c) => societeCardKeyAllowed(c.key)))

const societeSectionVisible = computed(() => filteredSocieteCards.value.length > 0)

const clientStatCards = computed(() => {
  const s = clientsStatistiques.value
  const cards = []
  const add = (key, label, value, opts = {}) => {
    const n = num(value)
    if (n == null) return
    cards.push({
      key,
      label,
      display:
        opts.pct === true ? formatPercent(n) : String(n.toLocaleString('fr-CD', { maximumFractionDigits: 0 })),
    })
  }
  add('tc', 'Total clients', s.totalClients ?? s.TotalClients)
  add('ca', 'Clients actifs', s.clientsActifs ?? s.ClientsActifs)
  add('nm', 'Nouveaux (mois)', s.nouveauxClientsMois ?? s.NouveauxClientsMois)
  add('wa', 'Avec arriérés', s.clientsAvecArrieres ?? s.ClientsAvecArrieres)
  add('pwa', '% avec arriérés', s.pourcentageClientsAvecArrieres ?? s.PourcentageClientsAvecArrieres, {
    pct: true,
  })
  return cards
})

/** Arriérés : réservé à la lecture Facture. */
const filteredClientStatCards = computed(() =>
  clientStatCards.value.filter((c) => {
    if (c.key === 'wa' || c.key === 'pwa') return permFac.value
    return true
  }),
)

const repartitionRows = computed(() => {
  const raw = clientsStatistiques.value.repartitionParCategorie ?? clientsStatistiques.value.RepartitionParCategorie
  return unwrapList(raw)
    .map((row) => ({
      categorie:
        row.categorie ??
        row.Categorie ??
        row.nomCategorie ??
        row.NomCategorie ??
        '—',
      nombreClients: num(row.nombreClients ?? row.NombreClients),
      pourcentage: num(row.pourcentage ?? row.Pourcentage),
    }))
    .filter((row) => row.nombreClients != null || row.pourcentage != null)
})

const clientSectionVisible = computed(() => {
  const stats =
    permCli.value && hasClientsStatKeys.value && filteredClientStatCards.value.length > 0
  const rep = canRepartitionBlock.value && repartitionRows.value.length > 0
  return stats || rep
})

function normalizeTopRow(row) {
  return {
    rang: num(row.rang ?? row.Rang),
    idClient: num(row.idClient ?? row.IdClient),
    nomClient: String(row.nomClient ?? row.NomClient ?? '—'),
    valeur: num(row.valeur ?? row.Valeur ?? row.ca ?? row.CA),
    variationMoisPrecedent: num(
      row.variationMoisPrecedent ??
        row.VariationMoisPrecedent ??
        row.variation ??
        row.Variation,
    ),
  }
}

const topCa = computed(() =>
  unwrapList(pick(p.value, 'top5ClientsCA', 'Top5ClientsCA'))
    .map(normalizeTopRow)
    .filter((row) => row.valeur != null),
)

const topArr = computed(() =>
  unwrapList(pick(p.value, 'top5ClientsArrieres', 'Top5ClientsArrieres'))
    .map(normalizeTopRow)
    .filter((row) => row.valeur != null),
)

const hasTopCaPayload = computed(
  () => p.value?.top5ClientsCA !== undefined || p.value?.Top5ClientsCA !== undefined,
)
const hasTopArrPayload = computed(
  () => p.value?.top5ClientsArrieres !== undefined || p.value?.Top5ClientsArrieres !== undefined,
)

const alertes = computed(() =>
  unwrapList(pick(p.value, 'alertesSociete', 'AlertesSociete')).map((a) => ({
    idAlerte: a.idAlerte ?? a.IdAlerte,
    typeAlerte: a.typeAlerte ?? a.TypeAlerte,
    niveauCriticite: a.niveauCriticite ?? a.NiveauCriticite,
    description: a.description ?? a.Description,
    dateAlerte: a.dateAlerte ?? a.DateAlerte,
    statut: a.statut ?? a.Statut,
    nomClient: a.nomClient ?? a.NomClient,
  })),
)

/**
 * Séries mensuelles : GET /GerantDashboard expose `evolutionChiffreAffaires`, `evolutionTauxRecouvrement`, etc.
 * On garde les anciennes clés (`revenusTransport`, …) pour rétrocompat / sous-routes doc.
 * @param {string} blockKey
 * @param {string} title
 * @param {boolean} money
 * @param {boolean} pct
 * @param {readonly [string, string][]} keyPairs [camel, pascal][]
 */
function tendanceSeriesFromSources(blockKey, title, money, pct, keyPairs) {
  const t = tendances.value
  let raw = /** @type {unknown[]} */ ([])
  for (const [camel, pascal] of keyPairs) {
    const list = unwrapList(t?.[camel] ?? t?.[pascal])
    if (list.length) {
      raw = list
      break
    }
  }
  const rows = raw.map((row) => ({
    moisLabel: String(row.mois ?? row.Mois ?? '').trim() || '—',
    valeur: num(row.valeur ?? row.Valeur),
    variation: num(row.variation ?? row.Variation),
  }))
  return {
    key: blockKey,
    title,
    rows,
    formatVal(v) {
      if (v == null) return '—'
      if (money) return formatMoney(v)
      if (pct) return formatPercent(v)
      return String(Number(v).toLocaleString('fr-CD', { maximumFractionDigits: 0 }))
    },
  }
}

const tendanceBlocksAll = computed(() => [
  tendanceSeriesFromSources('ca-evolution', 'Évolution du chiffre d’affaires', true, false, [
    ['revenusTransport', 'RevenusTransport'],
    ['evolutionChiffreAffaires', 'EvolutionChiffreAffaires'],
  ]),
  tendanceSeriesFromSources('taux-evolution', 'Évolution du taux de recouvrement', false, true, [
    ['tauxPaiement', 'TauxPaiement'],
    ['evolutionTauxRecouvrement', 'EvolutionTauxRecouvrement'],
  ]),
  tendanceSeriesFromSources('reservations-evolution', 'Nombre de réservations', false, false, [
    ['nombreReservations', 'NombreReservations'],
  ]),
  tendanceSeriesFromSources('clients-evolution', 'Évolution du nombre de clients', false, false, [
    ['evolutionNombreClients', 'EvolutionNombreClients'],
  ]),
  tendanceSeriesFromSources('arrieres-evolution', 'Évolution des arriérés', true, false, [
    ['evolutionMontantArrieres', 'EvolutionMontantArrieres'],
  ]),
])

function hasMeaningfulTendanceRows(rows) {
  return rows.some((row) => {
    const v = num(row?.valeur)
    const varPct = num(row?.variation)
    return (v != null && v !== 0) || (varPct != null && varPct !== 0)
  })
}

const tendanceBlocksFiltered = computed(() => {
  return tendanceBlocksAll.value.filter((b) => {
    if (b.key === 'reservations-evolution') return permRes.value
    if (b.key === 'clients-evolution') return permCli.value
    if (
      b.key === 'ca-evolution' ||
      b.key === 'taux-evolution' ||
      b.key === 'arrieres-evolution'
    ) {
      return permFac.value
    }
    return false
  }).map((b) => ({
    ...b,
    rows: hasMeaningfulTendanceRows(b.rows) ? b.rows : [],
  }))
})

const tendancesSectionVisible = computed(() => tendanceBlocksFiltered.value.some((b) => b.rows.length > 0))
const hasTendancesPayload = computed(() => {
  const t = pick(p.value, 'tendances', 'Tendances')
  return t != null && typeof t === 'object' && !Array.isArray(t)
})
const hasAlertesPayload = computed(
  () => p.value?.alertesSociete !== undefined || p.value?.AlertesSociete !== undefined,
)
const hasPaiementsPayload = computed(
  () => p.value?.paiementsStatistiques !== undefined || p.value?.PaiementsStatistiques !== undefined,
)

const paiementCards = computed(() => {
  const s = paiementsStatistiques.value
  const cards = []
  const val = (camel, pascal) => s?.[camel] ?? s?.[pascal]
  const addMoney = (key, label, field) => {
    const n = num(val(field, `${field.charAt(0).toUpperCase()}${field.slice(1)}`))
    if (n == null) return
    cards.push({ key, label, display: formatMoney(n) })
  }
  const addInt = (key, label, field) => {
    const n = num(val(field, `${field.charAt(0).toUpperCase()}${field.slice(1)}`))
    if (n == null) return
    cards.push({ key, label, display: String(Math.round(n)) })
  }
  addMoney('pj', 'Paiements (jour)', 'paiementsJour')
  addMoney('ps', 'Paiements (semaine)', 'paiementsSemaine')
  addMoney('pm', 'Paiements (mois)', 'paiementsMois')
  addInt('nj', 'Nombre paiements / jour', 'nombrePaiementsJour')
  addInt('ns', 'Nombre paiements / semaine', 'nombrePaiementsSemaine')
  addInt('nm', 'Nombre paiements / mois', 'nombrePaiementsMois')
  addMoney('mj', 'Moyenne journalière', 'moyennePaiementsJournaliers')
  return cards
})

const hasAnyDashboardSection = computed(() => {
  if (DASHBOARD_API_DISABLED) return false
  if (!shouldFetchDashboard.value) return false
  if (isSocieteDashboard.value && socDashHasAnySection.value) return true
  if (isSocieteDashboard.value) return false
  if (societeSectionVisible.value) return true
  if (clientSectionVisible.value) return true
  if (permCli.value && permFac.value && (hasTopCaPayload.value || hasTopArrPayload.value)) return true
  if (canAlertesBlock.value && hasAlertesPayload.value) return true
  if (hasTendancesPayload.value || tendancesSectionVisible.value) return true
  if (canPaiementsBlock.value && (hasPaiementKeys.value || hasPaiementsPayload.value)) return true
  return false
})

const detailSectionRenderable = computed(() => {
  const s = gerantSectionKey.value
  if (!s) return false
  switch (s) {
    case 'societe-finances':
      return permSoc.value || permFac.value
    case 'clients':
      return permCli.value || permCat.value
    case 'top-ca':
    case 'top-arrieres':
      return permCli.value && permFac.value
    case 'alertes':
      return canAlertesBlock.value
    case 'tendances':
      return permFac.value || permRes.value || permCli.value
    case 'paiements-stats':
      return permPay.value
    default:
      return false
  }
})

const showGerantUnifiedBlocks = computed(() => {
  if (DASHBOARD_API_DISABLED) return false
  if (!shouldFetchDashboard.value) return false
  if (isSocieteDashboard.value && socDashHasAnySection.value && showAllSections.value) return false
  if (isGerantDetailRoute.value) {
    return detailSectionRenderable.value
  }
  return !isSocieteDashboard.value && hasAnyDashboardSection.value
})

const dateGeneration = computed(() => p.value.dateGeneration ?? p.value.DateGeneration ?? '')

const dataSourceBadge = computed(() => {
  const src = String(p.value?._source || '').trim()
  if (!src) return ''
  if (src === 'gerant-dashboard') return 'Source: GerantDashboard'
  if (src === 'societe-dashboard') return 'Source: GerantDashboard/societe/{id}'
  if (src === 'gerant-aggregate') {
    if (p.value?._legacyStatistiquesAlertes) return 'Source: fallback statistiques + alertes'
    return 'Source: fallback partiel API'
  }
  return `Source: ${src}`
})

function formatMoney(value) {
  const v = Number(value)
  if (!Number.isFinite(v)) return '—'
  return `${v.toLocaleString('fr-CD', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} FC`
}

function formatPercent(value) {
  const v = Number(value)
  if (!Number.isFinite(v)) return '—'
  return `${v.toLocaleString('fr-CD', { maximumFractionDigits: 1 })} %`
}

function formatVariation(value) {
  if (value == null || !Number.isFinite(Number(value))) return '—'
  const v = Number(value)
  const sign = v > 0 ? '+' : ''
  return `${sign}${v.toLocaleString('fr-CD', { maximumFractionDigits: 1 })} %`
}

function formatDateTime(value) {
  if (value == null || value === '') return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return String(value).slice(0, 16)
  return d.toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })
}

async function load() {
  if (injected) return
  loading.value = true
  error.value = ''
  if (DASHBOARD_API_DISABLED) {
    payload.value = null
    error.value =
      'Chargement désactivé : VITE_DISABLE_DASHBOARD_API=1. Retirez la variable ou mettez-la à 0 pour activer GerantDashboard.'
    loading.value = false
    return
  }
  if (!shouldFetchDashboard.value) {
    payload.value = null
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
        ' Vérifiez les droits sur GET /Dashboard/{idSociete} et GerantDashboard ; si la société est transmise par en-tête, activez ' +
        'VITE_ENABLE_SOCIETE_HEADER=1 une fois le CORS backend corrigé.'
    }
    error.value = msg
    payload.value = null
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  load()
})
</script>

<style scoped>
.gerant-dashboard {
  border-radius: 1rem;
  background: #eef2f6;
  padding: 0.35rem;
}

.modern-panel {
  border-radius: 0.4rem;
  border: 1px solid #d8dee7;
  background: #ffffff;
  box-shadow: 0 3px 10px rgba(15, 23, 42, 0.1);
}

.modern-kpi-card {
  border-radius: 0.3rem;
  border: 1px solid #d8dee7;
  background: #ffffff;
  padding: 0.8rem 1rem;
  box-shadow: 0 3px 10px rgba(15, 23, 42, 0.1);
}

.modern-mini-card {
  border-radius: 0.7rem;
  border: 1px solid rgba(148, 163, 184, 0.3);
  background: #ffffff;
  padding: 0.7rem 0.75rem;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.05);
}

.modern-mini-label {
  font-size: 0.64rem;
  font-weight: 600;
  color: #64748b;
}

.modern-mini-value {
  margin-top: 0.2rem;
  font-size: 0.95rem;
  font-weight: 700;
  color: #0f172a;
}

.modern-kpi-card.is-primary {
  background: linear-gradient(145deg, #0f766e 0%, #115e59 100%);
  border-color: #115e59;
}

.modern-kpi-label {
  font-size: 0.72rem;
  font-weight: 600;
  color: #475569;
}

.modern-kpi-card.is-primary .modern-kpi-label {
  color: rgba(226, 232, 240, 0.92);
}

.modern-kpi-value {
  margin-top: 0.4rem;
  font-size: 2.15rem;
  line-height: 1;
  font-weight: 700;
  color: #111827;
}

.modern-kpi-card.is-primary .modern-kpi-value {
  color: #ffffff;
}

.modern-bars {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  align-items: end;
  gap: 0.55rem;
  min-height: 165px;
  border-radius: 0.35rem;
  background: #ffffff;
  border: 1px solid #d8dee7;
  padding: 0.8rem 0.65rem;
}

.modern-bars-item {
  display: flex;
  min-width: 0;
  flex-direction: column;
  align-items: center;
  justify-content: end;
  gap: 0.35rem;
}

.modern-bars-col {
  width: 100%;
  min-height: 8px;
  border-radius: 0.55rem 0.55rem 0.25rem 0.25rem;
  background: linear-gradient(180deg, #2dd4bf 0%, #0f766e 100%);
}

.modern-bars-item:nth-child(even) .modern-bars-col {
  background: linear-gradient(180deg, #ffba33 0%, #f59e0b 100%);
}

.modern-bars-label {
  font-size: 0.65rem;
  font-weight: 600;
  color: #334155;
}

.modern-donut-wrap {
  display: flex;
  justify-content: center;
  padding: 0.4rem 0 0.2rem;
}

.modern-donut {
  position: relative;
  display: grid;
  place-items: center;
  height: 132px;
  width: 132px;
  border-radius: 999px;
}

.modern-donut::after {
  content: '';
  position: absolute;
  inset: 16px;
  border-radius: 999px;
  background: #f8fafc;
}

.modern-donut-value {
  position: relative;
  z-index: 1;
  font-size: 1.05rem;
  font-weight: 700;
  color: #0f172a;
}

.modern-side-list {
  margin-top: 0.5rem;
  border-top: 1px solid rgba(148, 163, 184, 0.35);
  padding-top: 0.6rem;
  font-size: 0.78rem;
  color: #334155;
}

.modern-side-list li + li {
  margin-top: 0.35rem;
}

.modern-cta-btn {
  border: 1px solid #e29b13;
  border-radius: 0.55rem;
  background: #f7aa16;
  color: #ffffff;
  font-size: 0.72rem;
  font-weight: 700;
  line-height: 1;
  padding: 0.45rem 0.8rem;
}

.modern-cta-btn:hover {
  background: #e89a08;
}

.modern-wave {
  overflow: hidden;
  border-radius: 0.35rem;
  background: #ffffff;
  border: 1px solid #d8dee7;
  min-height: 112px;
}

.modern-wave-svg {
  width: 100%;
  height: 112px;
}

.modern-calendar {
  border-radius: 0.35rem;
  background: #ffffff;
  border: 1px solid #d8dee7;
  padding: 0.45rem;
}

.modern-calendar-head {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  font-size: 0.56rem;
  font-weight: 700;
  color: #475569;
  text-align: center;
  margin-bottom: 0.25rem;
}

.modern-calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 0.15rem;
}

.modern-calendar-grid span {
  font-size: 0.62rem;
  text-align: center;
  border-radius: 0.25rem;
  padding: 0.15rem 0;
  color: #334155;
}

.modern-calendar-grid span.active {
  background: #0f766e;
  color: #f8fafc;
  font-weight: 700;
}

.modern-wave-primary {
  fill: #f7aa16;
  fill-opacity: 0.55;
}

.modern-wave-secondary {
  fill: #0f766e;
  fill-opacity: 0.72;
}

.dark .modern-donut::after {
  background: #0f172a;
}

.dark .modern-panel {
  border-color: rgba(148, 163, 184, 0.28);
  background: rgba(15, 23, 42, 0.58);
  box-shadow: none;
}

.dark .gerant-dashboard {
  background: rgba(2, 6, 23, 0.55);
}

.dark .modern-kpi-card {
  border-color: rgba(148, 163, 184, 0.28);
  background: rgba(15, 23, 42, 0.62);
  box-shadow: none;
}

.dark .modern-mini-card {
  border-color: rgba(148, 163, 184, 0.28);
  background: rgba(15, 23, 42, 0.62);
}

.dark .modern-mini-label {
  color: rgb(191 219 254 / 0.78);
}

.dark .modern-mini-value {
  color: #f8fafc;
}

.dark .modern-kpi-value {
  color: #f8fafc;
}

.dark .modern-bars {
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.88) 0%, rgba(2, 6, 23, 0.94) 100%);
  border: 1px solid rgba(148, 163, 184, 0.2);
}

.dark .modern-cta-btn {
  border-color: #e29b13;
  background: #f59e0b;
  color: #fff;
}

.dark .modern-cta-btn:hover {
  background: #d97706;
}

.dark .modern-bars-col {
  background: linear-gradient(180deg, var(--color-300) 0%, var(--color-600) 100%);
}

.dark .modern-donut-value {
  color: #e2e8f0;
}

.dark .modern-side-list {
  border-top-color: color-mix(in srgb, var(--color-700) 35%, transparent);
  color: rgb(226 232 240 / 0.9);
}

.dark .modern-calendar {
  border-color: rgba(148, 163, 184, 0.28);
  background: rgba(15, 23, 42, 0.82);
}

.dark .modern-kpi-label {
  color: rgb(191 219 254 / 0.78);
}

.dark .modern-bars-label {
  color: rgb(226 232 240 / 0.85);
}

.dark .modern-calendar-head {
  color: rgb(191 219 254 / 0.72);
}

.dark .modern-calendar-grid span {
  color: rgb(191 219 254 / 0.84);
}

.dark .modern-wave {
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.86) 0%, rgba(2, 6, 23, 0.92) 100%);
  border: 1px solid rgba(148, 163, 184, 0.2);
}

.gerant-stat-section {
  border-radius: 0.4rem;
  border: 1px solid #d8dee7;
  background: #ffffff;
  padding: 0.85rem;
  box-shadow: 0 3px 10px rgba(15, 23, 42, 0.08);
}

.gerant-stat-card {
  border-radius: 0.35rem;
  border: 1px solid #d8dee7;
  background: #f8fafc;
  padding: 0.85rem 0.9rem;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.05);
}

.gerant-dashboard .rusa-panel {
  border-color: rgba(148, 163, 184, 0.28);
  background: #ffffff;
  box-shadow: 0 2px 10px rgba(15, 23, 42, 0.06);
}

.gerant-dashboard .rusa-card {
  border-color: rgba(148, 163, 184, 0.28);
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.05);
}

.modern-block-head {
  border-bottom: 1px solid #d8dee7;
  border-left: 4px solid #f7aa16;
  background: #ffffff;
}

.modern-table thead {
  background: #eef2f6;
}

.modern-table thead th {
  font-weight: 600;
  color: #334155;
}

.modern-table tbody tr + tr {
  border-top: 1px solid rgba(148, 163, 184, 0.2);
}

.modern-alert-item {
  border-radius: 0.35rem;
  border: 1px solid #d8dee7;
  border-left: 4px solid #f7aa16;
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.05);
}

.dark .gerant-stat-section {
  border-color: rgba(148, 163, 184, 0.24);
  background: rgba(15, 23, 42, 0.5);
}

.dark .gerant-stat-card {
  border-color: rgba(148, 163, 184, 0.26);
  background: rgba(15, 23, 42, 0.72);
  box-shadow: none;
}

.dark .gerant-dashboard .rusa-panel,
.dark .gerant-dashboard .rusa-card {
  border-color: rgba(148, 163, 184, 0.26);
  background: rgba(15, 23, 42, 0.72);
  box-shadow: none;
}

.dark .modern-block-head {
  border-bottom-color: rgba(148, 163, 184, 0.22);
  background: rgba(15, 23, 42, 0.82);
}

.dark .modern-table thead {
  background: rgba(15, 23, 42, 0.82);
}

.dark .modern-table thead th {
  color: rgb(191 219 254 / 0.84);
}

.dark .modern-table tbody tr + tr {
  border-top-color: rgba(148, 163, 184, 0.2);
}

.dark .modern-alert-item {
  border-color: rgba(148, 163, 184, 0.26);
  background: rgba(15, 23, 42, 0.72);
  box-shadow: none;
}
</style>
