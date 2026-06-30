<template>
  <div>
    <UButton icon="i-heroicons-plus" @click="isOpen = true">Add Asset</UButton>

    <UModal v-model:open="isOpen" title="Add Manual Asset">
      <template #body>
        <div class="space-y-4 p-1">
          <div>
            <label class="block text-sm font-medium mb-1">Asset Name</label>
            <UInput v-model="form.name" placeholder="e.g. Primary Residence" />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Asset Type</label>
            <USelect v-model="form.type" :items="ASSET_TYPE_OPTIONS" class="w-full" />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Current Value</label>
            <UInput v-model="form.value" type="number" step="1" placeholder="e.g. 800000" />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Currency</label>
            <USelect v-model="form.currency" :items="CURRENCY_OPTIONS" class="w-full" />
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
          <UButton :loading="loading" @click="submit">Add Asset</UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ owners: any[] }>()
const emit = defineEmits<{ added: [asset: any] }>()

const isOpen = ref(false)
const loading = ref(false)

const ASSET_TYPE_OPTIONS = [
  { label: 'Home / Real Estate', value: 'HOME' },
  { label: 'Vehicle', value: 'VEHICLE' },
  { label: 'Pension', value: 'PENSION' },
  { label: 'Investment Property', value: 'INVESTMENT_PROPERTY' },
  { label: 'Other', value: 'OTHER' },
]

const CURRENCY_OPTIONS = [
  { label: 'CAD', value: 'CAD' },
  { label: 'USD', value: 'USD' },
]

const form = reactive({ name: '', type: 'HOME', value: '', currency: 'CAD', ownerId: '' })
const ownerOptions = computed(() => props.owners.map(o => ({ label: `${o.name} (${o.type})`, value: String(o.id) })))

function close() {
  isOpen.value = false
  Object.assign(form, { name: '', type: 'HOME', value: '', currency: 'CAD', ownerId: '' })
}

async function submit() {
  if (!form.name || !form.value || !form.ownerId) return
  loading.value = true
  try {
    const asset = await $fetch('/api/manual-assets', {
      method: 'POST',
      body: { name: form.name, type: form.type, value: Number(form.value), currency: form.currency, ownerId: Number(form.ownerId) }
    })
    emit('added', asset)
    close()
  } finally {
    loading.value = false
  }
}
</script>
