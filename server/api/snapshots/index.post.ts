export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (body?.totalCAD == null) {
    throw createError({ statusCode: 400, message: 'totalCAD is required' })
  }

  return prisma.netWorthSnapshot.create({
    data: {
      totalCAD: Number(body.totalCAD),
      dataJson: typeof body.dataJson === 'string' ? body.dataJson : JSON.stringify(body.dataJson ?? {})
    }
  })
})
