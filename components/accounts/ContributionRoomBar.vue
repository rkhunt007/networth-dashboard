<template>
  <div v-if="account.contributionRoom">
    <div class="flex justify-between text-sm mb-1.5">
      <span class="text-(--ui-text-muted)">Contribution Room</span>
      <span class="font-medium text-xs">
        {{ formatCAD(usedAmount) }} used / {{ formatCAD(account.contributionRoom) }} total
      </span>
    </div>
    <UProgress :value="usedPercent" color="primary" size="sm" />
    <p class="text-xs text-(--ui-text-muted) mt-1">
      <span :class="remainingRoom >= 0 ? 'text-green-600' : 'text-red-600'">
        {{ formatCAD(Math.abs(remainingRoom)) }} {{ remainingRoom >= 0 ? 'remaining' : 'over-contributed' }}
      </span>
    </p>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  account: { contributionRoom: number | null; totalCAD: number }
}>()

const usedAmount = computed(() => props.account.totalCAD)
const remainingRoom = computed(() => (props.account.contributionRoom ?? 0) - usedAmount.value)
const usedPercent = computed(() => {
  if (!props.account.contributionRoom) return 0
  return Math.min(100, Math.round((usedAmount.value / props.account.contributionRoom) * 100))
})

function formatCAD(v: number) {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency', currency: 'CAD', minimumFractionDigits: 0, maximumFractionDigits: 0
  }).format(v)
}
</script>
