export default defineEventHandler(async () => {
  const rate = await getUsdToCad()
  const cached = await prisma.exchangeRate.findFirst({ where: { pair: 'USD_CAD' } })

  return {
    rate,
    pair: 'USD_CAD',
    updatedAt: cached?.updatedAt ?? null
  }
})
