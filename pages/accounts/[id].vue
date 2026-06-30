<template>
  <div class="p-6">
    <div class="flex flex-wrap items-center gap-3 mb-6">
      <UButton to="/accounts" icon="i-heroicons-arrow-left" variant="ghost" size="sm" />
      <div class="flex-1 min-w-0">
        <h1 class="text-2xl font-bold">{{ account?.name }}</h1>
        <p class="text-sm text-(--ui-text-muted)">
          {{ account?.owner?.name }} · {{ account?.institution?.name }} · {{ account?.type }}
          <span v-if="account?.currency === 'USD'" class="ml-1 text-amber-600">(USD)</span>
        </p>
      </div>
      <AccountsEditAccountModal
        v-if="account"
        :account="account"
        :owners="owners ?? []"
        :institutions="institutions ?? []"
        @updated="refresh()"
      />
      <UButton
        v-if="account"
        icon="i-heroicons-trash"
        variant="outline"
        color="error"
        size="sm"
        @click="showDeleteConfirm = true"
      >
        Delete
      </UButton>
    </div>

    <UModal v-model:open="showDeleteConfirm" title="Delete Account">
      <template #body>
        <p class="text-sm">
          Are you sure you want to delete <span class="font-semibold">{{ account?.name }}</span>?
          This will permanently remove the account along with all its holdings and cash balance.
          This action cannot be undone.
        </p>
      </template>
      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton variant="ghost" @click="showDeleteConfirm = false">Cancel</UButton>
          <UButton color="error" :loading="deleting" @click="deleteAccount">Delete Account</UButton>
        </div>
      </template>
    </UModal>

    <div v-if="pending" class="text-center py-12 text-(--ui-text-muted)">Loading…</div>

    <template v-else-if="account">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Holdings -->
        <div class="lg:col-span-2 space-y-4">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <h2 class="font-semibold">Holdings</h2>
            <div class="flex items-center gap-2">
              <UButton
                :loading="isRefreshing"
                icon="i-heroicons-arrow-path"
                variant="outline"
                size="sm"
                @click="handleRefresh"
              >
                Refresh Prices
              </UButton>
              <AccountsAddHoldingModal :account-id="account.id" @added="onHoldingAdded" />
            </div>
          </div>

          <UCard>
            <div v-if="!account.holdings?.length" class="text-center py-10 text-(--ui-text-muted) text-sm">
              No holdings yet. Add stocks or ETFs above.
            </div>
            <div v-else class="divide-y divide-(--ui-border)">
              <div
                v-for="h in account.holdings"
                :key="h.id"
                class="flex items-center justify-between py-3"
              >
                <div>
                  <p class="font-semibold">{{ h.symbol }}</p>
                  <p class="text-xs text-(--ui-text-muted)">{{ h.name || '—' }}</p>
                </div>
                <div class="text-right flex-1 mx-4">
                  <p class="text-sm">{{ h.shares }} shares</p>
                  <p v-if="h.cachedPrice" class="text-xs text-(--ui-text-muted)">
                    @ {{ formatPrice(h.cachedPrice.price, h.cachedPrice.currency) }}
                    = {{ formatPrice(h.shares * h.cachedPrice.price, h.cachedPrice.currency) }}
                  </p>
                  <p v-if="h.cachedPrice && h.cachedPrice.currency === 'USD'" class="text-xs text-emerald-600">
                    ≈ {{ formatPrice(h.shares * h.cachedPrice.price * usdToCad, 'CAD') }} CAD
                  </p>
                  <p v-else-if="!h.cachedPrice" class="text-xs text-amber-500">Price not fetched</p>
                  <p v-if="h.acb != null" class="text-xs text-(--ui-text-muted)">
                    Avg cost: {{ formatPrice(h.acb, h.currency || account.currency || 'CAD') }}
                    <span v-if="h.cachedPrice" :class="gainClass(h)">· {{ gainText(h) }}</span>
                  </p>
                </div>
                <div class="flex items-center gap-1">
                  <AccountsEditHoldingModal :holding="h" @updated="refresh()" />
                  <UButton
                    icon="i-heroicons-trash"
                    variant="ghost"
                    size="xs"
                    color="error"
                    @click="deleteHolding(h.id)"
                  />
                </div>
              </div>
            </div>
          </UCard>
        </div>

        <!-- Right panel -->
        <div class="space-y-4">
          <!-- Account Value Summary -->
          <UCard>
            <template #header><p class="font-semibold text-sm">Account Value</p></template>
            <p class="text-2xl font-bold">{{ formatPrice(accountValueCAD, 'CAD') }}</p>
            <p class="text-xs text-(--ui-text-muted) mt-1">Total in CAD (holdings + cash)</p>
            <div class="mt-3 pt-3 border-t border-(--ui-border) space-y-1.5 text-xs text-(--ui-text-muted)">
              <div class="flex items-center justify-between">
                <span>Holdings</span>
                <span class="font-medium">{{ formatPrice(holdingsValueCAD, 'CAD') }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span>Cash</span>
                <span class="font-medium">{{ formatPrice(cashValueCAD, 'CAD') }}</span>
              </div>
              <div class="flex items-center justify-between pt-1.5 border-t border-(--ui-border)">
                <span>USD → CAD rate</span>
                <span class="font-medium">{{ usdToCad.toFixed(4) }}</span>
              </div>
            </div>
          </UCard>

          <!-- Cash Balance -->
          <UCard>
            <template #header><p class="font-semibold text-sm">Cash Balance</p></template>
            <div class="space-y-3">
              <div>
                <label class="block text-xs text-(--ui-text-muted) mb-1">CAD Cash</label>
                <div class="flex items-center gap-2">
                  <UInput v-model="cashInput" type="number" step="0.01" placeholder="0.00" class="flex-1" />
                  <span class="text-sm text-(--ui-text-muted) w-10">CAD</span>
                </div>
              </div>
              <div>
                <label class="block text-xs text-(--ui-text-muted) mb-1">
                  USD Cash
                  <span v-if="Number(cashInputUsd) > 0" class="ml-1">
                    (≈ {{ formatPrice(Number(cashInputUsd) * usdToCad, 'CAD') }})
                  </span>
                </label>
                <div class="flex items-center gap-2">
                  <UInput v-model="cashInputUsd" type="number" step="0.01" placeholder="0.00" class="flex-1" />
                  <span class="text-sm text-(--ui-text-muted) w-10">USD</span>
                </div>
              </div>
            </div>
            <div class="mt-3 flex justify-end">
              <UButton size="sm" :loading="updatingCash" @click="saveCash">Save</UButton>
            </div>
          </UCard>

          <!-- Contribution Room (RRSP/TFSA only) -->
          <UCard v-if="account.type === 'RRSP' || account.type === 'TFSA'">
            <template #header><p class="font-semibold text-sm">Contribution Room</p></template>
            <div class="space-y-3">
              <div class="flex gap-2">
                <UInput v-model="roomInput" type="number" step="1" placeholder="e.g. 15000" class="flex-1" />
                <UButton size="sm" :loading="updatingRoom" @click="saveRoom">Set</UButton>
              </div>
              <AccountsContributionRoomBar
                v-if="account.contributionRoom"
                :account="{ contributionRoom: account.contributionRoom, totalCAD: accountValueCAD }"
              />
            </div>
          </UCard>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const id = Number(route.params.id)

const { data: account, pending, refresh } = await useFetch<any>(`/api/accounts/${id}`)
const { data: exchangeRate } = useFetch<any>('/api/exchange-rate')
const { data: owners } = await useFetch<any[]>('/api/owners')
const { data: institutions } = await useFetch<any[]>('/api/institutions')

const { isRefreshing, refreshPrices } = usePrices()

const cashInput = ref('')
const cashInputUsd = ref('')
const roomInput = ref('')
const updatingCash = ref(false)
const updatingRoom = ref(false)
const showDeleteConfirm = ref(false)
const deleting = ref(false)

async function deleteAccount() {
  deleting.value = true
  try {
    await $fetch(`/api/accounts/${id}`, { method: 'DELETE' })
    await navigateTo('/accounts')
  } finally {
    deleting.value = false
  }
}

watch(account, (val) => {
  if (!val) return
  cashInput.value = String(val.cashBalance?.amount ?? 0)
  cashInputUsd.value = String(val.cashBalance?.amountUsd ?? 0)
  roomInput.value = String(val.contributionRoom ?? '')
}, { immediate: true })

const usdToCad = computed(() => exchangeRate.value?.rate ?? 1.37)

const holdingsValueCAD = computed(() => {
  if (!account.value) return 0
  const rate = usdToCad.value
  return (account.value.holdings ?? []).reduce((sum: number, h: any) => {
    if (!h.cachedPrice) return sum
    const val = h.shares * h.cachedPrice.price
    return sum + (h.cachedPrice.currency === 'USD' ? val * rate : val)
  }, 0)
})

const cashValueCAD = computed(() => {
  if (!account.value) return 0
  const cad = account.value.cashBalance?.amount ?? 0
  const usd = account.value.cashBalance?.amountUsd ?? 0
  return cad + usd * usdToCad.value
})

const accountValueCAD = computed(() => holdingsValueCAD.value + cashValueCAD.value)

async function saveCash() {
  updatingCash.value = true
  try {
    await $fetch(`/api/accounts/${id}`, {
      method: 'PUT',
      body: {
        cashAmount: Number(cashInput.value) || 0,
        cashAmountUsd: Number(cashInputUsd.value) || 0
      }
    })
    await refresh()
  } finally { updatingCash.value = false }
}

async function saveRoom() {
  updatingRoom.value = true
  try {
    await $fetch(`/api/accounts/${id}`, {
      method: 'PUT',
      body: { contributionRoom: roomInput.value ? Number(roomInput.value) : null }
    })
    await refresh()
  } finally { updatingRoom.value = false }
}

async function deleteHolding(hId: number) {
  await $fetch(`/api/holdings/${hId}`, { method: 'DELETE' })
  await refresh()
}

async function handleRefresh() {
  await refreshPrices()
  await refresh()
}

async function onHoldingAdded() {
  // Auto-fetch the latest prices as soon as a holding is added
  await refreshPrices()
  await refresh()
}

function gain(h: any) {
  if (h.acb == null || !h.cachedPrice) return null
  const cost = h.acb * h.shares
  const value = h.cachedPrice.price * h.shares
  const abs = value - cost
  const pct = cost > 0 ? (abs / cost) * 100 : 0
  return { abs, pct, currency: h.cachedPrice.currency }
}

function gainText(h: any) {
  const g = gain(h)
  if (!g) return ''
  const sign = g.abs >= 0 ? '+' : ''
  return `${sign}${formatPrice(g.abs, g.currency)} (${sign}${g.pct.toFixed(2)}%)`
}

function gainClass(h: any) {
  const g = gain(h)
  if (!g) return ''
  return g.abs >= 0 ? 'text-green-500' : 'text-red-500'
}

function formatPrice(price: number, currency: string) {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency', currency, minimumFractionDigits: 2, maximumFractionDigits: 2
  }).format(price)
}
</script>
