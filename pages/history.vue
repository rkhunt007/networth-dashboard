<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">Net Worth History</h1>
      <UButton icon="i-heroicons-camera" :loading="saving" @click="saveSnapshot">
        Save Snapshot
      </UButton>
    </div>

    <DashboardHistoryChart :snapshots="chartSnapshots" class="mb-6" />

    <UCard>
      <template #header><p class="font-semibold">Snapshots</p></template>
      <div v-if="!snapshots?.length" class="text-center py-10 text-(--ui-text-muted) text-sm">
        No snapshots yet. Click "Save Snapshot" to record today's net worth.
      </div>
      <div v-else class="overflow-x-auto">
        <UTable
          :data="tableRows"
          :columns="columns"
          class="min-w-[36rem]"
        />
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
const { data: snapshots, refresh } = await useFetch<any[]>('/api/snapshots')
const toast = useToast()
const saving = ref(false)

const chartSnapshots = computed(() =>
  (snapshots.value ?? []).map(s => ({ date: s.date, totalCAD: s.totalCAD }))
)

const tableRows = computed(() =>
  [...(snapshots.value ?? [])].reverse().map(s => ({
    ...s,
    displayDate: new Date(s.date).toLocaleDateString('en-CA', {
      year: 'numeric', month: 'short', day: 'numeric'
    })
  }))
)

const columns = [
  { accessorKey: 'displayDate', header: 'Date' },
  {
    accessorKey: 'totalCAD',
    header: 'Net Worth (CAD)',
    cell: ({ getValue }: any) => new Intl.NumberFormat('en-CA', {
      style: 'currency', currency: 'CAD', minimumFractionDigits: 0, maximumFractionDigits: 0
    }).format(getValue())
  }
]

async function saveSnapshot() {
  saving.value = true
  try {
    const nw = await $fetch<any>('/api/net-worth')
    await $fetch('/api/snapshots', { method: 'POST', body: { totalCAD: nw.netWorthCAD, dataJson: nw } })
    toast.add({ title: 'Snapshot saved', color: 'success' })
    await refresh()
  } finally { saving.value = false }
}
</script>
