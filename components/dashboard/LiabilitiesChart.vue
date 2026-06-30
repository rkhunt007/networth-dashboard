<template>
  <UCard>
    <template #header>
      <p class="font-semibold">Liabilities by Type</p>
    </template>
    <ClientOnly>
      <apexchart
        v-if="series[0].data.length > 0"
        type="bar"
        height="320"
        :options="chartOptions"
        :series="series"
      />
      <div v-else class="h-80 flex items-center justify-center text-(--ui-text-muted) text-sm">
        No debt data
      </div>
    </ClientOnly>
  </UCard>
</template>

<script setup lang="ts">
import type { NetWorthData } from '~/types/netWorth'

const props = defineProps<{ data: NetWorthData | null }>()

const TYPE_LABELS: Record<string, string> = {
  MORTGAGE: 'Mortgage', CAR_LOAN: 'Car Loan', STUDENT_LOAN: 'Student Loan',
  CREDIT_CARD: 'Credit Card', LOC: 'Line of Credit', HELOC: 'HELOC', OTHER: 'Other'
}

const chartData = computed(() => {
  const byType = props.data?.byDebtType ?? {}
  const entries = Object.entries(byType)
    .filter(([, v]) => (v as number) > 0)
    .sort((a, b) => (b[1] as number) - (a[1] as number))
  return {
    categories: entries.map(([k]) => TYPE_LABELS[k] ?? k),
    data: entries.map(([, v]) => Math.round(v as number))
  }
})

const series = computed(() => [{ name: 'Balance (CAD)', data: chartData.value.data }])

const chartOptions = computed(() => ({
  chart: { type: 'bar' as const, toolbar: { show: false } },
  xaxis: { categories: chartData.value.categories },
  colors: ['#ef4444'],
  dataLabels: { enabled: false },
  plotOptions: { bar: { horizontal: true, borderRadius: 4 } },
  xaxis_labels: {
    formatter: (v: number) => new Intl.NumberFormat('en-CA', {
      style: 'currency', currency: 'CAD', notation: 'compact', minimumFractionDigits: 0
    }).format(v)
  }
}))
</script>
