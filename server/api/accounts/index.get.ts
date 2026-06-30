export default defineEventHandler(() => {
  return prisma.account.findMany({
    include: { owner: true, institution: true, holdings: true, cashBalance: true },
    orderBy: { createdAt: 'asc' }
  })
})
