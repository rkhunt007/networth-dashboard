<template>
  <div>
    <UButton icon="i-heroicons-plus" size="sm" variant="outline" @click="isOpen = true">
      Add Holding
    </UButton>

    <UModal v-model:open="isOpen" title="Add Holding">
      <template #body>
        <div class="space-y-4 p-1">
          <div class="relative">
            <label class="block text-sm font-medium mb-1">Symbol</label>
            <UInput
              v-model="symbolSearch"
              placeholder="e.g. VFV.TO or AAPL"
              autocomplete="off"
              @input="onSymbolInput"
            />
            <ul
              v-if="searchResults.length > 0"
              class="absolute z-50 mt-1 w-full border border-(--ui-border) rounded-lg bg-(--ui-bg) shadow-lg text-sm max-h-48 overflow-auto"
            >
              <li
                v-for="r in searchResults"
                :key="r.symbol"
                class="flex items-center justify-between px-3 py-2 hover:bg-(--ui-bg-accented) cursor-pointer"
                @click="selectSymbol(r)"
              >
                <span class="font-semibold">{{ r.symbol }}</span>
                <span class="text-(--ui-text-muted) truncate ml-2 text-xs">{{ r.name }}</span>
              </li>
            </ul>
          </div>

          <div v-if="form.symbol" class="text-sm bg-(--ui-bg-accented) rounded px-3 py-2">
            <span class="font-semibold">{{ form.symbol }}</span>
            <span v-if="form.name" class="text-(--ui-text-muted) ml-2">{{ form.name }}</span>
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Quick add crypto</label>
            <div class="flex flex-wrap gap-2">
              <UButton
                v-for="c in CRYPTO_OPTIONS"
                :key="c.symbol"
                size="xs"
                variant="soft"
                :color="form.symbol === c.symbol ? 'primary' : 'neutral'"
                @click="selectCrypto(c)"
              >
                {{ c.label }}
              </UButton>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">{{ isCrypto ? 'Number of Coins' : 'Number of Shares' }}</label>
            <UInput v-model="form.shares" type="number" step="0.00000001" placeholder="e.g. 0.5" />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Avg Cost per {{ isCrypto ? 'coin' : 'share' }} (optional)</label>
            <UInput v-model="form.acb" type="number" step="0.01" placeholder="e.g. 85.50" />
          </div>
        </div>
      </template>

      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton variant="ghost" @click="close">Cancel</UButton>
          <UButton :loading="loading" :disabled="!form.symbol || !form.shares" @click="submit">
            Add Holding
          </UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ accountId: number }>()
const emit = defineEmits<{ added: [holding: any] }>()

const isOpen = ref(false)
const loading = ref(false)
const symbolSearch = ref('')
const searchResults = ref<Array<{ symbol: string; name: string; exchange: string }>>([])
let debounceTimer: ReturnType<typeof setTimeout> | null = null

const form = reactive({ symbol: '', name: '', shares: '', acb: '' })

// Curated list of major cryptocurrencies (priced in CAD via Yahoo Finance)
const CRYPTO_OPTIONS = [
  { label: 'BTC', symbol: 'BTC-CAD', name: 'Bitcoin' },
  { label: 'ETH', symbol: 'ETH-CAD', name: 'Ethereum' },
  { label: 'SOL', symbol: 'SOL-CAD', name: 'Solana' },
  { label: 'XRP', symbol: 'XRP-CAD', name: 'XRP' },
  { label: 'ADA', symbol: 'ADA-CAD', name: 'Cardano' },
  { label: 'DOGE', symbol: 'DOGE-CAD', name: 'Dogecoin' },
  { label: 'DOT', symbol: 'DOT-CAD', name: 'Polkadot' },
  { label: 'LTC', symbol: 'LTC-CAD', name: 'Litecoin' },
]

const isCrypto = computed(() => /-(CAD|USD)$/.test(form.symbol) && CRYPTO_OPTIONS.some(c => c.symbol === form.symbol))

function selectCrypto(c: { symbol: string; name: string }) {
  form.symbol = c.symbol
  form.name = c.name
  symbolSearch.value = c.symbol
  searchResults.value = []
}

function onSymbolInput() {
  if (debounceTimer) clearTimeout(debounceTimer)
  form.symbol = ''
  if (!symbolSearch.value) { searchResults.value = []; return }
  debounceTimer = setTimeout(async () => {
    try {
      searchResults.value = await $fetch<any[]>('/api/search', { query: { q: symbolSearch.value } })
    } catch { searchResults.value = [] }
  }, 300)
}

function selectSymbol(r: { symbol: string; name: string }) {
  form.symbol = r.symbol
  form.name = r.name
  symbolSearch.value = r.symbol
  searchResults.value = []
}

function close() {
  isOpen.value = false
  Object.assign(form, { symbol: '', name: '', shares: '', acb: '' })
  symbolSearch.value = ''
  searchResults.value = []
}

async function submit() {
  if (!form.symbol || !form.shares) return
  loading.value = true
  try {
    const holding = await $fetch('/api/holdings', {
      method: 'POST',
      body: {
        symbol: form.symbol,
        name: form.name,
        shares: Number(form.shares),
        acb: form.acb ? Number(form.acb) : null,
        accountId: props.accountId
      }
    })
    emit('added', holding)
    close()
  } finally {
    loading.value = false
  }
}
</script>
