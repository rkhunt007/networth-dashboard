import type { NetWorthData } from '~/types/netWorth'

export const useNetWorth = () => {
  return useFetch<NetWorthData>('/api/net-worth', { watch: false })
}
