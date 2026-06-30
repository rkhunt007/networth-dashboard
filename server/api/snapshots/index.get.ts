export default defineEventHandler(() => {
  return prisma.netWorthSnapshot.findMany({ orderBy: { date: 'asc' } })
})
