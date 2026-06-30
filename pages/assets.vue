<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold">Manual Assets</h1>
        <p class="text-sm text-(--ui-text-muted) mt-0.5">Home equity, vehicles, pensions, and other assets</p>
      </div>
      <AssetsAddManualAssetModal :owners="owners ?? []" @added="refresh()" />
    </div>

    <UCard>
      <div v-if="!assets?.length" class="text-center py-16 text-(--ui-text-muted)">
        <UIcon name="i-heroicons-home-modern" class="size-12 opacity-30 mb-3" />
        <p class="font-medium">No assets recorded</p>
        <p class="text-sm mt-1">Add home equity, vehicles, pensions, or other assets.</p>
      </div>

      <div v-else class="divide-y divide-(--ui-border)">
        <div
          v-for="asset in assets"
          :key="asset.id"
          class="flex items-center justify-between py-3"
        >
          <div class="flex items-center gap-3">
            <UIcon :name="ASSET_ICONS[asset.type] ?? 'i-heroicons-cube'" class="size-5 text-(--ui-text-muted)" />
            <div>
              <p class="font-medium">{{ asset.name }}</p>
              <p class="text-sm text-(--ui-text-muted)">
                {{ asset.owner.name }} · {{ ASSET_LABELS[asset.type] ?? asset.type }}
              </p>
            </div>
          </div>
          <div class="flex items-center gap-4">
            <div class="text-right">
              <p class="font-semibold">{{ fmt(asset.value, asset.currency) }}</p>
              <UBadge v-if="asset.currency === 'USD'" label="USD" variant="subtle" size="xs" />
            </div>
            <UButton icon="i-heroicons-trash" variant="ghost" size="xs" color="error" @click="del(asset.id)" />
          </div>
        </div>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
const { data: assets, refresh } = await useFetch<any[]>('/api/manual-assets')
const { data: owners } = await useFetch<any[]>('/api/owners')

const ASSET_LABELS: Record<string, string> = {
  HOME: 'Home / Real Estate', VEHICLE: 'Vehicle', PENSION: 'Pension',
  INVESTMENT_PROPERTY: 'Investment Property', OTHER: 'Other'
}
const ASSET_ICONS: Record<string, string> = {
  HOME: 'i-heroicons-home-modern', VEHICLE: 'i-heroicons-truck',
  PENSION: 'i-heroicons-banknotes', INVESTMENT_PROPERTY: 'i-heroicons-building-office-2',
  OTHER: 'i-heroicons-cube'
}

async function del(id: number) {
  await $fetch(`/api/manual-assets/${id}`, { method: 'DELETE' })
  await refresh()
}

function fmt(v: number, currency: string) {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency', currency, minimumFractionDigits: 0, maximumFractionDigits: 0
  }).format(v)
}
</script>
