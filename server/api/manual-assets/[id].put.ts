export default defineEventHandler(async (event) => {
  const id = parseInt(getRouterParam(event, 'id') ?? '0')
  if (!id) throw createError({ statusCode: 400, message: 'Invalid id' })

  const body = await readBody(event)

  return prisma.manualAsset.update({
    where: { id },
    data: {
      name: body.name ? String(body.name).trim() : undefined,
      type: body.type ?? undefined,
      value: body.value != null ? Number(body.value) : undefined,
      currency: body.currency ?? undefined,
      ownerId: body.ownerId ? Number(body.ownerId) : undefined
    },
    include: { owner: true }
  })
})
