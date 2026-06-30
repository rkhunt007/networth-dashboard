<template>
  <div>
    <UButton icon="i-heroicons-pencil-square" variant="outline" size="sm" @click="open">
      Edit
    </UButton>

    <UModal v-model:open="isOpen" title="Edit Account">
      <template #body>
        <div class="space-y-4 p-1">
          <div>
            <label class="block text-sm font-medium mb-1">Account Name</label>
            <UInput v-model="form.name" placeholder="e.g. My RRSP" class="w-full" />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Account Type</label>
            <USelect v-model="form.type" :items="ACCOUNT_TYPE_OPTIONS" class="w-full" />
          </div>

          <div v-if="showContributionRoom">
            <label class="block text-sm font-medium mb-1">Contribution Room ($)</label>
            <UInput v-model="form.contributionRoom" type="number" placeholder="e.g. 15000" class="w-full" />
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
          <UButton variant="ghost" @click="isOpen = false">Cancel</UButton>
          <UButton :loading="loading" @click="submit">Save Changes</UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  account: any
  owners: any[]
  institutions: any[]
}>()

const emit = defineEmits<{ updated: [account: any] }>()

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

function open() {
  form.name = props.account.name ?? ''
  form.type = props.account.type ?? 'RRSP'
  form.contributionRoom = props.account.contributionRoom != null ? String(props.account.contributionRoom) : ''
  form.ownerId = String(props.account.ownerId ?? '')
  form.institutionId = String(props.account.institutionId ?? '')
  isOpen.value = true
}

async function submit() {
  if (!form.name || !form.ownerId || !form.institutionId) return
  loading.value = true
  try {
    const account = await $fetch(`/api/accounts/${props.account.id}`, {
      method: 'PUT',
      body: {
        name: form.name,
        type: form.type,
        ownerId: Number(form.ownerId),
        institutionId: Number(form.institutionId),
        contributionRoom: showContributionRoom.value && form.contributionRoom ? Number(form.contributionRoom) : null
      }
    })
    emit('updated', account)
    isOpen.value = false
  } finally {
    loading.value = false
  }
}
</script>
