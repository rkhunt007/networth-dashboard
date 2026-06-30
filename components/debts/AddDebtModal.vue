<template>
  <div>
    <UButton icon="i-heroicons-plus" @click="isOpen = true">Add Debt</UButton>

    <UModal v-model:open="isOpen" title="Add Debt">
      <template #body>
        <div class="space-y-4 p-1">
          <div>
            <label class="block text-sm font-medium mb-1">Debt Name</label>
            <UInput v-model="form.name" placeholder="e.g. Primary Mortgage" />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Debt Type</label>
            <USelect v-model="form.type" :items="DEBT_TYPE_OPTIONS" class="w-full" />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Current Balance</label>
            <UInput v-model="form.balance" type="number" step="1" placeholder="e.g. 400000" />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Currency</label>
            <USelect v-model="form.currency" :items="CURRENCY_OPTIONS" class="w-full" />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Interest Rate % (optional)</label>
            <UInput v-model="form.interestRate" type="number" step="0.01" placeholder="e.g. 4.5" />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Owner</label>
            <USelect v-model="form.ownerId" :items="ownerOptions" class="w-full" />
          </div>
        </div>
      </template>

      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton variant="ghost" @click="close">Cancel</UButton>
          <UButton :loading="loading" @click="submit">Add Debt</UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ owners: any[] }>()
const emit = defineEmits<{ added: [debt: any] }>()

const isOpen = ref(false)
const loading = ref(false)

const DEBT_TYPE_OPTIONS = [
  { label: 'Mortgage', value: 'MORTGAGE' },
  { label: 'Car Loan', value: 'CAR_LOAN' },
  { label: 'Student Loan', value: 'STUDENT_LOAN' },
  { label: 'Credit Card', value: 'CREDIT_CARD' },
  { label: 'Line of Credit', value: 'LOC' },
  { label: 'HELOC', value: 'HELOC' },
  { label: 'Other', value: 'OTHER' },
]

const CURRENCY_OPTIONS = [
  { label: 'CAD', value: 'CAD' },
  { label: 'USD', value: 'USD' },
]

const form = reactive({ name: '', type: 'MORTGAGE', balance: '', currency: 'CAD', interestRate: '', ownerId: '' })
const ownerOptions = computed(() => props.owners.map(o => ({ label: `${o.name} (${o.type})`, value: String(o.id) })))

function close() {
  isOpen.value = false
  Object.assign(form, { name: '', type: 'MORTGAGE', balance: '', currency: 'CAD', interestRate: '', ownerId: '' })
}

async function submit() {
  if (!form.name || !form.balance || !form.ownerId) return
  loading.value = true
  try {
    const debt = await $fetch('/api/debts', {
      method: 'POST',
      body: {
        name: form.name, type: form.type, balance: Number(form.balance), currency: form.currency,
        interestRate: form.interestRate ? Number(form.interestRate) : null, ownerId: Number(form.ownerId)
      }
    })
    emit('added', debt)
    close()
  } finally {
    loading.value = false
  }
}
</script>
