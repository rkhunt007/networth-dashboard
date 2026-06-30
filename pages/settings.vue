<template>
  <div class="p-6 max-w-2xl">
    <h1 class="text-2xl font-bold mb-6">Settings</h1>

    <!-- Owners -->
    <UCard class="mb-6">
      <template #header>
        <div class="flex items-center justify-between">
          <p class="font-semibold">Owners</p>
          <UButton icon="i-heroicons-plus" size="sm" variant="outline" @click="showOwnerForm = !showOwnerForm">
            Add Owner
          </UButton>
        </div>
      </template>

      <div v-if="showOwnerForm" class="mb-4 p-4 bg-(--ui-bg-accented) rounded-lg">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <div>
            <label class="block text-xs font-medium mb-1 text-(--ui-text-muted)">Name</label>
            <UInput v-model="ownerForm.name" placeholder="e.g. Jane" />
          </div>
          <div>
            <label class="block text-xs font-medium mb-1 text-(--ui-text-muted)">Type</label>
            <USelect v-model="ownerForm.type" :items="OWNER_TYPE_OPTIONS" />
          </div>
        </div>
        <div class="flex gap-2 justify-end">
          <UButton variant="ghost" size="sm" @click="showOwnerForm = false">Cancel</UButton>
          <UButton size="sm" :loading="savingOwner" @click="addOwner">Add</UButton>
        </div>
      </div>

      <div v-if="!owners?.length" class="text-center py-6 text-sm text-(--ui-text-muted)">
        No owners yet.
      </div>

      <div v-else class="divide-y divide-(--ui-border)">
        <div v-for="o in owners" :key="o.id" class="flex items-center justify-between py-2.5">
          <div class="flex items-center gap-2">
            <UBadge :label="o.type" variant="subtle" size="sm" />
            <span class="font-medium text-sm">{{ o.name }}</span>
          </div>
          <UButton icon="i-heroicons-trash" variant="ghost" size="xs" color="error" @click="delOwner(o.id)" />
        </div>
      </div>
    </UCard>

    <!-- Institutions -->
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <p class="font-semibold">Financial Institutions</p>
          <UButton icon="i-heroicons-plus" size="sm" variant="outline" @click="showInstForm = !showInstForm">
            Add Institution
          </UButton>
        </div>
      </template>

      <div v-if="showInstForm" class="mb-4 p-4 bg-(--ui-bg-accented) rounded-lg">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <div>
            <label class="block text-xs font-medium mb-1 text-(--ui-text-muted)">Name</label>
            <UInput v-model="instForm.name" placeholder="e.g. TD Bank" />
          </div>
          <div>
            <label class="block text-xs font-medium mb-1 text-(--ui-text-muted)">Color</label>
            <input type="color" v-model="instForm.color" class="w-full h-9 rounded-md border border-(--ui-border) cursor-pointer px-1" />
          </div>
        </div>
        <div class="flex gap-2 justify-end">
          <UButton variant="ghost" size="sm" @click="showInstForm = false">Cancel</UButton>
          <UButton size="sm" :loading="savingInst" @click="addInstitution">Add</UButton>
        </div>
      </div>

      <div v-if="!institutions?.length" class="text-center py-6 text-sm text-(--ui-text-muted)">
        No institutions yet.
      </div>

      <div v-else class="divide-y divide-(--ui-border)">
        <div v-for="i in institutions" :key="i.id" class="flex items-center justify-between py-2.5">
          <div class="flex items-center gap-3">
            <div class="size-4 rounded-full shrink-0" :style="{ backgroundColor: i.color }" />
            <span class="font-medium text-sm">{{ i.name }}</span>
          </div>
          <UButton icon="i-heroicons-trash" variant="ghost" size="xs" color="error" @click="delInstitution(i.id)" />
        </div>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
const { data: owners, refresh: reloadOwners } = await useFetch<any[]>('/api/owners')
const { data: institutions, refresh: reloadInst } = await useFetch<any[]>('/api/institutions')

const OWNER_TYPE_OPTIONS = [
  { label: 'Self', value: 'SELF' },
  { label: 'Spouse', value: 'SPOUSE' },
  { label: 'Joint', value: 'JOINT' },
]

const showOwnerForm = ref(false)
const showInstForm = ref(false)
const savingOwner = ref(false)
const savingInst = ref(false)

const ownerForm = reactive({ name: '', type: 'SELF' })
const instForm = reactive({ name: '', color: '#3B82F6' })

async function addOwner() {
  if (!ownerForm.name) return
  savingOwner.value = true
  try {
    await $fetch('/api/owners', { method: 'POST', body: { name: ownerForm.name, type: ownerForm.type } })
    Object.assign(ownerForm, { name: '', type: 'SELF' })
    showOwnerForm.value = false
    await reloadOwners()
  } finally { savingOwner.value = false }
}

async function delOwner(id: number) {
  await $fetch(`/api/owners/${id}`, { method: 'DELETE' })
  await reloadOwners()
}

async function addInstitution() {
  if (!instForm.name) return
  savingInst.value = true
  try {
    await $fetch('/api/institutions', { method: 'POST', body: { name: instForm.name, color: instForm.color } })
    Object.assign(instForm, { name: '', color: '#3B82F6' })
    showInstForm.value = false
    await reloadInst()
  } finally { savingInst.value = false }
}

async function delInstitution(id: number) {
  await $fetch(`/api/institutions/${id}`, { method: 'DELETE' })
  await reloadInst()
}
</script>
