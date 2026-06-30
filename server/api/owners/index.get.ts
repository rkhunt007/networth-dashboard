export default defineEventHandler(() => {
  return prisma.owner.findMany({ orderBy: { createdAt: 'asc' } })
})
