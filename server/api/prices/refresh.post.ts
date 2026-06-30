export default defineEventHandler(async () => {
  const holdings = await prisma.holding.findMany({ select: { symbol: true } })
  const symbols = [...new Set(holdings.map(h => h.symbol))]

  if (!symbols.length) {
    return { refreshed: 0, total: 0, timestamp: new Date().toISOString() }
  }

  const quotes = await yf.quote(symbols)
  const quotesArray = Array.isArray(quotes) ? quotes : [quotes]

  let refreshed = 0
  for (const quote of quotesArray) {
    if (!quote?.symbol || quote.regularMarketPrice == null) continue

    try {
      await prisma.cachedPrice.upsert({
        where: { symbol: quote.symbol },
        create: {
          symbol: quote.symbol,
          price: quote.regularMarketPrice,
          currency: quote.currency ?? 'CAD'
        },
        update: {
          price: quote.regularMarketPrice,
          currency: quote.currency ?? 'CAD'
        }
      })

      // Back-fill holding name + currency if missing
      const holdingName = (quote as any).shortName ?? (quote as any).longName ?? ''
      if (holdingName) {
        await prisma.holding.updateMany({
          where: { symbol: quote.symbol, name: '' },
          data: { name: holdingName, currency: quote.currency ?? 'CAD' }
        })
      }

      refreshed++
    } catch {
      // Skip individual failures — log nothing to avoid leaking data
    }
  }

  return { refreshed, total: symbols.length, timestamp: new Date().toISOString() }
})
