const VALID_TYPES = ['MORTGAGE', 'CAR_LOAN', 'STUDENT_LOAN', 'CREDIT_CARD', 'LOC', 'HELOC', 'OTHER']

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!body?.name || !body?.type || body?.balance == null || !body?.ownerId) {
    throw createError({ statusCode: 400, message: 'name, type, balance, ownerId are required' })
  }
  if (!VALID_TYPES.includes(body.type)) {
    throw createError({ statusCode: 400, message: 'Invalid debt type' })
  }

  return prisma.debt.create({
    data: {
      name: String(body.name).trim(),
      type: body.type,
      balance: Number(body.balance),
      currency: body.currency === 'USD' ? 'USD' : 'CAD',
      interestRate: body.interestRate != null ? Number(body.interestRate) : null,
      ownerId: Number(body.ownerId)
    },
    include: { owner: true }
  })
})
