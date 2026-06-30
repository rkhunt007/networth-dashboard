const VALID_TYPES = ['RRSP', 'TFSA', 'RESP', 'NON_REG', 'CASH', 'CRYPTO']

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!body?.name || !body?.type || !body?.ownerId || !body?.institutionId) {
    throw createError({ statusCode: 400, message: 'name, type, ownerId, institutionId are required' })
  }
  if (!VALID_TYPES.includes(body.type)) {
    throw createError({ statusCode: 400, message: 'Invalid account type' })
  }

  return prisma.account.create({
    data: {
      name: String(body.name).trim(),
      type: body.type,
      currency: 'CAD',
      contributionRoom: body.contributionRoom != null ? Number(body.contributionRoom) : null,
      ownerId: Number(body.ownerId),
      institutionId: Number(body.institutionId)
    },
    include: { owner: true, institution: true, holdings: true, cashBalance: true }
  })
})
