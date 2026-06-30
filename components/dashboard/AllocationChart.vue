<template>
  <UCard>
    <template #header>
      <p class="font-semibold">Asset Allocation</p>
    </template>
    <ClientOnly>
      <apexchart
        v-if="series.length > 0"
        type="donut"
        height="320"
        :options="chartOptions"
        :series="series"
      />
      <div v-else class="h-80 flex items-center justify-center text-(--ui-text-muted) text-sm">
        No asset data — add accounts or assets first
      </div>
    </ClientOnly>
  </UCard>
</template>

<script setup lang="ts">
import type { NetWorthData } from '~/types/netWorth'

const props = defineProps<{ data: NetWorthData | null }>()

const TYPE_LABELS: Record<string, string> = {
  RRSP: 'RRSP', TFSA: 'TFSA', RESP: 'RESP',
  NON_REG: 'Non-Registered',
  CASH: 'Cash',
  CRYPTO: 'Crypto',
  MANUAL_ASSETS: 'Other Assets'
}

const chartData = computed(() => {
  const byType = props.data?.byAccountType ?? {}
  const entries = Object.entries(byType)
    .filter(([, v]) => (v as number) > 0)
    .sort((a, b) => (b[1] as number) - (a[1] as number))
  return {
    labels: entries.map(([k]) => TYPE_LABELS[k] ?? k),
    series: entries.map(([, v]) => Math.round(v as number))
  }
})

const series = computed(() => chartData.value.series)

const chartOptions = computed(() => ({
  labels: chartData.value.labels,
  chart: { type: 'donut' },
  legend: { position: 'bottom' as const },
  dataLabels: { enabled: false },
  plotOptions: {
    pie: {
      donut: {
        labels: {
          show: true,
          total: {
            show: true,
            label: 'Total Assets',
            formatter: (w: any) => {
              const total = w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0)
              return new Intl.NumberFormat('en-CA', {
                style: 'currency', currency: 'CAD',
                notation: 'compact', minimumFractionDigits: 0
              }).format(total)
            }
          }
        }
      }
    }
  }
}))
</script>
