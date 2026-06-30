export default defineEventHandler(async (event) => {
  const id = parseInt(getRouterParam(event, 'id') ?? '0')
  if (!id) throw createError({ statusCode: 400, message: 'Invalid id' })

  const body = await readBody(event)

  return prisma.debt.update({
    where: { id },
    data: {
      name: body.name ? String(body.name).trim() : undefined,
      type: body.type ?? undefined,
      balance: body.balance != null ? Number(body.balance) : undefined,
      currency: body.currency ?? undefined,
      interestRate: body.interestRate !== undefined
        ? (body.interestRate != null ? Number(body.interestRate) : null)
        : undefined,
      ownerId: body.ownerId ? Number(body.ownerId) : undefined
    },
    include: { owner: true }
  })
})
