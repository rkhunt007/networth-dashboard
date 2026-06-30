export default defineEventHandler(async (event) => {
  const id = parseInt(getRouterParam(event, 'id') ?? '0')
  if (!id) throw createError({ statusCode: 400, message: 'Invalid id' })

  const body = await readBody(event)

  return prisma.holding.update({
    where: { id },
    data: {
      shares: body.shares != null ? Number(body.shares) : undefined,
      acb: body.acb !== undefined ? (body.acb != null ? Number(body.acb) : null) : undefined
    }
  })
})
