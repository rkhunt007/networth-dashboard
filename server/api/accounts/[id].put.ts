const VALID_TYPES = ['RRSP', 'TFSA', 'RESP', 'NON_REG', 'CASH', 'CRYPTO']

export default defineEventHandler(async (event) => {
  const id = parseInt(getRouterParam(event, 'id') ?? '0')
  if (!id) throw createError({ statusCode: 400, message: 'Invalid id' })

  const body = await readBody(event)

  if ('cashAmount' in body || 'cashAmountUsd' in body) {
    const data: { amount?: number; amountUsd?: number } = {}
    if ('cashAmount' in body) data.amount = Number(body.cashAmount) || 0
    if ('cashAmountUsd' in body) data.amountUsd = Number(body.cashAmountUsd) || 0
    await prisma.cashBalance.upsert({
      where: { accountId: id },
      create: { accountId: id, amount: data.amount ?? 0, amountUsd: data.amountUsd ?? 0 },
      update: data
    })
  }

  if ('contributionRoom' in body) {
    const contributionRoom = body.contributionRoom != null && body.contributionRoom !== ''
      ? Number(body.contributionRoom)
      : null
    await prisma.account.update({ where: { id }, data: { contributionRoom } })
  }

  // Edit core account details
  if ('name' in body || 'type' in body || 'ownerId' in body || 'institutionId' in body) {
    const data: Record<string, any> = {}

    if (body.name != null) data.name = String(body.name).trim()
    if (body.type != null) {
      if (!VALID_TYPES.includes(body.type)) {
        throw createError({ statusCode: 400, message: 'Invalid account type' })
      }
      data.type = body.type
    }
    if (body.ownerId != null) data.ownerId = Number(body.ownerId)
    if (body.institutionId != null) data.institutionId = Number(body.institutionId)

    await prisma.account.update({ where: { id }, data })
  }

  return prisma.account.findUnique({
    where: { id },
    include: { owner: true, institution: true, holdings: true, cashBalance: true }
  })
})
