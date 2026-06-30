export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const validTypes = ['SELF', 'SPOUSE', 'JOINT']

  if (!body?.name || !body?.type) {
    throw createError({ statusCode: 400, message: 'name and type are required' })
  }
  if (!validTypes.includes(body.type)) {
    throw createError({ statusCode: 400, message: 'type must be SELF, SPOUSE, or JOINT' })
  }

  return prisma.owner.create({
    data: { name: String(body.name).trim(), type: body.type }
  })
})
