const VALID_TYPES = ['HOME', 'VEHICLE', 'PENSION', 'INVESTMENT_PROPERTY', 'OTHER']

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!body?.name || !body?.type || body?.value == null || !body?.ownerId) {
    throw createError({ statusCode: 400, message: 'name, type, value, ownerId are required' })
  }
  if (!VALID_TYPES.includes(body.type)) {
    throw createError({ statusCode: 400, message: 'Invalid asset type' })
  }

  return prisma.manualAsset.create({
    data: {
      name: String(body.name).trim(),
      type: body.type,
      value: Number(body.value),
      currency: body.currency === 'USD' ? 'USD' : 'CAD',
      ownerId: Number(body.ownerId)
    },
    include: { owner: true }
  })
})
