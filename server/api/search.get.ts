export default defineEventHandler(async (event) => {
  const q = String(getQuery(event).q ?? '').trim()
  if (!q) return []

  try {
    const results = await yf.search(q, {}, { validateResult: false })

    return (results.quotes ?? [])
      .filter(r => r.quoteType === 'EQUITY' || r.quoteType === 'ETF' || r.quoteType === 'MUTUALFUND')
      .slice(0, 10)
      .map(r => ({
        symbol: r.symbol ?? '',
        name: (r as any).shortname ?? (r as any).longname ?? '',
        exchange: (r as any).exchange ?? '',
        type: r.quoteType ?? ''
      }))
  } catch {
    return []
  }
})
