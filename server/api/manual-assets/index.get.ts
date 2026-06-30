export default defineEventHandler(() => {
  return prisma.manualAsset.findMany({
    include: { owner: true },
    orderBy: { createdAt: 'asc' }
  })
})
