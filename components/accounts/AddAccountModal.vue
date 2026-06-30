<template>
  <div>
    <UButton icon="i-heroicons-plus" @click="isOpen = true">Add Account</UButton>

    <UModal v-model:open="isOpen" title="Add Account">
      <template #body>
        <div class="space-y-4 p-1">
          <div>
            <label class="block text-sm font-medium mb-1">Account Name</label>
            <UInput v-model="form.name" placeholder="e.g. My RRSP" />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Account Type</label>
            <USelect v-model="form.type" :items="ACCOUNT_TYPE_OPTIONS" class="w-full" />
          </div>

          <div v-if="showContributionRoom">
            <label class="block text-sm font-medium mb-1">Contribution Room ($)</label>
            <UInput v-model="form.contributionRoom" type="number" placeholder="e.g. 15000" />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Owner</label>
            <USelect v-model="form.ownerId" :items="ownerOptions" class="w-full" />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Institution</label>
            <USelect v-model="form.institutionId" :items="institutionOptions" class="w-full" />
          </div>
        </div>
      </template>

      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton variant="ghost" @click="close">Cancel</UButton>
          <UButton :loading="loading" @click="submit">Add Account</UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  owners: any[]
  institutions: any[]
}>()

const emit = defineEmits<{ added: [account: any] }>()

const isOpen = ref(false)
const loading = ref(false)

const ACCOUNT_TYPE_OPTIONS = [
  { label: 'RRSP', value: 'RRSP' },
  { label: 'TFSA', value: 'TFSA' },
  { label: 'RESP', value: 'RESP' },
  { label: 'Non-Registered', value: 'NON_REG' },
  { label: 'Cash', value: 'CASH' },
  { label: 'Crypto', value: 'CRYPTO' },
]

const form = reactive({ name: '', type: 'RRSP', contributionRoom: '', ownerId: '', institutionId: '' })
const showContributionRoom = computed(() => ['RRSP', 'TFSA'].includes(form.type))
const ownerOptions = computed(() => props.owners.map(o => ({ label: `${o.name} (${o.type})`, value: String(o.id) })))
const institutionOptions = computed(() => props.institutions.map(i => ({ label: i.name, value: String(i.id) })))

function close() {
  isOpen.value = false
  Object.assign(form, { name: '', type: 'RRSP', contributionRoom: '', ownerId: '', institutionId: '' })
}

async function submit() {
  if (!form.name || !form.ownerId || !form.institutionId) return
  loading.value = true
  try {
    const account = await $fetch('/api/accounts', {
      method: 'POST',
      body: {
        name: form.name,
        type: form.type,
        ownerId: Number(form.ownerId),
        institutionId: Number(form.institutionId),
        contributionRoom: form.contributionRoom ? Number(form.contributionRoom) : null
      }
    })
    emit('added', account)
    close()
  } finally {
    loading.value = false
  }
}
</script>
