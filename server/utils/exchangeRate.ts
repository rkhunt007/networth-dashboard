export async function getUsdToCad(): Promise<number> {
  const now = new Date()
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

  const cached = await prisma.exchangeRate.findFirst({
    where: { pair: 'USD_CAD' }
  })

  if (cached && cached.updatedAt > twentyFourHoursAgo) {
    return cached.rate
  }

  // Primary source: Yahoo Finance (no API key required, already used for stock quotes)
  try {
    const quote = await yf.quote('USDCAD=X')
    const rate = (quote as any)?.regularMarketPrice
    if (typeof rate === 'number' && rate > 0) {
      await prisma.exchangeRate.upsert({
        where: { pair: 'USD_CAD' },
        create: { pair: 'USD_CAD', rate },
        update: { rate }
      })
      return rate
    }
  } catch {
    // Fall through to the optional keyed API / cached value
  }

  // Optional override: exchangerate-api.com (only if a key is configured)
  const apiKey = process.env.EXCHANGE_RATE_API_KEY
  if (apiKey) {
    try {
      const response = await fetch(
        `https://v6.exchangerate-api.com/v6/${apiKey}/pair/USD/CAD`
      )
      if (!response.ok) throw new Error(`HTTP ${response.status}`)

      const data = await response.json() as { result: string; conversion_rate: number }
      if (data.result !== 'success') throw new Error('API error')

      const rate = data.conversion_rate

      await prisma.exchangeRate.upsert({
        where: { pair: 'USD_CAD' },
        create: { pair: 'USD_CAD', rate },
        update: { rate }
      })

      return rate
    } catch {
      // Fall through to cached/fallback
    }
  }

  if (cached) return cached.rate
  return 1.37 // Last-resort fallback
}
