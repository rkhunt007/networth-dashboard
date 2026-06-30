<template>
  <div
    class="grid grid-cols-1 gap-4"
    :class="owners.length >= 3 ? 'sm:grid-cols-2 lg:grid-cols-3' : owners.length === 2 ? 'sm:grid-cols-2' : ''"
  >
    <UCard v-for="owner in owners" :key="owner.ownerId">
      <div class="flex items-center gap-2 mb-4">
        <UBadge :label="owner.ownerType" variant="subtle" size="sm" />
        <span class="font-semibold">{{ owner.ownerName }}</span>
      </div>
      <div class="space-y-2 text-sm">
        <div class="flex justify-between">
          <span class="text-(--ui-text-muted)">Assets</span>
          <span class="font-medium text-green-600 dark:text-green-400">{{ formatCAD(owner.totalAssetsCAD) }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-(--ui-text-muted)">Liabilities</span>
          <span class="font-medium text-red-600 dark:text-red-400">{{ formatCAD(owner.totalLiabilitiesCAD) }}</span>
        </div>
        <div class="flex justify-between font-semibold border-t border-(--ui-border) pt-2 mt-2">
          <span>Net Worth</span>
          <span :class="owner.netWorthCAD >= 0 ? 'text-primary' : 'text-red-600'">
            {{ formatCAD(owner.netWorthCAD) }}
          </span>
        </div>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import type { NetWorthData } from '~/types/netWorth'

const props = defineProps<{ data: NetWorthData | null }>()
const owners = computed(() => props.data?.byOwner ?? [])

function formatCAD(v: number) {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency', currency: 'CAD', minimumFractionDigits: 0, maximumFractionDigits: 0
  }).format(v)
}
</script>
