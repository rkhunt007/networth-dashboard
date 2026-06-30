// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ['@nuxt/ui', 'nuxt-auth-utils'],
  css: ['~/assets/css/main.css'],
  compatibilityDate: '2025-01-01',
  srcDir: '.',  // keep pages/components/etc at root (Nuxt 3-style layout)
  runtimeConfig: {
    appPassword: process.env.APP_PASSWORD || '',
  },
  vite: {
    optimizeDeps: {
      exclude: ['@prisma/client']
    }
  }
})
