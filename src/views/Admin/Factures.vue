<template>
  <DefaultLayout>
    <div class="space-y-6">
      <div class="rusa-gradient-header">
        <h1 class="text-2xl font-bold text-white">Factures</h1>
        <p class="text-primary-100">
          Liste issue de <code class="rounded bg-black/20 px-1.5 py-0.5 text-sm">GET /api/Facture</code> — droits
          <span class="font-medium">Facture.*</span> du JWT.
        </p>
      </div>

      <p
        v-if="error"
        class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/50 dark:text-red-200"
      >
        {{ error }}
      </p>

      <div
        v-if="loading"
        class="rusa-card p-8 text-center text-sm text-gray-500 dark:text-primary-400/80"
      >
        Chargement…
      </div>

      <div
        v-else
        class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-primary-800/60 dark:bg-primary-950/70 dark:shadow-none"
      >
        <div class="overflow-x-auto">
          <table class="w-full min-w-[28rem] text-left text-sm">
            <thead class="border-b border-gray-200 bg-gray-50 dark:border-primary-800/60 dark:bg-primary-900/50">
              <tr>
                <th class="px-4 py-3 font-semibold text-gray-700 dark:text-primary-200">Réf.</th>
                <th class="px-4 py-3 font-semibold text-gray-700 dark:text-primary-200">Libellé</th>
                <th class="px-4 py-3 font-semibold text-gray-700 dark:text-primary-200">Montant</th>
                <th class="px-4 py-3 font-semibold text-gray-700 dark:text-primary-200">Statut</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-primary-800/50">
              <tr v-for="(row, idx) in rows" :key="rowKey(row, idx)">
                <td class="px-4 py-2.5 tabular-nums text-gray-900 dark:text-white">{{ cellRef(row) }}</td>
                <td class="px-4 py-2.5 text-gray-800 dark:text-primary-100">{{ cellLibelle(row) }}</td>
                <td class="px-4 py-2.5 tabular-nums text-gray-800 dark:text-primary-100">{{ cellMontant(row) }}</td>
                <td class="px-4 py-2.5 text-gray-800 dark:text-primary-100">{{ cellStatut(row) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p
          v-if="!rows.length"
          class="border-t border-gray-100 px-4 py-8 text-center text-sm text-gray-500 dark:border-primary-800/40 dark:text-primary-400/80"
        >
          Aucune facture renvoyée par l’API.
        </p>
      </div>
    </div>
  </DefaultLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import DefaultLayout from '@/components/layout/DefaultLayout.vue'
import { fetchFactureList } from '@/services/factureService'

const rows = ref(/** @type {Record<string, unknown>[]} */ ([]))
const loading = ref(true)
const error = ref('')

function pick(row, ...keys) {
  const r = row || {}
  for (const k of keys) {
    if (r[k] != null && r[k] !== '') return r[k]
  }
  return ''
}

function rowKey(row, idx) {
  const id = pick(row, 'idFacture', 'IdFacture', 'id', 'Id')
  return id !== '' ? String(id) : `f-${idx}`
}

function cellRef(row) {
  return String(pick(row, 'numeroFacture', 'NumeroFacture', 'reference', 'Reference', 'idFacture', 'IdFacture') || '—')
}

function cellLibelle(row) {
  return String(pick(row, 'libelle', 'Libelle', 'description', 'Description', 'nomClient', 'NomClient') || '—')
}

function cellMontant(row) {
  const m = pick(row, 'montantTTC', 'MontantTTC', 'montant', 'Montant', 'total', 'Total')
  if (m === '' || m == null) return '—'
  const n = Number(m)
  if (!Number.isFinite(n)) return String(m)
  return `${n.toLocaleString('fr-CD', { maximumFractionDigits: 2 })} FC`
}

function cellStatut(row) {
  return String(pick(row, 'statut', 'Statut', 'statutPaiement', 'StatutPaiement') || '—')
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    const list = await fetchFactureList()
    rows.value = Array.isArray(list) ? list.map((x) => (typeof x === 'object' && x ? /** @type {Record<string, unknown>} */ (x) : {})) : []
  } catch (e) {
    error.value = e?.message || 'Impossible de charger les factures.'
    rows.value = []
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>
