export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!body?.name) {
    throw createError({ statusCode: 400, message: 'name is required' })
  }

  return prisma.institution.create({
    data: {
      name: String(body.name).trim(),
      color: body.color ?? '#3B82F6'
    }
  })
})
