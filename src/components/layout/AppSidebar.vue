<template>
  <aside
    :class="[
      'rusa-sidebar fixed top-0 left-0 z-99999 mt-16 flex h-screen flex-col border-r border-primary-800/50 bg-primary-950 px-5 text-white transition-all duration-300 ease-in-out lg:mt-0',
      {
        'lg:w-[290px]': isExpanded || isMobileOpen || isHovered,
        'lg:w-[90px]': !isExpanded && !isHovered,
        'translate-x-0 w-[290px]': isMobileOpen,
        '-translate-x-full': !isMobileOpen,
        'lg:translate-x-0': true,
      },
    ]"
    @mouseenter="!isExpanded && (isHovered = true)"
    @mouseleave="isHovered = false"
  >
    <div
      class="shrink-0 py-8 flex justify-center"
    >
      <router-link to="/">
        <img
          class="mx-auto"
          src="/images/logo/auth-logo.png"
          alt="Logo"
          width="120"
          height="120"
        />
      </router-link>
    </div>

    <div
      class="flex min-h-0 flex-1 flex-col overflow-y-auto duration-300 ease-linear no-scrollbar"
    >
      <nav class="mb-6">
        <p
          v-if="menuGroups.length === 0 && (isExpanded || isHovered || isMobileOpen)"
          class="px-1 text-center text-xs leading-relaxed text-primary-300/90"
        >
          Navigation masquée — les modules seront activés progressivement.
        </p>
        <div v-else class="flex flex-col gap-4">
          <div v-for="(menuGroup, groupIndex) in menuGroups" :key="groupIndex">
            <h2
              :class="[
                'mb-4 flex text-xs uppercase leading-[20px] text-primary-400/80',
                !isExpanded && !isHovered
                  ? 'lg:justify-center'
                  : 'justify-start',
              ]"
            >
              <template v-if="isExpanded || isHovered || isMobileOpen">
                {{ menuGroup.title }}
              </template>
              <HorizontalDots v-else />
            </h2>
            <ul class="flex flex-col gap-4">
              <li v-for="(item, index) in menuGroup.items" :key="item.name">
                <button
                  v-if="item.subItems"
                  @click="toggleSubmenu(groupIndex, index)"
                  :class="[
                    'menu-item group w-full',
                    {
                      'menu-item-active': isSubmenuOpen(groupIndex, index),
                      'menu-item-inactive': !isSubmenuOpen(groupIndex, index),
                    },
                    !isExpanded && !isHovered
                      ? 'lg:justify-center'
                      : 'lg:justify-start',
                  ]"
                >
                  <span
                    :class="[
                      isSubmenuOpen(groupIndex, index)
                        ? 'menu-item-icon-active'
                        : 'menu-item-icon-inactive',
                    ]"
                  >
                    <component :is="item.icon" />
                  </span>
                  <span
                    v-if="isExpanded || isHovered || isMobileOpen"
                    class="menu-item-text"
                    >{{ item.name }}</span
                  >
                  <ChevronDownIcon
                    v-if="isExpanded || isHovered || isMobileOpen"
                    :class="[
                      'ml-auto w-5 h-5 transition-transform duration-200',
                      {
                        'rotate-180 text-primary-300': isSubmenuOpen(groupIndex, index),
                      },
                    ]"
                  />
                </button>
                <router-link
                  v-else-if="item.path"
                  :to="item.path"
                  :class="[
                    'menu-item group',
                    {
                      'menu-item-active': isActive(item.path),
                      'menu-item-inactive': !isActive(item.path),
                    },
                  ]"
                >
                  <span
                    :class="[
                      isActive(item.path)
                        ? 'menu-item-icon-active'
                        : 'menu-item-icon-inactive',
                    ]"
                  >
                    <component :is="item.icon" />
                  </span>
                  <span
                    v-if="isExpanded || isHovered || isMobileOpen"
                    class="menu-item-text"
                    >{{ item.name }}</span
                  >
                </router-link>
                <transition
                  @enter="startTransition"
                  @after-enter="endTransition"
                  @before-leave="startTransition"
                  @after-leave="endTransition"
                >
                  <div
                    v-show="
                      isSubmenuOpen(groupIndex, index) &&
                      (isExpanded || isHovered || isMobileOpen)
                    "
                  >
                    <ul class="mt-2 space-y-1 ml-9">
                      <li v-for="subItem in item.subItems" :key="subItem.name">
                        <router-link
                          :to="subItem.path"
                          :class="[
                            'menu-dropdown-item',
                            {
                              'menu-dropdown-item-active': isActive(subItem.path),
                              'menu-dropdown-item-inactive': !isActive(
                                subItem.path
                              ),
                            },
                          ]"
                        >
                          {{ subItem.name }}
                          <span class="flex items-center gap-1 ml-auto">
                            <span
                              v-if="subItem.new"
                              :class="[
                                'menu-dropdown-badge',
                                {
                                  'menu-dropdown-badge-active': isActive(subItem.path),
                                  'menu-dropdown-badge-inactive': !isActive(
                                    subItem.path
                                  ),
                                },
                              ]"
                            >
                              new
                            </span>
                            <span
                              v-if="subItem.pro"
                              :class="[
                                'menu-dropdown-badge',
                                {
                                  'menu-dropdown-badge-active': isActive(subItem.path),
                                  'menu-dropdown-badge-inactive': !isActive(
                                    subItem.path
                                  ),
                                },
                              ]"
                            >
                              pro
                            </span>
                          </span>
                        </router-link>
                      </li>
                    </ul>
                  </div>
                </transition>
              </li>
            </ul>
          </div>
        </div>
      </nav>
      <SidebarWidget
        v-if="menuGroups.length > 0 && (isExpanded || isHovered || isMobileOpen)"
      />

      <div
        class="mt-auto shrink-0 border-t border-primary-800/50 pt-4 pb-6"
        :class="[
          !isExpanded && !isHovered ? 'lg:px-0' : '',
        ]"
      >
        <button
          type="button"
          class="menu-item group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-primary-100/90 transition hover:bg-white/10 hover:text-white"
          :class="[
            !isExpanded && !isHovered && !isMobileOpen
              ? 'lg:justify-center'
              : '',
          ]"
          @click="handleLogout"
        >
          <span class="menu-item-icon-inactive shrink-0 text-primary-200/80 group-hover:text-white">
            <LogoutIcon class="h-5 w-5" />
          </span>
          <span
            v-if="isExpanded || isHovered || isMobileOpen"
            class="menu-item-text text-theme-sm font-medium"
          >
            {{ t("sign_out") }}
          </span>
        </button>
      </div>
    </div>
  </aside>
</template>

<script setup >
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useLocaleStore } from "@/stores/locale";

import { ChevronDownIcon, HorizontalDots, LogoutIcon } from "../../icons";
import SidebarWidget from "./SidebarWidget.vue";
import { useSidebar } from "@/composables/useSidebar";
import {
  buildSidebarMenuGroups,
} from "@/config/sidebarMenu";
import { getDashboardPath, userHasAdminModuleAccess } from "@/config/roles";
import { useRoleCatalogStore } from "@/stores/roleCatalog";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const roleCatalog = useRoleCatalogStore();
const localeStore = useLocaleStore();

const { isExpanded, isMobileOpen, isHovered, openSubmenu } = useSidebar();

async function handleLogout() {
  await authStore.logout();
  isMobileOpen.value = false;
  router.replace({ name: "Signin" });
}

// Translation function
const t = (key) => localeStore.t(key);

const menuGroups = computed(() =>
  buildSidebarMenuGroups({
    role: authStore.role,
    user: authStore.user,
    t,
    hasPermission: (p) => authStore.hasPermission(p),
    hasAnyPermission: (keys) => authStore.hasAnyPermission(keys),
    userHasAdminModuleAccess,
    getDashboardPath,
    roleCatalogActiveRoles: roleCatalog.activeRoles,
  })
);

const isActive = (path) => route.path === path;

const toggleSubmenu = (groupIndex, itemIndex) => {
  const key = `${groupIndex}-${itemIndex}`;
  openSubmenu.value = openSubmenu.value === key ? null : key;
};

const isAnySubmenuRouteActive = computed(() => {
  return menuGroups.value.some((group) =>
    group.items.some(
      (item) =>
        item.subItems && item.subItems.some((subItem) => isActive(subItem.path))
    )
  );
});

const isSubmenuOpen = (groupIndex, itemIndex) => {
  const key = `${groupIndex}-${itemIndex}`;
  return (
    openSubmenu.value === key ||
    (isAnySubmenuRouteActive.value &&
      menuGroups.value[groupIndex].items[itemIndex].subItems?.some((subItem) =>
        isActive(subItem.path)
      ))
  );
};

const startTransition = (el) => {
  const htmlEl = el ;
  htmlEl.style.height = "auto";
  const height = htmlEl.scrollHeight;
  htmlEl.style.height = "0px";
  void htmlEl.offsetHeight; // force reflow
  htmlEl.style.height = height + "px";
};

const endTransition = (el) => {
  const htmlEl = el ;
  htmlEl.style.height = "";
};
</script>

