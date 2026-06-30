export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!body?.symbol || body?.shares == null || !body?.accountId) {
    throw createError({ statusCode: 400, message: 'symbol, shares, accountId are required' })
  }

  const symbol = String(body.symbol).trim().toUpperCase()

  // Infer currency from cache or symbol suffix
  const cached = await prisma.cachedPrice.findFirst({ where: { symbol } })
  const currency = cached?.currency ?? (symbol.endsWith('.TO') || symbol.endsWith('.V') ? 'CAD' : 'USD')

  return prisma.holding.create({
    data: {
      symbol,
      name: body.name ? String(body.name).trim() : '',
      shares: Number(body.shares),
      acb: body.acb != null ? Number(body.acb) : null,
      currency,
      accountId: Number(body.accountId)
    }
  })
})
