<template>
  <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
    <UCard>
      <div class="flex items-center gap-3 mb-2">
        <UIcon name="i-heroicons-arrow-trending-up" class="size-5 text-green-500" />
        <p class="text-sm font-medium text-(--ui-text-muted)">Total Assets</p>
      </div>
      <p class="text-3xl font-bold text-green-600 dark:text-green-400">
        {{ formatCAD(data?.totalAssetsCAD ?? 0) }}
      </p>
    </UCard>

    <UCard>
      <div class="flex items-center gap-3 mb-2">
        <UIcon name="i-heroicons-arrow-trending-down" class="size-5 text-red-500" />
        <p class="text-sm font-medium text-(--ui-text-muted)">Total Liabilities</p>
      </div>
      <p class="text-3xl font-bold text-red-600 dark:text-red-400">
        {{ formatCAD(data?.totalLiabilitiesCAD ?? 0) }}
      </p>
    </UCard>

    <UCard>
      <div class="flex items-center gap-3 mb-2">
        <UIcon name="i-heroicons-scale" class="size-5 text-primary" />
        <p class="text-sm font-medium text-(--ui-text-muted)">Net Worth</p>
      </div>
      <p
        class="text-3xl font-bold"
        :class="(data?.netWorthCAD ?? 0) >= 0 ? 'text-primary' : 'text-red-600 dark:text-red-400'"
      >
        {{ formatCAD(data?.netWorthCAD ?? 0) }}
      </p>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import type { NetWorthData } from '~/types/netWorth'

defineProps<{ data: NetWorthData | null }>()

function formatCAD(v: number) {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency', currency: 'CAD', minimumFractionDigits: 0, maximumFractionDigits: 0
  }).format(v)
}
</script>
