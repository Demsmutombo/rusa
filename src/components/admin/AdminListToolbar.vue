<template>
  <div
    class="flex flex-col gap-3 border-b border-gray-200 bg-gradient-to-r from-gray-50/95 to-slate-50/80 px-4 py-3 sm:flex-row sm:flex-wrap sm:items-center dark:border-primary-800/50 dark:from-primary-900/40 dark:to-primary-950/50"
  >
    <div class="relative min-w-0 flex-1 sm:max-w-md">
      <svg
        class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400 dark:text-primary-500/60"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="2"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
        />
      </svg>
      <input
        :value="search"
        type="search"
        autocomplete="off"
        :placeholder="placeholder"
        class="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-3 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30 dark:border-primary-700 dark:bg-primary-900/70 dark:text-gray-100 dark:placeholder:text-primary-500/50 dark:focus:border-primary-400"
        @input="$emit('update:search', ($event.target).value)"
      />
    </div>
    <div v-if="showStatutFilter" class="flex flex-wrap items-center gap-2">
      <label class="whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-primary-400/80">
        Statut
      </label>
      <select
        :value="statut"
        class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-800 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/25 dark:border-primary-700 dark:bg-primary-900/70 dark:text-primary-100 dark:focus:border-primary-400"
        @change="$emit('update:statut', ($event.target).value)"
      >
        <option value="all">Tous</option>
        <option value="active">Actifs</option>
        <option value="inactive">Inactifs</option>
      </select>
    </div>
    <div class="flex flex-wrap items-center gap-2 sm:ml-auto">
      <button
        v-if="hasFilters"
        type="button"
        class="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 dark:border-primary-700 dark:bg-primary-900/50 dark:text-primary-200 dark:hover:bg-primary-800/60"
        @click="onClear"
      >
        Réinitialiser
      </button>
      <p class="text-xs text-gray-500 tabular-nums dark:text-primary-400/80">
        <span class="font-semibold text-gray-700 dark:text-primary-200">{{ filteredCount }}</span>
        résultat<span v-if="filteredCount !== 1">s</span>
        <span v-if="totalCount !== filteredCount"> sur {{ totalCount }}</span>
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  search: { type: String, default: '' },
  statut: { type: String, default: 'all' },
  filteredCount: { type: Number, required: true },
  totalCount: { type: Number, required: true },
  showStatutFilter: { type: Boolean, default: true },
  placeholder: { type: String, default: 'Rechercher…' },
})

const emit = defineEmits(['update:search', 'update:statut', 'clear'])

const hasFilters = computed(() => {
  if (String(props.search || '').trim()) return true
  if (props.showStatutFilter && props.statut !== 'all') return true
  return false
})

function onClear() {
  emit('update:search', '')
  emit('update:statut', 'all')
  emit('clear')
}
</script>
