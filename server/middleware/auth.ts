// Protects all /api/** routes except the auth endpoints and Nuxt internals.
export default defineEventHandler(async (event) => {
  const path = event.path || ''

  if (!path.startsWith('/api/')) return
  if (path.startsWith('/api/auth/')) return
  if (path.startsWith('/api/_')) return

  const session = await getUserSession(event)
  if (!session?.user) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }
})
