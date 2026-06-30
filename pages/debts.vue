<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold">Debts</h1>
        <p class="text-sm text-(--ui-text-muted) mt-0.5">Mortgages, loans, lines of credit</p>
      </div>
      <DebtsAddDebtModal :owners="owners ?? []" @added="refresh()" />
    </div>

    <UCard>
      <div v-if="!debts?.length" class="text-center py-16 text-(--ui-text-muted)">
        <UIcon name="i-heroicons-credit-card" class="size-12 opacity-30 mb-3" />
        <p class="font-medium">No debts recorded</p>
        <p class="text-sm mt-1">Add mortgages, car loans, or other liabilities.</p>
      </div>

      <div v-else class="divide-y divide-(--ui-border)">
        <div
          v-for="debt in debts"
          :key="debt.id"
          class="flex items-center justify-between py-3"
        >
          <div class="flex items-center gap-3">
            <UIcon name="i-heroicons-credit-card" class="size-5 text-red-400" />
            <div>
              <p class="font-medium">{{ debt.name }}</p>
              <p class="text-sm text-(--ui-text-muted)">
                {{ debt.owner.name }} · {{ DEBT_LABELS[debt.type] ?? debt.type }}
                <span v-if="debt.interestRate" class="ml-1 text-amber-600 font-medium">
                  {{ debt.interestRate }}%
                </span>
              </p>
            </div>
          </div>
          <div class="flex items-center gap-4">
            <div class="text-right">
              <p class="font-semibold text-red-600 dark:text-red-400">{{ fmt(debt.balance, debt.currency) }}</p>
              <UBadge v-if="debt.currency === 'USD'" label="USD" variant="subtle" size="xs" />
            </div>
            <UButton icon="i-heroicons-trash" variant="ghost" size="xs" color="error" @click="del(debt.id)" />
          </div>
        </div>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
const { data: debts, refresh } = await useFetch<any[]>('/api/debts')
const { data: owners } = await useFetch<any[]>('/api/owners')

const DEBT_LABELS: Record<string, string> = {
  MORTGAGE: 'Mortgage', CAR_LOAN: 'Car Loan', STUDENT_LOAN: 'Student Loan',
  CREDIT_CARD: 'Credit Card', LOC: 'Line of Credit', HELOC: 'HELOC', OTHER: 'Other'
}

async function del(id: number) {
  await $fetch(`/api/debts/${id}`, { method: 'DELETE' })
  await refresh()
}

function fmt(v: number, currency: string) {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency', currency, minimumFractionDigits: 0, maximumFractionDigits: 0
  }).format(v)
}
</script>
