<template>
  <div class="p-6">
    <!-- Header -->
    <div class="flex flex-wrap items-center justify-between gap-3 mb-6">
      <div>
        <h1 class="text-2xl font-bold">Dashboard</h1>
        <p v-if="exchangeRate?.rate" class="text-xs text-(--ui-text-muted) mt-0.5">
          USD/CAD: {{ exchangeRate.rate.toFixed(4) }}
        </p>
      </div>
      <div class="flex flex-wrap items-center gap-3">
        <span v-if="priceUpdateTime" class="text-xs text-(--ui-text-muted)">
          Prices: {{ relativeTime(priceUpdateTime) }}
        </span>
        <UButton
          :loading="isRefreshing"
          icon="i-heroicons-arrow-path"
          variant="outline"
          size="sm"
          @click="handleRefresh"
        >
          Refresh Prices
        </UButton>
        <UButton
          icon="i-heroicons-camera"
          size="sm"
          :loading="savingSnapshot"
          @click="saveSnapshot"
        >
          Save Snapshot
        </UButton>
      </div>
    </div>

    <!-- Missing prices warning -->
    <UAlert
      v-if="missingPrices.length > 0"
      color="warning"
      icon="i-heroicons-exclamation-triangle"
      class="mb-6"
      :title="`Prices missing for: ${missingPrices.join(', ')}`"
      description="Click 'Refresh Prices' to fetch current market prices."
    />

    <div v-if="pending" class="flex items-center justify-center h-64 text-(--ui-text-muted)">
      Calculating net worth…
    </div>

    <template v-else-if="netWorthData">
      <DashboardNetWorthSummary :data="netWorthData" class="mb-6" />

      <div class="mb-6">
        <h2 class="text-base font-semibold mb-3 text-(--ui-text-muted)">By Owner</h2>
        <DashboardOwnerBreakdown :data="netWorthData" />
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <DashboardAllocationChart :data="netWorthData" />
        <DashboardLiabilitiesChart :data="netWorthData" />
      </div>

      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <p class="font-semibold">All Accounts</p>
            <UButton to="/accounts" variant="link" size="sm">Manage →</UButton>
          </div>
        </template>
        <div class="overflow-x-auto">
          <UTable :data="netWorthData.accounts" :columns="accountColumns" />
        </div>
      </UCard>
    </template>
  </div>
</template>

<script setup lang="ts">
const { data: netWorthData, pending, refresh: refreshNetWorth } = useNetWorth()
const { isRefreshing, lastUpdated: priceUpdateTime, refreshPrices } = usePrices()
const { data: exchangeRate } = useFetch('/api/exchange-rate')
const toast = useToast()
const savingSnapshot = ref(false)

const missingPrices = computed(() => netWorthData.value?.missingPrices ?? [])

const accountColumns = [
  { accessorKey: 'ownerName', header: 'Owner' },
  { accessorKey: 'institutionName', header: 'Institution' },
  { accessorKey: 'name', header: 'Account' },
  { accessorKey: 'type', header: 'Type' },
  {
    accessorKey: 'totalCAD',
    header: 'Balance (CAD)',
    cell: ({ getValue }: any) => new Intl.NumberFormat('en-CA', {
      style: 'currency', currency: 'CAD', minimumFractionDigits: 0, maximumFractionDigits: 0
    }).format(getValue())
  }
]

async function handleRefresh() {
  await refreshPrices()
  await refreshNetWorth()
  toast.add({ title: 'Prices refreshed successfully', color: 'success' })
}

async function saveSnapshot() {
  if (!netWorthData.value) return
  savingSnapshot.value = true
  try {
    await $fetch('/api/snapshots', {
      method: 'POST',
      body: { totalCAD: netWorthData.value.netWorthCAD, dataJson: netWorthData.value }
    })
    toast.add({ title: 'Snapshot saved', color: 'success' })
  } finally {
    savingSnapshot.value = false
  }
}

function relativeTime(d: Date) {
  const diff = Date.now() - d.getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  return `${Math.floor(m / 60)}h ago`
}
</script>
