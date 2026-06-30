<template>
  <UCard>
    <template #header>
      <p class="font-semibold">Net Worth History</p>
    </template>
    <ClientOnly>
      <apexchart
        v-if="series[0].data.length > 1"
        type="area"
        height="320"
        :options="chartOptions"
        :series="series"
      />
      <div v-else class="h-80 flex flex-col items-center justify-center text-(--ui-text-muted) text-sm gap-2">
        <UIcon name="i-heroicons-camera" class="size-8 opacity-40" />
        <p>Save snapshots over time to see your net worth history</p>
      </div>
    </ClientOnly>
  </UCard>
</template>

<script setup lang="ts">
const props = defineProps<{
  snapshots: Array<{ date: string; totalCAD: number }>
}>()

const series = computed(() => [{
  name: 'Net Worth (CAD)',
  data: props.snapshots.map(s => ({ x: new Date(s.date).getTime(), y: Math.round(s.totalCAD) }))
}])

const chartOptions = {
  chart: { type: 'area' as const, toolbar: { show: false }, zoom: { enabled: false } },
  stroke: { curve: 'smooth' as const },
  fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.05 } },
  xaxis: { type: 'datetime' as const, labels: { datetimeUTC: false } },
  yaxis: {
    labels: {
      formatter: (v: number) => new Intl.NumberFormat('en-CA', {
        style: 'currency', currency: 'CAD', notation: 'compact', minimumFractionDigits: 0
      }).format(v)
    }
  },
  tooltip: { x: { format: 'MMM dd, yyyy' } },
  dataLabels: { enabled: false }
}
</script>
