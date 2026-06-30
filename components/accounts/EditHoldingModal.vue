<template>
  <div>
    <UButton icon="i-heroicons-pencil-square" variant="ghost" size="xs" @click="open" />

    <UModal v-model:open="isOpen" :title="`Edit ${holding.symbol}`">
      <template #body>
        <div class="space-y-4 p-1">
          <div v-if="holding.name" class="text-sm bg-(--ui-bg-accented) rounded px-3 py-2">
            <span class="font-semibold">{{ holding.symbol }}</span>
            <span class="text-(--ui-text-muted) ml-2">{{ holding.name }}</span>
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Number of Shares</label>
            <UInput v-model="form.shares" type="number" step="0.0001" placeholder="e.g. 10.5" class="w-full" />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Avg Cost Base per share (optional)</label>
            <UInput v-model="form.acb" type="number" step="0.01" placeholder="e.g. 85.50" class="w-full" />
          </div>
        </div>
      </template>

      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton variant="ghost" @click="isOpen = false">Cancel</UButton>
          <UButton :loading="loading" :disabled="!form.shares" @click="submit">Save</UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ holding: any }>()
const emit = defineEmits<{ updated: [holding: any] }>()

const isOpen = ref(false)
const loading = ref(false)
const form = reactive({ shares: '', acb: '' })

function open() {
  form.shares = String(props.holding.shares ?? '')
  form.acb = props.holding.acb != null ? String(props.holding.acb) : ''
  isOpen.value = true
}

async function submit() {
  if (!form.shares) return
  loading.value = true
  try {
    const holding = await $fetch(`/api/holdings/${props.holding.id}`, {
      method: 'PUT',
      body: {
        shares: Number(form.shares),
        acb: form.acb ? Number(form.acb) : null
      }
    })
    emit('updated', holding)
    isOpen.value = false
  } finally {
    loading.value = false
  }
}
</script>
