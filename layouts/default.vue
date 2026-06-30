<template>
  <div class="flex h-screen bg-(--ui-bg) overflow-hidden">
    <!-- Mobile backdrop -->
    <div
      v-if="mobileNavOpen"
      class="fixed inset-0 z-40 bg-black/50 md:hidden"
      @click="mobileNavOpen = false"
    />

    <!-- Sidebar -->
    <aside
      class="fixed inset-y-0 left-0 z-50 w-60 bg-(--ui-bg-elevated) border-r border-(--ui-border) flex flex-col shrink-0 transition-transform duration-200 ease-in-out md:static md:translate-x-0"
      :class="mobileNavOpen ? 'translate-x-0' : '-translate-x-full'"
    >
      <!-- Logo -->
      <div class="h-16 flex items-center gap-3 px-5 border-b border-(--ui-border)">
        <UIcon name="i-heroicons-chart-pie" class="text-primary size-7" />
        <span class="font-bold text-base">Net Worth</span>
      </div>

      <!-- Nav -->
      <nav class="flex-1 p-3 space-y-0.5">
        <NuxtLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
          :class="isActive(item.to)
            ? 'bg-primary/10 text-primary'
            : 'text-(--ui-text-muted) hover:bg-(--ui-bg-accented) hover:text-(--ui-text)'"
          @click="mobileNavOpen = false"
        >
          <UIcon :name="item.icon" class="size-5 shrink-0" />
          {{ item.label }}
        </NuxtLink>
      </nav>

      <!-- Logout -->
      <div class="p-3 border-t border-(--ui-border)">
        <button
          class="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-(--ui-text-muted) hover:bg-(--ui-bg-accented) hover:text-(--ui-text) transition-colors"
          @click="logout"
        >
          <UIcon name="i-heroicons-arrow-right-on-rectangle" class="size-5 shrink-0" />
          Sign out
        </button>
      </div>
    </aside>

    <!-- Main column -->
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
      <!-- Mobile top bar -->
      <header
        class="md:hidden h-14 flex items-center gap-3 px-4 border-b border-(--ui-border) bg-(--ui-bg-elevated) shrink-0"
      >
        <button
          class="p-1.5 -ml-1.5 rounded-lg text-(--ui-text-muted) hover:bg-(--ui-bg-accented) hover:text-(--ui-text) transition-colors"
          aria-label="Open navigation menu"
          @click="mobileNavOpen = true"
        >
          <UIcon name="i-heroicons-bars-3" class="size-6" />
        </button>
        <UIcon name="i-heroicons-chart-pie" class="text-primary size-6" />
        <span class="font-bold text-base">Net Worth</span>
      </header>

      <!-- Main content -->
      <main class="flex-1 overflow-auto">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const { clear: clearSession } = useUserSession()

const mobileNavOpen = ref(false)
watch(() => route.path, () => { mobileNavOpen.value = false })

const navItems = [
  { label: 'Dashboard', icon: 'i-heroicons-home', to: '/' },
  { label: 'Accounts', icon: 'i-heroicons-building-library', to: '/accounts' },
  { label: 'Assets', icon: 'i-heroicons-home-modern', to: '/assets' },
  { label: 'Debts', icon: 'i-heroicons-credit-card', to: '/debts' },
  { label: 'History', icon: 'i-heroicons-chart-bar', to: '/history' },
  { label: 'Settings', icon: 'i-heroicons-cog-6-tooth', to: '/settings' },
]

function isActive(to: string) {
  if (to === '/') return route.path === '/'
  return route.path.startsWith(to)
}

async function logout() {
  await $fetch('/api/auth/logout', { method: 'POST' })
  await clearSession()
  await navigateTo('/login')
}
</script>
