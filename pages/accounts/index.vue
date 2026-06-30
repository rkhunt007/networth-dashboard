<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">Accounts</h1>
      <AccountsAddAccountModal
        :owners="owners ?? []"
        :institutions="institutions ?? []"
        @added="refresh()"
      />
    </div>

    <div v-if="pending" class="text-center py-12 text-(--ui-text-muted)">Loading…</div>

    <template v-else>
      <div v-if="!accounts?.length" class="text-center py-16 text-(--ui-text-muted)">
        <UIcon name="i-heroicons-building-library" class="size-12 opacity-30 mb-3" />
        <p class="font-medium">No accounts yet</p>
        <p class="text-sm mt-1">Add owners and institutions in Settings first, then add accounts here.</p>
      </div>

      <div v-for="owner in ownerGroups" :key="owner.id" class="mb-8">
        <h2 class="flex items-center gap-2 text-sm font-semibold text-(--ui-text-muted) mb-3">
          <UBadge :label="owner.type" variant="subtle" size="sm" />
          {{ owner.name }}
          <span class="text-xs font-normal">({{ owner.accounts.length }} account{{ owner.accounts.length !== 1 ? 's' : '' }})</span>
        </h2>

        <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <NuxtLink
            v-for="account in owner.accounts"
            :key="account.id"
            :to="`/accounts/${account.id}`"
          >
            <UCard class="hover:ring-2 hover:ring-primary/30 transition-all cursor-pointer h-full">
              <div class="flex items-start justify-between">
                <div class="flex items-center gap-2">
                  <div class="size-3 rounded-full shrink-0 mt-0.5" :style="{ backgroundColor: account.institution.color }" />
                  <div>
                    <p class="font-semibold text-sm">{{ account.name }}</p>
                    <p class="text-xs text-(--ui-text-muted)">{{ account.institution.name }}</p>
                  </div>
                </div>
                <UBadge :label="account.type" variant="subtle" size="xs" />
              </div>
              <p class="text-xs text-(--ui-text-muted) mt-3">
                {{ account.holdings.length }} holding{{ account.holdings.length !== 1 ? 's' : '' }}
              </p>
            </UCard>
          </NuxtLink>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
const { data: accounts, pending, refresh } = await useFetch<any[]>('/api/accounts')
const { data: owners } = await useFetch<any[]>('/api/owners')
const { data: institutions } = await useFetch<any[]>('/api/institutions')

const ownerGroups = computed(() =>
  (owners.value ?? []).map(o => ({
    ...o,
    accounts: (accounts.value ?? []).filter(a => a.ownerId === o.id)
  }))
)
</script>
