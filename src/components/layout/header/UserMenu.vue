<template>
  <div class="relative z-[100020] flex shrink-0 items-center">
    <button
      ref="buttonRef"
      type="button"
      class="flex max-w-full min-w-0 items-center gap-0 text-gray-700 sm:gap-0 dark:text-gray-400"
      :aria-expanded="dropdownOpen"
      aria-haspopup="true"
      aria-label="Menu du profil"
      @click.prevent="toggleDropdown"
    >
      <span
        class="shrink-0 overflow-hidden rounded-full h-9 w-9 sm:mr-3 sm:h-11 sm:w-11"
      >
        <img
          v-if="avatarResolvedUrl && !avatarImgFailed"
          :src="avatarResolvedUrl"
          :alt="displayName"
          class="h-full w-full object-cover"
          @error="avatarImgFailed = true"
        />
        <div
          v-else
          class="flex h-full w-full items-center justify-center bg-gray-200 text-xs font-semibold text-gray-600 dark:bg-primary-800/80 dark:text-primary-200"
          :title="displayName"
        >
          {{ avatarInitials }}
        </div>
      </span>

      <span
        class="mr-1 hidden min-w-0 max-w-[10rem] text-left sm:block sm:max-w-[10rem] lg:max-w-[9rem] xl:max-w-[13rem]"
      >
        <span class="block truncate font-medium text-theme-sm leading-tight">
          {{ shortName }}
        </span>
        <span
          class="block truncate text-theme-xs font-normal text-primary-600 dark:text-primary-400"
        >
          {{ roleDisplay }}
        </span>
      </span>

      <ChevronDownIcon class="hidden shrink-0 rotate-180 sm:block" />
    </button>

    <Teleport to="body">
      <div
        v-if="dropdownOpen"
        ref="panelRef"
        class="flex w-[260px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark"
        :style="panelStyle"
        role="menu"
      >
        <div>
          <span class="block font-medium text-gray-700 text-theme-sm dark:text-gray-400">
            {{ displayName }}
          </span>
          <span class="mt-0.5 block text-theme-xs text-gray-500 dark:text-gray-400">
            {{ displayEmail || '—' }}
          </span>
          <span
            class="mt-2 inline-flex rounded-lg bg-primary-500/10 px-2 py-1 text-theme-xs font-medium text-primary-700 dark:bg-primary-500/20 dark:text-primary-300"
          >
            {{ roleDisplay }}
          </span>
        </div>

        <ul class="flex flex-col gap-1 pt-4 pb-3 border-b border-gray-200 dark:border-gray-800">
          <li v-for="item in menuItems" :key="item.href">
            <router-link
              :to="item.href"
              class="flex items-center gap-3 px-3 py-2 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
              @click="closeDropdown"
            >
              <component
                :is="item.icon"
                class="text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300"
              />
              {{ item.text }}
            </router-link>
          </li>
        </ul>

        <button
          type="button"
          role="menuitem"
          class="mt-3 flex w-full items-center gap-3 px-3 py-2 text-left font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
          @click="handleLogout"
        >
          <LogoutIcon
            class="text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300"
          />
          {{ t('sign_out') }}
        </button>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { UserCircleIcon, ChevronDownIcon, LogoutIcon, SettingsIcon } from '@/icons'
import { useRouter } from 'vue-router'
import { ref, onMounted, onUnmounted, computed, watch, nextTick } from 'vue'
import { useLocaleStore } from '@/stores/locale'
import { useAuthStore } from '@/stores/auth'
import { getDashboardPath } from '@/config/roles'
import {
  getDisplayName,
  getShortName,
  getDisplayEmail,
  getRoleDisplayLabel,
  resolveSessionAvatarUrl,
  profileInitials,
} from '@/utils/authDisplay'

const localeStore = useLocaleStore()
const authStore = useAuthStore()
const router = useRouter()

const user = computed(() => authStore.user)

const displayName = computed(() => getDisplayName(user.value))

const shortName = computed(() => getShortName(user.value))

const displayEmail = computed(() => getDisplayEmail(user.value))

const roleDisplay = computed(() => getRoleDisplayLabel(user.value, authStore.role))

const avatarResolvedUrl = computed(() =>
  resolveSessionAvatarUrl(user.value, authStore.agent)
)

const avatarInitials = computed(() => profileInitials(user.value))

const avatarImgFailed = ref(false)

watch(
  () => [user.value, authStore.agent],
  () => {
    avatarImgFailed.value = false
  },
  { deep: true }
)

const t = (key) => localeStore.t(key)

/** Liens du menu au style TailAdmin, routes réelles selon le rôle. */
const menuItems = computed(() => {
  const r = authStore.role || 'client'
  const dash = getDashboardPath(r)
  const items = []

  if (r === 'client') {
    items.push({
      href: '/client/profile',
      icon: UserCircleIcon,
      text: t('edit_profile'),
    })
    items.push({
      href: '/client/settings',
      icon: SettingsIcon,
      text: t('account_settings'),
    })
  } else if (r === 'transporteur') {
    items.push({
      href: dash,
      icon: UserCircleIcon,
      text: t('edit_profile'),
    })
    items.push({
      href: '/transport/settings',
      icon: SettingsIcon,
      text: t('account_settings'),
    })
  } else if (r === 'superadmin' || r === 'admin') {
    items.push({
      href: dash,
      icon: UserCircleIcon,
      text: t('edit_profile'),
    })
    items.push({
      href: '/admin/settings',
      icon: SettingsIcon,
      text: t('account_settings'),
    })
  } else {
    items.push({
      href: dash,
      icon: UserCircleIcon,
      text: t('edit_profile'),
    })
  }

  return items
})

const dropdownOpen = ref(false)
const buttonRef = ref(null)
const panelRef = ref(null)
const panelStyle = ref({})

function syncPanelPosition() {
  if (!dropdownOpen.value || !buttonRef.value) {
    panelStyle.value = {}
    return
  }
  const r = buttonRef.value.getBoundingClientRect()
  const margin = 12
  const gap = 8
  panelStyle.value = {
    position: 'fixed',
    top: `${r.bottom + gap}px`,
    right: `${Math.max(margin, window.innerWidth - r.right)}px`,
    width: '260px',
    zIndex: 200000,
  }
}

const toggleDropdown = () => {
  dropdownOpen.value = !dropdownOpen.value
}

const closeDropdown = () => {
  dropdownOpen.value = false
}

watch(dropdownOpen, async (open) => {
  if (open) {
    await nextTick()
    syncPanelPosition()
  } else {
    panelStyle.value = {}
  }
})

function onScrollOrResize() {
  if (dropdownOpen.value) syncPanelPosition()
}

const handleLogout = async () => {
  await authStore.logout()
  closeDropdown()
  router.replace({ name: 'Signin' })
}

const handleClickOutside = (event) => {
  const target = event.target
  if (buttonRef.value?.contains(target)) return
  if (panelRef.value?.contains(target)) return
  closeDropdown()
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('scroll', onScrollOrResize, true)
  window.addEventListener('resize', onScrollOrResize)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('scroll', onScrollOrResize, true)
  window.removeEventListener('resize', onScrollOrResize)
})
</script>
