export const usePrices = () => {
  const isRefreshing = ref(false)
  const lastUpdated = ref<Date | null>(null)

  async function refreshPrices() {
    isRefreshing.value = true
    try {
      await $fetch('/api/prices/refresh', { method: 'POST' })
      lastUpdated.value = new Date()
    } finally {
      isRefreshing.value = false
    }
  }

  return { isRefreshing, lastUpdated, refreshPrices }
}
