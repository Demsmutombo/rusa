<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-[500000] overflow-hidden"
      :class="backdropClasses"
      @click.self="onBackdropClick"
    >
      <div
        class="flex h-full min-h-0 items-center justify-center overflow-hidden p-4 py-8 sm:p-6"
        :class="alignClass"
        @click.self="onBackdropClick"
      >
        <!-- Mode embarqué : carte fournie par le slot ; défilement interne -->
        <div
          v-if="embed"
          class="my-auto flex w-full justify-center"
          @click.stop
        >
          <div
            class="max-h-[85vh] w-full max-w-4xl overflow-y-auto overscroll-y-contain"
          >
            <slot name="body">
              <slot />
            </slot>
          </div>
        </div>

        <div
          v-else
          :class="[
            panelSizeClass,
            'flex max-h-[85vh] w-full flex-col overflow-hidden rounded-2xl border border-primary-100 bg-white shadow-xl dark:border-primary-800 dark:bg-gray-900',
            panelClass,
          ]"
          @click.stop
        >
          <div
            v-if="showHeaderRow"
            class="flex shrink-0 items-start gap-2 border-b border-primary-100 px-5 pb-3 pt-5 dark:border-primary-800/60"
            :class="headerJustifyClass"
          >
            <div class="min-w-0 flex-1">
              <slot name="title">
                <h3
                  v-if="title"
                  class="text-lg font-semibold text-gray-900 dark:text-white"
                >
                  {{ title }}
                </h3>
              </slot>
            </div>
            <button
              v-if="showHeaderClose"
              type="button"
              class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-red-200 bg-white text-red-600 shadow-sm transition hover:border-red-300 hover:bg-red-50 hover:text-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 dark:border-red-800/80 dark:bg-gray-800 dark:text-red-400 dark:hover:border-red-700 dark:hover:bg-red-950/40 dark:hover:text-red-300 dark:focus-visible:ring-offset-gray-900"
              aria-label="Fermer"
              @click="onCloseClick"
            >
              <XMarkIcon
                class="h-5 w-5"
                aria-hidden="true"
              />
            </button>
          </div>
          <div
            class="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-5 py-4"
          >
            <slot name="body">
              <slot />
            </slot>
          </div>
          <div
            v-if="$slots.footer"
            class="shrink-0 border-t border-primary-100 px-5 pb-5 pt-4 dark:border-primary-800/60"
          >
            <slot name="footer" />
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed, useSlots } from 'vue'
import { XMarkIcon } from '@heroicons/vue/24/outline'
import { useSidebar } from '@/composables/useSidebar'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: '' },
  showHeaderClose: { type: Boolean, default: true },
  /** sm | md | lg | xl | 2xl | 3xl */
  size: { type: String, default: '2xl' },
  /** Slot = carte complète (sans panneau blanc du composant) */
  embed: { type: Boolean, default: false },
  /** Décalage gauche sur lg+ (largeur sidebar + marge) */
  alignWithSidebar: { type: Boolean, default: true },
  backdropBlur: { type: Boolean, default: false },
  /** Surcharge des classes du fond (ex. réservation client) */
  backdropClass: { type: String, default: '' },
  panelClass: { type: String, default: '' },
})

const emit = defineEmits(['update:modelValue', 'close'])

const slots = useSlots()

const { isExpanded, isHovered } = useSidebar()

const alignClass = computed(() => {
  if (!props.alignWithSidebar) return ''
  return isExpanded.value || isHovered.value
    ? 'lg:pl-[calc(290px+1.5rem)]'
    : 'lg:pl-[calc(90px+1.5rem)]'
})

const backdropClasses = computed(() => {
  if (props.backdropClass) return props.backdropClass
  return props.backdropBlur
    ? 'bg-gray-400/50 backdrop-blur-[32px]'
    : 'bg-gray-600/50'
})

const sizeMap = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
}

const panelSizeClass = computed(() => sizeMap[props.size] || sizeMap['2xl'])

const hasTitle = computed(() => !!(props.title || slots.title))

const showHeaderRow = computed(() => {
  if (props.embed) return false
  return props.showHeaderClose || hasTitle.value
})

const headerJustifyClass = computed(() =>
  hasTitle.value ? 'justify-between' : 'justify-end'
)

function onBackdropClick() {
  emit('update:modelValue', false)
  emit('close')
}

function onCloseClick() {
  emit('update:modelValue', false)
  emit('close')
}
</script>
