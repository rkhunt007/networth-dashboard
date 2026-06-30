export default defineEventHandler(() => {
  return prisma.debt.findMany({
    include: { owner: true },
    orderBy: { createdAt: 'asc' }
  })
})
