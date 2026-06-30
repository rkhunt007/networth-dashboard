<template>
  <div class="flex h-screen items-center justify-center bg-(--ui-bg) p-4">
    <UCard class="w-full max-w-sm">
      <template #header>
        <div class="flex items-center gap-3">
          <UIcon name="i-heroicons-chart-pie" class="text-primary size-7" />
          <span class="font-bold text-lg">Net Worth</span>
        </div>
      </template>

      <form class="space-y-4" @submit.prevent="onSubmit">
        <UFormField label="Password">
          <UInput
            v-model="password"
            type="password"
            placeholder="Enter password"
            class="w-full"
            autofocus
          />
        </UFormField>
        <p v-if="error" class="text-sm text-red-500">{{ error }}</p>
        <UButton type="submit" block :loading="loading">Sign in</UButton>
      </form>
    </UCard>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

const password = ref('')
const error = ref('')
const loading = ref(false)
const { fetch: refreshSession } = useUserSession()

async function onSubmit() {
  loading.value = true
  error.value = ''
  try {
    await $fetch('/api/auth/login', {
      method: 'POST',
      body: { password: password.value },
    })
    await refreshSession()
    await navigateTo('/')
  } catch (e: any) {
    error.value = e?.data?.message || 'Invalid password'
  } finally {
    loading.value = false
  }
}
</script>
