export default defineEventHandler(async (event) => {
  const id = parseInt(getRouterParam(event, 'id') ?? '0')
  if (!id) throw createError({ statusCode: 400, message: 'Invalid id' })

  return prisma.institution.delete({ where: { id } })
})
