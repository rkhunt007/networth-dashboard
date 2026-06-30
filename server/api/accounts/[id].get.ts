export default defineEventHandler(async (event) => {
  const id = parseInt(getRouterParam(event, 'id') ?? '0')
  if (!id) throw createError({ statusCode: 400, message: 'Invalid id' })

  const account = await prisma.account.findUnique({
    where: { id },
    include: { owner: true, institution: true, holdings: true, cashBalance: true }
  })
  if (!account) throw createError({ statusCode: 404, message: 'Account not found' })

  // Enrich holdings with cached prices
  const symbols = account.holdings.map(h => h.symbol)
  const prices = symbols.length
    ? await prisma.cachedPrice.findMany({ where: { symbol: { in: symbols } } })
    : []
  const priceMap = new Map(prices.map(p => [p.symbol, p]))

  return {
    ...account,
    holdings: account.holdings.map(h => ({
      ...h,
      cachedPrice: priceMap.get(h.symbol) ?? null
    }))
  }
})
