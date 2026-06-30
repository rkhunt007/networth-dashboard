export default defineEventHandler(async (event) => {
  const { password } = await readBody<{ password?: string }>(event)
  const appPassword = useRuntimeConfig().appPassword

  if (!appPassword) {
    throw createError({ statusCode: 500, message: 'Server password is not configured' })
  }
  if (!password || password !== appPassword) {
    throw createError({ statusCode: 401, message: 'Invalid password' })
  }

  await setUserSession(event, { user: { loggedIn: true } })
  return { ok: true }
})
