export type { OwnerNetWorth, AccountSummary, DebtSummary, ManualAssetSummary, NetWorthData } from '../../types/netWorth'
import type { OwnerNetWorth, AccountSummary, DebtSummary, ManualAssetSummary, NetWorthData } from '../../types/netWorth'

export async function calculateNetWorth(): Promise<NetWorthData> {
  const usdToCadRate = await getUsdToCad()
  const now = new Date().toISOString()

  const [owners, accounts, manualAssets, debts, cachedPrices] = await Promise.all([
    prisma.owner.findMany({ orderBy: { id: 'asc' } }),
    prisma.account.findMany({
      include: { owner: true, institution: true, holdings: true, cashBalance: true },
      orderBy: { createdAt: 'asc' }
    }),
    prisma.manualAsset.findMany({
      include: { owner: true },
      orderBy: { createdAt: 'asc' }
    }),
    prisma.debt.findMany({
      include: { owner: true },
      orderBy: { createdAt: 'asc' }
    }),
    prisma.cachedPrice.findMany()
  ])

  const priceMap = new Map(cachedPrices.map(p => [p.symbol, p]))
  const missingPrices: string[] = []

  // Initialize owner buckets
  const ownerMap = new Map<number, OwnerNetWorth>()
  for (const owner of owners) {
    ownerMap.set(owner.id, {
      ownerId: owner.id,
      ownerName: owner.name,
      ownerType: owner.type,
      totalAssetsCAD: 0,
      totalLiabilitiesCAD: 0,
      netWorthCAD: 0,
      byAccountType: {}
    })
  }

  const byAccountType: Record<string, number> = {}
  const accountSummaries: AccountSummary[] = []

  // Process investment accounts
  for (const account of accounts) {
    let holdingsValueCAD = 0

    for (const holding of account.holdings) {
      const cached = priceMap.get(holding.symbol)
      if (!cached) {
        if (!missingPrices.includes(holding.symbol)) missingPrices.push(holding.symbol)
        continue
      }
      const valueNative = holding.shares * cached.price
      const valueCAD = cached.currency === 'USD' ? valueNative * usdToCadRate : valueNative
      holdingsValueCAD += valueCAD
    }

    const cashCAD = (account.cashBalance?.amount ?? 0)
      + (account.cashBalance?.amountUsd ?? 0) * usdToCadRate
    const accountTotalCAD = holdingsValueCAD + cashCAD

    byAccountType[account.type] = (byAccountType[account.type] ?? 0) + accountTotalCAD

    const bucket = ownerMap.get(account.ownerId)
    if (bucket) {
      bucket.totalAssetsCAD += accountTotalCAD
      bucket.byAccountType[account.type] = (bucket.byAccountType[account.type] ?? 0) + accountTotalCAD
    }

    accountSummaries.push({
      id: account.id,
      name: account.name,
      type: account.type,
      currency: account.currency,
      ownerName: account.owner.name,
      ownerType: account.owner.type,
      institutionName: account.institution.name,
      institutionColor: account.institution.color,
      totalCAD: accountTotalCAD,
      holdingsValueCAD,
      cashValueCAD: cashCAD,
      contributionRoom: account.contributionRoom
    })
  }

  // Process manual assets
  const manualAssetSummaries: ManualAssetSummary[] = []
  for (const asset of manualAssets) {
    const valueCAD = asset.currency === 'USD' ? asset.value * usdToCadRate : asset.value

    byAccountType['MANUAL_ASSETS'] = (byAccountType['MANUAL_ASSETS'] ?? 0) + valueCAD

    const bucket = ownerMap.get(asset.ownerId)
    if (bucket) {
      bucket.totalAssetsCAD += valueCAD
      bucket.byAccountType['MANUAL_ASSETS'] = (bucket.byAccountType['MANUAL_ASSETS'] ?? 0) + valueCAD
    }

    manualAssetSummaries.push({
      id: asset.id,
      name: asset.name,
      type: asset.type,
      ownerName: asset.owner.name,
      ownerType: asset.owner.type,
      valueCAD,
      originalValue: asset.value,
      currency: asset.currency
    })
  }

  const totalAssetsCAD = Array.from(ownerMap.values()).reduce((s, o) => s + o.totalAssetsCAD, 0)

  // Process debts
  const debtSummaries: DebtSummary[] = []
  const byDebtType: Record<string, number> = {}
  for (const debt of debts) {
    const balanceCAD = debt.currency === 'USD' ? debt.balance * usdToCadRate : debt.balance

    byDebtType[debt.type] = (byDebtType[debt.type] ?? 0) + balanceCAD

    const bucket = ownerMap.get(debt.ownerId)
    if (bucket) bucket.totalLiabilitiesCAD += balanceCAD

    debtSummaries.push({
      id: debt.id,
      name: debt.name,
      type: debt.type,
      ownerName: debt.owner.name,
      ownerType: debt.owner.type,
      balanceCAD,
      originalBalance: debt.balance,
      currency: debt.currency,
      interestRate: debt.interestRate
    })
  }

  const totalLiabilitiesCAD = Array.from(ownerMap.values()).reduce((s, o) => s + o.totalLiabilitiesCAD, 0)

  const byOwner = Array.from(ownerMap.values()).map(o => ({
    ...o,
    netWorthCAD: o.totalAssetsCAD - o.totalLiabilitiesCAD
  }))

  return {
    totalAssetsCAD,
    totalLiabilitiesCAD,
    netWorthCAD: totalAssetsCAD - totalLiabilitiesCAD,
    usdToCadRate,
    byOwner,
    byAccountType,
    byDebtType,
    accounts: accountSummaries,
    debts: debtSummaries,
    manualAssets: manualAssetSummaries,
    missingPrices,
    lastCalculated: now
  }
}
