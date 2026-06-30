// Shared type definitions — importable by both server utils and client composables/components

export interface OwnerNetWorth {
  ownerId: number
  ownerName: string
  ownerType: string
  totalAssetsCAD: number
  totalLiabilitiesCAD: number
  netWorthCAD: number
  byAccountType: Record<string, number>
}

export interface AccountSummary {
  id: number
  name: string
  type: string
  currency: string
  ownerName: string
  ownerType: string
  institutionName: string
  institutionColor: string
  totalCAD: number
  holdingsValueCAD: number
  cashValueCAD: number
  contributionRoom: number | null
}

export interface DebtSummary {
  id: number
  name: string
  type: string
  ownerName: string
  ownerType: string
  balanceCAD: number
  originalBalance: number
  currency: string
  interestRate: number | null
}

export interface ManualAssetSummary {
  id: number
  name: string
  type: string
  ownerName: string
  ownerType: string
  valueCAD: number
  originalValue: number
  currency: string
}

export interface NetWorthData {
  totalAssetsCAD: number
  totalLiabilitiesCAD: number
  netWorthCAD: number
  usdToCadRate: number
  byOwner: OwnerNetWorth[]
  byAccountType: Record<string, number>
  byDebtType: Record<string, number>
  accounts: AccountSummary[]
  debts: DebtSummary[]
  manualAssets: ManualAssetSummary[]
  missingPrices: string[]
  lastCalculated: string
}
