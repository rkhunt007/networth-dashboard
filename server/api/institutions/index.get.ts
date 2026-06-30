export default defineEventHandler(() => {
  return prisma.institution.findMany({ orderBy: { name: 'asc' } })
})
