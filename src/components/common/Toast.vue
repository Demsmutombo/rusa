<template>
  <transition
    enter-active-class="transform ease-out duration-300 transition"
    enter-from-class="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
    enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
    leave-active-class="transition ease-in duration-100"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="show"
      :class="[
        'max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden',
        positionClasses
      ]"
    >
      <div class="p-4">
        <div class="flex items-start">
          <div class="flex-shrink-0">
            <component
              :is="iconComponent"
              :class="iconClasses"
              class="h-6 w-6"
              aria-hidden="true"
            />
          </div>
          <div class="ml-3 w-0 flex-1 pt-0.5">
            <p
              v-if="title"
              :class="titleClasses"
              class="text-sm font-medium"
            >
              {{ title }}
            </p>
            <p
              v-if="message"
              :class="messageClasses"
              class="text-sm"
            >
              {{ message }}
            </p>
          </div>
          <div class="ml-4 flex-shrink-0 flex">
            <button
              class="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              @click="close"
            >
              <span class="sr-only">Close</span>
              <XMarkIcon class="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline'

const props = defineProps({
  type: { type: String, default: 'info' },
  title: { type: String, default: '' },
  message: { type: String, default: '' },
  duration: { type: Number, default: 5000 },
  position: { type: String, default: 'top-right' },
})

const emit = defineEmits(['close'])

const show = ref(false)

const positionClasses = computed(() => {
  const positions = {
    'top-right': 'fixed top-4 right-4',
    'top-left': 'fixed top-4 left-4',
    'bottom-right': 'fixed bottom-4 right-4',
    'bottom-left': 'fixed bottom-4 left-4'
  }
  return positions[props.position]
})

const iconComponent = computed(() => {
  const icons = {
    success: CheckCircleIcon,
    error: XCircleIcon,
    warning: ExclamationCircleIcon,
    info: InformationCircleIcon
  }
  return icons[props.type] || InformationCircleIcon
})

const iconClasses = computed(() => {
  const classes = {
    success: 'text-green-400',
    error: 'text-red-400',
    warning: 'text-yellow-400',
    info: 'text-blue-400'
  }
  return classes[props.type]
})

const titleClasses = computed(() => {
  const classes = {
    success: 'text-gray-900',
    error: 'text-gray-900',
    warning: 'text-gray-900',
    info: 'text-gray-900'
  }
  return classes[props.type]
})

const messageClasses = computed(() => {
  const classes = {
    success: 'text-gray-500',
    error: 'text-gray-500',
    warning: 'text-gray-500',
    info: 'text-gray-500'
  }
  return classes[props.type]
})

const close = () => {
  show.value = false
  setTimeout(() => {
    emit('close')
  }, 300)
}

onMounted(() => {
  show.value = true
  
  if (props.duration > 0) {
    setTimeout(() => {
      close()
    }, props.duration)
  }
})
</script>

